const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./db.cjs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize the database tables and seed data
initDb();

// Login Route
app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body;
  // identifier can be email or phone
  db.get("SELECT * FROM users WHERE (email = ? OR phone = ?) AND password = ?", [identifier, identifier, password], (err, row) => {
    console.log("LOGIN ATTEMPT:", identifier, password, "-> ERR:", err, "-> ROW:", row);
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ user: row });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

const nodemailer = require('nodemailer');

// Configure Nodemailer transporter specifically for spotifyfree@gmail.com
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'spotifyfreeee26@gmail.com',
    pass: 'hnuqlxynukzemwxf' // Note for user: They must replace this with their Google App Password
  }
});

// Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { method, target } = req.body;
  if (method !== 'email') {
    return res.status(400).json({ error: "Only email verification is supported." });
  }

  // Generate random 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 mins

  db.run("INSERT INTO otps (method, target, otp, expires_at) VALUES (?, ?, ?, ?)", [method, target, otp, expiresAt], async function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const mailOptions = {
      from: 'spotifyfreeee26@gmail.com',
      to: target,
      subject: 'Your Spotify Verification Code',
      html: `
         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; text-align: center; border-radius: 8px;">
           <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" style="height: 40px; margin-bottom: 20px;" />
           <h2 style="color: #1DB954;">Action Required</h2>
           <p style="font-size: 16px;">We need to verify your email address to continue setting up your account.</p>
           <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 30px 0; padding: 10px; background-color: #121212; border-radius: 4px;">
             ${otp}
           </div>
           <p style="font-size: 12px; color: #a7a7a7;">This code will expire in 10 minutes. If you did not request this, please ignore it.</p>
         </div>
       `
    };

    try {
      // Live SMTP dispatch
      await transporter.sendMail(mailOptions);
      console.log(`[LIVE] Sent OTP: ${otp} via Email to ${target} using spotifyfree@gmail.com`);
      res.json({ message: `Verification email sent successfully`, simulated_otp: otp }); // keeping simulated_otp output for dev bridging
    } catch (mailError) {
      console.error("Nodemailer Error:", mailError);
      res.status(500).json({ error: "Failed to send email. Check SMTP credentials." });
    }
  });
});

// Verify OTP & Signup
app.post('/api/auth/verify-signup', (req, res) => {
  const { name, email, phone, dob, method, target, otp, password } = req.body;

  // Find OTP
  db.get("SELECT * FROM otps WHERE method = ? AND target = ? AND otp = ? AND expires_at > ?", [method, target, otp, new Date().toISOString()], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(400).json({ error: "Invalid or expired OTP" });

    // OTP is valid! Register user.
    db.run("INSERT INTO users (name, email, phone, dob, password, role, type) VALUES (?, ?, ?, ?, ?, 'user', 'free')",
      [name, email, phone, dob, password], function (err2) {
        if (err2) {
          if (err2.message.includes('UNIQUE') || err2.message.includes('Duplicate') || err2.message.includes('ER_DUP_ENTRY')) {
             return res.status(400).json({ error: "Email or Phone already exists!" });
          }
          return res.status(500).json({ error: err2.message });
        }
        res.json({ message: "Account created successfully!" });
      });
  });
});

// Forgot Password - Request Code
app.post('/api/auth/forgot-password', (req, res) => {
  const { identifier } = req.body;
  // Check if user exists
  db.get("SELECT * FROM users WHERE email = ? OR phone = ?", [identifier, identifier], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString(); // 15 mins

    db.run("INSERT INTO reset_tokens (target, token, expires_at) VALUES (?, ?, ?)", [identifier, token, expiresAt], async function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });

      const mailOptions = {
        from: 'spotifyfree@gmail.com',
        to: identifier,
        subject: 'Reset Your Spotify Password',
        html: `
             <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; text-align: center; border-radius: 8px;">
               <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" style="height: 40px; margin-bottom: 20px;" />
               <h2 style="color: #1DB954;">Password Reset Request</h2>
               <p style="font-size: 16px;">We received a request to reset your password. Enter the code below to proceed.</p>
               <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 30px 0; padding: 10px; background-color: #121212; border-radius: 4px;">
                 ${token}
               </div>
               <p style="font-size: 12px; color: #a7a7a7;">This code will expire in 15 minutes.</p>
             </div>
           `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`[LIVE] Reset Token sent: ${token} to ${identifier} via spotifyfree@gmail.com`);
        res.json({ message: `Password reset token sent to your email.`, simulated_token: token });
      } catch (mailError) {
        console.error("Nodemailer Error:", mailError);
        res.status(500).json({ error: "Failed to send reset email. Check SMTP credentials." });
      }
    });
  });
});

// Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { identifier, token, newPassword } = req.body;

  db.get("SELECT * FROM reset_tokens WHERE target = ? AND token = ? AND expires_at > ?", [identifier, token, new Date().toISOString()], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(400).json({ error: "Invalid or expired reset token" });

    // Reset password in DB
    db.run("UPDATE users SET password = ? WHERE email = ? OR phone = ?", [newPassword, identifier, identifier], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Password updated successfully! You can now log in." });
    });
  });
});

