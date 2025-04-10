-- Add status column to vocabulary_words table
ALTER TABLE vocabulary_words ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Update all existing words to be published
UPDATE vocabulary_words SET status = 'published' WHERE status IS NULL;

-- Add index on status column for faster queries
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_status ON vocabulary_words(status);

