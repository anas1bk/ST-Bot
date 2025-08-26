#!/usr/bin/env node

/**
 * Create folder structure for new colleges
 * ENPA, ENPO, ENPC, ENSERDD
 */

const fs = require('fs');
const path = require('path');

// New colleges to add
const newColleges = ['enpa', 'enpo', 'enpc', 'enserdd'];

// Semesters (1-4 for Tronc commun)
const semesters = ['semester_1', 'semester_2', 'semester_3', 'semester_4'];

// Resource type folders
const resourceTypes = [
  'cour',
  'td', 
  'tp',
  'interrogation',
  'exam',
  'control_tp',
  'drive',
  'book',
  'emails'
];

// Modules for each semester (same as other colleges)
const modules = {
  'semester_1': [
    'Analyse 1',
    'Algèbre 1',
    'Structure de la matière',
    'Physique 1',
    'Probabilités et statistiques',
    'Informatique 1',
    'Éthique et déontologie',
    'Anglais'
  ],
  'semester_2': [
    'Analyse 2',
    'Algèbre 2',
    'Physique 2',
    'Thermodynamique',
    'Dessin technique',
    'Informatique 2',
    'Anglais',
    'Les métiers de l\'ingénieur'
  ],
  'semester_3': [
    'Analyse 3',
    'Analyse numérique 1',
    'Ondes et vibrations',
    'Mécanique des fluides',
    'Mécanique rationnelle',
    'Informatique 3',
    'DAO',
    'Anglais technique'
  ],
  'semester_4': [
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
};

console.log('🏗️ Creating folder structure for new colleges...\n');

let totalFoldersCreated = 0;
let totalGitkeepFilesCreated = 0;

// Create folders for each new college
for (const college of newColleges) {
  console.log(`🏫 Creating structure for ${college.toUpperCase()}...`);
  
  // Create college base folder
  const collegeBasePath = `./universities/${college}`;
  if (!fs.existsSync(collegeBasePath)) {
    fs.mkdirSync(collegeBasePath, { recursive: true });
    totalFoldersCreated++;
    console.log(`  📁 Created: ${collegeBasePath}`);
  }
  
  // Create semester folders
  for (const semester of semesters) {
    const semesterPath = `${collegeBasePath}/${semester}`;
    if (!fs.existsSync(semesterPath)) {
      fs.mkdirSync(semesterPath, { recursive: true });
      totalFoldersCreated++;
      console.log(`    📁 Created: ${semesterPath}`);
    }
    
    // Create resource type folders
    for (const resourceType of resourceTypes) {
      const resourcePath = `${semesterPath}/${resourceType}`;
      if (!fs.existsSync(resourcePath)) {
        fs.mkdirSync(resourcePath, { recursive: true });
        totalFoldersCreated++;
        console.log(`      📁 Created: ${resourcePath}`);
      }
      
      // Create module subfolders
      const semesterModules = modules[semester];
      for (const module of semesterModules) {
        const modulePath = `${resourcePath}/${module}`;
        if (!fs.existsSync(modulePath)) {
          fs.mkdirSync(modulePath, { recursive: true });
          totalFoldersCreated++;
          console.log(`        📁 Created: ${modulePath}`);
          
          // Add .gitkeep file to make the folder visible in Git
          const gitkeepPath = `${modulePath}/.gitkeep`;
          if (!fs.existsSync(gitkeepPath)) {
            fs.writeFileSync(gitkeepPath, '');
            totalGitkeepFilesCreated++;
            console.log(`          📄 Added: ${gitkeepPath}`);
          }
        }
      }
    }
  }
  
  console.log(`  ✅ Completed ${college.toUpperCase()}\n`);
}

console.log('🎉 Folder structure creation completed!');
console.log(`📊 Summary:`);
console.log(`   • Total folders created: ${totalFoldersCreated}`);
console.log(`   • Total .gitkeep files created: ${totalGitkeepFilesCreated}`);
console.log(`   • Colleges processed: ${newColleges.length}`);
console.log(`\n📁 Structure created:`);
console.log(`   universities/`);
for (const college of newColleges) {
  console.log(`   ├── ${college}/`);
  console.log(`   │   ├── semester_1/`);
  console.log(`   │   │   ├── cour/`);
  console.log(`   │   │   │   ├── Analyse 1/`);
  console.log(`   │   │   │   ├── Algèbre 1/`);
  console.log(`   │   │   │   └── ... (other modules)`);
  console.log(`   │   │   ├── td/`);
  console.log(`   │   │   ├── tp/`);
  console.log(`   │   │   └── ... (other resource types)`);
  console.log(`   │   ├── semester_2/`);
  console.log(`   │   ├── semester_3/`);
  console.log(`   │   └── semester_4/`);
  console.log(`   │`);
}
console.log(`\n✅ Ready for file uploads!`);
