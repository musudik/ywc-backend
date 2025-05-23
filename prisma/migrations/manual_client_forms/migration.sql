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