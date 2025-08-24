const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { universitiesData, resourceTypes, resourceEmojis, botConfig } = require('./config');
const { loadFileMapping, generateAutomaticFileMapping } = require('./auto_file_detector');

// Initialize bot with token from config
const bot = new TelegramBot(botConfig.token, { 
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
  const buttons = Object.keys(universitiesData).map(universityKey => ({
    text: universitiesData[universityKey].displayName,
    callback_data: `university_${universityKey}`
  }));
  
  return createInlineKeyboard(buttons);
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

// Helper function to get resource types keyboard
function getResourceTypesKeyboard(universityKey, semesterKey, moduleIndex) {
  const backButton = {
    text: botConfig.buttons.backToModules,
    callback_data: `back_to_modules_${universityKey}_${semesterKey}`
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
    currentView: 'universities',
    selectedUniversity: null,
    selectedSemester: null,
    selectedModule: null
  });
  
  const keyboard = getUniversityKeyboard();
  
  bot.sendMessage(chatId, botConfig.messages.welcome, {
    reply_markup: keyboard
  });
});

// Command handler for /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `🎓 مرحباً بك في بوت الهندسة!

مرحباً ${msg.from.first_name}! 👋

هذا البوت يساعدك في الوصول إلى الموارد التعليمية للهندسة.

استخدم الأوامر التالية:
• /ing - القائمة الرئيسية للموارد
• /about - معلومات عن البوت
• /send - إرسال ملفات للمطور
• /help - المساعدة

أهلاً وسهلاً بك! 🚀`;
  
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


   🔷️ إرسال ملفات إلى منشئ البوت (/send) 📤 : 

   بإمكان المستخدمين إرسال ملفات التي يرون أنها يجب أن تتوفر عند البوت إلى منشئ البوت لرفعها.

 🔹إرسال ملاحظات (/feedback) 📢:

   يُتيح البوت للمستخدمين إمكانية مشاركة ملاحظاتهم وآرائهم أو في حالة واجهوا مشاكل في البوت ، ومن ثم يقوم بإرسال هذه الملاحظات إلى منشئ البوت.
    ملاحظات المستخدمين ترسل إلى قناة خاصة(ليتم الرد في أسرع وقت ممكن )   
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
      // Send feedback to the feedback channel
      await bot.sendMessage(feedbackChannel, `📢 Feedback from user ${msg.from.first_name} (${msg.from.username || 'No username'})\n\nMessage: ${text}`);
      
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
        await bot.sendMessage(botConfig.ownerId, `📢 Feedback from user ${msg.from.first_name} (${msg.from.username || 'No username'})\n\nMessage: ${text}`);
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
    
    // Send file to bot owner
    const botOwnerId = botConfig.ownerId;
    
    try {
      // Send file to bot owner
      await bot.sendDocument(botOwnerId, userSession.fileData.file_id, {
        caption: `📤 File sent by user ${msg.from.first_name} (${msg.from.username || 'No username'})\n\nFile Name: ${fileName}\nOriginal Name: ${userSession.fileData.file_name}\nSize: ${userSession.fileData.file_size} bytes\nType: ${userSession.fileData.mime_type}`
      });
      
      // Reset user session
      userSessions.set(chatId, {
        currentView: 'universities',
        selectedUniversity: null,
        selectedSemester: null,
        selectedModule: null
      });
      
      bot.sendMessage(chatId, 'Thank you! Your message has been sent to the bot owner.');
      
    } catch (error) {
      console.error('Error sending file to owner:', error);
      bot.sendMessage(chatId, '❌ Sorry, there was an error sending your file. Please try again later.');
      
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
  
  try {
    // Answer callback query to remove loading state
    await bot.answerCallbackQuery(query.id);
    
    let userSession = userSessions.get(chatId) || {
      currentView: 'universities',
      selectedUniversity: null,
      selectedSemester: null,
      selectedModule: null
    };
    console.log(`Processing callback: ${data} for chat ${chatId}`);
    
    if (data.startsWith('university_')) {
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
      
      if (!universityKey || !semesterKey || moduleIndex === null || moduleIndex === undefined) {
        console.log('No university, semester or module selected');
        return;
      }
      
      const moduleName = universitiesData[universityKey].semesters[semesterKey].modules[moduleIndex];
      const emoji = resourceEmojis[resourceType] || '📄';
      const resourceName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace('_', ' ');
      
      // Check if files are available for this resource type
      const files = getFilesForResource(universityKey, semesterKey, moduleName, resourceType);
      
      if (files && files.length > 0) {
        // Files are available - show file selection
        const message = formatMessage(botConfig.messages.filesAvailable, {
          emoji,
          resourceName,
          moduleName
        });
        
        const keyboard = createFileSelectionKeyboard(files, universityKey, semesterKey, moduleIndex, resourceType);
        
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
                callback_data: `mod_${universityKey}_${semesterKey}_${moduleIndex}`
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
      userSessions.set(chatId, userSession);
      
      const keyboard = getUniversityKeyboard();
      
      await bot.editMessageText(botConfig.messages.welcome, {
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
      
    } else if (data.startsWith('file_')) {
      // File selection - send the actual file
      const parts = data.split('_');
      if (parts.length < 7) {
        console.log(`Invalid file callback data: ${data}`);
        return;
      }
      
      const universityKey = parts[1];
      const semesterKey = `${parts[2]}_${parts[3]}`; // semester_1
      const moduleIndex = parseInt(parts[4]);
      const resourceType = parts[5];
      const fileIndex = parseInt(parts[6]);
      
      const moduleName = universitiesData[universityKey].semesters[semesterKey].modules[moduleIndex];
      const files = getFilesForResource(universityKey, semesterKey, moduleName, resourceType);
      
      if (!files || !files[fileIndex]) {
        console.log(`File not found: ${data}`);
        return;
      }
      
      const file = files[fileIndex];
      
      try {
        // Send the file
        await bot.sendDocument(chatId, file.path, {
          caption: `${file.name}\n\n${file.description || 'No description available'}`
        });
        
        // Send a success message
        await bot.sendMessage(chatId, `✅ File "${file.name}" sent successfully!`);
        
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
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
  
  // If it's a 409 conflict, try to clear webhook and restart polling
  if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 409) {
    console.log('🔄 409 Conflict detected. Clearing webhook and restarting...');
    
    bot.setWebHook('').then(() => {
      console.log('✅ Webhook cleared, polling should resume');
    }).catch((webhookError) => {
      console.log('ℹ️ Webhook already cleared');
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
