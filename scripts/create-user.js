/**
 * Crea un nuovo utente nel database.
 * Uso: node scripts/create-user.js
 */
import { config } from "dotenv";
config(); // carica .env prima di istanziare PrismaClient

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "readline";

const prisma = new PrismaClient();
const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

const username = (await ask("Username: ")).trim();
if (!username) {
  console.error("Username non può essere vuoto.");
  process.exit(1);
}

const password = (await ask("Password: ")).trim();
if (password.length < 8) {
  console.error("La password deve essere di almeno 8 caratteri.");
  process.exit(1);
}

rl.close();

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { username, passwordHash } });
  console.log(`Utente "${username}" creato con successo.`);
} catch (err) {
  if (err.code === "P2002") {
    console.error(`Errore: esiste già un utente con username "${username}".`);
  } else {
    console.error("Errore durante la creazione dell'utente:", err.message);
  }
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
