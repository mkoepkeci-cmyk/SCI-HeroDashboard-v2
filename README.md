# SCI Hero Dashboard

> **A comprehensive dashboard for tracking and visualizing the impact of CommonSpirit Health's System Clinical Informatics team**

Showcases **409 initiatives** across **16 team members** with **$276M+ in revenue impact** and validated performance metrics.

---

## Overview

The SCI Hero Dashboard is a React-based single-page application that provides visibility into:

- **Team Member Portfolios** - Individual work distributions, assignments, and key highlights
- **Initiative Tracking** - Detailed metrics, financial impact, performance data, and success stories
- **Governance Workflow** - SCI consultation request intake and management
- **Effort Tracking** - Weekly time logging for capacity management
- **Workload Analytics** - Team utilization trends and forecasting

---

## Key Features

### 📊 Dashboard
- **Overview Mode**: Team-level metrics showing total initiatives, revenue impact, and efficiency gains
- **Team Mode**: Individual portfolios with work type distribution and categorized initiatives

### 📝 SCI Requests (Governance Portal)
- Intake form for new SCI consultation requests
- Workflow management (Draft → Review → Approval → Conversion)
- One-click conversion of approved requests to formal initiatives

### 🔍 Browse Initiatives
- Searchable library of all 409 initiatives
- Organized into 5 categories (System Initiatives, Projects, Tickets, Governance, Other)
- Detailed cards showing metrics, financial impact, performance data, and success stories

### ⏱️ My Effort (Time Tracking)
- Weekly effort logging with bulk entry table
- Effort size shortcuts (XS to XXL: 1.5 to 25 hours)
- Inline editing, reassignment, and quick actions
- Skip functionality for "no work" weeks

### 📈 Workload Analytics
- Individual and team capacity utilization
- 12-week effort trends
- Hours by work type and effort size
- Visual sparklines and charts

---

## Technology Stack

### Frontend
- **React 18** with **TypeScript** for type safety
- **Vite** for fast builds and Hot Module Replacement
- **Tailwind CSS** for responsive styling
- **Recharts** for data visualization

### Backend
- **Supabase** (PostgreSQL) for database and API
- **Row Level Security (RLS)** for access control
- Google Sheets sync for primary data source

### Data Flow
\`\`\`
Google Sheets (Source of Truth)
    ↓ (Auto-sync)
Supabase Database
    ↓ (Supabase Client)
React Dashboard
\`\`\`

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v8+
- Supabase account with project configured

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd SCI-HeroDashboard-v2-main
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment**

   Create a \`.env\` file in the root directory:
   \`\`\`env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Application runs at \`http://localhost:5173\`

### Available Scripts

\`\`\`bash
npm run dev        # Start development server with HMR
npm run build      # Build for production (output: /dist/)
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
\`\`\`

---

## Project Structure

\`\`\`
/
├── src/                   # React application source code
│   ├── components/       # Reusable UI components
│   └── lib/             # Utilities and Supabase client
├── supabase/migrations/  # Database schema migrations (12 files)
├── docs/                 # Technical documentation
│   ├── database/        # Schema and migration docs
│   ├── architecture/    # Data flow and component structure
│   └── deployment/      # Setup and deployment guides
├── documents/            # Business documentation
└── archive/              # Historical development artifacts
\`\`\`

---

## Database

The application uses Supabase (PostgreSQL) with 20+ tables organized into categories:

### Core Data (Synced from Google Sheets)
- Team members, assignments, work type summaries
- Initiatives with metrics, financial impact, performance data
- Dashboard metrics and highlights

### User-Generated (Created in App)
- Effort logs (weekly time tracking)
- Governance requests (SCI consultation intake)

**All migrations** are managed in \`/supabase/migrations/\` with timestamped SQL files.

See \`/docs/database/SCHEMA_OVERVIEW.md\` for complete schema documentation.

---

## Key Metrics

### Current Data (October 2025)
- **409 initiatives** tracked and active
- **16 team members** with complete portfolios
- **$276M+ revenue impact** documented
- **Multiple workstreams**: Epic Gold, System Initiatives, Governance, Projects, Support

### Completion Tracking
- Initiative completion percentages calculated automatically
- Tracks which sections have data (Basic, Metrics, Financial, Performance, Stories)
- Draft vs. published initiative distinction

---

## Documentation

### For Developers
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive developer guide
- **[/docs/architecture/DATA_FLOW.md](./docs/architecture/DATA_FLOW.md)** - Application architecture
- **[/docs/deployment/SETUP.md](./docs/deployment/SETUP.md)** - Detailed setup instructions

### For Database
- **[/docs/database/SCHEMA_OVERVIEW.md](./docs/database/SCHEMA_OVERVIEW.md)** - Complete schema reference
- **[/docs/database/MIGRATION_HISTORY.md](./docs/database/MIGRATION_HISTORY.md)** - Migration timeline and explanations

### Business Context
- **[/documents/SCI_HERO_DASHBOARD_BUSINESS_CASE.md](./documents/SCI_HERO_DASHBOARD_BUSINESS_CASE.md)** - Business justification

---

## Deployment

### Production Build

\`\`\`bash
npm run build
\`\`\`

Output is in \`/dist/\` folder, ready for static hosting (Netlify, Vercel, AWS S3, etc.).

### Database Setup

For new environments, apply migrations in order:

\`\`\`bash
supabase migration up
\`\`\`

Or manually execute SQL files in \`/supabase/migrations/\` in chronological order.

---

## Security & Access

### Row Level Security (RLS)
- All tables have RLS enabled
- **Read access**: Public (internal showcase tool)
- **Write access**: Authenticated users only

### Environment Variables
Supabase credentials stored in \`.env\` (not committed to git):
- \`VITE_SUPABASE_URL\`
- \`VITE_SUPABASE_ANON_KEY\`

---

## Support & Maintenance

### Common Issues

**Initiatives not showing?**
- Check status filter (Active/Completed tabs)
- Verify team member filter
- Check search term

**Edit form empty?**
- Ensure data fetched with full relations
- Check browser console for Supabase errors

**Effort logs not saving?**
- Verify week is selected (not future)
- Confirm hours/effort size entered
- Check initiative has Active/Planning status

See **[CLAUDE.md](./CLAUDE.md)** Troubleshooting section for more details.

---

## Archive

Historical development artifacts (scripts, ad-hoc migrations, implementation notes) are preserved in \`/archive/\` for audit purposes.

See **[/archive/README.md](./archive/README.md)** for complete inventory.

---

## License

Internal use only - CommonSpirit Health System Clinical Informatics Team

---

## Contact

For questions or support regarding this dashboard:
- Review technical documentation in \`/docs/\`
- Check developer guide in \`CLAUDE.md\`
- Consult database schema in \`/docs/database/\`

---

**Last Updated**: October 2025  
**Version**: Production Ready  
**Status**: Active - 409 Initiatives Tracked
