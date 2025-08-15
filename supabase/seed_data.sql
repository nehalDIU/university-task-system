-- =============================================
-- NestTask Seed Data
-- University Task Management System
-- =============================================

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

-- Insert some sample users (for testing purposes)
-- Note: These users will need to be created in Supabase Auth first

-- Sample Super Admin
INSERT INTO users (id, email, name, role, department_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@diu.edu.bd', 'System Administrator', 'super_admin', '11111111-1111-1111-1111-111111111111');

-- Sample Section Admins (one for each department)
INSERT INTO users (id, email, name, role, department_id, section_id) VALUES
    ('00000000-0000-0000-0000-000000000002', 'cse.admin@diu.edu.bd', 'CSE Section Admin', 'section_admin', '11111111-1111-1111-1111-111111111111', (SELECT id FROM sections WHERE name = 'Section A' AND batch_id = (SELECT id FROM batches WHERE name = 'Batch 50' AND department_id = '11111111-1111-1111-1111-111111111111') LIMIT 1)),
    ('00000000-0000-0000-0000-000000000003', 'swe.admin@diu.edu.bd', 'SWE Section Admin', 'section_admin', '22222222-2222-2222-2222-222222222222', (SELECT id FROM sections WHERE name = 'Section A' AND batch_id = (SELECT id FROM batches WHERE name = 'Batch 50' AND department_id = '22222222-2222-2222-2222-222222222222') LIMIT 1)),
    ('00000000-0000-0000-0000-000000000004', 'mct.admin@diu.edu.bd', 'MCT Section Admin', 'section_admin', '33333333-3333-3333-3333-333333333333', (SELECT id FROM sections WHERE name = 'Section A' AND batch_id = (SELECT id FROM batches WHERE name = 'Batch 50' AND department_id = '33333333-3333-3333-3333-333333333333') LIMIT 1)),
    ('00000000-0000-0000-0000-000000000005', 'cis.admin@diu.edu.bd', 'CIS Section Admin', 'section_admin', '44444444-4444-4444-4444-444444444444', (SELECT id FROM sections WHERE name = 'Section A' AND batch_id = (SELECT id FROM batches WHERE name = 'Batch 50' AND department_id = '44444444-4444-4444-4444-444444444444') LIMIT 1)),
    ('00000000-0000-0000-0000-000000000006', 'itm.admin@diu.edu.bd', 'ITM Section Admin', 'section_admin', '55555555-5555-5555-5555-555555555555', (SELECT id FROM sections WHERE name = 'Section A' AND batch_id = (SELECT id FROM batches WHERE name = 'Batch 50' AND department_id = '55555555-5555-5555-5555-555555555555') LIMIT 1));

-- Sample Students
DO $$
DECLARE
    section_rec RECORD;
    student_counter INTEGER := 1;
    dept_code TEXT;
BEGIN
    -- Insert 5 sample students for the first section of each department
    FOR section_rec IN 
        SELECT s.id as section_id, s.name as section_name, b.name as batch_name, d.code as dept_code, d.id as dept_id, b.id as batch_id
        FROM sections s
        JOIN batches b ON s.batch_id = b.id
        JOIN departments d ON b.department_id = d.id
        WHERE s.name = 'Section A' AND b.name = 'Batch 50'
        ORDER BY d.code
    LOOP
        FOR i IN 1..5 LOOP
            INSERT INTO users (
                id, 
                email, 
                name, 
                student_id, 
                role, 
                department_id, 
                batch_id, 
                section_id
            ) VALUES (
                uuid_generate_v4(),
                'student' || student_counter || '@diu.edu.bd',
                'Student ' || student_counter || ' (' || section_rec.dept_code || ')',
                section_rec.dept_code || '-' || LPAD(student_counter::TEXT, 4, '0'),
                'user',
                section_rec.dept_id,
                section_rec.batch_id,
                section_rec.section_id
            );
            student_counter := student_counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Insert sample tasks
DO $$
DECLARE
    section_rec RECORD;
    admin_id UUID;
BEGIN
    -- Create sample tasks for each section that has an admin
    FOR section_rec IN 
        SELECT DISTINCT s.id as section_id, u.id as admin_id
        FROM sections s
        JOIN users u ON u.section_id = s.id AND u.role = 'section_admin'
        LIMIT 5
    LOOP
        -- Insert sample tasks
        INSERT INTO tasks (title, description, category, status, section_id, created_by, is_published, published_at, due_date) VALUES
            ('Complete Programming Assignment 1', 'Implement a simple calculator using your preferred programming language. Include basic arithmetic operations and error handling.', 'assignment', 'pending', section_rec.section_id, section_rec.admin_id, true, NOW(), NOW() + INTERVAL '7 days'),
            ('Database Design Project', 'Design and implement a database schema for a library management system. Include ER diagrams and SQL scripts.', 'project', 'pending', section_rec.section_id, section_rec.admin_id, true, NOW(), NOW() + INTERVAL '14 days'),
            ('Weekly Quiz Preparation', 'Review chapters 1-5 for the upcoming quiz on data structures and algorithms.', 'quiz', 'pending', section_rec.section_id, section_rec.admin_id, true, NOW(), NOW() + INTERVAL '3 days'),
            ('Lab Report Submission', 'Submit the lab report for the networking fundamentals experiment conducted last week.', 'lab', 'pending', section_rec.section_id, section_rec.admin_id, false, NULL, NOW() + INTERVAL '5 days'),
            ('Group Presentation', 'Prepare a 15-minute presentation on emerging technologies in your field of study.', 'presentation', 'pending', section_rec.section_id, section_rec.admin_id, true, NOW(), NOW() + INTERVAL '10 days');
    END LOOP;
END $$;

-- Insert sample routines
DO $$
DECLARE
    section_rec RECORD;
    admin_id UUID;
BEGIN
    -- Create sample class schedules
    FOR section_rec IN 
        SELECT DISTINCT s.id as section_id, u.id as admin_id, d.code as dept_code
        FROM sections s
        JOIN batches b ON s.batch_id = b.id
        JOIN departments d ON b.department_id = d.id
        JOIN users u ON u.section_id = s.id AND u.role = 'section_admin'
        LIMIT 5
    LOOP
        -- Insert sample weekly routine
        INSERT INTO routines (title, description, section_id, day_of_week, start_time, end_time, room, subject, instructor_name, created_by) VALUES
            ('Programming Fundamentals', 'Introduction to programming concepts and problem solving', section_rec.section_id, 1, '09:00', '10:30', 'Room 301', 'Programming', 'Dr. John Smith', section_rec.admin_id),
            ('Database Systems', 'Database design, SQL, and database management systems', section_rec.section_id, 1, '11:00', '12:30', 'Room 302', 'Database', 'Prof. Jane Doe', section_rec.admin_id),
            ('Data Structures', 'Arrays, linked lists, stacks, queues, trees, and graphs', section_rec.section_id, 2, '09:00', '10:30', 'Room 303', 'Data Structures', 'Dr. Bob Johnson', section_rec.admin_id),
            ('Web Development', 'HTML, CSS, JavaScript, and modern web frameworks', section_rec.section_id, 3, '14:00', '15:30', 'Lab A', 'Web Dev', 'Ms. Alice Brown', section_rec.admin_id),
            ('Software Engineering', 'Software development lifecycle and project management', section_rec.section_id, 4, '10:00', '11:30', 'Room 304', 'Software Eng', 'Dr. Charlie Wilson', section_rec.admin_id);
    END LOOP;
END $$;

-- Create some sample notifications
INSERT INTO notifications (user_id, title, message, type) 
SELECT 
    u.id,
    'Welcome to NestTask!',
    'Welcome to the University Task Management System. Start by exploring your dashboard and checking your assigned tasks.',
    'info'
FROM users u
WHERE u.role = 'user'
LIMIT 10;

-- Summary of inserted data
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
FROM routines
UNION ALL
SELECT 
    'Notifications' as table_name, 
    COUNT(*) as record_count 
FROM notifications;

-- Display department structure summary
SELECT 
    d.name as department,
    COUNT(DISTINCT b.id) as batch_count,
    COUNT(DISTINCT s.id) as section_count,
    COUNT(DISTINCT u.id) as user_count
FROM departments d
LEFT JOIN batches b ON d.id = b.department_id
LEFT JOIN sections s ON b.id = s.batch_id
LEFT JOIN users u ON d.id = u.department_id
GROUP BY d.id, d.name
ORDER BY d.name;



