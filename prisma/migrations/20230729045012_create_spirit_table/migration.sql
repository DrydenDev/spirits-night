-- CreateTable
CREATE TABLE "Spirit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "expansion" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "complexity_value" INTEGER NOT NULL,
    "incarna" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Spirit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Spirit_name_key" ON "Spirit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Spirit_slug_key" ON "Spirit"("slug");
