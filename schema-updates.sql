-- Add status column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add status column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_courses table for tracking user progress in courses
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Add RLS policies for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for user_courses
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course progress"
  ON user_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can view all course progress"
  ON user_courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

CREATE POLICY "Users can update their own course progress"
  ON user_courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress"
  ON user_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update courses policies to handle status
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published' OR 
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update courses"
  ON courses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

CREATE POLICY "Teachers and admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Update activities policies to handle status
DROP POLICY IF EXISTS "Anyone can view activities" ON activities;
CREATE POLICY "Anyone can view published activities"
  ON activities FOR SELECT
  USING (status = 'published' OR 
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update activities"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

CREATE POLICY "Teachers and admins can insert activities"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Add default admin user role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM profiles
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Update existing courses and activities to published status
UPDATE courses SET status = 'published' WHERE status IS NULL OR status = 'draft';
UPDATE activities SET status = 'published' WHERE status IS NULL OR status = 'draft';

