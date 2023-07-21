/*
  Warnings:

  - Added the required column `sum` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN "withdraw" REAL DEFAULT 0;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "purchaseOrder" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sum" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outGoingStoreId" TEXT,
    "clientId" TEXT,
    CONSTRAINT "Ticket_outGoingStoreId_fkey" FOREIGN KEY ("outGoingStoreId") REFERENCES "OutGoingStore" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("clientId", "createdAt", "id", "name", "outGoingStoreId", "purchaseOrder", "status", "updatedAt") SELECT "clientId", "createdAt", "id", "name", "outGoingStoreId", "purchaseOrder", "status", "updatedAt" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
