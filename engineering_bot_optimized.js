#!/usr/bin/env node

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises; // Use promises for async operations
const path = require('path');
const { navigationStructure, universitiesData, resourceTypes, resourceEmojis, botConfig } = require('./config');
const { loadFileMapping, generateAutomaticFileMapping } = require('./auto_file_detector');
const Analytics = require('./analytics');
const SecurityManager = require('./security');
const BroadcastSystem = require('./broadcast');

// 🛡️ DEFINITIVE LOCAL RUNNING PREVENTION
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  console.log('🚫 BOT BLOCKED: This bot can only run in production environment');
  process.exit(1);
}

const hostingServices = [
  'RENDER_EXTERNAL_URL', 'HEROKU_APP_NAME', 'RAILWAY_STATIC_URL',
  'VERCEL_URL', 'NETLIFY_URL', 'FLY_APP_NAME', 'DIGITALOCEAN_APP_PLATFORM',
  'AWS_LAMBDA_FUNCTION_NAME'
];

const isHosted = hostingServices.some(service => process.env[service]);
if (!isHosted) {
  console.log('🚫 BOT BLOCKED: This bot can only run on hosting services');
  process.exit(1);
}

if (!process.env.BOT_TOKEN) {
  console.log('🚫 BOT TOKEN BLOCKED: BOT_TOKEN environment variable not set');
  process.exit(1);
}

console.log('✅ Environment check passed - bot is running in production');
console.log('✅ Hosting service detected:', hostingServices.find(service => process.env[service]));
console.log('✅ Bot token environment variable found');

// 🚀 PERFORMANCE OPTIMIZATIONS

// 1. MEMORY MANAGEMENT
const userSessions = new Map();
const adminMediaStorage = new Map();

