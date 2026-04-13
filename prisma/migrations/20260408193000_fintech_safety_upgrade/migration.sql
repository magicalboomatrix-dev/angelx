-- Normalize pre-enum transaction values so the enum cast is safe.
UPDATE "Transaction"
SET "type" = CASE
  WHEN "type" = 'ADMIN_CREDIT' THEN 'DEPOSIT'
  WHEN "type" = 'ADMIN_DEBIT' THEN 'WITHDRAW'
  ELSE "type"
END;

UPDATE "Transaction"
SET "status" = CASE
  WHEN "status" = 'COMPLETED' THEN 'SUCCESS'
  WHEN "status" = 'REJECTED' THEN 'REJECTED'
  WHEN "status" = 'SUCCESS' THEN 'SUCCESS'
  WHEN "status" = 'PENDING' THEN 'PENDING'
  WHEN "status" = 'FAILED' THEN 'FAILED'
  ELSE 'FAILED'
END;

ALTER TABLE "Wallet"
ADD COLUMN IF NOT EXISTS "usdtLocked" DECIMAL(18,6) NOT NULL DEFAULT 0;

ALTER TABLE "Wallet"
ALTER COLUMN "usdtAvailable" TYPE DECIMAL(18,6) USING ROUND(COALESCE("usdtAvailable", 0)::numeric, 6),
ALTER COLUMN "usdtDeposited" TYPE DECIMAL(18,6) USING ROUND(COALESCE("usdtDeposited", 0)::numeric, 6),
ALTER COLUMN "usdtWithdrawn" TYPE DECIMAL(18,6) USING ROUND(COALESCE("usdtWithdrawn", 0)::numeric, 6);

ALTER TABLE "Transaction"
RENAME COLUMN "depositId" TO "referenceId";

ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "adminId" INTEGER,
ADD COLUMN IF NOT EXISTS "reviewNote" TEXT,
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

ALTER TABLE "Transaction"
ALTER COLUMN "amount" TYPE DECIMAL(18,6) USING ROUND(COALESCE("amount", 0)::numeric, 6);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
    CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'SELL', 'BUY');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionStatus') THEN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REJECTED');
  END IF;
END $$;

ALTER TABLE "Transaction"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Transaction"
ALTER COLUMN "type" TYPE "TransactionType" USING "type"::"TransactionType",
ALTER COLUMN "status" TYPE "TransactionStatus" USING "status"::"TransactionStatus";

ALTER TABLE "Transaction"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "WalletLedger" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(18,6) NOT NULL,
  "balanceAfter" DECIMAL(18,6) NOT NULL,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletLedger_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WalletLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AdminActionLog" (
  "id" SERIAL NOT NULL,
  "adminId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "targetId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "WalletLedger_userId_createdAt_idx" ON "WalletLedger"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "WalletLedger_referenceId_idx" ON "WalletLedger"("referenceId");
CREATE INDEX IF NOT EXISTS "AdminActionLog_adminId_createdAt_idx" ON "AdminActionLog"("adminId", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminActionLog_action_createdAt_idx" ON "AdminActionLog"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Transaction_status_type_createdAt_idx" ON "Transaction"("status", "type", "createdAt");
CREATE INDEX IF NOT EXISTS "BankCard_userId_isSelected_idx" ON "BankCard"("userId", "isSelected");
CREATE INDEX IF NOT EXISTS "CryptoWallet_userId_isSelected_idx" ON "CryptoWallet"("userId", "isSelected");

WITH ranked_bank_cards AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC, "id" DESC) AS rn
  FROM "BankCard"
  WHERE "isSelected" = TRUE
)
UPDATE "BankCard"
SET "isSelected" = FALSE
WHERE "id" IN (
  SELECT "id" FROM ranked_bank_cards WHERE rn > 1
);

WITH ranked_crypto_wallets AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC, "id" DESC) AS rn
  FROM "CryptoWallet"
  WHERE "isSelected" = TRUE
)
UPDATE "CryptoWallet"
SET "isSelected" = FALSE
WHERE "id" IN (
  SELECT "id" FROM ranked_crypto_wallets WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "BankCard_one_selected_per_user"
ON "BankCard"("userId")
WHERE "isSelected" = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS "CryptoWallet_one_selected_per_user"
ON "CryptoWallet"("userId")
WHERE "isSelected" = TRUE;