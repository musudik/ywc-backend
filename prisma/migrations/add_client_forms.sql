-- Create client_forms table
CREATE TABLE IF NOT EXISTS "client_forms" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "formType" TEXT NOT NULL,
  "formName" TEXT NOT NULL,
  "formData" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Submitted',
  "lastEditedBy" TEXT,

  CONSTRAINT "client_forms_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on formId
CREATE UNIQUE INDEX "client_forms_formId_key" ON "client_forms"("formId");

-- Add foreign key constraint to reference users table
ALTER TABLE "client_forms" ADD CONSTRAINT "client_forms_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Modify FormType enum to include all needed types if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FormType') THEN
        CREATE TYPE "FormType" AS ENUM (
            'Analysis',
            'Immobilien',
            'PrivateHealthInsurance',
            'StateHealthInsurance',
            'KFZ',
            'Electricity',
            'Loans',
            'Sanuspay',
            'Gems',
            'Other'
        );
    ELSE
        -- Try to add new values to the enum if they don't exist
        BEGIN
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Analysis';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Immobilien';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'PrivateHealthInsurance';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'StateHealthInsurance';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'KFZ';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Electricity';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Loans';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Sanuspay';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Gems';
            ALTER TYPE "FormType" ADD VALUE IF NOT EXISTS 'Other';
        EXCEPTION
            WHEN OTHERS THEN
                NULL; -- Ignore errors when adding values that already exist
        END;
    END IF;
END$$; 