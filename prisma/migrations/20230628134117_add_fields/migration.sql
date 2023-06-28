/*
  Warnings:

  - You are about to drop the column `Fluid` on the `Article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Warehouse` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT,
    "designation" TEXT NOT NULL,
    "quantity" INTEGER,
    "length" INTEGER,
    "purchasePrice" TEXT NOT NULL,
    "sellingPrice" TEXT NOT NULL,
    "unitPrice" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "operatingPressure" TEXT,
    "diameter" TEXT,
    "fluid" TEXT,
    "referenceId" TEXT,
    "supplierId" TEXT,
    "warehouseId" TEXT,
    "categoryId" TEXT,
    "groupArticleId" TEXT,
    "ticketId" TEXT,
    "stallId" TEXT,
    CONSTRAINT "Article_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Reference" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_groupArticleId_fkey" FOREIGN KEY ("groupArticleId") REFERENCES "GroupArticle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "Stall" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("categoryId", "code", "designation", "diameter", "groupArticleId", "id", "image", "length", "lotNumber", "name", "operatingPressure", "purchasePrice", "quantity", "referenceId", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "warehouseId") SELECT "categoryId", "code", "designation", "diameter", "groupArticleId", "id", "image", "length", "lotNumber", "name", "operatingPressure", "purchasePrice", "quantity", "referenceId", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "warehouseId" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");
