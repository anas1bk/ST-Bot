const TelegramBot = require('node-telegram-bot-api');
const { semesterData, resourceTypes, resourceEmojis, botConfig } = require('./config');

// Initialize bot with token from config
const bot = new TelegramBot(botConfig.token, { polling: true });

// User session storage
const userSessions = new Map();

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

// Helper function to get semester selection keyboard
function getSemesterKeyboard() {
  const buttons = Object.keys(semesterData).map(semesterKey => ({
    text: semesterData[semesterKey].name,
    callback_data: `semester_${semesterKey}`
  }));
  
  return createInlineKeyboard(buttons);
}

// Helper function to get modules keyboard for a semester
function getModulesKeyboard(semesterKey) {
  const modules = semesterData[semesterKey].modules;
  const buttons = modules.map((module, index) => ({
    text: module,
    callback_data: `mod_${semesterKey}_${index}`
  }));
  
  const backButton = {
    text: botConfig.buttons.backToSemesters,
    callback_data: 'back_to_semesters'
  };
  
  return createInlineKeyboard(buttons, backButton);
}

// Helper function to get resource types keyboard
function getResourceTypesKeyboard(semesterKey, moduleIndex) {
  const backButton = {
    text: botConfig.buttons.backToModules,
    callback_data: `back_to_modules_${semesterKey}`
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

// Command handler for /ing
bot.onText(/\/ing/, (msg) => {
  const chatId = msg.chat.id;
  
  // Store user session
  userSessions.set(chatId, {
    currentView: 'semesters',
    selectedSemester: null,
    selectedModule: null
  });
  
  const keyboard = getSemesterKeyboard();
  
  bot.sendMessage(chatId, botConfig.messages.welcome, {
    reply_markup: keyboard
  });
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

// Callback query handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  // Answer callback query to remove loading state
  await bot.answerCallbackQuery(query.id);
  
  let userSession = userSessions.get(chatId) || {
    currentView: 'semesters',
    selectedSemester: null,
    selectedModule: null
  };
  
  try {
    console.log(`Processing callback: ${data} for chat ${chatId}`);
    
    if (data.startsWith('semester_')) {
      // Semester selection
      const semesterKey = data.replace('semester_', '');
      console.log(`Selected semester: ${semesterKey}`);
      
      if (!semesterData[semesterKey]) {
        throw new Error(`Invalid semester key: ${semesterKey}`);
      }
      
      userSession.selectedSemester = semesterKey;
      userSession.currentView = 'modules';
      userSessions.set(chatId, userSession);
      
      const semesterName = semesterData[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getModulesKeyboard(semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('mod_')) {
      // Module selection
      const parts = data.split('_');
      console.log(`Module callback parts:`, parts);
      
      if (parts.length < 3) {
        throw new Error(`Invalid module callback data: ${data}`);
      }
      
      const semesterKey = parts[1];
      const moduleIndex = parseInt(parts[2]);
      
      console.log(`Selected module - semester: ${semesterKey}, index: ${moduleIndex}`);
      
      if (!semesterData[semesterKey]) {
        throw new Error(`Invalid semester key: ${semesterKey}`);
      }
      
      if (moduleIndex < 0 || moduleIndex >= semesterData[semesterKey].modules.length) {
        throw new Error(`Invalid module index: ${moduleIndex} for semester ${semesterKey}`);
      }
      
      userSession.selectedModule = moduleIndex;
      userSession.currentView = 'resources';
      userSessions.set(chatId, userSession);
      
      const moduleName = semesterData[semesterKey].modules[moduleIndex];
      const message = formatMessage(botConfig.messages.moduleResources, { moduleName });
      const keyboard = getResourceTypesKeyboard(semesterKey, moduleIndex);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('resource_')) {
      // Resource type selection
      const resourceType = data.replace('resource_', '');
      const semesterKey = userSession.selectedSemester;
      const moduleIndex = userSession.selectedModule;
      
      if (!semesterKey || moduleIndex === null || moduleIndex === undefined) {
        throw new Error('No semester or module selected');
      }
      
      const moduleName = semesterData[semesterKey].modules[moduleIndex];
      const emoji = resourceEmojis[resourceType] || '📄';
      const resourceName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace('_', ' ');
      
      const message = formatMessage(botConfig.messages.resourceComingSoon, {
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
              callback_data: `mod_${semesterKey}_${moduleIndex}`
            }
          ]]
        }
      });
      
    } else if (data === 'back_to_semesters') {
      // Back to semesters
      userSession.currentView = 'semesters';
      userSession.selectedSemester = null;
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const keyboard = getSemesterKeyboard();
      
      await bot.editMessageText(botConfig.messages.welcome, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
      
    } else if (data.startsWith('back_to_modules_')) {
      // Back to modules
      const semesterKey = data.replace('back_to_modules_', '');
      userSession.currentView = 'modules';
      userSession.selectedModule = null;
      userSessions.set(chatId, userSession);
      
      const semesterName = semesterData[semesterKey].name;
      const message = formatMessage(botConfig.messages.semesterModules, { semesterName });
      const keyboard = getModulesKeyboard(semesterKey);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
    } else {
      console.log(`Unknown callback data: ${data}`);
      await bot.sendMessage(chatId, '❌ Unknown command. Please try again.');
    }
    
  } catch (error) {
    console.error('Error handling callback query:', error);
    console.error('Callback data:', data);
    console.error('User session:', userSession);
    await bot.sendMessage(chatId, botConfig.messages.error);
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start the bot
console.log('🤖 Engineering Bot is running...');
console.log('📝 Use /ing to start the bot');
console.log('❓ Use /help for help');

// Export for potential use in other files
module.exports = {
  bot,
  semesterData,
  resourceTypes,
  userSessions
};