// Admin Route: Get all users
app.get('/api/users', (req, res) => {
  db.all("SELECT id, name, email, phone, role, type FROM users", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Admin Route: Update user type (premium/free)
app.put('/api/users/:id/type', (req, res) => {
  const { type } = req.body;
  const { id } = req.params;

  if (type !== 'free' && type !== 'premium') {
    return res.status(400).json({ error: "Invalid type" });
  }

  db.run("UPDATE users SET type = ? WHERE id = ?", [type, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "User type updated successfully", id });
  });
});

// Get songs
app.get('/api/songs', (req, res) => {
  db.all("SELECT * FROM songs", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ songs: rows });
  });
});

// Create Playlist (requires premium)
app.post('/api/playlists', (req, res) => {
  const { name, userId, userType } = req.body;

  if (userType !== 'premium') {
    return res.status(403).json({ error: "Only premium users can create playlists." });
  }

  db.run("INSERT INTO playlists (name, user_id) VALUES (?, ?)", [name, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Playlist created successfully", id: this.lastID, name });
  });
});

// Get User Playlists
app.get('/api/users/:userId/playlists', (req, res) => {
  const { userId } = req.params;
  db.all("SELECT * FROM playlists WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ playlists: rows });
  });
});

const ytSearch = require('yt-search');

// Search Route using yt-search to stream ANY song legally off YouTube bypassing Spotify DRM
app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Query required" });
  try {
    const r = await ytSearch(q);
    const videos = r.videos.slice(0, 15).map(v => ({
      id: v.videoId,
      title: v.title,
      artist: v.author.name,
      album: 'YouTube Stream',
      albumArt: v.thumbnail,
      audioSrc: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: v.timestamp
    }));
    res.json({ results: videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let trendingCache = null;
let trendingCacheTime = 0;

// Trending Songs Route (Cached for 1 hour)
app.get('/api/trending', async (req, res) => {
  try {
    if (trendingCache && Date.now() - trendingCacheTime < 3600000) {
      return res.json({ results: trendingCache });
    }
    const r = await ytSearch('top trending songs popular global hits playlist');
    const videos = r.videos.slice(0, 20).map(v => ({
      id: v.videoId,
      title: v.title,
      artist: v.author.name,
      album: 'Global Top Hits',
      albumArt: v.thumbnail,
      audioSrc: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: v.timestamp
    }));
    trendingCache = videos;
    trendingCacheTime = Date.now();
    res.json({ results: videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to ensure song exists in our DB
function ensureSongExists(song, callback) {
  db.get("SELECT id FROM songs WHERE audioSrc = ?", [song.audioSrc], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id);
    db.run(
      "INSERT INTO songs (title, artist, album, albumArt, audioSrc, duration) VALUES (?, ?, ?, ?, ?, ?)",
      [song.title, song.artist, song.album, song.albumArt, song.audioSrc, song.duration],
      function (insertErr) {
        if (insertErr) return callback(insertErr);
        callback(null, this.lastID);
      }
    );
  });
}

// Get single playlist details
app.get('/api/playlists/:playlistId', (req, res) => {
  const { playlistId } = req.params;
  db.get("SELECT * FROM playlists WHERE id = ?", [playlistId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Playlist not found" });
    res.json({ playlist: row });
  });
});

// Add song to playlist
app.post('/api/playlists/:playlistId/songs', (req, res) => {
  const { playlistId } = req.params;
  const { song } = req.body;
  ensureSongExists(song, (err, songId) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run("INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)", [playlistId, songId], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Song added to playlist", songId });
    });
  });
});

// Get Playlist Songs
app.get('/api/playlists/:playlistId/songs', (req, res) => {
  const { playlistId } = req.params;
  db.all(
    `SELECT s.* FROM songs s JOIN playlist_songs ps ON s.id = ps.song_id WHERE ps.playlist_id = ?`,
    [playlistId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ songs: rows });
    }
  );
});

// Remove Song from Playlist
app.delete('/api/playlists/:playlistId/songs/:songId', (req, res) => {
  const { playlistId, songId } = req.params;
  db.run("DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?", [playlistId, songId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Song removed from playlist" });
  });
});

// Add Liked Song
app.post('/api/users/:userId/liked_songs', (req, res) => {
  const { userId } = req.params;
  const { song } = req.body;
  ensureSongExists(song, (err, songId) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run("INSERT OR IGNORE INTO liked_songs (user_id, song_id) VALUES (?, ?)", [userId, songId], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Song added to liked songs", songId });
    });
  });
});

// Get Liked Songs
app.get('/api/users/:userId/liked_songs', (req, res) => {
  const { userId } = req.params;
  db.all(
    `SELECT s.* FROM songs s JOIN liked_songs ls ON s.id = ls.song_id WHERE ls.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ songs: rows });
    }
  );
});

// Remove Liked Song
app.delete('/api/users/:userId/liked_songs/:songId', (req, res) => {
  const { userId, songId } = req.params;
  db.run("DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?", [userId, songId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Song removed from liked list" });
  });
});

app.listen(port, () => {
  console.log(`Backend API listening at http://localhost:${port}`);
});
