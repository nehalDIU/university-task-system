# ⚡ Quick Demo Setup

**Get testing in 2 minutes!**

## 🔥 Step 1: Create 3 Users in Supabase

Go to **Supabase Dashboard → Authentication → Users** and add:

| Email | Password | Role |
|-------|----------|------|
| `admin@diu.edu.bd` | `admin123` | Super Admin |
| `teacher@diu.edu.bd` | `teacher123` | Teacher |
| `student@diu.edu.bd` | `student123` | Student |

**✅ Check "Auto Confirm Email" for each user**

---

## 🔥 Step 2: Run 1 SQL Script

Go to **Supabase SQL Editor** and run:
```sql
-- Copy/paste contents of: supabase/simple_demo_setup.sql
```

---

## 🔥 Step 3: Test Login

```bash
npm run dev
```

**Login and test:**
- 👨‍💼 Admin: `admin@diu.edu.bd` / `admin123`
- 👨‍🏫 Teacher: `teacher@diu.edu.bd` / `teacher123`  
- 🎓 Student: `student@diu.edu.bd` / `student123`

---

## 🎉 Done!

That's it! You now have a working demo with:
✅ 3 test accounts  
✅ Sample task to test  
✅ All user roles working  

**Need more accounts?** Check `DEMO_CREDENTIALS.md` for the full setup.


