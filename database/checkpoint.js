const Database = require('better-sqlite3');
const path = require('path');

// Checkpoint WAL file into main database
const dbPath = path.join(__dirname, '..', 'data', 'locations.db');
const db = new Database(dbPath);

console.log('Checkpointing WAL...');
db.pragma('wal_checkpoint(TRUNCATE)');
db.close();
console.log('✓ WAL checkpointed and truncated');
