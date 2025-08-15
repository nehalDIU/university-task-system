# NestTask Setup Instructions

This guide will help you set up the NestTask University Task Management System with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git installed

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Name your project "NestTask" or similar
5. Set a strong database password
6. Choose your region
7. Click "Create new project"

## Step 2: Set up Environment Variables

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following values:
   - Project URL
   - Public anon key
   - Service role key (keep this secret!)

3. Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Set up Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" to execute the schema

## Step 4: Set up Row Level Security

1. In SQL Editor, copy and paste the contents of `supabase/rls_policies.sql`
2. Click "Run" to execute the RLS policies

## Step 5: Add Indexes for Performance

1. In SQL Editor, copy and paste the contents of `supabase/indexes.sql`
2. Click "Run" to execute the indexes

## Step 6: Insert Basic Data (Departments, Batches, Sections)

1. In SQL Editor, copy and paste the contents of `supabase/seed_data_fixed.sql`
2. Click "Run" to execute the seed data

This will create:
- 5 Departments (CSE, SWE, MCT, CIS, ITM)
- 105 Batches (21 per department, Batch 50-70)
- 2,730 Sections (26 sections A-Z per batch)

## Step 7: Create Auth Users

### Option A: Using Supabase Dashboard (Recommended for testing)

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click "Add User"
3. Create test users with `@diu.edu.bd` emails:

**Super Admin:**
- Email: `admin@diu.edu.bd`
- Password: `admin12345`
- Confirm password

**Section Admins (one per department):**
- Email: `cse.admin@diu.edu.bd`, Password: `cseadmin123`
- Email: `swe.admin@diu.edu.bd`, Password: `sweadmin123`
- Email: `mct.admin@diu.edu.bd`, Password: `mctadmin123`
- Email: `cis.admin@diu.edu.bd`, Password: `cisadmin123`
- Email: `itm.admin@diu.edu.bd`, Password: `itmadmin123`

**Sample Students:**
- Email: `student1@diu.edu.bd`, Password: `student123`
- Email: `student2@diu.edu.bd`, Password: `student123`
- Email: `student3@diu.edu.bd`, Password: `student123`

### Option B: Using SQL (After creating auth users)

After creating auth users in the dashboard, add their profile data:

```sql
-- Add Super Admin Profile
SELECT insert_user_profile(
    'admin@diu.edu.bd',
    'System Administrator',
    NULL,
    'super_admin',
    'CSE',
    NULL,
    NULL
);

-- Add Section Admin Profiles
SELECT insert_user_profile(
    'cse.admin@diu.edu.bd',
    'CSE Section Admin',
    'CSE-ADM1',
    'section_admin',
    'CSE',
    'Batch 50',
    'Section A'
);

SELECT insert_user_profile(
    'swe.admin@diu.edu.bd',
    'SWE Section Admin',
    'SWE-ADM1',
    'section_admin',
    'SWE',
    'Batch 50',
    'Section A'
);

-- Add Student Profiles
SELECT insert_user_profile(
    'student1@diu.edu.bd',
    'John Doe',
    'CSE-0001',
    'user',
    'CSE',
    'Batch 50',
    'Section A'
);

SELECT insert_user_profile(
    'student2@diu.edu.bd',
    'Jane Smith',
    'CSE-0002',
    'user',
    'CSE',
    'Batch 50',
    'Section A'
);
```

## Step 8: Create Sample Tasks and Routines

After creating users, create sample data:

```sql
-- Get section ID for CSE Batch 50 Section A
DO $$
DECLARE
    section_uuid UUID;
    admin_uuid UUID;
BEGIN
    -- Get section ID
    SELECT s.id INTO section_uuid
    FROM sections s
    JOIN batches b ON s.batch_id = b.id
    JOIN departments d ON b.department_id = d.id
    WHERE d.code = 'CSE' AND b.name = 'Batch 50' AND s.name = 'Section A';
    
    -- Get admin user ID
    SELECT id INTO admin_uuid FROM users WHERE email = 'cse.admin@diu.edu.bd';
    
    -- Create sample data
    IF section_uuid IS NOT NULL AND admin_uuid IS NOT NULL THEN
        PERFORM create_sample_tasks(section_uuid, admin_uuid);
        PERFORM create_sample_routines(section_uuid, admin_uuid);
        RAISE NOTICE 'Sample tasks and routines created successfully!';
    END IF;
END $$;
```

## Step 9: Configure Email Templates (Optional)

1. Go to **Authentication > Email Templates**
2. Customize the signup and password reset emails
3. Update the redirect URLs to your domain

## Step 10: Install Dependencies and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Your application should now be running at `http://localhost:3000`

## Step 11: Test the Application

1. Visit `http://localhost:3000`
2. Click "Sign Up" and create a new account with `@diu.edu.bd` email
3. Login with existing test accounts:
   - Super Admin: `admin@diu.edu.bd`
   - Section Admin: `cse.admin@diu.edu.bd`
   - Student: `student1@diu.edu.bd`

## Troubleshooting

### Common Issues:

1. **Foreign Key Constraint Error**: Make sure you create auth users before adding profile data
2. **RLS Policy Error**: Ensure RLS policies are applied correctly
3. **Environment Variables**: Double-check your `.env.local` file

### Verify Setup:

```sql
-- Check if data was inserted correctly
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
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Tasks' as table_name, COUNT(*) as count FROM tasks;
```

Expected results:
- Departments: 5
- Batches: 105
- Sections: 2,730
- Users: (number of auth users created)
- Tasks: (number of sample tasks created)

## Production Deployment

For production deployment:
1. Update environment variables with production values
2. Set up proper domain and SSL
3. Configure email settings
4. Set up backup policies
5. Monitor performance and usage

## Support

If you encounter any issues, check:
1. Supabase project logs
2. Browser console for client-side errors
3. Network tab for API call failures



