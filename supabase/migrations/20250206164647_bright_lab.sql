-- Create function to handle job comment notifications
CREATE OR REPLACE FUNCTION handle_job_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
BEGIN
  -- Get the post owner ID
  SELECT created_by INTO post_owner_id
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
      link,
      created_at
    ) VALUES (
      post_owner_id,
      'job_comment',
      'New Response',
      commenter_name || ' responded to your job post',
      '/jobs/' || NEW.job_id,
      NEW.created_at
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job comment notifications
DROP TRIGGER IF EXISTS on_job_comment_created ON job_comments;
CREATE TRIGGER on_job_comment_created
  AFTER INSERT ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_comment_notification();

-- Add comment_count to job_posts
ALTER TABLE job_posts 
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create function to update comment count
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

-- Create trigger for comment count
DROP TRIGGER IF EXISTS on_job_comment_count_change ON job_comments;
CREATE TRIGGER on_job_comment_count_change
  AFTER INSERT OR DELETE ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_job_comment_count();

-- Update existing comment counts
UPDATE job_posts p
SET comment_count = (
  SELECT COUNT(*)
  FROM job_comments c
  WHERE c.job_id = p.id
);