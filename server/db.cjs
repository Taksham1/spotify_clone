const mysql = require('mysql2');

// Auto-detects environment:
// - Locally (XAMPP): uses localhost defaults
// - Production (Render/server): reads from environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'spotify_clone';

// 1. Initial connection to create DB if needed
const initConn = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS
});

// 2. Main application pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 3. Polyfill SQLite syntax API so we don't have to rewrite index.cjs
const db = {
  run: (sql, params, cb) => {
    if (typeof params === 'function') { cb = params; params = []; }
    if (!params) params = [];

    // Translate SQLite Syntax -> MySQL Syntax safely
    let mysqlSql = sql.replace(/AUTOINCREMENT/ig, 'AUTO_INCREMENT');
    mysqlSql = mysqlSql.replace(/INSERT OR IGNORE/ig, 'INSERT IGNORE');

    pool.query(mysqlSql, params, function (err, results) {
      if (cb) {
        cb.call({
          lastID: results ? results.insertId : null,
          changes: results ? results.affectedRows : null
        }, err);
      }
    });
  },
  get: (sql, params, cb) => {
    if (typeof params === 'function') { cb = params; params = []; }
    if (!params) params = [];
    pool.query(sql, params, function (err, results) {
      if (err) return cb(err);
      cb(null, results[0] || null);
    });
  },
  all: (sql, params, cb) => {
    if (typeof params === 'function') { cb = params; params = []; }
    if (!params) params = [];
    pool.query(sql, params, function (err, results) {
      cb(err, results);
    });
  },
  serialize: (cb) => cb() // MySQL handles parallel pooling automatically
};

function initDb() {
  initConn.query('CREATE DATABASE IF NOT EXISTS spotify_clone', (err) => {
    if (err) {
      console.error("\n[!] FATAL: Failed to connect to XAMPP MySQL Database.\n[i] Ensure your XAMPP Apache & MySQL services are running!\n Error:", err.message);
      process.exit(1);
    }

    console.log('Connected to the XAMPP MySQL database [spotify_clone].');

    // Create Base Tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(255) UNIQUE,
        dob VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(255) DEFAULT 'user',
        type VARCHAR(255) DEFAULT 'free'
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS otps (
         id INT AUTO_INCREMENT PRIMARY KEY,
         method VARCHAR(255), 
         target VARCHAR(255),
         otp VARCHAR(255),
         expires_at DATETIME
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS reset_tokens (
         id INT AUTO_INCREMENT PRIMARY KEY,
         target VARCHAR(255),
         token VARCHAR(255),
         expires_at DATETIME
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        artist VARCHAR(255),
        album VARCHAR(255),
        albumArt TEXT,
        audioSrc TEXT,
        duration VARCHAR(255)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS playlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        user_id INT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INT,
        song_id INT,
        FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE,
        PRIMARY KEY (playlist_id, song_id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS liked_songs (
        user_id INT,
        song_id INT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, song_id)
      )`);

      // Seed core logic
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (!err && row && row.count === 0) {
          console.log("Seeding MySQL database with initial mock users and songs...");

          db.run(`INSERT INTO users (name, email, phone, password, role, type) VALUES ('Admin', 'admin@spotify.local', '1234567890', 'admin123', 'admin', 'premium')`);
          db.run(`INSERT INTO users (name, email, phone, password, role, type) VALUES ('Jane Doe', 'jane@spotify.local', '1111111111', 'password', 'user', 'premium')`);
          db.run(`INSERT INTO users (name, email, phone, password, role, type) VALUES ('John Doe', 'john@spotify.local', '2222222222', 'password', 'user', 'free')`);

          db.run(`INSERT INTO songs (title, artist, album, albumArt, audioSrc, duration) VALUES 
            ('Lofi Study', 'FASSounds', 'Study Beats', 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=300&h=300', 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3', '2:27'),
            ('Good Night', 'FASSounds', 'Night Drive', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300', 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_7acb857500.mp3?filename=good-night-160166.mp3', '2:27'),
            ('Cinematic Time Lapse', 'Lexin_Music', 'Cinematic Mood', 'https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=300&h=300', 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884ca91002.mp3?filename=cinematic-time-lapse-115672.mp3', '2:04'),
            ('Electronic Rock', 'AlexGrohl', 'Rock & Electronic', 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&q=80&w=300&h=300', 'https://cdn.pixabay.com/download/audio/2021/11/26/audio_ded5e4d262.mp3?filename=electronic-rock-king-around-here-15045.mp3', '2:41')
          `);
        }

        // Guarantee the requested superadmin always explicitly exists
        db.run(`INSERT IGNORE INTO users (name, email, phone, password, role, type) VALUES ('Taksham', 'adminTaksham@gmail.com', '9999999999', 'Taksham@123', 'admin', 'premium')`);
      });
    });
  });
}

module.exports = { db, initDb };
