const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

// Initialize database
const database = require('./database/init');
const Location = require('./models/Location');
const adminRoutes = require('./routes/admin');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', false); // Disable default layout for all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: 'veteran-retirement-finder-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize database connection
database.connect().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Veteran Retirement Finder' });
});

app.get('/search', (req, res) => {
  res.render('search', { title: 'Find Your Perfect Retirement Location' });
});

app.post('/results', async (req, res) => {
  try {
    const criteria = req.body;

    // Search locations based on criteria
    const locations = await Location.search(criteria);

    // Calculate match scores and sort by relevance
    const locationsWithScores = locations.map(location => {
      const matchScore = location.calculateMatchScore(criteria);
      return {
        ...location,
        matchScore
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.render('results', {
      title: 'Your Retirement Matches',
      criteria,
      locations: locationsWithScores
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    res.render('results', {
      title: 'Your Retirement Matches',
      criteria: req.body,
      locations: [],
      error: 'An error occurred while searching for locations. Please try again.'
    });
  }
});

// Admin routes
app.use('/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel available at http://localhost:${PORT}/admin/login`);
  console.log('Default admin credentials: admin / admin123');
});