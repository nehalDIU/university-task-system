-- =============================================
-- Performance Indexes
-- NestTask University Task Management System
-- =============================================

-- =============================================
-- DEPARTMENTS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- =============================================
-- BATCHES TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_batches_department_id ON batches(department_id);
CREATE INDEX IF NOT EXISTS idx_batches_name ON batches(name);
CREATE INDEX IF NOT EXISTS idx_batches_dept_name ON batches(department_id, name);

-- =============================================
-- SECTIONS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_sections_batch_id ON sections(batch_id);
CREATE INDEX IF NOT EXISTS idx_sections_name ON sections(name);
CREATE INDEX IF NOT EXISTS idx_sections_batch_name ON sections(batch_id, name);

-- =============================================
-- USERS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_batch_id ON users(batch_id);
CREATE INDEX IF NOT EXISTS idx_users_section_id ON users(section_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_role_section ON users(role, section_id) WHERE role IN ('user', 'section_admin');
CREATE INDEX IF NOT EXISTS idx_users_dept_batch_section ON users(department_id, batch_id, section_id);
CREATE INDEX IF NOT EXISTS idx_users_active_role ON users(is_active, role);

-- =============================================
-- TASKS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_tasks_section_id ON tasks(section_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_published ON tasks(is_published);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_section_status ON tasks(section_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_section_published ON tasks(section_id, is_published);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_status ON tasks(created_by, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date_status ON tasks(due_date, status) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_published_due_date ON tasks(is_published, due_date) WHERE is_published = true;

-- Index for overdue tasks query
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks(due_date, status) 
    WHERE due_date < NOW() AND status IN ('pending', 'in_progress') AND is_published = true;

-- =============================================
-- TASK SUBMISSIONS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_submitted_at ON task_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_task_submissions_reviewed_by ON task_submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_task_submissions_created_at ON task_submissions(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_status ON task_submissions(task_id, status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_status ON task_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_user ON task_submissions(task_id, user_id);

-- Index for pending reviews
CREATE INDEX IF NOT EXISTS idx_task_submissions_pending_review ON task_submissions(status, submitted_at) 
    WHERE status = 'submitted';

-- =============================================
-- ROUTINES TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_routines_section_id ON routines(section_id);
CREATE INDEX IF NOT EXISTS idx_routines_created_by ON routines(created_by);
CREATE INDEX IF NOT EXISTS idx_routines_day_of_week ON routines(day_of_week);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_start_time ON routines(start_time);
CREATE INDEX IF NOT EXISTS idx_routines_subject ON routines(subject);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_routines_section_day ON routines(section_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_routines_section_active ON routines(section_id, is_active);
CREATE INDEX IF NOT EXISTS idx_routines_day_time ON routines(day_of_week, start_time, end_time);

-- Index for weekly schedule queries
CREATE INDEX IF NOT EXISTS idx_routines_weekly_schedule ON routines(section_id, day_of_week, start_time) 
    WHERE is_active = true;

-- =============================================
-- AUDIT LOGS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite indexes for common audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_date ON audit_logs(action, created_at);

-- Index for recent activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_recent ON audit_logs(created_at DESC) 
    WHERE created_at > (NOW() - INTERVAL '30 days');

-- =============================================
-- NOTIFICATIONS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) 
    WHERE is_read = false;

-- Index for cleanup of old notifications
CREATE INDEX IF NOT EXISTS idx_notifications_old ON notifications(created_at) 
    WHERE created_at < (NOW() - INTERVAL '90 days');

-- =============================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================

-- Full-text search for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_fts ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Full-text search for users
CREATE INDEX IF NOT EXISTS idx_users_fts ON users USING gin(to_tsvector('english', name || ' ' || email || ' ' || COALESCE(student_id, '')));

-- =============================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- =============================================

-- Index for active users only
CREATE INDEX IF NOT EXISTS idx_users_active_only ON users(role, section_id, created_at) 
    WHERE is_active = true;

-- Index for published tasks only
CREATE INDEX IF NOT EXISTS idx_tasks_published_only ON tasks(section_id, due_date, status) 
    WHERE is_published = true;

-- Index for pending submissions only
CREATE INDEX IF NOT EXISTS idx_submissions_pending_only ON task_submissions(task_id, submitted_at) 
    WHERE status = 'submitted';

-- Index for current week routines
CREATE INDEX IF NOT EXISTS idx_routines_current_week ON routines(section_id, day_of_week, start_time) 
    WHERE is_active = true AND created_at > (NOW() - INTERVAL '7 days');

-- =============================================
-- BTREE INDEXES FOR SORTING AND RANGE QUERIES
-- =============================================

-- For date range queries on tasks
CREATE INDEX IF NOT EXISTS idx_tasks_date_range ON tasks(created_at, due_date) 
    WHERE is_published = true;

-- For grade analysis on submissions
CREATE INDEX IF NOT EXISTS idx_submissions_grade_analysis ON task_submissions(task_id, grade, status) 
    WHERE grade IS NOT NULL;

-- For user activity tracking
CREATE INDEX IF NOT EXISTS idx_users_activity ON users(last_login_at, is_active);

-- =============================================
-- HASH INDEXES FOR EQUALITY LOOKUPS
-- =============================================

-- For exact matches on email (faster than btree for equality)
CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users USING hash(email);

-- For exact matches on student_id
CREATE INDEX IF NOT EXISTS idx_users_student_id_hash ON users USING hash(student_id) 
    WHERE student_id IS NOT NULL;

-- =============================================
-- INDEX MAINTENANCE
-- =============================================

-- Function to analyze table statistics (run periodically)
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE departments;
    ANALYZE batches;
    ANALYZE sections;
    ANALYZE users;
    ANALYZE tasks;
    ANALYZE task_submissions;
    ANALYZE routines;
    ANALYZE audit_logs;
    ANALYZE notifications;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INDEX MONITORING QUERIES
-- =============================================

-- View to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- View to find unused indexes
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelname::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelname::regclass) DESC;

-- =============================================
-- PERFORMANCE NOTES
-- =============================================

/*
Index Strategy Summary:

1. PRIMARY KEYS: Automatically indexed by PostgreSQL
2. FOREIGN KEYS: Explicitly indexed for join performance
3. QUERY PATTERNS: Indexes designed for common application queries
4. COMPOSITE INDEXES: For multi-column WHERE clauses and sorting
5. PARTIAL INDEXES: For filtered queries (active users, published tasks, etc.)
6. FULL-TEXT SEARCH: For searching content within text fields
7. COVERING INDEXES: Include frequently accessed columns

Maintenance Recommendations:
- Run ANALYZE periodically to update statistics
- Monitor index usage with the provided views
- Remove unused indexes to improve write performance
- Consider index-only scans for read-heavy workloads

Performance Testing:
- Use EXPLAIN ANALYZE for query plan analysis
- Monitor pg_stat_user_indexes for usage patterns
- Test query performance with realistic data volumes
*/



