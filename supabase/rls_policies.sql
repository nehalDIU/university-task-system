-- =============================================
-- Row Level Security (RLS) Policies
-- NestTask University Task Management System
-- =============================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'super_admin'
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is section admin
CREATE OR REPLACE FUNCTION is_section_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'section_admin'
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's section_id
CREATE OR REPLACE FUNCTION get_user_section_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT section_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's department_id
CREATE OR REPLACE FUNCTION get_user_department_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT department_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DEPARTMENTS TABLE POLICIES
-- =============================================

-- Everyone can read departments
CREATE POLICY "Everyone can read departments" ON departments
    FOR SELECT USING (true);

-- Only super admins can insert departments
CREATE POLICY "Super admins can insert departments" ON departments
    FOR INSERT WITH CHECK (is_super_admin());

-- Only super admins can update departments
CREATE POLICY "Super admins can update departments" ON departments
    FOR UPDATE USING (is_super_admin());

-- Only super admins can delete departments
CREATE POLICY "Super admins can delete departments" ON departments
    FOR DELETE USING (is_super_admin());

-- =============================================
-- BATCHES TABLE POLICIES
-- =============================================

-- Everyone can read batches
CREATE POLICY "Everyone can read batches" ON batches
    FOR SELECT USING (true);

-- Only super admins can insert batches
CREATE POLICY "Super admins can insert batches" ON batches
    FOR INSERT WITH CHECK (is_super_admin());

-- Only super admins can update batches
CREATE POLICY "Super admins can update batches" ON batches
    FOR UPDATE USING (is_super_admin());

-- Only super admins can delete batches
CREATE POLICY "Super admins can delete batches" ON batches
    FOR DELETE USING (is_super_admin());

-- =============================================
-- SECTIONS TABLE POLICIES
-- =============================================

-- Everyone can read sections
CREATE POLICY "Everyone can read sections" ON sections
    FOR SELECT USING (true);

-- Only super admins can insert sections
CREATE POLICY "Super admins can insert sections" ON sections
    FOR INSERT WITH CHECK (is_super_admin());

-- Only super admins can update sections
CREATE POLICY "Super admins can update sections" ON sections
    FOR UPDATE USING (is_super_admin());

-- Only super admins can delete sections
CREATE POLICY "Super admins can delete sections" ON sections
    FOR DELETE USING (is_super_admin());

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own profile and users in their section
CREATE POLICY "Users can read profiles" ON users
    FOR SELECT USING (
        auth.uid() = id OR  -- Own profile
        is_super_admin() OR  -- Super admins see all
        (is_section_admin() AND section_id = get_user_section_id()) OR  -- Section admins see their section
        (get_user_role() = 'user' AND section_id = get_user_section_id())  -- Students see their section mates
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        auth.uid() = id OR  -- Own profile
        is_super_admin() OR  -- Super admins can update any profile
        (is_section_admin() AND section_id = get_user_section_id() AND role = 'user')  -- Section admins can update their students
    );

-- Only authenticated users can insert (signup)
CREATE POLICY "Authenticated users can signup" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Only super admins can delete users
CREATE POLICY "Super admins can delete users" ON users
    FOR DELETE USING (is_super_admin());

-- =============================================
-- TASKS TABLE POLICIES
-- =============================================

-- Users can read tasks from their section or tasks they created
CREATE POLICY "Users can read relevant tasks" ON tasks
    FOR SELECT USING (
        is_super_admin() OR  -- Super admins see all
        section_id = get_user_section_id() OR  -- Users see their section's tasks
        created_by = auth.uid()  -- Users see tasks they created
    );

-- Section admins can insert tasks for their section
CREATE POLICY "Section admins can create tasks" ON tasks
    FOR INSERT WITH CHECK (
        is_super_admin() OR  -- Super admins can create tasks for any section
        (is_section_admin() AND section_id = get_user_section_id())  -- Section admins for their section
    );

-- Task creators and super admins can update tasks
CREATE POLICY "Task creators can update tasks" ON tasks
    FOR UPDATE USING (
        is_super_admin() OR  -- Super admins can update any task
        created_by = auth.uid()  -- Task creators can update their tasks
    );

-- Task creators and super admins can delete tasks
CREATE POLICY "Task creators can delete tasks" ON tasks
    FOR DELETE USING (
        is_super_admin() OR  -- Super admins can delete any task
        created_by = auth.uid()  -- Task creators can delete their tasks
    );

