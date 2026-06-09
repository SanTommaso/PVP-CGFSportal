async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 401) {
    // Sessione scaduta: ricarica la pagina per tornare al login
    window.location.reload();
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Errore API ${res.status}`);
  }
  return res.json();
}

export const prismaAdapter = {
  async getBootstrap() {
    return apiFetch("/api/bootstrap");
  },

  async getExercises({ areaId, query = "" } = {}) {
    const params = new URLSearchParams();
    if (areaId) params.set("areaId", areaId);
    if (query) params.set("query", query);
    return apiFetch(`/api/exercises?${params}`);
  },

  async createExercise(payload) {
    return apiFetch("/api/exercises", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getCoachProfiles({ areaId = "pvp" } = {}) {
    return apiFetch(`/api/coach-profiles?areaId=${areaId}`);
  },

  async getPvpDashboard({ coachProfileId, seasonId = "2025-2026" } = {}) {
    const params = new URLSearchParams({ coachProfileId, seasonId });
    return apiFetch(`/api/pvp/dashboard?${params}`);
  },
};
