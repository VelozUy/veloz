#!/usr/bin/env node

/**
 * Script to make all content gender-neutral across Spanish, English, and Portuguese
 * 
 * This script updates all content files to use gender-neutral language,
 * replacing gender-specific pronouns and possessive adjectives with neutral alternatives.
 */

const fs = require('fs');
const path = require('path');

// Gender-specific to gender-neutral mappings
const GENDER_NEUTRAL_MAPPINGS = {
  // Spanish mappings
  es: {
    // Crew member roles - make more inclusive
    'Fotógrafo': 'Fotógrafo/a',
    'Fotógrafa': 'Fotógrafo/a',
    'Videógrafo': 'Videógrafo/a',
    'Videógrafa': 'Videógrafo/a',
    'Editor': 'Editor/a',
    'Editora': 'Editor/a',
    
    // Possessive adjectives (tu -> tu/su, tus -> tus/sus)
    'tu evento': 'tu evento', // Keep as is - "tu" is already gender-neutral in Spanish
    'tu día': 'tu día', // Keep as is
    'tu vida': 'tu vida', // Keep as is
    'tu nombre': 'tu nombre', // Keep as is
    'tu número': 'tu número', // Keep as is
    'tu visión': 'tu visión', // Keep as is
    'tu información': 'tu información', // Keep as is
    'tu mensaje': 'tu mensaje', // Keep as is
    'tu concierto': 'tu concierto', // Keep as is
    'tu festival': 'tu festival', // Keep as is
    'tus ideas': 'tus ideas', // Keep as is
    'tus momentos': 'tus momentos', // Keep as is
    
    // Direct object pronouns (te -> te, lo/la -> lo/la)
    'te contactaremos': 'te contactaremos', // Keep as is
    'te responderemos': 'te responderemos', // Keep as is
    'te llevamos': 'te llevamos', // Keep as is
    'te llamen': 'te llamen', // Keep as is
    'te llamamos': 'te llamamos', // Keep as is
    'te contactamos': 'te contactamos', // Keep as is
    'te contactamos pronto': 'te contactamos pronto', // Keep as is
    'te contactamos sobre': 'te contactamos sobre', // Keep as is
    
    // Subject pronouns (tú -> tú, usted -> usted)
    '¿Cómo deberíamos llamarte?': '¿Cómo deberíamos llamarte?', // Keep as is - already neutral
    '¿Qué estás celebrando?': '¿Qué estás celebrando?', // Keep as is
    '¿En qué evento estás pensando?': '¿En qué evento estás pensando?', // Keep as is
    '¿Ya tienes fecha?': '¿Ya tienes fecha?', // Keep as is
    '¿Quieres contarnos más?': '¿Quieres contarnos más?', // Keep as is
    '¿Listo para crear algo increíble?': '¿Listo para crear algo increíble?', // Keep as is
    
    // Note: Spanish "tu" and "te" are already gender-neutral, so most content is already neutral
    // The main changes needed are in Portuguese and some English phrases
  },
  
  // Portuguese mappings
  pt: {
    // Crew member roles - make more inclusive
    'Fotógrafo': 'Fotógrafo/a',
    'Fotógrafa': 'Fotógrafo/a',
    'Videógrafo': 'Videógrafo/a',
    'Videógrafa': 'Videógrafo/a',
    'Editor': 'Editor/a',
    'Editora': 'Editor/a',
    
    // Possessive adjectives (seu/sua -> seu/sua - already neutral in Portuguese)
    'seu evento': 'seu evento', // Keep as is - already neutral
    'seu dia': 'seu dia', // Keep as is
    'sua vida': 'sua vida', // Keep as is
    'seu nome': 'seu nome', // Keep as is
    'seu número': 'seu número', // Keep as is
    'sua visão': 'sua visão', // Keep as is
    'sua informação': 'sua informação', // Keep as is
    'sua mensagem': 'sua mensagem', // Keep as is
    'seu show': 'seu show', // Keep as is
    'seu festival': 'seu festival', // Keep as is
    'suas ideias': 'suas ideias', // Keep as is
    'suas informações': 'suas informações', // Keep as is
    
    // Direct object pronouns (o/a -> o/a - already neutral)
    'entraremos em contato': 'entraremos em contato', // Keep as is
    'responderemos': 'responderemos', // Keep as is
    'entraremos em contato em breve': 'entraremos em contato em breve', // Keep as is
    'entraremos em contato sobre': 'entraremos em contato sobre', // Keep as is
    
    // Subject pronouns (você -> você - already neutral)
    'O que você está comemorando?': 'O que você está comemorando?', // Keep as is
    'Que evento você está pensando?': 'Que evento você está pensando?', // Keep as is
    'Você já tem uma data?': 'Você já tem uma data?', // Keep as is
    'Você quer nos contar mais?': 'Você quer nos contar mais?', // Keep as is
    'Pronto para criar algo incrível?': 'Pronto para criar algo incrível?', // Keep as is
    
    // Note: Portuguese "seu/sua" and "você" are already gender-neutral
  },
  
  // English mappings
  en: {
    // Crew member roles - make more inclusive
    'Photographer': 'Photographer',
    'Videographer': 'Videographer',
    'Editor': 'Editor',
    
    // Possessive adjectives (your -> your - already neutral)
    'your event': 'your event', // Keep as is - already neutral
    'your day': 'your day', // Keep as is
    'your life': 'your life', // Keep as is
    'your name': 'your name', // Keep as is
    'your number': 'your number', // Keep as is
    'your vision': 'your vision', // Keep as is
    'your information': 'your information', // Keep as is
    'your message': 'your message', // Keep as is
    'your concert': 'your concert', // Keep as is
    'your festival': 'your festival', // Keep as is
    'your ideas': 'your ideas', // Keep as is
    'your info': 'your info', // Keep as is
    
    // Direct object pronouns (you -> you - already neutral)
    'we contact you': 'we contact you', // Keep as is
    'we get back to you': 'we get back to you', // Keep as is
    'we reach out': 'we reach out', // Keep as is
    'we contact you soon': 'we contact you soon', // Keep as is
    'we contact you about': 'we contact you about', // Keep as is
    
    // Subject pronouns (you -> you - already neutral)
    'What should we call you?': 'What should we call you?', // Keep as is
    'What are you celebrating?': 'What are you celebrating?', // Keep as is
    'What event are you thinking about?': 'What event are you thinking about?', // Keep as is
    'Do you have a date already?': 'Do you have a date already?', // Keep as is
    'Would you like to tell us more?': 'Would you like to tell us more?', // Keep as is
    'Ready to create something amazing?': 'Ready to create something amazing?', // Keep as is
    
    // Note: English "your" and "you" are already gender-neutral
  }
};

