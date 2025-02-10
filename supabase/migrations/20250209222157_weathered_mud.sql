-- Drop existing constraint and indexes
ALTER TABLE job_tags 
DROP CONSTRAINT IF EXISTS job_tags_unique_name;

DROP INDEX IF EXISTS idx_job_tags_lookup;
DROP INDEX IF EXISTS idx_job_tags_name_lower;

-- Clean up any existing duplicates but keep all tags
CREATE TEMP TABLE ordered_tags AS
SELECT DISTINCT ON (job_id, name) 
  id,
  job_id,
  name,
  created_by,
  created_at
FROM job_tags
ORDER BY job_id, name, created_at DESC;

-- Delete all tags
DELETE FROM job_tags;

-- Reinsert cleaned up tags
INSERT INTO job_tags (id, job_id, name, created_by, created_at)
SELECT id, job_id, name, created_by, created_at
FROM ordered_tags;

-- Drop temporary table
DROP TABLE ordered_tags;

-- Create new index for performance without uniqueness constraint
CREATE INDEX idx_job_tags_search 
ON job_tags (job_id, name);