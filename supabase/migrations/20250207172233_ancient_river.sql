-- Drop existing notification trigger if it exists
DROP TRIGGER IF EXISTS on_job_comment_created ON job_comments;
DROP FUNCTION IF EXISTS handle_job_comment_notification();

-- Create improved function to handle job comment notifications
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

  -- Get commenter's name with proper formatting
  SELECT 
    CASE 
      WHEN "lastName" IS NOT NULL AND "lastName" != '' 
      THEN concat("firstName", ' ', LEFT("lastName", 1), '.')
      ELSE "firstName"
    END INTO commenter_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Only create notification if we have valid commenter name and post owner
  IF commenter_name IS NOT NULL AND post_owner_id IS NOT NULL AND NEW.created_by != post_owner_id THEN
    -- Delete any existing similar notifications from the last minute to prevent duplicates
    DELETE FROM notifications 
    WHERE user_id = post_owner_id 
      AND type = 'job_comment'
      AND job_id = NEW.job_id
      AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 minute';

    -- Insert new notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link,
      created_at,
      job_id  -- Add job_id to help with deduplication
    ) VALUES (
      post_owner_id,
      'job_comment',
      'New Comment on "' || post_title || '"',
      commenter_name || ' commented on your job post',
      '/jobs/' || NEW.job_id,
      CURRENT_TIMESTAMP,
      NEW.job_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add job_id column to notifications if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create trigger for job comment notifications
CREATE TRIGGER on_job_comment_created
  AFTER INSERT ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_comment_notification();

-- Add index for better notification performance
CREATE INDEX IF NOT EXISTS idx_notifications_job_id ON notifications(job_id) WHERE job_id IS NOT NULL;