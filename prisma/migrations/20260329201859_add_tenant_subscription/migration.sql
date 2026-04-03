-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "isPro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3);
