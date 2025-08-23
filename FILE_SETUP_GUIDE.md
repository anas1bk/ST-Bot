# 📁 File Setup Guide for Engineering Bot

## 🎯 Overview

Your bot now has a complete file handling system! When users click on resource types (like "Cours" or "TD"), they will see actual files they can download instead of "coming soon" messages.

## 📂 Current File Structure

Your files are organized as follows:

```
ST-Bot-main/
├── cour/                    # Course materials
│   ├── Analyse 3/
│   │   ├── Cours Analyse 3.pdf
│   │   └── Table.pdf
│   └── Analyse numérique/
│       ├── ANALYSE NUMERIQUE 1 (1).pdf
│       └── ANUNUM S3.pdf
└── td/                      # Tutorial/Exercise materials
    ├── MDF/                 # Mécanique des Fluides
    │   ├── tdndeg1_mdf.pdf
    │   ├── td2-2022.pdf
    │   ├── td_3-2022.pdf
    │   └── td_mdf-04.pdf
    └── MR/                  # Mécanique Rationnelle
        ├── TD 1.pdf
        ├── TD 2.pdf
        ├── TD 3.pdf
        ├── TD 4.pdf
        └── TD 5.pdf
```

## 🔧 How to Add New Files

### Method 1: Manual Addition (Recommended for small changes)

1. **Place your files** in the appropriate directories:
   - Course materials → `cour/[Module Name]/`
   - Tutorial/Exercise materials → `td/[Module Name]/`

2. **Update the file mapping** in `config.js`:
   ```javascript
   const fileMapping = {
     'semester_3': {
       'Your Module Name': {
         'cours': [
           {
             name: 'Your File Name.pdf',
             path: './cour/Your Module Name/Your File Name.pdf',
             description: 'Description of the file'
           }
         ],
         'td': [
           {
             name: 'Your TD File.pdf',
             path: './td/Your Module Name/Your TD File.pdf',
             description: 'Description of the TD file'
           }
         ]
       }
     }
   };
   ```

### Method 2: Automatic Generation (Recommended for bulk additions)

1. **Place your files** in the `cour/` and `td/` directories
2. **Run the helper script**:
   ```bash
   node add_files.js
   ```
3. **Copy the generated code** and update `config.js`
4. **Map the modules to the correct semesters** (see example below)

## 📋 Mapping Modules to Semesters

You need to map your modules to the correct semester keys. Here's how:

```javascript
const fileMapping = {
  'semester_1': {
    'Analyse 1': { /* files here */ },
    'Algèbre 1': { /* files here */ }
  },
  'semester_2': {
    'Analyse 2': { /* files here */ },
    'Algèbre 2': { /* files here */ }
  },
  'semester_3': {
    'Analyse 3': { /* files here */ },
    'Analyse numérique 1': { /* files here */ }
  },
  'semester_4': {
    'Analyse numérique 2': { /* files here */ },
    'Résistance des matériaux': { /* files here */ }
  }
};
```

## 🎮 How It Works

1. **User clicks `/ing`** → Bot shows semester selection
2. **User selects semester** → Bot shows modules for that semester
3. **User selects module** → Bot shows resource types (Cours, TD, TP, etc.)
4. **User clicks resource type** → Bot checks if files are available:
   - ✅ **Files available**: Shows list of files to download
   - ❌ **No files**: Shows "coming soon" message
5. **User clicks file** → Bot sends the actual file

## 📝 Supported File Types

The bot supports these file types:
- `.pdf` - PDF documents
- `.doc` / `.docx` - Word documents
- `.ppt` / `.pptx` - PowerPoint presentations
- `.txt` - Text files

## 🔍 Testing Your Setup

1. **Start your bot**: `node engineering_bot.js`
2. **Test the flow**:
   - Send `/ing` to your bot
   - Select "Semester 3"
   - Select "Analyse 3"
   - Click "📘 Cours" or "📑 TD"
   - You should see actual files to download!

## 🚀 Adding Files for Other Semesters

To add files for Semester 1, 2, or 4:

1. **Create the directory structure**:
   ```
   cour/
   ├── Analyse 1/
   │   └── your_files.pdf
   └── Algèbre 1/
       └── your_files.pdf
   ```

2. **Update the file mapping** in `config.js`:
   ```javascript
   'semester_1': {
     'Analyse 1': {
       'cours': [
         {
           name: 'Your File.pdf',
           path: './cour/Analyse 1/Your File.pdf',
           description: 'Description'
         }
       ]
     }
   }
   ```

## 🛠️ Troubleshooting

### Files not showing up?
- Check that file paths in `config.js` match your actual file structure
- Ensure file names match exactly (case-sensitive)
- Verify files exist in the specified locations

### Bot not sending files?
- Check file permissions
- Ensure files are not corrupted
- Verify the bot has read access to the file directories

### Error messages?
- Check the console for detailed error messages
- Verify all file paths are correct
- Ensure the file mapping structure is valid JSON

## 📞 Need Help?

If you encounter issues:
1. Check the console output for error messages
2. Verify your file structure matches the examples
3. Test with a simple file first
4. Use the `add_files.js` script to generate correct mappings

## 🎉 Success!

Once you've added your files and updated the mapping, users will be able to:
- ✅ Browse through semesters and modules
- ✅ See available files for each resource type
- ✅ Download actual course materials
- ✅ Navigate easily with back buttons

Your bot is now a fully functional file distribution system! 🚀
