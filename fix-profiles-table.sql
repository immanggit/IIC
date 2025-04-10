-- Ensure profiles table has the correct structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS learning_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS preferred_level TEXT,
ADD COLUMN IF NOT EXISTS learning_goals TEXT[],
ADD COLUMN IF NOT EXISTS daily_target INTEGER DEFAULT 20;

-- Add a trigger to automatically create a profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Ensure RLS policies are set correctly
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can view their own profile' 
    AND polrelid = 'public.profiles'::regclass
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
  END IF;
END
$$;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can update their own profile' 
    AND polrelid = 'public.profiles'::regclass
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END
$$;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can insert their own profile' 
    AND polrelid = 'public.profiles'::regclass
  ) THEN
    CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

