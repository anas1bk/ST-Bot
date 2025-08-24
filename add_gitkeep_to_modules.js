#!/usr/bin/env node

/**
 * Add .gitkeep files to all module folders
 * This ensures empty folders are tracked by Git
 */

const fs = require('fs');
const path = require('path');

// Import university data from config
const { universitiesData } = require('./config');

// Resource type folders
const resourceTypeFolders = [
  'cour', 'td', 'tp', 'interrogation', 'exam', 
  'control_tp', 'drive', 'book', 'emails'
];

console.log('📁 Adding .gitkeep files to all module folders...\n');

let added = 0;
let alreadyExists = 0;

// Process each university
for (const [universityKey, universityData] of Object.entries(universitiesData)) {
  console.log(`🏫 ${universityData.name}...`);
  
  // Process each semester
  for (const [semesterKey, semesterData] of Object.entries(universityData.semesters)) {
    // Process each resource type
    for (const resourceType of resourceTypeFolders) {
      // Process each module
      for (const moduleName of semesterData.modules) {
        const moduleFolderPath = path.join(
          'universities',
          universityKey,
          semesterKey,
          resourceType,
          moduleName
        );
        
        const gitkeepPath = path.join(moduleFolderPath, '.gitkeep');
        
        try {
          if (!fs.existsSync(gitkeepPath)) {
            fs.writeFileSync(gitkeepPath, '# This file ensures the module folder is tracked by Git\n');
            added++;
          } else {
            alreadyExists++;
          }
        } catch (error) {
          console.error(`Error adding .gitkeep to ${moduleFolderPath}:`, error.message);
        }
      }
    }
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Added .gitkeep files: ${added}`);
console.log(`ℹ️  Already existed: ${alreadyExists}`);
console.log(`📂 Total module folders: ${added + alreadyExists}`);

console.log('\n🎉 All module folders now tracked by Git!');
console.log('💡 Next: git add . && git commit -m "Add .gitkeep files to module folders" && git push origin main');
