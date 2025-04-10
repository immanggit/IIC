-- Add year_of_birth column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year_of_birth INTEGER;

