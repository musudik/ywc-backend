-- CreateEnum
CREATE TYPE "ApplicantType" AS ENUM ('PrimaryApplicant', 'SecondaryApplicant');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ("Employed", "SelfEmployed", "Unemployed", "Retired", "Student", "Other");

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PersonalLoan', 'HomeLoan', 'CarLoan', 'BusinessLoan', 'EducationLoan', 'OtherLoan');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('Analysis', 'Immobillion', 'PrivateHealthInsurance', 'StateHealthInsurance', 'KFZ', 'Electricity', 'Loans', 'Sanuspay', 'Gems', 'Other');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('Analysis', 'Immobillion', 'PrivateHealthInsurance', 'StateHealthInsurance', 'KFZ', 'Electricity', 'Loans', 'Sanuspay', 'Gems', 'Other');

-- CreateTable
CREATE TABLE "personal_details" (
    "id" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coachId" TEXT NOT NULL,
    "applicantType" "ApplicantType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "housing" TEXT NOT NULL,

    CONSTRAINT "personal_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_details" (
    "id" TEXT NOT NULL,
    "employmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "occupation" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "contractDuration" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "employedSince" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_details" (
    "id" TEXT NOT NULL,
    "incomeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "grossIncome" DECIMAL(65,30) NOT NULL,
    "netIncome" DECIMAL(65,30) NOT NULL,
    "taxClass" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "numberOfSalaries" INTEGER NOT NULL,
    "childBenefit" DECIMAL(65,30) NOT NULL,
    "otherIncome" DECIMAL(65,30) NOT NULL,
    "incomeTradeBusiness" DECIMAL(65,30) NOT NULL,
    "incomeSelfEmployedWork" DECIMAL(65,30) NOT NULL,
    "incomeSideJob" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "income_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses_details" (
    "id" TEXT NOT NULL,
    "expensesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "coldRent" DECIMAL(65,30) NOT NULL,
    "electricity" DECIMAL(65,30) NOT NULL,
    "livingExpenses" DECIMAL(65,30) NOT NULL,
    "gas" DECIMAL(65,30) NOT NULL,
    "telecommunication" DECIMAL(65,30) NOT NULL,
    "accountMaintenanceFee" DECIMAL(65,30) NOT NULL,
    "alimony" DECIMAL(65,30) NOT NULL,
    "subscriptions" DECIMAL(65,30) NOT NULL,
    "otherExpenses" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "expenses_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "realEstate" DECIMAL(65,30) NOT NULL,
    "securities" DECIMAL(65,30) NOT NULL,
    "bankDeposits" DECIMAL(65,30) NOT NULL,
    "buildingSavings" DECIMAL(65,30) NOT NULL,
    "insuranceValues" DECIMAL(65,30) NOT NULL,
    "otherAssets" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liabilities" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "loanBank" TEXT,
    "loanAmount" DECIMAL(65,30),
    "loanMonthlyRate" DECIMAL(65,30),
    "loanInterest" DECIMAL(65,30),

    CONSTRAINT "liabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals_and_wishes" (
    "id" TEXT NOT NULL,
    "goalsAndWishesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "retirementPlanning" TEXT NOT NULL,
    "capitalFormation" TEXT NOT NULL,
    "realEstateGoals" TEXT NOT NULL,
    "financing" TEXT NOT NULL,
    "protection" TEXT NOT NULL,
    "healthcareProvision" TEXT NOT NULL,
    "otherGoals" TEXT NOT NULL,

    CONSTRAINT "goals_and_wishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_appetite" (
    "id" TEXT NOT NULL,
    "riskAppetiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "riskAppetite" TEXT NOT NULL,
    "investmentHorizon" TEXT NOT NULL,
    "knowledgeExperience" TEXT NOT NULL,
    "healthInsurance" TEXT NOT NULL,
    "healthInsuranceNumber" TEXT NOT NULL,
    "healthInsuranceProof" TEXT NOT NULL,

    CONSTRAINT "risk_appetite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentSignature" TEXT NOT NULL,
    "consentDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentLocation" TEXT NOT NULL,
    "documentDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "formType" "FormType" NOT NULL,
    "formName" TEXT NOT NULL,
    "formLink" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_forms" (
    "id" TEXT NOT NULL,
    "customFormId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personalId" TEXT NOT NULL,
    "formTemplate" TEXT NOT NULL,
    "formName" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_details_personalId_key" ON "personal_details"("personalId");

-- CreateIndex
CREATE UNIQUE INDEX "employment_details_employmentId_key" ON "employment_details"("employmentId");

-- CreateIndex
CREATE UNIQUE INDEX "income_details_incomeId_key" ON "income_details"("incomeId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_details_expensesId_key" ON "expenses_details"("expensesId");

-- CreateIndex
CREATE UNIQUE INDEX "assets_assetId_key" ON "assets"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "liabilities_liabilityId_key" ON "liabilities"("liabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "goals_and_wishes_goalsAndWishesId_key" ON "goals_and_wishes"("goalsAndWishesId");

-- CreateIndex
CREATE UNIQUE INDEX "goals_and_wishes_personalId_key" ON "goals_and_wishes"("personalId");

-- CreateIndex
CREATE UNIQUE INDEX "risk_appetite_riskAppetiteId_key" ON "risk_appetite"("riskAppetiteId");

-- CreateIndex
CREATE UNIQUE INDEX "risk_appetite_personalId_key" ON "risk_appetite"("personalId");

-- CreateIndex
CREATE UNIQUE INDEX "consents_consentId_key" ON "consents"("consentId");

-- CreateIndex
CREATE UNIQUE INDEX "documents_documentId_key" ON "documents"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "forms_formId_key" ON "forms"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_forms_customFormId_key" ON "custom_forms"("customFormId");

-- AddForeignKey
ALTER TABLE "personal_details" ADD CONSTRAINT "personal_details_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_details" ADD CONSTRAINT "employment_details_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_details" ADD CONSTRAINT "income_details_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_details" ADD CONSTRAINT "expenses_details_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals_and_wishes" ADD CONSTRAINT "goals_and_wishes_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_appetite" ADD CONSTRAINT "risk_appetite_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_forms" ADD CONSTRAINT "custom_forms_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_details"("personalId") ON DELETE CASCADE ON UPDATE CASCADE;
