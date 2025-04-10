-- Function to update user_courses progress
CREATE OR REPLACE FUNCTION update_user_course_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update progress for all user_courses
  UPDATE user_courses uc
  SET progress = (
    SELECT 
      CASE 
        WHEN COUNT(a.id) = 0 THEN 0
        ELSE ROUND((COUNT(up.id) FILTER (WHERE up.completed = true)::NUMERIC / COUNT(a.id)::NUMERIC) * 100)
      END
    FROM activities a
    LEFT JOIN user_progress up ON up.activity_id = a.id AND up.user_id = uc.user_id
    WHERE a.course_id = uc.course_id AND a.status = 'published'
  ),
  updated_at = NOW()
  WHERE uc.id IS NOT NULL;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function after insert/update/delete on activities or user_progress
CREATE OR REPLACE TRIGGER update_user_course_progress_trigger
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH STATEMENT EXECUTE FUNCTION update_user_course_progress();

CREATE OR REPLACE TRIGGER update_user_course_progress_trigger_2
AFTER INSERT OR UPDATE OR DELETE ON user_progress
FOR EACH STATEMENT EXECUTE FUNCTION update_user_course_progress();

-- Function to update courses total_enrollment
CREATE OR REPLACE FUNCTION update_course_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_enrollment for all courses
  UPDATE courses c
  SET total_enrollment = (
    SELECT COUNT(DISTINCT user_id)
    FROM user_courses uc
    WHERE uc.course_id = c.id
  ),
  updated_at = NOW();
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function after insert/update/delete on user_courses
CREATE OR REPLACE TRIGGER update_course_enrollment_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_courses
FOR EACH STATEMENT EXECUTE FUNCTION update_course_enrollment();

-- Function to refresh all progress and enrollment data
CREATE OR REPLACE FUNCTION refresh_all_progress_and_enrollment()
RETURNS VOID AS $$
BEGIN
  -- Call the update functions
  PERFORM update_user_course_progress();
  PERFORM update_course_enrollment();
END;
$$ LANGUAGE plpgsql;

