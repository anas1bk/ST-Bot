#!/usr/bin/env node

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { navigationStructure, universitiesData, resourceTypes, resourceEmojis, botConfig } = require('./config');
const { loadFileMapping, generateAutomaticFileMapping } = require('./auto_file_detector');
const Analytics = require('./analytics');
const SecurityManager = require('./security');

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

// Initialize security and analytics
const security = new SecurityManager();
const analytics = new Analytics(botConfig);

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

// Helper function to get main menu keyboard
function getMainMenuKeyboard() {
  const buttons = [
    {
      text: navigationStructure.tronc_commun.displayName,
      callback_data: 'path_tronc_commun'
    },
    {
      text: navigationStructure.specialite.displayName,
      callback_data: 'path_specialite'
    }
  ];
  
  return createInlineKeyboard(buttons);
}

// Helper function to get university selection keyboard
function getUniversityKeyboard() {
  const buttons = Object.keys(universitiesData).map(universityKey => ({
    text: universitiesData[universityKey].displayName,
    callback_data: `university_${universityKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToMainMenu,
    callback_data: 'back_to_main_menu'
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get semester selection keyboard for a university
function getSemesterKeyboard(universityKey) {
  const semesters = universitiesData[universityKey].semesters;
  const buttons = Object.keys(semesters).map(semesterKey => ({
    text: semesters[semesterKey].name,
    callback_data: `semester_${universityKey}_${semesterKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToUniversities,
    callback_data: 'back_to_universities'
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get modules keyboard for a semester
function getModulesKeyboard(universityKey, semesterKey) {
  const modules = universitiesData[universityKey].semesters[semesterKey].modules;
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

// Helper function to get specialization selection keyboard
function getSpecializationKeyboard() {
  const specializations = navigationStructure.specialite.specializations;
  const buttons = Object.keys(specializations).map(specKey => ({
    text: specializations[specKey].displayName,
    callback_data: `specialization_${specKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToMainMenu,
    callback_data: 'back_to_main_menu'
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get semester selection keyboard for a specialization
function getSpecializationSemesterKeyboard(specKey) {
  const semesters = navigationStructure.specialite.specializations[specKey].semesters;
  const buttons = Object.keys(semesters).map(semesterKey => ({
    text: semesters[semesterKey].name,
    callback_data: `spec_semester_${specKey}_${semesterKey}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToSpecializations,
    callback_data: 'back_to_specializations'
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get modules keyboard for a specialization semester
function getSpecializationModulesKeyboard(specKey, semesterKey) {
  const modules = navigationStructure.specialite.specializations[specKey].semesters[semesterKey].modules;
  const buttons = modules.map((module, index) => ({
    text: module,
    callback_data: `spec_mod_${specKey}_${semesterKey}_${index}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToSemesters,
    callback_data: `back_to_spec_semesters_${specKey}`
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
function getSpecializationResourceTypesKeyboard(specKey, semesterKey, moduleIndex) {
  const backButton = {
    text: botConfig.buttons.backToModules,
    callback_data: `back_to_spec_modules_${specKey}_${semesterKey}`
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

// Command handler for /ing
bot.onText(/\/ing/, (msg) => {
  const chatId = msg.chat.id;
  
  // Store user session
  userSessions.set(chatId, {
    currentView: 'main_menu',
    selectedPath: null,
    selectedUniversity: null,
    selectedSemester: null,
    selectedModule: null,
    selectedSpecialization: null
  });
  
  const keyboard = getMainMenuKeyboard();
  
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
  
  // Track user activity for analytics
  const userInfo = {
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    username: msg.from.username,
    id: msg.from.id
  };
  analytics.trackUserActivity(msg.from.id, userInfo, 'command_start');
  
  const welcomeMessage = `🎓 مرحباً بك في بوت الهندسة!

مرحباً ${msg.from.first_name}! 👋

هذا البوت يساعدك في الوصول إلى الموارد التعليمية للهندسة.

استخدم الأوامر التالية:
• /ing - القائمة الرئيسية للموارد
• /about - معلومات عن البوت
• /send - إرسال ملفات للمطور
• /help - المساعدة

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
  bot.sendMessage(chatId, botConfig.messages.help);
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


   🔷️ إرسال ملفات للمشاركة (/send) 📤 : 

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
  
  bot.sendMessage(chatId, 'Please insert the files:');
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

// Handle file messages
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);
  
  if (userSession && userSession.currentView === 'sending_file') {
    // Store file data
    userSession.fileData = {
      file_id: msg.document.file_id,
      file_name: msg.document.file_name,
      file_size: msg.document.file_size,
      mime_type: msg.document.mime_type
    };
    userSessions.set(chatId, userSession);
    
    bot.sendMessage(chatId, 'Please enter the name of the file:');
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
      
      await bot.sendDocument(fileSharingChannel, userSession.fileData.file_id, {
        caption: `📢 File from ${fullName} (${username})  Id : (${userId})\nFile: ${fileName}`
      });
      
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
    await bot.answerCallbackQuery(query.id);
    
    let userSession = userSessions.get(chatId) || {
      currentView: 'main_menu',
      selectedPath: null,
      selectedUniversity: null,
      selectedSemester: null,
      selectedModule: null,
      selectedSpecialization: null
    };
    console.log(`Processing callback: ${data} for chat ${chatId}`);
    
    if (data.startsWith('path_')) {
      // Path selection (Tronc commun or Spécialité)
      const pathKey = data.replace('path_', '');
      console.log(`Selected path: ${pathKey}`);
      
      if (pathKey === 'tronc_commun') {
        // Tronc commun path - show universities
        userSession.selectedPath = 'tronc_commun';
        userSession.currentView = 'universities';
        userSessions.set(chatId, userSession);
        
        const keyboard = getUniversityKeyboard();
        
        await bot.editMessageText(botConfig.messages.troncCommun, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
        
      } else if (pathKey === 'specialite') {
        // Spécialité path - show specializations
        userSession.selectedPath = 'specialite';
        userSession.currentView = 'specializations';
        userSessions.set(chatId, userSession);
        
        const keyboard = getSpecializationKeyboard();
        
        await bot.editMessageText(botConfig.messages.specialite, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: keyboard
        });
      }
      
    } else if (data.startsWith('university_')) {
      // University selection
      const universityKey = data.replace('university_', '');
      console.log(`Selected university: ${universityKey}`);
      
      if (!universitiesData[universityKey]) {
        throw new Error(`Invalid university key: ${universityKey}`);
      }
      
      userSession.selectedUniversity = universityKey;
      userSession.currentView = 'semesters';
      userSessions.set(chatId, userSession);
      
      const universityName = universitiesData[universityKey].name;
      const message = formatMessage(botConfig.messages.universitySemesters, { universityName });
      const keyboard = getSemesterKeyboard(universityKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('semester_')) {
      // Semester selection
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
      
      if (!universitiesData[universityKey] || !universitiesData[universityKey].semesters[semesterKey]) {
        console.log(`Invalid university or semester key: ${universityKey}, ${semesterKey}`);
        return;
      }
      
      userSession.selectedSemester = semesterKey;
      userSession.currentView = 'modules';
      userSessions.set(chatId, userSession);
      
      const semesterName = universitiesData[universityKey].semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getModulesKeyboard(universityKey, semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('mod_')) {
      // Module selection
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
      
      if (!universitiesData[universityKey] || !universitiesData[universityKey].semesters[semesterKey]) {
        console.log(`Invalid university or semester key: ${universityKey}, ${semesterKey}`);
        return;
      }
      
      if (moduleIndex < 0 || moduleIndex >= universitiesData[universityKey].semesters[semesterKey].modules.length) {
        console.log(`Invalid module index: ${moduleIndex} for semester ${semesterKey}`);
        return;
      }
      
      userSession.selectedModule = moduleIndex;
      userSession.currentView = 'resources';
      userSessions.set(chatId, userSession);
      
      const moduleName = universitiesData[universityKey].semesters[semesterKey].modules[moduleIndex];
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
      // Specialization selection
      const specKey = data.replace('specialization_', '');
      console.log(`Selected specialization: ${specKey}`);
      
      if (!navigationStructure.specialite.specializations[specKey]) {
        throw new Error(`Invalid specialization key: ${specKey}`);
      }
      
      userSession.selectedSpecialization = specKey;
      userSession.currentView = 'spec_semesters';
      userSessions.set(chatId, userSession);
      
      const specializationName = navigationStructure.specialite.specializations[specKey].name;
      const message = formatMessage(botConfig.messages.specializationSemesters, { specializationName });
      const keyboard = getSpecializationSemesterKeyboard(specKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('spec_semester_')) {
      // Specialization semester selection
      const parts = data.split('_');
      console.log(`Specialization semester callback parts:`, parts);
      
      if (parts.length < 4) {
        console.log(`Invalid specialization semester callback data: ${data}`);
        return;
      }
      
      // Format: spec_semester_cese_semester_5
      const specKey = parts[2];
      const semesterKey = `${parts[3]}_${parts[4]}`; // semester_5
      
      console.log(`Selected specialization semester - spec: ${specKey}, semester: ${semesterKey}`);
      
      if (!navigationStructure.specialite.specializations[specKey] || 
          !navigationStructure.specialite.specializations[specKey].semesters[semesterKey]) {
        console.log(`Invalid specialization or semester key: ${specKey}, ${semesterKey}`);
        return;
      }
      
      userSession.selectedSemester = semesterKey;
      userSession.currentView = 'spec_modules';
      userSessions.set(chatId, userSession);
      
      const semesterName = navigationStructure.specialite.specializations[specKey].semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getSpecializationModulesKeyboard(specKey, semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('spec_mod_')) {
      // Specialization module selection
      const parts = data.split('_');
      console.log(`Specialization module callback parts:`, parts);
      
      if (parts.length < 5) {
        console.log(`Invalid specialization module callback data: ${data}`);
        return;
      }
      
      // Format: spec_mod_cese_semester_5_4 (spec_mod_specKey_semesterKey_index)
      const specKey = parts[2];
      const semesterKey = `${parts[3]}_${parts[4]}`; // semester_5
      const moduleIndex = parseInt(parts[5]);
      
      console.log(`Parsed specKey: ${specKey}, semesterKey: ${semesterKey}, moduleIndex: ${moduleIndex}`);
      
      if (!navigationStructure.specialite.specializations[specKey] || 
          !navigationStructure.specialite.specializations[specKey].semesters[semesterKey]) {
        console.log(`Invalid specialization or semester key: ${specKey}, ${semesterKey}`);
        return;
      }
      
      if (moduleIndex < 0 || moduleIndex >= navigationStructure.specialite.specializations[specKey].semesters[semesterKey].modules.length) {
        console.log(`Invalid module index: ${moduleIndex} for semester ${semesterKey}`);
        return;
      }
      
      userSession.selectedModule = moduleIndex;
      userSession.currentView = 'spec_resources';
      userSessions.set(chatId, userSession);
      
      const moduleName = navigationStructure.specialite.specializations[specKey].semesters[semesterKey].modules[moduleIndex];
      const message = formatMessage(botConfig.messages.moduleResources, { moduleName });
      const keyboard = getSpecializationResourceTypesKeyboard(specKey, semesterKey, moduleIndex);
      
      // Track module view for analytics
      const userInfo = {
        first_name: query.from.first_name,
        last_name: query.from.last_name,
        username: query.from.username,
        id: query.from.id
      };
      analytics.trackModuleView(moduleName, specKey, semesterKey, query.from.id, userInfo);
      
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
        if (!specKey || !semesterKey || moduleIndex === null || moduleIndex === undefined) {
          console.log('No specialization, semester or module selected');
          return;
        }
        
        moduleName = navigationStructure.specialite.specializations[specKey].semesters[semesterKey].modules[moduleIndex];
        files = getFilesForResource(specKey, semesterKey, moduleName, resourceType);
        backCallbackData = `spec_mod_${specKey}_${semesterKey}_${moduleIndex}`;
        
      } else {
        // Regular university path
        if (!universityKey || !semesterKey || moduleIndex === null || moduleIndex === undefined) {
          console.log('No university, semester or module selected');
          return;
        }
        
        moduleName = universitiesData[universityKey].semesters[semesterKey].modules[moduleIndex];
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
            callback_data: `spec_file_${specKey}_${semesterKey}_${moduleIndex}_${resourceType}_${index}`
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
      
    } else if (data === 'back_to_main_menu') {
      // Back to main menu
      userSession.currentView = 'main_menu';
      userSession.selectedPath = null;
      userSession.selectedUniversity = null;
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSession.selectedSpecialization = null;
      userSessions.set(chatId, userSession);
      
      const keyboard = getMainMenuKeyboard();
      
      await bot.editMessageText(botConfig.messages.welcome, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data === 'back_to_universities') {
      // Back to universities
      userSession.currentView = 'universities';
      userSession.selectedUniversity = null;
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const keyboard = getUniversityKeyboard();
      
      await bot.editMessageText(botConfig.messages.troncCommun, {
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
      
    } else if (data === 'back_to_specializations') {
      // Back to specializations
      userSession.currentView = 'specializations';
      userSession.selectedSpecialization = null;
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const keyboard = getSpecializationKeyboard();
      
      await bot.editMessageText(botConfig.messages.specialite, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_spec_semesters_')) {
      // Back to specialization semesters
      const specKey = data.replace('back_to_spec_semesters_', '');
      console.log(`Back to specialization semesters for spec: ${specKey}`);
      
      if (!navigationStructure.specialite.specializations[specKey]) {
        console.log(`Invalid specialization key for back button: ${specKey}`);
        return;
      }
      
      userSession.currentView = 'spec_semesters';
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const specializationName = navigationStructure.specialite.specializations[specKey].name;
      const message = formatMessage(botConfig.messages.specializationSemesters, { specializationName });
      const keyboard = getSpecializationSemesterKeyboard(specKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_spec_modules_')) {
      // Back to specialization modules
      const parts = data.replace('back_to_spec_modules_', '').split('_');
      const specKey = parts[0];
      const semesterKey = `${parts[1]}_${parts[2]}`; // semester_5
      console.log(`Back to specialization modules for spec: ${specKey}, semester: ${semesterKey}`);
      
      if (!navigationStructure.specialite.specializations[specKey] || 
          !navigationStructure.specialite.specializations[specKey].semesters[semesterKey]) {
        console.log(`Invalid specialization or semester key for back button: ${specKey}, ${semesterKey}`);
        return;
      }
      
      userSession.currentView = 'spec_modules';
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const semesterName = navigationStructure.specialite.specializations[specKey].semesters[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getSpecializationModulesKeyboard(specKey, semesterKey);
      
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
        if (parts.length < 7) {
          console.log(`Invalid specialization file callback data: ${data}`);
          return;
        }
        
        const specKey = parts[2];
        semesterKey = `${parts[3]}_${parts[4]}`; // semester_5
        moduleIndex = parseInt(parts[5]);
        resourceType = parts[6];
        fileIndex = parseInt(parts[7]);
        
        moduleName = navigationStructure.specialite.specializations[specKey].semesters[semesterKey].modules[moduleIndex];
        files = getFilesForResource(specKey, semesterKey, moduleName, resourceType);
        
      } else {
        // Regular file
        if (parts.length < 7) {
          console.log(`Invalid file callback data: ${data}`);
          return;
        }
        
        universityKey = parts[1];
        semesterKey = `${parts[2]}_${parts[3]}`; // semester_1
        moduleIndex = parseInt(parts[4]);
        resourceType = parts[5];
        fileIndex = parseInt(parts[6]);
        
        moduleName = universitiesData[universityKey].semesters[semesterKey].modules[moduleIndex];
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
      console.error('User session:', userSession);
      
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
        error.message.includes('null')
      );
      
      if (!isNavigationError) {
        await bot.sendMessage(chatId, botConfig.messages.error);
      } else {
        console.log('ℹ️ Navigation error handled gracefully - no user notification needed');
      }
    } finally {
      // Track successful performance
      const responseTime = Date.now() - startTime;
      analytics.trackPerformance('callback_query', responseTime, true);
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
