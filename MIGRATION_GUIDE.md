# Migration Guide: Express.js to Next.js

This document outlines the conversion from the Express.js + EJS application to a modern Next.js 14 application with TypeScript.

## What Changed

### Architecture

| Old (Express.js) | New (Next.js) |
|-----------------|---------------|
| Express server (server.js) | Next.js App Router |
| EJS templates | React components (TSX) |
| JavaScript | TypeScript |
| Express routes | Next.js pages & API routes |
| Manual theme switching | React-based theme management |
| Server-side rendering with EJS | React Server Components + Client Components |

### File Structure Changes

#### Deleted Files
- ✅ `server.js` - Replaced by Next.js framework
- ✅ `api/index.js` - Replaced by Next.js API routes
- ✅ `views/*.ejs` - All EJS templates converted to React
- ✅ `database/prisma-init.js` - Converted to `lib/database.ts`
- ✅ `models/Location.js` - Logic moved to `lib/database.ts`
- ✅ `public/js/theme.js` - Theme logic in React components

#### New Files

**Configuration:**
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Updated for Next.js
- `README.md` - New comprehensive documentation

**Application:**
- `app/layout.tsx` - Root layout (replaces layout.ejs)
- `app/page.tsx` - Home page (replaces index.ejs)
- `app/globals.css` - Global styles (was styles.css)
- `app/quiz/page.tsx` - Quiz page (replaces quiz.ejs)
- `app/map/page.tsx` - Map page (replaces map.ejs)
- `app/results/page.tsx` - Results page (replaces results.ejs)
- `app/[state]/[city]/page.tsx` - Dynamic city pages (replaces city.ejs)

**API Routes:**
- `app/api/locations/route.ts` - Locations API endpoint
- `app/api/quiz/results/route.ts` - Quiz results API endpoint

**Components:**
- `components/Navbar.tsx` - Navigation component
- `components/Footer.tsx` - Footer component
- `components/ThemeScript.tsx` - Theme initialization
- `components/MapComponent.tsx` - Leaflet map component

**Library:**
- `lib/prisma.ts` - Prisma client singleton
- `lib/database.ts` - Database operations (replaces prisma-init.js)

### Key Technical Changes

#### 1. Routing

**Before (Express):**
```javascript
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/quiz', (req, res) => {
  res.render('quiz', { title: 'Quiz' });
});

app.get('/:state/:city', async (req, res) => {
  // City detail logic
});
```

**After (Next.js):**
- `app/page.tsx` - Home route (`/`)
- `app/quiz/page.tsx` - Quiz route (`/quiz`)
- `app/[state]/[city]/page.tsx` - Dynamic route (`/:state/:city`)

#### 2. API Endpoints

**Before (Express):**
```javascript
app.get('/api/locations', async (req, res) => {
  const data = await database.getData();
  res.json(data);
});
```

**After (Next.js):**
```typescript
// app/api/locations/route.ts
export async function GET() {
  const data = await database.getData();
  return NextResponse.json(data);
}
```

#### 3. Database Access

**Before (CommonJS):**
```javascript
const database = require('./database/prisma-init');
const data = await database.getData();
```

**After (ES Modules + TypeScript):**
```typescript
import { database } from '@/lib/database';
const data = await database.getData();
```

#### 4. Theme Management

**Before (Vanilla JS):**
- Separate `theme.js` file
- Manual DOM manipulation
- Event listeners in separate file

**After (React):**
- Built into `Navbar.tsx` component
- React state management
- Theme persists in localStorage
- Automatic system preference detection

#### 5. Forms and Submissions

**Before (HTML Forms):**
```html
<form action="/quiz/results" method="POST">
  <!-- Form fields -->
</form>
```

