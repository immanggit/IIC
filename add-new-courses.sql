-- Add new courses with real images
INSERT INTO courses (title, description, level, image_url, category_id)
VALUES
(
  'Everyday English Phrases', 
  'Learn common English phrases used in daily conversations and situations.', 
  'Beginner',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=3542&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),
(
  'English for Travel', 
  'Essential English vocabulary and phrases for traveling abroad.', 
  'Beginner',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),
(
  'Food and Cooking Vocabulary', 
  'Learn English vocabulary related to food, cooking, and dining.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),
(
  'Technology and Internet Terms', 
  'Modern vocabulary for discussing technology, computers, and the internet.', 
  'Advanced',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
);

-- Create activities for the new courses
DO $$
DECLARE
  course_record RECORD;
BEGIN
  FOR course_record IN SELECT id, level, categories.name as category_name 
                      FROM courses 
                      JOIN categories ON courses.category_id = categories.id
                      WHERE courses.title IN (
                        'Everyday English Phrases',
                        'English for Travel',
                        'Food and Cooking Vocabulary',
                        'Technology and Internet Terms'
                      )
  LOOP
    -- Check if course already has activities
    IF NOT EXISTS (SELECT 1 FROM activities WHERE course_id = course_record.id LIMIT 1) THEN
      -- Create reading activity
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
        course_record.level || ' Reading: ' || course_record.title,
        'A reading activity about ' || course_record.title || ' for ' || course_record.level || ' level students.',
        'reading',
        jsonb_build_object(
          'text', 'This is a reading passage about ' || course_record.title || '. The content is designed to help ' || course_record.level || ' level students improve their reading skills while learning about this topic.',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'id', 'q1',
              'text', 'What is the main topic of this passage?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', course_record.title, 'Pronunciation'),
              'correct', course_record.title
            ),
            jsonb_build_object(
              'id', 'q2',
              'text', 'What level is this reading passage?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_record.level),
              'correct', course_record.level
            ),
            jsonb_build_object(
              'id', 'q3',
              'text', 'What skill does this passage help improve?',
              'options', jsonb_build_array('Speaking', 'Writing', 'Reading', 'Listening'),
              'correct', 'Reading'
            )
          )
        ),
        'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=3540&auto=format&fit=crop',
        course_record.id,
        NOW(),
        NOW()
      );
      
      -- Create listening activity
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
        course_record.level || ' Listening: ' || course_record.title,
        'A listening activity about ' || course_record.title || ' for ' || course_record.level || ' level students.',
        'listening',
        jsonb_build_object(
          'audioUrl', 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/11/file_example_MP3_700KB.mp3',
          'transcript', 'This is a listening exercise about ' || course_record.title || '. The content is designed to help ' || course_record.level || ' level students improve their listening skills while learning about this topic.',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'id', 'q1',
              'text', 'What is the main topic of this audio?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', course_record.title, 'Pronunciation'),
              'correct', course_record.title
            ),
            jsonb_build_object(
              'id', 'q2',
              'text', 'What level is this listening exercise?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_record.level),
              'correct', course_record.level
            ),
            jsonb_build_object(
              'id', 'q3',
              'text', 'What skill does this exercise help improve?',
              'options', jsonb_build_array('Speaking', 'Writing', 'Reading', 'Listening'),
              'correct', 'Listening'
            )
          )
        ),
        'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?q=80&w=3474&auto=format&fit=crop',
        course_record.id,
        NOW(),
        NOW()
      );
      
      -- Create quiz activity
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
        course_record.level || ' Quiz: ' || course_record.title,
        'A quiz about ' || course_record.title || ' for ' || course_record.level || ' level students.',
        'quiz',
        jsonb_build_object(
          'questions', jsonb_build_array(
            jsonb_build_object(
              'question', 'What is ' || course_record.title || ' about?',
              'options', jsonb_build_array(
                'A type of food', 
                'An English learning topic', 
                'A country', 
                'A musical instrument'
              ),
              'correctAnswer', 'An English learning topic'
            ),
            jsonb_build_object(
              'question', 'Which level is this quiz designed for?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_record.level),
              'correctAnswer', course_record.level
            ),
            jsonb_build_object(
              'question', 'What category does this quiz belong to?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', 'Listening', course_record.category_name),
              'correctAnswer', course_record.category_name
            )
          )
        ),
        'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=3540&auto=format&fit=crop',
        course_record.id,
        NOW(),
        NOW()
      );
      
      -- Create fill in the blanks activity
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
        course_record.level || ' Fill in the Blanks: ' || course_record.title,
        'A fill in the blanks activity about ' || course_record.title || ' for ' || course_record.level || ' level students.',
        'fill_blank',
        jsonb_build_object(
          'title', course_record.level || ' ' || course_record.title || ' Fill in the Blanks',
          'instructions', 'Fill in the blanks with the correct words related to ' || course_record.title || '.',
          'sentences', jsonb_build_array(
            jsonb_build_object(
              'id', 's1',
              'text', 'Learning about ' || course_record.title || ' is _____ for English students.',
              'answer', 'important'
            ),
            jsonb_build_object(
              'id', 's2',
              'text', 'This exercise is designed for _____ level students.',
              'answer', lower(course_record.level)
            ),
            jsonb_build_object(
              'id', 's3',
              'text', 'Studying ' || course_record.category_name || ' helps improve your _____ skills.',
              'answer', 'language'
            )
          )
        ),
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=3422&auto=format&fit=crop',
        course_record.id,
        NOW(),
        NOW()
      );
      
      -- Create video activity
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
        course_record.level || ' Video: ' || course_record.title,
        'A video activity about ' || course_record.title || ' for ' || course_record.level || ' level students.',
        'video',
        jsonb_build_object(
          'videoId', CASE 
            WHEN course_record.level = 'Beginner' THEN 'ydkM1tx5VxA'
            WHEN course_record.level = 'Intermediate' THEN '_UR-l3QI2nE'
            WHEN course_record.level = 'Advanced' THEN 'mXMofxtDPUQ'
            ELSE 'dQw4w9WgXcQ'
          END,
          'title', course_record.level || ' ' || course_record.title || ' Video Lesson',
          'description', 'Watch this video to learn about ' || course_record.title || ' at a ' || course_record.level || ' level.',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'id', 'q1',
              'text', 'What is the main topic of this video?',
              'options', jsonb_build_array('Grammar', 'Vocabulary', course_record.title, 'Pronunciation'),
              'correct', course_record.title
            ),
            jsonb_build_object(
              'id', 'q2',
              'text', 'What level is this video designed for?',
              'options', jsonb_build_array('Beginner', 'Intermediate', 'Advanced', course_record.level),
              'correct', course_record.level
            ),
            jsonb_build_object(
              'id', 'q3',
              'text', 'What skill does this video help improve?',
              'options', jsonb_build_array('Speaking', 'Writing', 'Reading', 'Listening'),
              'correct', 'Speaking'
            )
          )
        ),
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=3474&auto=format&fit=crop',
        course_record.id,
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
END $$;

