# Supabase Configuration Setup

## Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vxdqsigpsxauvaalsrni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZHFzaWdwc3hhdXVhYWxzcm5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE5Mjc1MiwiZXhwIjoyMDcwNzY4NzUyfQ.xbgQToinhyZaeUh7NsClgPhQj4PFAlgFafv-yfQ8ND4

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_here_minimum_32_characters_long
NEXTAUTH_URL=http://localhost:3000

# Development vs Production
NODE_ENV=development
```

## ⚠️ Missing: Anon Key Required

You need to get your **anon (public) key** from Supabase:

1. Go to your Supabase project: https://vxdqsigpsxauvaalsrni.supabase.co
2. Navigate to **Settings > API**
3. Copy the **anon public** key
4. Replace `YOUR_ANON_KEY_HERE` in the `.env.local` file

## Your Project Details

- **Project URL**: https://vxdqsigpsxauvaalsrni.supabase.co
- **Service Role Key**: ✅ Provided
- **Anon Key**: ❌ Please get from Supabase Dashboard

## Next Steps

1. Create `.env.local` file with the content above
2. Get your anon key from Supabase Dashboard
3. Update the `NEXT_PUBLIC_SUPABASE_ANON_KEY` value
4. Generate a random secret for `NEXTAUTH_SECRET`
5. Run the database setup scripts



