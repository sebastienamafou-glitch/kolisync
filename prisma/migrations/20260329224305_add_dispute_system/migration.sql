-- CreateEnum
CREATE TYPE "SocialTransactionType" AS ENUM ('CONTRIBUTION', 'PAYOUT', 'ADJUSTMENT');

-- AlterEnum
ALTER TYPE "PackageStatus" ADD VALUE 'AVAILABLE_PUBLIC';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "commune" TEXT,
ADD COLUMN     "socialContribution" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PackageEvent" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredCommune" TEXT;

-- CreateTable
CREATE TABLE "SocialWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "orderId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "SocialTransactionType" NOT NULL DEFAULT 'CONTRIBUTION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "driverComment" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialWallet_userId_key" ON "SocialWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialTransaction_orderId_key" ON "SocialTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_orderId_key" ON "Dispute"("orderId");

-- AddForeignKey
ALTER TABLE "SocialWallet" ADD CONSTRAINT "SocialWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialTransaction" ADD CONSTRAINT "SocialTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "SocialWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialTransaction" ADD CONSTRAINT "SocialTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
