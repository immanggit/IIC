-- Insert sample categories if they don't exist
INSERT INTO categories (name, description)
VALUES 
  ('Grammar', 'Learn English grammar rules and structures'),
  ('Vocabulary', 'Build your English vocabulary'),
  ('Conversation', 'Practice English conversation skills'),
  ('Reading', 'Improve your English reading skills'),
  ('Listening', 'Enhance your English listening skills')
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (title, description, level, image_url, category_id)
VALUES
  (
    'Beginner English', 
    'A comprehensive course for beginners to learn basic English skills.', 
    'Beginner',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM categories WHERE name = 'Reading')
  ),
  (
    'Animals and Nature', 
    'Learn vocabulary related to animals and nature.', 
    'Beginner',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM categories WHERE name = 'Vocabulary')
  ),
  (
    'Colors and Shapes', 
    'Learn about different colors and shapes in English.', 
    'Beginner',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM categories WHERE name = 'Vocabulary')
  ),
  (
    'Basic Grammar', 
    'Learn the fundamentals of English grammar.', 
    'Intermediate',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM categories WHERE name = 'Grammar')
  ),
  (
    'Everyday Conversations', 
    'Practice common English conversations for daily situations.', 
    'Intermediate',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM categories WHERE name = 'Conversation')
  );

-- Insert sample activities for the Beginner English course
INSERT INTO activities (title, description, type, content, image_url, course_id)
VALUES
  (
    'My First Day at School', 
    'A simple reading activity about the first day at school.', 
    'reading',
    '{"text": "Today is my first day at school. I am very excited. I have a new backpack. It is blue. I have new books and pencils. My teacher is nice. Her name is Ms. Smith. I make new friends. We play games and sing songs. I like my school.", "questions": [{"id": "q1", "text": "What color is the backpack?", "options": ["Red", "Blue", "Green", "Yellow"], "correct": "Blue"}, {"id": "q2", "text": "What is the teacher\'s name?", "options": ["Mrs. Jones", "Mr. Brown", "Ms. Smith", "Mr. Davis"], "correct": "Ms. Smith"}, {"id": "q3", "text": "What do the children do at school?", "options": ["Sleep", "Play games and sing songs", "Watch TV", "Go home"], "correct": "Play games and sing songs"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Beginner English')
  ),
  (
    'Listening to Weather Forecast', 
    'Listen to a simple weather forecast and answer questions.', 
    'listening',
    '{"audioUrl": "https://example.com/sample-audio.mp3", "transcript": "Today, we\'re going to talk about the weather. The weather can be sunny, rainy, cloudy, or snowy. In summer, it\'s usually hot and sunny. In winter, it can be cold and snowy. In spring, it\'s often rainy. In autumn, it can be windy. What\'s the weather like today where you are?", "questions": [{"id": "q1", "text": "What is the topic of this audio?", "options": ["Seasons", "Weather", "Climate Change", "Temperature"], "correct": "Weather"}, {"id": "q2", "text": "What is the weather usually like in summer?", "options": ["Cold and snowy", "Hot and sunny", "Rainy", "Windy"], "correct": "Hot and sunny"}, {"id": "q3", "text": "When is it often rainy?", "options": ["Summer", "Winter", "Spring", "Autumn"], "correct": "Spring"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Beginner English')
  ),
  (
    'Basic English Quiz', 
    'Test your basic English knowledge with this quiz.', 
    'quiz',
    '{"questions": [{"question": "What color is the sky on a clear day?", "options": ["Blue", "Green", "Red", "Yellow"], "correctAnswer": "Blue"}, {"question": "Which animal says \'meow\'?", "options": ["Dog", "Cat", "Cow", "Duck"], "correctAnswer": "Cat"}, {"question": "How many days are in a week?", "options": ["5", "6", "7", "8"], "correctAnswer": "7"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Beginner English')
  ),
  (
    'Fill in the Blanks - Animals', 
    'Complete sentences about animals by filling in the blanks.', 
    'fill_blank',
    '{"title": "Animals and Their Homes", "instructions": "Fill in the blanks with the correct animal names.", "sentences": [{"id": "s1", "text": "A _____ lives in a den.", "answer": "fox"}, {"id": "s2", "text": "A _____ builds a nest in trees.", "answer": "bird"}, {"id": "s3", "text": "A _____ lives in a hive and makes honey.", "answer": "bee"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Beginner English')
  ),
  (
    'Learn Colors with Video', 
    'Watch a video about colors and answer questions.', 
    'video',
    '{"videoId": "dQw4w9WgXcQ", "title": "Learn Colors", "description": "Watch this fun video to learn about different colors!", "questions": [{"id": "q1", "text": "What color is the apple in the video?", "options": ["Red", "Blue", "Green", "Yellow"], "correct": "Red"}, {"id": "q2", "text": "What color is the banana?", "options": ["Red", "Blue", "Green", "Yellow"], "correct": "Yellow"}, {"id": "q3", "text": "What color is the grass?", "options": ["Red", "Blue", "Green", "Yellow"], "correct": "Green"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Beginner English')
  );

