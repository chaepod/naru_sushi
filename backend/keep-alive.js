// keep-alive.js
// This service prevents Render.com free tier cold starts by pinging the server every 14 minutes
// Render free tier spins down after 15 minutes of inactivity

const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend-url.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

function pingServer() {
  const url = `${BACKEND_URL}/health`;

  https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log(`[${new Date().toISOString()}] Keep-alive ping successful`);
    } else {
      console.log(`[${new Date().toISOString()}] Keep-alive ping returned status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Keep-alive ping failed:`, err.message);
  });
}

// Only run keep-alive in production
if (process.env.NODE_ENV === 'production') {
  console.log('Keep-alive service started. Pinging every 14 minutes to prevent cold starts.');

  // Ping immediately on startup
  pingServer();

  // Then ping every 14 minutes
  setInterval(pingServer, PING_INTERVAL);
} else {
  console.log('Keep-alive service disabled in development mode.');
}

module.exports = { pingServer };
