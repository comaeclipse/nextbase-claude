const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

// Initialize database
const database = require('./database/prisma-init');
const Location = require('./models/Location');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', false); // Disable default layout for all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/quiz', (req, res) => {
  res.render('quiz', { title: 'Retirement City Quiz - VetRetire' });
});

app.get('/map', async (req, res) => {
  try {
    const data = await database.getData();
    res.render('map', {
      title: 'Retirement City Map - VetRetire',
      locations: data.locations || []
    });
  } catch (error) {
    console.error('Error loading map:', error);
    res.status(500).send('Error loading map');
  }
});

app.post('/quiz/results', async (req, res) => {
  try {
    const responses = req.body;
    const data = await database.getData();
    const locations = data.locations || [];

    // Calculate match scores for each location
    const locationsWithScores = locations.map(location => {
      let score = 0;
      let maxScore = 0;

      // Climate (warm weather preference)
      const climateImportance = parseInt(responses.climate) || 0;
      maxScore += climateImportance;
      if (climateImportance >= 3) {
        const avgHighSummer = location.climate?.avgHighSummer || 0;
        if (avgHighSummer >= 85) score += climateImportance;
        else if (avgHighSummer >= 75) score += climateImportance * 0.7;
        else if (avgHighSummer >= 65) score += climateImportance * 0.3;
      } else {
        score += climateImportance;
      }

      // Firearms
      const firearmsImportance = parseInt(responses.firearms) || 0;
      maxScore += firearmsImportance;
      if (firearmsImportance >= 3) {
        const laws = location.firearms?.laws || '';
        if (laws === 'Constitutional Carry' || laws === 'Constitutional carry') score += firearmsImportance;
        else if (laws.includes('Shall issue')) score += firearmsImportance * 0.7;
        else score += firearmsImportance * 0.3;
      } else {
        score += firearmsImportance;
      }

      // Marijuana
      const marijuanaImportance = parseInt(responses.marijuana) || 0;
      maxScore += marijuanaImportance;
      if (marijuanaImportance >= 3) {
        const status = location.marijuana?.status || '';
        if (status === 'Legal' || status === 'Recreational') score += marijuanaImportance;
        else if (status.includes('Medical')) score += marijuanaImportance * 0.6;
        else score += marijuanaImportance * 0.2;
      } else {
        score += marijuanaImportance;
      }

      // LGBTQ friendliness (lower rank is better)
      const lgbtqImportance = parseInt(responses.lgbtq) || 0;
      maxScore += lgbtqImportance;
      if (lgbtqImportance >= 3) {
        const rank = location.lgbtq?.rank || 999;
        if (rank <= 50) score += lgbtqImportance;
        else if (rank <= 100) score += lgbtqImportance * 0.7;
        else if (rank <= 150) score += lgbtqImportance * 0.4;
        else score += lgbtqImportance * 0.1;
      } else {
        score += lgbtqImportance;
      }

      // Cost of Living (lower is better)
      const costImportance = parseInt(responses.costOfLiving) || 0;
      maxScore += costImportance;
      if (costImportance >= 3) {
        const costOfLiving = parseFloat(location.economy?.costOfLiving) || 100;
        if (costOfLiving <= 90) score += costImportance;
        else if (costOfLiving <= 100) score += costImportance * 0.7;
        else if (costOfLiving <= 110) score += costImportance * 0.4;
        else score += costImportance * 0.2;
      } else {
        score += costImportance;
      }

      // Taxes (no income tax is best)
      const taxesImportance = parseInt(responses.taxes) || 0;
      maxScore += taxesImportance;
      if (taxesImportance >= 3) {
        const incomeTax = location.taxes?.incomeTax || 10;
        if (incomeTax === 0) score += taxesImportance;
        else if (incomeTax <= 3) score += taxesImportance * 0.6;
        else if (incomeTax <= 5) score += taxesImportance * 0.3;
        else score += taxesImportance * 0.1;
      } else {
        score += taxesImportance;
      }

      // Lifestyle (urban vs rural)
      const lifestyle = responses.lifestyle || '';
      if (lifestyle) {
        const density = location.density || 0;
        if (lifestyle === 'urban' && density > 3000) score += 5;
        else if (lifestyle === 'suburban' && density >= 1000 && density <= 3000) score += 5;
        else if (lifestyle === 'rural' && density < 1000) score += 5;
        else score += 2;
        maxScore += 5;
      }

      // VA Facilities
      const vaImportance = parseInt(responses.vaFacilities) || 0;
      maxScore += vaImportance;
      if (vaImportance >= 3) {
        if (location.vaFacilities) score += vaImportance;
        else score += vaImportance * 0.2;
      } else {
        score += vaImportance;
      }

      // Safety (lower crime index is better)
      const safetyImportance = parseInt(responses.safety) || 0;
      maxScore += safetyImportance;
      if (safetyImportance >= 3) {
        const crimeIndex = location.crime?.totalIndex || 10;
        if (crimeIndex <= 3) score += safetyImportance;
        else if (crimeIndex <= 5) score += safetyImportance * 0.7;
        else if (crimeIndex <= 7) score += safetyImportance * 0.4;
        else score += safetyImportance * 0.2;
      } else {
        score += safetyImportance;
      }

      // Gas Prices (lower is better)
      const gasImportance = parseInt(responses.gasPrices) || 0;
      maxScore += gasImportance;
      if (gasImportance >= 3) {
        const gasPrice = location.economy?.avgGasPrice || 5;
        if (gasPrice <= 3.0) score += gasImportance;
        else if (gasPrice <= 3.5) score += gasImportance * 0.7;
        else if (gasPrice <= 4.0) score += gasImportance * 0.4;
        else score += gasImportance * 0.2;
      } else {
        score += gasImportance;
      }

      // Calculate percentage match
      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      return {
        ...location,
        matchScore: matchPercent
      };
    });

    // Sort by match score descending and take top 20
    const topMatches = locationsWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    res.render('results', {
      title: 'Your Perfect Matches',
      locations: topMatches,
      criteria: responses
    });
  } catch (error) {
    console.error('Error processing quiz results:', error);
    res.status(500).send('Error processing quiz results');
  }
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

// API endpoint for locations data
app.get('/api/locations', async (req, res) => {
  try {
    const data = await database.getData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// City detail page route
app.get('/:state/:city', async (req, res) => {
  try {
    const { state, city } = req.params;
    const data = await database.getData();

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
});