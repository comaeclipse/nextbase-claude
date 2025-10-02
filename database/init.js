const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dataPath = path.join(__dirname, '..', 'data', 'locations.json');
    this.data = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Load JSON data
        const rawData = fs.readFileSync(this.dataPath, 'utf8');
        this.data = JSON.parse(rawData);
        console.log('Loaded JSON database');
        resolve();
      } catch (err) {
        console.error('Error loading database:', err.message);
        reject(err);
      }
    });
  }

  getLocations() {
    return this.data.locations || [];
  }

  addLocation(location) {
    if (!this.data.locations) {
      this.data.locations = [];
    }
    this.data.locations.push(location);
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8');
      console.log('Data saved successfully');
    } catch (err) {
      console.error('Error saving data:', err.message);
    }
  }

  close() {
    return Promise.resolve();
  }

  getData() {
    return this.data;
  }
}

module.exports = new Database();