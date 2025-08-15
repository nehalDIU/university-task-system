# Troubleshooting Guide

## Common Setup Issues

### 1. Foreign Key Constraint Error

**Error**: `insert or update on table "users" violates foreign key constraint "users_id_fkey"`

**Cause**: This happens when trying to insert users into the custom `users` table before creating corresponding auth users in Supabase Auth.

**Solution**:
1. Create auth users first in Supabase Dashboard (Authentication > Users)
2. Then use the `insert_user_profile()` function to add profile data
3. Or use the fixed seed data script: `supabase/seed_data_fixed.sql`

**Why this happens**: Our `users` table references Supabase's `auth.users` table. The `id` field in our users table must match an existing `id` in `auth.users`.

### 2. Permission Denied Errors

**Error**: `permission denied for table users` or similar RLS errors

**Cause**: Row Level Security (RLS) policies not applied correctly

**Solution**:
1. Run `supabase/rls_policies.sql` in Supabase SQL Editor
2. Ensure you're authenticated when making queries
3. Check that user roles are set correctly

### 3. Environment Variables Not Working

**Error**: Cannot connect to Supabase or authentication fails

**Cause**: Missing or incorrect environment variables

**Solution**:
1. Check `.env.local` file exists in project root
2. Verify all required variables are set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
3. Restart development server after adding variables

### 4. Signup Form Validation Errors

**Error**: Email domain validation fails or dropdown empty

**Cause**: 
- Database not seeded with departments/batches/sections
- Client-side validation schema issues

**Solution**:
1. Ensure seed data is loaded: `supabase/seed_data_fixed.sql`
2. Check browser console for API errors
3. Verify Supabase connection

### 5. Empty Dropdowns in Signup

**Error**: Department, Batch, or Section dropdowns are empty

**Cause**: Data not seeded or API calls failing

**Solution**:
1. Run seed data script to populate departments, batches, sections
2. Check Supabase project is active and accessible
3. Verify API keys in environment variables

### 6. Build/Compilation Errors

**Error**: TypeScript or build errors

**Common issues**:
- Missing dependencies: Run `npm install`
- Type mismatches: Check `lib/supabase/types.ts` matches your schema
- Import errors: Verify file paths and exports

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Build check
npm run build
```

### 7. Database Schema Errors

**Error**: Table doesn't exist or column not found

**Cause**: Schema not applied or outdated

**Solution**:
1. Drop and recreate tables if needed
2. Run complete schema: `supabase/schema.sql`
3. Ensure all migrations are applied

### 8. Auth Redirect Issues

**Error**: Authentication redirects not working

**Cause**: Incorrect redirect URLs or middleware issues

**Solution**:
1. Check `middleware.ts` is properly configured
2. Verify `NEXTAUTH_URL` in environment variables
3. Update Supabase Auth settings if needed

## Debugging Steps

### 1. Check Database Connection
```sql
-- Run in Supabase SQL Editor
SELECT 
    'Departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 
    'Batches' as table_name, COUNT(*) as count FROM batches
UNION ALL
SELECT 
    'Sections' as table_name, COUNT(*) as count FROM sections
UNION ALL
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users;
```

Expected results:
- Departments: 5
- Batches: 105  
- Sections: 2,730
- Users: (number you created)

### 2. Check User Profiles
```sql
-- Verify user data is correctly linked
SELECT 
    u.email,
    u.name,
    u.role,
    d.name as department,
    b.name as batch,
    s.name as section
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN batches b ON u.batch_id = b.id
LEFT JOIN sections s ON u.section_id = s.id;
```

### 3. Test Authentication
```sql
-- Check if auth users exist
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;
```

### 4. Verify RLS Policies
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## Need More Help?

1. **Check Supabase Logs**: Go to your Supabase project > Logs
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Look for failed API requests
4. **Supabase Database**: Use the Table Editor to verify data

## Reset Instructions

If you need to start over:

1. **Drop all tables** (Supabase SQL Editor):
```sql
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS task_submissions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
```

2. **Re-run setup**:
- `supabase/schema.sql`
- `supabase/rls_policies.sql`
- `supabase/indexes.sql`
- `supabase/seed_data_fixed.sql`

3. **Recreate auth users** in Supabase Dashboard

4. **Add user profiles** using `insert_user_profile()` function



