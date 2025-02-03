/*
  # Create Bookings System

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, references profiles)
      - `student_id` (uuid, references profiles)
      - `subject` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `message` (text)
      - `status` (text, enum: pending, confirmed, cancelled, completed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on bookings table
    - Add policies for:
      - Teachers can view their bookings
      - Students can view their bookings
      - Students can create bookings
      - Teachers can update booking status
*/

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  student_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Students can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Teachers can update booking status"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  )
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX bookings_teacher_id_idx ON bookings(teacher_id);
CREATE INDEX bookings_student_id_idx ON bookings(student_id);
CREATE INDEX bookings_status_idx ON bookings(status);