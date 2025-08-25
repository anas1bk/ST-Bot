#!/usr/bin/env node

/**
 * Automatic File Detection System for Multi-University Structure
 * This system automatically detects files and generates mappings for multiple universities
 */

const fs = require('fs');
const path = require('path');

// Universities configuration (Tronc commun)
const universities = ['batna2', 'setif', 'usthb', 'constantine1'];

// Specializations configuration
const specializations = ['cese'];

// Resource type folders (matching the new structure)
const resourceTypeFolders = [
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
        // Only include common document types and exclude .gitkeep files
        const ext = path.extname(item).toLowerCase();
        if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'].includes(ext) && item !== '.gitkeep') {
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

// Function to generate automatic file mapping for multi-university structure
function generateAutomaticFileMapping() {
  console.log('🔍 Scanning multi-university and specialization directories for automatic file detection...\n');
  
  const fileMapping = {};
  
  // Scan each university (Tronc commun)
  console.log('📚 Scanning Tronc commun universities...');
  for (const university of universities) {
    console.log(`🏫 Scanning ${university}...`);
    
    if (!fileMapping[university]) {
      fileMapping[university] = {};
    }
    
    // Scan each semester
    for (let semesterNum = 1; semesterNum <= 4; semesterNum++) {
      const semesterKey = `semester_${semesterNum}`;
      
      if (!fileMapping[university][semesterKey]) {
        fileMapping[university][semesterKey] = {};
      }
      
      // Scan each resource type
      for (const resourceType of resourceTypeFolders) {
        const folderPath = `./universities/${university}/${semesterKey}/${resourceType}`;
        
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
        
        // Group files by module (folder name or direct files)
        const moduleFiles = {};
        
        files.forEach(file => {
          const dirParts = path.dirname(file.relativePath).split(path.sep);
          // universities/batna2/semester_1/cour/ModuleName/file.pdf -> ModuleName
          // OR universities/batna2/semester_1/cour/file.pdf -> direct file
          
          let moduleName;
          if (dirParts.length >= 5) {
            // File is in a module folder: universities/batna2/semester_1/cour/ModuleName/file.pdf
            moduleName = dirParts[4]; // Index 4 for ModuleName
          } else if (dirParts.length >= 4) {
            // File is directly in resource folder: universities/batna2/semester_1/cour/file.pdf
            // We'll use the resource type as the module name for direct files
            moduleName = resourceType;
          }
          
          if (!moduleName) return;
          
          if (!moduleFiles[moduleName]) {
            moduleFiles[moduleName] = [];
          }
          
          moduleFiles[moduleName].push(file);
        });
        
        // Add module files to fileMapping
        for (const [moduleName, files] of Object.entries(moduleFiles)) {
          if (!fileMapping[university][semesterKey][moduleName]) {
            fileMapping[university][semesterKey][moduleName] = {};
          }
          
          fileMapping[university][semesterKey][moduleName][resourceType] = files.map(file => ({
            name: file.name,
            path: file.path.replace(/\\/g, '/'), // Normalize path separators
            description: file.name.replace(/\.[^/.]+$/, '') // Remove file extension for description
          }));
          
          console.log(`✅ Mapped ${files.length} ${resourceType} files for ${moduleName} (${university} - ${semesterKey})`);
        }
      }
    }
  }
  
  // Scan each specialization
  console.log('\n🎯 Scanning specializations...');
  for (const specialization of specializations) {
    console.log(`⚡ Scanning ${specialization}...`);
    
    if (!fileMapping[specialization]) {
      fileMapping[specialization] = {};
    }
    
    // Scan each semester (5 and 6 for specializations)
    for (let semesterNum = 5; semesterNum <= 6; semesterNum++) {
      const semesterKey = `semester_${semesterNum}`;
      
      if (!fileMapping[specialization][semesterKey]) {
        fileMapping[specialization][semesterKey] = {};
      }
      
      // Scan each resource type
      for (const resourceType of resourceTypeFolders) {
        const folderPath = `./specializations/${specialization}/${semesterKey}/${resourceType}`;
        
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
        
        // Group files by module (folder name or direct files)
        const moduleFiles = {};
        
        files.forEach(file => {
          const dirParts = path.dirname(file.relativePath).split(path.sep);
          // specializations/cese/semester_5/cour/ModuleName/file.pdf -> ModuleName
          // OR specializations/cese/semester_5/cour/file.pdf -> direct file
          
          let moduleName;
          if (dirParts.length >= 5) {
            // File is in a module folder: specializations/cese/semester_5/cour/ModuleName/file.pdf
            moduleName = dirParts[4]; // Index 4 for ModuleName
          } else if (dirParts.length >= 4) {
            // File is directly in resource folder: specializations/cese/semester_5/cour/file.pdf
            // We'll use the resource type as the module name for direct files
            moduleName = resourceType;
          }
          
          if (!moduleName) return;
          
          if (!moduleFiles[moduleName]) {
            moduleFiles[moduleName] = [];
          }
          
          moduleFiles[moduleName].push(file);
        });
        
        // Add module files to fileMapping
        for (const [moduleName, files] of Object.entries(moduleFiles)) {
          if (!fileMapping[specialization][semesterKey][moduleName]) {
            fileMapping[specialization][semesterKey][moduleName] = {};
          }
          
          fileMapping[specialization][semesterKey][moduleName][resourceType] = files.map(file => ({
            name: file.name,
            path: file.path.replace(/\\/g, '/'), // Normalize path separators
            description: file.name.replace(/\.[^/.]+$/, '') // Remove file extension for description
          }));
          
          console.log(`✅ Mapped ${files.length} ${resourceType} files for ${moduleName} (${specialization} - ${semesterKey})`);
        }
      }
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
  
  console.log('\n📊 Generated multi-university and specialization file mapping summary:');
  console.log('=====================================================================');
  
  for (const [entity, semesters] of Object.entries(fileMapping)) {
    const isSpecialization = specializations.includes(entity);
    const icon = isSpecialization ? '⚡' : '🏫';
    const type = isSpecialization ? 'Specialization' : 'University';
    
    console.log(`\n${icon} ${entity} (${type}):`);
    for (const [semesterKey, modules] of Object.entries(semesters)) {
      console.log(`  📚 ${semesterKey}:`);
      for (const [moduleName, resources] of Object.entries(modules)) {
        console.log(`    📖 ${moduleName}:`);
        for (const [resourceType, files] of Object.entries(resources)) {
          console.log(`      📁 ${resourceType}: ${files.length} files`);
        }
      }
    }
  }
  
  const savedPath = saveFileMapping(fileMapping);
  
  if (savedPath) {
    console.log('\n✅ Multi-university automatic file detection completed successfully!');
    console.log('🔄 The bot will now use this automatic mapping');
  } else {
    console.log('\n❌ Failed to save file mapping');
  }
}

module.exports = {
  generateAutomaticFileMapping,
  loadFileMapping,
  saveFileMapping,
  universities,
  resourceTypeFolders
};
