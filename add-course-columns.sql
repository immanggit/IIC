-- Add total_enrollment column to courses table
ALTER TABLE courses ADD COLUMN total_enrollment INTEGER DEFAULT 0;

-- Add is_recommended column to courses table
ALTER TABLE courses ADD COLUMN is_recommended BOOLEAN DEFAULT false;

-- Update some courses to be recommended for testing
UPDATE courses SET is_recommended = true WHERE id IN (
  SELECT id FROM courses ORDER BY created_at DESC LIMIT 3
);

-- Update total_enrollment based on user_courses count
UPDATE courses 
SET total_enrollment = (
  SELECT COUNT(*) 
  FROM user_courses 
  WHERE user_courses.course_id = courses.id
);

