-- Add a comprehensive tenses course
INSERT INTO courses (title, description, level, image_url, category_id)
VALUES
(
'All Types of English Tenses', 
'A comprehensive course covering all English tenses including present, past, future, perfect, and continuous forms.', 
'Intermediate',
'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=3540&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Grammar')
);

-- Get the ID of the newly inserted course
DO $$
DECLARE
    tenses_course_id UUID;
BEGIN
    -- Get the course ID
    SELECT id INTO tenses_course_id FROM courses WHERE title = 'All Types of English Tenses';
    
    -- Add 10 activities for the tenses course
    
    -- 1. Present Simple Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Present Simple Tense', 
        'Learn how to use the Present Simple tense for facts, habits, and routines.', 
        'reading',
        jsonb_build_object(
            'text', 'The Present Simple tense is used to talk about facts, habits, and routines. We form it using the base form of the verb for I, you, we, they (e.g., I work) and adding -s or -es for he, she, it (e.g., She works). For negative sentences, we use do not/don''t or does not/doesn''t + base form (e.g., I don''t work, She doesn''t work). For questions, we use do/does + subject + base form (e.g., Do you work? Does she work?). We use the Present Simple for: permanent situations (I live in London), facts (The Earth revolves around the Sun), habits (I play tennis every weekend), and schedules (The train leaves at 6 PM).',
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'id', 'q1',
                    'text', 'What form of the verb do we use with "he, she, it" in Present Simple?',
                    'options', jsonb_build_array('Base form', 'Base form + s/es', 'Base form + ing', 'Past participle'),
                    'correct', 'Base form + s/es'
                ),
                jsonb_build_object(
                    'id', 'q2',
                    'text', 'Which of these sentences is in Present Simple?',
                    'options', jsonb_build_array('They are working now', 'They work every day', 'They have worked here', 'They worked yesterday'),
                    'correct', 'They work every day'
                ),
                jsonb_build_object(
                    'id', 'q3',
                    'text', 'Which auxiliary verb is used for questions in Present Simple with "I"?',
                    'options', jsonb_build_array('Do', 'Does', 'Am', 'Have'),
                    'correct', 'Do'
                ),
                jsonb_build_object(
                    'id', 'q4',
                    'text', 'Which is NOT a typical use of Present Simple?',
                    'options', jsonb_build_array('Facts', 'Habits', 'Actions happening now', 'Schedules'),
                    'correct', 'Actions happening now'
                )
            )
        ),
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=3542&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 2. Present Continuous Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Present Continuous Tense', 
        'Learn how to use the Present Continuous tense for actions happening now.', 
        'quiz',
        jsonb_build_object(
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'question', 'How do we form the Present Continuous tense?',
                    'options', jsonb_build_array(
                        'subject + base form', 
                        'subject + am/is/are + verb-ing', 
                        'subject + has/have + past participle', 
                        'subject + will + base form'
                    ),
                    'correctAnswer', 'subject + am/is/are + verb-ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in the Present Continuous tense?',
                    'options', jsonb_build_array(
                        'She works in a bank', 
                        'She is working in a bank', 
                        'She has worked in a bank', 
                        'She worked in a bank'
                    ),
                    'correctAnswer', 'She is working in a bank'
                ),
                jsonb_build_object(
                    'question', 'Which verb form do we use in Present Continuous?',
                    'options', jsonb_build_array(
                        'Base form', 
                        'Past simple', 
                        'Past participle', 
                        'Present participle (verb + ing)'
                    ),
                    'correctAnswer', 'Present participle (verb + ing)'
                ),
                jsonb_build_object(
                    'question', 'What is the Present Continuous of "I read"?',
                    'options', jsonb_build_array(
                        'I reading', 
                        'I am reading', 
                        'I is reading', 
                        'I are reading'
                    ),
                    'correctAnswer', 'I am reading'
                ),
                jsonb_build_object(
                    'question', 'Which of these is NOT a typical use of Present Continuous?',
                    'options', jsonb_build_array(
                        'Temporary actions', 
                        'Actions happening at the moment of speaking', 
                        'Permanent situations', 
                        'Future arrangements'
                    ),
                    'correctAnswer', 'Permanent situations'
                )
            )
        ),
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 3. Past Simple Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Past Simple Tense', 
        'Learn how to use the Past Simple tense for completed actions in the past.', 
        'fill_blank',
        jsonb_build_object(
            'title', 'Past Simple Tense Practice',
            'instructions', 'Fill in the blanks with the correct past simple form of the verbs in brackets.',
            'sentences', jsonb_build_array(
                jsonb_build_object(
                    'id', 's1',
                    'text', 'Last year, we _____ (go) to France for our vacation.',
                    'answer', 'went'
                ),
                jsonb_build_object(
                    'id', 's2',
                    'text', 'She _____ (study) English at university for three years.',
                    'answer', 'studied'
                ),
                jsonb_build_object(
                    'id', 's3',
                    'text', 'They _____ (not/come) to the party yesterday.',
                    'answer', 'didn\'t come'
                ),
                jsonb_build_object(
                    'id', 's4',
                    'text', '_____ (you/visit) London when you were in England?',
                    'answer', 'Did you visit'
                ),
                jsonb_build_object(
                    'id', 's5',
                    'text', 'I _____ (buy) a new car last month.',
                    'answer', 'bought'
                )
            )
        ),
        'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 4. Past Continuous Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Past Continuous Tense', 
        'Learn how to use the Past Continuous tense for actions in progress in the past.', 
        'reading',
        jsonb_build_object(
            'text', 'The Past Continuous tense (also called Past Progressive) is used to talk about actions or situations that were in progress at a specific time in the past. We form it using was/were + verb-ing. Use "was" with I, he, she, it and "were" with you, we, they. For example: "I was reading when you called." We use Past Continuous for: actions in progress at a specific time in the past (At 8 PM yesterday, I was having dinner), actions in progress when another action interrupted (I was watching TV when the phone rang), two actions in progress at the same time (While I was cooking, my wife was setting the table), and to describe the background in a story (It was raining, and the wind was blowing strongly).',
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'id', 'q1',
                    'text', 'How do we form Past Continuous?',
                    'options', jsonb_build_array('subject + was/were + base form', 'subject + was/were + verb-ing', 'subject + has/have + verb-ing', 'subject + did + verb-ing'),
                    'correct', 'subject + was/were + verb-ing'
                ),
                jsonb_build_object(
                    'id', 'q2',
                    'text', 'Which sentence uses Past Continuous correctly?',
                    'options', jsonb_build_array('They were watch a movie', 'They was watching a movie', 'They were watching a movie', 'They watched a movie'),
                    'correct', 'They were watching a movie'
                ),
                jsonb_build_object(
                    'id', 'q3',
                    'text', 'Which auxiliary verb is used with "she" in Past Continuous?',
                    'options', jsonb_build_array('Am', 'Is', 'Was', 'Were'),
                    'correct', 'Was'
                ),
                jsonb_build_object(
                    'id', 'q4',
                    'text', 'Which is NOT a typical use of Past Continuous?',
                    'options', jsonb_build_array('Actions in progress at a specific time', 'Completed actions in the past', 'Background descriptions in stories', 'Two parallel actions in the past'),
                    'correct', 'Completed actions in the past'
                )
            )
        ),
        'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 5. Present Perfect Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Present Perfect Tense', 
        'Learn how to use the Present Perfect tense for linking the past and present.', 
        'video',
        jsonb_build_object(
            'videoId', 'C2JdKk9Rrjs',
            'title', 'Present Perfect Tense',
            'description', 'Watch this video to learn about the Present Perfect tense and when to use it.',
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'id', 'q1',
                    'text', 'How do we form the Present Perfect tense?',
                    'options', jsonb_build_array('subject + has/have + base form', 'subject + has/have + past participle', 'subject + am/is/are + verb-ing', 'subject + did + base form'),
                    'correct', 'subject + has/have + past participle'
                ),
                jsonb_build_object(
                    'id', 'q2',
                    'text', 'Which sentence uses Present Perfect correctly?',
                    'options', jsonb_build_array('I have went to Paris', 'I have gone to Paris', 'I have going to Paris', 'I have go to Paris'),
                    'correct', 'I have gone to Paris'
                ),
                jsonb_build_object(
                    'id', 'q3',
                    'text', 'Which of these time expressions is often used with Present Perfect?',
                    'options', jsonb_build_array('Yesterday', 'Last week', 'Since 2010', 'Two days ago'),
                    'correct', 'Since 2010'
                ),
                jsonb_build_object(
                    'id', 'q4',
                    'text', 'Which usage is NOT typical for Present Perfect?',
                    'options', jsonb_build_array('Experiences in life', 'Actions in the past with results in the present', 'Specific completed actions at a specific time', 'Unfinished time periods'),
                    'correct', 'Specific completed actions at a specific time'
                )
            )
        ),
        'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 6. Present Perfect Continuous Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Present Perfect Continuous Tense', 
        'Learn how to use the Present Perfect Continuous tense for ongoing actions that started in the past.', 
        'quiz',
        jsonb_build_object(
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'question', 'How do we form the Present Perfect Continuous tense?',
                    'options', jsonb_build_array(
                        'subject + has/have + been + verb-ing', 
                        'subject + has/have + verb-ing', 
                        'subject + has/have + past participle', 
                        'subject + am/is/are + verb-ing'
                    ),
                    'correctAnswer', 'subject + has/have + been + verb-ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in the Present Perfect Continuous?',
                    'options', jsonb_build_array(
                        'She has worked here for five years', 
                        'She has been working here for five years', 
                        'She worked here for five years', 
                        'She was working here for five years'
                    ),
                    'correctAnswer', 'She has been working here for five years'
                ),
                jsonb_build_object(
                    'question', 'What aspect of an action does Present Perfect Continuous emphasize?',
                    'options', jsonb_build_array(
                        'The completion of the action', 
                        'The duration or continuous nature of the action', 
                        'The exact time the action happened', 
                        'The future implications of the action'
                    ),
                    'correctAnswer', 'The duration or continuous nature of the action'
                ),
                jsonb_build_object(
                    'question', 'Which of these is a typical use of Present Perfect Continuous?',
                    'options', jsonb_build_array(
                        'Completed actions in the past', 
                        'Single actions at a specific time', 
                        'Actions that started in the past and continue to the present', 
                        'Future plans'
                    ),
                    'correctAnswer', 'Actions that started in the past and continue to the present'
                ),
                jsonb_build_object(
                    'question', 'Which time expressions are commonly used with Present Perfect Continuous?',
                    'options', jsonb_build_array(
                        'Yesterday, last week', 
                        'Tomorrow, next week', 
                        'For, since', 
                        'At 7pm, on Monday'
                    ),
                    'correctAnswer', 'For, since'
                )
            )
        ),
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 7. Past Perfect Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Past Perfect Tense', 
        'Learn how to use the Past Perfect tense for actions completed before another past event.', 
        'fill_blank',
        jsonb_build_object(
            'title', 'Past Perfect Tense Practice',
            'instructions', 'Fill in the blanks with the correct past perfect form of the verbs in brackets.',
            'sentences', jsonb_build_array(
                jsonb_build_object(
                    'id', 's1',
                    'text', 'By the time we arrived, the movie _____ (already/start).',
                    'answer', 'had already started'
                ),
                jsonb_build_object(
                    'id', 's2',
                    'text', 'She _____ (never/see) snow before she moved to Canada.',
                    'answer', 'had never seen'
                ),
                jsonb_build_object(
                    'id', 's3',
                    'text', 'After he _____ (finish) his homework, he went to bed.',
                    'answer', 'had finished'
                ),
                jsonb_build_object(
                    'id', 's4',
                    'text', 'I realized that I _____ (forget) my keys at home.',
                    'answer', 'had forgotten'
                ),
                jsonb_build_object(
                    'id', 's5',
                    'text', 'They _____ (not/meet) before the conference in Paris.',
                    'answer', 'had not met'
                )
            )
        ),
        'https://images.unsplash.com/photo-1519834089823-af2d966a0648?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 8. Future Simple (Will) Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Future Simple Tense with Will', 
        'Learn how to use the Future Simple tense with "will" for predictions and spontaneous decisions.', 
        'reading',
        jsonb_build_object(
            'text', 'The Future Simple tense with "will" is used to talk about things we believe will happen in the future, especially for predictions, spontaneous decisions, promises, offers, and requests. We form it using will + base form of the verb. For example: "I will help you with your homework." For negative sentences, we use will not/won\'t + base form: "She won\'t come to the party." For questions, we use will + subject + base form: "Will you attend the meeting?" The contracted form of "will" is "\'ll" (I\'ll, you\'ll, etc.). We use Future Simple with "will" for predictions (I think it will rain tomorrow), spontaneous decisions (I\'ll help you with that), promises (I\'ll call you later), offers (I\'ll carry that for you), and requests (Will you help me?).',
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'id', 'q1',
                    'text', 'How do we form Future Simple with "will"?',
                    'options', jsonb_build_array('subject + will + base form', 'subject + will + verb-ing', 'subject + will + past participle', 'subject + going to + base form'),
                    'correct', 'subject + will + base form'
                ),
                jsonb_build_object(
                    'id', 'q2',
                    'text', 'Which sentence shows a spontaneous decision using "will"?',
                    'options', jsonb_build_array('I\'m going to study tonight', 'I\'ll answer the phone', 'I\'m studying tomorrow', 'I\'ve studied English'),
                    'correct', 'I\'ll answer the phone'
                ),
                jsonb_build_object(
                    'id', 'q3',
                    'text', 'What is the contracted form of "I will"?',
                    'options', jsonb_build_array('I\'m', 'I\'ve', 'I\'d', 'I\'ll'),
                    'correct', 'I\'ll'
                ),
                jsonb_build_object(
                    'id', 'q4',
                    'text', 'Which is NOT a typical use of Future Simple with "will"?',
                    'options', jsonb_build_array('Predictions', 'Promises', 'Scheduled events', 'Spontaneous decisions'),
                    'correct', 'Scheduled events'
                )
            )
        ),
        'https://images.unsplash.com/photo-1520695625556-c2a7b410d4e5?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 9. Future Plans (Going To) Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Future Plans with Going To', 
        'Learn how to use "going to" for future plans and intentions.', 
        'video',
        jsonb_build_object(
            'videoId', '3IOW9Q-schA',
            'title', 'Future Plans with Going To',
            'description', 'Watch this video to learn about using "going to" for future plans and intentions.',
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'id', 'q1',
                    'text', 'How do we form the "going to" future?',
                    'options', jsonb_build_array('subject + will + base form', 'subject + am/is/are + going to + base form', 'subject + am/is/are + base form', 'subject + have/has + base form'),
                    'correct', 'subject + am/is/are + going to + base form'
                ),
                jsonb_build_object(
                    'id', 'q2',
                    'text', 'Which sentence uses "going to" future correctly?',
                    'options', jsonb_build_array('I going to travel next year', 'I am go to travel next year', 'I am going to travel next year', 'I will going to travel next year'),
                    'correct', 'I am going to travel next year'
                ),
                jsonb_build_object(
                    'id', 'q3',
                    'text', 'What is the main use of "going to" future?',
                    'options', jsonb_build_array('Spontaneous decisions', 'Predictions based on evidence', 'Plans and intentions', 'Regular habits'),
                    'correct', 'Plans and intentions'
                ),
                jsonb_build_object(
                    'id', 'q4',
                    'text', 'Which sentence shows evidence-based prediction with "going to"?',
                    'options', jsonb_build_array('I\'m going to Paris next month', 'Look at those clouds. It\'s going to rain.', 'I think it will rain tomorrow', 'I\'m visiting my parents this weekend'),
                    'correct', 'Look at those clouds. It\'s going to rain.'
                )
            )
        ),
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
    
    -- 10. Future Continuous Tense
    INSERT INTO activities (
        title, 
        description, 
        type, 
        content, 
        image_url, 
        course_id
    ) VALUES (
        'Future Continuous Tense', 
        'Learn how to use the Future Continuous tense for actions in progress at a specific time in the future.', 
        'quiz',
        jsonb_build_object(
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'question', 'How do we form the Future Continuous tense?',
                    'options', jsonb_build_array(
                        'subject + will be + verb-ing', 
                        'subject + will + verb-ing', 
                        'subject + am/is/are going to be + verb-ing', 
                        'subject + will have + verb-ing'
                    ),
                    'correctAnswer', 'subject + will be + verb-ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in the Future Continuous?',
                    'options', jsonb_build_array(
                        'I will study tomorrow', 
                        'I will be studying at 8 PM tomorrow', 
                        'I am going to study tomorrow', 
                        'I will have studied by tomorrow'
                    ),
                    'correctAnswer', 'I will be studying at 8 PM tomorrow'
                ),
                jsonb_build_object(
                    'question', 'When do we typically use Future Continuous?',
                    'options', jsonb_build_array(
                        'For completed actions in the future', 
                        'For actions in progress at a specific time in the future', 
                        'For actions that will have finished before another future time', 
                        'For spontaneous decisions'
                    ),
                    'correctAnswer', 'For actions in progress at a specific time in the future'
                ),
                jsonb_build_object(
                    'question', 'Which sentence correctly uses Future Continuous?',
                    'options', jsonb_build_array(
                        'This time next week, I\'ll lie on a beach in Hawaii', 
                        'This time next week, I\'ll be lying on a beach in Hawaii', 
                        'This time next week, I\'m lying on a beach in Hawaii', 
                        'This time next week, I was lying on a beach in Hawaii'
                    ),
                    'correctAnswer', 'This time next week, I\'ll be lying on a beach in Hawaii'
                ),
                jsonb_build_object(
                    'question', 'Which of these can be expressed using Future Continuous?',
                    'options', jsonb_build_array(
                        'A completed future action', 
                        'A scheduled event in the future', 
                        'An action that will be in progress at a certain time', 
                        'A past action with present results'
                    ),
                    'correctAnswer', 'An action that will be in progress at a certain time'
                )
            )
        ),
        'https://images.unsplash.com/photo-1511376777868-611b54f68947?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id
    );
END;
$$;

