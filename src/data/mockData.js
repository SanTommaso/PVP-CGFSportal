export const areas = [
  {
    id: "cgfs",
    name: "CGFS",
    subtitle: "Centro di Formazione e Sviluppo",
    description: "Percorso formativo, corsi, Volley S3, crescita motoria e competenze.",
  },
  {
    id: "pvp",
    name: "PVP",
    subtitle: "Prato Volley Project",
    description: "Societa, squadre, staff tecnico, calendari e attivita agonistica.",
  },
];

export const seasons = [{ id: "2025-2026", name: "2025/2026", active: true }];

export const levels = [
  { id: "s3-white", areaId: "cgfs", name: "Volley S3 White", ageRange: "5/6/7 anni" },
  { id: "s3-green", areaId: "cgfs", name: "Volley S3 Green", ageRange: "8/9/10 anni" },
  { id: "s3-red", areaId: "cgfs", name: "Volley S3 Red / U12", ageRange: "11/12 anni" },
  { id: "u13", areaId: "pvp", name: "U13", ageRange: "Under 13" },
  { id: "u14", areaId: "pvp", name: "U14", ageRange: "Under 14" },
  { id: "u16", areaId: "pvp", name: "U16", ageRange: "Under 16" },
  { id: "u18", areaId: "pvp", name: "U18", ageRange: "Under 18" },
  { id: "b2", areaId: "pvp", name: "B2", ageRange: "Serie B2" },
];

export const clubs = [
  "Ariete",
  "Viva Volley",
  "29 Martiri",
  "Volley Viaccia",
  "CDP Volley Vaiano",
  "Volley Prato",
].map((name, index) => ({ id: `club-${index + 1}`, areaId: "pvp", name }));

export const coachProfiles = [
  { id: "coach-1", areaId: "pvp", fullName: "Lorenzo Castelli", email: "lorenzo.demo@pvp.local", active: true },
  { id: "coach-2", areaId: "pvp", fullName: "Martina Secchi", email: "martina.demo@pvp.local", active: true },
  { id: "coach-3", areaId: "pvp", fullName: "Andrea Giusti", email: "andrea.demo@pvp.local", active: true },
  { id: "coach-4", areaId: "pvp", fullName: "Francesco Dori", email: "francesco.demo@pvp.local", active: true },
];

export const staffProfiles = [
  { id: "coach-admin", fullName: "Coach", role: "Coach amministratore", email: "coach@pvp.local", phone: "", teamId: "", locked: true },
  { id: "staff-1", fullName: "Marco Bianchi", role: "Allenatore U16", phone: "333 000 111", teamId: "team-1" },
  { id: "staff-2", fullName: "Elisa Rosi", role: "Allenatrice U18", phone: "333 000 222", teamId: "team-3" },
];

export const teams = [
  { id: "team-1", areaId: "pvp", seasonId: "2025-2026", clubId: "club-1", levelId: "u16", name: "U16 F Ariete", court: "Palestra A" },
  { id: "team-2", areaId: "pvp", seasonId: "2025-2026", clubId: "club-2", levelId: "u14", name: "U14 M Viva", court: "Palestra B" },
  { id: "team-3", areaId: "pvp", seasonId: "2025-2026", clubId: "club-6", levelId: "u18", name: "U18 M Volley Prato", court: "Palestra A" },
  { id: "team-4", areaId: "pvp", seasonId: "2025-2026", clubId: "club-3", levelId: "u13", name: "U13 F 29 Martiri", court: "Palestra C" },
];

export const coachTeamAssignments = [
  { coachId: "coach-1", teamId: "team-1", seasonId: "2025-2026" },
  { coachId: "coach-1", teamId: "team-2", seasonId: "2025-2026" },
  { coachId: "coach-2", teamId: "team-1", seasonId: "2025-2026" },
  { coachId: "coach-2", teamId: "team-3", seasonId: "2025-2026" },
  { coachId: "coach-3", teamId: "team-2", seasonId: "2025-2026" },
  { coachId: "coach-4", teamId: "team-4", seasonId: "2025-2026" },
];

export const athleteProfiles = [
  { id: "athlete-1", areaId: "pvp", fullName: "Giulia Neri", teamId: "team-1", levelId: "u16", role: "Schiacciatrice" },
  { id: "athlete-2", areaId: "pvp", fullName: "Sara Bianchi", teamId: "team-1", levelId: "u16", role: "Palleggiatrice" },
  { id: "athlete-3", areaId: "pvp", fullName: "Emma Conti", teamId: "team-3", levelId: "u18", role: "Centrale" },
  { id: "athlete-4", areaId: "pvp", fullName: "Tommaso Ricci", teamId: "team-2", levelId: "u14", role: "Opposto" },
  { id: "athlete-5", areaId: "pvp", fullName: "Viola Gori", teamId: "team-4", levelId: "u13", role: "Libero" },
];

