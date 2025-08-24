# 📁 Example: Adding Files for Informatique 4

## 🎯 Step-by-Step Guide

### 1. Create the Directory Structure

First, create the folders exactly like this:

```
ST-Bot-main/
├── cour/
│   └── Informatique 4/          # Create this folder
│       ├── cours_informatique_4.pdf
│       ├── slides_informatique_4.pdf
│       └── exercices_informatique_4.pdf
└── td/
    └── Informatique 4/          # Create this folder (same name as cour)
        ├── td1_informatique_4.pdf
        ├── td2_informatique_4.pdf
        └── td3_informatique_4.pdf
```

### 2. Add Your Files

Place your actual files in these folders:
- **Course materials** → `cour/Informatique 4/`
- **TD materials** → `td/Informatique 4/`

### 3. Update the File Mapping

Add this to your `config.js` file in the `fileMapping` object:

```javascript
const fileMapping = {
  'semester_4': {  // Informatique 4 is in semester 4
    'Informatique 4': {
      'cours': [
        {
          name: 'cours_informatique_4.pdf',
          path: './cour/Informatique 4/cours_informatique_4.pdf',
          description: 'Cours principal d\'Informatique 4'
        },
        {
          name: 'slides_informatique_4.pdf',
          path: './cour/Informatique 4/slides_informatique_4.pdf',
          description: 'Slides du cours Informatique 4'
        },
        {
          name: 'exercices_informatique_4.pdf',
          path: './cour/Informatique 4/exercices_informatique_4.pdf',
          description: 'Exercices du cours Informatique 4'
        }
      ],
      'td': [
        {
          name: 'td1_informatique_4.pdf',
          path: './td/Informatique 4/td1_informatique_4.pdf',
          description: 'Premier TD d\'Informatique 4'
        },
        {
          name: 'td2_informatique_4.pdf',
          path: './td/Informatique 4/td2_informatique_4.pdf',
          description: 'Deuxième TD d\'Informatique 4'
        },
        {
          name: 'td3_informatique_4.pdf',
          path: './td/Informatique 4/td3_informatique_4.pdf',
          description: 'Troisième TD d\'Informatique 4'
        }
      ]
    }
  }
};
```

### 4. Test Your Setup

1. **Restart your bot**: `node engineering_bot.js`
2. **Test the flow**:
   - Send `/ing` to your bot
   - Select "Semester 4"
   - Select "Informatique 4"
   - Click "📘 Cours" or "📑 TD"
   - You should see your files!

## 🔧 Quick Method Using the Helper Script

1. **Place your files** in the folders as shown above
2. **Run**: `node add_files.js`
3. **Copy the generated code** and update `config.js`
4. **Make sure to map to semester_4** for Informatique 4

## ❌ Common Mistakes to Avoid

- ❌ Don't put files directly in `cour/` or `td/` (without subfolders)
- ❌ Don't create different folder names in `cour/` vs `td/`
- ❌ Don't forget to update the `fileMapping` in `config.js`
- ❌ Don't forget to restart the bot after changes

## ✅ Correct Structure Summary

```
cour/Informatique 4/     ← Course files here
td/Informatique 4/       ← TD files here (same module name)
```

Both folders should have the **exact same module name** ("Informatique 4" in this case).
