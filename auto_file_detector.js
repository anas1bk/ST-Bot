#!/usr/bin/env node

/**
 * Automatic File Detection System
 * This system automatically detects files and generates mappings without manual config updates
 */

const fs = require('fs');
const path = require('path');

// Resource type mappings
const resourceTypeFolders = {
  'cour': 'cours',
  'td': 'td',
  'tp': 'tp',
  'exam': 'exam',
  'interrogation': 'interrogation',
  'control_tp': 'control_tp'
};

// Semester mapping based on module names
const moduleToSemesterMapping = {
  // Semester 1
  'Analyse 1': 'semester_1',
  'Algèbre 1': 'semester_1',
  'Structure de la matière': 'semester_1',
  'Physique 1': 'semester_1',
  'Probabilités et statistiques': 'semester_1',
  'Informatique 1': 'semester_1',
  'Éthique et déontologie': 'semester_1',
  'Anglais': 'semester_1',
  
  // Semester 2
  'Analyse 2': 'semester_2',
  'Algèbre 2': 'semester_2',
  'Physique 2': 'semester_2',
  'Thermodynamique': 'semester_2',
  'Dessin technique': 'semester_2',
  'Informatique 2': 'semester_2',
  'Les métiers de l\'ingénieur': 'semester_2',
  
  // Semester 3
  'Analyse 3': 'semester_3',
  'Analyse numérique': 'semester_3', // Match the actual folder name
  'Analyse numérique 1': 'semester_3',
  'Ondes et vibrations': 'semester_3',
  'Mécanique des fluides': 'semester_3',
  'Mécanique rationnelle': 'semester_3',
  'Informatique 3': 'semester_3',
  'DAO': 'semester_3',
  'Anglais technique': 'semester_3',
  'MDF': 'semester_3', // Match the actual folder name
  'MR': 'semester_3', // Match the actual folder name
  
  // Semester 4
  'Analyse numérique 2': 'semester_4',
  'Résistance des matériaux': 'semester_4',
  'Electronique fondamentale': 'semester_4',
  'Electricité fondamentale': 'semester_4',
  'Théorie du signal': 'semester_4',
  'Mesure et métrologie': 'semester_4',
  'Informatique 4': 'semester_4',
  'Conception Assistée par Ordinateur': 'semester_4',
  'Techniques d\'expression, d\'information et de communication': 'semester_4'
};

// Function to scan directory and find files
function scanDirectory(dirPath) {
  const files = [];
  
  try {
    if (!fs.existsSync(dirPath)) {
      return files;
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = scanDirectory(fullPath);
        files.push(...subFiles);
      } else if (stat.isFile()) {
        // Only include common document types
        const ext = path.extname(item).toLowerCase();
        if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'].includes(ext)) {
          files.push({
            name: item,
            path: fullPath,
            relativePath: path.relative('.', fullPath)
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return files;
}

// Function to generate automatic file mapping
function generateAutomaticFileMapping() {
  console.log('🔍 Scanning directories for automatic file detection...\n');
  
  const fileMapping = {};
  
  // Scan all resource type directories
  for (const [folderName, resourceType] of Object.entries(resourceTypeFolders)) {
    const folderPath = `./${folderName}`;
    
    if (!fs.existsSync(folderPath)) {
      console.log(`📁 Creating directory: ${folderPath}`);
      try {
        fs.mkdirSync(folderPath, { recursive: true });
      } catch (error) {
        console.error(`Error creating directory ${folderPath}:`, error);
      }
      continue;
    }
    
    const files = scanDirectory(folderPath);
    
    if (files.length === 0) {
      console.log(`📂 No files found in ${folderPath}`);
      continue;
    }
    
    console.log(`📁 Found ${files.length} files in ${folderPath}`);
    
    // Group files by module
    const moduleFiles = {};
    
    files.forEach(file => {
      const dirParts = path.dirname(file.relativePath).split(path.sep);
      const moduleName = dirParts[1]; // cour/ModuleName/file.pdf -> ModuleName
      
      if (!moduleName) return;
      
      if (!moduleFiles[moduleName]) {
        moduleFiles[moduleName] = [];
      }
      
      moduleFiles[moduleName].push(file);
    });
    
    // Map modules to semesters and add to fileMapping
    for (const [moduleName, files] of Object.entries(moduleFiles)) {
      const semesterKey = moduleToSemesterMapping[moduleName];
      
      if (!semesterKey) {
        console.log(`⚠️  Warning: Module "${moduleName}" not found in semester mapping`);
        continue;
      }
      
      if (!fileMapping[semesterKey]) {
        fileMapping[semesterKey] = {};
      }
      
      if (!fileMapping[semesterKey][moduleName]) {
        fileMapping[semesterKey][moduleName] = {};
      }
      
      fileMapping[semesterKey][moduleName][resourceType] = files.map(file => ({
        name: file.name,
        path: file.path.replace(/\\/g, '/'), // Normalize path separators
        description: file.name.replace(/\.[^/.]+$/, '') // Remove file extension for description
      }));
      
      console.log(`✅ Mapped ${files.length} ${resourceType} files for ${moduleName} (${semesterKey})`);
    }
  }
  
  return fileMapping;
}

// Function to save file mapping to a JSON file
function saveFileMapping(fileMapping) {
  try {
    const mappingPath = './auto_file_mapping.json';
    fs.writeFileSync(mappingPath, JSON.stringify(fileMapping, null, 2));
    console.log(`💾 File mapping saved to ${mappingPath}`);
    return mappingPath;
  } catch (error) {
    console.error('Error saving file mapping:', error);
    return null;
  }
}

// Function to load file mapping from JSON file
function loadFileMapping() {
  try {
    const mappingPath = './auto_file_mapping.json';
    if (fs.existsSync(mappingPath)) {
      const data = fs.readFileSync(mappingPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading file mapping:', error);
  }
  return {};
}

// Main execution
if (require.main === module) {
  const fileMapping = generateAutomaticFileMapping();
  
  if (Object.keys(fileMapping).length === 0) {
    console.log('\n❌ No files found or no valid mappings generated');
    process.exit(1);
  }
  
  console.log('\n📊 Generated file mapping summary:');
  console.log('==================================');
  
  for (const [semesterKey, modules] of Object.entries(fileMapping)) {
    console.log(`\n${semesterKey}:`);
    for (const [moduleName, resources] of Object.entries(modules)) {
      console.log(`  ${moduleName}:`);
      for (const [resourceType, files] of Object.entries(resources)) {
        console.log(`    ${resourceType}: ${files.length} files`);
      }
    }
  }
  
  const savedPath = saveFileMapping(fileMapping);
  
  if (savedPath) {
    console.log('\n✅ Automatic file detection completed successfully!');
    console.log('🔄 The bot will now use this automatic mapping');
  } else {
    console.log('\n❌ Failed to save file mapping');
  }
}

module.exports = {
  generateAutomaticFileMapping,
  loadFileMapping,
  saveFileMapping,
  moduleToSemesterMapping
};
