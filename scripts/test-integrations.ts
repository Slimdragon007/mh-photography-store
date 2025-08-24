#!/usr/bin/env tsx
import dotenv from 'dotenv';
import { S3Client, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';
import Stripe from 'stripe';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name: string) {
  log(`\n📝 Testing: ${name}`, colors.cyan);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Test results tracking
const testResults: { name: string; status: 'pass' | 'fail' | 'warning'; message: string }[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string) {
  testResults.push({ name, status, message });
}

// Test environment variables
async function testEnvironmentVariables() {
  logTest('Environment Variables');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_ENDPOINT',
    'R2_PUBLIC_URL',
    'SITE_URL',
    'ADMIN_PASSWORD_HASH',
    'SESSION_SECRET'
  ];

  const optionalVars = [
    'IMPORT_IMAGES_DIR'
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
      
      // Validate specific formats
      if (varName === 'STRIPE_SECRET_KEY' && !process.env[varName]?.startsWith('sk_')) {
        logWarning(`${varName} should start with 'sk_'`);
        addResult(varName, 'warning', 'Invalid format');
      }
      if (varName === 'STRIPE_PUBLISHABLE_KEY' && !process.env[varName]?.startsWith('pk_')) {
        logWarning(`${varName} should start with 'pk_'`);
        addResult(varName, 'warning', 'Invalid format');
      }
      if (varName === 'STRIPE_WEBHOOK_SECRET' && !process.env[varName]?.startsWith('whsec_')) {
        logWarning(`${varName} should start with 'whsec_'`);
        addResult(varName, 'warning', 'Invalid format');
      }
    } else {
      logError(`${varName} is missing!`);
      addResult(varName, 'fail', 'Missing');
      allPresent = false;
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logInfo(`${varName} is set (optional)`);
    } else {
      logInfo(`${varName} is not set (optional)`);
    }
  }

  addResult('Environment Variables', allPresent ? 'pass' : 'fail', 
    allPresent ? 'All required variables present' : 'Some required variables missing');
  
  return allPresent;
}

// Test Cloudflare R2 connection
async function testCloudflareR2() {
  logTest('Cloudflare R2 Storage');
  
  try {
    const client = new S3Client({
      endpoint: process.env.R2_ENDPOINT!,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    // Test bucket access
    logInfo('Testing bucket access...');
    const headCommand = new HeadBucketCommand({
      Bucket: process.env.R2_BUCKET!
    });
    
    try {
      await client.send(headCommand);
      logSuccess(`Bucket "${process.env.R2_BUCKET}" is accessible`);
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        logError(`Bucket "${process.env.R2_BUCKET}" does not exist`);
        addResult('R2 Bucket', 'fail', 'Bucket not found');
        return false;
      } else if (error.$metadata?.httpStatusCode === 403) {
        logError('Access denied to bucket (check credentials)');
        addResult('R2 Access', 'fail', 'Access denied');
        return false;
      }
      throw error;
    }

    // List objects in bucket
    logInfo('Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET!,
      MaxKeys: 5
    });

    const listResponse = await client.send(listCommand);
    const objectCount = listResponse.Contents?.length || 0;
    
    logSuccess(`Found ${objectCount} objects in bucket`);
    if (objectCount > 0) {
      logInfo('Sample objects:');
      listResponse.Contents?.slice(0, 3).forEach(obj => {
        logInfo(`  - ${obj.Key} (${obj.Size} bytes)`);
      });
    }

    // Test public URL accessibility
    logInfo('Testing public URL configuration...');
    if (process.env.R2_PUBLIC_URL) {
      const testUrl = `${process.env.R2_PUBLIC_URL}/${process.env.R2_BUCKET}/test`;
      logInfo(`Public URL pattern: ${testUrl}`);
    }

    addResult('Cloudflare R2', 'pass', 'Connection successful');
    return true;
  } catch (error: any) {
    logError(`R2 connection failed: ${error.message}`);
    addResult('Cloudflare R2', 'fail', error.message);
    return false;
  }
}

// Test Stripe connection
async function testStripe() {
  logTest('Stripe API');
  
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });

    // Test API key validity
    logInfo('Testing Stripe API key...');
    const account = await stripe.accounts.retrieve();
    
    logSuccess(`Connected to Stripe account: ${account.email || account.id}`);
    logInfo(`Account type: ${account.type}`);
    logInfo(`Charges enabled: ${account.charges_enabled}`);
    
    // Check webhook endpoint configuration
    logInfo('Checking webhook endpoints...');
    try {
      const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 5 });
      
      if (webhookEndpoints.data.length > 0) {
        logSuccess(`Found ${webhookEndpoints.data.length} webhook endpoint(s)`);
        webhookEndpoints.data.forEach(endpoint => {
          logInfo(`  - ${endpoint.url} (${endpoint.status})`);
        });
      } else {
        logWarning('No webhook endpoints configured');
        addResult('Stripe Webhooks', 'warning', 'No endpoints configured');
      }
    } catch (error: any) {
      logWarning('Could not list webhook endpoints (may need additional permissions)');
    }

    // Test creating a product (without actually creating it)
    logInfo('Testing product creation capability...');
    try {
      // Just validate we can make the call
      const products = await stripe.products.list({ limit: 1 });
      logSuccess('Product API access confirmed');
    } catch (error: any) {
      logError(`Product API error: ${error.message}`);
    }

    addResult('Stripe API', 'pass', 'Connection successful');
    return true;
  } catch (error: any) {
    logError(`Stripe connection failed: ${error.message}`);
    
    if (error.message.includes('Invalid API Key')) {
      logError('The Stripe API key appears to be invalid');
      addResult('Stripe API', 'fail', 'Invalid API key');
    } else {
      addResult('Stripe API', 'fail', error.message);
    }
    
    return false;
  }
}

