/**
 * @file audit-checklist.js
 * @description AutoList Canada launch readiness audit checklist
 * 
 * This script performs a comprehensive audit of the AutoList Canada platform
 * to ensure 100% compliance with all acceptance criteria before PR creation.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

// Configuration
const config = {
  requiredPages: [
    'index.html',
    'dashboard.html',
    'listings.html',
    'templates.html',
    'import.html',
    'analytics.html',
    'ai-tools.html',
    'how-it-works.html',
    'faq.html',
    'settings.html',
    'terms.html',
    'privacy.html'
  ],
  legalFiles: {
    'terms.html': '', // Add SHA256 hash for verification
    'privacy.html': '' // Add SHA256 hash for verification
  },
  i18nFiles: [
    'i18n/en.json',
    'i18n/fr.json'
  ],
  extensionRequiredFiles: [
    'extension/manifest.json',
    'extension/popup.html',
    'extension/popup.js',
    'extension/content.js',
    'extension/background.js',
    'extension/icons/icon16.png',
    'extension/icons/icon48.png',
    'extension/icons/icon128.png'
  ],
  deploymentConfigs: [
    'vercel.json',
    'netlify.toml'
  ],
  serviceScripts: [
    'scripts/services/marketplace-service.js',
    'scripts/services/services-loader.js',
    'scripts/services/ebay-service.js',
    'scripts/services/amazon-service.js',
    'scripts/services/etsy-service.js'
  ]
};

// Results object to store all audit findings
const auditResults = {
  allPagesPresent: false,
  i18nImplementation: false,
  serviceLayer: false,
  extensionComplete: false,
  legalFilesIntegrity: false,
  deploymentConfig: false,
  readyForPR: false,
  details: {
    missingFiles: [],
    i18nIssues: [],
    extensionIssues: [],
    deploymentIssues: [],
    serviceIssues: []
  }
};

/**
 * Calculate SHA256 hash of a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} SHA256 hash
 */
async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Check if required pages exist
 */
async function checkRequiredPages() {
  console.log('🔍 Checking required pages...');
  
  const missingPages = [];
  
  for (const page of config.requiredPages) {
    if (!fs.existsSync(page)) {
      missingPages.push(page);
    }
  }
  
  auditResults.allPagesPresent = missingPages.length === 0;
  
  if (missingPages.length > 0) {
    auditResults.details.missingFiles.push(...missingPages);
    console.log(`❌ Missing ${missingPages.length} required pages`);
    missingPages.forEach(page => console.log(`   - ${page}`));
  } else {
    console.log('✅ All required pages present');
  }
}

/**
 * Verify i18n implementation
 */
async function verifyI18nImplementation() {
  console.log('\n🌐 Verifying i18n implementation...');
  
  const i18nIssues = [];
  let allFilesExist = true;
  
  // Check if i18n files exist
  for (const file of config.i18nFiles) {
    if (!fs.existsSync(file)) {
      i18nIssues.push(`Missing i18n file: ${file}`);
      allFilesExist = false;
    }
  }
  
  // If files don't exist, can't check further
  if (!allFilesExist) {
    auditResults.i18nImplementation = false;
    auditResults.details.i18nIssues = i18nIssues;
    console.log('❌ i18n implementation incomplete');
    i18nIssues.forEach(issue => console.log(`   - ${issue}`));
    return;
  }
  
  // Check for language toggle in HTML files
  let toggleCount = 0;
  const htmlPages = config.requiredPages.filter(page => page.endsWith('.html') && !page.includes('terms') && !page.includes('privacy'));
  
  for (const page of htmlPages) {
    try {
      const content = fs.readFileSync(page, 'utf8');
      
      // Check for language toggle button
      if (content.includes('languageToggle') || 
          content.includes('data-i18n') ||
          content.includes('changeLanguage')) {
        toggleCount++;
      }
    } catch (error) {
      i18nIssues.push(`Error reading ${page}: ${error.message}`);
    }
  }
  
  // Check i18n JSON files for required keys
  try {
    const enContent = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'));
    const frContent = JSON.parse(fs.readFileSync('i18n/fr.json', 'utf8'));
    
    // Check if both files have same structure
    const enKeys = Object.keys(enContent);
    const frKeys = Object.keys(frContent);
    
    const missingInFr = enKeys.filter(key => !frKeys.includes(key));
    const missingInEn = frKeys.filter(key => !enKeys.includes(key));
    
    if (missingInFr.length > 0) {
      i18nIssues.push(`French translations missing keys: ${missingInFr.join(', ')}`);
    }
    
    if (missingInEn.length > 0) {
      i18nIssues.push(`English translations missing keys: ${missingInEn.join(', ')}`);
    }
    
  } catch (error) {
    i18nIssues.push(`Error parsing i18n files: ${error.message}`);
  }
  
  auditResults.i18nImplementation = (toggleCount === htmlPages.length) && (i18nIssues.length === 0);
  auditResults.details.i18nIssues = i18nIssues;
  
  if (!auditResults.i18nImplementation) {
    console.log('❌ i18n implementation incomplete');
    console.log(`   - Language toggle found in ${toggleCount}/${htmlPages.length} HTML files`);
    i18nIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ i18n implementation complete');
  }
}

