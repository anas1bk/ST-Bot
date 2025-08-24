#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Engineering Bot...\n');

// Check if config file exists
const configPath = path.join(__dirname, 'config.js');
if (!fs.existsSync(configPath)) {
  console.error('❌ Error: config.js file not found!');
  console.log('Please create a config.js file with your bot configuration.');
  process.exit(1);
}

// Check if main bot file exists
const botPath = path.join(__dirname, 'engineering_bot.js');
if (!fs.existsSync(botPath)) {
  console.error('❌ Error: engineering_bot.js file not found!');
  process.exit(1);
}

// Read config to check token
try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  if (configContent.includes('YOUR_BOT_TOKEN_HERE')) {
    console.error('❌ Error: Bot token not configured!');
    console.log('\n📝 Please follow these steps:');
    console.log('1. Open config.js');
    console.log('2. Replace "YOUR_BOT_TOKEN_HERE" with your actual bot token');
    console.log('3. Save the file and run this script again');
    console.log('\n💡 To get a bot token:');
    console.log('1. Open Telegram and search for @BotFather');
    console.log('2. Send /newbot command');
    console.log('3. Follow the instructions to create your bot');
    console.log('4. Copy the token and paste it in config.js');
    process.exit(1);
  }
  
  console.log('✅ Configuration file found and token appears to be set');
  
} catch (error) {
  console.error('❌ Error reading config file:', error.message);
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Start the bot
console.log('🤖 Starting the bot...\n');

try {
  require('./engineering_bot.js');
  console.log('✅ Bot started successfully!');
  console.log('📱 You can now use /ing in your Telegram bot');
} catch (error) {
  console.error('❌ Error starting bot:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure your bot token is correct');
  console.log('2. Check your internet connection');
  console.log('3. Ensure all dependencies are installed');
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down bot...');
  process.exit(0);
});
