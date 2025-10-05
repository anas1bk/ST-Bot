#!/usr/bin/env node

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { navigationStructure, universitiesData, resourceTypes, resourceEmojis, botConfig } = require('./config');
const { loadFileMapping, generateAutomaticFileMapping } = require('./auto_file_detector');
const Analytics = require('./analytics');
const SecurityManager = require('./security');
const BroadcastSystem = require('./broadcast');

// 🛡️ DEFINITIVE LOCAL RUNNING PREVENTION
// Basic environment checks before security initialization
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  console.log('🚫 BOT BLOCKED: This bot can only run in production environment');
  console.log('🚫 Local running is completely disabled for security');
  console.log('🚫 Deploy to Render or another hosting service to use this bot');
  process.exit(1);
}

// Check hosting service detection
const hostingServices = [
  'RENDER_EXTERNAL_URL',
  'HEROKU_APP_NAME', 
  'RAILWAY_STATIC_URL',
  'VERCEL_URL',
  'NETLIFY_URL',
  'FLY_APP_NAME',
  'DIGITALOCEAN_APP_PLATFORM',
  'AWS_LAMBDA_FUNCTION_NAME'
];

const isHosted = hostingServices.some(service => process.env[service]);

if (!isHosted) {
  console.log('🚫 BOT BLOCKED: This bot can only run on hosting services');
  console.log('🚫 Detected local environment - bot will not start');
  console.log('🚫 Deploy to Render, Heroku, or Vercel to use this bot');
  process.exit(1);
}

// Check bot token presence
if (!process.env.BOT_TOKEN) {
  console.log('🚫 BOT TOKEN BLOCKED: BOT_TOKEN environment variable not set');
  console.log('🚫 This bot requires a valid bot token');
  process.exit(1);
}

console.log('✅ Environment check passed - bot is running in production');
console.log('✅ Hosting service detected:', hostingServices.find(service => process.env[service]));
console.log('✅ Bot token environment variable found');

// Initialize bot with secure token
const bot = new TelegramBot(process.env.BOT_TOKEN, { 
  polling: true,
  // Add these options to prevent conflicts
  webHook: false,
  // Clear any existing webhooks on startup
  disableWebhook: true
});

// Clear webhook on startup to prevent conflicts
bot.setWebHook('').then(() => {
  console.log('✅ Webhook cleared successfully');
}).catch((error) => {
  console.log('ℹ️ No webhook to clear or already cleared');
});

// User session storage
const userSessions = new Map();

// Admin media storage for broadcasts
const adminMediaStorage = new Map();

// Initialize security and analytics
const security = new SecurityManager();
const analytics = new Analytics(botConfig);

// Initialize broadcast system
const broadcast = new BroadcastSystem(bot, security, analytics);

// Security validation after initialization
try {
  // Validate and secure the token
  const secureToken = security.validateAndSecureToken(process.env.BOT_TOKEN);
  
  // Validate server status
  if (!security.validateServerStatus()) {
    security.logSecurityEvent('SERVER_STATUS_INVALID', 'Server status validation failed', 'CRITICAL');
    console.log('🚫 SERVER STATUS INVALID: Server status validation failed');
    process.exit(1);
  }

  console.log('✅ Bot token validated and secured');
  console.log('✅ Server status validated');
  
  security.logSecurityEvent('BOT_STARTUP_SUCCESS', 'Bot startup validation completed successfully');

} catch (error) {
  security.logSecurityEvent('BOT_STARTUP_FAILED', error.message, 'CRITICAL');
  console.log('🚫 BOT STARTUP FAILED:', error.message);
  console.log('🚫 Please check your configuration and try again');
  process.exit(1);
}

// Load automatic file mapping
let fileMapping = {};
try {
  console.log('🔄 Loading automatic file mapping...');
  fileMapping = loadFileMapping();
  
  // If no mapping exists, generate one
  if (Object.keys(fileMapping).length === 0) {
    console.log('📁 No existing mapping found, generating automatic mapping...');
    fileMapping = generateAutomaticFileMapping();
  }
  
  console.log(`✅ Loaded file mapping with ${Object.keys(fileMapping).length} universities`);
} catch (error) {
  console.error('❌ Error loading file mapping:', error);
  fileMapping = {};
}

// Helper function to create inline keyboard
function createInlineKeyboard(buttons, backButton = null) {
  const keyboard = [];
  
  // Add main buttons
  for (let i = 0; i < buttons.length; i += 2) {
    const row = [buttons[i]];
    if (i + 1 < buttons.length) {
      row.push(buttons[i + 1]);
    }
    keyboard.push(row);
  }
  
  // Add back button if provided
  if (backButton) {
    keyboard.push([backButton]);
  }
  
  return {
    inline_keyboard: keyboard
  };
}

// Helper function to get university selection keyboard
function getUniversityKeyboard() {
  const buttons = Object.keys(navigationStructure.universities)
    .filter(universityKey => !navigationStructure.universities[universityKey].hidden)
    .map(universityKey => ({
      text: navigationStructure.universities[universityKey].displayName,
      callback_data: `university_${universityKey}`
    }));
  
  return createInlineKeyboard(buttons);
}

