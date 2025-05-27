Ajouter pays et ville dans la section client, fournisseur
Date d'expiration du flexible
Categorie
Ajout du champ total article enregistre, article vendus, article restant

Fournisseur
total article achetes chez le fournisseur,
total article

model Supplier {
id String @id @default(uuid())
logo String?
name String
phone String? @unique
email String? @unique
articles Article[]
updatedAt DateTime @updatedAt
createdAt DateTime @default(now())
}

model Warehouse {
id String @id @default(uuid())
name String @unique
description String?
articles Article[]
createdAt DateTime @default(now())
}

model Category {
id String @id @default(uuid())
name String
reference String?
description String?
articles Article[]
createdAt DateTime @default(now())
}

model Article {
id String @id @default(uuid())
image String?
name String
code String?
type String?
designation String
quantity Float
hasLength Boolean? @default(false)
purchasePrice String?
reference String?
sellingPrice String?
unitPrice String?
lotNumber String?
operatingPressure String?
diameter String?
fluid String?
Comment Comment[]
Supplier Supplier? @relation(fields: [supplierId], references: [id])
supplierId String?
Warehouse Warehouse? @relation(fields: [warehouseId], references: [id])
warehouseId String?
Category Category? @relation(fields: [categoryId], references: [id])
categoryId String?
Ticket Ticket? @relation(fields: [ticketId], references: [id])
ticketId String?
updatedAt DateTime @updatedAt
createdAt DateTime @default(now())
}
