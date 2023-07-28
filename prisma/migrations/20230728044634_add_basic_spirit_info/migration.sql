/*
  Warnings:

  - Added the required column `complexity` to the `Spirit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complexity_value` to the `Spirit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expansion` to the `Spirit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spirit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "expansion" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "complexity_value" INTEGER NOT NULL,
    "incarna" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Spirit" ("id", "name") SELECT "id", "name" FROM "Spirit";
DROP TABLE "Spirit";
ALTER TABLE "new_Spirit" RENAME TO "Spirit";
CREATE UNIQUE INDEX "Spirit_name_key" ON "Spirit"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
