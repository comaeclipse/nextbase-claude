const bcrypt = require('bcryptjs');
const database = require('../database/init');

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  } else {
    return res.redirect('/admin/login');
  }
};

// Login function
const login = async (username, password) => {
  return new Promise((resolve, reject) => {
    const db = database.getDB();

    db.get(
      'SELECT * FROM admin_users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          reject(err);
          return;
        }

        if (!user) {
          resolve({ success: false, message: 'Invalid credentials' });
          return;
        }

        try {
          const isValidPassword = await bcrypt.compare(password, user.password_hash);

          if (isValidPassword) {
            // Update last login
            db.run(
              'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
              [user.id]
            );

            resolve({
              success: true,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
              }
            });
          } else {
            resolve({ success: false, message: 'Invalid credentials' });
          }
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Create admin user
const createAdmin = async (username, password, email = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const db = database.getDB();

      db.run(
        'INSERT INTO admin_users (username, password_hash, email) VALUES (?, ?, ?)',
        [username, passwordHash, email],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              resolve({ success: false, message: 'Username already exists' });
            } else {
              reject(err);
            }
          } else {
            resolve({
              success: true,
              userId: this.lastID,
              message: 'Admin user created successfully'
            });
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

// Get all admin users
const getAdminUsers = () => {
  return new Promise((resolve, reject) => {
    const db = database.getDB();

    db.all(
      'SELECT id, username, email, role, created_at, last_login FROM admin_users ORDER BY created_at DESC',
      (err, users) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      }
    );
  });
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.getDB();

      // First verify current password
      db.get(
        'SELECT password_hash FROM admin_users WHERE id = ?',
        [userId],
        async (err, user) => {
          if (err) {
            reject(err);
            return;
          }

          if (!user) {
            resolve({ success: false, message: 'User not found' });
            return;
          }

          const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

          if (!isValidPassword) {
            resolve({ success: false, message: 'Current password is incorrect' });
            return;
          }

          // Hash new password and update
          const saltRounds = 10;
          const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

          db.run(
            'UPDATE admin_users SET password_hash = ? WHERE id = ?',
            [newPasswordHash, userId],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({ success: true, message: 'Password updated successfully' });
              }
            }
          );
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

// Delete admin user
const deleteAdmin = (userId) => {
  return new Promise((resolve, reject) => {
    const db = database.getDB();

    db.run(
      'DELETE FROM admin_users WHERE id = ? AND id != 1', // Protect first admin
      [userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve({ success: true, message: 'Admin user deleted successfully' });
          } else {
            resolve({ success: false, message: 'Admin user not found or cannot delete primary admin' });
          }
        }
      }
    );
  });
};

module.exports = {
  requireAdmin,
  login,
  createAdmin,
  getAdminUsers,
  changePassword,
  deleteAdmin
};