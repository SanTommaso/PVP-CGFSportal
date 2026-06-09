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

// --- Route API dati ---

function parseJson(value, fallback = []) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function exerciseOut(ex) {
  return { ...ex, ageGroups: parseJson(ex.ageGroups) };
}

function surveyOut(s) {
  return { ...s, questions: parseJson(s.questions) };
}

// Bootstrap (aree, stagioni, livelli, club)
app.get("/api/bootstrap", requireAuth, async (req, res) => {
  try {
    const [areas, seasons, levels, clubs] = await Promise.all([
      prisma.area.findMany(),
      prisma.season.findMany({ orderBy: { name: "desc" } }),
      prisma.level.findMany({ orderBy: { name: "asc" } }),
      prisma.club.findMany({ orderBy: { name: "asc" } }),
    ]);
    res.json({ areas, seasons, levels, clubs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero del bootstrap" });
  }
});

// Esercizi
app.get("/api/exercises", requireAuth, async (req, res) => {
  try {
    const { areaId, query = "" } = req.query;
    const normalized = query.trim().toLowerCase();
    const all = await prisma.exercise.findMany({ orderBy: { createdAt: "desc" } });
    const result = all.filter((ex) => {
      const matchesArea = !areaId || ex.areaId === "shared" || ex.areaId === areaId;
      const haystack = `${ex.title} ${ex.category} ${ex.objective} ${ex.description} ${ex.typology || ""} ${ex.subtype || ""} ${ex.regime || ""}`.toLowerCase();
      return matchesArea && (!normalized || haystack.includes(normalized));
    });
    res.json(result.map(exerciseOut));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero degli esercizi" });
  }
});

app.post("/api/exercises", requireAuth, async (req, res) => {
  try {
    const p = req.body ?? {};
    const exercise = await prisma.exercise.create({
      data: {
        id: `exercise-${Date.now()}`,
        areaId: p.areaId || "shared",
        levelId: p.levelId || null,
        title: String(p.title ?? "").trim(),
        category: p.category || null,
        objective: p.objective || null,
        description: p.description || null,
        players: p.players || null,
        duration: p.duration || null,
        exerciseType: p.exerciseType || null,
        durationSeconds: p.durationSeconds ? Number(p.durationSeconds) : null,
        ageGroups: Array.isArray(p.ageGroups) ? JSON.stringify(p.ageGroups) : null,
        typology: p.typology || null,
        subtype: p.subtype || null,
        regime: p.regime || null,
        regimeSubtype: p.regimeSubtype || null,
        youtubeUrl: p.youtubeUrl || null,
        youtubeUrl2: p.youtubeUrl2 || null,
        imageUrl: p.imageUrl || null,
        imageUrl2: p.imageUrl2 || null,
      },
    });
    res.json(exerciseOut(exercise));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella creazione dell'esercizio" });
  }
});

// Profili coach (usati nel selettore PVP)
app.get("/api/coach-profiles", requireAuth, async (req, res) => {
  try {
    const { areaId = "pvp" } = req.query;
    if (areaId !== "pvp") return res.json([]);
    const profiles = await prisma.coachProfile.findMany({
      where: { areaId: "pvp", active: true },
      orderBy: { fullName: "asc" },
    });
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei profili" });
  }
});

// Dashboard PVP
app.get("/api/pvp/dashboard", requireAuth, async (req, res) => {
  try {
    const { coachProfileId, seasonId = "2025-2026" } = req.query;
    if (!coachProfileId) return res.status(400).json({ error: "coachProfileId richiesto" });

    const isAdmin = coachProfileId === "coach-admin";

    const [coach, allTeams, workouts, matchesList, surveys, staff, exercises, clubs, levels, roster] =
      await Promise.all([
        prisma.coachProfile.findUnique({ where: { id: coachProfileId } }),
        prisma.team.findMany({ where: { areaId: "pvp", seasonId } }),
        prisma.workout.findMany({ where: { areaId: "pvp", seasonId } }),
        prisma.match.findMany({ where: { areaId: "pvp", seasonId } }),
        prisma.survey.findMany({ where: { areaId: "pvp" } }),
        prisma.coachProfile.findMany({ where: { areaId: "pvp", active: true } }),
        prisma.exercise.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.club.findMany({ where: { areaId: "pvp" } }),
        prisma.level.findMany({ where: { areaId: "pvp" } }),
        prisma.athleteProfile.findMany({ where: { areaId: "pvp", active: true } }),
      ]);

    let ownTeamIds;
    if (isAdmin) {
      ownTeamIds = allTeams.map((t) => t.id);
    } else {
      const assignments = await prisma.coachTeamAssignment.findMany({
        where: { coachId: coachProfileId, seasonId },
      });
      ownTeamIds = assignments.map((a) => a.teamId);
    }

    res.json({
      coach,
      ownTeamIds,
      teams: allTeams,
      roster,
      workouts,
      matches: matchesList,
      surveys: surveys.map(surveyOut),
      staff,
      exercises: exercises.map(exerciseOut),
      clubs,
      levels,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero della dashboard" });
  }
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
