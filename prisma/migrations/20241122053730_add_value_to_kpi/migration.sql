/*
  Warnings:

  - Added the required column `performanceId` to the `kpis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `kpis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kpis" ADD COLUMN     "performanceId" INTEGER NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
