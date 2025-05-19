-- CreateEnum
CREATE TYPE "EmploymentType_new" AS ENUM ('Employed', 'SelfEmployed', 'Unemployed', 'Retired', 'Student', 'Other');

-- Create a casting function between the old and new types
CREATE OR REPLACE FUNCTION employment_type_cast(old_type "EmploymentType") RETURNS "EmploymentType_new" AS $$
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

-- AlterTable
ALTER TABLE "employment_details" ADD COLUMN "employment_type_new" "EmploymentType_new";
UPDATE "employment_details" SET "employment_type_new" = employment_type_cast("employmentType");
ALTER TABLE "employment_details" DROP COLUMN "employmentType";
ALTER TABLE "employment_details" RENAME COLUMN "employment_type_new" TO "employmentType";

-- DropEnum
DROP TYPE "EmploymentType";

-- RenameEnum
ALTER TYPE "EmploymentType_new" RENAME TO "EmploymentType";

-- Drop the conversion function
DROP FUNCTION employment_type_cast("EmploymentType"); 