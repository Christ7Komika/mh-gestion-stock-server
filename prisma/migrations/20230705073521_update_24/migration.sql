/*
  Warnings:

  - You are about to drop the column `Desc` on the `Category` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "reference" TEXT,
    "description" TEXT
);
INSERT INTO "new_Category" ("id", "name", "reference") SELECT "id", "name", "reference" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
