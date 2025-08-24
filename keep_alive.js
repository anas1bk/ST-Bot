// Keep-Alive system for Render
const https = require('https');
const http = require('http');

// Function to ping the server
function pingServer() {
  const url = process.env.RENDER_EXTERNAL_URL || 'https://your-app-name.onrender.com';
  
  console.log(`🔄 Pinging server: ${url}`);
  
  const protocol = url.startsWith('https') ? https : http;
  
  protocol.get(url, (res) => {
    console.log(`✅ Server pinged successfully! Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`❌ Ping failed: ${err.message}`);
  });
}

// Ping every 14 minutes (840000 ms) to keep the server alive
// Render free tier sleeps after 15 minutes of inactivity
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

console.log('🚀 Keep-Alive system started');
console.log(`⏰ Will ping server every ${PING_INTERVAL / 60000} minutes`);

// Initial ping
pingServer();

// Set up periodic pings
setInterval(pingServer, PING_INTERVAL);

// Also ping on process start
process.on('SIGINT', () => {
  console.log('🛑 Keep-Alive system stopped');
  process.exit(0);
});

module.exports = { pingServer };
