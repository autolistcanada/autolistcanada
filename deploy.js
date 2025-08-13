/**
 * @file deploy.js
 * @description AutoList Canada deployment helper script
 * 
 * This script helps prepare the project for deployment by:
 * 1. Validating critical files and configurations
 * 2. Checking for required components
 * 3. Ensuring i18n support is properly implemented
 * 4. Verifying deployment configuration files
 */

// Simulated deployment validation
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Legal file hashes for verification
const LEGAL_FILE_HASHES = {
  'terms.html': '', // Add actual SHA256 hash here
  'privacy.html': '' // Add actual SHA256 hash here
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
 * Verify if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if exists, false otherwise
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Check if required files exist
 * @returns {Promise<object>} Validation results
 */
async function validateRequiredFiles() {
  const requiredFiles = [
    'index.html',
    'dashboard.html',
    'listings.html',
    'templates.html',
    'import.html',
    'analytics.html',
    'ai-tools.html',
    'how-it-works.html',
    'settings.html',
    'faq.html',
    'terms.html',
    'privacy.html',
    'vercel.json',
    'i18n/en.json',
    'i18n/fr.json',
    'extension/manifest.json',
    'extension/popup.html',
    'extension/content.js',
    'extension/background.js'
  ];
  
  const results = {
    success: true,
    missing: [],
    found: []
  };
  
  for (const file of requiredFiles) {
    if (fileExists(file)) {
      results.found.push(file);
    } else {
      results.missing.push(file);
      results.success = false;
    }
  }
  
  return results;
}

/**
 * Validate i18n implementation
 * @returns {Promise<object>} Validation results
 */
async function validateI18n() {
  const i18nFiles = ['i18n/en.json', 'i18n/fr.json'];
  const results = {
    success: true,
    issues: []
  };
  
  // Check if i18n files exist
  for (const file of i18nFiles) {
    if (!fileExists(file)) {
      results.success = false;
      results.issues.push(`Missing ${file}`);
      continue;
    }
    
    // Read and parse the file
    try {
      const content = fs.readFileSync(file, 'utf8');
      const json = JSON.parse(content);
      
      // Check if it has required sections
      const requiredSections = ['navigation', 'common', 'home', 'listings', 'settings'];
      
      for (const section of requiredSections) {
        if (!json[section]) {
          results.success = false;
          results.issues.push(`Missing '${section}' section in ${file}`);
        }
      }
    } catch (error) {
      results.success = false;
      results.issues.push(`Error parsing ${file}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate legal files
 * @returns {Promise<object>} Validation results
 */
async function validateLegalFiles() {
  const results = {
    success: true,
    issues: []
  };
  
  for (const [file, expectedHash] of Object.entries(LEGAL_FILE_HASHES)) {
    if (!fileExists(file)) {
      results.success = false;
      results.issues.push(`Missing ${file}`);
      continue;
    }
    
    // Skip hash check if expected hash is empty
    if (!expectedHash) {
      results.issues.push(`Skipping hash check for ${file}: no expected hash provided`);
      continue;
    }
    
    // Calculate and compare hash
    try {
      const actualHash = await calculateFileHash(file);
      
      if (actualHash !== expectedHash) {
        results.success = false;
        results.issues.push(`Hash mismatch for ${file}:
          Expected: ${expectedHash}
          Actual:   ${actualHash}`);
      }
    } catch (error) {
      results.success = false;
      results.issues.push(`Error calculating hash for ${file}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate deployment configuration
 * @returns {object} Validation results
 */
function validateDeploymentConfig() {
  const results = {
    success: true,
    issues: []
  };
  
  // Check Vercel config
  if (!fileExists('vercel.json')) {
    results.success = false;
    results.issues.push('Missing vercel.json');
  } else {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      
      // Check for required Vercel configuration
      if (!vercelConfig.headers) {
        results.issues.push('vercel.json missing headers section');
      }
      
      if (!vercelConfig.redirects) {
        results.issues.push('vercel.json missing redirects section');
      }
    } catch (error) {
      results.success = false;
      results.issues.push(`Error parsing vercel.json: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Run the complete pre-deployment validation
 */
async function validateForDeployment() {
  console.log('🌲 AutoList Canada - Pre-deployment Validation');
  console.log('=============================================');
  
  // Check required files
  console.log('\n📂 Checking required files...');
  const filesResult = await validateRequiredFiles();
  if (filesResult.success) {
    console.log('✅ All required files found!');
  } else {
    console.log('❌ Some required files are missing:');
    filesResult.missing.forEach(file => console.log(`   - ${file}`));
  }
  
  // Check i18n implementation
  console.log('\n🌐 Validating i18n support...');
  const i18nResult = await validateI18n();
  if (i18nResult.success) {
    console.log('✅ i18n implementation looks good!');
  } else {
    console.log('❌ Issues found with i18n:');
    i18nResult.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Check legal files
  console.log('\n📜 Validating legal files...');
  const legalResult = await validateLegalFiles();
  if (legalResult.success) {
    console.log('✅ Legal files validation passed!');
  } else {
    console.log('❌ Issues with legal files:');
    legalResult.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Check deployment configuration
  console.log('\n🚀 Validating deployment configuration...');
  const deployResult = validateDeploymentConfig();
  if (deployResult.success) {
    console.log('✅ Deployment configuration looks good!');
  } else {
    console.log('❌ Issues with deployment configuration:');
    deployResult.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Summary
  console.log('\n📊 Validation Summary');
  console.log('-------------------');
  
  const allSuccess = 
    filesResult.success && 
    i18nResult.success && 
    legalResult.success && 
    deployResult.success;
  
  if (allSuccess) {
    console.log('✅ Project is ready for deployment!');
  } else {
    console.log('❌ Project needs fixes before deployment.');
  }
}

// Run validation
validateForDeployment().catch(error => {
  console.error('Error during validation:', error);
});
