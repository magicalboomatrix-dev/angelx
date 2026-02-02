-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "erc20Address" TEXT NOT NULL DEFAULT '0x78845f99b319b48393fbcde7d32fcb7ccd6661bf',
ADD COLUMN     "erc20QrUrl" TEXT NOT NULL DEFAULT '/images/erc20.png',
ADD COLUMN     "trc20Address" TEXT NOT NULL DEFAULT 'TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV',
ADD COLUMN     "trc20QrUrl" TEXT NOT NULL DEFAULT '/images/trc20.png';
