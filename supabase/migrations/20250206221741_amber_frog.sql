-- Drop existing triggers and functions with CASCADE to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS check_student_requirements_trigger ON profiles CASCADE;
DROP FUNCTION IF EXISTS check_student_requirements() CASCADE;

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create initial profile with minimal required fields
  INSERT INTO public.profiles (
    id,
    email,
    role,
    "firstName",
    "lastName"
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    '',  -- Initialize with empty string
    ''   -- Initialize with empty string
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to check student requirements
CREATE OR REPLACE FUNCTION check_student_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation during initial profile creation
  IF TG_OP = 'INSERT' AND 
     (NEW."firstName" = '' OR NEW."firstName" IS NULL) AND 
     (NEW."lastName" = '' OR NEW."lastName" IS NULL) THEN
    RETURN NEW;
  END IF;

  -- Only validate student profiles that are being updated
  IF NEW.role = 'student' AND TG_OP = 'UPDATE' THEN
    -- Skip validation if nothing important changed
    IF OLD."firstName" = NEW."firstName" AND 
       OLD."lastName" = NEW."lastName" AND 
       OLD.date_of_birth IS NOT DISTINCT FROM NEW.date_of_birth AND
       OLD.guardian_first_name IS NOT DISTINCT FROM NEW.guardian_first_name AND
       OLD.guardian_last_name IS NOT DISTINCT FROM NEW.guardian_last_name AND
       OLD.guardian_email IS NOT DISTINCT FROM NEW.guardian_email AND
       OLD.guardian_phone IS NOT DISTINCT FROM NEW.guardian_phone THEN
      RETURN NEW;
    END IF;

    -- Require basic profile information
    IF NEW."firstName" = '' OR NEW."firstName" IS NULL THEN
      RAISE EXCEPTION 'First name is required';
    END IF;

    IF NEW."lastName" = '' OR NEW."lastName" IS NULL THEN
      RAISE EXCEPTION 'Last name is required';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for student requirements
CREATE TRIGGER check_student_requirements_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_student_requirements();

-- Add RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION check_student_requirements() TO authenticated;