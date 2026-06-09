export const prismaAdapter = {
  async getBootstrap() {
    throw new Error("Prisma adapter non attivo nella demo frontend. Esporre queste query da un backend/API.");
  },
  async getExercises() {
    throw new Error("Prisma adapter non attivo nella demo frontend. Usare VITE_DATA_SOURCE=mock.");
  },
  async createExercise() {
    throw new Error("Prisma adapter non attivo nella demo frontend. Usare VITE_DATA_SOURCE=mock.");
  },
  async getCoachProfiles() {
    throw new Error("Prisma adapter non attivo nella demo frontend. Usare VITE_DATA_SOURCE=mock.");
  },
  async getPvpDashboard() {
    throw new Error("Prisma adapter non attivo nella demo frontend. Usare VITE_DATA_SOURCE=mock.");
  },
};
