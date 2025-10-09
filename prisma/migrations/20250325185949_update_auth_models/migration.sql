/*
  Warnings:

  - A unique constraint covering the columns `[providerId,accountId]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `verificationtokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "providerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "verificationtokens" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");
