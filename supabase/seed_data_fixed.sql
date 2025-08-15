-- =============================================
-- NestTask Seed Data (Fixed for Supabase Auth)
-- University Task Management System
-- =============================================

-- NOTE: This seed data assumes that Supabase Auth users have been created first
-- You need to create auth users through Supabase Auth before running this script

-- Insert Departments
INSERT INTO departments (id, name, code, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science and Engineering'),
    ('22222222-2222-2222-2222-222222222222', 'Software Engineering', 'SWE', 'Department of Software Engineering'),
    ('33333333-3333-3333-3333-333333333333', 'Multimedia and Creative Technology', 'MCT', 'Department of Multimedia and Creative Technology'),
    ('44444444-4444-4444-4444-444444444444', 'Computing and Information Systems', 'CIS', 'Department of Computing and Information Systems'),
    ('55555555-5555-5555-5555-555555555555', 'Information Technology and Management', 'ITM', 'Department of Information Technology and Management');

-- Insert Batches (Batch 50 to Batch 70 for each department)
DO $$
DECLARE
    dept_id UUID;
    dept_codes TEXT[] := ARRAY['CSE', 'SWE', 'MCT', 'CIS', 'ITM'];
    dept_ids UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    ];
    dept_idx INTEGER;
    batch_num INTEGER;
    batch_id UUID;
BEGIN
    FOR dept_idx IN 1..5 LOOP
        dept_id := dept_ids[dept_idx];
        
        FOR batch_num IN 50..70 LOOP
            batch_id := uuid_generate_v4();
            
            INSERT INTO batches (id, name, department_id) 
            VALUES (batch_id, 'Batch ' || batch_num, dept_id);
            
            -- Insert Sections A to Z for each batch
            FOR section_letter IN 1..26 LOOP
                INSERT INTO sections (name, batch_id) 
                VALUES ('Section ' || CHR(64 + section_letter), batch_id);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- =============================================
-- USER INSERTION FUNCTIONS
-- These functions help insert users safely after Auth users exist
-- =============================================

