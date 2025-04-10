-- Add order_index column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Update existing activities with default order based on creation date
UPDATE activities 
SET order_index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY created_at) as row_num 
  FROM activities
) AS subquery
WHERE activities.id = subquery.id;