// Helper function to get university paths keyboard
function getUniversityPathsKeyboard(universityKey) {
  const university = navigationStructure.universities[universityKey];
  const buttons = [];
  
  // Only show Tronc commun if not hidden
  if (!university.troncCommun.hidden) {
    buttons.push({
      text: university.troncCommun.displayName,
      callback_data: `tronc_commun_${universityKey}`
    });
  }
  
  // Add specializations button only if university has specializations
  if (university.hasSpecializations) {
    buttons.push({
      text: '🎯 Spécialités',
      callback_data: `specializations_${universityKey}`
    });
  }
  
  const backButton = {
    text: botConfig.buttons.backToUniversities,
    callback_data: 'back_to_universities'
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get semester selection keyboard for a university (Tronc commun)
function getSemesterKeyboard(universityKey) {
  const semesters = navigationStructure.universities[universityKey].troncCommun.semesters;
  const buttons = Object.keys(semesters).map(semesterKey => ({
    text: semesters[semesterKey].name,
    callback_data: `semester_${universityKey}_${semesterKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToUniversityPaths,
    callback_data: `back_to_university_paths_${universityKey}`
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get modules keyboard for a semester (Tronc commun)
function getModulesKeyboard(universityKey, semesterKey) {
  const modules = navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey].modules;
  const buttons = modules.map((module, index) => ({
    text: module,
    callback_data: `mod_${universityKey}_${semesterKey}_${index}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToSemesters,
    callback_data: `back_to_semesters_${universityKey}`
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get specialization selection keyboard for a university
function getSpecializationKeyboard(universityKey) {
  const specializations = navigationStructure.universities[universityKey].specializations;
  const buttons = Object.keys(specializations).map(specKey => ({
    text: specializations[specKey].displayName,
    callback_data: `specialization_${universityKey}_${specKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToUniversityPaths,
    callback_data: `back_to_university_paths_${universityKey}`
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get semester selection keyboard for a specialization
function getSpecializationSemesterKeyboard(universityKey, specKey) {
  const semesters = navigationStructure.universities[universityKey].specializations[specKey].semesters;
  const buttons = Object.keys(semesters).map(semesterKey => ({
    text: semesters[semesterKey].name,
    callback_data: `spec_semester_${universityKey}_${specKey}_${semesterKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToSpecializations,
    callback_data: `back_to_specializations_${universityKey}`
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get modules keyboard for a specialization semester
function getSpecializationModulesKeyboard(universityKey, specKey, semesterKey) {
  const modules = navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].modules;
  const buttons = modules.map((module, index) => ({
    text: module,
    callback_data: `spec_mod_${universityKey}_${specKey}_${semesterKey}_${index}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToSemesters,
    callback_data: `back_to_spec_semesters_${universityKey}_${specKey}`
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get resource types keyboard
function getResourceTypesKeyboard(universityKey, semesterKey, moduleIndex) {
  const backButton = {
    text: botConfig.buttons.backToModules,
    callback_data: `back_to_modules_${universityKey}_${semesterKey}`
  };
  
  return createInlineKeyboard(resourceTypes, backButton);
}

// Helper function to get resource types keyboard for specialization
function getSpecializationResourceTypesKeyboard(universityKey, specKey, semesterKey, moduleIndex) {
  const backButton = {
    text: botConfig.buttons.backToModules,
    callback_data: `back_to_spec_modules_${universityKey}_${specKey}_${semesterKey}`
  };
  
  return createInlineKeyboard(resourceTypes, backButton);
}

// Helper function to format message with placeholders
function formatMessage(template, replacements) {
  let message = template;
  for (const [key, value] of Object.entries(replacements)) {
    message = message.replace(`{${key}}`, value);
  }
  return message;
}

// Helper function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(`Error checking file existence: ${error}`);
    return false;
  }
}

// Helper function to get files for a specific resource type
function getFilesForResource(universityKey, semesterKey, moduleName, resourceType) {
  try {
    const universityFiles = fileMapping[universityKey];
    if (!universityFiles) return null;
    
    const semesterFiles = universityFiles[semesterKey];
    if (!semesterFiles) return null;
    
    const moduleFiles = semesterFiles[moduleName];
    if (!moduleFiles) return null;
    
    const resourceFiles = moduleFiles[resourceType];
    if (!resourceFiles) return null;
    
    // Filter out files that don't exist
    return resourceFiles.filter(file => fileExists(file.path));
  } catch (error) {
    console.error(`Error getting files for resource: ${error}`);
    return null;
  }
}

// Helper function to create file selection keyboard
function createFileSelectionKeyboard(files, universityKey, semesterKey, moduleIndex, resourceType) {
  const buttons = files.map((file, index) => ({
    text: `${file.name}`,
    callback_data: `file_${universityKey}_${semesterKey}_${moduleIndex}_${resourceType}_${index}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToResourceTypes,
    callback_data: `mod_${universityKey}_${semesterKey}_${moduleIndex}`
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to safely edit messages with fallback
async function safeEditMessage(bot, chatId, messageId, message, keyboard) {
  try {
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  } catch (editError) {
    console.error('Error editing message:', editError.message);
    // Fallback: send a new message instead
    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }
}

// Command handler for /ing
bot.onText(/\/ing/, (msg) => {
  const chatId = msg.chat.id;
  
  // Register user for broadcast system
  const userInfo = {
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    username: msg.from.username,
    id: msg.from.id
  };
  broadcast.registerUser(msg.from.id, userInfo);
  
  // Store user session
  userSessions.set(chatId, {
    currentView: 'universities',
    selectedUniversity: null,
    selectedSemester: null,
    selectedModule: null,
    selectedSpecialization: null
  });
  
  const keyboard = getUniversityKeyboard();
  
  bot.sendMessage(chatId, botConfig.messages.welcome, {
    reply_markup: keyboard
  });
});

// Command handler for /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Security validation
  if (!security.validateUserInput(msg.text, 'command')) {
    security.logSecurityEvent('INVALID_USER_INPUT', 'Invalid input in /start command', 'WARNING');
    return;
  }
  
  // Register user for broadcast system
  const userInfo = {
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    username: msg.from.username,
    id: msg.from.id
  };
  broadcast.registerUser(msg.from.id, userInfo);
  
  // Track user activity for analytics
  analytics.trackUserActivity(msg.from.id, userInfo, 'command_start');
  
  const welcomeMessage = `🎓 مرحباً بك في بوت الهندسة!

مرحباً ${msg.from.first_name}! 👋

هذا البوت يساعدك في الوصول إلى الموارد التعليمية للهندسة.

استخدم الأوامر التالية:
• /ing - القائمة الرئيسية للموارد
• /about - معلومات عن البوت
• /send - إرسال ملفات للمطور
• /help - المساعدة

📢 للحصول على آخر التحديثات والإعلانات المهمة، استخدم:
• /subscribe - الاشتراك في الإعلانات

أهلاً وسهلاً بك! 🚀`;
  
  // Security monitoring of bot response
  if (!security.monitorBotResponse(welcomeMessage)) {
    security.logSecurityEvent('SUSPICIOUS_BOT_RESPONSE', 'Suspicious content in /start response', 'WARNING');
    return;
  }
  
  bot.sendMessage(chatId, welcomeMessage);
});

// Command handler for /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin for extended help
  const isAdmin = userId.toString() === process.env.BOT_OWNER_ID;
  
  if (isAdmin) {
    const adminHelp = `🎓 **Engineering Bot Help**

**📚 Main Commands:**
• /ing - القائمة الرئيسية للموارد
• /start - بدء البوت
• /help - المساعدة
• /about - معلومات عن البوت

**📢 Broadcast Commands (Admin Only):**
• /broadcast [message] - Send to all users
• /broadcast_subscribers [message] - Send to subscribers only
• /broadcast_active [message] - Send to active users only
• /broadcast_stats - Show broadcast statistics
• /broadcast_history - Show recent broadcasts

**🔧 Admin Commands:**
• /refresh - Regenerate file mapping
• /analytics - View real-time analytics
• /analytics_weekly - Generate weekly report
• /analytics_monthly - Generate monthly report

**👥 User Commands:**
• /subscribe - Subscribe to broadcasts
• /unsubscribe - Unsubscribe from broadcasts
• /send - إرسال ملفات للمطور
• /feedback - إرسال ملاحظات

**📊 Examples:**
• /broadcast 🎉 New files added!
• /broadcast_subscribers 📚 Important update
• /analytics - View bot statistics`;
    
    bot.sendMessage(chatId, adminHelp, { parse_mode: 'Markdown' });
  } else {
    const userHelp = `🎓 **Engineering Bot Help**

**📚 Main Commands:**
• /ing - القائمة الرئيسية للموارد
• /start - بدء البوت
• /help - المساعدة
• /about - معلومات عن البوت

**👥 User Commands:**
• /subscribe - Subscribe to broadcasts
• /unsubscribe - Unsubscribe from broadcasts
• /send - إرسال ملفات للمطور
• /feedback - إرسال ملاحظات

**📢 Stay Updated:**
Use /subscribe to receive important announcements and updates!`;
    
    bot.sendMessage(chatId, userHelp, { parse_mode: 'Markdown' });
  }
});

// Command handler for /test
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '✅ Bot is working correctly! Use /ing to start.');
});

// Command handler for /refresh (regenerate file mapping)
bot.onText(/\/refresh/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '🔄 Regenerating file mapping...');
    
    // Regenerate file mapping
    const newFileMapping = generateAutomaticFileMapping();
    fileMapping = newFileMapping;
    
    const totalFiles = Object.values(newFileMapping).reduce((total, university) => {
      return total + Object.values(university).reduce((universityTotal, semester) => {
        return universityTotal + Object.values(semester).reduce((semesterTotal, module) => {
          return semesterTotal + Object.values(module).reduce((moduleTotal, resourceType) => {
            return moduleTotal + resourceType.length;
          }, 0);
        }, 0);
      }, 0);
    }, 0);
    
    bot.sendMessage(chatId, `✅ File mapping refreshed successfully!\n\n📊 Found ${totalFiles} files across ${Object.keys(newFileMapping).length} universities.`);
    
  } catch (error) {
    console.error('Error refreshing file mapping:', error);
    bot.sendMessage(chatId, '❌ Error refreshing file mapping. Check console for details.');
  }
});

// Command handler for /analytics (admin only)
bot.onText(/\/analytics/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    const stats = analytics.getRealTimeStats();
    
    const message = `📊 <b>Real-Time Analytics</b>\n\n` +
      `<b>Today's Activity:</b>\n` +
      `• Users: ${stats.today.totalUsers}\n` +
      `• Actions: ${stats.today.totalActions}\n` +
      `• Downloads: ${stats.today.fileDownloads}\n` +
      `• Views: ${stats.today.moduleViews}\n` +
      `• Feedback: ${stats.today.feedbackSent}\n` +
      `• Files Shared: ${stats.today.filesShared}\n\n` +
      `<b>Overall Stats:</b>\n` +
      `• Total Users: ${stats.totalUsers}\n` +
      `• Total Files: ${stats.totalFiles}\n` +
      `• Total Modules: ${stats.totalModules}\n` +
      `• Uptime: ${stats.uptime}\n\n` +
      `<b>Commands:</b>\n` +
      `/analytics_weekly - Generate weekly report\n` +
      `/analytics_monthly - Generate monthly report\n` +
      `/analytics_clean - Clean old data`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    bot.sendMessage(chatId, '❌ Error getting analytics. Check console for details.');
  }
});

// Command handler for /analytics_weekly (admin only)
bot.onText(/\/analytics_weekly/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '📊 Generating weekly analytics report...');
    await analytics.generateWeeklyReport(bot);
    bot.sendMessage(chatId, '✅ Weekly report sent to analytics channel!');
  } catch (error) {
    console.error('Error generating weekly report:', error);
    bot.sendMessage(chatId, '❌ Error generating weekly report. Check console for details.');
  }
});

