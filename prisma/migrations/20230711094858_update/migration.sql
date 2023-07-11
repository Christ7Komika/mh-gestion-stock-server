-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT,
    "designation" TEXT,
    "quantity" REAL NOT NULL,
    "hasLength" BOOLEAN,
    "purchasePrice" TEXT,
    "reference" TEXT,
    "sellingPrice" TEXT,
    "unitPrice" TEXT,
    "lotNumber" TEXT,
    "operatingPressure" TEXT,
    "diameter" TEXT,
    "fluid" TEXT,
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
INSERT INTO "new_Article" ("categoryId", "code", "commentId", "designation", "diameter", "fluid", "hasLength", "id", "image", "lotNumber", "name", "operatingPressure", "purchasePrice", "quantity", "reference", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "warehouseId") SELECT "categoryId", "code", "commentId", "designation", "diameter", "fluid", "hasLength", "id", "image", "lotNumber", "name", "operatingPressure", "purchasePrice", "quantity", "reference", "sellingPrice", "supplierId", "ticketId", "type", "unitPrice", "warehouseId" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
