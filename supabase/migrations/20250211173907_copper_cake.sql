-- Drop existing function if it exists
DROP FUNCTION IF EXISTS execute_job_search(text);

-- Create improved function to execute job search query
CREATE OR REPLACE FUNCTION execute_job_search(search_term text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  subjects text[],
  languages text[],
  status text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  view_count integer,
  comment_count integer,
  profile_id uuid,
  "firstName" text,
  "lastName" text,
  role text,
  tags jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    jp.id,
    jp.title,
    jp.description,
    jp.subjects,
    jp.languages,
    jp.status,
    jp.created_by,
    jp.created_at,
    jp.updated_at,
    jp.view_count,
    jp.comment_count,
    p.id as profile_id,
    p."firstName",
    p."lastName",
    p.role,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', jt.id,
          'name', jt.name,
          'created_by', jt.created_by,
          'deleted_at', jt.deleted_at
        )
      ) FILTER (WHERE jt.id IS NOT NULL AND jt.deleted_at IS NULL),
      '[]'::jsonb
    ) as tags
  FROM job_posts jp
  LEFT JOIN profiles p ON p.id = jp.created_by
  LEFT JOIN job_tags jt ON jt.job_id = jp.id
  WHERE jp.status = 'open'
  AND (
    search_term IS NULL OR
    jp.title ILIKE '%' || search_term || '%' OR
    jp.description ILIKE '%' || search_term || '%' OR
    EXISTS (
      SELECT 1 FROM job_tags jt2 
      WHERE jt2.job_id = jp.id 
      AND jt2.deleted_at IS NULL 
      AND jt2.name ILIKE '%' || search_term || '%'
    )
  )
  GROUP BY jp.id, p.id
  ORDER BY jp.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_job_search(text) TO authenticated;