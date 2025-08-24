#!/usr/bin/env node

/**
 * Production Startup Script
 * This script is used to start the bot in production environments only
 */

// Set production environment
process.env.NODE_ENV = 'production';

// Start the bot
require('./engineering_bot.js');

console.log('🚀 Bot started in production mode');
console.log('🌐 Only accessible via hosting service (Render, etc.)');
