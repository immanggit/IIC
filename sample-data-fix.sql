-- Update the listening activity to have a valid audio URL or remove it
UPDATE activities 
SET content = jsonb_set(
  content, 
  '{audioUrl}', 
  '"https://example.com/sample-audio.mp3"'::jsonb
) 
WHERE type = 'listening';

-- Update the video activity to have a valid video ID
UPDATE activities 
SET content = jsonb_set(
  content, 
  '{videoId}', 
  '"dQw4w9WgXcQ"'::jsonb
) 
WHERE type = 'video';

-- Make sure all activities have properly structured content
UPDATE activities
SET content = '{}'::jsonb
WHERE content IS NULL;

