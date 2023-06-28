/*
  Warnings:

  - Added the required column `articleId` to the `inComingStore` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inComingStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleName" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_inComingStore" ("articleName", "createdAt", "id", "updatedAt") SELECT "articleName", "createdAt", "id", "updatedAt" FROM "inComingStore";
DROP TABLE "inComingStore";
ALTER TABLE "new_inComingStore" RENAME TO "inComingStore";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