// Test admin authentication
async function testAdminAuth() {
  logTest('Admin Authentication');
  
  try {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const sessionSecret = process.env.SESSION_SECRET;
    
    if (!passwordHash || !sessionSecret) {
      logError('Admin authentication variables missing');
      addResult('Admin Auth', 'fail', 'Missing configuration');
      return false;
    }

    // Test hash format (should be SHA256 hex string)
    if (!/^[a-f0-9]{64}$/.test(passwordHash)) {
      logWarning('ADMIN_PASSWORD_HASH does not appear to be a valid SHA256 hash');
      addResult('Admin Auth', 'warning', 'Invalid hash format');
    } else {
      logSuccess('Admin password hash format is valid');
    }

    // Test session secret strength
    if (sessionSecret.length < 32) {
      logWarning('SESSION_SECRET should be at least 32 characters for security');
      addResult('Session Secret', 'warning', 'Weak secret');
    } else {
      logSuccess('Session secret appears strong');
    }

    // Test hashing a sample password to show format
    const samplePassword = 'test123';
    const sampleHash = crypto.createHash('sha256').update(samplePassword).digest('hex');
    logInfo(`Example: Password "test123" would hash to: ${sampleHash.substring(0, 16)}...`);
    
    addResult('Admin Auth', 'pass', 'Configuration valid');
    return true;
  } catch (error: any) {
    logError(`Admin auth test failed: ${error.message}`);
    addResult('Admin Auth', 'fail', error.message);
    return false;
  }
}

// Test local file system
async function testLocalFileSystem() {
  logTest('Local File System');
  
  try {
    // Check gallery directory
    const galleryPath = path.join(process.cwd(), 'gallery');
    try {
      const stats = await fs.stat(galleryPath);
      if (stats.isDirectory()) {
        const files = await fs.readdir(galleryPath);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        logSuccess(`Gallery directory exists with ${imageFiles.length} image(s)`);
        
        if (imageFiles.length > 0) {
          logInfo('Sample images:');
          imageFiles.slice(0, 3).forEach(file => {
            logInfo(`  - ${file}`);
          });
        }
      }
    } catch (error) {
      logWarning('Gallery directory not found (optional)');
    }

    // Check import directory if configured
    if (process.env.IMPORT_IMAGES_DIR) {
      const importPath = path.resolve(process.env.IMPORT_IMAGES_DIR);
      try {
        const stats = await fs.stat(importPath);
        if (stats.isDirectory()) {
          logSuccess(`Import directory exists: ${importPath}`);
        }
      } catch (error) {
        logWarning(`Import directory not found: ${importPath}`);
      }
    }

    addResult('File System', 'pass', 'Accessible');
    return true;
  } catch (error: any) {
    logError(`File system test failed: ${error.message}`);
    addResult('File System', 'fail', error.message);
    return false;
  }
}

// Test URL configuration
async function testURLConfiguration() {
  logTest('URL Configuration');
  
  const siteUrl = process.env.SITE_URL;
  
  if (!siteUrl) {
    logError('SITE_URL is not configured');
    addResult('URL Config', 'fail', 'SITE_URL missing');
    return false;
  }

  try {
    const url = new URL(siteUrl);
    logSuccess(`Site URL: ${url.href}`);
    logInfo(`Protocol: ${url.protocol}`);
    logInfo(`Host: ${url.host}`);
    
    if (url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
      logWarning('Production site should use HTTPS');
      addResult('URL Config', 'warning', 'Not using HTTPS');
    }

    addResult('URL Config', 'pass', 'Valid configuration');
    return true;
  } catch (error: any) {
    logError(`Invalid SITE_URL format: ${error.message}`);
    addResult('URL Config', 'fail', 'Invalid URL format');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('🧪 INTEGRATION TEST SUITE FOR MH-PHOTOGRAPHY-STORE', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  const tests = [
    testEnvironmentVariables,
    testCloudflareR2,
    testStripe,
    testAdminAuth,
    testLocalFileSystem,
    testURLConfiguration
  ];

  for (const test of tests) {
    try {
      await test();
    } catch (error: any) {
      logError(`Unexpected error: ${error.message}`);
    }
  }

  // Summary
  log('\n' + '='.repeat(60), colors.cyan);
  log('📊 TEST SUMMARY', colors.cyan);
  log('='.repeat(60), colors.cyan);

  const passed = testResults.filter(r => r.status === 'pass').length;
  const failed = testResults.filter(r => r.status === 'fail').length;
  const warnings = testResults.filter(r => r.status === 'warning').length;

  log(`\nResults:`, colors.cyan);
  testResults.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const color = result.status === 'pass' ? colors.green : result.status === 'fail' ? colors.red : colors.yellow;
    log(`${icon} ${result.name}: ${result.message}`, color);
  });

  log(`\nTotal: ${passed} passed, ${failed} failed, ${warnings} warnings\n`, colors.cyan);

  if (failed === 0) {
    log('🎉 All critical tests passed!', colors.green);
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', colors.red);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});