// Command handler for /analytics_monthly (admin only)
bot.onText(/\/analytics_monthly/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '📈 Generating monthly analytics report...');
    await analytics.generateMonthlyReport(bot);
    bot.sendMessage(chatId, '✅ Monthly report sent to analytics channel!');
  } catch (error) {
    console.error('Error generating monthly report:', error);
    bot.sendMessage(chatId, '❌ Error generating monthly report. Check console for details.');
  }
});

// Command handler for /analytics_clean (admin only)
bot.onText(/\/analytics_clean/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '🧹 Cleaning old analytics data...');
    analytics.cleanOldData();
    bot.sendMessage(chatId, '✅ Old analytics data cleaned successfully!');
  } catch (error) {
    console.error('Error cleaning analytics data:', error);
    bot.sendMessage(chatId, '❌ Error cleaning analytics data. Check console for details.');
  }
});

// Command handler for /security (admin only)
bot.onText(/\/security/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    const metrics = security.getSecurityMetrics();
    
    const message = `🛡️ <b>Security Status</b>\n\n` +
      `<b>Security Events:</b>\n` +
      `• Total Events: ${metrics.totalEvents}\n` +
      `• Critical Events: ${metrics.criticalEvents}\n` +
      `• Error Events: ${metrics.errorEvents}\n` +
      `• Warning Events: ${metrics.warningEvents}\n\n` +
      `<b>Suspicious Activities:</b>\n` +
      `• Count: ${metrics.suspiciousActivities}\n\n` +
      `<b>System Status:</b>\n` +
      `• Uptime: ${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m\n` +
      `• Memory Usage: ${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB\n\n` +
      `<b>Commands:</b>\n` +
      `/security_clean - Clean old security logs\n` +
      `/security_export - Export security data`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Error getting security metrics:', error);
    bot.sendMessage(chatId, '❌ Error getting security metrics. Check console for details.');
  }
});

// Command handler for /security_clean (admin only)
bot.onText(/\/security_clean/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Check if user is bot owner
  if (msg.from.id.toString() !== botConfig.ownerId) {
    bot.sendMessage(chatId, '❌ This command is only available to the bot owner.');
    return;
  }
  
  try {
    bot.sendMessage(chatId, '🧹 Cleaning old security logs...');
    security.cleanupOldLogs();
    bot.sendMessage(chatId, '✅ Old security logs cleaned successfully!');
  } catch (error) {
    console.error('Error cleaning security logs:', error);
    bot.sendMessage(chatId, '❌ Error cleaning security logs. Check console for details.');
  }
});

// Command handler for /about
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  const aboutMessage = `🤖 StTcIng_bot 🤖

هذا البوت هو رفيقك في منصة تليجرام الذي يقدم العديد من الخدمات والإمكانيات المفيدة. دعنا نستعرض الوظائف الرئيسية لهذا البوت:

تعليمات المستخدمين :

 🔹البداية (/start) 🚀:

 عند استخدام هذا الأمر، يُرحب البوت بالمستخدم.


 🔹القائمة الرئيسية (/ing) 📚:

   يمكن للمستخدمين الدخول إلى هذه القائمة للاختيار من بين العديد من الخيارات، مثل الوصول إلى معلومات حول المساقات الدراسية والامتحانات والكتب، وحتى كيفية التواصل مع المدرسين والمزيد.


   🔷️ إرسال ملفات وصور وفيديوهات للمشاركة (/send) 📤 : 

   بإمكان المستخدمين إرسال ملفات للمشاركة مع الطلاب الآخرين في قناة خاصة.

 🔹إرسال ملاحظات (/feedback) 📢:

   يُتيح البوت للمستخدمين إمكانية مشاركة ملاحظاتهم وآرائهم أو في حالة واجهوا مشاكل في البوت ، ومن ثم يقوم بإرسال هذه الملاحظات إلى منشئ البوت.
    ملاحظات المستخدمين ترسل إلى قناة خاصة (ليتم الرد في أسرع وقت ممكن)   
في حالة توقف البوت عن العمل يمكن التواصل مع منشئ البوت @anassbkk ,  
تم تقديم هذا البوت لكم بواسطة @anassbkk، شكر خاص لـ @mohammedkeina، لا تنسونا من دعائكم.


  هذا البوت يوفر إمكانيات متعددة للمستخدمين ويمكن استخدامه لأغراض مختلفة على منصة تليجرام. ,و هو شريك موثوق يساعد المستخدمين على الحصول على المعلومات والخدمات بسهولة وفعالية. 📱`;
  
  bot.sendMessage(chatId, aboutMessage);
});

// Command handler for /send
bot.onText(/\/send/, (msg) => {
  const chatId = msg.chat.id;
  
  // Store user session for file sending
  userSessions.set(chatId, {
    currentView: 'sending_file',
    selectedUniversity: null,
    selectedSemester: null,
    selectedModule: null,
    fileData: null,
    fileName: null
  });
  
  bot.sendMessage(chatId, '📤 Please send the file, photo, video, audio, or voice message you want to share:');
});

// Command handler for /feedback
bot.onText(/\/feedback/, (msg) => {
  const chatId = msg.chat.id;
  
  // Store user session for feedback
  userSessions.set(chatId, {
    currentView: 'sending_feedback',
    selectedUniversity: null,
    selectedSemester: null,
    selectedModule: null,
    fileData: null,
    fileName: null
  });
  
  bot.sendMessage(chatId, '📢 Please share your feedback, suggestions, or report any issues:\n\n(Your feedback will be sent to the bot owner)');
});

// Handle file messages (documents)
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);
  
  if (userSession && userSession.currentView === 'sending_file') {
    // Store file data
    userSession.fileData = {
      type: 'document',
      file_id: msg.document.file_id,
      file_name: msg.document.file_name,
      file_size: msg.document.file_size,
      mime_type: msg.document.mime_type
    };
    userSessions.set(chatId, userSession);
    
    bot.sendMessage(chatId, 'Please enter the name of the file:');
  }
});

// Handle photo messages
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);
  
  if (userSession && userSession.currentView === 'sending_file') {
    // Get the largest photo size
    const photo = msg.photo[msg.photo.length - 1];
    
    // Store photo data
    userSession.fileData = {
      type: 'photo',
      file_id: photo.file_id,
      file_name: 'photo.jpg',
      file_size: photo.file_size,
      mime_type: 'image/jpeg',
      caption: msg.caption || ''
    };
    userSessions.set(chatId, userSession);
    
    bot.sendMessage(chatId, 'Please enter a name for this photo:');
  }
});

// Handle video messages
bot.on('video', async (msg) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);
  
  if (userSession && userSession.currentView === 'sending_file') {
    // Store video data
    userSession.fileData = {
      type: 'video',
      file_id: msg.video.file_id,
      file_name: msg.video.file_name || 'video.mp4',
      file_size: msg.video.file_size,
      mime_type: msg.video.mime_type,
      caption: msg.caption || ''
    };
    userSessions.set(chatId, userSession);
    
    bot.sendMessage(chatId, 'Please enter a name for this video:');
  }
});

// Handle audio messages
bot.on('audio', async (msg) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);
  
  if (userSession && userSession.currentView === 'sending_file') {
    // Store audio data
    userSession.fileData = {
      type: 'audio',
      file_id: msg.audio.file_id,
      file_name: msg.audio.file_name || 'audio.mp3',
      file_size: msg.audio.file_size,
      mime_type: msg.audio.mime_type,
      caption: msg.caption || ''
    };
    userSessions.set(chatId, userSession);
    
    bot.sendMessage(chatId, 'Please enter a name for this audio:');
  }
});

