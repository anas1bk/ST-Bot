# 🚀 **NEW NAVIGATION SYSTEM GUIDE**

## 📋 **Overview**

The bot now features a new navigation system with two main paths:

### **📚 Tronc commun**
- Traditional university system (semesters 1-4)
- Universities: Batna 2, Setif, USTHB, Constantine 1
- Same modules and structure as before

### **🎯 Spécialité**
- New specialization system (semesters 5-6)
- Current specialization: **CESE** (Contrôle et Systèmes Embarqués)
- Advanced modules for specialized studies

## 🗂️ **New Folder Structure**

```
📁 Project Root/
├── 📁 universities/ (Tronc commun)
│   ├── 🏫 batna2/
│   │   ├── 📚 semester_1/
│   │   │   ├── 📘 cour/
│   │   │   ├── 📑 td/
│   │   │   ├── 🧪 tp/
│   │   │   └── ...
│   │   ├── 📚 semester_2/
│   │   ├── 📚 semester_3/
│   │   └── 📚 semester_4/
│   ├── 🏫 setif/
│   ├── 🏫 usthb/
│   └── 🏫 constantine1/
│
└── 📁 specializations/ (Spécialité)
    └── ⚡ cese/
        ├── 📚 semester_5/
        │   ├── 📘 cour/
        │   │   ├── Electrotechnique fondamentale/
        │   │   ├── Théorie de champ/
        │   │   ├── Electronique de puissance/
        │   │   ├── Transfert thermique/
        │   │   ├── Asservissements 1/
        │   │   ├── Logique combinatoire et séquentielle/
        │   │   ├── Méthodes numériques appliqués-Python/
        │   │   └── Anglais technique/
        │   ├── 📑 td/
        │   ├── 🧪 tp/
        │   └── ...
        └── 📚 semester_6/
            ├── 📘 cour/
            │   ├── Conversion d'énergie/
            │   ├── Actionneurs et Capteurs/
            │   ├── Introduction aux systèmes embarqués/
            │   ├── Asservissement 2/
            │   ├── Traitement de signal/
            │   ├── Prévisions et décisions statistiques/
            │   ├── Programmation en C et réseaux de communication/
            │   └── Entrepreneuriat et management d'entreprise/
            ├── 📑 td/
            ├── 🧪 tp/
            └── ...
```

## 🎯 **CESE Specialization Modules**

### **📚 Semester 5**
1. **Electrotechnique fondamentale**
2. **Théorie de champ**
3. **Electronique de puissance**
4. **Transfert thermique**
5. **Asservissements 1**
6. **Logique combinatoire et séquentielle**
7. **Méthodes numériques appliqués-Python**
8. **Anglais technique**

### **📚 Semester 6**
1. **Conversion d'énergie**
2. **Actionneurs et Capteurs**
3. **Introduction aux systèmes embarqués**
4. **Asservissement 2**
5. **Traitement de signal**
6. **Prévisions et décisions statistiques**
7. **Programmation en C et réseaux de communication**
8. **Entrepreneuriat et management d'entreprise**

## 🚀 **Setup Instructions**

### **1. Create New Folder Structure**
```bash
node create_new_structure.js
```

### **2. Add Files**
- Place files in the appropriate folders
- Files can be directly in resource folders or in module subfolders
- Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT

### **3. Generate File Mapping**
```bash
node auto_file_detector.js
```

### **4. Deploy and Test**
```bash
git add .
git commit -m "Implement new navigation system with Tronc commun and Spécialité"
git push origin main
```

## 🧭 **Navigation Flow**

### **Main Menu**
```
🎓 Welcome to Engineering Resources!

Please select your path:

[📚 Tronc commun] [🎯 Spécialité]
```

### **Tronc commun Path**
```
📚 Tronc commun

Cours communs des semestres 1 à 4

Please select a university:

[🏫 Université Batna 2] [🏫 Université Setif]
[🏫 USTHB] [🏫 Université Constantine 1]
[⬅️ Back to Main Menu]
```

### **Spécialité Path**
```
🎯 Spécialité

Spécialisations et cours avancés

Please select a specialization:

[⚡ CESE (Contrôle et Systèmes Embarqués)]
[⬅️ Back to Main Menu]
```

### **CESE Specialization**
```
⚡ CESE

Please select a semester:

[Semester 5] [Semester 6]
[⬅️ Back to Specializations]
```

## 🔧 **Technical Implementation**

### **New Files Created**
- `config.js` - Updated with navigation structure
- `engineering_bot.js` - Updated with new handlers
- `auto_file_detector.js` - Updated for specializations
- `create_new_structure.js` - Creates folder structure

### **New Callback Handlers**
- `path_tronc_commun` - Navigate to Tronc commun
- `path_specialite` - Navigate to Spécialité
- `specialization_cese` - Select CESE specialization
- `spec_semester_cese_semester_5` - Select semester 5
- `spec_semester_cese_semester_6` - Select semester 6
- `spec_mod_cese_semester_5_0` - Select module (index-based)
- `spec_file_cese_semester_5_0_cour_0` - Select file

### **Back Navigation**
- `back_to_main_menu` - Return to main menu
- `back_to_specializations` - Return to specializations
- `back_to_spec_semesters_cese` - Return to CESE semesters
- `back_to_spec_modules_cese_semester_5` - Return to modules

## 📊 **File Mapping Structure**

The file mapping now includes both universities and specializations:

```javascript
{
  "batna2": { /* Tronc commun */ },
  "setif": { /* Tronc commun */ },
  "usthb": { /* Tronc commun */ },
  "constantine1": { /* Tronc commun */ },
  "cese": { /* Spécialité */ }
}
```

## 🎯 **User Experience**

### **For Tronc commun Users**
- Same familiar navigation as before
- Universities → Semesters → Modules → Resources
- All existing functionality preserved

### **For Spécialité Users**
- New streamlined path: Specialization → Semester → Module → Resources
- Focused on advanced studies
- Clean, organized structure

## 🔄 **Migration Notes**

### **Backward Compatibility**
- All existing functionality preserved
- Old file mappings still work
- No breaking changes for current users

### **File Organization**
- Existing files remain in current locations
- New files can be added to new structure
- Both systems work simultaneously

## 🚀 **Future Enhancements**

### **Additional Specializations**
- Easy to add new specializations
- Just update `config.js` and run structure script
- No code changes needed

### **More Semesters**
- Can extend beyond semester 6
- Flexible semester numbering
- Dynamic module loading

### **Advanced Features**
- Cross-referencing between paths
- Search functionality
- Advanced filtering

## ✅ **Testing Checklist**

- [ ] Main menu shows both paths
- [ ] Tronc commun navigation works
- [ ] Spécialité navigation works
- [ ] CESE modules display correctly
- [ ] File selection works for both paths
- [ ] Back navigation works properly
- [ ] File mapping generates correctly
- [ ] No errors in console

## 🎉 **Success Criteria**

The new navigation system is successful when:
1. ✅ Users can navigate both Tronc commun and Spécialité
2. ✅ CESE modules display correctly
3. ✅ File access works for both paths
4. ✅ Navigation is intuitive and smooth
5. ✅ No breaking changes to existing functionality
6. ✅ Folder structure is properly organized
7. ✅ File mapping includes both systems

---

**🚀 Ready to implement the new navigation system!**
