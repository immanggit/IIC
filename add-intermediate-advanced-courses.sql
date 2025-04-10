-- Add intermediate courses (3 for each category)
INSERT INTO courses (title, description, level, image_url, category_id)
VALUES
-- Grammar category
(
  'Intermediate Grammar', 
  'Master English grammar with this comprehensive intermediate course covering tenses, conditionals, and more.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=3546&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Grammar')
),
(
  'Verb Tenses Mastery', 
  'A focused course on mastering all English verb tenses with practical exercises and examples.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=3422&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Grammar')
),
(
  'English Sentence Structure', 
  'Learn how to construct complex and compound sentences in English with proper structure.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Grammar')
),

-- Vocabulary category
(
  'Business English Vocabulary', 
  'Essential vocabulary for business meetings, emails, presentations, and professional communication.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),
(
  'Academic Vocabulary', 
  'Build your academic vocabulary for essays, research papers, and scholarly discussions.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),
(
  'Idioms and Expressions', 
  'Learn common English idioms and expressions used in everyday conversations.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=3542&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),

-- Conversation category
(
  'Social English', 
  'Improve your conversational skills for social situations like parties, casual meetings, and making friends.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),
(
  'Travel Conversations', 
  'Essential conversation skills for traveling abroad, including airport, hotel, restaurant, and sightseeing scenarios.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),
(
  'Phone and Video Call Skills', 
  'Master the art of English phone and video call conversations for personal and professional contexts.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),

-- Reading category
(
  'Short Stories', 
  'Improve reading comprehension with engaging short stories and follow-up exercises.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Reading')
),
(
  'News Articles', 
  'Practice reading and understanding news articles on various topics.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Reading')
),
(
  'Blog Posts and Essays', 
  'Enhance your reading skills with modern blog posts and essays on contemporary topics.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Reading')
),

-- Listening category
(
  'Podcasts and Interviews', 
  'Improve listening skills with authentic podcasts and interviews on various topics.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=3539&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Listening')
),
(
  'Movie and TV Show Clips', 
  'Enhance listening comprehension with clips from popular movies and TV shows.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Listening')
),
(
  'TED Talks', 
  'Practice listening to educational TED Talks on various interesting topics.', 
  'Intermediate',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Listening')
);

-- Add advanced courses (3 for each category)
INSERT INTO courses (title, description, level, image_url, category_id)
VALUES
-- Grammar category
(
  'Advanced Grammar', 
  'Master complex grammar structures including subjunctive mood, inversion, and advanced conditionals.', 
  'Advanced',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Grammar')
),
(
  'Academic Writing Grammar', 
  'Learn the grammar rules essential for academic writing, research papers, and scholarly articles.', 
  'Advanced',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Grammar')
),
(
  'Grammar for Professional Writing', 
  'Perfect your grammar for business reports, proposals, and professional correspondence.', 
  'Advanced',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Grammar')
),

-- Vocabulary category
(
  'Advanced Academic Vocabulary', 
  'Expand your academic vocabulary for university-level writing and research.', 
  'Advanced',
  'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),
(
  'Technical and Scientific Vocabulary', 
  'Learn specialized vocabulary for technical fields, science, and research.', 
  'Advanced',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),
(
  'Literary and Poetic Language', 
  'Explore advanced vocabulary used in literature, poetry, and creative writing.', 
  'Advanced',
  'https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Vocabulary')
),

-- Conversation category
(
  'Professional Negotiations', 
  'Master the language of business negotiations, conflict resolution, and professional discussions.', 
  'Advanced',
  'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),
(
  'Academic Discussions and Debates', 
  'Develop skills for participating in academic discussions, seminars, and formal debates.', 
  'Advanced',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),
(
  'Public Speaking and Presentations', 
  'Perfect your public speaking skills for presentations, speeches, and conferences.', 
  'Advanced',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Conversation')
),

-- Reading category
(
  'Classic Literature', 
  'Explore classic English literature with guided reading and analysis.', 
  'Advanced',
  'https://images.unsplash.com/photo-1519682577862-22b62b24e493?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Reading')
),
(
  'Scientific and Academic Papers', 
  'Practice reading and understanding scientific research papers and academic articles.', 
  'Advanced',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Reading')
),
(
  'Legal and Business Documents', 
  'Learn to read and comprehend legal contracts, business reports, and professional documents.', 
  'Advanced',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Reading')
),

-- Listening category
(
  'Academic Lectures', 
  'Improve listening comprehension with university-level lectures on various subjects.', 
  'Advanced',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Listening')
),
(
  'Native Speaker Conversations', 
  'Practice understanding fast-paced conversations between native English speakers with different accents.', 
  'Advanced',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Listening')
),
(
  'Specialized Podcasts', 
  'Listen to specialized podcasts on technical, scientific, and academic topics.', 
  'Advanced',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=3540&auto=format&fit=crop',
  (SELECT id FROM categories WHERE name = 'Listening')
);

-- Update vocabulary words to include image and audio URLs
ALTER TABLE vocabulary_words 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Update existing vocabulary words with image and audio URLs
UPDATE vocabulary_words
SET 
  image_url = 'https://images.unsplash.com/photo-' || (1500000000 + (id::text)::integer % 999999999) || '?q=80&w=400&auto=format&fit=crop',
  audio_url = 'https://example.com/audio/' || word || '.mp3'
WHERE image_url IS NULL OR audio_url IS NULL;

-- Insert some vocabulary words with image and audio URLs
INSERT INTO vocabulary_words (word, definition, phonetic, example, image_url, audio_url, level, category_id)
VALUES
(
  'Serendipity',
  'The occurrence and development of events by chance in a happy or beneficial way',
  '/ˌserənˈdɪpɪti/',
  'Finding that rare book was pure serendipity.',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=400&auto=format&fit=crop',
  'https://example.com/audio/serendipity.mp3',
  'Advanced',
  (SELECT id FROM vocabulary_categories WHERE name = 'General')
),
(
  'Eloquent',
  'Fluent or persuasive in speaking or writing',
  '/ˈɛləkwənt/',
  'She gave an eloquent speech at the conference.',
  'https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=400&auto=format&fit=crop',
  'https://example.com/audio/eloquent.mp3',
  'Advanced',
  (SELECT id FROM vocabulary_categories WHERE name = 'General')
),
(
  'Perseverance',
  'Persistence in doing something despite difficulty or delay in achieving success',
  '/ˌpɜːsɪˈvɪərəns/',
  'His perseverance was rewarded when he finally got the job.',
  'https://images.unsplash.com/photo-1519834089823-af2d966a0648?q=80&w=400&auto=format&fit=crop',
  'https://example.com/audio/perseverance.mp3',
  'Intermediate',
  (SELECT id FROM vocabulary_categories WHERE name = 'General')
);

