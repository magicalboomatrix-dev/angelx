/*
  Warnings:

  - Added the required column `bankName` to the `BankCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankCard" ADD COLUMN     "bankName" TEXT NOT NULL;
