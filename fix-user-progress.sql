-- First, ensure we have a unique constraint on user_id and activity_id
DO $$
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_user_id_activity_id_unique'
  ) THEN
    -- Add a unique constraint to ensure one user can have only one progress record per activity
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_activity_id_unique 
    UNIQUE (user_id, activity_id);
  END IF;
END$$;

-- Update the saveActivityProgress function to handle this constraint properly
-- This is a function that will be called from the server action to ensure proper recording of progress
CREATE OR REPLACE FUNCTION save_user_activity_progress(
  p_user_id UUID,
  p_activity_id UUID,
  p_score INTEGER,
  p_completed BOOLEAN,
  p_answers JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_course_id UUID;
  v_existing_progress_id UUID;
  v_time_spent INTEGER;
BEGIN
  -- Get the course_id for this activity
  SELECT course_id INTO v_course_id FROM activities WHERE id = p_activity_id;

  -- Check if progress record already exists
  SELECT id INTO v_existing_progress_id 
  FROM user_progress 
  WHERE user_id = p_user_id AND activity_id = p_activity_id;

  -- Calculate time spent (random between 3-10 minutes for demo purposes)
  v_time_spent := floor(random() * 7) + 3;

  IF v_existing_progress_id IS NOT NULL THEN
    -- Update existing progress
    UPDATE user_progress
    SET 
      score = p_score,
      completed = p_completed,
      answers = COALESCE(p_answers, answers),
      time_spent = time_spent + CASE WHEN p_completed THEN v_time_spent ELSE 0 END,
      updated_at = NOW()
    WHERE id = v_existing_progress_id;
  ELSE
    -- Create new progress record
    INSERT INTO user_progress (
      user_id,
      activity_id,
      course_id,
      score,
      completed,
      answers,
      time_spent,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_activity_id,
      v_course_id,
      p_score,
      p_completed,
      COALESCE(p_answers, '{}'::jsonb),
      CASE WHEN p_completed THEN v_time_spent ELSE 0 END,
      NOW(),
      NOW()
    );
  END IF;
  
  -- If completed, update course progress
  IF p_completed AND v_course_id IS NOT NULL THEN
    PERFORM update_course_progress(p_user_id, v_course_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update course progress
CREATE OR REPLACE FUNCTION update_course_progress(p_user_id UUID, p_course_id UUID) RETURNS VOID AS $$
DECLARE
  v_total_activities INTEGER;
  v_completed_activities INTEGER;
  v_progress_percentage INTEGER;
BEGIN
  -- Get total number of activities for this course
  SELECT COUNT(*) INTO v_total_activities 
  FROM activities 
  WHERE course_id = p_course_id;

  -- Get completed activities for this user and course
  SELECT COUNT(*) INTO v_completed_activities 
  FROM user_progress 
  WHERE user_id = p_user_id AND course_id = p_course_id AND completed = TRUE;

  -- Calculate progress percentage
  IF v_total_activities > 0 THEN
    v_progress_percentage := (v_completed_activities * 100) / v_total_activities;
  ELSE
    v_progress_percentage := 0;
  END IF;

  -- Update course progress
  UPDATE courses 
  SET progress = v_progress_percentage 
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

