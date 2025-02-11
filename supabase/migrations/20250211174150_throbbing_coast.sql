-- Create function to close job post
CREATE OR REPLACE FUNCTION close_job_post(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update job post status to closed
  UPDATE job_posts
  SET 
    status = 'closed',
    updated_at = CURRENT_TIMESTAMP
  WHERE id = post_id
  AND created_by = auth.uid()
  AND status = 'open';

  -- Notify users that the job post is closed
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    link
  )
  SELECT 
    created_by,
    'job_closed',
    'Job Post Closed',
    'Your job post has been closed',
    '/jobs/' || post_id
  FROM job_posts
  WHERE id = post_id
  AND created_by = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION close_job_post(uuid) TO authenticated;

-- Update job posts policies to allow status updates
DROP POLICY IF EXISTS "Users can update their own job posts" ON job_posts;
CREATE POLICY "Users can update their own job posts"
ON job_posts
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());