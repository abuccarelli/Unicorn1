-- Drop existing policies for job_tags if any exist
DROP POLICY IF EXISTS "Users can view job tags" ON job_tags;
DROP POLICY IF EXISTS "Users can manage their own tags" ON job_tags;

-- Create policies for job tags
CREATE POLICY "Users can view job tags"
ON job_tags FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Users can manage their own tags"
ON job_tags 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM job_posts
    WHERE id = job_id
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_posts
    WHERE id = job_id
    AND created_by = auth.uid()
  )
);

-- Make sure RLS is enabled
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;