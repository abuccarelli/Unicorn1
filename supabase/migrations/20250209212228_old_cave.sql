-- First, create a temporary table to store unique tags
CREATE TEMP TABLE unique_tags AS
SELECT DISTINCT ON (job_id, name)
  id,
  job_id,
  name,
  created_by,
  created_at
FROM job_tags
ORDER BY job_id, name, created_at;

-- Delete all duplicates
DELETE FROM job_tags
WHERE id NOT IN (SELECT id FROM unique_tags);

-- Drop temporary table
DROP TABLE unique_tags;

-- Now we can safely add the unique constraint
ALTER TABLE job_tags 
DROP CONSTRAINT IF EXISTS job_tags_unique_name;

-- Add unique constraint for job_id and name combination
ALTER TABLE job_tags
ADD CONSTRAINT job_tags_unique_name 
UNIQUE (job_id, name);

-- Create index for case-insensitive searches
CREATE INDEX IF NOT EXISTS idx_job_tags_name_lower 
ON job_tags (job_id, LOWER(name));