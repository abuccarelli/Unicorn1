-- Add view_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE job_posts 
    ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create or replace function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE job_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_view_count ON job_posts(view_count);