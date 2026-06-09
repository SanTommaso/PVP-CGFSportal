import { PrismaClient } from "@prisma/client";
import {
  areas,
  athleteProfiles,
  clubs,
  coachProfiles,
  coachTeamAssignments,
  exercises,
  levels,
  matches,
  seasons,
  teams,
  workouts,
} from "../src/data/mockData.js";

const prisma = new PrismaClient();

async function main() {
  for (const area of areas) {
    await prisma.area.upsert({
      where: { id: area.id },
      update: { name: area.name },
      create: { id: area.id, name: area.name },
    });
  }

  for (const season of seasons) {
    await prisma.season.upsert({
      where: { id: season.id },
      update: { name: season.name, active: season.active },
      create: season,
    });
  }

  for (const level of levels) {
    await prisma.level.upsert({ where: { id: level.id }, update: level, create: level });
  }

  for (const club of clubs) {
    await prisma.club.upsert({ where: { id: club.id }, update: club, create: club });
  }

  for (const coach of coachProfiles) {
    await prisma.coachProfile.upsert({ where: { id: coach.id }, update: coach, create: coach });
  }

  for (const team of teams) {
    await prisma.team.upsert({ where: { id: team.id }, update: team, create: team });
  }

  for (const assignment of coachTeamAssignments) {
    await prisma.coachTeamAssignment.upsert({
      where: {
        coachId_teamId_seasonId: {
          coachId: assignment.coachId,
          teamId: assignment.teamId,
          seasonId: assignment.seasonId,
        },
      },
      update: assignment,
      create: assignment,
    });
  }

  for (const athlete of athleteProfiles) {
    await prisma.athleteProfile.upsert({ where: { id: athlete.id }, update: athlete, create: athlete });
  }

  for (const exercise of exercises) {
    const { youtubeUrl, ...exerciseData } = exercise;
    await prisma.exercise.upsert({ where: { id: exercise.id }, update: exerciseData, create: exerciseData });
    if (youtubeUrl) {
      await prisma.exerciseMedia.upsert({
        where: {
          exerciseId_mediaType_url: {
            exerciseId: exercise.id,
            mediaType: "youtube",
            url: youtubeUrl,
          },
        },
        update: { url: youtubeUrl },
        create: { exerciseId: exercise.id, mediaType: "youtube", url: youtubeUrl },
      });
    }
  }

  for (const workout of workouts) {
    await prisma.workout.upsert({ where: { id: workout.id }, update: workout, create: workout });
  }

  for (const match of matches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: { ...match, areaId: "pvp", seasonId: "2025-2026" },
      create: { ...match, areaId: "pvp", seasonId: "2025-2026" },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
