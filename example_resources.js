// Example: How to extend the bot with actual resource links
// This file shows how you can add real content to the bot

// Example resource data structure
const resourceData = {
  // Semester 1 - Analyse 1
  'semester_1_0_cours': {
    title: '📘 Cours - Analyse 1',
    content: 'Here are the course materials for Analyse 1:',
    links: [
      { text: '📄 Chapter 1: Introduction', url: 'https://example.com/analyse1-ch1.pdf' },
      { text: '📄 Chapter 2: Limits and Continuity', url: 'https://example.com/analyse1-ch2.pdf' },
      { text: '📄 Chapter 3: Derivatives', url: 'https://example.com/analyse1-ch3.pdf' },
      { text: '📄 Chapter 4: Applications', url: 'https://example.com/analyse1-ch4.pdf' }
    ]
  },
  
  'semester_1_0_td': {
    title: '📑 TD - Analyse 1',
    content: 'Tutorial exercises for Analyse 1:',
    links: [
      { text: '📝 TD 1: Limits', url: 'https://example.com/analyse1-td1.pdf' },
      { text: '📝 TD 2: Continuity', url: 'https://example.com/analyse1-td2.pdf' },
      { text: '📝 TD 3: Derivatives', url: 'https://example.com/analyse1-td3.pdf' },
      { text: '📝 TD 4: Applications', url: 'https://example.com/analyse1-td4.pdf' }
    ]
  },
  
  'semester_1_0_tp': {
    title: '🧪 TP - Analyse 1',
    content: 'Practical work for Analyse 1:',
    links: [
      { text: '🖥️ TP 1: Using GeoGebra', url: 'https://example.com/analyse1-tp1.pdf' },
      { text: '🖥️ TP 2: Numerical Methods', url: 'https://example.com/analyse1-tp2.pdf' }
    ]
  },
  
  // Semester 2 - Analyse 2
  'semester_2_0_cours': {
    title: '📘 Cours - Analyse 2',
    content: 'Course materials for Analyse 2:',
    links: [
      { text: '📄 Chapter 1: Integration', url: 'https://example.com/analyse2-ch1.pdf' },
      { text: '📄 Chapter 2: Series', url: 'https://example.com/analyse2-ch2.pdf' },
      { text: '📄 Chapter 3: Functions of Several Variables', url: 'https://example.com/analyse2-ch3.pdf' }
    ]
  },
  
  // Add more resources for other modules...
};

// Example function to handle resource requests
function handleResourceRequest(semesterKey, moduleIndex, resourceType) {
  const resourceKey = `${semesterKey}_${moduleIndex}_${resourceType}`;
  const resource = resourceData[resourceKey];
  
  if (!resource) {
    return {
      title: '📄 Resource Not Available',
      content: 'This resource is not yet available. Please check back later.',
      links: []
    };
  }
  
  return resource;
}

// Example function to create resource message
function createResourceMessage(resource) {
  let message = `${resource.title}\n\n${resource.content}\n\n`;
  
  if (resource.links.length > 0) {
    message += '📚 Available resources:\n';
    resource.links.forEach((link, index) => {
      message += `${index + 1}. ${link.text}\n`;
    });
    message += '\nClick the links below to access the resources:';
  } else {
    message += 'No resources available at the moment.';
  }
  
  return message;
}

// Example function to create resource keyboard
function createResourceKeyboard(resource, semesterKey, moduleIndex) {
  const keyboard = [];
  
  // Add resource links
  if (resource.links.length > 0) {
    resource.links.forEach((link, index) => {
      keyboard.push([{
        text: `${index + 1}. ${link.text}`,
        url: link.url
      }]);
    });
  }
  
  // Add back button
  keyboard.push([{
    text: '⬅️ Back to Resource Types',
    callback_data: `module_${semesterKey}_${moduleIndex}`
  }]);
  
  return {
    inline_keyboard: keyboard
  };
}

// Example integration with the main bot
// Add this to your engineering_bot.js file:

/*
// In the callback query handler, replace the resource_ section with:

} else if (data.startsWith('resource_')) {
  // Resource type selection
  const resourceType = data.replace('resource_', '');
  const semesterKey = userSession.selectedSemester;
  const moduleIndex = userSession.selectedModule;
  
  // Get resource data
  const resource = handleResourceRequest(semesterKey, moduleIndex, resourceType);
  const message = createResourceMessage(resource);
  const keyboard = createResourceKeyboard(resource, semesterKey, moduleIndex);
  
  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: query.message.message_id,
    reply_markup: keyboard
  });
}
*/

// Example of how to add Google Drive integration
const driveConfig = {
  baseUrl: 'https://drive.google.com/drive/folders/',
  folders: {
    'semester_1_0_cours': '1ABC123DEF456GHI789JKL',
    'semester_1_0_td': '2DEF456GHI789JKL012MNO',
    'semester_1_0_tp': '3GHI789JKL012MNO345PQR',
    // Add more folder IDs for other resources
  }
};

function getDriveLink(resourceKey) {
  const folderId = driveConfig.folders[resourceKey];
  if (folderId) {
    return `${driveConfig.baseUrl}${folderId}`;
  }
  return null;
}

// Example of how to add email integration
const emailConfig = {
  contactEmails: {
    'semester_1_0_emails': [
      { name: 'Dr. Smith', email: 'smith@university.edu', subject: 'Analyse 1 - Question' },
      { name: 'Prof. Johnson', email: 'johnson@university.edu', subject: 'Analyse 1 - Help' }
    ],
    'semester_2_0_emails': [
      { name: 'Dr. Brown', email: 'brown@university.edu', subject: 'Analyse 2 - Question' }
    ]
  }
};

function createEmailKeyboard(emails, semesterKey, moduleIndex) {
  const keyboard = [];
  
  emails.forEach(contact => {
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(contact.subject)}`;
    keyboard.push([{
      text: `📧 ${contact.name}`,
      url: mailtoLink
    }]);
  });
  
  // Add back button
  keyboard.push([{
    text: '⬅️ Back to Resource Types',
    callback_data: `module_${semesterKey}_${moduleIndex}`
  }]);
  
  return {
    inline_keyboard: keyboard
  };
}

module.exports = {
  resourceData,
  handleResourceRequest,
  createResourceMessage,
  createResourceKeyboard,
  driveConfig,
  getDriveLink,
  emailConfig,
  createEmailKeyboard
};