-- Function to safely insert user profile data
CREATE OR REPLACE FUNCTION insert_user_profile(
    user_email TEXT,
    user_name TEXT,
    user_student_id TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'user',
    dept_code TEXT DEFAULT NULL,
    batch_name TEXT DEFAULT NULL,
    section_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    auth_user_id UUID;
    dept_id UUID;
    batch_id UUID;
    section_id UUID;
BEGIN
    -- Get the auth user ID from email
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Auth user with email % not found. Please create the auth user first.', user_email;
    END IF;
    
    -- Get department ID if provided
    IF dept_code IS NOT NULL THEN
        SELECT id INTO dept_id FROM departments WHERE code = dept_code;
    END IF;
    
    -- Get batch ID if provided
    IF batch_name IS NOT NULL AND dept_id IS NOT NULL THEN
        SELECT id INTO batch_id FROM batches WHERE name = batch_name AND department_id = dept_id;
    END IF;
    
    -- Get section ID if provided
    IF section_name IS NOT NULL AND batch_id IS NOT NULL THEN
        SELECT id INTO section_id FROM sections WHERE name = section_name AND batch_id = batch_id;
    END IF;
    
    -- Insert user profile
    INSERT INTO users (
        id, email, name, student_id, role, 
        department_id, batch_id, section_id
    ) VALUES (
        auth_user_id, user_email, user_name, user_student_id, user_role,
        dept_id, batch_id, section_id
    );
    
    RETURN auth_user_id;
    
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'User profile for % already exists, skipping...', user_email;
    RETURN auth_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA INSERTION (CONDITIONAL)
-- Only insert if no users exist yet
-- =============================================

DO $$
BEGIN
    -- Only proceed if no users exist yet
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        RAISE NOTICE 'No existing users found. To complete the setup:';
        RAISE NOTICE '1. Create auth users in Supabase Auth Dashboard';
        RAISE NOTICE '2. Use the insert_user_profile() function to add user data';
        RAISE NOTICE '3. See SETUP_INSTRUCTIONS.md for detailed steps';
    ELSE
        RAISE NOTICE 'Users already exist. Skipping user creation instructions.';
    END IF;
END $$;

-- =============================================
-- SAMPLE TASKS AND ROUTINES
-- These will be created after users are set up
-- =============================================

-- Function to create sample tasks for a section
CREATE OR REPLACE FUNCTION create_sample_tasks(section_uuid UUID, creator_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO tasks (title, description, category, status, section_id, created_by, is_published, published_at, due_date) VALUES
        ('Complete Programming Assignment 1', 'Implement a simple calculator using your preferred programming language. Include basic arithmetic operations and error handling.', 'assignment', 'pending', section_uuid, creator_uuid, true, NOW(), NOW() + INTERVAL '7 days'),
        ('Database Design Project', 'Design and implement a database schema for a library management system. Include ER diagrams and SQL scripts.', 'project', 'pending', section_uuid, creator_uuid, true, NOW(), NOW() + INTERVAL '14 days'),
        ('Weekly Quiz Preparation', 'Review chapters 1-5 for the upcoming quiz on data structures and algorithms.', 'quiz', 'pending', section_uuid, creator_uuid, true, NOW(), NOW() + INTERVAL '3 days'),
        ('Lab Report Submission', 'Submit the lab report for the networking fundamentals experiment conducted last week.', 'lab', 'pending', section_uuid, creator_uuid, false, NULL, NOW() + INTERVAL '5 days'),
        ('Group Presentation', 'Prepare a 15-minute presentation on emerging technologies in your field of study.', 'presentation', 'pending', section_uuid, creator_uuid, true, NOW(), NOW() + INTERVAL '10 days');
END;
$$ LANGUAGE plpgsql;

-- Function to create sample routines for a section
CREATE OR REPLACE FUNCTION create_sample_routines(section_uuid UUID, creator_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO routines (title, description, section_id, day_of_week, start_time, end_time, room, subject, instructor_name, created_by) VALUES
        ('Programming Fundamentals', 'Introduction to programming concepts and problem solving', section_uuid, 1, '09:00', '10:30', 'Room 301', 'Programming', 'Dr. John Smith', creator_uuid),
        ('Database Systems', 'Database design, SQL, and database management systems', section_uuid, 1, '11:00', '12:30', 'Room 302', 'Database', 'Prof. Jane Doe', creator_uuid),
        ('Data Structures', 'Arrays, linked lists, stacks, queues, trees, and graphs', section_uuid, 2, '09:00', '10:30', 'Room 303', 'Data Structures', 'Dr. Bob Johnson', creator_uuid),
        ('Web Development', 'HTML, CSS, JavaScript, and modern web frameworks', section_uuid, 3, '14:00', '15:30', 'Lab A', 'Web Dev', 'Ms. Alice Brown', creator_uuid),
        ('Software Engineering', 'Software development lifecycle and project management', section_uuid, 4, '10:00', '11:30', 'Room 304', 'Software Eng', 'Dr. Charlie Wilson', creator_uuid);
END;
$$ LANGUAGE plpgsql;

-- Display current data summary
SELECT 
    'Departments' as table_name, 
    COUNT(*) as record_count 
FROM departments
UNION ALL
SELECT 
    'Batches' as table_name, 
    COUNT(*) as record_count 
FROM batches
UNION ALL
SELECT 
    'Sections' as table_name, 
    COUNT(*) as record_count 
FROM sections
UNION ALL
SELECT 
    'Users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'Tasks' as table_name, 
    COUNT(*) as record_count 
FROM tasks
UNION ALL
SELECT 
    'Routines' as table_name, 
    COUNT(*) as record_count 
FROM routines;

-- Display department structure summary
SELECT 
    d.name as department,
    COUNT(DISTINCT b.id) as batch_count,
    COUNT(DISTINCT s.id) as section_count
FROM departments d
LEFT JOIN batches b ON d.id = b.department_id
LEFT JOIN sections s ON b.id = s.batch_id
GROUP BY d.id, d.name
ORDER BY d.name;