// Handle voice messages
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);
  
  if (userSession && userSession.currentView === 'sending_file') {
    // Store voice data
    userSession.fileData = {
      type: 'voice',
      file_id: msg.voice.file_id,
      file_name: 'voice.ogg',
      file_size: msg.voice.file_size,
      mime_type: 'audio/ogg',
      duration: msg.voice.duration,
      caption: msg.caption || ''
    };
    userSessions.set(chatId, userSession);
    
    bot.sendMessage(chatId, 'Please enter a name for this voice message:');
  }
});

// Handle admin media for broadcasts
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin and store media for broadcast
  if (userId.toString() === process.env.BOT_OWNER_ID) {
    const photo = msg.photo[msg.photo.length - 1];
    adminMediaStorage.set(chatId, {
      type: 'photo',
      file_id: photo.file_id,
      caption: msg.caption || ''
    });
  }
});

bot.on('video', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin and store media for broadcast
  if (userId.toString() === process.env.BOT_OWNER_ID) {
    adminMediaStorage.set(chatId, {
      type: 'video',
      file_id: msg.video.file_id,
      caption: msg.caption || ''
    });
  }
});

bot.on('audio', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin and store media for broadcast
  if (userId.toString() === process.env.BOT_OWNER_ID) {
    adminMediaStorage.set(chatId, {
      type: 'audio',
      file_id: msg.audio.file_id,
      caption: msg.caption || ''
    });
  }
});

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin and store media for broadcast
  if (userId.toString() === process.env.BOT_OWNER_ID) {
    adminMediaStorage.set(chatId, {
      type: 'document',
      file_id: msg.document.file_id,
      caption: msg.caption || ''
    });
  }
});

// Handle text messages for file name
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userSession = userSessions.get(chatId);
  
  // Handle feedback
  if (userSession && userSession.currentView === 'sending_feedback') {
    const feedbackChannel = botConfig.feedbackChannel;
    
    try {
      // Track feedback for analytics
      const userInfo = {
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
        username: msg.from.username,
        id: msg.from.id
      };
      analytics.trackUserActivity(msg.from.id, userInfo, 'feedback_sent', text);
      
      // Send feedback to the feedback channel with improved format
      const fullName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
      const username = msg.from.username ? `@${msg.from.username}` : 'No username';
      const userId = msg.from.id;
      
      await bot.sendMessage(feedbackChannel, `📢 Feedback from ${fullName} (${username})  Id : (${userId})\nMessage: ${text}`);
      
      // Reset user session
      userSessions.set(chatId, {
        currentView: 'universities',
        selectedUniversity: null,
        selectedSemester: null,
        selectedModule: null
      });
      
      bot.sendMessage(chatId, '✅ Thank you for your feedback! It has been sent to our feedback channel.');
      
    } catch (error) {
      console.error('Error sending feedback to channel:', error);
      
      // Fallback: try sending to bot owner
      try {
        const fullName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
        const username = msg.from.username ? `@${msg.from.username}` : 'No username';
        const userId = msg.from.id;
        
        await bot.sendMessage(botConfig.ownerId, `📢 Feedback from ${fullName} (${username})  Id : (${userId})\nMessage: ${text}`);
        bot.sendMessage(chatId, '✅ Thank you for your feedback! It has been sent to the bot owner.');
      } catch (fallbackError) {
        console.error('Error sending feedback to owner:', fallbackError);
        bot.sendMessage(chatId, '❌ Sorry, there was an error sending your feedback. Please try again later.');
      }
      
      // Reset user session
      userSessions.set(chatId, {
        currentView: 'universities',
        selectedUniversity: null,
        selectedSemester: null,
        selectedModule: null
      });
    }
    return;
  }
  
  // Handle file name input (existing code)
  if (userSession && userSession.currentView === 'sending_file' && userSession.fileData) {
    const fileName = text;
    
    // Send file to file sharing channel
    const fileSharingChannel = botConfig.fileSharingChannel;
    
    try {
      // Track file sharing for analytics
      const userInfo = {
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
        username: msg.from.username,
        id: msg.from.id
      };
      analytics.trackUserActivity(msg.from.id, userInfo, 'file_shared', fileName);
      
      // Send file to file sharing channel with improved format
      const fullName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
      const username = msg.from.username ? `@${msg.from.username}` : 'No username';
      const userId = msg.from.id;
      
      const caption = `📢 File from ${fullName} (${username})  Id : (${userId})\nFile: ${fileName}`;
      
      // Send different media types based on file type
      switch (userSession.fileData.type) {
        case 'photo':
          await bot.sendPhoto(fileSharingChannel, userSession.fileData.file_id, {
            caption: caption
          });
          break;
        case 'video':
          await bot.sendVideo(fileSharingChannel, userSession.fileData.file_id, {
            caption: caption
          });
          break;
        case 'audio':
          await bot.sendAudio(fileSharingChannel, userSession.fileData.file_id, {
            caption: caption
          });
          break;
        case 'voice':
          await bot.sendVoice(fileSharingChannel, userSession.fileData.file_id, {
            caption: caption
          });
          break;
        case 'document':
        default:
          await bot.sendDocument(fileSharingChannel, userSession.fileData.file_id, {
            caption: caption
          });
          break;
      }
      
      // Reset user session
      userSessions.set(chatId, {
        currentView: 'universities',
        selectedUniversity: null,
        selectedSemester: null,
        selectedModule: null
      });
      
      bot.sendMessage(chatId, '✅ Thank you! Your file has been sent to our file sharing channel.');
      
    } catch (error) {
      console.error('Error sending file to channel:', error);
      
      // Fallback: try sending to bot owner
      try {
        const fullName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
        const username = msg.from.username ? `@${msg.from.username}` : 'No username';
        const userId = msg.from.id;
        
        await bot.sendDocument(botConfig.ownerId, userSession.fileData.file_id, {
          caption: `📢 File from ${fullName} (${username})  Id : (${userId})\nFile: ${fileName}`
        });
        bot.sendMessage(chatId, '✅ Thank you! Your file has been sent to the bot owner.');
      } catch (fallbackError) {
        console.error('Error sending file to owner:', fallbackError);
        bot.sendMessage(chatId, '❌ Sorry, there was an error sending your file. Please try again later.');
      }
      
      // Reset user session
      userSessions.set(chatId, {
        currentView: 'universities',
        selectedUniversity: null,
        selectedSemester: null,
        selectedModule: null
      });
    }
  }
});