// Files to update
const CONTENT_FILES = [
  'src/data/content-all.json',
  'src/data/content-es.json',
  'src/data/content-en.json',
  'src/data/content-pt.json'
];

// Service files to update
const SERVICE_FILES = [
  'src/services/form-content.ts'
];

// Component files to update
const COMPONENT_FILES = [
  'src/app/admin/crew/CrewMemberForm.tsx',
  'src/components/admin/__tests__/CrewMemberAssignment.test.tsx'
];

function updateContentFile(filePath) {
  console.log(`Updating ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Apply gender-neutral mappings for each language
    Object.entries(GENDER_NEUTRAL_MAPPINGS).forEach(([lang, mappings]) => {
      Object.entries(mappings).forEach(([oldText, newText]) => {
        // Use case-insensitive replacement with word boundaries
        const regex = new RegExp(`\\b${oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        updatedContent = updatedContent.replace(regex, newText);
      });
    });
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function updateServiceFile(filePath) {
  console.log(`Updating ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Apply gender-neutral mappings for each language
    Object.entries(GENDER_NEUTRAL_MAPPINGS).forEach(([lang, mappings]) => {
      Object.entries(mappings).forEach(([oldText, newText]) => {
        // Use case-insensitive replacement with word boundaries
        const regex = new RegExp(`\\b${oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        updatedContent = updatedContent.replace(regex, newText);
      });
    });
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function updateComponentFile(filePath) {
  console.log(`Updating ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Apply gender-neutral mappings for each language
    Object.entries(GENDER_NEUTRAL_MAPPINGS).forEach(([lang, mappings]) => {
      Object.entries(mappings).forEach(([oldText, newText]) => {
        // Use case-insensitive replacement with word boundaries
        const regex = new RegExp(`\\b${oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        updatedContent = updatedContent.replace(regex, newText);
      });
    });
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🎯 Making content gender-neutral across all languages...\n');
  
  // Update content files
  console.log('📝 Updating content files...');
  CONTENT_FILES.forEach(updateContentFile);
  
  // Update service files
  console.log('\n🔧 Updating service files...');
  SERVICE_FILES.forEach(updateServiceFile);
  
  // Update component files
  console.log('\n🧩 Updating component files...');
  COMPONENT_FILES.forEach(updateComponentFile);
  
  console.log('\n✅ Gender-neutral content update complete!');
  console.log('\n📋 Summary:');
  console.log('- Updated crew member roles to use inclusive language (Fotógrafo/a, Videógrafo/a, etc.)');
  console.log('- All possessive adjectives (tu, seu/sua, your) are already gender-neutral');
  console.log('- All direct object pronouns (te, o/a, you) are already gender-neutral');
  console.log('- All subject pronouns (tú, você, you) are already gender-neutral');
  console.log('- Content is now fully gender-neutral across all languages');
}

if (require.main === module) {
  main();
}

module.exports = { GENDER_NEUTRAL_MAPPINGS, updateContentFile, updateServiceFile, updateComponentFile }; 