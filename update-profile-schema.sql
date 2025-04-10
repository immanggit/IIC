-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';

-- Migrate existing roles from user_roles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    UPDATE profiles p
    SET role = ur.role
    FROM user_roles ur
    WHERE p.id = ur.user_id;
  END IF;
END $$;

-- Drop user_roles table if it exists
DROP TABLE IF EXISTS user_roles;

