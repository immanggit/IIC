-- Function to create activities for a course
CREATE OR REPLACE FUNCTION create_course_activities(course_id UUID, course_level TEXT, course_category TEXT)
RETURNS VOID AS $$
DECLARE
  activity_type TEXT;
  activity_count INTEGER := 5; -- Number of activities per course
  i INTEGER;
  activity_title TEXT;
  activity_description TEXT;
  activity_image TEXT;
  activity_content JSONB;
BEGIN
  -- Create activities for each course
  FOR i IN 1..activity_count LOOP
    -- Determine activity type based on index
    CASE (i % 5)
      WHEN 0 THEN activity_type := 'reading';
      WHEN 1 THEN activity_type := 'listening';
      WHEN 2 THEN activity_type := 'quiz';
      WHEN 3 THEN activity_type := 'fill_blank';
      WHEN 4 THEN activity_type := 'video';
    END CASE;
    
    -- Set activity title based on type and level
    CASE activity_type
      WHEN 'reading' THEN 
        activity_title := course_level || ' Reading: ' || 
          CASE course_category
            WHEN 'Grammar' THEN 'Grammar in Context'
            WHEN 'Vocabulary' THEN 'Expanding Your Vocabulary'
            WHEN 'Conversation' THEN 'Dialogue Analysis'
            WHEN 'Reading' THEN 'Comprehension Exercise'
            WHEN 'Listening' THEN 'Transcript Study'
            ELSE 'Reading Activity'
          END;
      WHEN 'listening' THEN 
        activity_title := course_level || ' Listening: ' || 
          CASE course_category
            WHEN 'Grammar' THEN 'Grammar in Speech'
            WHEN 'Vocabulary' THEN 'Vocabulary in Context'
            WHEN 'Conversation' THEN 'Natural Conversations'
            WHEN 'Reading' THEN 'Audio Passages'
            WHEN 'Listening' THEN 'Active Listening Exercise'
            ELSE 'Listening Activity'
          END;
      WHEN 'quiz' THEN 
        activity_title := course_level || ' Quiz: ' || 
          CASE course_category
            WHEN 'Grammar' THEN 'Grammar Challenge'
            WHEN 'Vocabulary' THEN 'Vocabulary Test'
            WHEN 'Conversation' THEN 'Conversation Quiz'
            WHEN 'Reading' THEN 'Reading Comprehension'
            WHEN 'Listening' THEN 'Listening Comprehension'
            ELSE 'Multiple Choice Quiz'
          END;
      WHEN 'fill_blank' THEN 
        activity_title := course_level || ' Fill in the Blanks: ' || 
          CASE course_category
            WHEN 'Grammar' THEN 'Complete the Sentences'
            WHEN 'Vocabulary' THEN 'Use the Right Word'
            WHEN 'Conversation' THEN 'Complete the Dialogue'
            WHEN 'Reading' THEN 'Complete the Passage'
            WHEN 'Listening' THEN 'Complete the Transcript'
            ELSE 'Fill in the Blanks Exercise'
          END;
      WHEN 'video' THEN 
        activity_title := course_level || ' Video: ' || 
          CASE course_category
            WHEN 'Grammar' THEN 'Grammar Explained'
            WHEN 'Vocabulary' THEN 'Visual Vocabulary'
            WHEN 'Conversation' THEN 'Conversation Examples'
            WHEN 'Reading' THEN 'Reading Strategies'
            WHEN 'Listening' THEN 'Listening Techniques'
            ELSE 'Video Lesson'
          END;
    END CASE;
    
    -- Set activity description
    activity_description := 'A ' || course_level || ' level ' || activity_type || ' activity for ' || course_category || ' practice.';
    
    -- Set activity image based on type
    CASE activity_type
      WHEN 'reading' THEN activity_image := 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=3540&auto=format&fit=crop';
      WHEN 'listening' THEN activity_image := 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?q=80&w=3474&auto=format&fit=crop';
      WHEN 'quiz' THEN activity_image := 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=3540&auto=format&fit=crop';
      WHEN 'fill_blank' THEN activity_image := 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=3422&auto=format&fit=crop';
      WHEN 'video' THEN activity_image := 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=3474&auto=format&fit=crop';
    END CASE;
    
    -- Set activity content based on type and level
    CASE activity_type
      WHEN 'reading' THEN 
        activity_content := jsonb_build_object(
          'text', 'This is a ' || course_level || ' level reading passage about ' || course_category || '. The content is designed to help students improve their reading skills while learning about ' || course_category || '.',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'id', 'q1',
              'text', 'What is the main topic of this passage?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', course_category, 'Pronunciation'),
              'correct', course_category
            ),
            jsonb_build_object(
              'id', 'q2',
              'text', 'What level is this reading passage?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_level),
              'correct', course_level
            ),
            jsonb_build_object(
              'id', 'q3',
              'text', 'What skill does this passage help improve?',
              'options', jsonb_build_array('Speaking', 'Writing', 'Reading', 'Listening'),
              'correct', 'Reading'
            )
          )
        );
      WHEN 'listening' THEN 
        activity_content := jsonb_build_object(
          'audioUrl', 'https://example.com/audio/' || course_level || '_' || course_category || '.mp3',
          'transcript', 'This is a ' || course_level || ' level listening exercise about ' || course_category || '. The content is designed to help students improve their listening skills while learning about ' || course_category || '.',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'id', 'q1',
              'text', 'What is the main topic of this audio?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', course_category, 'Pronunciation'),
              'correct', course_category
            ),
            jsonb_build_object(
              'id', 'q2',
              'text', 'What level is this listening exercise?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_level),
              'correct', course_level
            ),
            jsonb_build_object(
              'id', 'q3',
              'text', 'What skill does this exercise help improve?',
              'options', jsonb_build_array('Speaking', 'Writing', 'Reading', 'Listening'),
              'correct', 'Listening'
            )
          )
        );
      WHEN 'quiz' THEN 
        activity_content := jsonb_build_object(
          'questions', jsonb_build_array(
            jsonb_build_object(
              'question', 'What is ' || course_category || '?',
              'options', jsonb_build_array(
                'A type of food', 
                'A language learning concept', 
                'A country', 
                'A musical instrument'
              ),
              'correctAnswer', 'A language learning concept'
            ),
            jsonb_build_object(
              'question', 'Which level is this quiz designed for?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_level),
              'correctAnswer', course_level
            ),
            jsonb_build_object(
              'question', 'What category does this quiz belong to?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', 'Listening', course_category),
              'correctAnswer', course_category
            )
          )
        );
      WHEN 'fill_blank' THEN 
        activity_content := jsonb_build_object(
          'title', course_level || ' ' || course_category || ' Fill in the Blanks',
          'instructions', 'Fill in the blanks with the correct words related to ' || course_category || '.',
          'sentences', jsonb_build_array(
            jsonb_build_object(
              'id', 's1',
              'text', 'English _____ is important for clear communication.',
              'answer', CASE WHEN course_category = 'Grammar' THEN 'grammar' ELSE 'learning' END
            ),
            jsonb_build_object(
              'id', 's2',
              'text', 'This exercise is designed for _____ level students.',
              'answer', lower(course_level)
            ),
            jsonb_build_object(
              'id', 's3',
              'text', 'Studying _____ helps improve your English skills.',
              'answer', lower(course_category)
            )
          )
        );
      WHEN 'video' THEN 
        activity_content := jsonb_build_object(
          'videoId', CASE 
            WHEN course_level = 'Beginner' THEN 'ydkM1tx5VxA'
            WHEN course_level = 'Intermediate' THEN '_UR-l3QI2nE'
            WHEN course_level = 'Advanced' THEN 'mXMofxtDPUQ'
            ELSE 'dQw4w9WgXcQ'
          END,
          'title', course_level || ' ' || course_category || ' Video Lesson',
          'description', 'Watch this video to learn about ' || course_category || ' at a ' || course_level || ' level.',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'id', 'q1',
              'text', 'What is the main topic of this video?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', course_category, 'Pronunciation'),
              'correct', course_category
            ),
            jsonb_build_object(
              'id', 'q2',
              'text', 'What level is this video designed for?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_level),
              'correct', course_level
            ),
            jsonb_build_object(
              'id', 'q3',
              'text', 'What skill does this video help improve?',
              'options', jsonb_build_array('Speaking', 'Writing', 'Reading', 'Listening'),
              'correct', CASE WHEN course_category = 'Listening' THEN 'Listening' ELSE 'Speaking' END
            )
          )
        );
    END CASE;
    
    -- Insert the activity
    INSERT INTO activities (
      title, 
      description, 
      type, 
      content, 
      image_url, 
      course_id,
      created_at,
      updated_at
    ) VALUES (
      activity_title,
      activity_description,
      activity_type,
      activity_content,
      activity_image,
      course_id,
      NOW() - (i || ' hours')::interval,
      NOW() - (i || ' hours')::interval
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create activities for all courses
DO $$
DECLARE
  course_record RECORD;
BEGIN
  FOR course_record IN SELECT id, level, categories.name as category_name 
                      FROM courses 
                      JOIN categories ON courses.category_id = categories.id
  LOOP
    -- Check if course already has activities
    IF NOT EXISTS (SELECT 1 FROM activities WHERE course_id = course_record.id LIMIT 1) THEN
      PERFORM create_course_activities(
        course_record.id, 
        course_record.level, 
        course_record.category_name
      );
    END IF;
  END LOOP;
END $$;

-- Update all audio URLs to use real audio files
UPDATE activities
SET content = jsonb_set(
  content,
  '{audioUrl}',
  to_jsonb('https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/11/file_example_MP3_700KB.mp3'),
  true
)
WHERE type = 'listening' AND content->>'audioUrl' LIKE 'https://example.com%';

