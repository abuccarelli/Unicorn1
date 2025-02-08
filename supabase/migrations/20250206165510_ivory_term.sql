-- Add view_count and comment_count columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE job_posts 
    ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_posts' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE job_posts 
    ADD COLUMN comment_count INTEGER DEFAULT 0;
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

-- Create or replace function to handle job comment notifications
CREATE OR REPLACE FUNCTION handle_job_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
  post_title TEXT;
BEGIN
  -- Get the post owner ID and title
  SELECT created_by, title INTO post_owner_id, post_title
  FROM job_posts
  WHERE id = NEW.job_id;

  -- Get commenter's name
  SELECT concat("firstName", ' ', "lastName") INTO commenter_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Create notification for post owner if commenter is not the owner
  IF NEW.created_by != post_owner_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link
    ) VALUES (
      post_owner_id,
      'job_comment',
      'New Response to "' || post_title || '"',
      commenter_name || ' responded to your job post',
      '/jobs/' || NEW.job_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to update comment count
CREATE OR REPLACE FUNCTION update_job_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_posts
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_job_comment_created ON job_comments;
DROP TRIGGER IF EXISTS on_job_comment_count_change ON job_comments;

-- Create triggers
CREATE TRIGGER on_job_comment_created
  AFTER INSERT ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_comment_notification();

CREATE TRIGGER on_job_comment_count_change
  AFTER INSERT OR DELETE ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_job_comment_count();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_view_count ON job_posts(view_count);
CREATE INDEX IF NOT EXISTS idx_job_posts_comment_count ON job_posts(comment_count);

-- Update existing comment counts
UPDATE job_posts p
SET comment_count = (
  SELECT COUNT(*)
  FROM job_comments c
  WHERE c.job_id = p.id
);