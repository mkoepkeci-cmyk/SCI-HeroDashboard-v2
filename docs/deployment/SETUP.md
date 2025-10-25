# Development Setup Guide

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher
- **Git**
- **Supabase account** with project already configured

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd SCI-HeroDashboard-v2-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these values:**
1. Log in to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port).

## Available Scripts

### Development
```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler (no emit)
```

## Project Structure

```
/
├── src/                      # Application source code
│   ├── App.tsx              # Main app component with routing
│   ├── components/          # React components
│   ├── lib/                 # Utilities and Supabase client
│   └── audit-page.tsx       # Audit and stats page
├── supabase/
│   └── migrations/          # Database schema migrations
├── documents/               # Business documentation and reference data
├── docs/                    # Technical documentation (this folder)
├── archive/                 # Historical development artifacts
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Database Setup

The database schema is already configured in Supabase. All tables are created and populated with data synced from Google Sheets.

**If setting up a new environment:**
1. Create a new Supabase project
2. Run migrations from `/supabase/migrations/` in order (sorted by filename)
3. Set up Google Sheets sync (if applicable)
4. Populate initial data

See `/docs/database/MIGRATION_HISTORY.md` for details on each migration.

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - PostgreSQL database and API
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Common Issues

### Port Already in Use
If port 5173 is in use, Vite will automatically try the next available port (5174, 5175, etc.).

### Supabase Connection Errors
- Verify `.env` file exists and has correct credentials
- Check Supabase project is active and accessible
- Confirm RLS policies allow anonymous read access

### TypeScript Errors
Run `npm run typecheck` to see all TypeScript errors. Most common issues:
- Missing type definitions
- Incorrect prop types
- Null/undefined handling

## Development Workflow

1. **Make changes** in `/src/` files
2. **Hot reload** happens automatically (Vite HMR)
3. **Check console** for any errors
4. **Run lint** before committing: `npm run lint`
5. **Commit** with descriptive messages

## Next Steps

- Review [Architecture Documentation](/docs/architecture/)
- Understand [Database Schema](/docs/database/SCHEMA_OVERVIEW.md)
- Read [CLAUDE.md](/CLAUDE.md) for development guidelines
