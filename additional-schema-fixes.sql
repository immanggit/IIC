-- Add last_activity_date to profiles table
ALTER TABLE profiles ADD COLUMN last_activity_date DATE;

-- Make sure user_progress table has answers column for storing user answers
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS answers JSONB;

-- Add a column to track if a course is published
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Make sure activities have proper content structure
ALTER TABLE activities ALTER COLUMN content SET DEFAULT '{}'::jsonb;

