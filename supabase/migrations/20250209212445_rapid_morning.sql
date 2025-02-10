-- First, create a temporary table to store unique tags
CREATE TEMP TABLE unique_tags AS
WITH ranked_tags AS (
  SELECT 
    id,
    job_id,
    LOWER(name) as name,
    created_by,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY job_id, LOWER(name) 
      ORDER BY created_at DESC
    ) as rn
  FROM job_tags
)
SELECT id, job_id, name, created_by, created_at
FROM ranked_tags
WHERE rn = 1;

-- Delete all duplicates
DELETE FROM job_tags
WHERE id NOT IN (SELECT id FROM unique_tags);

-- Update remaining tags to lowercase
UPDATE job_tags
SET name = LOWER(name)
WHERE id IN (SELECT id FROM unique_tags);

-- Drop temporary table
DROP TABLE unique_tags;

-- Drop existing constraint if it exists
ALTER TABLE job_tags 
DROP CONSTRAINT IF EXISTS job_tags_unique_name;

-- Add unique constraint for job_id and name combination
ALTER TABLE job_tags
ADD CONSTRAINT job_tags_unique_name 
UNIQUE (job_id, name);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_job_tags_lookup 
ON job_tags (job_id, name);