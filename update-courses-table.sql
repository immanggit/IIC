-- Add total_activities column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_activities INTEGER DEFAULT 0;

-- Update total_activities based on published activities count
UPDATE courses 
SET total_activities = (
  SELECT COUNT(*) 
  FROM activities 
  WHERE activities.course_id = courses.id AND activities.status = 'published'
);

-- Create function to update total_activities when activities are published or moved to draft
CREATE OR REPLACE FUNCTION update_course_total_activities()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the course's total_activities count
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status = 'draft') THEN
    -- Increment total_activities when a new published activity is added
    UPDATE courses SET total_activities = total_activities + 1 WHERE id = NEW.course_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'published') OR 
        (TG_OP = 'UPDATE' AND NEW.status = 'draft' AND OLD.status = 'published') THEN
    -- Decrement total_activities when a published activity is removed or moved to draft
    UPDATE courses SET total_activities = total_activities - 1 WHERE id = OLD.course_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on activities table
DROP TRIGGER IF EXISTS activities_update_course_total_activities ON activities;
CREATE TRIGGER activities_update_course_total_activities
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_course_total_activities();