// Callback query handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const startTime = Date.now();
  
  // Security validation
  if (!security.validateUserInput(data, 'callback')) {
    security.logSecurityEvent('INVALID_CALLBACK_DATA', 'Invalid callback data detected', 'WARNING');
    await bot.answerCallbackQuery(query.id, { text: 'Invalid request' });
    return;
  }
  
  try {
    // Answer callback query to remove loading state
    try {
      await bot.answerCallbackQuery(query.id);
    } catch (callbackError) {
      // Ignore "query is too old" errors - this is normal for old callback queries
      if (callbackError.body && callbackError.body.error_code === 400 && 
          callbackError.body.description && callbackError.body.description.includes('query is too old')) {
        console.log('ℹ️ Ignoring old callback query - this is normal behavior');
      } else {
        console.error('Error answering callback query:', callbackError.message);
      }
    }
    
    let userSession = userSessions.get(chatId) || {
      currentView: 'universities',
      selectedUniversity: null,
      selectedSemester: null,
      selectedModule: null,
      selectedSpecialization: null
    };
    console.log(`Processing callback: ${data} for chat ${chatId}`);
    
    if (data.startsWith('university_')) {
      // University selection
      const universityKey = data.replace('university_', '');
      console.log(`Selected university: ${universityKey}`);
      
      if (!navigationStructure.universities[universityKey]) {
        throw new Error(`Invalid university key: ${universityKey}`);
      }
      
      userSession.selectedUniversity = universityKey;
      userSession.currentView = 'university_paths';
      userSessions.set(chatId, userSession);
      
      const universityName = navigationStructure.universities[universityKey].name;
      const message = formatMessage(botConfig.messages.universityPaths, { universityName });
      const keyboard = getUniversityPathsKeyboard(universityKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('tronc_commun_')) {
      // Tronc commun selection for a university
      const universityKey = data.replace('tronc_commun_', '');
      console.log(`Selected Tronc commun for university: ${universityKey}`);
      
      if (!navigationStructure.universities[universityKey]) {
        throw new Error(`Invalid university key: ${universityKey}`);
      }
      
      userSession.currentView = 'semesters';
      userSessions.set(chatId, userSession);
      
      const universityName = navigationStructure.universities[universityKey].name;
      const message = formatMessage(botConfig.messages.universitySemesters, { universityName });
      const keyboard = getSemesterKeyboard(universityKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('specializations_')) {
      // Specializations selection for a university
      const universityKey = data.replace('specializations_', '');
      console.log(`Selected Specializations for university: ${universityKey}`);
      
      if (!navigationStructure.universities[universityKey]) {
        throw new Error(`Invalid university key: ${universityKey}`);
      }
      
      const university = navigationStructure.universities[universityKey];
      
      if (university.hasSpecializations) {
        // University has specializations - show them
        userSession.currentView = 'specializations';
        userSessions.set(chatId, userSession);
        
        const message = formatMessage(botConfig.messages.specializations, {});
        const keyboard = getSpecializationKeyboard(universityKey);
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
      } else {
        // University doesn't have specializations - show under development message
        const message = botConfig.messages.underDevelopment;
        const keyboard = {
          inline_keyboard: [[
            {
              text: botConfig.buttons.backToUniversityPaths,
              callback_data: `back_to_university_paths_${universityKey}`
            }
          ]]
        };
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
      }
      
    } else if (data.startsWith('semester_')) {
      // Semester selection (Tronc commun)
      const parts = data.split('_');
      console.log(`Semester callback parts:`, parts);
      
      if (parts.length < 3) {
        console.log(`Invalid semester callback data: ${data}`);
        return;
      }
      
      // Format: semester_batna2_semester_1
      const universityKey = parts[1];
      const semesterKey = `${parts[2]}_${parts[3]}`; // semester_1
      
      console.log(`Selected semester - university: ${universityKey}, semester: ${semesterKey}`);
      
      if (!navigationStructure.universities[universityKey] || !navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey]) {
        console.log(`Invalid university or semester key: ${universityKey}, ${semesterKey}`);
        return;
      }
      
      userSession.selectedSemester = semesterKey;
      userSession.currentView = 'modules';
      userSessions.set(chatId, userSession);
      
      const semesterName = navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getModulesKeyboard(universityKey, semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('mod_')) {
      // Module selection (Tronc commun)
      const parts = data.split('_');
      console.log(`Module callback parts:`, parts);
      
      if (parts.length < 5) {
        console.log(`Invalid module callback data: ${data}`);
        return;
      }
      
      // Format: mod_batna2_semester_1_4 (mod_universityKey_semesterKey_index)
      const universityKey = parts[1];
      const semesterKey = `${parts[2]}_${parts[3]}`; // semester_1
      const moduleIndex = parseInt(parts[4]);
      
      console.log(`Parsed universityKey: ${universityKey}, semesterKey: ${semesterKey}, moduleIndex: ${moduleIndex}`);
      
      if (!navigationStructure.universities[universityKey] || !navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey]) {
        console.log(`Invalid university or semester key: ${universityKey}, ${semesterKey}`);
        return;
      }
      
      if (moduleIndex < 0 || moduleIndex >= navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey].modules.length) {
        console.log(`Invalid module index: ${moduleIndex} for semester ${semesterKey}`);
        return;
      }
      
      userSession.selectedModule = moduleIndex;
      userSession.currentView = 'resources';
      userSessions.set(chatId, userSession);
      
      const moduleName = navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey].modules[moduleIndex];
      const message = formatMessage(botConfig.messages.moduleResources, { moduleName });
      const keyboard = getResourceTypesKeyboard(universityKey, semesterKey, moduleIndex);
      
      // Track module view for analytics
      const userInfo = {
        first_name: query.from.first_name,
        last_name: query.from.last_name,
        username: query.from.username,
        id: query.from.id
      };
      analytics.trackModuleView(moduleName, universityKey, semesterKey, query.from.id, userInfo);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('specialization_')) {
      // Specialization selection for a university
      const parts = data.split('_');
      console.log(`Specialization callback parts:`, parts);
      
      if (parts.length < 3) {
        console.log(`Invalid specialization callback data: ${data}`);
        return;
      }
      
      // Format: specialization_batna2_cese
      const universityKey = parts[1];
      const specKey = parts[2];
      
      console.log(`Selected specialization - university: ${universityKey}, spec: ${specKey}`);
      
      if (!navigationStructure.universities[universityKey] || 
          !navigationStructure.universities[universityKey].specializations[specKey]) {
        throw new Error(`Invalid university or specialization key: ${universityKey}, ${specKey}`);
      }
      
      userSession.selectedSpecialization = specKey;
      userSession.currentView = 'spec_semesters';
      userSessions.set(chatId, userSession);
      
      const specializationName = navigationStructure.universities[universityKey].specializations[specKey].name;
      const message = formatMessage(botConfig.messages.specializationSemesters, { specializationName });
      const keyboard = getSpecializationSemesterKeyboard(universityKey, specKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('spec_semester_')) {
      // Specialization semester selection
      const parts = data.split('_');
      console.log(`Specialization semester callback parts:`, parts);
      
      if (parts.length < 5) {
        console.log(`Invalid specialization semester callback data: ${data}`);
        return;
      }
      
      // Format: spec_semester_batna2_cese_semester_5
      const universityKey = parts[2];
      const specKey = parts[3];
      const semesterKey = `${parts[4]}_${parts[5]}`; // semester_5
      
      console.log(`Selected specialization semester - university: ${universityKey}, spec: ${specKey}, semester: ${semesterKey}`);
      
      if (!navigationStructure.universities[universityKey] || 
          !navigationStructure.universities[universityKey].specializations[specKey] ||
          !navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey]) {
        console.log(`Invalid university, specialization or semester key: ${universityKey}, ${specKey}, ${semesterKey}`);
        return;
      }
      
      userSession.selectedSemester = semesterKey;
      userSession.currentView = 'spec_modules';
      userSessions.set(chatId, userSession);
      
      const semesterName = navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getSpecializationModulesKeyboard(universityKey, specKey, semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('spec_mod_')) {
      // Specialization module selection
      const parts = data.split('_');
      console.log(`Specialization module callback parts:`, parts);
      
      if (parts.length < 6) {
        console.log(`Invalid specialization module callback data: ${data}`);
        return;
      }
      
      // Format: spec_mod_batna2_cese_semester_5_4 (spec_mod_universityKey_specKey_semesterKey_index)
      const universityKey = parts[2];
      const specKey = parts[3];
      const semesterKey = `${parts[4]}_${parts[5]}`; // semester_5
      const moduleIndex = parseInt(parts[6]);
      
      console.log(`Parsed universityKey: ${universityKey}, specKey: ${specKey}, semesterKey: ${semesterKey}, moduleIndex: ${moduleIndex}`);
      
      if (!navigationStructure.universities[universityKey] || 
          !navigationStructure.universities[universityKey].specializations[specKey] ||
          !navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey]) {
        console.log(`Invalid university, specialization or semester key: ${universityKey}, ${specKey}, ${semesterKey}`);
        return;
      }
      
      if (moduleIndex < 0 || moduleIndex >= navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].modules.length) {
        console.log(`Invalid module index: ${moduleIndex} for semester ${semesterKey}`);
        return;
      }
      
      userSession.selectedModule = moduleIndex;
      userSession.currentView = 'spec_resources';
      userSessions.set(chatId, userSession);
      
      const moduleName = navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].modules[moduleIndex];
      const message = formatMessage(botConfig.messages.moduleResources, { moduleName });
      const keyboard = getSpecializationResourceTypesKeyboard(universityKey, specKey, semesterKey, moduleIndex);
      
      // Track module view for analytics
      const userInfo = {
        first_name: query.from.first_name,
        last_name: query.from.last_name,
        username: query.from.username,
        id: query.from.id
      };
      analytics.trackModuleView(moduleName, `${universityKey}_${specKey}`, semesterKey, query.from.id, userInfo);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('resource_')) {
      // Resource type selection
      const resourceType = data.replace('resource_', '');
      const universityKey = userSession.selectedUniversity;
      const semesterKey = userSession.selectedSemester;
      const moduleIndex = userSession.selectedModule;
      const specKey = userSession.selectedSpecialization;
      
      // Handle both regular and specialization paths
      let moduleName, files, keyboard, backCallbackData;
      
      if (specKey) {
        // Specialization path
        if (!universityKey || !specKey || !semesterKey || moduleIndex === null || moduleIndex === undefined) {
          console.log('No university, specialization, semester or module selected');
          return;
        }
        
        moduleName = navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].modules[moduleIndex];
        files = getFilesForResource(`${universityKey}_${specKey}`, semesterKey, moduleName, resourceType);
        backCallbackData = `spec_mod_${universityKey}_${specKey}_${semesterKey}_${moduleIndex}`;
        
      } else {
        // Regular university path (Tronc commun)
        if (!universityKey || !semesterKey || moduleIndex === null || moduleIndex === undefined) {
          console.log('No university, semester or module selected');
          return;
        }
        
        moduleName = navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey].modules[moduleIndex];
        files = getFilesForResource(universityKey, semesterKey, moduleName, resourceType);
        backCallbackData = `mod_${universityKey}_${semesterKey}_${moduleIndex}`;
      }
      
      const emoji = resourceEmojis[resourceType] || '📄';
      const resourceName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace('_', ' ');
      
      if (files && files.length > 0) {
        // Files are available - show file selection
        const message = formatMessage(botConfig.messages.filesAvailable, {
          emoji,
          resourceName,
          moduleName
        });
        
        if (specKey) {
          // Specialization file selection keyboard
          const buttons = files.map((file, index) => ({
            text: `${file.name}`,
            callback_data: `spec_file_${universityKey}_${specKey}_${semesterKey}_${moduleIndex}_${resourceType}_${index}`
          }));
          
          const backButton = {
            text: botConfig.buttons.backToResourceTypes,
            callback_data: backCallbackData
          };
          
          keyboard = createInlineKeyboard(buttons, backButton);
        } else {
          // Regular file selection keyboard
          keyboard = createFileSelectionKeyboard(files, universityKey, semesterKey, moduleIndex, resourceType);
        }
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
      } else {
        // No files available - show coming soon message
        const message = formatMessage(botConfig.messages.noFilesAvailable, {
          emoji,
          resourceName,
          moduleName
        });
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [[
              {
                text: botConfig.buttons.backToResourceTypes,
                callback_data: backCallbackData
              }
            ]]
          }
        });
      }
      
    } else if (data === 'back_to_universities') {
      // Back to universities
      userSession.currentView = 'universities';
      userSession.selectedUniversity = null;
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSession.selectedSpecialization = null;
      userSessions.set(chatId, userSession);
      
      const keyboard = getUniversityKeyboard();
      
      await bot.editMessageText(botConfig.messages.welcome, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_university_paths_')) {
      // Back to university paths
      const universityKey = data.replace('back_to_university_paths_', '');
      console.log(`Back to university paths for university: ${universityKey}`);
      
      if (!navigationStructure.universities[universityKey]) {
        console.log(`Invalid university key for back button: ${universityKey}`);
        return;
      }
      
      userSession.currentView = 'university_paths';
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSession.selectedSpecialization = null;
      userSessions.set(chatId, userSession);
      
      const universityName = navigationStructure.universities[universityKey].name;
      const message = formatMessage(botConfig.messages.universityPaths, { universityName });
      const keyboard = getUniversityPathsKeyboard(universityKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_semesters_')) {
      // Back to semesters
      const universityKey = data.replace('back_to_semesters_', '');
      console.log(`Back to semesters for university: ${universityKey}`);
      
      if (!universitiesData[universityKey]) {
        console.log(`Invalid university key for back button: ${universityKey}`);
        return;
      }
      
      userSession.currentView = 'semesters';
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const universityName = universitiesData[universityKey].name;
      const message = formatMessage(botConfig.messages.universitySemesters, { universityName });
      const keyboard = getSemesterKeyboard(universityKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_specializations_')) {
      // Back to specializations for a university
      const universityKey = data.replace('back_to_specializations_', '');
      console.log(`Back to specializations for university: ${universityKey}`);
      
      if (!navigationStructure.universities[universityKey]) {
        console.log(`Invalid university key for back button: ${universityKey}`);
        return;
      }
      
      userSession.currentView = 'specializations';
      userSession.selectedSpecialization = null;
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const message = formatMessage(botConfig.messages.specializations, {});
      const keyboard = getSpecializationKeyboard(universityKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_spec_semesters_')) {
      // Back to specialization semesters
      const parts = data.replace('back_to_spec_semesters_', '').split('_');
      const universityKey = parts[0];
      const specKey = parts[1];
      console.log(`Back to specialization semesters for university: ${universityKey}, spec: ${specKey}`);
      
      if (!navigationStructure.universities[universityKey] || 
          !navigationStructure.universities[universityKey].specializations[specKey]) {
        console.log(`Invalid university or specialization key for back button: ${universityKey}, ${specKey}`);
        return;
      }
      
      userSession.currentView = 'spec_semesters';
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const specializationName = navigationStructure.universities[universityKey].specializations[specKey].name;
      const message = formatMessage(botConfig.messages.specializationSemesters, { specializationName });
      const keyboard = getSpecializationSemesterKeyboard(universityKey, specKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_spec_modules_')) {
      // Back to specialization modules
      const parts = data.replace('back_to_spec_modules_', '').split('_');
      const universityKey = parts[0];
      const specKey = parts[1];
      const semesterKey = `${parts[2]}_${parts[3]}`; // semester_5
      console.log(`Back to specialization modules for university: ${universityKey}, spec: ${specKey}, semester: ${semesterKey}`);
      
      if (!navigationStructure.universities[universityKey] || 
          !navigationStructure.universities[universityKey].specializations[specKey] ||
          !navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey]) {
        console.log(`Invalid university, specialization or semester key for back button: ${universityKey}, ${specKey}, ${semesterKey}`);
        return;
      }
      
      userSession.currentView = 'spec_modules';
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const semesterName = navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getSpecializationModulesKeyboard(universityKey, specKey, semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_modules_')) {
      // Back to modules
      const parts = data.replace('back_to_modules_', '').split('_');
      const universityKey = parts[0];
      const semesterKey = `${parts[1]}_${parts[2]}`; // semester_1
      console.log(`Back to modules for university: ${universityKey}, semester: ${semesterKey}`);
      
      if (!universitiesData[universityKey] || !universitiesData[universityKey].semesters[semesterKey]) {
        console.log(`Invalid university or semester key for back button: ${universityKey}, ${semesterKey}`);
        return;
      }
      
      userSession.currentView = 'modules';
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const semesterName = universitiesData[universityKey].semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getModulesKeyboard(universityKey, semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('file_') || data.startsWith('spec_file_')) {
      // File selection - send the actual file
      const parts = data.split('_');
      let universityKey, semesterKey, moduleIndex, resourceType, fileIndex, moduleName, files, file;
      
      if (data.startsWith('spec_file_')) {
        // Specialization file
        if (parts.length < 8) {
          console.log(`Invalid specialization file callback data: ${data}`);
          return;
        }
        
        universityKey = parts[2];
        const specKey = parts[3];
        semesterKey = `${parts[4]}_${parts[5]}`; // semester_5
        moduleIndex = parseInt(parts[6]);
        resourceType = parts[7];
        fileIndex = parseInt(parts[8]);
        
        moduleName = navigationStructure.universities[universityKey].specializations[specKey].semesters[semesterKey].modules[moduleIndex];
        files = getFilesForResource(`${universityKey}_${specKey}`, semesterKey, moduleName, resourceType);
        
      } else {
        // Regular file (Tronc commun)
        if (parts.length < 7) {
          console.log(`Invalid file callback data: ${data}`);
          return;
        }
        
        universityKey = parts[1];
        semesterKey = `${parts[2]}_${parts[3]}`; // semester_1
        moduleIndex = parseInt(parts[4]);
        resourceType = parts[5];
        fileIndex = parseInt(parts[6]);
        
        moduleName = navigationStructure.universities[universityKey].troncCommun.semesters[semesterKey].modules[moduleIndex];
        files = getFilesForResource(universityKey, semesterKey, moduleName, resourceType);
      }
      
      if (!files || !files[fileIndex]) {
        console.log(`File not found: ${data}`);
        return;
      }
      
      file = files[fileIndex];
      
      try {
        // Security validation for file download
        if (!security.validateUserInput(file.name, 'filename')) {
          security.logSecurityEvent('INVALID_FILENAME', 'Invalid filename detected', 'WARNING');
          return;
        }
        
        // Track file download for analytics
        const userInfo = {
          first_name: query.from.first_name,
          last_name: query.from.last_name,
          username: query.from.username,
          id: query.from.id
        };
        analytics.trackFileDownload(file.path, query.from.id, userInfo);
        
        // Security monitoring of file caption
        const fileCaption = `${file.name}\n\n${file.description || 'No description available'}`;
        if (!security.monitorBotResponse(fileCaption)) {
          security.logSecurityEvent('SUSPICIOUS_FILE_CAPTION', 'Suspicious content in file caption', 'WARNING');
          return;
        }
        
        // Send the file
        await bot.sendDocument(chatId, file.path, {
          caption: fileCaption
        });
        
        // Security monitoring of success message
        const successMessage = `✅ File "${file.name}" sent successfully!`;
        if (!security.monitorBotResponse(successMessage)) {
          security.logSecurityEvent('SUSPICIOUS_SUCCESS_MESSAGE', 'Suspicious content in success message', 'WARNING');
          return;
        }
        
        // Send a success message
        await bot.sendMessage(chatId, successMessage);
        
      } catch (error) {
        console.error('Error sending file:', error);
        
        // Check if it's a file not found error
        if (error.message && error.message.includes('ENOENT')) {
          await bot.sendMessage(chatId, `❌ File "${file.name}" not found. Please contact the bot administrator.`);
        } else {
          await bot.sendMessage(chatId, `❌ Error sending file "${file.name}". Please try again later.`);
        }
      }
      
    } else {
      console.log(`Unknown callback data: ${data}`);
      await bot.sendMessage(chatId, '❌ Unknown command. Please try again.');
    }
    
      } catch (error) {
      console.error('Error handling callback query:', error);
      console.error('Callback data:', data);
      
      // Track performance and error
      const responseTime = Date.now() - startTime;
      analytics.trackPerformance('callback_query', responseTime, false, error);
      
      // Only send error message for actual critical errors, not for navigation issues
      const isNavigationError = error.message && (
        error.message.includes('Invalid') || 
        error.message.includes('No university') ||
        error.message.includes('No semester') ||
        error.message.includes('No module') ||
        error.message.includes('File not found') ||
        error.message.includes('Invalid university key') ||
        error.message.includes('Invalid semester key') ||
        error.message.includes('Invalid module index') ||
        error.message.includes('Cannot read properties') ||
        error.message.includes('undefined') ||
        error.message.includes('null') ||
        error.message.includes('query is too old') ||
        error.message.includes('Bad Request')
      );
      
      if (!isNavigationError) {
        try {
          await bot.sendMessage(chatId, botConfig.messages.error);
        } catch (sendError) {
          console.error('Failed to send error message:', sendError.message);
        }
      } else {
        console.log('ℹ️ Navigation error handled gracefully - no user notification needed');
      }
    } finally {
      // Track successful performance
      const responseTime = Date.now() - startTime;
      analytics.trackPerformance('callback_query', responseTime, true);
    }
});

// ========================================
// BROADCAST COMMANDS
// ========================================

// Command handler for /broadcast (admin only)
bot.onText(/\/broadcast/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (userId.toString() !== process.env.BOT_OWNER_ID) {
    bot.sendMessage(chatId, '🚫 Access denied. Only administrators can use broadcast commands.');
    return;
  }
  
  const message = msg.text.replace('/broadcast', '').trim();
  if (!message) {
    const helpMessage = `📢 **Broadcast System Help**

**Commands:**
• /broadcast [message] - Send to all users
• /broadcast_subscribers [message] - Send to subscribers only
• /broadcast_active [message] - Send to active users only
• /broadcast_stats - Show broadcast statistics
• /broadcast_history - Show recent broadcasts
• /subscribe - Subscribe to broadcasts
• /unsubscribe - Unsubscribe from broadcasts

**Media Support:**
• Send photos, videos, audio, or documents with your broadcast
• First send the media, then use the broadcast command
• The media will be included with your text message
• Example: Send a photo, then type "/broadcast Check out this new resource!"

**Examples:**
• /broadcast 🎉 New files added! Check out the latest resources.
• /broadcast_subscribers 📚 Important update for subscribers only
• /broadcast_active 🔔 Reminder for active users

**Target Types:**
• All users: Everyone who has used the bot
• Subscribers: Users who subscribed to broadcasts
• Active users: Users active in the last 7 days`;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    return;
  }
  
  try {
    // Check if there's stored media for this admin
    const storedMedia = adminMediaStorage.get(chatId);
    
    const result = await broadcast.sendBroadcast(message, {
      adminId: userId,
      targetType: 'all',
      priority: 'normal',
      media: storedMedia
    });
    
    // Clear stored media after broadcast
    if (storedMedia) {
      adminMediaStorage.delete(chatId);
    }
    
    if (result.success) {
      const response = `✅ **Broadcast sent successfully!**

📊 **Statistics:**
• Target users: ${result.targetCount}
• Sent: ${result.sentCount}
• Failed: ${result.failedCount}
• Blocked: ${result.blockedCount}
• Broadcast ID: #${result.broadcastId}`;
      
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, `❌ Broadcast failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Broadcast error:', error);
    try {
      await bot.sendMessage(chatId, '❌ An error occurred while sending the broadcast.');
    } catch (sendError) {
      console.error('Failed to send broadcast error message:', sendError.message);
    }
  }
});

// Command handler for /broadcast_subscribers (admin only)
bot.onText(/\/broadcast_subscribers/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (userId.toString() !== process.env.BOT_OWNER_ID) {
    await bot.sendMessage(chatId, '🚫 Access denied. Only administrators can use broadcast commands.');
    return;
  }
  
  const message = msg.text.replace('/broadcast_subscribers', '').trim();
  if (!message) {
    await bot.sendMessage(chatId, '❌ Please provide a message to broadcast to subscribers.');
    return;
  }
  
  try {
    // Check if there's stored media for this admin
    const storedMedia = adminMediaStorage.get(chatId);
    
    const result = await broadcast.sendBroadcast(message, {
      adminId: userId,
      targetType: 'subscribers',
      priority: 'normal',
      media: storedMedia
    });
    
    // Clear stored media after broadcast
    if (storedMedia) {
      adminMediaStorage.delete(chatId);
    }
    
    if (result.success) {
      const response = `✅ **Broadcast to subscribers sent successfully!**

📊 **Statistics:**
• Target subscribers: ${result.targetCount}
• Sent: ${result.sentCount}
• Failed: ${result.failedCount}
• Blocked: ${result.blockedCount}
• Broadcast ID: #${result.broadcastId}`;
      
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, `❌ Broadcast failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Broadcast error:', error);
    try {
      await bot.sendMessage(chatId, '❌ An error occurred while sending the broadcast.');
    } catch (sendError) {
      console.error('Failed to send broadcast error message:', sendError.message);
    }
  }
});

// Command handler for /broadcast_active (admin only)
bot.onText(/\/broadcast_active/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (userId.toString() !== process.env.BOT_OWNER_ID) {
    await bot.sendMessage(chatId, '🚫 Access denied. Only administrators can use broadcast commands.');
    return;
  }
  
  const message = msg.text.replace('/broadcast_active', '').trim();
  if (!message) {
    await bot.sendMessage(chatId, '❌ Please provide a message to broadcast to active users.');
    return;
  }
  
  try {
    // Check if there's stored media for this admin
    const storedMedia = adminMediaStorage.get(chatId);
    
    const result = await broadcast.sendBroadcast(message, {
      adminId: userId,
      targetType: 'active',
      priority: 'normal',
      media: storedMedia
    });
    
    // Clear stored media after broadcast
    if (storedMedia) {
      adminMediaStorage.delete(chatId);
    }
    
    if (result.success) {
      const response = `✅ **Broadcast to active users sent successfully!**

📊 **Statistics:**
• Target active users: ${result.targetCount}
• Sent: ${result.sentCount}
• Failed: ${result.failedCount}
• Blocked: ${result.blockedCount}
• Broadcast ID: #${result.broadcastId}`;
      
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, `❌ Broadcast failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Broadcast error:', error);
    try {
      await bot.sendMessage(chatId, '❌ An error occurred while sending the broadcast.');
    } catch (sendError) {
      console.error('Failed to send broadcast error message:', sendError.message);
    }
  }
});

// Command handler for /broadcast_stats (admin only)
bot.onText(/\/broadcast_stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (userId.toString() !== process.env.BOT_OWNER_ID) {
    bot.sendMessage(chatId, '🚫 Access denied. Only administrators can view broadcast statistics.');
    return;
  }
  
  try {
    const stats = broadcast.getBroadcastStats();
    const recentBroadcasts = broadcast.getBroadcastHistory(5);
    
    let statsMessage = `📊 **Broadcast Statistics**

👥 **Users:**
• Total users: ${stats.totalUsers}
• Subscribers: ${stats.subscribers}
• Active users (7 days): ${stats.activeUsers}

📢 **Broadcasts:**
• Total broadcasts: ${stats.broadcastHistory}

⚡ **Rate Limit:**
• Messages sent this minute: ${stats.rateLimit.messagesSent}/${stats.rateLimit.maxPerMinute}
• Max per hour: ${stats.rateLimit.maxPerHour}`;
    
    if (recentBroadcasts.length > 0) {
      statsMessage += `\n\n📋 **Recent Broadcasts:**`;
      recentBroadcasts.forEach(bc => {
        const date = new Date(bc.timestamp).toLocaleDateString();
        statsMessage += `\n• #${bc.id} (${date}): ${bc.sentCount}/${bc.targetCount} sent`;
      });
    }
    
    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Broadcast stats error:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching broadcast statistics.');
  }
});

