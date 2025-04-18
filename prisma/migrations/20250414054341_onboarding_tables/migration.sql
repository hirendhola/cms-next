-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'INITIATED', 'SETUP_COMPLETED', 'AWAITING_CLERK', 'COMPLETED', 'EXPIRED', 'ERROR');

-- CreateTable
CREATE TABLE "OnboardingRequest" (
    "id" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminPhone" TEXT,
    "proposedInstituteName" TEXT NOT NULL,
    "reason" TEXT,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdInstitutionId" TEXT,
    "rejectionReason" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRequest_adminEmail_key" ON "OnboardingRequest"("adminEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRequest_onboardingToken_key" ON "OnboardingRequest"("onboardingToken");

-- CreateIndex
CREATE INDEX "OnboardingRequest_adminEmail_idx" ON "OnboardingRequest"("adminEmail");

-- CreateIndex
CREATE INDEX "OnboardingRequest_status_idx" ON "OnboardingRequest"("status");

-- CreateIndex
CREATE INDEX "OnboardingRequest_onboardingToken_idx" ON "OnboardingRequest"("onboardingToken");
