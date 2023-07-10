/*
  Warnings:

  - You are about to drop the column `stat` on the `Warehouse` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Warehouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Warehouse" ("description", "id", "name", "updatedAt") SELECT "description", "id", "name", "updatedAt" FROM "Warehouse";
DROP TABLE "Warehouse";
ALTER TABLE "new_Warehouse" RENAME TO "Warehouse";
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
