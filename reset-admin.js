const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database', 'veteran_retirement.db');

async function resetAdminPassword() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const db = new sqlite3.Database(DB_PATH);

    // First try to update existing admin user
    db.run(
      'UPDATE admin_users SET password_hash = ? WHERE username = ?',
      [passwordHash, 'admin'],
      function(err) {
        if (err) {
          console.error('Error updating admin password:', err);
          return;
        }

        if (this.changes > 0) {
          console.log('Admin password updated successfully!');
          console.log('Username: admin');
          console.log('Password: admin123');
        } else {
          // If no rows were updated, create new admin user
          db.run(
            'INSERT INTO admin_users (username, password_hash, email) VALUES (?, ?, ?)',
            ['admin', passwordHash, 'admin@vetretire.com'],
            function(err) {
              if (err) {
                console.error('Error creating admin user:', err);
              } else {
                console.log('Admin user created successfully!');
                console.log('Username: admin');
                console.log('Password: admin123');
              }
              db.close();
            }
          );
        }
      }
    );

    if (this.changes > 0) {
      db.close();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdminPassword();