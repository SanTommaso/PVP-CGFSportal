import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
config();

const prisma = new PrismaClient();

// Dati seed — corrispondono alla versione mock ma con tutti i campi reali
const areas = [
  { id: "shared", name: "Shared", subtitle: "Condiviso", description: "Contenuti condivisi tra tutte le aree." },
  { id: "cgfs",   name: "CGFS",   subtitle: "Centro di Formazione e Sviluppo", description: "Percorso formativo, corsi, Volley S3, crescita motoria e competenze." },
  { id: "pvp",    name: "PVP",    subtitle: "Prato Volley Project",            description: "Societa, squadre, staff tecnico, calendari e attivita agonistica." },
];

const seasons = [{ id: "2025-2026", name: "2025/2026", active: true }];

const levels = [
  { id: "s3-white", areaId: "cgfs", name: "Volley S3 White",     ageRange: "5/6/7 anni" },
  { id: "s3-green", areaId: "cgfs", name: "Volley S3 Green",     ageRange: "8/9/10 anni" },
  { id: "s3-red",   areaId: "cgfs", name: "Volley S3 Red / U12", ageRange: "11/12 anni" },
  { id: "u13",      areaId: "pvp",  name: "U13",  ageRange: "Under 13" },
  { id: "u14",      areaId: "pvp",  name: "U14",  ageRange: "Under 14" },
  { id: "u16",      areaId: "pvp",  name: "U16",  ageRange: "Under 16" },
  { id: "u18",      areaId: "pvp",  name: "U18",  ageRange: "Under 18" },
  { id: "b2",       areaId: "pvp",  name: "B2",   ageRange: "Serie B2" },
];

const clubs = [
  "Ariete", "Viva Volley", "29 Martiri", "Volley Viaccia", "CDP Volley Vaiano", "Volley Prato",
].map((name, i) => ({ id: `club-${i + 1}`, areaId: "pvp", name }));

// Staff tecnico selezionabile nel selettore PVP
const staffProfiles = [
  { id: "coach-admin", areaId: "pvp", fullName: "Coach",         role: "Coach amministratore", phone: "",            teamId: "",       locked: true  },
  { id: "staff-1",     areaId: "pvp", fullName: "Marco Bianchi", role: "Allenatore U16",       phone: "333 000 111", teamId: "team-1", locked: false },
  { id: "staff-2",     areaId: "pvp", fullName: "Elisa Rosi",    role: "Allenatrice U18",      phone: "333 000 222", teamId: "team-3", locked: false },
];

const coachProfiles = [
  { id: "coach-1", areaId: "pvp", fullName: "Lorenzo Castelli", email: "lorenzo@pvp.local", active: true },
  { id: "coach-2", areaId: "pvp", fullName: "Martina Secchi",   email: "martina@pvp.local",  active: true },
  { id: "coach-3", areaId: "pvp", fullName: "Andrea Giusti",    email: "andrea@pvp.local",   active: true },
  { id: "coach-4", areaId: "pvp", fullName: "Francesco Dori",   email: "francesco@pvp.local",active: true },
];

const teams = [
  { id: "team-1", areaId: "pvp", seasonId: "2025-2026", clubId: "club-1", levelId: "u16", name: "U16 F Ariete",          court: "Palestra A" },
  { id: "team-2", areaId: "pvp", seasonId: "2025-2026", clubId: "club-2", levelId: "u14", name: "U14 M Viva",            court: "Palestra B" },
  { id: "team-3", areaId: "pvp", seasonId: "2025-2026", clubId: "club-6", levelId: "u18", name: "U18 M Volley Prato",    court: "Palestra A" },
  { id: "team-4", areaId: "pvp", seasonId: "2025-2026", clubId: "club-3", levelId: "u13", name: "U13 F 29 Martiri",      court: "Palestra C" },
];

const coachTeamAssignments = [
  { coachId: "coach-1", teamId: "team-1", seasonId: "2025-2026" },
  { coachId: "coach-1", teamId: "team-2", seasonId: "2025-2026" },
  { coachId: "coach-2", teamId: "team-1", seasonId: "2025-2026" },
  { coachId: "coach-2", teamId: "team-3", seasonId: "2025-2026" },
  { coachId: "coach-3", teamId: "team-2", seasonId: "2025-2026" },
  { coachId: "coach-4", teamId: "team-4", seasonId: "2025-2026" },
  // staff tecnico
  { coachId: "staff-1", teamId: "team-1", seasonId: "2025-2026" },
  { coachId: "staff-2", teamId: "team-3", seasonId: "2025-2026" },
];

const athleteProfiles = [
  { id: "athlete-1", areaId: "pvp", fullName: "Giulia Neri",    teamId: "team-1", levelId: "u16", role: "Schiacciatrice" },
  { id: "athlete-2", areaId: "pvp", fullName: "Sara Bianchi",   teamId: "team-1", levelId: "u16", role: "Palleggiatrice" },
  { id: "athlete-3", areaId: "pvp", fullName: "Emma Conti",     teamId: "team-3", levelId: "u18", role: "Centrale" },
  { id: "athlete-4", areaId: "pvp", fullName: "Tommaso Ricci",  teamId: "team-2", levelId: "u14", role: "Opposto" },
  { id: "athlete-5", areaId: "pvp", fullName: "Viola Gori",     teamId: "team-4", levelId: "u13", role: "Libero" },
];

const exercises = [
  {
    id: "exercise-1", areaId: "shared", levelId: "s3-white",
    title: "Staffetta coordinativa con palla", category: "Didattica", objective: "spostamenti",
    exerciseType: "Base", durationSeconds: 720, ageGroups: JSON.stringify(["8 anni","9 anni","10 anni"]),
    typology: "Didattica", subtype: "spostamenti", regime: "Metabolico", regimeSubtype: "Agilita",
    description: "Percorso semplice con conduzione della palla, cambio direzione e cooperazione a coppie.",
    players: "8-14 allievi", duration: "12 min",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "exercise-2", areaId: "shared", levelId: "s3-green",
    title: "Bagher guidato in movimento", category: "Tecnica", objective: "bagher ricezione",
    exerciseType: "Base", durationSeconds: 900, ageGroups: JSON.stringify(["10 anni","11 anni","12 anni"]),
    typology: "Tecnica", subtype: "bagher ricezione", regime: "Metabolico", regimeSubtype: "Rapidita",
    description: "Sequenza a stazioni per leggere la traiettoria e orientare il piano di rimbalzo.",
    players: "6-10 allievi", duration: "15 min",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
  },
  {
    id: "exercise-3", areaId: "shared", levelId: "s3-red",
    title: "Mini partita con obiettivo cooperativo", category: "Globale", objective: "palleggio ricezione",
    exerciseType: "Variante", durationSeconds: 1080, ageGroups: JSON.stringify(["11 anni","12 anni","13 anni"]),
    typology: "Globale", subtype: "palleggio ricezione", regime: "Metabolico", regimeSubtype: "Agilita",
    description: "Punti bonus quando la squadra completa tre passaggi prima della conclusione.",
    players: "8 allievi", duration: "18 min", youtubeUrl: "",
  },
  {
    id: "exercise-4", areaId: "shared", levelId: "u16",
    title: "Rondoschiacciata 4 vs 4 + P", category: "Tattica", objective: "schiacciata",
    exerciseType: "Variante", durationSeconds: 1200, ageGroups: JSON.stringify(["15 anni","16 anni","17 anni"]),
    typology: "Tattica", subtype: "schiacciata", regime: "Anabolico", regimeSubtype: "Forza Esplosiva",
    description: "Esercizio per migliorare fase di attacco e copertura in equilibrio numerico.",
    players: "9 atlete", duration: "20 min",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

const workouts = [
  { id: "workout-1", areaId: "pvp", seasonId: "2025-2026", teamId: "team-1", title: "Tecnica ricezione + cambio palla", day: "Lun 19", time: "17:00 - 18:30", status: "programmato" },
  { id: "workout-2", areaId: "pvp", seasonId: "2025-2026", teamId: "team-2", title: "Difesa e contrattacco",             day: "Mar 20", time: "17:00 - 18:30", status: "programmato" },
  { id: "workout-3", areaId: "pvp", seasonId: "2025-2026", teamId: "team-3", title: "Lavoro per reparti",                day: "Mer 21", time: "19:00 - 20:30", status: "programmato" },
  { id: "workout-4", areaId: "pvp", seasonId: "2025-2026", teamId: "team-1", title: "Partita a tema",                    day: "Ven 23", time: "20:00 - 21:30", status: "bozza" },
  { id: "workout-5", areaId: "pvp", seasonId: "2025-2026", teamId: "team-4", title: "S3 avanzato e letture",             day: "Sab 24", time: "10:00 - 11:30", status: "programmato" },
];

const matches = [
  { id: "match-1", areaId: "pvp", seasonId: "2025-2026", teamId: "team-1", opponent: "Volley Empoli",  date: "25 maggio", result: "Da disputare" },
  { id: "match-2", areaId: "pvp", seasonId: "2025-2026", teamId: "team-3", opponent: "Firenze Volley", date: "26 maggio", result: "3-1" },
];

const surveys = [
  {
    id: "survey-1", areaId: "pvp", title: "Benessere pre-allenamento",
    status: "aperto", responses: 24,
    questions: JSON.stringify([{ text: "Come ti senti oggi?", type: "Scala lineare" }]),
  },
  {
    id: "survey-2", areaId: "pvp", title: "Autovalutazione tecnica",
    status: "chiuso", responses: 18,
    questions: JSON.stringify([{ text: "Quale fondamentale vuoi migliorare?", type: "Scelta multipla" }]),
  },
];

async function main() {
  for (const area of areas) {
    await prisma.area.upsert({ where: { id: area.id }, update: area, create: area });
  }
  for (const season of seasons) {
    await prisma.season.upsert({ where: { id: season.id }, update: season, create: season });
  }
  for (const level of levels) {
    await prisma.level.upsert({ where: { id: level.id }, update: level, create: level });
  }
  for (const club of clubs) {
    await prisma.club.upsert({ where: { id: club.id }, update: club, create: club });
  }
  for (const coach of [...staffProfiles, ...coachProfiles]) {
    await prisma.coachProfile.upsert({ where: { id: coach.id }, update: coach, create: coach });
  }
  for (const team of teams) {
    await prisma.team.upsert({ where: { id: team.id }, update: team, create: team });
  }
  for (const a of coachTeamAssignments) {
    await prisma.coachTeamAssignment.upsert({
      where: { coachId_teamId_seasonId: { coachId: a.coachId, teamId: a.teamId, seasonId: a.seasonId } },
      update: a,
      create: a,
    });
  }
  for (const athlete of athleteProfiles) {
    await prisma.athleteProfile.upsert({ where: { id: athlete.id }, update: athlete, create: athlete });
  }
  for (const ex of exercises) {
    await prisma.exercise.upsert({ where: { id: ex.id }, update: ex, create: ex });
  }
  for (const w of workouts) {
    await prisma.workout.upsert({ where: { id: w.id }, update: w, create: w });
  }
  for (const m of matches) {
    await prisma.match.upsert({ where: { id: m.id }, update: m, create: m });
  }
  for (const s of surveys) {
    await prisma.survey.upsert({ where: { id: s.id }, update: s, create: s });
  }
  console.log("Seed completato.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
