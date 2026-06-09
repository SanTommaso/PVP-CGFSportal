import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// dotenv opzionale: carica .env se presente (utile in sviluppo)
try {
  const { config } = await import("dotenv");
  config();
} catch {
  // dotenv non installato: le variabili devono essere settate nell'ambiente
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";

if (!JWT_SECRET) {
  console.error("Errore: JWT_SECRET non è impostato nelle variabili d'ambiente.");
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());

// --- Middleware di autenticazione ---

function requireAuth(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Non autenticato" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.clearCookie("auth_token");
    res.status(401).json({ error: "Token non valido o scaduto" });
  }
}

// --- Rotte API ---

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username e password sono obbligatori" });
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { username } });
  } catch {
    return res.status(500).json({ error: "Errore interno del server" });
  }

  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) {
    // Risposta generica per non rivelare se l'utente esiste
    return res.status(401).json({ error: "Credenziali non valide" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000, // 8 ore in ms
  });

  res.json({ username: user.username });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token", { httpOnly: true, sameSite: "strict" });
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

// --- Serving della React app ---
// Tutte le altre rotte servono i file statici dalla build di Vite (dist/)
// o ritornano index.html per permettere al router client-side di funzionare.

app.use(express.static(join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// --- Avvio ---

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server avviato su http://127.0.0.1:${PORT} (NODE_ENV=${process.env.NODE_ENV ?? "development"})`);
});
