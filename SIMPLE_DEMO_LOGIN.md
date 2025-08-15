# 🔐 Simple Demo Login

Quick and easy demo accounts for testing the University Task Management System.

## 🚀 Demo Accounts

### 👨‍💼 Super Admin
```
Email: admin@diu.edu.bd
Password: admin123
```

### 👨‍🏫 Section Admin  
```
Email: teacher@diu.edu.bd
Password: teacher123
```

### 🎓 Student
```
Email: student@diu.edu.bd
Password: student123
```

---

## 📝 Quick Setup

### Step 1: Create Auth Users in Supabase
1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **"Add User"** and create these 3 users:
   - `admin@diu.edu.bd` / `admin123` ✅ Auto confirm
   - `teacher@diu.edu.bd` / `teacher123` ✅ Auto confirm  
   - `student@diu.edu.bd` / `student123` ✅ Auto confirm

### Step 2: Run This SQL
Copy and paste this into **Supabase SQL Editor**:

```sql
-- Create user profiles for demo accounts
SELECT insert_user_profile('admin@diu.edu.bd', 'Demo Admin', NULL, 'super_admin', NULL, NULL, NULL);
SELECT insert_user_profile('teacher@diu.edu.bd', 'Demo Teacher', NULL, 'section_admin', 'CSE', 'Batch 50', 'Section A');
SELECT insert_user_profile('student@diu.edu.bd', 'Demo Student', 'CSE-DEMO', 'user', 'CSE', 'Batch 50', 'Section A');

-- Create a sample task for testing
INSERT INTO tasks (title, description, category, section_id, created_by, is_published, published_at, due_date)
SELECT 
    'Demo Assignment', 
    'This is a sample task for testing the system.',
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
```

---

## 🧪 Test Login

1. **Start your app:** `npm run dev`
2. **Go to login page**
3. **Test each account:**
   - Admin → Full system access
   - Teacher → Create/manage tasks  
   - Student → View/submit tasks

---

## ✅ That's it!

Just 3 accounts, simple passwords, one SQL script. Ready to test! 🎉


