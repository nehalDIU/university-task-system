-- =============================================
-- Simple Demo Setup
-- Just 3 accounts for quick testing
-- =============================================

-- Create user profiles for demo accounts
SELECT insert_user_profile('admin@diu.edu.bd', 'Demo Admin', NULL, 'super_admin', NULL, NULL, NULL);
SELECT insert_user_profile('teacher@diu.edu.bd', 'Demo Teacher', NULL, 'section_admin', 'CSE', 'Batch 50', 'Section A');
SELECT insert_user_profile('student@diu.edu.bd', 'Demo Student', 'CSE-DEMO', 'user', 'CSE', 'Batch 50', 'Section A');

-- Create a sample task for testing
INSERT INTO tasks (title, description, category, section_id, created_by, is_published, published_at, due_date)
SELECT 
    'Demo Assignment', 
    'This is a sample task for testing the system. Students can view and submit this assignment.',
    'assignment',
    s.id,
    u.id,
    true,
    NOW(),
    NOW() + INTERVAL '7 days'
FROM sections s
JOIN batches b ON s.batch_id = b.id
JOIN departments d ON b.department_id = d.id
JOIN users u ON u.role = 'section_admin'
WHERE d.code = 'CSE' AND b.name = 'Batch 50' AND s.name = 'Section A'
AND u.email = 'teacher@diu.edu.bd'
LIMIT 1;

-- Create welcome notifications
INSERT INTO notifications (user_id, title, message, type) 
SELECT 
    u.id,
    'Welcome to the Demo! 🎉',
    CASE 
        WHEN u.role = 'super_admin' THEN 'Welcome! You have full admin access to test the system.'
        WHEN u.role = 'section_admin' THEN 'Welcome! You can create and manage tasks for students.'
        ELSE 'Welcome! Check your assigned tasks and try submitting an assignment.'
    END,
    'info'
FROM users u
WHERE u.email IN ('admin@diu.edu.bd', 'teacher@diu.edu.bd', 'student@diu.edu.bd');

-- Show results
SELECT 
    'Demo setup completed!' as status,
    u.email,
    u.name,
    u.role
FROM users u 
WHERE u.email IN ('admin@diu.edu.bd', 'teacher@diu.edu.bd', 'student@diu.edu.bd')
ORDER BY 
    CASE u.role 
        WHEN 'super_admin' THEN 1 
        WHEN 'section_admin' THEN 2 
        WHEN 'user' THEN 3 
    END;


