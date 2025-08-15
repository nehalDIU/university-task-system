# 🚀 Demo Setup Guide

This guide will help you quickly set up demo login credentials for testing the University Task Management System.

## 📋 Prerequisites

- [x] Supabase project created and configured
- [x] Database schema and seed data loaded
- [x] Environment variables set up
- [x] Node.js installed

## 🔧 Quick Setup (Automated)

### Option 1: Using the Script (Recommended)

1. **Set your Supabase Service Role Key:**
   ```bash
   # In your .env.local file, add:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Run the demo users creation script:**
   ```bash
   npm run setup:demo-users
   ```

3. **Execute the database user profiles setup:**
   - Open your Supabase SQL Editor
   - Run the contents of `supabase/demo_users_setup.sql`

4. **Start testing!** 🎉
   - Check `DEMO_CREDENTIALS.md` for login details
   - Try different user roles and features

---

## 🛠️ Manual Setup

### Option 2: Manual Creation in Supabase Dashboard

1. **Go to Supabase Authentication > Users**
2. **Create each demo user manually:**

   **Super Admin:**
   - Email: `admin@diu.edu.bd`
   - Password: `Admin123!`
   - Auto Confirm: ✅

   **Section Admins:**
   - `cse.admin@diu.edu.bd` / `CSEAdmin123!`
   - `swe.admin@diu.edu.bd` / `SWEAdmin123!`
   - `mct.admin@diu.edu.bd` / `MCTAdmin123!`

   **Students:**
   - `student1@diu.edu.bd` / `Student123!`
   - `student2@diu.edu.bd` / `Student123!`
   - `student3@diu.edu.bd` / `Student123!`
   - (Continue for student4-10...)

3. **Run the database setup:**
   - Execute `supabase/demo_users_setup.sql` in SQL Editor

---

## 🧪 Test Scenarios

### Complete Testing Flow:

1. **🔐 Super Admin Test**
   - Login: `admin@diu.edu.bd` / `Admin123!`
   - Test: Department management, user overview, system analytics

2. **👨‍🏫 Section Admin Test**
   - Login: `cse.admin@diu.edu.bd` / `CSEAdmin123!`
   - Test: Create tasks, manage students, view analytics

3. **🎓 Student Test**
   - Login: `student1@diu.edu.bd` / `Student123!`
   - Test: View tasks, submit assignments, check grades

4. **🔄 Full Workflow Test**
   - Admin creates task → Student submits → Admin reviews → Student sees feedback

---

## 📂 Files Created

- `DEMO_CREDENTIALS.md` - Complete list of demo login credentials
- `supabase/demo_users_setup.sql` - Database setup script for user profiles
- `scripts/create-demo-auth-users.js` - Automated auth user creation script
- `DEMO_SETUP_GUIDE.md` - This setup guide

---

## ❓ Troubleshooting

### Common Issues:

**🚫 "User already exists" error:**
- Check Supabase Auth dashboard for existing users
- Delete existing users if needed, then re-run setup

**🔑 "Invalid service role key" error:**
- Verify you're using the Service Role Key (not anon key)
- Check the key is correctly set in environment variables

**🗄️ "Auth user not found" error when running SQL:**
- Ensure auth users are created first
- Wait a moment after creating auth users before running SQL

**🌐 "Network error" when creating users:**
- Check internet connection
- Verify Supabase project URL is correct
- Try again after a few minutes (rate limiting)

---

## 🎯 Quick Commands

```bash
# Create demo auth users
npm run setup:demo-users

# Start development server
npm run dev

# Check if setup worked
# Visit your app and try logging in with demo credentials
```

---

## 📞 Need Help?

1. Check the browser console for authentication errors
2. Verify your `.env.local` file has correct values
3. Ensure Supabase project settings are configured properly
4. Check the `TROUBLESHOOTING.md` file for more detailed help

---

## 🎉 Success Checklist

- [ ] Demo auth users created (check Supabase Auth dashboard)
- [ ] User profiles created (check public.users table)
- [ ] Sample tasks and routines created
- [ ] Can login with super admin account
- [ ] Can login with section admin account  
- [ ] Can login with student account
- [ ] All user roles show appropriate dashboards
- [ ] Tasks and assignments are visible

**Ready to test! 🚀** Check `DEMO_CREDENTIALS.md` for all login details.


