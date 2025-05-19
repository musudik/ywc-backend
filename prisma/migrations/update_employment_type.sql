-- Step 1: Create a new enum type with the desired values
CREATE TYPE "EmploymentType_new" AS ENUM ('Employed', 'SelfEmployed', 'Unemployed', 'Retired', 'Student', 'Other');

-- Step 2: Update all tables that use the old enum
-- We need to convert the existing values to the new type
-- First, let's add a temporary column with the new type
ALTER TABLE "employment_details" ADD COLUMN "employmentType_new" "EmploymentType_new";

-- Step 3: Update the new column based on old values
UPDATE "employment_details"
SET "employmentType_new" = CASE 
    WHEN "employmentType" = 'PrimaryEmployment' THEN 'Employed'::EmploymentType_new
    WHEN "employmentType" = 'SecondaryEmployment' THEN 'SelfEmployed'::EmploymentType_new
    ELSE 'Other'::EmploymentType_new
END;

-- Step 4: Drop the old column and rename the new one
ALTER TABLE "employment_details" DROP COLUMN "employmentType";
ALTER TABLE "employment_details" RENAME COLUMN "employmentType_new" TO "employmentType";

-- Step 5: Drop the old type
DROP TYPE "EmploymentType";

-- Step 6: Rename the new type to the original name
ALTER TYPE "EmploymentType_new" RENAME TO "EmploymentType"; 