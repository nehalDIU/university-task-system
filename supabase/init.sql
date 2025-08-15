-- =============================================
-- NestTask Database Initialization Script
-- University Task Management System
-- 
-- This script combines all database setup files:
-- 1. Schema creation
-- 2. Indexes for performance
-- 3. Row Level Security policies
-- 4. Seed data
-- =============================================

-- Run this script in your Supabase SQL editor or via psql

-- First, create the schema and all tables
\i schema.sql

-- Then create performance indexes
\i indexes.sql

-- Set up Row Level Security policies
\i rls_policies.sql

-- Finally, populate with seed data
\i seed_data.sql

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify table creation
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('departments', 'batches', 'sections', 'users', 'tasks', 'task_submissions', 'routines', 'audit_logs', 'notifications')
ORDER BY table_name;

-- Verify data insertion
SELECT 
    'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'batches', COUNT(*) FROM batches
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'routines', COUNT(*) FROM routines
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('departments', 'batches', 'sections', 'users', 'tasks', 'task_submissions', 'routines', 'audit_logs', 'notifications');

-- Verify indexes are created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('departments', 'batches', 'sections', 'users', 'tasks', 'task_submissions', 'routines', 'audit_logs', 'notifications')
ORDER BY tablename, indexname;

-- Display department hierarchy summary
SELECT 
    d.name as department,
    d.code,
    COUNT(DISTINCT b.id) as batch_count,
    COUNT(DISTINCT s.id) as section_count
FROM departments d
LEFT JOIN batches b ON d.id = b.department_id
LEFT JOIN sections s ON b.id = s.batch_id
GROUP BY d.id, d.name, d.code
ORDER BY d.name;

-- =============================================
-- SETUP COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'NestTask Database Setup Complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 5 Departments (CSE, SWE, MCT, CIS, ITM)';
    RAISE NOTICE '- 105 Batches (21 per department: Batch 50-70)';
    RAISE NOTICE '- 2,730 Sections (26 per batch: Section A-Z)';
    RAISE NOTICE '- Sample users and test data';
    RAISE NOTICE '- Row Level Security policies';
    RAISE NOTICE '- Performance indexes';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env.local with Supabase credentials';
    RAISE NOTICE '2. Test authentication in your Next.js app';
    RAISE NOTICE '3. Create real users via the signup form';
    RAISE NOTICE '==============================================';
END $$;



