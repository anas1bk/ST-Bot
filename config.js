// Configuration file for Engineering Bot
// This file contains all the data structures that can be easily updated

// Main navigation structure
const navigationStructure = {
  // Tronc commun - existing university system
  'tronc_commun': {
    name: 'Tronc commun',
    displayName: '📚 Tronc commun',
    description: 'Cours communs des semestres 1 à 4',
    type: 'university_system',
    universities: {
      'batna2': {
        name: 'Université Batna 2',
        displayName: '🏫 Université Batna 2',
        semesters: {
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
              'Informatique 3',
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
        }
      },
      'setif': {
        name: 'Université Setif',
        displayName: '🏫 Université Setif',
        semesters: {
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
              'Informatique 3',
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
        }
      },
      'usthb': {
        name: 'USTHB',
        displayName: '🏫 USTHB',
        semesters: {
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
              'Informatique 3',
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
        }
      },
      'constantine1': {
        name: 'Université Constantine 1',
        displayName: '🏫 Université Constantine 1',
        semesters: {
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
              'Informatique 3',
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
        }
      }
    }
  },
  
  // Spécialité - new specialization system
  'specialite': {
    name: 'Spécialité',
    displayName: '🎯 Spécialité',
    description: 'Spécialisations et cours avancés',
    type: 'specialization_system',
    specializations: {
      'cese': {
        name: 'CESE',
        displayName: '⚡ CESE (Contrôle et Systèmes Embarqués)',
        description: 'Spécialisation en Contrôle et Systèmes Embarqués',
        semesters: {
          'semester_5': {
            name: 'Semester 5',
            modules: [
              'Electrotechnique fondamentale',
              'Théorie de champ',
              'Electronique de puissance',
              'Transfert thermique',
              'Asservissements 1',
              'Logique combinatoire et séquentielle',
              'Méthodes numériques appliqués-Python',
              'Anglais technique'
            ]
          },
          'semester_6': {
            name: 'Semester 6',
            modules: [
              'Conversion d\'énergie',
              'Actionneurs et Capteurs',
              'Introduction aux systèmes embarqués',
              'Asservissement 2',
              'Traitement de signal',
              'Prévisions et décisions statistiques',
              'Programmation en C et réseaux de communication',
              'Entrepreneuriat et management d\'entreprise'
            ]
          }
        }
      }
    }
  }
};

// Legacy universitiesData for backward compatibility (will be removed later)
const universitiesData = navigationStructure.tronc_commun.universities;

// Legacy semesterData for backward compatibility (will be removed later)
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

// File mapping system - maps semester/module/resource type to actual files
const fileMapping = {
  'semester_3': {
    'Analyse 3': {
      'cours': [
        {
          name: 'Cours Analyse 3.pdf',
          path: './cour/Analyse 3/Cours Analyse 3.pdf',
          description: 'Cours principal d\'Analyse 3'
        },
        {
          name: 'Table.pdf',
          path: './cour/Analyse 3/Table.pdf',
          description: 'Table de référence pour Analyse 3'
        }
      ],
      'td': [
        {
          name: 'TD 1.pdf',
          path: './td/MR/TD 1.pdf',
          description: 'Premier TD d\'Analyse 3'
        },
        {
          name: 'TD 2.pdf',
          path: './td/MR/TD 2.pdf',
          description: 'Deuxième TD d\'Analyse 3'
        },
        {
          name: 'TD 3.pdf',
          path: './td/MR/TD 3.pdf',
          description: 'Troisième TD d\'Analyse 3'
        },
        {
          name: 'TD 4.pdf',
          path: './td/MR/TD 4.pdf',
          description: 'Quatrième TD d\'Analyse 3'
        },
        {
          name: 'TD 5.pdf',
          path: './td/MR/TD 5.pdf',
          description: 'Cinquième TD d\'Analyse 3'
        }
      ]
    },
    'Analyse numérique 1': {
      'cours': [
        {
          name: 'ANALYSE NUMERIQUE 1 (1).pdf',
          path: './cour/Analyse numérique/ANALYSE NUMERIQUE 1 (1).pdf',
          description: 'Cours principal d\'Analyse Numérique 1'
        },
        {
          name: 'ANUNUM S3.pdf',
          path: './cour/Analyse numérique/ANUNUM S3.pdf',
          description: 'Support de cours Analyse Numérique S3'
        }
      ],
      'td': [
        {
          name: 'tdndeg1_mdf.pdf',
          path: './td/MDF/tdndeg1_mdf.pdf',
          description: 'Premier TD d\'Analyse Numérique'
        },
        {
          name: 'td2-2022.pdf',
          path: './td/MDF/td2-2022.pdf',
          description: 'Deuxième TD d\'Analyse Numérique'
        },
        {
          name: 'td_3-2022.pdf',
          path: './td/MDF/td_3-2022.pdf',
          description: 'Troisième TD d\'Analyse Numérique'
        },
        {
          name: 'td_mdf-04.pdf',
          path: './td/MDF/td_mdf-04.pdf',
          description: 'Quatrième TD d\'Analyse Numérique'
        }
      ]
    }
  }
};

