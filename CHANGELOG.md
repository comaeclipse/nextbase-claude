# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **City pages now use dynamic rendering** (2025-10-10)
  - Added `export const dynamic = 'force-dynamic'` to `app/[state]/[city]/page.tsx`
  - City pages (`/[state]/[city]`) now render on-demand instead of at build time
  - Significantly reduces build time by eliminating static page generation for all cities
  - Ensures fresh data from database on every request
  - Trade-off: Slightly slower first-page load, but pages are cached in browser after initial visit

### Added
- Created CHANGELOG.md to track project changes

## [2.0.0] - Previous

### Changed
- Converted from static HTML to Next.js application
- Migrated data storage to Prisma + PostgreSQL database
- Implemented server-side rendering for dynamic content

### Added
- `/warm-winters` page with interactive temperature filtering
- Interactive city filters on homepage
- Rich city cards with comprehensive data display
- Quiz feature for finding ideal retirement locations
- Map view for visualizing city locations
- API routes for locations and quiz results

### Fixed
- Production deployment issues with custom build commands
- Missing CSS classes for badges and interactive elements
