/*
  Warnings:

  - You are about to drop the column `personalId` on the `personal_details` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `personal_details` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_personalId_fkey";

-- DropForeignKey
ALTER TABLE "consents" DROP CONSTRAINT "consents_personalId_fkey";

-- DropForeignKey
ALTER TABLE "custom_forms" DROP CONSTRAINT "custom_forms_personalId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_personalId_fkey";

-- DropForeignKey
ALTER TABLE "employment_details" DROP CONSTRAINT "employment_details_personalId_fkey";

-- DropForeignKey
ALTER TABLE "expenses_details" DROP CONSTRAINT "expenses_details_personalId_fkey";

-- DropForeignKey
ALTER TABLE "forms" DROP CONSTRAINT "forms_personalId_fkey";

-- DropForeignKey
ALTER TABLE "goals_and_wishes" DROP CONSTRAINT "goals_and_wishes_personalId_fkey";

-- DropForeignKey
ALTER TABLE "income_details" DROP CONSTRAINT "income_details_personalId_fkey";

-- DropForeignKey
ALTER TABLE "liabilities" DROP CONSTRAINT "liabilities_personalId_fkey";

-- DropForeignKey
ALTER TABLE "risk_appetite" DROP CONSTRAINT "risk_appetite_personalId_fkey";

-- Step 1: Add the userId column as nullable first
ALTER TABLE "personal_details" ADD COLUMN "userId" TEXT;

-- Step 2: Update existing records to set userId = coachId temporarily
-- This assumes that each personal_details record is associated with a user
-- who is either the coach or has the same email
UPDATE "personal_details" pd
SET "userId" = pd."coachId"
WHERE "userId" IS NULL;

-- Step 3: Make userId NOT NULL after populating it
ALTER TABLE "personal_details" ALTER COLUMN "userId" SET NOT NULL;

-- DropIndex
DROP INDEX "personal_details_personalId_key";

-- Step 4: Now we can safely drop the personalId column
ALTER TABLE "personal_details" DROP COLUMN "personalId";

-- CreateIndex
CREATE UNIQUE INDEX "personal_details_userId_key" ON "personal_details"("userId");

-- AddForeignKey
ALTER TABLE "personal_details" ADD CONSTRAINT "personal_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_details" ADD CONSTRAINT "employment_details_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_details" ADD CONSTRAINT "income_details_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_details" ADD CONSTRAINT "expenses_details_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals_and_wishes" ADD CONSTRAINT "goals_and_wishes_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_appetite" ADD CONSTRAINT "risk_appetite_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_forms" ADD CONSTRAINT "custom_forms_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
