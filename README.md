# University Task System

A comprehensive task management system designed for universities to streamline academic workflows and enhance productivity across all departments.

## Features

### For Students
- View assigned tasks and deadlines
- Track task progress and completion
- Calendar view for better scheduling
- Profile management

### For Section Admins
- Create and manage tasks for students
- View section member progress
- Manage class schedules and routines
- Monitor task completion rates

### For Super Admins
- System-wide user management
- Department and batch administration
- Audit logs and system monitoring
- Complete system oversight

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **UI Components**: Custom components with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd university-task-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase project URL and anon key
   - Add any additional configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
university-task-system/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── student/       # Student dashboard
│   │   ├── section-admin/ # Section admin dashboard
│   │   └── super-admin/   # Super admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   ├── navigation/       # Navigation components
│   └── feedback/         # Feedback components
├── lib/                  # Utilities and configuration
│   ├── supabase/         # Supabase client configuration
│   ├── validators/       # Zod validation schemas
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # General utilities
├── context/             # React contexts
├── types/               # TypeScript type definitions
└── middleware.ts        # Route protection middleware
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## ⚠️ IMPORTANT: Database Setup Required

**Before running the application, you MUST complete the database setup process.**

👉 **[COMPLETE SETUP GUIDE](./SETUP_INSTRUCTIONS.md)** 👈

The application requires:
- Supabase project configuration
- Database schema setup
- Row Level Security policies
- Sample data insertion
- Auth user creation

Quick setup summary:
1. Create Supabase project
2. Run `supabase/schema.sql` - Creates tables and relationships
3. Run `supabase/rls_policies.sql` - Sets up security policies  
4. Run `supabase/seed_data_fixed.sql` - Adds departments, batches, sections
5. Create auth users in Supabase dashboard
6. Configure environment variables

## Authentication & Authorization

The system supports three user roles:

1. **Student**: Access to personal dashboard, tasks, and calendar
2. **Section Admin**: Manage section tasks, schedules, and student progress
3. **Super Admin**: Full system access including user management and audit logs

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling

## Deployment

The application can be deployed on any platform that supports Next.js:

1. **Vercel** (Recommended)
2. **Netlify**
3. **Railway**
4. **Custom server**

Ensure all environment variables are properly configured in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please contact the development team or create an issue in the repository.