export const exercises = [
  {
    id: "exercise-1",
    areaId: "shared",
    levelId: "s3-white",
    title: "Staffetta coordinativa con palla",
    category: "Didattica",
    objective: "spostamenti",
    exerciseType: "Base",
    durationSeconds: 720,
    ageGroups: ["8 anni", "9 anni", "10 anni"],
    typology: "Didattica",
    subtype: "spostamenti",
    regime: "Metabolico",
    regimeSubtype: "Agilita",
    description: "Percorso semplice con conduzione della palla, cambio direzione e cooperazione a coppie.",
    players: "8-14 allievi",
    duration: "12 min",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "exercise-2",
    areaId: "shared",
    levelId: "s3-green",
    title: "Bagher guidato in movimento",
    category: "Tecnica",
    objective: "bagher ricezione",
    exerciseType: "Base",
    durationSeconds: 900,
    ageGroups: ["10 anni", "11 anni", "12 anni"],
    typology: "Tecnica",
    subtype: "bagher ricezione",
    regime: "Metabolico",
    regimeSubtype: "Rapidita",
    description: "Sequenza a stazioni per leggere la traiettoria e orientare il piano di rimbalzo.",
    players: "6-10 allievi",
    duration: "15 min",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
  },
  {
    id: "exercise-3",
    areaId: "shared",
    levelId: "s3-red",
    title: "Mini partita con obiettivo cooperativo",
    category: "Globale",
    objective: "palleggio ricezione",
    exerciseType: "Variante",
    durationSeconds: 1080,
    ageGroups: ["11 anni", "12 anni", "13 anni"],
    typology: "Globale",
    subtype: "palleggio ricezione",
    regime: "Metabolico",
    regimeSubtype: "Agilita",
    description: "Punti bonus quando la squadra completa tre passaggi prima della conclusione.",
    players: "8 allievi",
    duration: "18 min",
    youtubeUrl: "",
  },
  {
    id: "exercise-4",
    areaId: "shared",
    levelId: "u16",
    title: "Rondoschiacciata 4 vs 4 + P",
    category: "Tattica",
    objective: "schiacciata",
    exerciseType: "Variante",
    durationSeconds: 1200,
    ageGroups: ["15 anni", "16 anni", "17 anni"],
    typology: "Tattica",
    subtype: "schiacciata",
    regime: "Anabolico",
    regimeSubtype: "Forza Esplosiva",
    description: "Esercizio per migliorare fase di attacco e copertura in equilibrio numerico.",
    players: "9 atlete",
    duration: "20 min",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

export const workouts = [
  { id: "workout-1", areaId: "pvp", seasonId: "2025-2026", teamId: "team-1", title: "Tecnica ricezione + cambio palla", day: "Lun 19", time: "17:00 - 18:30", status: "programmato" },
  { id: "workout-2", areaId: "pvp", seasonId: "2025-2026", teamId: "team-2", title: "Difesa e contrattacco", day: "Mar 20", time: "17:00 - 18:30", status: "programmato" },
  { id: "workout-3", areaId: "pvp", seasonId: "2025-2026", teamId: "team-3", title: "Lavoro per reparti", day: "Mer 21", time: "19:00 - 20:30", status: "programmato" },
  { id: "workout-4", areaId: "pvp", seasonId: "2025-2026", teamId: "team-1", title: "Partita a tema", day: "Ven 23", time: "20:00 - 21:30", status: "bozza" },
  { id: "workout-5", areaId: "pvp", seasonId: "2025-2026", teamId: "team-4", title: "S3 avanzato e letture", day: "Sab 24", time: "10:00 - 11:30", status: "programmato" },
];

export const matches = [
  { id: "match-1", teamId: "team-1", opponent: "Volley Empoli", date: "25 maggio", result: "Da disputare" },
  { id: "match-2", teamId: "team-3", opponent: "Firenze Volley", date: "26 maggio", result: "3-1" },
];

export const surveys = [
  { id: "survey-1", areaId: "pvp", title: "Benessere pre-allenamento", status: "aperto", responses: 24, questions: [{ text: "Come ti senti oggi?", type: "Scala lineare" }] },
  { id: "survey-2", areaId: "pvp", title: "Autovalutazione tecnica", status: "chiuso", responses: 18, questions: [{ text: "Quale fondamentale vuoi migliorare?", type: "Scelta multipla" }] },
];
