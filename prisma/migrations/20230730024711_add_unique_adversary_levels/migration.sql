/*
  Warnings:

  - A unique constraint covering the columns `[adversary_id,title]` on the table `AdversaryLevel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdversaryLevel_adversary_id_title_key" ON "AdversaryLevel"("adversary_id", "title");
