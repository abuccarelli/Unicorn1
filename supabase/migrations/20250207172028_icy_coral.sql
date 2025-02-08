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

  -- Get commenter's name
  SELECT concat("firstName", ' ', COALESCE(LEFT("lastName", 1) || '.', '')) INTO commenter_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Only create notification if we have valid commenter name and post owner
  IF commenter_name IS NOT NULL AND post_owner_id IS NOT NULL AND NEW.created_by != post_owner_id THEN
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
      'New Comment on "' || post_title || '"',
      commenter_name || ' commented on your job post',
      '/jobs/' || NEW.job_id,
      CURRENT_TIMESTAMP
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job comment notifications
CREATE TRIGGER on_job_comment_created
  AFTER INSERT ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_comment_notification();