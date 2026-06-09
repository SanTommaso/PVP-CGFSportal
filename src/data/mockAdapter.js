import {
  areas,
  athleteProfiles,
  clubs,
  coachProfiles,
  coachTeamAssignments,
  exercises as initialExercises,
  levels,
  matches,
  seasons,
  staffProfiles,
  surveys,
  teams,
  workouts,
} from "./mockData.js";

let exercises = [...initialExercises];

const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

function assignedTeamIds(coachProfileId) {
  if (coachProfileId === "coach-admin") return teams.map((team) => team.id);
  const staffProfile = staffProfiles.find((profile) => profile.id === coachProfileId);
  if (staffProfile?.teamId) return [staffProfile.teamId];
  return coachTeamAssignments
    .filter((assignment) => assignment.coachId === coachProfileId)
    .map((assignment) => assignment.teamId);
}

export const mockAdapter = {
  async getBootstrap() {
    return wait({ areas, seasons, levels, clubs });
  },

  async getExercises({ areaId, query = "" } = {}) {
    const normalized = query.trim().toLowerCase();
    const result = exercises.filter((exercise) => {
      const matchesArea = !areaId || exercise.areaId === "shared" || exercise.areaId === areaId;
      const haystack = `${exercise.title} ${exercise.category} ${exercise.objective} ${exercise.description} ${exercise.typology || ""} ${exercise.subtype || ""} ${exercise.regime || ""}`.toLowerCase();
      return matchesArea && (!normalized || haystack.includes(normalized));
    });
    return wait(result);
  },

  async createExercise(payload) {
    const exercise = {
      ...payload,
      id: `exercise-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    exercises = [exercise, ...exercises];
    return wait(exercise);
  },

  async getCoachProfiles({ areaId = "pvp" } = {}) {
    if (areaId !== "pvp") return wait([]);
    return wait(staffProfiles);
  },

  async getPvpDashboard({ coachProfileId, seasonId = "2025-2026" } = {}) {
    const teamIds = assignedTeamIds(coachProfileId);
    const dashboardTeams = teams.filter((team) => team.seasonId === seasonId);
    const dashboardWorkouts = workouts;
    const dashboardMatches = matches;
    const roster = athleteProfiles;

    return wait({
      coach: staffProfiles.find((item) => item.id === coachProfileId) || coachProfiles.find((item) => item.id === coachProfileId),
      ownTeamIds: teamIds,
      teams: dashboardTeams,
      roster,
      workouts: dashboardWorkouts,
      matches: dashboardMatches,
      surveys,
      staff: staffProfiles,
      exercises,
      clubs,
      levels,
    });
  },
};
