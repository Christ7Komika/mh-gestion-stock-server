/*
  Warnings:

  - Added the required column `articleName` to the `inComingStore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasLength` to the `inComingStore` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inComingStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "hasLength" BOOLEAN NOT NULL,
    "articleId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_inComingStore" ("articleId", "createdAt", "designation", "id", "quantity", "updatedAt") SELECT "articleId", "createdAt", "designation", "id", "quantity", "updatedAt" FROM "inComingStore";
DROP TABLE "inComingStore";
ALTER TABLE "new_inComingStore" RENAME TO "inComingStore";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
