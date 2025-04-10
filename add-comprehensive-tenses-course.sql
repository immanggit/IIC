-- Add a comprehensive tenses course
INSERT INTO courses (title, description, level, image_url, category_id)
VALUES
(
'Comprehensive English Tenses Mastery', 
'A complete course covering all English tenses with extensive practice exercises and detailed explanations.',
'Intermediate',
'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=3546&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Grammar')
)
RETURNING id INTO @tenses_course_id;

-- Get the ID of the newly inserted course
DO $$
DECLARE
    tenses_course_id UUID;
BEGIN
    -- Get the course ID
    SELECT id INTO tenses_course_id FROM courses WHERE title = 'Comprehensive English Tenses Mastery';
    
    -- 1. Present Simple Tense - Reading Activity
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
        'Present Simple Tense', 
        'Master the Present Simple tense through comprehensive reading and practice.', 
        'reading',
        jsonb_build_object(
            'text', 'The Present Simple tense is one of the most fundamental tenses in English. We use it to talk about facts, habits, routines, and general truths. The structure is straightforward: for most subjects (I, you, we, they), we use the base form of the verb. For third-person singular subjects (he, she, it), we add -s or -es to the base form. For example: "I work" but "She works."

For negative sentences, we use the auxiliary verb "do" or "does" with "not" followed by the base form of the verb: "I do not (don''t) work" or "She does not (doesn''t) work."

For questions, we place "do" or "does" before the subject: "Do you work?" or "Does she work?"

The Present Simple has several key uses:
1. Expressing habits or routines: "I exercise every morning."
2. Stating facts or general truths: "Water boils at 100 degrees Celsius."
3. Describing permanent situations: "She lives in London."
4. Following a schedule: "The train leaves at 9 PM."
5. Giving instructions or directions: "First, you turn right at the corner."
6. Expressing feelings and opinions: "I think this is correct."

Time expressions commonly used with the Present Simple include: always, usually, often, sometimes, rarely, never, every day/week/month/year, on Mondays, in the morning, at night, etc.

Remember that with the verbs "have," "do," and some forms of "be," the structure can be slightly different. For example, we can say "I have a car" (not "I do have a car") in positive statements.',
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
                ),
                jsonb_build_object(
                    'id', 'q5',
                    'text', 'Which time expression is commonly used with Present Simple?',
                    'options', jsonb_build_array('Yesterday', 'Now', 'Every day', 'Last week'),
                    'correct', 'Every day'
                ),
                jsonb_build_object(
                    'id', 'q6',
                    'text', 'How do we form negative sentences in Present Simple with "she"?',
                    'options', jsonb_build_array('She not work', 'She doesn''t works', 'She doesn''t work', 'She don''t work'),
                    'correct', 'She doesn''t work'
                ),
                jsonb_build_object(
                    'id', 'q7',
                    'text', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array('He play tennis every Sunday', 'He plays tennis every Sunday', 'He playing tennis every Sunday', 'He is plays tennis every Sunday'),
                    'correct', 'He plays tennis every Sunday'
                ),
                jsonb_build_object(
                    'id', 'q8',
                    'text', 'Which sentence expresses a general truth?',
                    'options', jsonb_build_array('The sun is rising now', 'The sun rose yesterday', 'The sun rises in the east', 'The sun has risen'),
                    'correct', 'The sun rises in the east'
                ),
                jsonb_build_object(
                    'id', 'q9',
                    'text', 'How do we form questions in Present Simple with "they"?',
                    'options', jsonb_build_array('They do study?', 'Do they study?', 'Does they study?', 'Are they study?'),
                    'correct', 'Do they study?'
                ),
                jsonb_build_object(
                    'id', 'q10',
                    'text', 'Which verb form is correct for "I" in Present Simple?',
                    'options', jsonb_build_array('I works', 'I working', 'I work', 'I am work'),
                    'correct', 'I work'
                ),
                jsonb_build_object(
                    'id', 'q11',
                    'text', 'Which sentence describes a habit?',
                    'options', jsonb_build_array('She is cooking dinner now', 'She cooked dinner yesterday', 'She cooks dinner every evening', 'She has cooked dinner'),
                    'correct', 'She cooks dinner every evening'
                ),
                jsonb_build_object(
                    'id', 'q12',
                    'text', 'Which sentence follows a schedule?',
                    'options', jsonb_build_array('The train left at 5 PM', 'The train is leaving now', 'The train leaves at 5 PM every day', 'The train has left'),
                    'correct', 'The train leaves at 5 PM every day'
                ),
                jsonb_build_object(
                    'id', 'q13',
                    'text', 'Which adverb of frequency is NOT commonly used with Present Simple?',
                    'options', jsonb_build_array('Always', 'Usually', 'Currently', 'Never'),
                    'correct', 'Currently'
                ),
                jsonb_build_object(
                    'id', 'q14',
                    'text', 'Which sentence is in Present Simple?',
                    'options', jsonb_build_array('I am going to school', 'I went to school', 'I go to school', 'I have gone to school'),
                    'correct', 'I go to school'
                ),
                jsonb_build_object(
                    'id', 'q15',
                    'text', 'How do we spell the third person singular of "study"?',
                    'options', jsonb_build_array('Studys', 'Studyes', 'Studies', 'Studyies'),
                    'correct', 'Studies'
                ),
                jsonb_build_object(
                    'id', 'q16',
                    'text', 'Which sentence expresses an opinion?',
                    'options', jsonb_build_array('I am thinking about it', 'I thought about it', 'I think this is correct', 'I have thought about it'),
                    'correct', 'I think this is correct'
                ),
                jsonb_build_object(
                    'id', 'q17',
                    'text', 'Which sentence is NOT in Present Simple?',
                    'options', jsonb_build_array('Water boils at 100 degrees', 'She lives in Paris', 'They are visiting their parents', 'He works at a bank'),
                    'correct', 'They are visiting their parents'
                ),
                jsonb_build_object(
                    'id', 'q18',
                    'text', 'Which verb does NOT follow the regular -s/-es rule in third person singular?',
                    'options', jsonb_build_array('Walk', 'Talk', 'Have', 'Play'),
                    'correct', 'Have'
                ),
                jsonb_build_object(
                    'id', 'q19',
                    'text', 'Which sentence gives instructions?',
                    'options', jsonb_build_array('You are turning right', 'You turned right', 'You turn right at the corner', 'You have turned right'),
                    'correct', 'You turn right at the corner'
                ),
                jsonb_build_object(
                    'id', 'q20',
                    'text', 'Which is the correct negative form of "I know"?',
                    'options', jsonb_build_array('I know not', 'I don''t knows', 'I doesn''t know', 'I don''t know'),
                    'correct', 'I don''t know'
                ),
                jsonb_build_object(
                    'id', 'q21',
                    'text', 'Which sentence describes a permanent situation?',
                    'options', jsonb_build_array('She is staying in London', 'She stayed in London', 'She lives in London', 'She has stayed in London'),
                    'correct', 'She lives in London'
                ),
                jsonb_build_object(
                    'id', 'q22',
                    'text', 'How do we form the third person singular of verbs ending in -ch, -sh, -ss, -x, or -o?',
                    'options', jsonb_build_array('Add -s', 'Add -es', 'Add -ies', 'No change'),
                    'correct', 'Add -es'
                ),
                jsonb_build_object(
                    'id', 'q23',
                    'text', 'Which sentence is a general truth?',
                    'options', jsonb_build_array('It is raining now', 'It rained yesterday', 'It rains a lot in winter', 'It has rained'),
                    'correct', 'It rains a lot in winter'
                ),
                jsonb_build_object(
                    'id', 'q24',
                    'text', 'Which is the correct form of "do" in third person singular?',
                    'options', jsonb_build_array('Do', 'Dos', 'Does', 'Doing'),
                    'correct', 'Does'
                ),
                jsonb_build_object(
                    'id', 'q25',
                    'text', 'Which sentence is in Present Simple?',
                    'options', jsonb_build_array('They were playing football', 'They are playing football', 'They play football every weekend', 'They have played football'),
                    'correct', 'They play football every weekend'
                ),
                jsonb_build_object(
                    'id', 'q26',
                    'text', 'How do we form the third person singular of verbs ending in consonant + y?',
                    'options', jsonb_build_array('Add -s', 'Add -es', 'Change y to i and add -es', 'No change'),
                    'correct', 'Change y to i and add -es'
                ),
                jsonb_build_object(
                    'id', 'q27',
                    'text', 'Which sentence is NOT grammatically correct?',
                    'options', jsonb_build_array('She doesn''t work here', 'He don''t work here', 'They don''t work here', 'I don''t work here'),
                    'correct', 'He don''t work here'
                ),
                jsonb_build_object(
                    'id', 'q28',
                    'text', 'Which question form is correct?',
                    'options', jsonb_build_array('Does they live here?', 'Do she live here?', 'Does he lives here?', 'Does he live here?'),
                    'correct', 'Does he live here?'
                ),
                jsonb_build_object(
                    'id', 'q29',
                    'text', 'Which sentence uses Present Simple correctly?',
                    'options', jsonb_build_array('I am believing in you', 'I believing in you', 'I believes in you', 'I believe in you'),
                    'correct', 'I believe in you'
                ),
                jsonb_build_object(
                    'id', 'q30',
                    'text', 'Which is NOT a stative verb commonly used in Present Simple?',
                    'options', jsonb_build_array('Know', 'Understand', 'Like', 'Run'),
                    'correct', 'Run'
                )
            )
        ),
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=3542&auto=format&fit=crop',
        tenses_course_id,
        'published',
        1
    );
    
    -- 2. Present Continuous Tense - Quiz Activity
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
        'Present Continuous Tense', 
        'Test your knowledge of the Present Continuous tense with this comprehensive quiz.', 
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
                ),
                jsonb_build_object(
                    'question', 'Which auxiliary verb is used with "he" in Present Continuous?',
                    'options', jsonb_build_array(
                        'Am', 
                        'Is', 
                        'Are', 
                        'Has'
                    ),
                    'correctAnswer', 'Is'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array(
                        'They is playing football', 
                        'They are playing football', 
                        'They am playing football', 
                        'They playing football'
                    ),
                    'correctAnswer', 'They are playing football'
                ),
                jsonb_build_object(
                    'question', 'How do we form the negative in Present Continuous?',
                    'options', jsonb_build_array(
                        'subject + am/is/are + not + verb-ing', 
                        'subject + do/does + not + verb-ing', 
                        'subject + not + am/is/are + verb-ing', 
                        'subject + am/is/are + verb-ing + not'
                    ),
                    'correctAnswer', 'subject + am/is/are + not + verb-ing'
                ),
                jsonb_build_object(
                    'question', 'Which time expression is commonly used with Present Continuous?',
                    'options', jsonb_build_array(
                        'Every day', 
                        'Last week', 
                        'Now', 
                        'Yesterday'
                    ),
                    'correctAnswer', 'Now'
                ),
                jsonb_build_object(
                    'question', 'Which sentence describes a temporary situation?',
                    'options', jsonb_build_array(
                        'She lives in London', 
                        'She is living in London for a month', 
                        'She lived in London', 
                        'She has lived in London'
                    ),
                    'correctAnswer', 'She is living in London for a month'
                ),
                jsonb_build_object(
                    'question', 'How do we form questions in Present Continuous?',
                    'options', jsonb_build_array(
                        'Do/Does + subject + verb-ing?', 
                        'Am/Is/Are + subject + verb-ing?', 
                        'Have/Has + subject + verb-ing?', 
                        'Subject + am/is/are + verb-ing?'
                    ),
                    'correctAnswer', 'Am/Is/Are + subject + verb-ing?'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows an action happening at the moment of speaking?',
                    'options', jsonb_build_array(
                        'I work as a teacher', 
                        'I worked as a teacher', 
                        'I am working on a project right now', 
                        'I have worked as a teacher'
                    ),
                    'correctAnswer', 'I am working on a project right now'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a future arrangement?',
                    'options', jsonb_build_array(
                        'I go to Paris next week', 
                        'I am going to Paris next week', 
                        'I went to Paris', 
                        'I have gone to Paris'
                    ),
                    'correctAnswer', 'I am going to Paris next week'
                ),
                jsonb_build_object(
                    'question', 'Which verb is NOT commonly used in the continuous form?',
                    'options', jsonb_build_array(
                        'Play', 
                        'Run', 
                        'Know', 
                        'Write'
                    ),
                    'correctAnswer', 'Know'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in Present Continuous?',
                    'options', jsonb_build_array(
                        'I have dinner at 7 PM every day', 
                        'I had dinner at 7 PM', 
                        'I am having dinner right now', 
                        'I have had dinner'
                    ),
                    'correctAnswer', 'I am having dinner right now'
                ),
                jsonb_build_object(
                    'question', 'How do we spell the -ing form of "lie"?',
                    'options', jsonb_build_array(
                        'Lieing', 
                        'Lying', 
                        'Liing', 
                        'Liyng'
                    ),
                    'correctAnswer', 'Lying'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a changing or developing situation?',
                    'options', jsonb_build_array(
                        'The population of the city increases', 
                        'The population of the city increased', 
                        'The population of the city is increasing', 
                        'The population of the city has increased'
                    ),
                    'correctAnswer', 'The population of the city is increasing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is NOT grammatically correct?',
                    'options', jsonb_build_array(
                        'She is cooking dinner', 
                        'They are watching TV', 
                        'He am reading a book', 
                        'We are studying English'
                    ),
                    'correctAnswer', 'He am reading a book'
                ),
                jsonb_build_object(
                    'question', 'How do we form the -ing form of verbs ending in -e?',
                    'options', jsonb_build_array(
                        'Add -ing', 
                        'Drop the -e and add -ing', 
                        'Double the final consonant and add -ing', 
                        'Add -eing'
                    ),
                    'correctAnswer', 'Drop the -e and add -ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence expresses annoyance with a repeated action?',
                    'options', jsonb_build_array(
                        'He breaks things', 
                        'He broke things', 
                        'He is always breaking things', 
                        'He has broken things'
                    ),
                    'correctAnswer', 'He is always breaking things'
                ),
                jsonb_build_object(
                    'question', 'Which is the correct negative form of "I am working"?',
                    'options', jsonb_build_array(
                        'I am not working', 
                        'I do not working', 
                        'I not am working', 
                        'I don''t working'
                    ),
                    'correctAnswer', 'I am not working'
                ),
                jsonb_build_object(
                    'question', 'Which sentence uses Present Continuous correctly?',
                    'options', jsonb_build_array(
                        'I seeing you tomorrow', 
                        'I am see you tomorrow', 
                        'I am seeing you tomorrow', 
                        'I sees you tomorrow'
                    ),
                    'correctAnswer', 'I am seeing you tomorrow'
                ),
                jsonb_build_object(
                    'question', 'How do we form the -ing form of verbs ending in a single vowel + consonant?',
                    'options', jsonb_build_array(
                        'Add -ing', 
                        'Double the final consonant and add -ing', 
                        'Drop the final consonant and add -ing', 
                        'Add -eing'
                    ),
                    'correctAnswer', 'Double the final consonant and add -ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in Present Continuous?',
                    'options', jsonb_build_array(
                        'Water boils at 100 degrees', 
                        'Water boiled at 100 degrees', 
                        'Water is boiling on the stove', 
                        'Water has boiled'
                    ),
                    'correctAnswer', 'Water is boiling on the stove'
                ),
                jsonb_build_object(
                    'question', 'Which question form is correct?',
                    'options', jsonb_build_array(
                        'Is they working?', 
                        'Are they working?', 
                        'Do they working?', 
                        'Does they working?'
                    ),
                    'correctAnswer', 'Are they working?'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a temporary habit?',
                    'options', jsonb_build_array(
                        'I walk to work', 
                        'I walked to work', 
                        'I am walking to work this week because my car is being repaired', 
                        'I have walked to work'
                    ),
                    'correctAnswer', 'I am walking to work this week because my car is being repaired'
                ),
                jsonb_build_object(
                    'question', 'Which is NOT a stative verb?',
                    'options', jsonb_build_array(
                        'Believe', 
                        'Love', 
                        'Run', 
                        'Own'
                    ),
                    'correctAnswer', 'Run'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array(
                        'I am knowing the answer', 
                        'I knowing the answer', 
                        'I know the answer', 
                        'I am know the answer'
                    ),
                    'correctAnswer', 'I know the answer'
                ),
                jsonb_build_object(
                    'question', 'Which sentence uses Present Continuous correctly?',
                    'options', jsonb_build_array(
                        'She is wanting a new car', 
                        'She wanting a new car', 
                        'She wants a new car', 
                        'She is want a new car'
                    ),
                    'correctAnswer', 'She wants a new car'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is NOT in Present Continuous?',
                    'options', jsonb_build_array(
                        'They are playing football', 
                        'She is cooking dinner', 
                        'He is reading a book', 
                        'I believe you'
                    ),
                    'correctAnswer', 'I believe you'
                )
            )
        ),
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id,
        'published',
        2
    );
    
    -- 3. Past Simple Tense - Fill in the Blanks Activity
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
        'Past Simple Tense', 
        'Practice the Past Simple tense by filling in the blanks with the correct verb forms.', 
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
                    'answer', 'didn''t come'
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
                ),
                jsonb_build_object(
                    'id', 's6',
                    'text', 'The movie _____ (begin) at 7 PM and _____ (end) at 9 PM.',
                    'answer', 'began, ended'
                ),
                jsonb_build_object(
                    'id', 's7',
                    'text', 'He _____ (not/understand) the question, so he _____ (ask) for clarification.',
                    'answer', 'didn''t understand, asked'
                ),
                jsonb_build_object(
                    'id', 's8',
                    'text', 'When I _____ (arrive) at the station, the train already _____ (leave).',
                    'answer', 'arrived, had left'
                ),
                jsonb_build_object(
                    'id', 's9',
                    'text', 'She _____ (feel) tired, so she _____ (go) to bed early.',
                    'answer', 'felt, went'
                ),
                jsonb_build_object(
                    'id', 's10',
                    'text', '_____ (they/enjoy) the concert last night?',
                    'answer', 'Did they enjoy'
                ),
                jsonb_build_object(
                    'id', 's11',
                    'text', 'The children _____ (play) in the garden until it _____ (start) to rain.',
                    'answer', 'played, started'
                ),
                jsonb_build_object(
                    'id', 's12',
                    'text', 'I _____ (meet) my wife when we _____ (be) at university.',
                    'answer', 'met, were'
                ),
                jsonb_build_object(
                    'id', 's13',
                    'text', 'She _____ (not/want) to go out because she _____ (have) a headache.',
                    'answer', 'didn''t want, had'
                ),
                jsonb_build_object(
                    'id', 's14',
                    'text', 'When _____ (be) the last time you _____ (see) a good movie?',
                    'answer', 'was, saw'
                ),
                jsonb_build_object(
                    'id', 's15',
                    'text', 'We _____ (walk) for hours before we finally _____ (find) the hotel.',
                    'answer', 'walked, found'
                ),
                jsonb_build_object(
                    'id', 's16',
                    'text', 'The company _____ (lose) a lot of money last year, so they _____ (have to) lay off some employees.',
                    'answer', 'lost, had to'
                ),
                jsonb_build_object(
                    'id', 's17',
                    'text', 'I _____ (forget) my umbrella, so I _____ (get) wet in the rain.',
                    'answer', 'forgot, got'
                ),
                jsonb_build_object(
                    'id', 's18',
                    'text', '_____ (you/finish) your homework before you _____ (go) to bed?',
                    'answer', 'Did you finish, went'
                ),
                jsonb_build_object(
                    'id', 's19',
                    'text', 'She _____ (wear) a beautiful dress at the party and everyone _____ (admire) her.',
                    'answer', 'wore, admired'
                ),
                jsonb_build_object(
                    'id', 's20',
                    'text', 'The police _____ (arrest) the thief after he _____ (steal) the jewelry.',
                    'answer', 'arrested, stole'
                ),
                jsonb_build_object(
                    'id', 's21',
                    'text', 'I _____ (not/recognize) him because he _____ (change) a lot.',
                    'answer', 'didn''t recognize, had changed'
                ),
                jsonb_build_object(
                    'id', 's22',
                    'text', 'When I _____ (be) a child, I _____ (want) to be an astronaut.',
                    'answer', 'was, wanted'
                ),
                jsonb_build_object(
                    'id', 's23',
                    'text', 'They _____ (build) this bridge in 1995 and it _____ (cost) millions of dollars.',
                    'answer', 'built, cost'
                ),
                jsonb_build_object(
                    'id', 's24',
                    'text', '_____ (he/call) you yesterday? I _____ (try) to reach him but couldn''t.',
                    'answer', 'Did he call, tried'
                ),
                jsonb_build_object(
                    'id', 's25',
                    'text', 'She _____ (teach) English for ten years before she _____ (retire).',
                    'answer', 'taught, retired'
                ),
                jsonb_build_object(
                    'id', 's26',
                    'text', 'I _____ (send) you an email last week but you _____ (not/reply).',
                    'answer', 'sent, didn''t reply'
                ),
                jsonb_build_object(
                    'id', 's27',
                    'text', 'When the fire alarm _____ (go) off, everyone _____ (leave) the building immediately.',
                    'answer', 'went, left'
                ),
                jsonb_build_object(
                    'id', 's28',
                    'text', 'She _____ (fall) and _____ (break) her arm while she was skiing.',
                    'answer', 'fell, broke'
                ),
                jsonb_build_object(
                    'id', 's29',
                    'text', 'I _____ (speak) to the manager yesterday and he _____ (promise) to help.',
                    'answer', 'spoke, promised'
                ),
                jsonb_build_object(
                    'id', 's30',
                    'text', 'They _____ (not/know) what to do when the car _____ (break) down.',
                    'answer', 'didn''t know, broke'
                )
            )
        ),
        'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id,
        'published',
        3
    );
    
    -- 4. Past Continuous Tense - Reading Activity
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
        'Past Continuous Tense', 
        'Learn how to use the Past Continuous tense for actions in progress in the past.', 
        'reading',
        jsonb_build_object(
            'text', 'The Past Continuous tense (also called Past Progressive) is used to talk about actions or situations that were in progress at a specific time in the past. We form it using was/were + verb-ing. Use "was" with I, he, she, it and "were" with you, we, they. For example: "I was reading when you called." 

We use Past Continuous for several purposes:
1. Actions in progress at a specific time in the past: "At 8 PM yesterday, I was having dinner."
2. Actions in progress when another action interrupted: "I was watching TV when the phone rang."
3. Two actions in progress at the same time: "While I was cooking, my wife was setting the table."
4. To describe the background in a story: "It was raining, and the wind was blowing strongly."
5. For repeated actions that were annoying or irritating in the past: "He was always leaving his dirty clothes on the floor."

The Past Continuous emphasizes the process or duration of an action, not its completion. It creates a sense of being in the middle of an action when something else happened.

To form negative sentences, we add "not" after was/were: "She was not (wasn''t) sleeping." For questions, we put was/were before the subject: "Were they working late?"

Time expressions commonly used with Past Continuous include: at that time, at this time yesterday, at 8 PM last night, when, while, as, all morning/day/night, etc.

Remember that stative verbs (like know, believe, want, etc.) are not usually used in continuous forms. For example, we say "I knew the answer" (not "I was knowing the answer").',
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
                ),
                jsonb_build_object(
                    'id', 'q5',
                    'text', 'Which sentence shows an interrupted action?',
                    'options', jsonb_build_array('I watched TV yesterday', 'I was watching TV', 'I was watching TV when the doorbell rang', 'I had watched TV'),
                    'correct', 'I was watching TV when the doorbell rang'
                ),
                jsonb_build_object(
                    'id', 'q6',
                    'text', 'How do we form negative sentences in Past Continuous?',
                    'options', jsonb_build_array('subject + did not + verb-ing', 'subject + was/were + not + verb-ing', 'subject + not + was/were + verb-ing', 'subject + was/were + verb-ing + not'),
                    'correct', 'subject + was/were + not + verb-ing'
                ),
                jsonb_build_object(
                    'id', 'q7',
                    'text', 'Which sentence shows two parallel actions?',
                    'options', jsonb_build_array('I read while she cooked', 'I was reading while she was cooking', 'I read while she was cooking', 'I was reading while she cooked'),
                    'correct', 'I was reading while she was cooking'
                ),
                jsonb_build_object(
                    'id', 'q8',
                    'text', 'Which time expression is commonly used with Past Continuous?',
                    'options', jsonb_build_array('Yesterday', 'Last week', 'At this time yesterday', 'Two days ago'),
                    'correct', 'At this time yesterday'
                ),
                jsonb_build_object(
                    'id', 'q9',
                    'text', 'Which sentence describes the background in a story?',
                    'options', jsonb_build_array('It rained heavily', 'It was raining heavily as we left the house', 'It has rained heavily', 'It had rained heavily'),
                    'correct', 'It was raining heavily as we left the house'
                ),
                jsonb_build_object(
                    'id', 'q10',
                    'text', 'How do we form questions in Past Continuous?',
                    'options', jsonb_build_array('Did + subject + verb-ing?', 'Was/Were + subject + verb-ing?', 'Had + subject + verb-ing?', 'Subject + was/were + verb-ing?'),
                    'correct', 'Was/Were + subject + verb-ing?'
                ),
                jsonb_build_object(
                    'id', 'q11',
                    'text', 'Which sentence shows an annoying repeated action?',
                    'options', jsonb_build_array('He left his dirty clothes on the floor', 'He was leaving his dirty clothes on the floor', 'He was always leaving his dirty clothes on the floor', 'He had left his dirty clothes on the floor'),
                    'correct', 'He was always leaving his dirty clothes on the floor'
                ),
                jsonb_build_object(
                    'id', 'q12',
                    'text', 'Which verb is NOT usually used in Past Continuous?',
                    'options', jsonb_build_array('Play', 'Run', 'Know', 'Write'),
                    'correct', 'Know'
                ),
                jsonb_build_object(
                    'id', 'q13',
                    'text', 'Which sentence is in Past Continuous?',
                    'options', jsonb_build_array('I had dinner at 7 PM', 'I was having dinner at 7 PM', 'I have dinner at 7 PM', 'I have had dinner at 7 PM'),
                    'correct', 'I was having dinner at 7 PM'
                ),
                jsonb_build_object(
                    'id', 'q14',
                    'text', 'Which auxiliary verb is used with "they" in Past Continuous?',
                    'options', jsonb_build_array('Was', 'Were', 'Did', 'Had'),
                    'correct', 'Were'
                ),
                jsonb_build_object(
                    'id', 'q15',
                    'text', 'Which sentence is NOT grammatically correct?',
                    'options', jsonb_build_array('She was cooking dinner', 'They were watching TV', 'He were reading a book', 'We were studying English'),
                    'correct', 'He were reading a book'
                ),
                jsonb_build_object(
                    'id', 'q16',
                    'text', 'Which sentence correctly combines Past Simple and Past Continuous?',
                    'options', jsonb_build_array('While I was walking home, I was seeing an accident', 'While I walking home, I saw an accident', 'While I was walking home, I saw an accident', 'While I walked home, I was seeing an accident'),
                    'correct', 'While I was walking home, I saw an accident'
                ),
                jsonb_build_object(
                    'id', 'q17',
                    'text', 'Which is the correct negative form of "I was working"?',
                    'options', jsonb_build_array('I was not working', 'I did not working', 'I not was working', 'I didn''t working'),
                    'correct', 'I was not working'
                ),
                jsonb_build_object(
                    'id', 'q18',
                    'text', 'Which sentence uses Past Continuous correctly?',
                    'options', jsonb_build_array('I was wanting to talk to you', 'I wanting to talk to you', 'I wanted to talk to you', 'I was want to talk to you'),
                    'correct', 'I wanted to talk to you'
                ),
                jsonb_build_object(
                    'id', 'q19',
                    'text', 'Which sentence shows the correct use of "while"?',
                    'options', jsonb_build_array('While I watched TV, the phone rang', 'While I was watching TV, the phone was ringing', 'While I was watching TV, the phone rang', 'While I watching TV, the phone rang'),
                    'correct', 'While I was watching TV, the phone rang'
                ),
                jsonb_build_object(
                    'id', 'q20',
                    'text', 'Which question form is correct?',
                    'options', jsonb_build_array('Was they working?', 'Were they working?', 'Did they working?', 'Had they working?'),
                    'correct', 'Were they working?'
                ),
                jsonb_build_object(
                    'id', 'q21',
                    'text', 'Which sentence emphasizes the duration of an action?',
                    'options', jsonb_build_array('I waited for an hour', 'I was waiting for an hour when he finally arrived', 'I had waited for an hour', 'I have waited for an hour'),
                    'correct', 'I was waiting for an hour when he finally arrived'
                ),
                jsonb_build_object(
                    'id', 'q22',
                    'text', 'Which sentence is NOT in Past Continuous?',
                    'options', jsonb_build_array('They were playing football', 'She was cooking dinner', 'He was reading a book', 'I believed you'),
                    'correct', 'I believed you'
                ),
                jsonb_build_object(
                    'id', 'q23',
                    'text', 'Which sentence shows the correct use of "when"?',
                    'options', jsonb_build_array('When I arrived, she left', 'When I was arriving, she was leaving', 'When I arrived, she was leaving', 'When I was arriving, she left'),
                    'correct', 'When I arrived, she was leaving'
                ),
                jsonb_build_object(
                    'id', 'q24',
                    'text', 'Which is NOT a stative verb?',
                    'options', jsonb_build_array('Believe', 'Love', 'Run', 'Own'),
                    'correct', 'Run'
                ),
                jsonb_build_object(
                    'id', 'q25',
                    'text', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array('I was knowing the answer', 'I knowing the answer', 'I knew the answer', 'I was know the answer'),
                    'correct', 'I knew the answer'
                ),
                jsonb_build_object(
                    'id', 'q26',
                    'text', 'Which sentence shows an action in progress at a specific time?',
                    'options', jsonb_build_array('I worked at 8 PM', 'I was working at 8 PM', 'I had worked at 8 PM', 'I have been working at 8 PM'),
                    'correct', 'I was working at 8 PM'
                ),
                jsonb_build_object(
                    'id', 'q27',
                    'text', 'Which sentence correctly uses "as"?',
                    'options', jsonb_build_array('As I drove home, I was listening to music', 'As I was driving home, I listened to music', 'As I was driving home, I was listening to music', 'As I drove home, I listened to music'),
                    'correct', 'As I was driving home, I was listening to music'
                ),
                jsonb_build_object(
                    'id', 'q28',
                    'text', 'Which is the contracted form of "she was not"?',
                    'options', jsonb_build_array('She''s not', 'She wasn''t', 'She weren''t', 'She didn''t'),
                    'correct', 'She wasn''t'
                ),
                jsonb_build_object(
                    'id', 'q29',
                    'text', 'Which sentence shows the correct use of Past Continuous?',
                    'options', jsonb_build_array('I was hoping to see you yesterday', 'I was hope to see you yesterday', 'I hoping to see you yesterday', 'I hope to see you yesterday'),
                    'correct', 'I was hoping to see you yesterday'
                ),
                jsonb_build_object(
                    'id', 'q30',
                    'text', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array('What you were doing at 8 PM?', 'What were you doing at 8 PM?', 'What did you doing at 8 PM?', 'What you did at 8 PM?'),
                    'correct', 'What were you doing at 8 PM?'
                )
            )
        ),
        'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id,
        'published',
        4
    );
    
    -- 5. Present Perfect Tense - Video Activity
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
                ),
                jsonb_build_object(
                    'id', 'q5',
                    'text', 'Which auxiliary verb is used with "she" in Present Perfect?',
                    'options', jsonb_build_array('Have', 'Has', 'Is', 'Did'),
                    'correct', 'Has'
                ),
                jsonb_build_object(
                    'id', 'q6',
                    'text', 'Which sentence shows an experience?',
                    'options', jsonb_build_array('I went to Japan in 2010', 'I have been to Japan', 'I go to Japan', 'I am going to Japan'),
                    'correct', 'I have been to Japan'
                ),
                jsonb_build_object(
                    'id', 'q7',
                    'text', 'How do we form negative sentences in Present Perfect?',
                    'options', jsonb_build_array('subject + do/does not + have + past participle', 'subject + has/have + not + past participle', 'subject + not + has/have + past participle', 'subject + has/have + past participle + not'),
                    'correct', 'subject + has/have + not + past participle'
                ),
                jsonb_build_object(
                    'id', 'q8',
                    'text', 'Which sentence shows a result in the present?',
                    'options', jsonb_build_array('I lost my keys yesterday', 'I have lost my keys (so I can''t get into my house)', 'I lose my keys often', 'I will lose my keys'),
                    'correct', 'I have lost my keys (so I can''t get into my house)'
                ),
                jsonb_build_object(
                    'id', 'q9',
                    'text', 'Which time expression is used with Present Perfect for unfinished time periods?',
                    'options', jsonb_build_array('Yesterday', 'Last month', 'So far', 'Two years ago'),
                    'correct', 'So far'
                ),
                jsonb_build_object(
                    'id', 'q10',
                    'text', 'How do we form questions in Present Perfect?',
                    'options', jsonb_build_array('Do/Does + subject + have + past participle?', 'Has/Have + subject + past participle?', 'Did + subject + past participle?', 'Subject + has/have + past participle?'),
                    'correct', 'Has/Have + subject + past participle?'
                ),
                jsonb_build_object(
                    'id', 'q11',
                    'text', 'Which sentence shows an action that started in the past and continues to the present?',
                    'options', jsonb_build_array('I lived in London for five years', 'I have lived in London for five years', 'I live in London for five years', 'I am living in London for five years'),
                    'correct', 'I have lived in London for five years'
                ),
                jsonb_build_object(
                    'id', 'q12',
                    'text', 'Which preposition is used with Present Perfect to indicate when an action started?',
                    'options', jsonb_build_array('For', 'Since', 'Ago', 'During'),
                    'correct', 'Since'
                ),
                jsonb_build_object(
                    'id', 'q13',
                    'text', 'Which preposition is used with Present Perfect to indicate duration?',
                    'options', jsonb_build_array('For', 'Since', 'Ago', 'During'),
                    'correct', 'For'
                ),
                jsonb_build_object(
                    'id', 'q14',
                    'text', 'Which sentence is in Present Perfect?',
                    'options', jsonb_build_array('I am working here', 'I worked here', 'I have worked here since January', 'I work here'),
                    'correct', 'I have worked here since January'
                ),
                jsonb_build_object(
                    'id', 'q15',
                    'text', 'Which sentence is NOT grammatically correct?',
                    'options', jsonb_build_array('She has visited Paris', 'They have gone to the beach', 'He have seen that movie', 'We have finished our work'),
                    'correct', 'He have seen that movie'
                ),
                jsonb_build_object(
                    'id', 'q16',
                    'text', 'Which sentence correctly combines Present Perfect and Present Simple?',
                    'options', jsonb_build_array('I have lived here since I am a child', 'I have lived here since I was a child', 'I have lived here since I have been a child', 'I lived here since I was a child'),
                    'correct', 'I have lived here since I was a child'
                ),
                jsonb_build_object(
                    'id', 'q17',
                    'text', 'Which is the correct negative form of "I have seen that movie"?',
                    'options', jsonb_build_array('I have not seen that movie', 'I not have seen that movie', 'I don''t have seen that movie', 'I didn''t have seen that movie'),
                    'correct', 'I have not seen that movie'
                ),
                jsonb_build_object(
                    'id', 'q18',
                    'text', 'Which sentence shows a recently completed action?',
                    'options', jsonb_build_array('I finished my homework', 'I have just finished my homework', 'I finish my homework', 'I am finishing my homework'),
                    'correct', 'I have just finished my homework'
                ),
                jsonb_build_object(
                    'id', 'q19',
                    'text', 'Which adverb indicates that an action happened at an unspecified time before now?',
                    'options', jsonb_build_array('Yesterday', 'Now', 'Ever', 'Tomorrow'),
                    'correct', 'Ever'
                ),
                jsonb_build_object(
                    'id', 'q20',
                    'text', 'Which question form is correct?',
                    'options', jsonb_build_array('Has they arrived?', 'Have they arrived?', 'Did they have arrived?', 'Do they have arrived?'),
                    'correct', 'Have they arrived?'
                ),
                jsonb_build_object(
                    'id', 'q21',
                    'text', 'Which sentence shows the correct use of "yet"?',
                    'options', jsonb_build_array('I have yet finished my work', 'I have finished my work yet', 'I haven''t finished my work yet', 'Yet I have finished my work'),
                    'correct', 'I haven''t finished my work yet'
                ),
                jsonb_build_object(
                    'id', 'q22',
                    'text', 'Which sentence shows the correct use of "already"?',
                    'options', jsonb_build_array('I already have seen that movie', 'I have already seen that movie', 'I have seen already that movie', 'I have seen that movie already'),
                    'correct', 'I have already seen that movie'
                ),
                jsonb_build_object(
                    'id', 'q23',
                    'text', 'Which sentence is NOT in Present Perfect?',
                    'options', jsonb_build_array('They have played football', 'She has cooked dinner', 'He has read a book', 'I saw a movie'),
                    'correct', 'I saw a movie'
                ),
                jsonb_build_object(
                    'id', 'q24',
                    'text', 'Which sentence shows the correct use of "never"?',
                    'options', jsonb_build_array('I never have been to Paris', 'I have never been to Paris', 'I have been never to Paris', 'I have been to Paris never'),
                    'correct', 'I have never been to Paris'
                ),
                jsonb_build_object(
                    'id', 'q25',
                    'text', 'Which is the contracted form of "she has not"?',
                    'options', jsonb_build_array('She''s not', 'She hasn''t', 'She haven''t', 'She didn''t'),
                    'correct', 'She hasn''t'
                ),
                jsonb_build_object(
                    'id', 'q26',
                    'text', 'Which sentence shows an action repeated several times up to now?',
                    'options', jsonb_build_array('I visited that museum three times', 'I have visited that museum three times', 'I visit that museum three times', 'I am visiting that museum three times'),
                    'correct', 'I have visited that museum three times'
                ),
                jsonb_build_object(
                    'id', 'q27',
                    'text', 'Which sentence correctly uses "ever"?',
                    'options', jsonb_build_array('Have you ever visited Rome?', 'Did you ever visit Rome?', 'Have you visited ever Rome?', 'Do you ever visit Rome?'),
                    'correct', 'Have you ever visited Rome?'
                ),
                jsonb_build_object(
                    'id', 'q28',
                    'text', 'Which sentence shows the difference between Present Perfect and Past Simple?',
                    'options', jsonb_build_array('I have visited Paris (at some point in my life) vs. I visited Paris last year (specific time)', 'I have visited Paris last year vs. I visited Paris', 'I have visited Paris vs. I have been visiting Paris', 'I have visited Paris vs. I am visiting Paris'),
                    'correct', 'I have visited Paris (at some point in my life) vs. I visited Paris last year (specific time)'
                ),
                jsonb_build_object(
                    'id', 'q29',
                    'text', 'Which sentence shows the correct use of Present Perfect?',
                    'options', jsonb_build_array('I have finished my homework yesterday', 'I have finished my homework', 'I have finish my homework', 'I have been finish my homework'),
                    'correct', 'I have finished my homework'
                ),
                jsonb_build_object(
                    'id', 'q30',
                    'text', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array(
                        'What you have done?', 
                        'What have you done?', 
                        'What did you have done?', 
                        'What you did have done?'
                    ),
                    'correctAnswer', 'What have you done?'
                )
            )
        ),
        'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id,
        'published',
        5
    );
    
    -- 6. Future Tenses - Quiz Activity
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
        'Future Tenses', 
        'Test your knowledge of all future tenses including will, going to, Present Continuous, and Future Perfect.', 
        'quiz',
        jsonb_build_object(
            'questions', jsonb_build_array(
                jsonb_build_object(
                    'question', 'How do we form the Future Simple with "will"?',
                    'options', jsonb_build_array(
                        'subject + will + base form', 
                        'subject + will + verb-ing', 
                        'subject + will + past participle', 
                        'subject + will + have + past participle'
                    ),
                    'correctAnswer', 'subject + will + base form'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a spontaneous decision?',
                    'options', jsonb_build_array(
                        'I will help you with that', 
                        'I am going to help you with that', 
                        'I am helping you with that tomorrow', 
                        'I will have helped you by tomorrow'
                    ),
                    'correctAnswer', 'I will help you with that'
                ),
                jsonb_build_object(
                    'question', 'How do we form the "going to" future?',
                    'options', jsonb_build_array(
                        'subject + will + base form', 
                        'subject + am/is/are + going to + base form', 
                        'subject + am/is/are + verb-ing', 
                        'subject + will + be + verb-ing'
                    ),
                    'correctAnswer', 'subject + am/is/are + going to + base form'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a future plan or intention?',
                    'options', jsonb_build_array(
                        'I will study tonight', 
                        'I am going to study tonight', 
                        'I study tonight', 
                        'I will be studying tonight'
                    ),
                    'correctAnswer', 'I am going to study tonight'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a prediction based on evidence?',
                    'options', jsonb_build_array(
                        'It will rain tomorrow', 
                        'Look at those clouds. It is going to rain', 
                        'It rains tomorrow', 
                        'It will be raining tomorrow'
                    ),
                    'correctAnswer', 'Look at those clouds. It is going to rain'
                ),
                jsonb_build_object(
                    'question', 'How do we form the Future Continuous?',
                    'options', jsonb_build_array(
                        'subject + will + be + verb-ing', 
                        'subject + will + verb-ing', 
                        'subject + am/is/are + going to be + verb-ing', 
                        'subject + will + have + verb-ing'
                    ),
                    'correctAnswer', 'subject + will + be + verb-ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in the Future Continuous?',
                    'options', jsonb_build_array(
                        'I will study at 8 PM tomorrow', 
                        'I will be studying at 8 PM tomorrow', 
                        'I am going to study at 8 PM tomorrow', 
                        'I will have studied by 8 PM tomorrow'
                    ),
                    'correctAnswer', 'I will be studying at 8 PM tomorrow'
                ),
                jsonb_build_object(
                    'question', 'How do we form the Future Perfect?',
                    'options', jsonb_build_array(
                        'subject + will + have + past participle', 
                        'subject + will + be + verb-ing', 
                        'subject + am/is/are + going to have + past participle', 
                        'subject + will + past participle'
                    ),
                    'correctAnswer', 'subject + will + have + past participle'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in the Future Perfect?',
                    'options', jsonb_build_array(
                        'I will finish the project by Friday', 
                        'I will be finishing the project on Friday', 
                        'I will have finished the project by Friday', 
                        'I am going to finish the project by Friday'
                    ),
                    'correctAnswer', 'I will have finished the project by Friday'
                ),
                jsonb_build_object(
                    'question', 'Which tense is used for fixed arrangements in the future?',
                    'options', jsonb_build_array(
                        'Future Simple (will)', 
                        'Going to future', 
                        'Present Continuous for future', 
                        'Future Perfect'
                    ),
                    'correctAnswer', 'Present Continuous for future'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a fixed arrangement?',
                    'options', jsonb_build_array(
                        'I will meet John tomorrow', 
                        'I am going to meet John tomorrow', 
                        'I am meeting John tomorrow at 5 PM', 
                        'I will have met John by tomorrow'
                    ),
                    'correctAnswer', 'I am meeting John tomorrow at 5 PM'
                ),
                jsonb_build_object(
                    'question', 'How do we form the Future Perfect Continuous?',
                    'options', jsonb_build_array(
                        'subject + will + have + been + verb-ing', 
                        'subject + will + be + verb-ing', 
                        'subject + am/is/are + going to have been + verb-ing', 
                        'subject + will + have + verb-ing'
                    ),
                    'correctAnswer', 'subject + will + have + been + verb-ing'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is in the Future Perfect Continuous?',
                    'options', jsonb_build_array(
                        'I will work for ten hours by then', 
                        'I will be working for ten hours', 
                        'I will have been working for ten hours by then', 
                        'I am going to work for ten hours'
                    ),
                    'correctAnswer', 'I will have been working for ten hours by then'
                ),
                jsonb_build_object(
                    'question', 'Which tense emphasizes the duration of an action up to a point in the future?',
                    'options', jsonb_build_array(
                        'Future Simple', 
                        'Future Continuous', 
                        'Future Perfect', 
                        'Future Perfect Continuous'
                    ),
                    'correctAnswer', 'Future Perfect Continuous'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a promise?',
                    'options', jsonb_build_array(
                        'I will call you later', 
                        'I am going to call you later', 
                        'I am calling you later', 
                        'I will have called you later'
                    ),
                    'correctAnswer', 'I will call you later'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a prediction without evidence?',
                    'options', jsonb_build_array(
                        'I think it will rain tomorrow', 
                        'Look at those clouds. It is going to rain', 
                        'It is raining tomorrow', 
                        'It will be raining tomorrow'
                    ),
                    'correctAnswer', 'I think it will rain tomorrow'
                ),
                jsonb_build_object(
                    'question', 'Which tense is used for actions that will be in progress at a specific time in the future?',
                    'options', jsonb_build_array(
                        'Future Simple', 
                        'Future Continuous', 
                        'Future Perfect', 
                        'Present Continuous'
                    ),
                    'correctAnswer', 'Future Continuous'
                ),
                jsonb_build_object(
                    'question', 'Which tense is used for actions that will be completed before a specific time in the future?',
                    'options', jsonb_build_array(
                        'Future Simple', 
                        'Future Continuous', 
                        'Future Perfect', 
                        'Present Perfect'
                    ),
                    'correctAnswer', 'Future Perfect'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is NOT grammatically correct?',
                    'options', jsonb_build_array(
                        'I will see you tomorrow', 
                        'I am seeing you tomorrow', 
                        'I will seeing you tomorrow', 
                        'I am going to see you tomorrow'
                    ),
                    'correctAnswer', 'I will seeing you tomorrow'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows the correct use of "by" with a future tense?',
                    'options', jsonb_build_array(
                        'I will finish by Friday', 
                        'I will be finishing by Friday', 
                        'I will have finished by Friday', 
                        'I am finishing by Friday'
                    ),
                    'correctAnswer', 'I will have finished by Friday'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows the correct use of "this time tomorrow"?',
                    'options', jsonb_build_array(
                        'This time tomorrow, I will fly to Paris', 
                        'This time tomorrow, I will be flying to Paris', 
                        'This time tomorrow, I will have flown to Paris', 
                        'This time tomorrow, I am flying to Paris'
                    ),
                    'correctAnswer', 'This time tomorrow, I will be flying to Paris'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows the correct use of "in ten years"?',
                    'options', jsonb_build_array(
                        'In ten years, I will live in a different country', 
                        'In ten years, I will be living in a different country', 
                        'In ten years, I will have lived in a different country', 
                        'In ten years, I am living in a different country'
                    ),
                    'correctAnswer', 'In ten years, I will be living in a different country'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows the correct use of "by the end of the year"?',
                    'options', jsonb_build_array(
                        'By the end of the year, I will save enough money', 
                        'By the end of the year, I will be saving enough money', 
                        'By the end of the year, I will have saved enough money', 
                        'By the end of the year, I am saving enough money'
                    ),
                    'correctAnswer', 'By the end of the year, I will have saved enough money'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows the correct use of "for five years by then"?',
                    'options', jsonb_build_array(
                        'I will work here for five years by then', 
                        'I will be working here for five years by then', 
                        'I will have worked here for five years by then', 
                        'I will have been working here for five years by then'
                    ),
                    'correctAnswer', 'I will have been working here for five years by then'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows an offer?',
                    'options', jsonb_build_array(
                        'I will carry that for you', 
                        'I am going to carry that for you', 
                        'I am carrying that for you', 
                        'I will have carried that for you'
                    ),
                    'correctAnswer', 'I will carry that for you'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows a request?',
                    'options', jsonb_build_array(
                        'Will you help me?', 
                        'Are you going to help me?', 
                        'Are you helping me?', 
                        'Will you be helping me?'
                    ),
                    'correctAnswer', 'Will you help me?'
                ),
                jsonb_build_object(
                    'question', 'Which sentence shows the correct use of Present Simple for future?',
                    'options', jsonb_build_array(
                        'The train will leave at 5 PM', 
                        'The train is going to leave at 5 PM', 
                        'The train leaves at 5 PM tomorrow', 
                        'The train is leaving at 5 PM'
                    ),
                    'correctAnswer', 'The train leaves at 5 PM tomorrow'
                ),
                jsonb_build_object(
                    'question', 'Which tense is used for scheduled events in the future?',
                    'options', jsonb_build_array(
                        'Future Simple', 
                        'Going to future', 
                        'Present Simple', 
                        'Future Perfect'
                    ),
                    'correctAnswer', 'Present Simple'
                ),
                jsonb_build_object(
                    'question', 'Which sentence is grammatically correct?',
                    'options', jsonb_build_array(
                        'I will to see you tomorrow', 
                        'I am go to see you tomorrow', 
                        'I going to see you tomorrow', 
                        'I am going to see you tomorrow'
                    ),
                    'correctAnswer', 'I am going to see you tomorrow'
                ),
                jsonb_build_object(
                    'question', 'Which question form is correct for Future Simple?',
                    'options', jsonb_build_array(
                        'Will you come to the party?', 
                        'You will come to the party?', 
                        'Will you to come to the party?', 
                        'Do you will come to the party?'
                    ),
                    'correctAnswer', 'Will you come to the party?'
                )
            )
        ),
        'https://images.unsplash.com/photo-1520695625556-c2a7b410d4e5?q=80&w=3540&auto=format&fit=crop',
        tenses_course_id,
        'published',
        6
    );
END;
$$;

