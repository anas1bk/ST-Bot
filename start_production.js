#!/usr/bin/env node

/**
 * Production Startup Script
 * This script is used to start the bot in production environments only
 */

// 🛡️ DOUBLE CHECK - ENSURE PRODUCTION ONLY
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  console.log('🚫 PRODUCTION STARTUP BLOCKED');
  console.log('🚫 NODE_ENV must be set to "production"');
  console.log('🚫 This bot only works on hosting services');
  process.exit(1);
}

if (!process.env.RENDER_EXTERNAL_URL && !process.env.HEROKU_APP_NAME && !process.env.VERCEL_URL) {
  console.log('🚫 PRODUCTION STARTUP BLOCKED');
  console.log('🚫 Must be running on a hosting service');
  console.log('🚫 Deploy to Render, Heroku, or Vercel');
  process.exit(1);
}

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting bot in PRODUCTION mode only');
console.log('🌐 Only accessible via hosting service (Render, etc.)');

// Start the bot
require('./engineering_bot.js');

console.log('✅ Bot started successfully in production mode');
