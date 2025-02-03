-- Create function to get server timestamp
CREATE OR REPLACE FUNCTION get_server_timestamp()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create function to refresh booking statuses
CREATE OR REPLACE FUNCTION refresh_booking_statuses(user_id UUID)
RETURNS TABLE (server_time TIMESTAMPTZ) AS $$
DECLARE
  now_timestamp TIMESTAMPTZ;
BEGIN
  -- Get current server timestamp
  SELECT CURRENT_TIMESTAMP INTO now_timestamp;

  -- Cancel pending bookings if start time has passed
  UPDATE bookings
  SET 
    status = 'cancelled',
    updated_at = now_timestamp
  WHERE 
    student_id = user_id
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
    student_id = user_id
    AND status = 'approved'
    AND (
      now_timestamp > start_time
      OR now_timestamp >= updated_at + INTERVAL '24 hours'
    );

  RETURN QUERY SELECT now_timestamp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_server_timestamp() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_booking_statuses(UUID) TO authenticated;