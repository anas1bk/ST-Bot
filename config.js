// Configuration file for Engineering Bot
// This file contains all the data structures that can be easily updated

const semesterData = {
  'semester_1': {
    name: 'Semester 1',
    modules: [
      'Analyse 1',
      'Algèbre 1',
      'Structure de la matière',
      'Physique 1',
      'Probabilités et statistiques',
      'Informatique 1',
      'Éthique et déontologie',
      'Anglais'
    ]
  },
  'semester_2': {
    name: 'Semester 2',
    modules: [
      'Analyse 2',
      'Algèbre 2',
      'Physique 2',
      'Thermodynamique',
      'Dessin technique',
      'Informatique 2',
      'Anglais',
      'Les métiers de l\'ingénieur'
    ]
  },
  'semester_3': {
    name: 'Semester 3',
    modules: [
      'Analyse 3',
      'Analyse numérique 1',
      'Ondes et vibrations',
      'Mécanique des fluides',
      'Mécanique rationnelle',
      'Informatique 3 ',
      'DAO',
      'Anglais technique'
    ]
  },
  'semester_4': {
    name: 'Semester 4',
    modules: [
      'Analyse numérique 2',
      'Résistance des matériaux',
      'Electronique fondamentale',
      'Electricité fondamentale',
      'Théorie du signal',
      'Mesure et métrologie',
      'Informatique 4',
      'Conception Assistée par Ordinateur',
      'Techniques d\'expression, d\'information et de communication'
    ]
  }
};

// Resource types with emojis and their corresponding callback data
const resourceTypes = [
  { text: '📘 Cours', callback_data: 'resource_cours' },
  { text: '📑 TD', callback_data: 'resource_td' },
  { text: '🧪 TP', callback_data: 'resource_tp' },
  { text: '📝 Interrogation', callback_data: 'resource_interrogation' },
  { text: '🎓 Exam', callback_data: 'resource_exam' },
  { text: '🖥️ Control TP', callback_data: 'resource_control_tp' },
  { text: '📂 Drive', callback_data: 'resource_drive' },
  { text: '📚 Book', callback_data: 'resource_book' },
  { text: '📧 Emails', callback_data: 'resource_emails' }
];

// Resource emojis mapping
const resourceEmojis = {
  'cours': '📘',
  'td': '📑',
  'tp': '🧪',
  'interrogation': '📝',
  'exam': '🎓',
  'control_tp': '🖥️',
  'drive': '📂',
  'book': '📚',
  'emails': '📧'
};

// Bot configuration
const botConfig = {
  // Replace with your actual bot token
  // For local development, use the token directly
  // For deployment (Render), use environment variable
  token: process.env.BOT_TOKEN || '7938100914:AAFW5Gp_-8cwj7PtztMdV2MhMr1VladRR04',
  
  // Bot owner ID (replace with your Telegram user ID)
  ownerId: process.env.BOT_OWNER_ID || '5665791396',
  
  // Bot commands
  commands: {
    start: '/ing',
    help: '/help'
  },
  
  // Messages
  messages: {
    welcome: '🎓 Welcome to Engineering Resources!\n\nPlease select a semester:',
    semesterModules: '📚 {semesterName} Modules:\n\nSelect a module:',
    moduleResources: '📖 {moduleName}\n\nSelect resource type:',
    resourceComingSoon: '{emoji} {resourceName} for {moduleName}\n\nThis feature is coming soon! 🚀',
    error: '❌ An error occurred. Please try again.',
    help: `🤖 Engineering Bot Help

الأوامر:
/ing – تشغيل البوت واختيار الفصل الدراسي
/help – عرض رسالة المساعدة

التنقّل:
• استخدم الأزرار المدمجة للتنقّل بين الفصول، الوحدات، وأنواع الموارد
• استخدم زر «رجوع» للعودة إلى القوائم السابقة
• البوت يتذكر موقعك الحالي أثناء التنقّل

الميزات:
• تصفّح موارد الهندسة حسب الفصل الدراسي والوحدة
• الوصول إلى أنواع مختلفة من الموارد (دروس، أعمال موجهة، أعمال تطبيقية، إلخ)
• تنقّل سهل باستخدام أزرار الرجوع
• واجهة نظيفة وبسيطة`
  },
  
  // Button texts
  buttons: {
    backToSemesters: '⬅️ Back to Semesters',
    backToModules: '⬅️ Back to Modules',
    backToResourceTypes: '⬅️ Back to Resource Types'
  }
};

module.exports = {
  semesterData,
  resourceTypes,
  resourceEmojis,
  botConfig
};


