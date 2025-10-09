# NextBase-Claude Project Documentation

## Project Overview

**NextBase-Claude** is a Veteran Retirement Finder web application that helps veterans find their ideal retirement location based on various criteria including climate, cost of living, VA facilities, gun laws, taxes, and more.

- **Project Name:** veteran-retirement-finder
- **Version:** 1.0.0
- **License:** MIT
- **Description:** A modern web app to help veterans find their ideal retirement location based on various criteria

## Architecture & Technology Stack

### Backend Framework
- **Express.js** (v4.18.2) - Web application framework
- **Node.js** - Runtime environment
- **EJS** (v3.1.9) - Template engine for server-side rendering
- **express-ejs-layouts** (v2.5.1) - Layout support for EJS

### Database & ORM
- **PostgreSQL** - Primary database (hosted on Neon)
- **Prisma** (v6.17.0) - Modern ORM and database toolkit
- **@prisma/client** (v6.17.0) - Prisma client for database operations

### Development Tools
- **nodemon** (v3.0.1) - Development server with auto-restart
- **Prisma Studio** - Database GUI (available at http://localhost:5555)

## Deployment Environments

### Local Development
- **Port:** 3010 (default)
- **Database:** PostgreSQL on Neon (cloud-hosted)
- **Environment Variables:** `.env` file (gitignored)
- **Start Command:** `npm start` or `npm run dev`
- **Database URL:** Set via environment variable

### Production (Vercel)
- **Platform:** Vercel Serverless Functions
- **URL:** https://nextbase-claude.vercel.app/
- **Database:** PostgreSQL on Neon (same as local)
- **Environment Variables:** Set in Vercel dashboard
- **Build Command:** `npm run build` (runs `prisma generate`)
- **Deployment:** Automatic via GitHub integration

## Project Structure

```
NextBase/
├── api/
│   └── index.js                 # Vercel serverless function entry point
├── database/
│   ├── prisma-init.js          # Prisma database module
│   └── schema.sql              # Legacy SQLite schema (reference)
├── models/
│   └── Location.js             # Location model with business logic
├── prisma/
│   ├── schema.prisma           # Prisma schema definition
│   └── migrations/             # Database migration files
├── public/
│   ├── css/
│   │   └── styles.css          # Application styles
│   └── js/
│       └── theme.js            # Theme functionality
├── scripts/
│   ├── csv-to-json.js          # CSV to JSON converter
│   ├── geocode-cities.js       # Geocoding utility
│   ├── import-csv.js           # CSV import utility
│   ├── migrate-to-postgres.js  # SQLite to PostgreSQL migration
│   └── README.md               # Scripts documentation
├── views/
│   ├── city.ejs                # City detail page
│   ├── index.ejs               # Home page
│   ├── layout.ejs              # Base layout template
│   ├── map.ejs                 # Interactive map view
│   ├── quiz.ejs                # Retirement quiz
│   ├── results.ejs             # Quiz results page
│   └── search.ejs              # Search interface
├── data/
│   └── locations.json          # Source data file
├── server.js                   # Main application server
├── vercel.json                 # Vercel deployment configuration
└── package.json                # Dependencies and scripts
```

## Database Schema

### Models
1. **Location** - Main locations table with comprehensive data
2. **Tag** - Flexible categorization system
3. **LocationTag** - Many-to-many relationship between locations and tags

### Key Data Fields
- **Basic Info:** state, city, county, population, density
- **Economy:** cost of living, gas prices, taxes
- **Climate:** temperature, rainfall, snowfall, sunny days
- **Services:** VA facilities, tech hubs, military hubs
- **Social:** LGBTQ ranking, marijuana status
- **Safety:** crime index
- **Politics:** state party, election data
- **Coordinates:** latitude, longitude for mapping

### Tags System
- **Climate:** warm-climate, dry-climate, mild-summers, very-sunny
- **Density:** urban, suburban, rural
- **Firearms:** constitutional-carry, gun-friendly
- **Taxes:** no-income-tax, low-income-tax

## Key Features

### 1. Retirement Quiz
- Interactive quiz with weighted scoring algorithm
- Considers climate, firearms laws, marijuana status, LGBTQ friendliness
- Cost of living, taxes, lifestyle preferences
- VA facilities, safety, gas prices
- Returns top 20 matches with percentage scores

### 2. Search Functionality
- Advanced filtering by multiple criteria
- Tag-based search system
- Cost of living ranges
- VA facilities and tech hub filters

### 3. Interactive Map
- Visual representation of all locations
- Geographic distribution of retirement options

### 4. City Detail Pages
- Individual city information
- Comprehensive data display
- URL structure: `/:state/:city`

### 5. API Endpoints
- `/api/locations` - JSON API for location data
- RESTful structure for potential mobile app integration

## Data Migration History

### Original System (SQLite)
- Used `better-sqlite3` for local database
- Hybrid approach with wide table + tagging system
- JSON column for flexible data storage

### Current System (PostgreSQL + Prisma)
- Migrated to PostgreSQL on Neon cloud platform
- Modern Prisma ORM for type-safe database operations
- Maintained backward compatibility with existing data structure
- 41 locations successfully migrated
- 11 tags with 105 location-tag relationships

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Set DATABASE_URL environment variable
4. Generate Prisma client: `npx prisma generate`
5. Start development server: `npm run dev`

### Database Operations
- **View data:** `npx prisma studio` (opens at http://localhost:5555)
- **Schema changes:** `npx prisma migrate dev`
- **Reset database:** `npx prisma migrate reset`

### Deployment
- **Automatic:** Push to GitHub triggers Vercel deployment
- **Manual:** `vercel deploy` from CLI
- **Environment:** Set DATABASE_URL in Vercel dashboard

## Security Considerations

### Environment Variables
- **DATABASE_URL:** Contains sensitive database credentials
- **Local:** Stored in `.env` file (gitignored)
- **Production:** Set in Vercel dashboard environment variables
- **Never:** Committed to version control

### Database Security
- **SSL Required:** Database connections use SSL
- **Cloud Hosted:** Neon PostgreSQL with managed security
- **Connection Pooling:** Handled by Neon platform

## Performance & Scalability

### Database Optimization
- **Indexes:** Strategic indexes on common query fields
- **Connection Pooling:** Neon platform handles connection management
- **Query Optimization:** Prisma generates efficient SQL queries

### Serverless Architecture
- **Vercel Functions:** Auto-scaling serverless functions
- **Cold Start:** Database connection initialization on first request
- **Global CDN:** Vercel's edge network for static assets

## Monitoring & Debugging

### Logging
- **Console Logs:** Database connection status
- **Error Handling:** Comprehensive error catching and reporting
- **Vercel Logs:** Available in Vercel dashboard

### Development Tools
- **Prisma Studio:** Visual database management
- **Nodemon:** Auto-restart on file changes
- **Hot Reload:** Development server with live updates

## Future Considerations

### Potential Enhancements
- **Mobile App:** API endpoints ready for mobile integration
- **User Accounts:** Authentication system for saved preferences
- **Advanced Filtering:** More sophisticated search algorithms
- **Data Updates:** Automated data refresh mechanisms
- **Analytics:** User behavior tracking and insights

### Technical Debt
- **Legacy Files:** Some SQLite-related files removed but schema.sql kept for reference
- **Code Duplication:** Similar logic in server.js and api/index.js
- **Error Handling:** Could be more granular in some areas

## Dependencies Summary

### Production Dependencies
- `@prisma/client` - Database ORM client
- `ejs` - Template engine
- `express` - Web framework
- `express-ejs-layouts` - Layout support

### Development Dependencies
- `nodemon` - Development server
- `prisma` - Database toolkit and CLI

### Removed Dependencies
- `better-sqlite3` - Replaced with Prisma + PostgreSQL

## Contact & Support

- **Repository:** GitHub (private/public as configured)
- **Deployment:** Vercel dashboard
- **Database:** Neon dashboard
- **Documentation:** This file and inline code comments

---

*Last Updated: October 8, 2025*
*Migration Status: Complete (SQLite → PostgreSQL)*
*Deployment Status: Active on Vercel*
