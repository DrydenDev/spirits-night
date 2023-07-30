-- CreateTable
CREATE TABLE "Adversary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expansion" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "loss_condition" JSONB,
    "escalation_ability" JSONB NOT NULL,

    CONSTRAINT "Adversary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdversaryLevel" (
    "id" TEXT NOT NULL,
    "adversary_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fear_cards" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AdversaryLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Adversary_name_key" ON "Adversary"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Adversary_slug_key" ON "Adversary"("slug");

-- AddForeignKey
ALTER TABLE "AdversaryLevel" ADD CONSTRAINT "AdversaryLevel_adversary_id_fkey" FOREIGN KEY ("adversary_id") REFERENCES "Adversary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
