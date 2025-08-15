# NestTask Database Setup

This directory contains all the SQL scripts needed to set up the complete NestTask database schema in Supabase.

## Database Structure

### Hierarchy
- **Departments** (5 total): CSE, SWE, MCT, CIS, ITM
- **Batches** (21 per department): Batch 50 → Batch 70
- **Sections** (26 per batch): Section A → Section Z
- **Total Sections**: 2,730 sections across all departments

### Tables Created

1. **`departments`** - University departments
2. **`batches`** - Academic batches within departments
3. **`sections`** - Class sections within batches
4. **`users`** - User profiles with role-based access
5. **`tasks`** - Task management with assignments
6. **`task_submissions`** - Student task submissions and grading
7. **`routines`** - Class schedules and timetables
8. **`audit_logs`** - System audit trail
9. **`notifications`** - User notifications

## Setup Instructions

### Option 1: Run Individual Scripts (Recommended)

1. **Create Schema and Tables**
   ```sql
   -- Copy and paste the contents of schema.sql into Supabase SQL Editor
   ```

2. **Create Performance Indexes**
   ```sql
   -- Copy and paste the contents of indexes.sql into Supabase SQL Editor
   ```

3. **Set Up Row Level Security**
   ```sql
   -- Copy and paste the contents of rls_policies.sql into Supabase SQL Editor
   ```

4. **Populate with Seed Data**
   ```sql
   -- Copy and paste the contents of seed_data.sql into Supabase SQL Editor
   ```

### Option 2: Quick Setup

1. **Run the initialization script** (if your Supabase environment supports file includes)
   ```sql
   -- Copy and paste the contents of init.sql into Supabase SQL Editor
   ```

## Files Description

### `schema.sql`
- Creates all database tables with proper relationships
- Sets up foreign key constraints
- Adds email domain validation (@diu.edu.bd only)
- Creates triggers for automatic updates
- Includes audit logging functions

### `seed_data.sql`
- Populates departments, batches, and sections
- Creates sample users for each role
- Adds sample tasks and routines
- Inserts test notifications

### `rls_policies.sql`
- Enables Row Level Security on all tables
- Creates role-based access policies
- Sets up helper functions for permission checks
- Configures realtime subscriptions

### `indexes.sql`
- Creates performance indexes on frequently queried columns
- Adds composite indexes for complex queries
- Includes full-text search indexes
- Sets up monitoring views for index usage

### `init.sql`
- Combined initialization script
- Includes verification queries
- Shows setup completion summary

## Security Features

### Row Level Security (RLS)
- **Students**: Can only access their section's data
- **Section Admins**: Can manage their section's tasks and users
- **Super Admins**: Full system access
- **Email Validation**: Only @diu.edu.bd emails allowed

### Audit Logging
- Automatic logging of all data changes
- User action tracking
- Resource modification history
- IP address and user agent capture

## Environment Setup

After running the database scripts, update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Sample Data

The seed script creates:
- 5 departments with full hierarchy
- 105 batches (21 per department)
- 2,730 sections (26 per batch)
- Sample users for each role
- Test tasks and routines
- Welcome notifications

### Sample Users Created

1. **Super Admin**
   - Email: `admin@diu.edu.bd`
   - Role: `super_admin`

2. **Section Admins** (one per department)
   - Email: `{dept}.admin@diu.edu.bd`
   - Role: `section_admin`

3. **Students** (5 per first section of each department)
   - Email: `student{n}@diu.edu.bd`
   - Role: `user`

## Verification

After setup, verify the installation:

```sql
-- Check table creation
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('departments', 'batches', 'sections', 'users', 'tasks', 'task_submissions', 'routines', 'audit_logs', 'notifications');

-- Check data population
SELECT 
    'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'batches', COUNT(*) FROM batches
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

## Performance Monitoring

Use these queries to monitor database performance:

```sql
-- View index usage
SELECT * FROM index_usage_stats ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT * FROM unused_indexes;

-- Update table statistics
SELECT update_table_statistics();
```

## Troubleshooting

### Common Issues

1. **Email constraint errors**: Ensure all test emails use @diu.edu.bd domain
2. **Foreign key violations**: Create departments before batches, batches before sections
3. **RLS access denied**: Check user roles and section assignments
4. **Performance issues**: Run `update_table_statistics()` periodically

### Support

For issues with the database setup:
1. Check the Supabase dashboard for error messages
2. Verify all scripts ran without errors
3. Ensure proper environment variables are set
4. Test authentication flow in the Next.js application

## Next Steps

After database setup:
1. Test user signup and login in the Next.js app
2. Verify role-based access in different dashboards
3. Test task creation and submission workflows
4. Configure realtime subscriptions for live updates



