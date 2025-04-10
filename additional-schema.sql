-- Create categories table for courses
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to courses table
ALTER TABLE courses ADD COLUMN category_id UUID REFERENCES categories(id);

-- Add additional fields to profiles table
ALTER TABLE profiles ADD COLUMN bio TEXT;
ALTER TABLE profiles ADD COLUMN preferred_level TEXT;
ALTER TABLE profiles ADD COLUMN learning_goals TEXT[];
ALTER TABLE profiles ADD COLUMN daily_target INTEGER DEFAULT 20;
ALTER TABLE profiles ADD COLUMN learning_streak INTEGER DEFAULT 0;

-- Add time_spent field to user_progress table
ALTER TABLE user_progress ADD COLUMN time_spent INTEGER DEFAULT 0;

-- Insert sample categories
INSERT INTO categories (name, description)
VALUES 
('Grammar', 'Learn English grammar rules and structures'),
('Vocabulary', 'Build your English vocabulary'),
('Conversation', 'Practice English conversation skills'),
('Reading', 'Improve your English reading skills'),
('Listening', 'Enhance your English listening skills');

-- Update courses to include category_id
UPDATE courses SET category_id = (SELECT id FROM categories WHERE name = 'Reading') WHERE title = 'Beginner English';
UPDATE courses SET category_id = (SELECT id FROM categories WHERE name = 'Vocabulary') WHERE title = 'Animals and Nature';
UPDATE courses SET category_id = (SELECT id FROM categories WHERE name = 'Vocabulary') WHERE title = 'Colors and Shapes';

