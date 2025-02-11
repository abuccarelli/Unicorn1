-- Create function to execute job search query
CREATE OR REPLACE FUNCTION execute_job_search(query_text text, query_params jsonb)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query_text
  USING (SELECT array_agg(value) FROM jsonb_array_elements(query_params));
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_job_search(text, jsonb) TO authenticated;