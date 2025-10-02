const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');
const path = require('path');

const router = express.Router();
const Location = require('../models/Location');
const auth = require('../middleware/auth');

// Configure multer for file uploads
// Use /tmp directory for Vercel serverless compatibility
const upload = multer({
  dest: '/tmp/uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Admin login page (no layout needed)
router.get('/login', (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login',
    error: req.query.error,
    layout: false
  });
});

// Admin login POST
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await auth.login(username, password);

    if (result.success) {
      req.session.admin = result.user;
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/admin/login?error=' + encodeURIComponent(result.message));
    }
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=Login failed');
  }
});

// Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
});

// Admin dashboard
router.get('/dashboard', auth.requireAdmin, async (req, res) => {
  try {
    const stats = await Location.getStats();
    const recentLocations = await Location.findAll(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      admin: req.session.admin,
      stats,
      recentLocations,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Locations management
router.get('/locations', auth.requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const locations = await Location.findAll(limit, offset);
    const stats = await Location.getStats();

    res.render('admin/locations', {
      title: 'Manage Locations',
      admin: req.session.admin,
      locations,
      currentPage: page,
      totalPages: Math.ceil(stats.total_locations / limit),
      stats,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).send('Error loading locations');
  }
});

// Add location form
router.get('/locations/add', auth.requireAdmin, (req, res) => {
  res.render('admin/location-form', {
    title: 'Add New Location',
    admin: req.session.admin,
    location: null,
    action: 'add',
    layout: 'admin/layout'
  });
});

// Edit location form
router.get('/locations/edit/:id', auth.requireAdmin, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).send('Location not found');
    }

    res.render('admin/location-form', {
      title: 'Edit Location',
      admin: req.session.admin,
      location,
      action: 'edit',
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Edit location error:', error);
    res.status(500).send('Error loading location');
  }
});

// Save location (POST for add, PUT for edit)
router.post('/locations', auth.requireAdmin, async (req, res) => {
  try {
    const locationData = req.body;

    // Convert checkbox values to boolean
    const booleanFields = [
      'state_income_tax', 'retirement_tax_friendly', 'veteran_tax_benefits',
      'va_facilities_nearby', 'smart_city_features', 'constitutional_carry',
      'military_friendly_businesses', 'active_senior_community'
    ];

    booleanFields.forEach(field => {
      locationData[field] = locationData[field] === 'on' || locationData[field] === 'true' || locationData[field] === true;
    });

    // Convert numeric fields
    const numericFields = [
      'avg_temp_summer', 'avg_temp_winter', 'precipitation_annual', 'humidity_avg',
      'property_tax_rate', 'sales_tax_rate', 'cost_of_living_index', 'median_home_price',
      'healthcare_quality_score', 'va_medical_center_distance', 'hospital_count',
      'specialist_availability', 'recreation_score', 'cultural_activities_score',
      'dining_entertainment_score', 'shopping_score', 'walkability_score',
      'public_transit_score', 'airport_proximity', 'internet_speed_avg',
      'tech_hub_proximity', 'ccw_reciprocity_states', 'veteran_population_pct',
      'diversity_index', 'crime_rate'
    ];

    numericFields.forEach(field => {
      if (locationData[field] !== '' && locationData[field] !== undefined) {
        locationData[field] = parseFloat(locationData[field]) || null;
      } else {
        locationData[field] = null;
      }
    });

    const location = new Location(locationData);
    await location.save();

    res.redirect('/admin/locations?success=Location saved successfully');
  } catch (error) {
    console.error('Save location error:', error);
    res.status(500).send('Error saving location: ' + error.message);
  }
});

// Update location
router.put('/locations/:id', auth.requireAdmin, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Update location with new data
    Object.assign(location, req.body);
    await location.save();

    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Error updating location' });
  }
});

// Delete location
router.delete('/locations/:id', auth.requireAdmin, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await location.delete();
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Error deleting location' });
  }
});

// Export locations to CSV
router.get('/export/csv', auth.requireAdmin, async (req, res) => {
  try {
    const locations = await Location.findAll();

    const fields = [
      'id', 'name', 'state', 'city', 'region', 'climate_type', 'population_density',
      'state_income_tax', 'property_tax_rate', 'cost_of_living_index',
      'healthcare_quality_score', 'va_facilities_nearby', 'veteran_population_pct',
      'gun_laws_rating', 'description'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(locations);

    res.header('Content-Type', 'text/csv');
    res.attachment('locations.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).send('Error exporting data');
  }
});

// Import locations from CSV
router.post('/import/csv', auth.requireAdmin, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No CSV file uploaded');
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          try {
            // Convert string boolean values
            ['state_income_tax', 'va_facilities_nearby', 'veteran_tax_benefits'].forEach(field => {
              if (row[field]) {
                row[field] = row[field].toLowerCase() === 'true' || row[field] === '1';
              }
            });

            const location = new Location(row);
            await location.save();
            successCount++;
          } catch (error) {
            console.error('Error importing row:', error);
            errorCount++;
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.redirect(`/admin/locations?success=Import completed: ${successCount} successful, ${errorCount} errors`);
      });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).send('Error importing CSV');
  }
});

// Admin users management
router.get('/users', auth.requireAdmin, async (req, res) => {
  try {
    const users = await auth.getAdminUsers();
    res.render('admin/users', {
      title: 'Manage Admin Users',
      admin: req.session.admin,
      users,
      layout: 'admin/layout'
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).send('Error loading users');
  }
});

// Create new admin user
router.post('/users', auth.requireAdmin, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const result = await auth.createAdmin(username, password, email);

    if (result.success) {
      res.redirect('/admin/users?success=Admin user created successfully');
    } else {
      res.redirect('/admin/users?error=' + encodeURIComponent(result.message));
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.redirect('/admin/users?error=Error creating admin user');
  }
});

// Delete admin user
router.delete('/users/:id', auth.requireAdmin, async (req, res) => {
  try {
    const result = await auth.deleteAdmin(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;