-- First, identify duplicates and keep the most recently updated one for each user/formType combination
WITH duplicates AS (
    SELECT id, "userId", "formType", 
           ROW_NUMBER() OVER (PARTITION BY "userId", "formType" ORDER BY "updatedAt" DESC) as row_num
    FROM client_forms
)
DELETE FROM client_forms
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE client_forms ADD CONSTRAINT unique_user_form_type UNIQUE ("userId", "formType"); 