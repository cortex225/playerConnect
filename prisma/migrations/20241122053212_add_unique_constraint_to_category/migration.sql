/*
  Warnings:

  - A unique constraint covering the columns `[name,levelId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "categories_name_levelId_key" ON "categories"("name", "levelId");
