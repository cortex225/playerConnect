/*
  Warnings:

  - The primary key for the `media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mediaType` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `media` table. All the data in the column will be lost.
  - Added the required column `title` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media" DROP CONSTRAINT "media_pkey",
DROP COLUMN "mediaType",
DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "media_id_seq";
