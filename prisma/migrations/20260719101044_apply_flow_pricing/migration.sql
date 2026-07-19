/*
  Warnings:

  - You are about to drop the column `minHourlyRate` on the `Category` table. All the data in the column will be lost.
  - Added the required column `typicalHourlyRate` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resume_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "coverNote" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL DEFAULT '',
    "applicantLocation" TEXT NOT NULL DEFAULT '',
    "resumeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("applicantId", "coverNote", "createdAt", "id", "jobId", "status") SELECT "applicantId", "coverNote", "createdAt", "id", "jobId", "status" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_jobId_applicantId_key" ON "Application"("jobId", "applicantId");
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "typicalHourlyRate" REAL NOT NULL
);
INSERT INTO "new_Category" ("id", "name") SELECT "id", "name" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "estimatedHours" REAL NOT NULL,
    "price" REAL NOT NULL,
    "paymentType" TEXT NOT NULL DEFAULT 'FIXED',
    "hourlyRate" REAL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "posterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("categoryId", "createdAt", "description", "estimatedHours", "id", "posterId", "price", "status", "title") SELECT "categoryId", "createdAt", "description", "estimatedHours", "id", "posterId", "price", "status", "title" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "skills" TEXT NOT NULL DEFAULT '',
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "accountBalance" REAL NOT NULL DEFAULT 0,
    "publicUserId" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("accountBalance", "bio", "createdAt", "displayName", "email", "hourlyRate", "id", "passwordHash", "publicUserId", "skills") SELECT "accountBalance", "bio", "createdAt", "displayName", "email", "hourlyRate", "id", "passwordHash", "publicUserId", "skills" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_publicUserId_key" ON "User"("publicUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
