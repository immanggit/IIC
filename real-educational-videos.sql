-- Update existing video activities with real educational content
UPDATE activities
SET content = jsonb_build_object(
  'videoId', 'ydkM1tx5VxA',
  'title', 'Learn Colors with Animals',
  'description', 'Watch this fun video to learn about different colors and animals!',
  'questions', jsonb_build_array(
    jsonb_build_object(
      'id', 'q1',
      'text', 'What color is the elephant in the video?',
      'options', jsonb_build_array('Gray', 'Blue', 'Pink', 'Green'),
      'correct', 'Gray'
    ),
    jsonb_build_object(
      'id', 'q2',
      'text', 'Which animal is yellow in the video?',
      'options', jsonb_build_array('Lion', 'Giraffe', 'Tiger', 'Monkey'),
      'correct', 'Giraffe'
    ),
    jsonb_build_object(
      'id', 'q3',
      'text', 'What color is the frog?',
      'options', jsonb_build_array('Red', 'Blue', 'Green', 'Orange'),
      'correct', 'Green'
    ),
    jsonb_build_object(
      'id', 'q4',
      'text', 'Which animal is red in the video?',
      'options', jsonb_build_array('Bird', 'Fish', 'Crab', 'Fox'),
      'correct', 'Crab'
    )
  )
)
WHERE type = 'video' AND title = 'Learn Colors with Video';

-- Insert new video activities with real educational content
INSERT INTO activities (title, description, type, content, image_url, course_id)
VALUES
(
  'Learn the Alphabet Song', 
  'Watch this fun video to learn the English alphabet with a catchy song!', 
  'video',
  jsonb_build_object(
    'videoId', '_UR-l3QI2nE',
    'title', 'ABC Song | Learn the Alphabet',
    'description', 'A fun and catchy song to help children learn the English alphabet.',
    'questions', jsonb_build_array(
      jsonb_build_object(
        'id', 'q1',
        'text', 'How many letters are in the English alphabet?',
        'options', jsonb_build_array('24', '25', '26', '27'),
        'correct', '26'
      ),
      jsonb_build_object(
        'id', 'q2',
        'text', 'Which letter comes after P in the alphabet?',
        'options', jsonb_build_array('O', 'Q', 'R', 'S'),
        'correct', 'Q'
      ),
      jsonb_build_object(
        'id', 'q3',
        'text', 'Which of these is a vowel?',
        'options', jsonb_build_array('B', 'C', 'D', 'E'),
        'correct', 'E'
      ),
      jsonb_build_object(
        'id', 'q4',
        'text', 'What is the last letter of the alphabet?',
        'options', jsonb_build_array('X', 'Y', 'Z', 'W'),
        'correct', 'Z'
      )
    )
  ),
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM courses WHERE title = 'Beginner English')
),
(
  'Learn Numbers 1-10', 
  'Watch this educational video to learn numbers from 1 to 10 in English.', 
  'video',
  jsonb_build_object(
    'videoId', 'DR-cfDsHCGA',
    'title', 'Learn Numbers 1 to 10',
    'description', 'A fun video to help children learn numbers from 1 to 10 in English.',
    'questions', jsonb_build_array(
      jsonb_build_object(
        'id', 'q1',
        'text', 'What number comes after 7?',
        'options', jsonb_build_array('6', '8', '9', '10'),
        'correct', '8'
      ),
      jsonb_build_object(
        'id', 'q2',
        'text', 'How many fingers do you see when counting to 5?',
        'options', jsonb_build_array('3', '4', '5', '6'),
        'correct', '5'
      ),
      jsonb_build_object(
        'id', 'q3',
        'text', 'What is the number before 10?',
        'options', jsonb_build_array('8', '9', '11', '12'),
        'correct', '9'
      ),
      jsonb_build_object(
        'id', 'q4',
        'text', 'Which number is the smallest?',
        'options', jsonb_build_array('1', '2', '3', '4'),
        'correct', '1'
      )
    )
  ),
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM courses WHERE title = 'Beginner English')
),
(
  'Learn Days of the Week', 
  'Watch this video to learn the days of the week in English.', 
  'video',
  jsonb_build_object(
    'videoId', 'mXMofxtDPUQ',
    'title', 'Days of the Week Song',
    'description', 'A catchy song to help children learn the days of the week in English.',
    'questions', jsonb_build_array(
      jsonb_build_object(
        'id', 'q1',
        'text', 'How many days are in a week?',
        'options', jsonb_build_array('5', '6', '7', '8'),
        'correct', '7'
      ),
      jsonb_build_object(
        'id', 'q2',
        'text', 'Which day comes after Tuesday?',
        'options', jsonb_build_array('Monday', 'Wednesday', 'Thursday', 'Friday'),
        'correct', 'Wednesday'
      ),
      jsonb_build_object(
        'id', 'q3',
        'text', 'Which day is the first day of the week?',
        'options', jsonb_build_array('Monday', 'Sunday', 'Saturday', 'Friday'),
        'correct', 'Sunday'
      ),
      jsonb_build_object(
        'id', 'q4',
        'text', 'Which days are on the weekend?',
        'options', jsonb_build_array('Monday and Tuesday', 'Wednesday and Thursday', 'Friday and Saturday', 'Saturday and Sunday'),
        'correct', 'Saturday and Sunday'
      )
    )
  ),
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM courses WHERE title = 'Beginner English')
),
(
  'Learn Animal Sounds', 
  'Watch this fun video to learn what sounds different animals make in English.', 
  'video',
  jsonb_build_object(
    'videoId', 'hewioIU4a64',
    'title', 'Animal Sounds Song',
    'description', 'Learn what sounds different animals make in English with this fun song.',
    'questions', jsonb_build_array(
      jsonb_build_object(
        'id', 'q1',
        'text', 'What sound does a dog make?',
        'options', jsonb_build_array('Meow', 'Woof', 'Moo', 'Quack'),
        'correct', 'Woof'
      ),
      jsonb_build_object(
        'id', 'q2',
        'text', 'What sound does a cat make?',
        'options', jsonb_build_array('Meow', 'Woof', 'Moo', 'Quack'),
        'correct', 'Meow'
      ),
      jsonb_build_object(
        'id', 'q3',
        'text', 'What sound does a cow make?',
        'options', jsonb_build_array('Meow', 'Woof', 'Moo', 'Quack'),
        'correct', 'Moo'
      ),
      jsonb_build_object(
        'id', 'q4',
        'text', 'What sound does a duck make?',
        'options', jsonb_build_array('Meow', 'Woof', 'Moo', 'Quack'),
        'correct', 'Quack'
      )
    )
  ),
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM courses WHERE title = 'Animals and Nature')
);