-- Insert sample activities for the Animals and Nature course
INSERT INTO activities (title, description, type, content, image_url, course_id)
VALUES
  (
    'Farm Animals', 
    'Learn about different farm animals.', 
    'reading',
    '{"text": "Farm animals are animals that live on a farm. Cows give us milk. Chickens give us eggs. Sheep give us wool. Pigs live in a pen. Horses can run fast. Ducks can swim in the pond. Farmers take care of all these animals.", "questions": [{"id": "q1", "text": "What do cows give us?", "options": ["Wool", "Eggs", "Milk", "Meat"], "correct": "Milk"}, {"id": "q2", "text": "What do chickens give us?", "options": ["Milk", "Eggs", "Wool", "Honey"], "correct": "Eggs"}, {"id": "q3", "text": "Where do ducks swim?", "options": ["River", "Ocean", "Pond", "Lake"], "correct": "Pond"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Animals and Nature')
  ),
  (
    'Wild Animals Quiz', 
    'Test your knowledge about wild animals.', 
    'quiz',
    '{"questions": [{"question": "Which animal is the king of the jungle?", "options": ["Tiger", "Lion", "Elephant", "Giraffe"], "correctAnswer": "Lion"}, {"question": "Which animal has a very long neck?", "options": ["Zebra", "Giraffe", "Elephant", "Hippo"], "correctAnswer": "Giraffe"}, {"question": "Which animal has black and white stripes?", "options": ["Lion", "Tiger", "Zebra", "Panda"], "correctAnswer": "Zebra"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Animals and Nature')
  );

-- Insert sample activities for the Colors and Shapes course
INSERT INTO activities (title, description, type, content, image_url, course_id)
VALUES
  (
    'Basic Colors', 
    'Learn the names of basic colors in English.', 
    'reading',
    '{"text": "Colors are all around us. The sky is blue. Grass is green. Bananas are yellow. Apples can be red or green. Oranges are orange. Grapes can be purple. Strawberries are red. What is your favorite color?", "questions": [{"id": "q1", "text": "What color is the sky?", "options": ["Green", "Blue", "Yellow", "Red"], "correct": "Blue"}, {"id": "q2", "text": "What color are bananas?", "options": ["Red", "Green", "Yellow", "Orange"], "correct": "Yellow"}, {"id": "q3", "text": "What color can apples be?", "options": ["Blue and Yellow", "Red and Green", "Purple and Orange", "Black and White"], "correct": "Red and Green"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Colors and Shapes')
  ),
  (
    'Shapes Around Us', 
    'Learn about different shapes we see every day.', 
    'fill_blank',
    '{"title": "Common Shapes", "instructions": "Fill in the blanks with the correct shape names.", "sentences": [{"id": "s1", "text": "A clock is usually _____.", "answer": "round"}, {"id": "s2", "text": "A book is usually _____.", "answer": "rectangular"}, {"id": "s3", "text": "A slice of pizza is often _____.", "answer": "triangular"}]}',
    '/placeholder.svg?height=200&width=300',
    (SELECT id FROM courses WHERE title = 'Colors and Shapes')
  );

