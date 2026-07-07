-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RenderJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "avatarId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "stage" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "scriptText" TEXT,
    "config" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RenderJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RenderJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RenderJob_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RenderJob" ("avatarId", "config", "cost", "createdAt", "error", "finishedAt", "id", "progress", "projectId", "scriptText", "stage", "startedAt", "status", "updatedAt", "userId") SELECT "avatarId", "config", "cost", "createdAt", "error", "finishedAt", "id", "progress", "projectId", "scriptText", "stage", "startedAt", "status", "updatedAt", "userId" FROM "RenderJob";
DROP TABLE "RenderJob";
ALTER TABLE "new_RenderJob" RENAME TO "RenderJob";
CREATE INDEX "RenderJob_userId_idx" ON "RenderJob"("userId");
CREATE INDEX "RenderJob_status_priority_createdAt_idx" ON "RenderJob"("status", "priority", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