// Resource types with emojis and their corresponding callback data
const resourceTypes = [
  { text: '📘 Cours', callback_data: 'resource_cour' },
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
  'cour': '📘',
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
  
  // Feedback channel (replace with your channel username or ID)
  // Examples: '@myfeedbackchannel' or '-1001234567890'
  feedbackChannel: process.env.FEEDBACK_CHANNEL || '-1002466094952', // Replace with your actual channel ID
  
  // File sharing channel (for /send command)
  fileSharingChannel: process.env.FILE_SHARING_CHANNEL || '-1002904651461', // Replace with your actual channel ID
  
  // Analytics channel (for reports and insights)
  analyticsChannel: process.env.ANALYTICS_CHANNEL || '-1003030816380', // Replace with your analytics channel ID
  
  // Analytics settings
  analytics: {
    enabled: true,
    trackFileDownloads: true,
    trackUserActivity: true,
    trackModuleViews: true,
    generateWeeklyReports: true,
    generateMonthlyReports: true,
    maxDataRetentionDays: 90 // Keep data for 90 days
  },
  
  // Bot commands
  commands: {
    start: '/ing',
    help: '/help'
  },
  
  // Messages
  messages: {
    welcome: '🎓 Welcome to Engineering Resources!\n\nPlease select your path:',
    troncCommun: '📚 Tronc commun\n\nCours communs des semestres 1 à 4\n\nPlease select a university:',
    specialite: '🎯 Spécialité\n\nSpécialisations et cours avancés\n\nPlease select a specialization:',
    universitySemesters: '🏫 {universityName}\n\nPlease select a semester:',
    specializationSemesters: '⚡ {specializationName}\n\nPlease select a semester:',
    semesterModules: '📚 {semesterName} Modules:\n\nSelect a module:',
    moduleResources: '📖 {moduleName}\n\nSelect resource type:',
    resourceComingSoon: '{emoji} {resourceName} for {moduleName}\n\nThis feature is coming soon! 🚀',
    noFilesAvailable: '{emoji} {resourceName} for {moduleName}\n\n❌ No files available for this resource type yet.\n\n💡 Files will be added soon!',
    filesAvailable: '{emoji} {resourceName} for {moduleName}\n\n📁 Available files:',
    error: '❌ An error occurred. Please try again.',
    help: `🤖 Engineering Bot Help

الأوامر:
/ing  تشغيل البوت واختيار المسار
/help  عرض رسالة المساعدة
/feedback  إرسال ملاحظات أو اقتراحات
/send  إرسال ملفات للمشاركة

المسارات:
📚 Tronc commun - Cours communs des semestres 1 à 4
🎯 Spécialité - Spécialisations et cours avancés

التنقّل:
• استخدم الأزرار المدمجة للتنقّل بين المسارات، الجامعات، الفصول، الوحدات، وأنواع الموارد
• استخدم زر «رجوع» للعودة إلى القوائم السابقة
• البوت يتذكر موقعك الحالي أثناء التنقّل

الميزات:
• تصفّح موارد الهندسة حسب المسار والجامعة والفصل الدراسي والوحدة
• الوصول إلى أنواع مختلفة من الموارد (دروس، أعمال موجهة، أعمال تطبيقية، إلخ)
• إرسال ملاحظات إلى قناة خاصة
• مشاركة ملفات مع الطلاب الآخرين
• تنقّل سهل باستخدام أزرار الرجوع
• واجهة نظيفة وبسيطة`
  },
  
  // Button texts
  buttons: {
    backToMainMenu: '⬅️ Back to Main Menu',
    backToTroncCommun: '⬅️ Back to Tronc commun',
    backToSpecialite: '⬅️ Back to Spécialité',
    backToUniversities: '⬅️ Back to Universities',
    backToSpecializations: '⬅️ Back to Specializations',
    backToSemesters: '⬅️ Back to Semesters',
    backToModules: '⬅️ Back to Modules',
    backToResourceTypes: '⬅️ Back to Resource Types'
  }
};

module.exports = {
  navigationStructure,
  universitiesData,
  semesterData, // Legacy support
  resourceTypes,
  resourceEmojis,
  botConfig,
  fileMapping
};

