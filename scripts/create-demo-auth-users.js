/**
 * Script to create demo authentication users in Supabase
 * Run this script to automatically create all demo auth users
 * 
 * Requirements:
 * - Node.js
 * - @supabase/supabase-js package
 * - Supabase Service Role Key (not anon key!)
 * 
 * Usage:
 * 1. Set your SUPABASE_SERVICE_ROLE_KEY in environment variables
 * 2. Run: node scripts/create-demo-auth-users.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Demo users data
const DEMO_USERS = [
  // Super Admin
  {
    email: 'admin@diu.edu.bd',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'super_admin'
  },
  
  // Section Administrators
  {
    email: 'cse.admin@diu.edu.bd',
    password: 'CSEAdmin123!',
    name: 'CSE Section Admin',
    role: 'section_admin'
  },
  {
    email: 'swe.admin@diu.edu.bd',
    password: 'SWEAdmin123!',
    name: 'SWE Section Admin',
    role: 'section_admin'
  },
  {
    email: 'mct.admin@diu.edu.bd',
    password: 'MCTAdmin123!',
    name: 'MCT Section Admin',
    role: 'section_admin'
  },
  {
    email: 'cis.admin@diu.edu.bd',
    password: 'CISAdmin123!',
    name: 'CIS Section Admin',
    role: 'section_admin'
  },
  {
    email: 'itm.admin@diu.edu.bd',
    password: 'ITMAdmin123!',
    name: 'ITM Section Admin',
    role: 'section_admin'
  },
  
  // Students
  {
    email: 'student1@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 1 (CSE)',
    role: 'user'
  },
  {
    email: 'student2@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 2 (CSE)',
    role: 'user'
  },
  {
    email: 'student3@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 3 (CSE)',
    role: 'user'
  },
  {
    email: 'student4@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 4 (CSE)',
    role: 'user'
  },
  {
    email: 'student5@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 5 (CSE)',
    role: 'user'
  },
  {
    email: 'student6@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 6 (SWE)',
    role: 'user'
  },
  {
    email: 'student7@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 7 (SWE)',
    role: 'user'
  },
  {
    email: 'student8@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 8 (SWE)',
    role: 'user'
  },
  {
    email: 'student9@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 9 (MCT)',
    role: 'user'
  },
  {
    email: 'student10@diu.edu.bd',
    password: 'Student123!',
    name: 'Student 10 (MCT)',
    role: 'user'
  }
];

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDemoAuthUsers() {
  console.log('🚀 Starting demo auth users creation...\n');
  
  // Validate configuration
  if (!SUPABASE_URL || SUPABASE_URL === 'your-supabase-url') {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL not set or invalid');
    process.exit(1);
  }
  
  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not set or invalid');
    console.error('   You need the Service Role Key (not the anon key) for user creation');
    process.exit(1);
  }
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];
  
  for (const userData of DEMO_USERS) {
    try {
      console.log(`Creating user: ${userData.email}...`);
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });
      
      if (error) {
        console.log(`❌ Failed: ${userData.email} - ${error.message}`);
        errorCount++;
        results.push({ email: userData.email, status: 'failed', error: error.message });
      } else {
        console.log(`✅ Created: ${userData.email} (ID: ${data.user.id})`);
        successCount++;
        results.push({ email: userData.email, status: 'success', id: data.user.id });
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Failed: ${userData.email} - ${error.message}`);
      errorCount++;
      results.push({ email: userData.email, status: 'failed', error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Demo Auth Users Creation Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`❌ Failed to create: ${errorCount} users`);
  console.log(`📝 Total attempted: ${DEMO_USERS.length} users\n`);
  
  // Display results by role
  const roleGroups = {
    super_admin: results.filter(r => DEMO_USERS.find(u => u.email === r.email)?.role === 'super_admin'),
    section_admin: results.filter(r => DEMO_USERS.find(u => u.email === r.email)?.role === 'section_admin'),
    user: results.filter(r => DEMO_USERS.find(u => u.email === r.email)?.role === 'user')
  };
  
  Object.entries(roleGroups).forEach(([role, users]) => {
    if (users.length > 0) {
      console.log(`\n${role.toUpperCase()} ACCOUNTS:`);
      users.forEach(user => {
        const status = user.status === 'success' ? '✅' : '❌';
        console.log(`  ${status} ${user.email}`);
      });
    }
  });
  
  if (successCount > 0) {
    console.log('\n🎉 Next Steps:');
    console.log('1. Run the database seed script to create user profiles:');
    console.log('   Execute: supabase/demo_users_setup.sql');
    console.log('2. Check DEMO_CREDENTIALS.md for login credentials');
    console.log('3. Start testing your application!');
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some users failed to create. Common issues:');
    console.log('   - User already exists');
    console.log('   - Invalid service role key');
    console.log('   - Network connectivity issues');
    console.log('   - Rate limiting (try again in a few minutes)');
  }
}

// Export for potential module usage
module.exports = { createDemoAuthUsers, DEMO_USERS };

// Run if called directly
if (require.main === module) {
  createDemoAuthUsers()
    .then(() => {
      console.log('\n✨ Demo auth users creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}


