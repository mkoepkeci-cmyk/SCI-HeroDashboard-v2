# GovernIQ Enterprise Management Platform

> **A comprehensive work and capacity management framework for tracking organizational initiatives, team portfolios, and strategic impact**

Showcases **415+ initiatives** across **16 team members** with **$276M+ in tracked impact** and validated performance metrics.

---

## ⚖️ Independent Development

**This software framework and associated database schema were developed independently by Marty Koepke using personal equipment, accounts, and resources outside of employment hours. No company systems, credentials, or proprietary data were used in the development of this framework.**

- **Developer**: Marty Koepke
- **Development Period**: 2025
- **Last Updated**: October 31, 2025, 3:00 PM PST
- **Status**: Demo-Ready Framework v1.0 (Populated with Sample Data)

---

## Overview

GovernIQ is a React-based single-page application framework that provides organizational visibility into:

- **Team Member Portfolios** - Individual work distributions, assignments, and key highlights
- **Initiative Tracking** - Detailed metrics, financial impact, performance data, and success stories
- **Governance Workflow** - Request intake and workflow management for team support
- **Effort Tracking** - Weekly time logging for capacity management
- **Workload Analytics** - Team utilization trends and forecasting

---

## Key Features

### 📊 Dashboard
- **Overview Mode**: Team-level metrics showing total initiatives, revenue impact, and efficiency gains
- **Team Mode**: Individual portfolios with work type distribution and categorized initiatives

### 📝 Team Requests (Governance Portal)
- Intake form for new team consultation requests
- Workflow management (Draft → Review → Approval → Conversion)
- One-click conversion of approved requests to formal initiatives

### 🔍 Browse Initiatives
- Searchable library of all initiatives
- Organized into 5 categories (System Initiatives, Projects, Tickets, Governance, Other)
- Detailed cards showing metrics, financial impact, performance data, and success stories

### ⏱️ My Effort (Time Tracking)
- Weekly effort logging with bulk entry table
- Effort size shortcuts (XS to XXL: 1.5 to 25 hours)
- Inline editing, reassignment, and quick actions
- Skip functionality for "no work" weeks

### 📈 Workforce Analytics
- **Three views**: Staff View (individual), Manager's View (team capacity), Admin (system config)
- Individual and team capacity utilization
- 12-week effort trends
- Hours by work type and effort size
- Visual sparklines and charts

### ⚙️ System Configuration
- **Dynamic Brand Color**: Customize primary color throughout entire UI (buttons, headers, navigation)
- **Application Settings**: Banner title, organization name, view labels
- **Field Options Management**: 10 configurable field types with contextual help
  - Work types, roles, phases, statuses, team roles
  - Groups Impacted (7 options: Nurses, Physicians/APPs, Lab, etc.)
  - Impact Categories (6 options: Board Goal, Strategic Plan, Patient Safety, etc.)
- **Capacity Settings**: Thresholds and calculator weights
- **Team Administration**: Team members and managers

### 🎨 Customization Features (October 31, 2025)
- **Brand Color System**: Change primary color and watch entire UI update instantly
- **Consolidated Field Options**: All dropdown options managed in one place
- **Contextual Help**: Each field type shows where it's used in the app
- **Navigation Flexibility**: Customizable tab labels and order

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
- Optional external data sync capabilities

### Data Flow
```
External Data Sources (Optional)
    ↓ (Configurable sync)
Supabase Database (PostgreSQL)
    ↓ (Supabase Client API)
React Dashboard Application
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v8+
- Supabase account with project configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GovernIQ-Framework
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Application runs at `http://localhost:5173`

### Available Scripts

