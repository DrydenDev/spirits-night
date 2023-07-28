/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Spirit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Spirit_name_key" ON "Spirit"("name");
