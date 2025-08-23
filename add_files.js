#!/usr/bin/env node

/**
 * File Addition Helper Script
 * This script helps you easily add new files to the bot's file mapping system
 */

const fs = require('fs');
const path = require('path');

// Function to scan directory and find files
function scanDirectory(dirPath) {
  const files = [];
  
  try {
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

// Function to generate file mapping code
function generateFileMapping(files) {
  console.log('\n📁 Found files:');
  console.log('================');
  
  const fileGroups = {};
  
  files.forEach(file => {
    const dirParts = path.dirname(file.relativePath).split(path.sep);
    const semester = dirParts[0]; // cour or td
    const module = dirParts[1]; // module name
    
    if (!fileGroups[semester]) {
      fileGroups[semester] = {};
    }
    if (!fileGroups[semester][module]) {
      fileGroups[semester][module] = [];
    }
    
    fileGroups[semester][module].push(file);
  });
  
  // Generate mapping code
  let mappingCode = '// Auto-generated file mapping\nconst fileMapping = {\n';
  
  // Process cour directory
  if (fileGroups['cour']) {
    mappingCode += '  // Course files\n';
    Object.keys(fileGroups['cour']).forEach(module => {
      const moduleFiles = fileGroups['cour'][module];
      mappingCode += `  '${module}': {\n`;
      mappingCode += `    'cours': [\n`;
      
      moduleFiles.forEach(file => {
        mappingCode += `      {\n`;
        mappingCode += `        name: '${file.name}',\n`;
        mappingCode += `        path: './${file.relativePath.replace(/\\/g, '/')}',\n`;
        mappingCode += `        description: '${file.name.replace(/\.[^/.]+$/, '')}'\n`;
        mappingCode += `      },\n`;
      });
      
      mappingCode += `    ]\n`;
      mappingCode += `  },\n`;
    });
  }
  
  // Process td directory
  if (fileGroups['td']) {
    mappingCode += '  // TD files\n';
    Object.keys(fileGroups['td']).forEach(module => {
      const moduleFiles = fileGroups['td'][module];
      mappingCode += `  '${module}': {\n`;
      mappingCode += `    'td': [\n`;
      
      moduleFiles.forEach(file => {
        mappingCode += `      {\n`;
        mappingCode += `        name: '${file.name}',\n`;
        mappingCode += `        path: './${file.relativePath.replace(/\\/g, '/')}',\n`;
        mappingCode += `        description: '${file.name.replace(/\.[^/.]+$/, '')}'\n`;
        mappingCode += `      },\n`;
      });
      
      mappingCode += `    ]\n`;
      mappingCode += `  },\n`;
    });
  }
  
  mappingCode += '};\n';
  
  return mappingCode;
}

// Main execution
console.log('🔍 Scanning directories for files...\n');

const courFiles = scanDirectory('./cour');
const tdFiles = scanDirectory('./td');

const allFiles = [...courFiles, ...tdFiles];

if (allFiles.length === 0) {
  console.log('❌ No files found in cour/ and td/ directories');
  process.exit(1);
}

const mappingCode = generateFileMapping(allFiles);

console.log('\n📝 Generated file mapping code:');
console.log('==============================');
console.log(mappingCode);

console.log('\n💡 Instructions:');
console.log('1. Copy the generated code above');
console.log('2. Open config.js');
console.log('3. Replace or update the fileMapping object with this code');
console.log('4. Make sure to map the modules to the correct semester keys');
console.log('5. Test the bot to ensure files are accessible');

console.log('\n📋 Example semester mapping:');
console.log('To map files to semester 3, use:');
console.log("'semester_3': {");
console.log("  'Analyse 3': { /* your files here */ },");
console.log("  'Analyse numérique 1': { /* your files here */ }");
console.log("}");

console.log('\n✅ Done!');
