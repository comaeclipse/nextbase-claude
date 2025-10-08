-- Veteran Retirement Finder SQLite Schema
-- Hybrid approach: Wide table + Tagging system + JSON column

-- Main locations table with frequently queried columns
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT,
  state_party TEXT,

  -- Population & Density
  population INTEGER,
  density INTEGER,

  -- Economy & Cost
  cost_of_living INTEGER,
  avg_gas_price REAL,

  -- Taxes
  sales_tax REAL,
  income_tax REAL,

  -- Crime & Safety
  crime_index INTEGER,

  -- Climate (heavily filtered in quiz)
  climate_type TEXT,
  sunny_days INTEGER,
  avg_high_summer INTEGER,
  avg_low_winter INTEGER,
  avg_rainfall INTEGER,
  avg_snowfall INTEGER,
  humidity_summer INTEGER,

  -- VA & Healthcare
  va_facilities BOOLEAN DEFAULT 0,
  nearest_va TEXT,
  distance_to_va TEXT,

  -- Community Features
  tech_hub BOOLEAN DEFAULT 0,
  military_hub BOOLEAN DEFAULT 0,

  -- Marijuana Status
  marijuana_status TEXT,

  -- LGBTQ Ranking (lower is better)
  lgbtq_rank INTEGER,

  -- Coordinates
  lat REAL,
  lng REAL,

  -- Description (visible on pages)
  description TEXT,

  -- JSON column for everything else (politics, firearms details, veteran benefits, etc.)
  extra_data TEXT,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(state, city)
);

-- Tags for flexible categorization
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship
CREATE TABLE IF NOT EXISTS location_tags (
  location_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (location_id, tag_id),
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Strategic indexes for common queries
CREATE INDEX IF NOT EXISTS idx_state_city ON locations(state, city);
CREATE INDEX IF NOT EXISTS idx_cost_of_living ON locations(cost_of_living);
CREATE INDEX IF NOT EXISTS idx_crime ON locations(crime_index);
CREATE INDEX IF NOT EXISTS idx_sunny_days ON locations(sunny_days);
CREATE INDEX IF NOT EXISTS idx_temperature ON locations(avg_high_summer, avg_low_winter);
CREATE INDEX IF NOT EXISTS idx_va_facilities ON locations(va_facilities);
CREATE INDEX IF NOT EXISTS idx_tech_hub ON locations(tech_hub);
CREATE INDEX IF NOT EXISTS idx_coordinates ON locations(lat, lng);

-- Tag lookup index
CREATE INDEX IF NOT EXISTS idx_tag_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_location_tags_location ON location_tags(location_id);
CREATE INDEX IF NOT EXISTS idx_location_tags_tag ON location_tags(tag_id);
