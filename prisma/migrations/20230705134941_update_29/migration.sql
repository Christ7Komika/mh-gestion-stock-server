/*
  Warnings:

  - You are about to drop the `GroupArticle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `groupArticleId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `Article` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GroupArticle";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Stall";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT,
    "designation" TEXT NOT NULL,
    "length" REAL NOT NULL DEFAULT 0,
    "purchasePrice" TEXT,
    "sellingPrice" TEXT,
    "unitPrice" TEXT,
    "lotNumber" TEXT NOT NULL,
    "operatingPressure" TEXT,
    "diameter" TEXT,
    "fluid" TEXT,
    "reference" TEXT,
    "commentId" TEXT,
    "supplierId" TEXT,
    "warehouseId" TEXT,
    "categoryId" TEXT,
    "ticketId" TEXT,
    CONSTRAINT "Article_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("categoryId", "code", "commentId", "designation", "diameter", "fluid", "id", "image", "length", "lotNumber", "name", "operatingPressure", "purchasePrice", "reference", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "warehouseId") SELECT "categoryId", "code", "commentId", "designation", "diameter", "fluid", "id", "image", "length", "lotNumber", "name", "operatingPressure", "purchasePrice", "reference", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "warehouseId" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;