-- =============================================
-- TASK SUBMISSIONS TABLE POLICIES
-- =============================================

-- Users can read their own submissions and section admins can read their section's submissions
CREATE POLICY "Users can read relevant submissions" ON task_submissions
    FOR SELECT USING (
        is_super_admin() OR  -- Super admins see all
        user_id = auth.uid() OR  -- Users see their own submissions
        (is_section_admin() AND EXISTS (
            SELECT 1 FROM tasks t WHERE t.id = task_id AND t.section_id = get_user_section_id()
        ))  -- Section admins see submissions for their section's tasks
    );

-- Users can insert their own submissions
CREATE POLICY "Users can submit tasks" ON task_submissions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND  -- Users can only submit for themselves
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_id 
            AND t.section_id = get_user_section_id()
            AND t.is_published = true
        )  -- Task must be published and in user's section
    );

-- Users can update their own submissions, section admins can update submissions for review
CREATE POLICY "Users can update submissions" ON task_submissions
    FOR UPDATE USING (
        is_super_admin() OR  -- Super admins can update any submission
        user_id = auth.uid() OR  -- Users can update their own submissions
        (is_section_admin() AND EXISTS (
            SELECT 1 FROM tasks t WHERE t.id = task_id AND t.section_id = get_user_section_id()
        ))  -- Section admins can update submissions in their section
    );

-- Users can delete their own submissions (if not yet reviewed)
CREATE POLICY "Users can delete own submissions" ON task_submissions
    FOR DELETE USING (
        is_super_admin() OR  -- Super admins can delete any submission
        (user_id = auth.uid() AND status = 'pending')  -- Users can delete their pending submissions
    );

-- =============================================
-- ROUTINES TABLE POLICIES
-- =============================================

-- Users can read routines for their section
CREATE POLICY "Users can read section routines" ON routines
    FOR SELECT USING (
        is_super_admin() OR  -- Super admins see all
        section_id = get_user_section_id() OR  -- Users see their section's routines
        created_by = auth.uid()  -- Users see routines they created
    );

-- Section admins can create routines for their section
CREATE POLICY "Section admins can create routines" ON routines
    FOR INSERT WITH CHECK (
        is_super_admin() OR  -- Super admins can create routines for any section
        (is_section_admin() AND section_id = get_user_section_id())  -- Section admins for their section
    );

-- Routine creators and super admins can update routines
CREATE POLICY "Routine creators can update routines" ON routines
    FOR UPDATE USING (
        is_super_admin() OR  -- Super admins can update any routine
        created_by = auth.uid()  -- Routine creators can update their routines
    );

-- Routine creators and super admins can delete routines
CREATE POLICY "Routine creators can delete routines" ON routines
    FOR DELETE USING (
        is_super_admin() OR  -- Super admins can delete any routine
        created_by = auth.uid()  -- Routine creators can delete their routines
    );

-- =============================================
-- AUDIT LOGS TABLE POLICIES
-- =============================================

-- Only super admins can read audit logs
CREATE POLICY "Super admins can read audit logs" ON audit_logs
    FOR SELECT USING (is_super_admin());

-- Audit logs are inserted by triggers (no manual insert policy needed)
-- No update or delete policies (audit logs should be immutable)

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid() OR  -- Users see their own notifications
        is_super_admin()  -- Super admins see all notifications
    );

-- System can insert notifications (no user restriction)
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (
        user_id = auth.uid() OR  -- Users can update their own notifications
        is_super_admin()  -- Super admins can update any notification
    );

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (
        user_id = auth.uid() OR  -- Users can delete their own notifications
        is_super_admin()  -- Super admins can delete any notification
    );

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE routines;

-- =============================================
-- SECURITY SUMMARY
-- =============================================
/*
Security Model Summary:

1. SUPER ADMIN:
   - Full access to all tables and operations
   - Can manage departments, batches, sections
   - Can view all users, tasks, submissions
   - Can access audit logs

2. SECTION ADMIN:
   - Can manage tasks and routines for their section only
   - Can view and manage students in their section
   - Can review and grade task submissions
   - Cannot access other sections' data

3. USER (STUDENT):
   - Can view tasks assigned to their section
   - Can submit and update their own task submissions
   - Can view their section's routines and classmates
   - Can manage their own profile and notifications
   - Cannot access other sections' data

4. ANONYMOUS:
   - No access to any data
   - Can only signup (which creates a user record)

All policies are designed to enforce strict data isolation between sections
while allowing appropriate administrative access based on user roles.
*/



