-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "inviteReward" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "referredAt" TIMESTAMP(3),
ADD COLUMN     "referredById" INTEGER;

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" SERIAL NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "referredUserId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferralReward_referrerId_createdAt_idx" ON "ReferralReward"("referrerId", "createdAt");

-- CreateIndex
CREATE INDEX "ReferralReward_referredUserId_createdAt_idx" ON "ReferralReward"("referredUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ReferralReward_transactionId_idx" ON "ReferralReward"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralReward_referrerId_transactionId_key" ON "ReferralReward"("referrerId", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteCode_key" ON "User"("inviteCode");

-- CreateIndex
CREATE INDEX "User_referredById_createdAt_idx" ON "User"("referredById", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Transaction_depositId_key" RENAME TO "Transaction_referenceId_key";