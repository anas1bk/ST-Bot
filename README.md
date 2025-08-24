# Engineering Telegram Bot

A clean, modular Telegram bot designed for engineering students to access educational resources organized by semesters and modules.

## Features

- 🎓 **Semester-based navigation**: Browse resources by semester (1-4)
- 📚 **Module organization**: Each semester contains relevant modules
- 📘 **Resource types**: Access different types of resources (Cours, TD, TP, etc.)
- ⬅️ **Back navigation**: Easy navigation with back buttons
- 🎨 **Clean UI**: Beautiful inline keyboards with emojis
- 🔧 **Modular design**: Easy to update and maintain

## Bot Flow

1. **Start**: User sends `/ing` command
2. **Semester Selection**: Choose from 4 semesters
3. **Module Selection**: Select a module from the chosen semester
4. **Resource Type**: Choose resource type (Cours, TD, TP, etc.)
5. **Navigation**: Use back buttons to navigate between levels

## Resource Types

- 📘 Cours (Courses)
- 📑 TD (Tutorials)
- 🧪 TP (Practical Work)
- 📝 Interrogation
- 🎓 Exam
- 🖥️ Control TP
- 📂 Drive
- 📚 Book
- 📧 Emails

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Telegram bot token from [@BotFather](https://t.me/botfather)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   - Open `config.js`
   - Replace `YOUR_BOT_TOKEN_HERE` with your actual bot token
   ```javascript
   const botConfig = {
     token: 'YOUR_ACTUAL_BOT_TOKEN_HERE',
     // ... rest of config
   };
   ```

4. **Run the bot**
   ```bash
   node engineering_bot.js
   ```

### Getting a Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the token provided by BotFather
5. Paste it in the `config.js` file

## Usage

### Commands

- `/ing` - Start the bot and select semester
- `/help` - Show help message

### Navigation

- Use inline buttons to navigate through the menu
- Use "Back" buttons to return to previous menus
- The bot remembers your current position

## Project Structure

```
├── engineering_bot.js    # Main bot logic
├── config.js            # Configuration and data
├── package.json         # Dependencies
└── README.md           # This file
```

## Customization

### Adding/Removing Semesters

Edit the `semesterData` object in `config.js`:

```javascript
const semesterData = {
  'semester_1': {
    name: 'Semester 1',
    modules: [
      'Module 1',
      'Module 2',
      // ... more modules
    ]
  },
  // Add new semesters here
  'semester_5': {
    name: 'Semester 5',
    modules: [
      'New Module 1',
      'New Module 2'
    ]
  }
};
```

### Adding/Removing Modules

Edit the `modules` array for any semester in `config.js`:

```javascript
'semester_1': {
  name: 'Semester 1',
  modules: [
    'Analyse 1',
    'Algèbre 1',
    'New Module',  // Add new module
    // Remove modules by deleting their lines
  ]
}
```

### Adding/Removing Resource Types

Edit the `resourceTypes` array in `config.js`:

```javascript
const resourceTypes = [
  { text: '📘 Cours', callback_data: 'resource_cours' },
  { text: '📑 TD', callback_data: 'resource_td' },
  { text: '🆕 New Resource', callback_data: 'resource_new_resource' }, // Add new
  // Remove by deleting the line
];
```

### Customizing Messages

Edit the `messages` object in `config.js`:

```javascript
messages: {
  welcome: '🎓 Welcome to Engineering Resources!\n\nPlease select a semester:',
  // Customize other messages here
}
```

## Current Semester Data

### Semester 1
- Analyse 1
- Algèbre 1
- Éléments de chimie (Structure de la matière)
- Éléments de Mécanique (Physique 1)
- Probabilités et statistiques
- Structure des ordinateurs et applications
- Dimension Éthique et déontologie (les fondements)
- Anglais

### Semester 2
- Analyse 2
- Algèbre 2
- Électricité et Magnétisme (Physique 2)
- Thermodynamique
- Dessin technique
- Programmation (Informatique 2)
- Anglais
- Les métiers de l'ingénieur

### Semester 3
- Analyse 3
- Analyse numérique 1
- Ondes et vibrations
- Mécanique des fluides
- Mécanique rationnelle
- Informatique 3 (Matlab)
- Dessin Assisté par Ordinateur
- Anglais technique

### Semester 4
- Analyse numérique 2
- Résistance des matériaux
- Electronique fondamentale
- Electricité fondamentale
- Théorie du signal
- Mesure et métrologie
- Informatique 4
- Conception Assistée par Ordinateur
- Techniques d'expression, d'information et de communication

## Dependencies

- `node-telegram-bot-api` - Telegram Bot API wrapper
- `express` - Web framework (if using webhooks)
- Other dependencies as listed in `package.json`

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if the bot token is correct
   - Ensure the bot is running (`node engineering_bot.js`)
   - Check console for error messages

2. **Module not found errors**
   - Verify that the module exists in the `semesterData` configuration
   - Check for typos in module names

3. **Callback query errors**
   - Ensure callback_data values are unique
   - Check for special characters in module names

### Logs

The bot provides console logs for:
- Bot startup
- Error messages
- User interactions (if enabled)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [ISC License](LICENSE).

## Support

For support or questions:
- Check the troubleshooting section
- Review the configuration options
- Ensure all dependencies are installed correctly

---

**Note**: This bot is designed for educational purposes and can be easily customized for different engineering programs or educational institutions.
