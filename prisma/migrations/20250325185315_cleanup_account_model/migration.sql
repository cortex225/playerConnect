/*
  Warnings:

  - You are about to drop the column `accountId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "accountId",
DROP COLUMN "providerId";