// Command handler for /broadcast_history (admin only)
bot.onText(/\/broadcast_history/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Check if user is admin
  if (userId.toString() !== process.env.BOT_OWNER_ID) {
    bot.sendMessage(chatId, '🚫 Access denied. Only administrators can view broadcast history.');
    return;
  }
  
  try {
    const broadcasts = broadcast.getBroadcastHistory(10);
    
    if (broadcasts.length === 0) {
      bot.sendMessage(chatId, '📋 No broadcast history found.');
      return;
    }
    
    let historyMessage = `📋 **Broadcast History (Last 10)**

`;
    
    broadcasts.forEach(bc => {
      const date = new Date(bc.timestamp).toLocaleString();
      const status = bc.status === 'completed' ? '✅' : '⏳';
      historyMessage += `${status} **#${bc.id}** (${date})
• Target: ${bc.targetType} (${bc.targetCount} users)
• Sent: ${bc.sentCount} | Failed: ${bc.failedCount} | Blocked: ${bc.blockedCount}
• Priority: ${bc.priority}
• Message: ${bc.message.substring(0, 50)}${bc.message.length > 50 ? '...' : ''}

`;
    });
    
    bot.sendMessage(chatId, historyMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Broadcast history error:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching broadcast history.');
  }
});

// Command handler for /subscribe (user command)
bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Register user if not already registered
  const userInfo = {
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    username: msg.from.username,
    id: msg.from.id
  };
  broadcast.registerUser(userId, userInfo);
  
  const success = broadcast.subscribeUser(userId);
  
  if (success) {
    bot.sendMessage(chatId, `✅ **Successfully subscribed to broadcasts!**

📢 You will now receive important announcements and updates from the bot.

To unsubscribe, use /unsubscribe`);
  } else {
    bot.sendMessage(chatId, 'ℹ️ You are already subscribed to broadcasts.');
  }
});

