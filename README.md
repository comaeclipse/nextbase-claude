# VetRetire - Veteran Retirement Finder

A modern Next.js application to help veterans find their ideal retirement location based on various criteria including climate, cost of living, VA facilities, gun laws, taxes, and more.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: CSS with CSS Variables (Theme support)
- **Maps**: Leaflet
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd NextBase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations** (if needed)
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
NextBase/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── locations/        # Locations API
│   │   └── quiz/results/     # Quiz results API
│   ├── [state]/[city]/       # Dynamic city detail pages
│   ├── quiz/                 # Quiz page
│   ├── map/                  # Interactive map page
│   ├── results/              # Quiz results page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── Navbar.tsx            # Navigation bar
│   ├── Footer.tsx            # Footer
│   ├── ThemeScript.tsx       # Theme initialization
│   └── MapComponent.tsx      # Leaflet map component
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma client instance
│   └── database.ts           # Database operations
├── prisma/                   # Prisma configuration
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
│   └── css/                  # Additional CSS
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Vercel deployment config
```

## Features

### 1. Home Page
- Browse all retirement locations
- Filter by climate, cost of living, taxes, firearms laws, marijuana status
- Toggle between grid and table views
- Quick access to popular search criteria

### 2. Interactive Quiz
- 10-question survey covering:
  - Climate preferences
  - Gun laws
  - Marijuana legality
  - LGBTQ+ friendliness
  - Cost of living
  - State taxes
  - Lifestyle (urban/suburban/rural)
  - VA facilities proximity
  - Safety concerns
  - Gas prices
- Advanced matching algorithm
- Top 20 personalized location recommendations

### 3. Interactive Map
- Visual representation of all locations
- Color-coded markers based on features
- Click markers for city details
- Automatic map bounds adjustment

### 4. City Detail Pages
- Comprehensive city information
- Politics & governance
- Taxes & economy
- Climate data
- Laws & regulations
- Veteran services

### 5. Results Page
- Personalized matches from quiz
- Match percentage scores
- Visual statistics
- Easy comparison

## Database Schema

### Location Model
- Basic Info: state, city, county, population, density
- Economy: cost of living, gas prices
- Taxes: sales tax, income tax
- Climate: type, temperatures, precipitation
- Services: VA facilities, tech hubs, military hubs
- Social: LGBTQ ranking, marijuana status
- Safety: crime index
- Coordinates: latitude, longitude for mapping

### Tag System
- Flexible categorization
- Many-to-many relationships
- Climate, density, firearms, tax tags

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# View database in browser
npx prisma studio
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | Auto |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## Theme Support

The application supports both light and dark themes:
- Automatic detection of system preference
- Manual toggle in navigation bar
- Preference stored in localStorage
- Smooth transitions between themes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security

- Environment variables for sensitive data
- Never commit `.env` files
- SSL database connections
- Vercel security features

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check existing documentation
- Review Prisma documentation for database queries
- Check Next.js documentation for routing and API

---

**Built with Next.js 14, TypeScript, and Prisma**

*Helping veterans find their perfect retirement home* 🇺🇸

