-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sumValue" TEXT,
    "quantity" TEXT NOT NULL,
    "hasLength" BOOLEAN,
    "ticketId" TEXT,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "Item_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("articleId", "hasLength", "id", "quantity", "sumValue", "ticketId") SELECT "articleId", "hasLength", "id", "quantity", "sumValue", "ticketId" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
