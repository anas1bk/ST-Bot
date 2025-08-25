#!/usr/bin/env node

/**
 * Create New Navigation Structure
 * This script creates the folder structure for the new navigation system
 * with Tronc commun and Spécialité paths
 */

const fs = require('fs');
const path = require('path');

// Configuration
const universities = ['batna2', 'setif', 'usthb', 'constantine1'];
const specializations = ['cese'];
const resourceTypes = ['cour', 'td', 'tp', 'interrogation', 'exam', 'control_tp', 'drive', 'book', 'emails'];

// CESE modules for semesters 5 and 6
const ceseModules = {
  'semester_5': [
    'Electrotechnique fondamentale',
    'Théorie de champ',
    'Electronique de puissance',
    'Transfert thermique',
    'Asservissements 1',
    'Logique combinatoire et séquentielle',
    'Méthodes numériques appliqués-Python',
    'Anglais technique'
  ],
  'semester_6': [
    'Conversion d\'énergie',
    'Actionneurs et Capteurs',
    'Introduction aux systèmes embarqués',
    'Asservissement 2',
    'Traitement de signal',
    'Prévisions et décisions statistiques',
    'Programmation en C et réseaux de communication',
    'Entrepreneuriat et management d\'entreprise'
  ]
};

// Function to create directory if it doesn't exist
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating ${dirPath}:`, error.message);
      return false;
    }
  } else {
    console.log(`ℹ️  Already exists: ${dirPath}`);
    return true;
  }
}

// Function to create .gitkeep file
function createGitkeep(dirPath) {
  const gitkeepPath = path.join(dirPath, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    try {
      fs.writeFileSync(gitkeepPath, '');
      console.log(`📄 Added .gitkeep to: ${dirPath}`);
    } catch (error) {
      console.error(`❌ Error creating .gitkeep in ${dirPath}:`, error.message);
    }
  }
}

// Function to create university structure (Tronc commun)
function createUniversityStructure() {
  console.log('\n📚 Creating Tronc commun structure...');
  
  for (const university of universities) {
    console.log(`\n🏫 Creating structure for ${university}...`);
    
    // Create semesters 1-4
    for (let semesterNum = 1; semesterNum <= 4; semesterNum++) {
      const semesterKey = `semester_${semesterNum}`;
      
      for (const resourceType of resourceTypes) {
        const resourcePath = path.join('universities', university, semesterKey, resourceType);
        createDirectory(resourcePath);
        createGitkeep(resourcePath);
      }
    }
  }
}

// Function to create specialization structure (Spécialité)
function createSpecializationStructure() {
  console.log('\n🎯 Creating Spécialité structure...');
  
  // Only create specializations for universities that have them (currently only batna2)
  for (const university of universities) {
    if (university === 'batna2') {
      console.log(`\n⚡ Creating specialization structure for ${university}...`);
      
      for (const specialization of specializations) {
        console.log(`\n⚡ Creating structure for ${specialization} in ${university}...`);
        
        // Create semesters 5-6
        for (let semesterNum = 5; semesterNum <= 6; semesterNum++) {
          const semesterKey = `semester_${semesterNum}`;
          
          for (const resourceType of resourceTypes) {
            const resourcePath = path.join('universities', university, 'specializations', specialization, semesterKey, resourceType);
            createDirectory(resourcePath);
            createGitkeep(resourcePath);
            
            // Create module folders for CESE
            if (ceseModules[semesterKey]) {
              for (const module of ceseModules[semesterKey]) {
                const modulePath = path.join(resourcePath, module);
                createDirectory(modulePath);
                createGitkeep(modulePath);
              }
            }
          }
        }
      }
    }
  }
}

// Main execution
function main() {
  console.log('🚀 Creating new navigation structure...');
  console.log('=====================================');
  
  // Create base directories
  createDirectory('universities');
  
  // Create university structure (Tronc commun)
  createUniversityStructure();
  
  // Create specialization structure (Spécialité)
  createSpecializationStructure();
  
  console.log('\n✅ New navigation structure created successfully!');
  console.log('\n📁 Folder Structure:');
  console.log('├── universities/ (Tronc commun + Spécialité)');
  console.log('│   ├── batna2/');
  console.log('│   │   ├── semester_1-4/ (Tronc commun)');
  console.log('│   │   │   └── cour|td|tp|.../');
  console.log('│   │   └── specializations/');
  console.log('│   │       └── cese/');
  console.log('│   │           └── semester_5-6/');
  console.log('│   │               └── cour|td|tp|.../');
  console.log('│   │                   └── [Module folders]/');
  console.log('│   ├── setif/');
  console.log('│   ├── usthb/');
  console.log('│   └── constantine1/');
  console.log('│       └── semester_1-4/ (Tronc commun only)');
  console.log('│           └── cour|td|tp|.../');
  
  console.log('\n🎯 Next steps:');
  console.log('1. Add files to the appropriate folders');
  console.log('2. Run: node auto_file_detector.js');
  console.log('3. Test the new navigation with /ing command');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createUniversityStructure,
  createSpecializationStructure,
  universities,
  specializations,
  resourceTypes,
  ceseModules
};