**After (React + Fetch):**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const response = await fetch('/api/quiz/results', {
    method: 'POST',
    body: JSON.stringify(responses),
  });
  // Handle response
};
```

### Dependencies Changes

#### Removed
- `express` - No longer needed
- `ejs` - Replaced with React
- `express-ejs-layouts` - No longer needed
- `nodemon` - Next.js has built-in hot reload

#### Added
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `typescript` - Type safety
- `leaflet` - Interactive maps
- `@types/*` - TypeScript type definitions

#### Kept
- `@prisma/client` - Database client
- `prisma` - Database toolkit

### Environment Variables

No changes needed! The same `DATABASE_URL` environment variable is used.

**Local Development:**
```env
DATABASE_URL="your-postgresql-connection-string"
```

**Vercel:**
Set the same variable in Vercel dashboard under Settings → Environment Variables.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

If you encounter Prisma permission errors on Windows, try:
```bash
# Close any running processes
# Then run
npm install --legacy-peer-deps
```

Or manually:
```bash
npx prisma generate
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

The application is already configured for Vercel deployment.

1. **Push to GitHub** (if not already done)
2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
3. **Add Environment Variable**
   - In project settings, add `DATABASE_URL`
4. **Deploy**
   - Automatic deployment on every push

### Deployment Configuration

The `vercel.json` has been updated:
```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

## Features Preserved

All original features have been preserved:

✅ **Home Page** - City browsing with filters  
✅ **Quiz** - 10-question retirement quiz  
✅ **Map View** - Interactive Leaflet map  
✅ **City Details** - Comprehensive city information  
✅ **Results** - Personalized quiz results  
✅ **Theme Toggle** - Light/dark mode  
✅ **Database** - Same Prisma + PostgreSQL setup  
✅ **Filtering** - All filter options maintained  

## Enhanced Features

The Next.js version includes improvements:

🚀 **Performance**
- Automatic code splitting
- Optimized images
- Server components for faster loads

🔒 **Type Safety**
- TypeScript for better code quality
- Compile-time error checking
- Better IDE support

🎨 **Better UX**
- Client-side navigation (no page reloads)
- Smooth transitions
- Optimistic UI updates

📱 **Modern Stack**
- React 18 features
- Latest Next.js 14 with App Router
- Modern JavaScript/TypeScript

## Common Issues & Solutions

### Issue: npm install fails with Prisma error

**Solution:**
```bash
# Try removing node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install
```

### Issue: Module not found errors

**Solution:**
Make sure all imports use the `@/` alias for absolute imports:
```typescript
import { database } from '@/lib/database';
```

### Issue: Hydration errors

**Solution:**
Make sure client components are marked with `'use client'` directive at the top of the file.

### Issue: Map not loading

**Solution:**
The map component is loaded dynamically to avoid SSR issues:
```typescript
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false
});
```

## Testing Checklist

After migration, test these features:

- [ ] Home page loads and displays cities
- [ ] Filters work correctly
- [ ] Grid/table view toggle works
- [ ] Quiz navigation works
- [ ] Quiz submission creates results
- [ ] Results page displays matches
- [ ] Map loads with markers
- [ ] Map markers show popups
- [ ] City detail pages load
- [ ] Theme toggle works
- [ ] Database connection successful

## Rollback (If Needed)

If you need to rollback to the Express version:

1. Git checkout the previous commit
2. Run `npm install` (old dependencies)
3. Start with `npm run dev`

**Note:** The old Express files have been deleted in this conversion, so you'd need to restore from git history.

## Next Steps

1. **Test Locally**
   - Run `npm run dev`
   - Test all features
   - Check console for errors

2. **Deploy to Vercel**
   - Push to GitHub
   - Deploy via Vercel
   - Test production build

3. **Monitor**
   - Check Vercel logs
   - Verify database connections
   - Test all routes

## Support

For issues:
- Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Check Prisma documentation: [prisma.io/docs](https://prisma.io/docs)
- Review TypeScript handbook: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)

---

**Migration completed successfully! 🎉**

Your Express.js application has been fully converted to a modern Next.js 14 application with TypeScript, maintaining all functionality while adding type safety and performance improvements.