```bash
npm run dev        # Start development server with HMR
npm run build      # Build for production (output: /dist/)
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

---

## Project Structure

```
/
├── src/                   # React application source code
│   ├── components/       # Reusable UI components
│   └── lib/             # Utilities and Supabase client
├── supabase/migrations/  # Database schema migrations
├── docs/                 # Technical documentation
│   ├── database/        # Schema and migration docs
│   ├── architecture/    # Data flow and component structure
│   └── deployment/      # Setup and deployment guides
├── scripts/              # Data generation and utilities
└── archive/              # Historical development artifacts
```

---

## Database Architecture

The application uses Supabase (PostgreSQL) with 20+ tables organized into categories:

### Core Data Tables
- Team members and manager hierarchy
- Initiatives with metrics, financial impact, performance data
- Dashboard metrics and highlights
- Field options for dynamic configuration

### User-Generated Tables
- Effort logs (weekly time tracking)
- Governance requests (team consultation intake)

### Configuration Tables
- Application config (branding, labels, primary brand color)
- Field options (10 field types: work types, statuses, roles, phases, groups impacted, impact categories, etc.)
- Capacity thresholds and calculator weights

**All migrations** are managed in `/supabase/migrations/` with timestamped SQL files.

See `/docs/database/SCHEMA_OVERVIEW.md` for complete schema documentation.

---

## Key Capabilities

### Current Framework Capacity (Demo Data)
- **415+ initiatives** tracked and active
- **16 team members** with complete portfolios
- **$276M+ impact** documented
- **Multiple workstreams**: System Initiatives, Projects, Governance, Support

### Completion Tracking
- Initiative completion percentages calculated automatically
- Tracks which sections have data (Basic, Metrics, Financial, Performance, Stories)
- Draft vs. published initiative distinction

### Dynamic Configuration
- **All dropdown options** configurable through System Configuration UI
- **Application branding** customizable (titles, labels, organization name, primary color)
- **Dynamic theming**: Primary brand color changes entire UI instantly via CSS variables
- **Contextual help cards**: Each field type shows where it's used in the app
- **Capacity thresholds** and calculation weights adjustable
- **No code changes** needed for customization

---

## Documentation

### For Developers
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive developer guide
- **[/docs/architecture/DATA_FLOW.md](./docs/architecture/DATA_FLOW.md)** - Application architecture
- **[/docs/deployment/SETUP.md](./docs/deployment/SETUP.md)** - Detailed setup instructions

### For Database
- **[/docs/database/SCHEMA_OVERVIEW.md](./docs/database/SCHEMA_OVERVIEW.md)** - Complete schema reference
- **[/docs/database/MIGRATION_HISTORY.md](./docs/database/MIGRATION_HISTORY.md)** - Migration timeline

### Demo Data
- **[/scripts/DEMO_DATA_INSTRUCTIONS.md](./scripts/DEMO_DATA_INSTRUCTIONS.md)** - Demo data generation guide

### Business Context
- **[/documents/FRAMEWORK_BUSINESS_CASE.md](./documents/FRAMEWORK_BUSINESS_CASE.md)** - Framework value proposition and business justification

---

## Deployment

### Production Build

```bash
npm run build
```

Output is in `/dist/` folder, ready for static hosting (Netlify, Vercel, AWS S3, etc.).

### Database Setup

For new environments, apply migrations in order:

```bash
supabase migration up
```

Or manually execute SQL files in `/supabase/migrations/` in chronological order.

---

## Security & Access

### Row Level Security (RLS)
- All tables have RLS enabled
- **Read access**: Configurable per deployment
- **Write access**: Configurable per deployment (default: public for internal tools)

### Environment Variables
Supabase credentials stored in `.env` (not committed to git):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Support & Troubleshooting

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

Historical development artifacts (scripts, ad-hoc migrations, implementation notes) are preserved in `/archive/` for reference.

---

## License & Usage

This software framework is the intellectual property of Marty Koepke. All rights reserved.

**Independent Development Statement**: This framework was developed independently using personal resources and equipment. No employer systems, credentials, or proprietary data were used in its creation.

**Organizational Neutrality**: This framework is intentionally designed to be organizationally neutral and adaptable to any business context. The architecture, data models, and functionality are generic and configurable, making it suitable for various industries and organizational structures. All branding, terminology, field options, and business logic can be customized through the Admin Configuration interface without code modifications.

Contact the developer for licensing inquiries.

---

## Framework Information

**Framework**: GovernIQ Enterprise Management Platform
**Version**: v1.0 (Demo Ready)
**Developer**: Marty Koepke
**Development Period**: 2025
**Last Updated**: October 31, 2025
**Status**: Demo-Ready with Sample Data - 415+ Initiatives Framework Capacity
