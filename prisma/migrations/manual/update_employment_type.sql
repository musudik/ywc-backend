-- Instructions for manually updating the EmploymentType enum in PostgreSQL
-- Run the following commands in your PostgreSQL database:

-- 1. Check the current enum values
-- SELECT enum_range(NULL::public."EmploymentType");

-- 2. Update the enum values
-- For PostgreSQL 9.1+, you need to:

-- Create a temporary type with the new values
CREATE TYPE "EmploymentType_new" AS ENUM (
  'Employed', 
  'SelfEmployed', 
  'Unemployed',
  'Retired',
  'Student',
  'Other'
);

-- Create a casting function between the old and new types
CREATE FUNCTION employment_type_cast(old_type "EmploymentType") RETURNS "EmploymentType_new" AS $$
BEGIN
  IF old_type = 'PrimaryEmployment'::public."EmploymentType" THEN
    RETURN 'Employed'::public."EmploymentType_new";
  ELSIF old_type = 'SecondaryEmployment'::public."EmploymentType" THEN
    RETURN 'SelfEmployed'::public."EmploymentType_new";
  ELSE
    RETURN 'Other'::public."EmploymentType_new";
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Begin a transaction
BEGIN;

-- Add the new column to the employment_details table
ALTER TABLE "employment_details" ADD COLUMN "employment_type_new" "EmploymentType_new";

-- Update the new column with values cast from the old column
UPDATE "employment_details" SET "employment_type_new" = employment_type_cast("employmentType");

-- Drop the old column
ALTER TABLE "employment_details" DROP COLUMN "employmentType";

-- Rename the new column to the original name
ALTER TABLE "employment_details" RENAME COLUMN "employment_type_new" TO "employmentType";

-- Drop the old type and rename the new type to the original name
DROP TYPE "EmploymentType" CASCADE;
ALTER TYPE "EmploymentType_new" RENAME TO "EmploymentType";

-- Drop the conversion function
DROP FUNCTION employment_type_cast("EmploymentType_new");

-- Commit the transaction
COMMIT;

-- After running this script manually, you'll need to:
-- 1. Update your Prisma schema to reflect these changes
-- 2. Run 'npx prisma generate' to update the Prisma client 