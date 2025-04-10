-- Add new activity types to any relevant enums or reference tables if needed
-- If we're just using string values in the 'type' column, no schema changes are needed
-- But we'll create a new course about Animals with these activity types

-- Create a new course about Animals
INSERT INTO courses (title, description, level, image_url, category_id, status)
VALUES
(
'English for Animal Vocabulary', 
'Learn animal names, habitats, and characteristics in English with interactive activities.',
'Beginner',
'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=3472&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Vocabulary'),
'published'
)
RETURNING id INTO @animals_course_id;

-- Get the ID of the newly inserted course
DO $$
DECLARE
    animals_course_id UUID;
BEGIN
    -- Get the course ID
    SELECT id INTO animals_course_id FROM courses WHERE title = 'English for Animal Vocabulary';
    
    -- 1. Drag and Drop Activity
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id,
        status,
        order_index
    ) VALUES (
        'Farm Animals - Drag and Drop', 
        'Match English animal names with their pictures by dragging and dropping.', 
        'drag_drop',
        jsonb_build_object(
            'title', 'Farm Animals Vocabulary',
            'instructions', 'Drag the animal names and drop them on the matching pictures.',
            'pairs', jsonb_build_array(
                jsonb_build_object(
                    'id', 'p1',
                    'term', 'Cow',
                    'match', 'A large domesticated animal that gives milk',
                    'image', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=3540&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p2',
                    'term', 'Horse',
                    'match', 'A large animal used for riding and racing',
                    'image', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=3471&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p3',
                    'term', 'Pig',
                    'match', 'A pink farm animal with a curly tail',
                    'image', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=3473&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p4',
                    'term', 'Chicken',
                    'match', 'A bird kept for its eggs and meat',
                    'image', 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?q=80&w=3540&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p5',
                    'term', 'Sheep',
                    'match', 'A farm animal kept for its wool and meat',
                    'image', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?q=80&w=3473&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p6',
                    'term', 'Goat',
                    'match', 'A farm animal with horns that gives milk',
                    'image', 'https://images.unsplash.com/photo-1524024973431-2ad916746881?q=80&w=3540&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p7',
                    'term', 'Duck',
                    'match', 'A water bird with webbed feet',
                    'image', 'https://images.unsplash.com/photo-1555852095-64e7428df0fa?q=80&w=3540&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p8',
                    'term', 'Rabbit',
                    'match', 'A small animal with long ears',
                    'image', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=3474&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p9',
                    'term', 'Turkey',
                    'match', 'A large bird with a fan-shaped tail',
                    'image', 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=3087&auto=format&fit=crop'
                ),
                jsonb_build_object(
                    'id', 'p10',
                    'term', 'Donkey',
                    'match', 'A domesticated animal similar to a horse but smaller',
                    'image', 'https://images.unsplash.com/photo-1598974357809-112c788e7f2e?q=80&w=3474&auto=format&fit=crop'
                )
            )
        ),
        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=3474&auto=format&fit=crop',
        animals_course_id,
        'published',
        1
    );
    
    -- 2. Match the Words with Line Activity
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id,
        status,
        order_index
    ) VALUES (
        'Wild Animals - Match with Lines', 
        'Connect English animal names with their descriptions by drawing lines between matching pairs.', 
        'match_lines',
        jsonb_build_object(
            'title', 'Wild Animals Vocabulary',
            'instructions', 'Click on a word and then click on its matching description to draw a line between them.',
            'pairs', jsonb_build_array(
                jsonb_build_object(
                    'id', 'p1',
                    'term', 'Lion',
                    'match', 'The king of the jungle with a mane'
                ),
                jsonb_build_object(
                    'id', 'p2',
                    'term', 'Elephant',
                    'match', 'A large animal with a trunk and tusks'
                ),
                jsonb_build_object(
                    'id', 'p3',
                    'term', 'Giraffe',
                    'match', 'An animal with a very long neck'
                ),
                jsonb_build_object(
                    'id', 'p4',
                    'term', 'Tiger',
                    'match', 'A large wild cat with orange and black stripes'
                ),
                jsonb_build_object(
                    'id', 'p5',
                    'term', 'Zebra',
                    'match', 'An animal with black and white stripes'
                ),
                jsonb_build_object(
                    'id', 'p6',
                    'term', 'Monkey',
                    'match', 'A climbing animal that lives in trees'
                ),
                jsonb_build_object(
                    'id', 'p7',
                    'term', 'Kangaroo',
                    'match', 'An animal that carries its baby in a pouch'
                ),
                jsonb_build_object(
                    'id', 'p8',
                    'term', 'Rhinoceros',
                    'match', 'A large animal with thick skin and a horn'
                ),
                jsonb_build_object(
                    'id', 'p9',
                    'term', 'Hippopotamus',
                    'match', 'A large animal that spends time in water'
                ),
                jsonb_build_object(
                    'id', 'p10',
                    'term', 'Crocodile',
                    'match', 'A large reptile with sharp teeth'
                )
            )
        ),
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef3?q=80&w=3472&auto=format&fit=crop',
        animals_course_id,
        'published',
        2
    );
    
    -- 3. Flip Card Match Words Activity
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id,
        status,
        order_index
    ) VALUES (
        'Sea Animals - Flip Card Match', 
        'Find matching pairs of sea animal names and their descriptions by flipping cards.', 
        'flip_cards',
        jsonb_build_object(
            'title', 'Sea Animals Vocabulary',
            'instructions', 'Flip cards to find matching pairs of animal names and their descriptions.',
            'pairs', jsonb_build_array(
                jsonb_build_object(
                    'id', 'p1',
                    'term', 'Shark',
                    'match', 'A large fish with sharp teeth'
                ),
                jsonb_build_object(
                    'id', 'p2',
                    'term', 'Whale',
                    'match', 'The largest mammal in the ocean'
                ),
                jsonb_build_object(
                    'id', 'p3',
                    'term', 'Dolphin',
                    'match', 'An intelligent marine mammal that can jump'
                ),
                jsonb_build_object(
                    'id', 'p4',
                    'term', 'Octopus',
                    'match', 'A sea animal with eight arms'
                ),
                jsonb_build_object(
                    'id', 'p5',
                    'term', 'Jellyfish',
                    'match', 'A transparent sea animal that can sting'
                ),
                jsonb_build_object(
                    'id', 'p6',
                    'term', 'Crab',
                    'match', 'A sea animal with a hard shell and claws'
                ),
                jsonb_build_object(
                    'id', 'p7',
                    'term', 'Starfish',
                    'match', 'A sea animal shaped like a star'
                ),
                jsonb_build_object(
                    'id', 'p8',
                    'term', 'Seal',
                    'match', 'A marine mammal that can swim and live on land'
                ),
                jsonb_build_object(
                    'id', 'p9',
                    'term', 'Turtle',
                    'match', 'A reptile with a shell that lives in water'
                ),
                jsonb_build_object(
                    'id', 'p10',
                    'term', 'Seahorse',
                    'match', 'A small fish with a head like a horse'
                )
            )
        ),
        'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=3540&auto=format&fit=crop',
        animals_course_id,
        'published',
        3
    );
END;
$$;

