# Database Setup for Your Supabase Project

Your Supabase project: **https://vxdqsigpsxauvaalsrni.supabase.co**

## Run These SQL Scripts in Order

Go to your Supabase Dashboard → SQL Editor and run these scripts:

### 1. Create Schema & Tables
```sql
-- Copy and paste contents of: supabase/schema.sql
```

### 2. Set Up Security Policies  
```sql
-- Copy and paste contents of: supabase/rls_policies.sql
```

### 3. Add Performance Indexes
```sql
-- Copy and paste contents of: supabase/indexes.sql
```

### 4. Insert Sample Data
```sql
-- Copy and paste contents of: supabase/seed_data_fixed.sql
```

## Quick Test

After setup, run this to verify:

```sql
SELECT 
    'Departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 
    'Batches' as table_name, COUNT(*) as count FROM batches
UNION ALL
SELECT 
    'Sections' as table_name, COUNT(*) as count FROM sections;
```

Expected results:
- Departments: 5
- Batches: 105  
- Sections: 2,730

## Create Test Users

1. Go to **Authentication → Users** in Supabase
2. Add a user: `admin@diu.edu.bd` with password `admin12345`
3. Add a student: `student1@diu.edu.bd` with password `student123`

## Add User Profiles

After creating auth users, run this in SQL Editor:

```sql
-- Super Admin
SELECT insert_user_profile(
    'admin@diu.edu.bd',
    'System Administrator',
    NULL,
    'super_admin',
    'CSE',
    NULL,
    NULL
);

-- Student  
SELECT insert_user_profile(
    'student1@diu.edu.bd',
    'John Doe',
    'CSE-0001',
    'user',
    'CSE',
    'Batch 50', 
    'Section A'
);
```



