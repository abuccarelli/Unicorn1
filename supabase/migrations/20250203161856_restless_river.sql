-- Drop existing function
DROP FUNCTION IF EXISTS refresh_booking_statuses(UUID);

-- Create updated function that works for both teachers and students
CREATE OR REPLACE FUNCTION refresh_booking_statuses(user_id UUID)
RETURNS TABLE (server_time TIMESTAMPTZ) AS $$
DECLARE
  now_timestamp TIMESTAMPTZ;
  is_teacher BOOLEAN;
BEGIN
  -- Get current server timestamp
  SELECT CURRENT_TIMESTAMP INTO now_timestamp;

  -- Check if user is a teacher
  SELECT (role = 'teacher') INTO is_teacher
  FROM profiles
  WHERE id = user_id;

  -- Cancel pending bookings if start time has passed
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = now_timestamp
  WHERE 
    CASE 
      WHEN is_teacher THEN teacher_id = user_id  -- For teachers
      ELSE student_id = user_id                  -- For students
    END
    AND status = 'pending'
    AND now_timestamp > start_time;

  -- Cancel approved (but unpaid) bookings if:
  -- 1. Start time has passed OR
  -- 2. More than 24h since approval
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = now_timestamp
  WHERE 
    CASE 
      WHEN is_teacher THEN teacher_id = user_id  -- For teachers
      ELSE student_id = user_id                  -- For students
    END
    AND status = 'approved'
    AND (
      now_timestamp > start_time
      OR now_timestamp >= updated_at + INTERVAL '24 hours'
    );

  RETURN QUERY SELECT now_timestamp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION refresh_booking_statuses(UUID) TO authenticated;