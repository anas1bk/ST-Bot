#!/usr/bin/env node

/**
 * Simple Start Script for Render
 * This ensures Render uses the correct startup process
 */

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Engineering Bot on Render...');

// Start the bot
require('./engineering_bot.js');

console.log('✅ Bot started successfully on Render');
