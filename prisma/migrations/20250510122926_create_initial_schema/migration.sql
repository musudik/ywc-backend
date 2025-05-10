-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "phoneNumber" TEXT,
    "firebaseUid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "analysisFormId" TEXT NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salutation" TEXT,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "maidenName" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthCountry" TEXT,
    "nationality" TEXT NOT NULL,
    "isEUCitizen" BOOLEAN,
    "residencePermit" TEXT,
    "inGermanySince" TIMESTAMP(3),
    "street" TEXT NOT NULL,
    "houseNumber" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "residentSince" TIMESTAMP(3),
    "previousAddress" JSONB,
    "phoneLandline" TEXT,
    "phoneMobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "taxId" TEXT,
    "maritalStatus" TEXT NOT NULL,
    "separationOfGoods" BOOLEAN,
    "numberOfChildren" INTEGER NOT NULL,
    "childrenBirthDates" TIMESTAMP(3)[],
    "profession" TEXT NOT NULL,
    "employmentType" TEXT,
    "employedSince" TIMESTAMP(3),
    "contractType" TEXT NOT NULL,
    "contractUntil" TIMESTAMP(3),
    "employerName" TEXT,
    "employerInGermany" BOOLEAN,
    "netIncome" DECIMAL(65,30) NOT NULL,
    "grossIncome" DECIMAL(65,30) NOT NULL,
    "numberOfSalaries" INTEGER NOT NULL,
    "childBenefit" DECIMAL(65,30) NOT NULL,
    "otherIncome" DECIMAL(65,30) NOT NULL,
    "iban" TEXT,
    "bic" TEXT,
    "analysisFormId" TEXT,
    "immobillionFormId" TEXT,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immobillion_applicant_details" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicantId" TEXT NOT NULL,
    "salaryCurrency" TEXT,
    "salaryCurrencyOther" TEXT,
    "hasPartTimeJob" BOOLEAN NOT NULL,
    "partTimeSince" TIMESTAMP(3),
    "isFreelancer" BOOLEAN NOT NULL,
    "isSelfEmployed" BOOLEAN NOT NULL,
    "selfEmployedAs" TEXT,
    "selfEmployedSince" TIMESTAMP(3),
    "selfEmployedCompany" TEXT,
    "vehiclesInHousehold" INTEGER NOT NULL,
    "retirementStart" TIMESTAMP(3),
    "statutoryPension" DECIMAL(65,30),
    "privatePension" DECIMAL(65,30),
    "interpreterRequired" BOOLEAN NOT NULL,
    "monthlyIncome" JSONB NOT NULL,
    "monthlyExpenses" JSONB NOT NULL,
    "assets" JSONB NOT NULL,
    "liabilities" JSONB NOT NULL,

    CONSTRAINT "immobillion_applicant_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immobillion_forms" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'No-Form',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "formType" TEXT NOT NULL DEFAULT 'IMMOBILLION',
    "formVersion" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "immobillion_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_forms" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'No-Form',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "consultantName" TEXT NOT NULL,
    "officeLocation" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL,
    "coldRent" DECIMAL(65,30) NOT NULL,
    "gas" DECIMAL(65,30) NOT NULL,
    "electricity" DECIMAL(65,30) NOT NULL,
    "telecommunication" DECIMAL(65,30) NOT NULL,
    "subscriptions" DECIMAL(65,30) NOT NULL,
    "accountMaintenanceFee" DECIMAL(65,30) NOT NULL,
    "livingExpenses" DECIMAL(65,30) NOT NULL,
    "alimony" DECIMAL(65,30) NOT NULL,
    "otherExpenses" DECIMAL(65,30) NOT NULL,
    "addLoanOrLeasing" BOOLEAN NOT NULL,
    "loanBank" TEXT,
    "loanAmount" DECIMAL(65,30),
    "loanMonthlyRate" DECIMAL(65,30),
    "loanInterest" DECIMAL(65,30),
    "analysisConsent" BOOLEAN NOT NULL,
    "analysisConsentText" TEXT NOT NULL,
    "analysisConsentSignature" TEXT NOT NULL,
    "analysisLocation" TEXT NOT NULL,
    "analysisConsentDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "immobillion_applicant_details_applicantId_key" ON "immobillion_applicant_details"("applicantId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_analysisFormId_fkey" FOREIGN KEY ("analysisFormId") REFERENCES "analysis_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_analysisFormId_fkey" FOREIGN KEY ("analysisFormId") REFERENCES "analysis_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_immobillionFormId_fkey" FOREIGN KEY ("immobillionFormId") REFERENCES "immobillion_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobillion_applicant_details" ADD CONSTRAINT "immobillion_applicant_details_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobillion_forms" ADD CONSTRAINT "immobillion_forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_forms" ADD CONSTRAINT "analysis_forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
