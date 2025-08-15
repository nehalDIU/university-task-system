# 🔐 Demo Login Credentials

This file contains demo login credentials for testing the University Task Management System. Use these accounts to test different user roles and functionalities.

> **⚠️ Important:** These are demo credentials for testing purposes only. In production, use strong, unique passwords and proper authentication methods.

---

## 🚀 Quick Login Credentials

### Super Administrator
- **Email:** `admin@diu.edu.bd`
- **Password:** `Admin123!`
- **Role:** Super Admin
- **Access:** Full system access, user management, department management

### Section Administrators

#### CSE Department Admin
- **Email:** `cse.admin@diu.edu.bd`
- **Password:** `CSEAdmin123!`
- **Role:** Section Admin
- **Department:** Computer Science and Engineering
- **Section:** CSE Batch 50 - Section A

#### SWE Department Admin
- **Email:** `swe.admin@diu.edu.bd`
- **Password:** `SWEAdmin123!`
- **Role:** Section Admin
- **Department:** Software Engineering
- **Section:** SWE Batch 50 - Section A

#### MCT Department Admin
- **Email:** `mct.admin@diu.edu.bd`
- **Password:** `MCTAdmin123!`
- **Role:** Section Admin
- **Department:** Multimedia and Creative Technology
- **Section:** MCT Batch 50 - Section A

### Students

#### CSE Students
- **Email:** `student1@diu.edu.bd`
- **Password:** `Student123!`
- **Student ID:** `CSE-0001`
- **Section:** CSE Batch 50 - Section A

- **Email:** `student2@diu.edu.bd`
- **Password:** `Student123!`
- **Student ID:** `CSE-0002`
- **Section:** CSE Batch 50 - Section A

#### SWE Students
- **Email:** `student6@diu.edu.bd`
- **Password:** `Student123!`
- **Student ID:** `SWE-0006`
- **Section:** SWE Batch 50 - Section A

- **Email:** `student7@diu.edu.bd`
- **Password:** `Student123!`
- **Student ID:** `SWE-0007`
- **Section:** SWE Batch 50 - Section A

---

## 🧪 Testing Scenarios

### 1. **Super Admin Testing**
Login as `admin@diu.edu.bd` to test:
- ✅ Department management
- ✅ User management (create/edit/delete users)
- ✅ System overview and analytics
- ✅ Audit logs viewing
- ✅ Global system settings

### 2. **Section Admin Testing**
Login as any `*.admin@diu.edu.bd` to test:
- ✅ Task creation and management
- ✅ Student progress tracking
- ✅ Routine/schedule management
- ✅ Section-specific analytics
- ✅ Grade and feedback management

### 3. **Student Testing**
Login as any `student*@diu.edu.bd` to test:
- ✅ View assigned tasks
- ✅ Submit assignments
- ✅ Check grades and feedback
- ✅ View class schedules
- ✅ Dashboard and notifications

---

## 🔧 Setup Instructions

### For Supabase Authentication:

1. **Create Auth Users in Supabase Dashboard:**
   ```
   Go to Authentication > Users > Add User
   ```

2. **Add each demo user with their email and password:**
   - Use the emails and passwords listed above
   - Make sure to use the exact email format
   - Set email as "confirmed" in Supabase

3. **Run the database seed script:**
   ```sql
   -- This will create the user profiles linked to auth users
   SELECT insert_user_profile('admin@diu.edu.bd', 'System Administrator', NULL, 'super_admin', NULL, NULL, NULL);
   SELECT insert_user_profile('cse.admin@diu.edu.bd', 'CSE Section Admin', NULL, 'section_admin', 'CSE', 'Batch 50', 'Section A');
   SELECT insert_user_profile('swe.admin@diu.edu.bd', 'SWE Section Admin', NULL, 'section_admin', 'SWE', 'Batch 50', 'Section A');
   SELECT insert_user_profile('student1@diu.edu.bd', 'Student 1 (CSE)', 'CSE-0001', 'user', 'CSE', 'Batch 50', 'Section A');
   SELECT insert_user_profile('student2@diu.edu.bd', 'Student 2 (CSE)', 'CSE-0002', 'user', 'CSE', 'Batch 50', 'Section A');
   ```

---

## 📱 Quick Test Flow

### Complete User Journey Test:
1. **Login as Super Admin** → Create departments, manage users
2. **Login as Section Admin** → Create tasks, manage students
3. **Login as Student** → View tasks, submit assignments
4. **Back to Section Admin** → Review submissions, provide feedback
5. **Back to Student** → View grades and feedback

---

## 🛡️ Security Notes

- All passwords follow the pattern: `[Role][Dept]123!`
- Passwords include uppercase, lowercase, numbers, and special characters
- In production, implement proper password policies
- Use environment variables for sensitive data
- Enable 2FA for admin accounts in production

---

## 🔄 Additional Test Accounts

If you need more test accounts, follow this pattern:

```
Email: [role][number]@diu.edu.bd
Password: [Role]123!
Examples:
- teacher1@diu.edu.bd / Teacher123!
- admin2@diu.edu.bd / Admin123!
- student10@diu.edu.bd / Student123!
```

---

## 📞 Support

If you encounter issues with these demo credentials:
1. Check Supabase Auth dashboard for user creation
2. Verify database user profiles are created
3. Check browser console for authentication errors
4. Ensure all environment variables are set correctly

---

*Last updated: $(date)*
*File: DEMO_CREDENTIALS.md*


