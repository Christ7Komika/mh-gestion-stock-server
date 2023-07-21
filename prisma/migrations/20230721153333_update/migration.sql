/*
  Warnings:

  - You are about to drop the column `withdraw` on the `Article` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PendingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" TEXT NOT NULL,
    "ticketId" TEXT,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "PendingItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT,
    "designation" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "hasLength" BOOLEAN DEFAULT false,
    "purchasePrice" TEXT,
    "reference" TEXT,
    "sellingPrice" TEXT,
    "unitPrice" TEXT,
    "lotNumber" TEXT,
    "operatingPressure" TEXT,
    "diameter" TEXT,
    "fluid" TEXT,
    "supplierId" TEXT,
    "warehouseId" TEXT,
    "categoryId" TEXT,
    "ticketId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("categoryId", "code", "createdAt", "designation", "diameter", "fluid", "hasLength", "id", "image", "lotNumber", "name", "operatingPressure", "purchasePrice", "quantity", "reference", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "updatedAt", "warehouseId") SELECT "categoryId", "code", "createdAt", "designation", "diameter", "fluid", "hasLength", "id", "image", "lotNumber", "name", "operatingPressure", "purchasePrice", "quantity", "reference", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "updatedAt", "warehouseId" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
