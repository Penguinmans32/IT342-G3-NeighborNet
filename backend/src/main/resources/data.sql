INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'First Teacher', 'Created your first class', 'FIRST_CLASS_CREATED', 'BookOpen', 1
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'FIRST_CLASS_CREATED');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Sharing Starter', 'Posted your first item', 'FIRST_ITEM_POSTED', 'Package', 1
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'FIRST_ITEM_POSTED');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Class Master', 'Created 10 classes', 'CLASS_CREATOR', 'Award', 10
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'CLASS_CREATOR');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Sharing Expert', 'Posted 10 items', 'ITEM_SHARER', 'Package', 10
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'ITEM_SHARER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'First Borrower', 'Borrowed your first item', 'FIRST_BORROWER', 'HandShake', 1
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'FIRST_BORROWER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'First Lender', 'Lent your first item', 'FIRST_LENDER', 'Gift', 1
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'FIRST_LENDER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Feedback Star', 'Left your first class feedback', 'FEEDBACK_GIVER', 'MessageCircle', 1
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'FEEDBACK_GIVER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Community Starter', 'Reached 25% community score', 'COMMUNITY_BEGINNER', 'Star', 25
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'COMMUNITY_BEGINNER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Community Expert', 'Reached 50% community score', 'COMMUNITY_EXPERT', 'Star', 50
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'COMMUNITY_EXPERT');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Community Master', 'Reached 100% community score', 'COMMUNITY_MASTER', 'Crown', 100
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'COMMUNITY_MASTER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Skill Collector', 'Added 5 skills to your profile', 'SKILL_COLLECTOR', 'Target', 5
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'SKILL_COLLECTOR');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Social Butterfly', 'Connected all social media accounts', 'SOCIAL_BUTTERFLY', 'Share2', 4
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'SOCIAL_BUTTERFLY');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Popular Teacher', 'Had 50 students enroll in your classes', 'POPULAR_TEACHER', 'Users', 50
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'POPULAR_TEACHER');

INSERT INTO achievements (name, description, type, icon, required_count)
SELECT 'Highly Rated', 'Received 10 class ratings', 'TOP_RATED', 'ThumbsUp', 10
    WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE type = 'TOP_RATED');

INSERT INTO users (
    username,
    email,
    password,
    role,
    email_verified,
    created_date,
    provider,
    provider_id,
    image_url,
    bio,
    github_url,
    twitter_url,
    linkedin_url,
    facebook_url
)
SELECT 'admin',
       'admin@neighbornet.com',
       '$2a$12$RsUzEbbGJrsRBMl4ddqX3e5p06xFeugB6LgE.63ATyRxOQux3ail6',
       'ROLE_ADMIN',
       true,
       '2025-04-01 10:02:11',
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL
    WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@neighbornet.com'
);
