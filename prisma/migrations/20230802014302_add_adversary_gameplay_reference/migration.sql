-- CreateTable
CREATE TABLE "AdversaryReference" (
    "id" TEXT NOT NULL,
    "adversary_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "max_level" INTEGER,
    "type" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AdversaryReference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdversaryReference" ADD CONSTRAINT "AdversaryReference_adversary_id_fkey" FOREIGN KEY ("adversary_id") REFERENCES "Adversary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
