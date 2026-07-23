-- CreateTable
CREATE TABLE "JobReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JobReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "posterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("categoryId", "createdAt", "currency", "description", "estimatedHours", "hourlyRate", "id", "paymentType", "posterId", "price", "status", "title") SELECT "categoryId", "createdAt", "currency", "description", "estimatedHours", "hourlyRate", "id", "paymentType", "posterId", "price", "status", "title" FROM "Job";
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
    "completedHires" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("accountBalance", "bio", "createdAt", "displayName", "email", "hourlyRate", "id", "location", "passwordHash", "publicUserId", "skills") SELECT "accountBalance", "bio", "createdAt", "displayName", "email", "hourlyRate", "id", "location", "passwordHash", "publicUserId", "skills" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_publicUserId_key" ON "User"("publicUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "JobReport_jobId_reporterId_key" ON "JobReport"("jobId", "reporterId");
