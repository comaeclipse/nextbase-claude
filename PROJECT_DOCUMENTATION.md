# NextBase-Claude Project Documentation

## Project Overview

**NextBase-Claude** is a Veteran Retirement Finder web application that helps veterans find their ideal retirement location based on various criteria including climate, cost of living, VA facilities, gun laws, taxes, and more.

- **Project Name:** veteran-retirement-finder
- **Version:** 1.0.0
- **License:** MIT
- **Description:** A modern web app to help veterans find their ideal retirement location based on various criteria
- **GitHub Repository:** comaeclipse/nextbase-claude
- **Production URL:** https://nextbase-claude.vercel.app

## Architecture & Technology Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **React 18.3** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Server Components** - Default rendering strategy for optimal performance
- **Client Components** - Used for interactive features and browser APIs

### Database & ORM
- **PostgreSQL** - Primary database (hosted on Neon)
- **Prisma 6.17** - Modern ORM and database toolkit
- **@prisma/client 6.17** - Prisma client for database operations

### UI & Styling
- **CSS Variables** - Theme system with light/dark mode support
- **Font Awesome 6** - Icon library
- **Leaflet 1.9** - Interactive map visualization
- **Responsive Design** - Mobile-first approach with breakpoints

### Development Tools
- **TypeScript** - Static type checking
- **Next.js Dev Server** - Hot module replacement
- **Prisma Studio** - Database GUI (available at http://localhost:5555)
- **ESLint** - Code linting

## Deployment Configuration

### Vercel Project
- **Project ID:** `prj_NKoHfOelIq1p7RtbeEwYkWaxED3Q`
- **Team ID:** `team_pC6a0An6oM9kzA0RFUbSo4ia`
- **Project Name:** nextbase-claude
- **Production URL:** https://nextbase-claude.vercel.app
- **Framework:** Next.js 14

### Local Development
- **Port:** 3000 (Next.js default)
- **Database:** PostgreSQL on Neon (cloud-hosted)
- **Environment Variables:** `.env` file (gitignored)
- **Dev Command:** `npm run dev`
- **Build Command:** `npm run build`
- **Database URL:** Set via DATABASE_URL environment variable

### Production (Vercel)
- **Platform:** Vercel Serverless Functions with Edge Network
- **Build Command:** `npm run build` (includes `prisma generate` via postinstall)
- **Output Directory:** `.next`
- **Environment Variables:** Set in Vercel dashboard
- **Deployment:** Automatic via GitHub integration
- **Region:** Auto-selected based on traffic

## Project Structure

```
NextBase/
├── app/                        # Next.js App Router directory
│   ├── layout.tsx             # Root layout with theme, navbar, footer
│   ├── page.tsx               # Home page with filters and city grid
│   ├── globals.css            # Global styles with CSS variables
│   ├── quiz/
│   │   └── page.tsx           # Retirement quiz
│   ├── results/
│   │   └── page.tsx           # Quiz results page
│   ├── map/
│   │   └── page.tsx           # Interactive map view
│   ├── [state]/
│   │   └── [city]/
│   │       └── page.tsx       # Dynamic city detail pages
│   └── api/                   # API Routes
│       ├── locations/
│       │   └── route.ts       # GET /api/locations
│       └── quiz/
│           └── results/
│               └── route.ts   # POST /api/quiz/results
├── components/                 # React components
│   ├── Navbar.tsx             # Navigation bar with theme toggle
│   ├── Footer.tsx             # Footer component
│   ├── ThemeScript.tsx        # Theme initialization script
│   └── MapComponent.tsx       # Leaflet map (client-side only)
├── lib/                       # Utility modules
│   ├── prisma.ts              # Prisma client singleton
│   └── database.ts            # Database operations module
├── prisma/
│   ├── schema.prisma          # Prisma schema definition
│   └── migrations/            # Database migration files
├── scripts/                   # Data processing scripts
│   ├── csv-to-json.js         # CSV to JSON converter
│   ├── geocode-cities.js      # Geocoding utility
│   ├── import-csv.js          # CSV import utility
│   ├── migrate-to-postgres.js # Legacy migration script
│   └── README.md              # Scripts documentation
├── data/
│   └── locations.json         # Source data file
├── public/                    # Static assets (served from root)
│   └── css/
│       └── styles.css         # Legacy CSS (reference)
├── .vercel/
│   ├── project.json           # Vercel project configuration
│   └── README.txt             # Vercel CLI info
├── .cursor/
│   └── rules/
│       └── links.mdc          # Workspace rules and context
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment settings
└── package.json               # Dependencies and scripts
```

## Database Schema

### Models
1. **Location** - Main locations table with comprehensive data
2. **Tag** - Flexible categorization system
3. **LocationTag** - Many-to-many relationship between locations and tags

### Key Data Fields
- **Basic Info:** state, city, county, population, density
- **Economy:** cost of living, gas prices, taxes
- **Climate:** temperature, rainfall, snowfall, sunny days, climate type
- **Services:** VA facilities, tech hubs, military hubs
- **Social:** LGBTQ ranking, marijuana status
- **Safety:** crime index
- **Politics:** state party, governor party, election trends
- **Laws:** firearms laws
- **Coordinates:** latitude, longitude for mapping

### Tags System
- **Climate:** warm-climate, dry-climate, mild-summers, very-sunny
- **Density:** urban, suburban, rural
- **Firearms:** constitutional-carry, gun-friendly
- **Taxes:** no-income-tax, low-income-tax

## Key Features

### 1. Home Page with Advanced Filtering
- **Filter Bar:** Sticky filter controls for climate, cost of living, income tax, firearms, marijuana, veteran benefits
- **View Toggle:** Switch between grid and table views
- **Hero Section:** "I want to live..." prompt with bubble choice filters
- **City Cards:** Baseball card style with gradients, stats, and hover effects
- **Responsive Design:** Mobile-friendly layouts

### 2. Retirement Quiz
- Interactive multi-step quiz with 10 questions
- Weighted scoring algorithm considering:
  - Climate preferences (warm, cold, moderate)
  - Firearms laws importance
  - Marijuana status preferences
  - LGBTQ friendliness
  - Cost of living requirements
  - Tax considerations
  - VA facilities importance
  - Safety concerns
  - Gas prices
- Returns top 20 matches with percentage scores
- Client-side state management with React hooks

### 3. Interactive Map
- Visual representation of all locations using Leaflet
- Markers with popups showing city information
- Dynamic import for client-side only rendering
- Click-to-navigate to city detail pages

### 4. City Detail Pages
- Dynamic routes: `/[state]/[city]`
- Comprehensive city information display
- Server-side data fetching
- SEO-friendly with metadata

### 5. Theme System
- Light/dark mode toggle
- Persistent theme preference in localStorage
- System preference detection
- No theme flash on page load (blocking script)
- CSS variables for consistent theming

### 6. API Endpoints
- `GET /api/locations` - JSON API returning all location data
- `POST /api/quiz/results` - Quiz submission and matching algorithm
- RESTful structure for potential integrations

## Migration History

### Phase 1: SQLite to PostgreSQL (October 2024)
- Migrated from `better-sqlite3` to PostgreSQL on Neon
- Implemented Prisma ORM for type-safe operations
- Maintained backward compatibility
- 41 locations successfully migrated
- 11 tags with 105 location-tag relationships

### Phase 2: Express to Next.js (October 2025)
- **Framework Migration:** Express.js → Next.js 14 (App Router)
- **Language:** JavaScript → TypeScript
- **Templating:** EJS → React Components
- **Routing:** Express routes → Next.js file-based routing
- **API:** Express endpoints → Next.js API Routes
- **State Management:** Server-side → React hooks (client components)
- **Build System:** Nodemon → Next.js dev server with HMR
- **Deployment:** Serverless functions (maintained)

### Phase 3: Bug Fixes & Optimization (October 2025)
- **Theme Fix:** Changed from `useEffect` to blocking inline script to prevent flash
- **CSS Fix:** Added 464 lines of missing CSS for filter bar, hero section, city cards, table view
- **Layout Fix:** Proper centering with max-width containers
- **Deployment Fix:** Corrected Vercel project configuration
- **Responsive Design:** Enhanced mobile layouts

## Development Workflow

### Local Development Setup
1. Clone repository: `git clone https://github.com/comaeclipse/nextbase-claude.git`
2. Install dependencies: `npm install`
3. Set DATABASE_URL in `.env` file
4. Generate Prisma client: `npx prisma generate` (or runs via postinstall)
5. Start dev server: `npm run dev`
6. Open browser: http://localhost:3000

### Database Operations
- **View data:** `npx prisma studio` (opens at http://localhost:5555)
- **Schema changes:** Edit `prisma/schema.prisma`, then `npx prisma migrate dev`
- **Reset database:** `npx prisma migrate reset`
- **Update client:** `npx prisma generate`

### Development Commands
```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Deployment Workflow
1. **Automatic:** Push to `main` branch triggers Vercel deployment
2. **Manual:** Use Vercel dashboard or CLI
3. **Environment:** Ensure DATABASE_URL is set in Vercel
4. **Verification:** Check build logs in Vercel dashboard

### Vercel Project Configuration
- Always verify `.vercel/project.json` points to correct project ID
- **Correct Project ID:** `prj_NKoHfOelIq1p7RtbeEwYkWaxED3Q`
- **Never use old project:** `prj_sAkvxSt9gIlnPE4EjF42nmPUvCUk`

## Security Considerations

### Environment Variables
- **DATABASE_URL:** Contains sensitive database credentials
- **Local:** Stored in `.env` file (gitignored)
- **Production:** Set in Vercel dashboard environment variables
- **Never:** Committed to version control or shared publicly

### Database Security
- **SSL Required:** Database connections use SSL
- **Cloud Hosted:** Neon PostgreSQL with managed security
- **Connection Pooling:** Handled by Neon platform
- **Prisma Client:** Parameterized queries prevent SQL injection

### Next.js Security Features
- **Server Components:** Sensitive operations on server by default
- **API Routes:** Protected server-side endpoints
- **Environment Variables:** Prefix with `NEXT_PUBLIC_` only for client-side vars
- **CORS:** Automatic handling by Next.js

## Performance & Optimization

### Next.js Optimizations
- **Server Components:** Default rendering reduces client-side JavaScript
- **Automatic Code Splitting:** Per-route bundles
- **Image Optimization:** Built-in with `next/image` (not yet implemented)
- **Font Optimization:** Automatic font loading optimization
- **Static Generation:** Pages generated at build time where possible

### Database Optimization
- **Prisma Client:** Efficient query generation
- **Connection Pooling:** Neon platform manages connections
- **Indexes:** Strategic indexes on common query fields
- **Selective Fields:** Only fetch needed data

### Serverless Architecture
- **Vercel Functions:** Auto-scaling based on demand
- **Edge Network:** Global CDN for static assets
- **Cold Start Mitigation:** Prisma client singleton pattern
- **Regional Deployment:** Automatic edge routing

### Client-Side Optimization
- **Dynamic Imports:** Leaflet loaded only when needed
- **CSS Variables:** Efficient theme switching
- **Responsive Images:** Proper sizing for devices
- **Minimal JavaScript:** Server components reduce bundle size

## Component Architecture

### Server Components (Default)
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page with data fetching
- `app/[state]/[city]/page.tsx` - City details
- `app/quiz/page.tsx` - Quiz form (migrated to client)
- `app/results/page.tsx` - Results display

### Client Components ('use client')
- `components/Navbar.tsx` - Interactive navigation with theme toggle
- `components/ThemeScript.tsx` - Theme initialization
- `components/MapComponent.tsx` - Leaflet map (browser-only APIs)
- `app/page.tsx` - Home page (uses state for filters)
- `app/quiz/page.tsx` - Quiz (uses state for form)

### API Routes
- `app/api/locations/route.ts` - Location data endpoint
- `app/api/quiz/results/route.ts` - Quiz matching algorithm

## Theme System Architecture

### Theme Initialization
1. **Blocking Script:** Runs before page render to prevent flash
2. **localStorage:** Reads saved theme preference
3. **System Preference:** Falls back to `prefers-color-scheme`
4. **HTML Attribute:** Sets `data-theme` on `<html>` element

### Theme Toggle
1. **Navbar Button:** User clicks sun/moon icon
2. **State Update:** React state updates theme value
3. **localStorage:** Saves preference for persistence
4. **DOM Update:** Sets `data-theme` attribute on `<html>`
5. **CSS Variables:** Theme colors update automatically

### CSS Variables
```css
:root { /* Light theme */ }
[data-theme="dark"] { /* Dark theme overrides */ }
```

## Data Flow

### Server-Side Rendering (SSR)
1. Request comes to Next.js server
2. Server component fetches data from database via Prisma
3. React component renders with data
4. HTML sent to client
5. Client hydrates interactive components

### Client-Side Filtering
1. Initial data loaded via server component
2. Data passed to client component
3. React state manages filter selections
4. Client-side filtering updates display
5. No additional server requests needed

### API Routes
1. Client makes fetch request to `/api/*`
2. Next.js routes to API route handler
3. Handler processes request (database query, algorithm, etc.)
4. JSON response sent to client
5. Client updates UI with response data

## Monitoring & Debugging

### Development Tools
- **React DevTools:** Component inspection
- **Next.js Dev Overlay:** Error messages and warnings
- **TypeScript:** Compile-time type checking
- **Prisma Studio:** Visual database management
- **Console Logs:** Server logs in terminal, client logs in browser

### Production Monitoring
- **Vercel Analytics:** Available in Vercel dashboard
- **Build Logs:** Deployment status and errors
- **Function Logs:** Serverless function execution logs
- **Error Tracking:** Automatic error capture

### Common Issues & Solutions
1. **Theme Flash:** Fixed with blocking script in `<head>`
2. **Layout Issues:** Ensure all CSS classes are defined
3. **Hydration Errors:** Check for server/client mismatches
4. **Database Errors:** Verify DATABASE_URL and Prisma client
5. **Deployment Errors:** Check Vercel project ID in `.vercel/project.json`

## Future Considerations

### Potential Enhancements
- **User Accounts:** Authentication for saved preferences and favorites
- **Saved Searches:** Persist filter combinations
- **Comparison Tool:** Side-by-side city comparison
- **Data Updates:** Automated refresh from public data sources
- **Mobile App:** Native mobile apps using API
- **Advanced Analytics:** User behavior insights
- **Email Notifications:** Save searches with alerts
- **Community Features:** Reviews and ratings
- **API Rate Limiting:** Prevent abuse
- **Image Optimization:** Use `next/image` for city photos

### Technical Improvements
- **Image Assets:** Add city photos with Next.js Image optimization
- **Metadata:** Enhanced SEO with dynamic metadata
- **Sitemap:** Auto-generated sitemap for all city pages
- **Analytics:** Google Analytics or Vercel Analytics integration
- **Error Boundaries:** Better error handling UI
- **Loading States:** Skeleton screens and suspense boundaries
- **Accessibility:** WCAG 2.1 AA compliance audit
- **Performance:** Lighthouse score optimization
- **Testing:** Jest + React Testing Library
- **E2E Testing:** Playwright or Cypress

### Data Enhancements
- **More Cities:** Expand beyond current 41 cities
- **Data Freshness:** Automated updates from public APIs
- **Historical Data:** Track changes over time
- **Predictive Analytics:** ML models for recommendations
- **User-Generated Content:** Community contributions

## Dependencies Summary

### Production Dependencies
```json
{
  "@prisma/client": "^6.17.0",
  "leaflet": "^1.9.4",
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0"
}
```

### Development Dependencies
```json
{
  "@types/leaflet": "^1.9.8",
  "@types/node": "^20.0.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "prisma": "^6.17.0",
  "typescript": "^5.0.0"
}
```

### Removed Dependencies (Post-Migration)
- `express` - Replaced with Next.js
- `ejs` - Replaced with React/JSX
- `express-ejs-layouts` - Replaced with React layouts
- `nodemon` - Replaced with Next.js dev server
- `better-sqlite3` - Replaced with Prisma + PostgreSQL

## Package Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

## Contact & Support

- **Repository:** https://github.com/comaeclipse/nextbase-claude
- **Deployment:** Vercel dashboard (Project: nextbase-claude)
- **Database:** Neon dashboard
- **Documentation:** This file, inline code comments, and MIGRATION_GUIDE.md
- **Deployment Guide:** DEPLOYMENT.md

## Changelog

### October 9, 2025 - CSS & Theme Fixes
- Added 464 lines of missing CSS for complete layout
- Fixed theme flash with blocking inline script
- Enhanced responsive design for all components
- Updated documentation

### October 9, 2025 - Next.js Conversion
- Migrated from Express.js to Next.js 14 with App Router
- Converted all EJS templates to React components with TypeScript
- Implemented client-side filtering and state management
- Added dynamic routing for city pages
- Created API routes for data endpoints
- Set up proper Vercel deployment configuration

### October 8, 2025 - PostgreSQL Migration
- Migrated from SQLite to PostgreSQL on Neon
- Implemented Prisma ORM
- Successfully migrated all 41 locations and tags
- Updated deployment to Vercel

---

*Last Updated: October 9, 2025*
*Framework: Next.js 14 (TypeScript)*
*Deployment Status: Active on Vercel*
*Database: PostgreSQL on Neon*
