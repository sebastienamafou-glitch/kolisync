-- CreateTable
CREATE TABLE "CustomerRisk" (
    "id" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "lastIncidentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentLog" (
    "id" TEXT NOT NULL,
    "riskProfileId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerRisk_customerPhone_key" ON "CustomerRisk"("customerPhone");

-- AddForeignKey
ALTER TABLE "IncidentLog" ADD CONSTRAINT "IncidentLog_riskProfileId_fkey" FOREIGN KEY ("riskProfileId") REFERENCES "CustomerRisk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
