const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();

// Initialize database
const database = require('../database/init');
const Location = require('../models/Location');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', false); // Disable default layout for all routes
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection (runs on each request in serverless)
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await database.connect();
      dbInitialized = true;
    } catch (err) {
      console.error('Failed to connect to database:', err);
      return res.status(500).send('Database connection failed');
    }
  }
  next();
});

// API endpoint for locations data
app.get('/api/locations', (req, res) => {
  try {
    const data = database.getData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
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

// City detail page route
app.get('/:state/:city', (req, res) => {
  try {
    const { state, city } = req.params;
    const data = database.getData();

    // Find the location matching the state and city (case-insensitive)
    const location = data.locations.find(loc =>
      loc.state.toLowerCase() === state.toLowerCase() &&
      loc.city.toLowerCase().replace(/\s+/g, '') === city.toLowerCase().replace(/\s+/g, '')
    );

    if (!location) {
      return res.status(404).send('City not found');
    }

    res.render('city', {
      title: `${location.city}, ${location.state}`,
      location
    });
  } catch (error) {
    console.error('Error fetching city details:', error);
    res.status(500).send('Error loading city details');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Export for Vercel serverless
module.exports = app;
