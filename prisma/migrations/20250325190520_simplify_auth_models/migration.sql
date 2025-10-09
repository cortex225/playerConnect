/*
  Warnings:

  - You are about to drop the column `accessToken` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `accessTokenExpiresAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `idToken` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `accounts` table. All the data in the column will be lost.
  - The primary key for the `verificationtokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `verificationtokens` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `verificationtokens` table. All the data in the column will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[identifier,token]` on the table `verificationtokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "accounts_providerId_accountId_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "accessToken",
DROP COLUMN "accessTokenExpiresAt",
DROP COLUMN "accountId",
DROP COLUMN "createdAt",
DROP COLUMN "idToken",
DROP COLUMN "password",
DROP COLUMN "providerId",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpiresAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "verificationtokens" DROP CONSTRAINT "verificationtokens_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "verification";

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");