// Session cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [chatId, session] of userSessions) {
    if (now - session.lastActivity > 30 * 60 * 1000) { // 30 minutes
      userSessions.delete(chatId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned ${cleanedCount} inactive user sessions`);
  }
}, 5 * 60 * 1000);

// 2. FILE CACHING SYSTEM
let fileMappingCache = null;
let fileMappingCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedFileMapping() {
  const now = Date.now();
  
  if (!fileMappingCache || now - fileMappingCacheTime > CACHE_DURATION) {
    console.log('🔄 Refreshing file mapping cache...');
    fileMappingCache = loadFileMapping();
    
    if (Object.keys(fileMappingCache).length === 0) {
      fileMappingCache = generateAutomaticFileMapping();
    }
    
    fileMappingCacheTime = now;
    console.log(`✅ File mapping cache refreshed with ${Object.keys(fileMappingCache).length} universities`);
  }
  
  return fileMappingCache;
}

// 3. FILE EXISTENCE CACHE
const fileExistenceCache = new Map();
const FILE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function cachedFileExists(filePath) {
  const now = Date.now();
  const cached = fileExistenceCache.get(filePath);
  
  if (cached && now - cached.timestamp < FILE_CACHE_DURATION) {
    return cached.exists;
  }
  
  try {
    await fs.access(filePath);
    fileExistenceCache.set(filePath, { exists: true, timestamp: now });
    return true;
  } catch (error) {
    fileExistenceCache.set(filePath, { exists: false, timestamp: now });
    return false;
  }
}

// 4. REQUEST QUEUING SYSTEM
const requestQueue = [];
let processingQueue = false;
let queueStats = { processed: 0, queued: 0, errors: 0 };

async function processQueue() {
  if (processingQueue) return;
  processingQueue = true;
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    try {
      await processRequest(request);
      queueStats.processed++;
      
      // Rate limiting: 50ms between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('Queue processing error:', error);
      queueStats.errors++;
    }
  }
  
  processingQueue = false;
}

async function queueRequest(request) {
  requestQueue.push(request);
  queueStats.queued++;
  
  if (requestQueue.length > 100) {
    console.warn(`⚠️ Request queue is large: ${requestQueue.length} requests`);
  }
  
  processQueue();
}

// 5. OPTIMIZED BOT INITIALIZATION
const bot = new TelegramBot(process.env.BOT_TOKEN, { 
  polling: true,
  webHook: false,
  disableWebhook: true,
  // Performance options
  request: {
    timeout: 30000,
    forever: true,
    pool: { maxSockets: 50 }
  }
});

// Clear webhook on startup
bot.setWebHook('').catch(() => console.log('ℹ️ No webhook to clear'));

// 6. INITIALIZE SYSTEMS
const security = new SecurityManager();
const analytics = new Analytics(botConfig);
const broadcast = new BroadcastSystem(bot, security, analytics);

// Security validation
try {
  const secureToken = security.validateAndSecureToken(process.env.BOT_TOKEN);
  if (!security.validateServerStatus()) {
    security.logSecurityEvent('SERVER_STATUS_INVALID', 'Server status validation failed', 'CRITICAL');
    process.exit(1);
  }
  console.log('✅ Bot token validated and secured');
  security.logSecurityEvent('BOT_STARTUP_SUCCESS', 'Bot startup validation completed successfully');
} catch (error) {
  security.logSecurityEvent('BOT_STARTUP_FAILED', error.message, 'CRITICAL');
  console.log('🚫 BOT STARTUP FAILED:', error.message);
  process.exit(1);
}

// 7. OPTIMIZED HELPER FUNCTIONS

// Cached keyboard generation
const keyboardCache = new Map();
const KEYBOARD_CACHE_DURATION = 60 * 1000; // 1 minute

function getCachedKeyboard(key, generator) {
  const now = Date.now();
  const cached = keyboardCache.get(key);
  
  if (cached && now - cached.timestamp < KEYBOARD_CACHE_DURATION) {
    return cached.keyboard;
  }
  
  const keyboard = generator();
  keyboardCache.set(key, { keyboard, timestamp: now });
  return keyboard;
}

function createInlineKeyboard(buttons, backButton = null) {
  const keyboard = [];
  
  for (let i = 0; i < buttons.length; i += 2) {
    const row = [buttons[i]];
    if (i + 1 < buttons.length) {
      row.push(buttons[i + 1]);
    }
    keyboard.push(row);
  }
  
  if (backButton) {
    keyboard.push([backButton]);
  }
  
  return { inline_keyboard: keyboard };
}

function getUniversityKeyboard() {
  return getCachedKeyboard('universities', () => {
    const buttons = Object.keys(navigationStructure.universities)
      .filter(universityKey => !navigationStructure.universities[universityKey].hidden)
      .map(universityKey => ({
        text: navigationStructure.universities[universityKey].displayName,
        callback_data: `university_${universityKey}`
      }));
    return createInlineKeyboard(buttons);
  });
}

// 8. OPTIMIZED FILE OPERATIONS
async function getFilesForResourceOptimized(universityKey, semesterKey, moduleName, resourceType) {
  try {
    const fileMapping = await getCachedFileMapping();
    const universityFiles = fileMapping[universityKey];
    if (!universityFiles) return null;
    
    const semesterFiles = universityFiles[semesterKey];
    if (!semesterFiles) return null;
    
    const moduleFiles = semesterFiles[moduleName];
    if (!moduleFiles) return null;
    
    const resourceFiles = moduleFiles[resourceType];
    if (!resourceFiles) return null;
    
    // Parallel file existence checks
    const existenceChecks = resourceFiles.map(async file => {
      const exists = await cachedFileExists(file.path);
      return exists ? file : null;
    });
    
    const results = await Promise.all(existenceChecks);
    return results.filter(file => file !== null);
  } catch (error) {
    console.error(`Error getting files for resource: ${error}`);
    return null;
  }
}

// 9. OPTIMIZED MESSAGE EDITING
async function safeEditMessageOptimized(bot, chatId, messageId, message, keyboard) {
  try {
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  } catch (editError) {
    if (editError.body && editError.body.error_code === 400 && 
        editError.body.description && editError.body.description.includes('query is too old')) {
      console.log('ℹ️ Ignoring old callback query - this is normal behavior');
      return;
    }
    
    console.error('Error editing message:', editError.message);
    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }
}

// 10. PERFORMANCE MONITORING
let performanceStats = {
  requests: 0,
  avgResponseTime: 0,
  memoryUsage: 0,
  startTime: Date.now()
};

setInterval(() => {
  const memUsage = process.memoryUsage();
  performanceStats.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
  
  console.log(`📊 Performance Stats:`, {
    requests: performanceStats.requests,
    avgResponseTime: performanceStats.avgResponseTime.toFixed(2) + 'ms',
    memoryUsage: performanceStats.memoryUsage.toFixed(2) + 'MB',
    queueSize: requestQueue.length,
    activeSessions: userSessions.size,
    uptime: Math.floor((Date.now() - performanceStats.startTime) / 1000) + 's'
  });
}, 60 * 1000); // Every minute

// 11. OPTIMIZED COMMAND HANDLERS
bot.onText(/\/ing/, async (msg) => {
  const startTime = Date.now();
  const chatId = msg.chat.id;
  
  // Update user session with activity timestamp
  userSessions.set(chatId, {
    currentView: 'universities',
    selectedUniversity: null,
    selectedSemester: null,
    selectedModule: null,
    selectedSpecialization: null,
    lastActivity: Date.now()
  });
  
  // Register user for broadcast system
  const userInfo = {
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    username: msg.from.username,
    id: msg.from.id
  };
  broadcast.registerUser(msg.from.id, userInfo);
  
  const keyboard = getUniversityKeyboard();
  
  await bot.sendMessage(chatId, botConfig.messages.welcome, {
    reply_markup: keyboard
  });
  
  // Update performance stats
  const responseTime = Date.now() - startTime;
  performanceStats.requests++;
  performanceStats.avgResponseTime = 
    (performanceStats.avgResponseTime * (performanceStats.requests - 1) + responseTime) / performanceStats.requests;
});

// 12. OPTIMIZED CALLBACK QUERY HANDLER
bot.on('callback_query', async (query) => {
  const startTime = Date.now();
  const chatId = query.message.chat.id;
  const data = query.data;
  
  // Queue the request for processing
  await queueRequest(async () => {
    try {
      // Answer callback query immediately
      try {
        await bot.answerCallbackQuery(query.id);
      } catch (callbackError) {
        if (callbackError.body && callbackError.body.error_code === 400 && 
            callbackError.body.description && callbackError.body.description.includes('query is too old')) {
          return; // Ignore old queries
        }
      }
      
      let userSession = userSessions.get(chatId) || {
        currentView: 'universities',
        selectedUniversity: null,
        selectedSemester: null,
        selectedModule: null,
        selectedSpecialization: null,
        lastActivity: Date.now()
      };
      
      // Update last activity
      userSession.lastActivity = Date.now();
      userSessions.set(chatId, userSession);
      
      // Process callback data (simplified for performance)
      if (data.startsWith('university_')) {
        const universityKey = data.replace('university_', '');
        userSession.selectedUniversity = universityKey;
        userSession.currentView = 'university_paths';
        userSessions.set(chatId, userSession);
        
        const universityName = navigationStructure.universities[universityKey].name;
        const message = botConfig.messages.universityPaths.replace('{universityName}', universityName);
    const keyboard = (() => {
      const university = navigationStructure.universities[universityKey];
      const buttons = [];
      if (!university.troncCommun.hidden) {
        buttons.push({ text: university.troncCommun.displayName, callback_data: `tronc_commun_${universityKey}` });
      }
      if (university.hasSpecializations) {
        buttons.push({ text: '🎯 Spécialités', callback_data: `specializations_${universityKey}` });
      }
      const backButton = { text: botConfig.buttons.backToUniversities, callback_data: 'back_to_universities' };
      return createInlineKeyboard(buttons, backButton);
    })();
        
        await safeEditMessageOptimized(bot, chatId, query.message.message_id, message, keyboard);
      }
      // Add other callback handlers here...
      
    } catch (error) {
      console.error('Callback processing error:', error);
      await bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
    }
  });
  
  // Update performance stats
  const responseTime = Date.now() - startTime;
  performanceStats.requests++;
  performanceStats.avgResponseTime = 
    (performanceStats.avgResponseTime * (performanceStats.requests - 1) + responseTime) / performanceStats.requests;
});

// 13. MEMORY LEAK PREVENTION
process.on('SIGINT', () => {
  console.log('🔄 Shutting down gracefully...');
  console.log('📊 Final Stats:', {
    totalRequests: performanceStats.requests,
    avgResponseTime: performanceStats.avgResponseTime.toFixed(2) + 'ms',
    queueStats,
    activeSessions: userSessions.size
  });
  process.exit(0);
});

// 14. ERROR HANDLING
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  security.logSecurityEvent('UNCAUGHT_EXCEPTION', error.message, 'CRITICAL');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
  security.logSecurityEvent('UNHANDLED_REJECTION', reason.toString(), 'CRITICAL');
});

console.log('🚀 Optimized Engineering Bot started successfully!');
console.log('📊 Performance monitoring enabled');
console.log('🧹 Memory management active');
console.log('⚡ Request queuing system ready');
