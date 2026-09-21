-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageRange" TEXT,
    CONSTRAINT "Level_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Club_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "teamId" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachProfile_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "clubId" TEXT,
    "levelId" TEXT,
    "name" TEXT NOT NULL,
    "court" TEXT,
    CONSTRAINT "Team_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Team_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachTeamAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachTeamAssignment_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoachTeamAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoachTeamAssignment_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AthleteProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATETIME,
    "levelId" TEXT,
    "clubId" TEXT,
    "teamId" TEXT,
    "role" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AthleteProfile_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AthleteProfile_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AthleteProfile_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AthleteProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "levelId" TEXT,
    "createdByCoachId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "objective" TEXT,
    "description" TEXT,
    "players" TEXT,
    "duration" TEXT,
    "exerciseType" TEXT,
    "durationSeconds" INTEGER,
    "ageGroups" TEXT,
    "typology" TEXT,
    "subtype" TEXT,
    "regime" TEXT,
    "regimeSubtype" TEXT,
    "youtubeUrl" TEXT,
    "youtubeUrl2" TEXT,
    "imageUrl" TEXT,
    "imageUrl2" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exercise_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Exercise_createdByCoachId_fkey" FOREIGN KEY ("createdByCoachId") REFERENCES "CoachProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExerciseMedia_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "coachProfileId" TEXT,
    "title" TEXT NOT NULL,
    "day" TEXT,
    "time" TEXT,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workout_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Workout_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Workout_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Workout_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "coachProfileId" TEXT,
    "opponent" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "result" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "seasonId" TEXT,
    "coachProfileId" TEXT,
    "title" TEXT NOT NULL,
    "responses" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT,
    "questions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Survey_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Survey_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Survey_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Level_areaId_idx" ON "Level"("areaId");

-- CreateIndex
CREATE INDEX "Club_areaId_idx" ON "Club"("areaId");

-- CreateIndex
CREATE INDEX "CoachProfile_areaId_active_idx" ON "CoachProfile"("areaId", "active");

-- CreateIndex
CREATE INDEX "Team_areaId_seasonId_idx" ON "Team"("areaId", "seasonId");

-- CreateIndex
CREATE INDEX "Team_clubId_levelId_idx" ON "Team"("clubId", "levelId");

-- CreateIndex
CREATE INDEX "CoachTeamAssignment_teamId_seasonId_idx" ON "CoachTeamAssignment"("teamId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachTeamAssignment_coachId_teamId_seasonId_key" ON "CoachTeamAssignment"("coachId", "teamId", "seasonId");

-- CreateIndex
CREATE INDEX "AthleteProfile_areaId_active_idx" ON "AthleteProfile"("areaId", "active");

-- CreateIndex
CREATE INDEX "AthleteProfile_teamId_idx" ON "AthleteProfile"("teamId");

-- CreateIndex
CREATE INDEX "Exercise_areaId_levelId_idx" ON "Exercise"("areaId", "levelId");

-- CreateIndex
CREATE INDEX "Exercise_createdByCoachId_idx" ON "Exercise"("createdByCoachId");

-- CreateIndex
CREATE INDEX "ExerciseMedia_exerciseId_idx" ON "ExerciseMedia"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseMedia_exerciseId_mediaType_url_key" ON "ExerciseMedia"("exerciseId", "mediaType", "url");

-- CreateIndex
CREATE INDEX "Workout_areaId_seasonId_idx" ON "Workout"("areaId", "seasonId");

-- CreateIndex
CREATE INDEX "Workout_coachProfileId_teamId_idx" ON "Workout"("coachProfileId", "teamId");

-- CreateIndex
CREATE INDEX "Match_areaId_seasonId_idx" ON "Match"("areaId", "seasonId");

-- CreateIndex
CREATE INDEX "Match_teamId_idx" ON "Match"("teamId");

-- CreateIndex
CREATE INDEX "Survey_areaId_seasonId_idx" ON "Survey"("areaId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