/**
 * Check service layer implementation
 */
async function checkServiceLayer() {
  console.log('\n🔄 Checking service layer implementation...');
  
  const serviceIssues = [];
  
  for (const script of config.serviceScripts) {
    if (!fs.existsSync(script)) {
      serviceIssues.push(`Missing service script: ${script}`);
    }
  }
  
  // Check marketplace service integration in settings.html
  try {
    const settingsContent = fs.readFileSync('settings.html', 'utf8');
    
    if (!settingsContent.includes('marketplace-service.js') || 
        !settingsContent.includes('ebay-service.js') ||
        !settingsContent.includes('amazon-service.js') ||
        !settingsContent.includes('etsy-service.js')) {
      serviceIssues.push('Marketplace services not properly integrated in settings.html');
    }
  } catch (error) {
    serviceIssues.push(`Error checking service integration: ${error.message}`);
  }
  
  auditResults.serviceLayer = serviceIssues.length === 0;
  auditResults.details.serviceIssues = serviceIssues;
  
  if (!auditResults.serviceLayer) {
    console.log('❌ Service layer implementation incomplete');
    serviceIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ Service layer implementation complete');
  }
}

/**
 * Verify Chrome extension
 */
async function verifyExtension() {
  console.log('\n🧩 Verifying Chrome extension...');
  
  const extensionIssues = [];
  
  // Check if extension files exist
  for (const file of config.extensionRequiredFiles) {
    if (!fs.existsSync(file)) {
      extensionIssues.push(`Missing extension file: ${file}`);
    } else if (file.endsWith('.png')) {
      // Check if icon files have content (not 0 bytes)
      const stats = fs.statSync(file);
      if (stats.size === 0) {
        extensionIssues.push(`Empty icon file: ${file}`);
      }
    }
  }
  
  // Check manifest.json structure
  try {
    const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
    
    // Check required manifest fields
    const requiredFields = ['name', 'version', 'manifest_version', 'action', 'permissions', 'content_scripts', 'background'];
    
    for (const field of requiredFields) {
      if (!manifest[field]) {
        extensionIssues.push(`Missing field in manifest.json: ${field}`);
      }
    }
    
    // Verify manifest version is 3
    if (manifest.manifest_version !== 3) {
      extensionIssues.push(`Manifest version should be 3, found: ${manifest.manifest_version}`);
    }
  } catch (error) {
    extensionIssues.push(`Error parsing manifest.json: ${error.message}`);
  }
  
  auditResults.extensionComplete = extensionIssues.length === 0;
  auditResults.details.extensionIssues = extensionIssues;
  
  if (!auditResults.extensionComplete) {
    console.log('❌ Chrome extension implementation incomplete');
    extensionIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ Chrome extension implementation complete');
  }
}

/**
 * Verify legal files
 */
async function verifyLegalFiles() {
  console.log('\n📜 Verifying legal files...');
  
  // Check if legal files exist
  const legalIssues = [];
  
  for (const [file, expectedHash] of Object.entries(config.legalFiles)) {
    if (!fs.existsSync(file)) {
      legalIssues.push(`Missing legal file: ${file}`);
      continue;
    }
    
    // Calculate hash if expected hash is provided
    if (expectedHash) {
      try {
        const actualHash = await calculateFileHash(file);
        
        if (actualHash !== expectedHash) {
          legalIssues.push(`Legal file ${file} has been modified from approved version`);
        }
      } catch (error) {
        legalIssues.push(`Error calculating hash for ${file}: ${error.message}`);
      }
    } else {
      // If no hash provided, just calculate and display it
      try {
        const hash = await calculateFileHash(file);
        console.log(`   Hash for ${file}: ${hash}`);
      } catch (error) {
        legalIssues.push(`Error calculating hash for ${file}: ${error.message}`);
      }
    }
  }
  
  auditResults.legalFilesIntegrity = legalIssues.length === 0;
  
  if (legalIssues.length > 0) {
    console.log('❌ Legal files integrity check failed');
    legalIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ Legal files verified');
  }
}

