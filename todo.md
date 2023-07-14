Ajouter pays et ville dans la section client, fournisseur
Date d'expiration du flexible
Categorie
Ajout du champ total article enregistre, article vendus, article restant

Fournisseur
total article achetes chez le fournisseur,
total article

model Warehouse {
id String @id @default(uuid())
name String @unique
articles Article[]
createdAt DateTime @default(now())
}

model Article {
id String @id @default(uuid())
image String?
name String
Warehouse Warehouse? @relation(fields [warehouseId], references: [id])
warehouseId String?
updatedAt DateTime @updatedAt
createdAt DateTime @default(now())
}
