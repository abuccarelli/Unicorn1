-- Add deleted_at column to job_tags
ALTER TABLE job_tags
ADD COLUMN deleted_at TIMESTAMPTZ;

-- Create index for deleted_at to improve query performance
CREATE INDEX idx_job_tags_deleted_at 
ON job_tags (deleted_at) 
WHERE deleted_at IS NULL;

-- Update the job_tags_search index to include deleted_at
DROP INDEX IF EXISTS idx_job_tags_search;
CREATE INDEX idx_job_tags_search 
ON job_tags (job_id, name) 
WHERE deleted_at IS NULL;