// Command handler for /unsubscribe (user command)
bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const success = broadcast.unsubscribeUser(userId);
  
  if (success) {
    bot.sendMessage(chatId, `✅ **Successfully unsubscribed from broadcasts.**

📢 You will no longer receive broadcast messages.

To subscribe again, use /subscribe`);
  } else {
    bot.sendMessage(chatId, 'ℹ️ You are not subscribed to broadcasts.');
  }
});

// Error handling
bot.on('error', (error) => {
  security.logSecurityEvent('BOT_ERROR', error.message, 'ERROR');
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  security.logSecurityEvent('POLLING_ERROR', error.message, 'ERROR');
  console.error('Polling error:', error);
  
  // If it's a 409 conflict, try to clear webhook and restart polling
  if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 409) {
    security.logSecurityEvent('WEBHOOK_CONFLICT', '409 Conflict detected, clearing webhook', 'WARNING');
    console.log('🔄 409 Conflict detected. Clearing webhook and restarting...');
    
    bot.setWebHook('').then(() => {
      console.log('✅ Webhook cleared, polling should resume');
      security.logSecurityEvent('WEBHOOK_CLEARED', 'Webhook cleared successfully');
    }).catch((webhookError) => {
      console.log('ℹ️ Webhook already cleared');
      security.logSecurityEvent('WEBHOOK_ALREADY_CLEARED', 'Webhook was already cleared');
    });
  }
});