/**
 * Check deployment configurations
 */
async function checkDeploymentConfig() {
  console.log('\n🚀 Checking deployment configurations...');
  
  const deploymentIssues = [];
  
  for (const file of config.deploymentConfigs) {
    if (!fs.existsSync(file)) {
      deploymentIssues.push(`Missing deployment config: ${file}`);
    }
  }
  
  // Check Vercel configuration
  if (fs.existsSync('vercel.json')) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      
      if (!vercelConfig.headers) {
        deploymentIssues.push('Missing headers in vercel.json');
      }
      
      if (!vercelConfig.redirects) {
        deploymentIssues.push('Missing redirects in vercel.json');
      }
    } catch (error) {
      deploymentIssues.push(`Error parsing vercel.json: ${error.message}`);
    }
  }
  
  auditResults.deploymentConfig = deploymentIssues.length === 0;
  auditResults.details.deploymentIssues = deploymentIssues;
  
  if (!auditResults.deploymentConfig) {
    console.log('❌ Deployment configuration issues found');
    deploymentIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ Deployment configurations verified');
  }
}

/**
 * Run full audit
 */
async function runFullAudit() {
  console.log('🌲 AutoList Canada - Launch Readiness Audit');
  console.log('===========================================');
  
  await checkRequiredPages();
  await verifyI18nImplementation();
  await checkServiceLayer();
  await verifyExtension();
  await verifyLegalFiles();
  await checkDeploymentConfig();
  
  // Determine if ready for PR
  auditResults.readyForPR = 
    auditResults.allPagesPresent &&
    auditResults.i18nImplementation &&
    auditResults.serviceLayer &&
    auditResults.extensionComplete &&
    auditResults.legalFilesIntegrity &&
    auditResults.deploymentConfig;
  
  console.log('\n📊 AUDIT SUMMARY');
  console.log('===============');
  console.log(`Required Pages: ${auditResults.allPagesPresent ? '✅' : '❌'}`);
  console.log(`i18n Implementation: ${auditResults.i18nImplementation ? '✅' : '❌'}`);
  console.log(`Service Layer: ${auditResults.serviceLayer ? '✅' : '❌'}`);
  console.log(`Chrome Extension: ${auditResults.extensionComplete ? '✅' : '❌'}`);
  console.log(`Legal Files: ${auditResults.legalFilesIntegrity ? '✅' : '❌'}`);
  console.log(`Deployment Config: ${auditResults.deploymentConfig ? '✅' : '❌'}`);
  console.log('---------------');
  console.log(`READY FOR PR: ${auditResults.readyForPR ? '✅ YES' : '❌ NO'}`);
  
  if (!auditResults.readyForPR) {
    console.log('\n🔧 ISSUES TO FIX BEFORE PR:');
    if (auditResults.details.missingFiles.length > 0) {
      console.log('\nMissing Files:');
      auditResults.details.missingFiles.forEach(file => console.log(`- ${file}`));
    }
    
    if (auditResults.details.i18nIssues.length > 0) {
      console.log('\ni18n Issues:');
      auditResults.details.i18nIssues.forEach(issue => console.log(`- ${issue}`));
    }
    
    if (auditResults.details.extensionIssues.length > 0) {
      console.log('\nExtension Issues:');
      auditResults.details.extensionIssues.forEach(issue => console.log(`- ${issue}`));
    }
    
    if (auditResults.details.deploymentIssues.length > 0) {
      console.log('\nDeployment Issues:');
      auditResults.details.deploymentIssues.forEach(issue => console.log(`- ${issue}`));
    }
    
    if (auditResults.details.serviceIssues.length > 0) {
      console.log('\nService Layer Issues:');
      auditResults.details.serviceIssues.forEach(issue => console.log(`- ${issue}`));
    }
  } else {
    console.log('\n🎉 Congratulations! The project passes all audit checks and is ready for PR.');
    console.log('\nNext steps:');
    console.log('1. Commit your changes');
    console.log('2. Deploy to Vercel using the vercel.json configuration');
    console.log('3. Create a pull request from revamp/full-replication-autolist to main');
  }
}

// Run the audit
runFullAudit().catch(error => {
  console.error('Error running audit:', error);
});
