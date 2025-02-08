-- Create job posts table
CREATE TABLE job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job tags table
CREATE TABLE job_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create job attachments table
CREATE TABLE job_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create job comments table
CREATE TABLE job_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES job_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job comment attachments table
CREATE TABLE job_comment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES job_comments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_comment_attachments ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for job attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-attachments', 'job-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for job comment attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-comment-attachments', 'job-comment-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for job posts
CREATE POLICY "Anyone can view job posts"
  ON job_posts FOR SELECT
  USING (true);

CREATE POLICY "Students can create job posts"
  ON job_posts FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'student'
    )
  );

CREATE POLICY "Users can update their own job posts"
  ON job_posts FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create policies for job tags
CREATE POLICY "Anyone can view job tags"
  ON job_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can create tags on their posts"
  ON job_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts
      WHERE id = job_id
      AND created_by = auth.uid()
    )
  );

-- Create policies for job attachments
CREATE POLICY "Anyone can view job attachments"
  ON job_attachments FOR SELECT
  USING (true);

CREATE POLICY "Users can add attachments to their posts"
  ON job_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts
      WHERE id = job_id
      AND created_by = auth.uid()
    )
  );

-- Create policies for job comments
CREATE POLICY "Anyone can view job comments"
  ON job_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON job_comments FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own comments"
  ON job_comments FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create policies for job comment attachments
CREATE POLICY "Anyone can view comment attachments"
  ON job_comment_attachments FOR SELECT
  USING (true);

CREATE POLICY "Users can add attachments to their comments"
  ON job_comment_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_comments
      WHERE id = comment_id
      AND created_by = auth.uid()
    )
  );

-- Create storage policies
CREATE POLICY "Anyone can read job attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('job-attachments', 'job-comment-attachments'));

CREATE POLICY "Users can upload job attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('job-attachments', 'job-comment-attachments') AND
    (auth.role() = 'authenticated')
  );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_job_posts_updated_at
  BEFORE UPDATE ON job_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_comments_updated_at
  BEFORE UPDATE ON job_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();