// Start the bot
console.log('🤖 Engineering Bot is running...');
console.log('📝 Use /ing to start the bot');
console.log('❓ Use /help for help');
console.log('✅ Bot is ready and listening for messages');

// Add a simple health check for Render
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
});

// Only start the server if we're in a production environment (like Render)
if (process.env.NODE_ENV === 'production' || process.env.RENDER_EXTERNAL_URL) {
  server.listen(process.env.PORT || 3000, () => {
    console.log(`🌐 Health check server running on port ${process.env.PORT || 3000}`);
  });
} else {
  console.log('🚫 Local server startup disabled - bot will only run in production');
}

// Keep-alive system to prevent Render from sleeping
function startKeepAlive() {
  // Only run keep-alive in production
  if (!process.env.RENDER_EXTERNAL_URL) {
    console.log('🚫 Keep-alive disabled - not running in production');
    return;
  }
  
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
  
  function pingServer() {
    const isHttps = url.startsWith('https://');
    const httpModule = isHttps ? require('https') : require('http');
    
    console.log(`🔄 Keep-alive ping: ${url}`);
    
    const req = httpModule.get(url, (res) => {
      console.log(`✅ Keep-alive successful: ${res.statusCode}`);
    });
    
    req.on('error', (error) => {
      console.log(`⚠️ Keep-alive failed: ${error.message}`);
      // Fallback: just log that we're alive
      console.log('💓 Bot is still alive and running');
    });
    
    req.setTimeout(10000, () => {
      console.log('⚠️ Keep-alive timeout');
      req.destroy();
    });
  }
  
  // Alternative keep-alive: just log periodically
  function logAlive() {
    console.log('💓 Bot is alive and running');
  }
  
  // Ping every 14 minutes (Render free tier sleeps after 15 minutes)
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  
  // Start first ping immediately
  pingServer();
  
  // Set up recurring pings
  setInterval(pingServer, PING_INTERVAL);
  
  // Fallback: log alive every 5 minutes as backup
  setInterval(logAlive, 5 * 60 * 1000);
  
  console.log('🚀 Keep-alive system started');
  console.log(`⏰ Will ping every ${PING_INTERVAL / 60000} minutes`);
}

// Start keep-alive system
startKeepAlive();

// Export for potential use in other files
module.exports = {
  bot,
  universitiesData,
  resourceTypes,
  userSessions
};
