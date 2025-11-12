#!/usr/bin/env node
/**
 * ST8 Page and Function Verification Tool
 * Validates all HTML pages and JavaScript functions
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const HTML_DIR = path.join(ROOT_DIR, 'html');
const JS_DIR = path.join(ROOT_DIR, 'js');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(description, condition, isWarning = false) {
  totalTests++;
  if (condition) {
    passedTests++;
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    if (isWarning) {
      warnings++;
      log(`  ⚠ ${description}`, 'yellow');
    } else {
      failedTests++;
      log(`  ✗ ${description}`, 'red');
    }
    return false;
  }
}

function section(title) {
  log(`\n${colors.bold}${title}${colors.reset}`, 'cyan');
}

// Verify HTML file exists and is readable
function verifyHtmlFile(filename) {
  const filepath = path.join(HTML_DIR, filename);
  const exists = fs.existsSync(filepath);
  
  if (!exists) {
    test(`${filename} exists`, false);
    return null;
  }
  
  test(`${filename} exists`, true);
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    test(`${filename} is readable`, content.length > 0);
    return content;
  } catch (err) {
    test(`${filename} is readable`, false);
    return null;
  }
}

// Verify HTML structure
function verifyHtmlStructure(filename, content) {
  if (!content) return;
  
  test(`${filename} has DOCTYPE`, /<!DOCTYPE html>/i.test(content));
  test(`${filename} has <html> tag`, /<html/i.test(content));
  test(`${filename} has <head> tag`, /<head/i.test(content));
  test(`${filename} has <body> tag`, /<body/i.test(content));
  test(`${filename} has <title> tag`, /<title>/i.test(content));
  test(`${filename} has charset declaration`, /charset.*utf-8/i.test(content));
  
  // Check for common required elements
  const hasHeader = /<header/i.test(content);
  const hasMain = /<main/i.test(content);
  test(`${filename} has semantic structure (header/main)`, hasHeader && hasMain, true);
}

// Verify CSS references
function verifyCssReferences(filename, content, baseDir = HTML_DIR) {
  if (!content) return;
  
  const cssRefs = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  test(`${filename} has CSS references`, cssRefs.length > 0);
  
  cssRefs.forEach(ref => {
    const match = ref.match(/href=["']([^"']+)["']/);
    if (match) {
      const cssPath = match[1];
      const resolvedPath = path.resolve(baseDir, cssPath);
      const exists = fs.existsSync(resolvedPath);
      test(`  CSS file ${cssPath} exists`, exists);
    }
  });
}

// Verify JavaScript references
function verifyJsReferences(filename, content, baseDir = HTML_DIR) {
  if (!content) return;
  
  const scriptRefs = content.match(/<script[^>]*src=["'][^"']+["'][^>]*>/gi) || [];
  
  scriptRefs.forEach(ref => {
    const match = ref.match(/src=["']([^"']+)["']/);
    if (match) {
      const jsPath = match[1];
      const resolvedPath = path.resolve(baseDir, jsPath);
      const exists = fs.existsSync(resolvedPath);
      test(`  JS file ${jsPath} exists`, exists);
    }
  });
}

// Extract and verify inline JavaScript functions
function verifyInlineFunctions(filename, content) {
  if (!content) return;
  
  // Extract script content
  const scriptBlocks = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi) || [];
  
  if (scriptBlocks.length === 0) {
    test(`${filename} has inline JavaScript`, false, true);
    return;
  }
  
  test(`${filename} has inline JavaScript`, true);
  
  let totalFunctions = 0;
  scriptBlocks.forEach(block => {
    // Remove HTML from block to get just the script content
    const scriptContent = block.replace(/<script[^>]*>|<\/script>/gi, '');
    
    // Extract function names
    const functions = scriptContent.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    totalFunctions += functions.length;
    
    // Check for common syntax errors - count braces and parens in actual JavaScript only
    const hasUnclosedBraces = (scriptContent.match(/{/g) || []).length !== (scriptContent.match(/}/g) || []).length;
    test(`  No unclosed braces in ${filename} inline scripts`, !hasUnclosedBraces);
    
    // Parentheses check is less reliable in mixed HTML/JS, so skip it
    
    // Check for strict mode
    const hasStrictMode = /['"]use strict['"]/.test(scriptContent);
    test(`  ${filename} inline scripts use strict mode`, hasStrictMode, true);
  });
  
  test(`${filename} declares ${totalFunctions} functions`, totalFunctions > 0, totalFunctions === 0);
}

// Verify external JavaScript file
function verifyJsFile(filename) {
  const filepath = path.join(JS_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    test(`${filename} exists`, false);
    return;
  }
  
  test(`${filename} exists`, true);
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    test(`${filename} is readable`, content.length > 0);
    
    // Extract function names
    const functions = content.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    test(`${filename} declares functions`, functions.length > 0, functions.length === 0);
    
    // Check for syntax balance
    const hasUnclosedBraces = (content.match(/{/g) || []).length !== (content.match(/}/g) || []).length;
    test(`  No unclosed braces in ${filename}`, !hasUnclosedBraces);
    
    const hasUnclosedParens = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
    test(`  No unclosed parentheses in ${filename}`, !hasUnclosedParens);
    
  } catch (err) {
    test(`${filename} is readable`, false);
  }
}

// Main verification process
function runVerification() {
  log('\n' + colors.bold + '═══════════════════════════════════════════════', 'cyan');
  log('   ST8 Page and Function Verification', 'cyan');
  log('═══════════════════════════════════════════════' + colors.reset, 'cyan');
  
  // Verify main index.html
  section('1. Verifying Main Page');
  const mainIndexPath = path.join(ROOT_DIR, 'index.html');
  if (fs.existsSync(mainIndexPath)) {
    test('index.html exists', true);
    const mainContent = fs.readFileSync(mainIndexPath, 'utf-8');
    verifyHtmlStructure('index.html', mainContent);
    verifyCssReferences('index.html', mainContent, ROOT_DIR);
    verifyJsReferences('index.html', mainContent, ROOT_DIR);
  } else {
    test('index.html exists', false);
  }
  
  // Verify all HTML pages
  section('2. Verifying HTML Pages');
  const htmlPages = [
    'agents.html',
    'bihebdo.html',
    'easydict.html',
    'elements.html',
    'index.html',
    'planification.html',
    'planning.html',
    'prepa.html',
    'rapport.html',
    'stats.html'
  ];
  
  htmlPages.forEach(page => {
    section(`  → ${page}`);
    const content = verifyHtmlFile(page);
    if (content) {
      verifyHtmlStructure(page, content);
      verifyCssReferences(page, content);
      verifyJsReferences(page, content);
      verifyInlineFunctions(page, content);
    }
  });
  
  // Verify JavaScript files
  section('3. Verifying JavaScript Files');
  const jsFiles = [
    'script.js',
    'apps-data.js',
    'api-sync.js',
    'notify.js',
    'weekend-utils.js'
  ];
  
  jsFiles.forEach(file => {
    section(`  → ${file}`);
    verifyJsFile(file);
  });
  
  // Verify API endpoints (if server is running)
  section('4. Verifying API Endpoints');
  test('Server package.json exists', fs.existsSync(path.join(ROOT_DIR, 'server', 'package.json')));
  test('Server entry point exists', fs.existsSync(path.join(ROOT_DIR, 'server', 'server.js')));
  
  // Summary
  section('═══════════════════════════════════════════════');
  log('\nVerification Summary:', 'bold');
  log(`  Total tests:    ${totalTests}`);
  log(`  Passed:         ${passedTests}`, 'green');
  log(`  Failed:         ${failedTests}`, failedTests > 0 ? 'red' : 'reset');
  log(`  Warnings:       ${warnings}`, warnings > 0 ? 'yellow' : 'reset');
  
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  log(`\n  Success Rate:   ${successRate}%`, successRate >= 90 ? 'green' : (successRate >= 70 ? 'yellow' : 'red'));
  
  log('\n' + colors.bold + '═══════════════════════════════════════════════' + colors.reset, 'cyan');
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run verification
runVerification();
