// Firebase Configuration Helper
// File ini membantu menguji koneksi Firebase

const admin = require('firebase-admin');

// Load environment variables
require('dotenv').config();

console.log('================================');
console.log('Firebase Connection Test');
console.log('================================');
console.log('');

// Test 1: Check environment variables
console.log('Test 1: Environment Variables');
console.log('-----------------------------');

const requiredEnvs = [
  'FIREBASE_DB_URL',
  'NODE_ENV'
];

let allEnvsPresent = true;
requiredEnvs.forEach(env => {
  if (process.env[env]) {
    console.log(`✓ ${env}: ${process.env[env].substring(0, 50)}...`);
  } else {
    console.log(`✗ ${env}: NOT SET`);
    allEnvsPresent = false;
  }
});

// Test 2: Try to initialize Firebase Admin SDK
console.log('');
console.log('Test 2: Firebase Admin SDK');
console.log('--------------------------');

try {
  const serviceAccount = require('./firebase-service-account.json');
  
  console.log('✓ firebase-service-account.json loaded');
  console.log(`  - Project ID: ${serviceAccount.project_id}`);
  console.log(`  - Client Email: ${serviceAccount.client_email}`);
  
  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL,
    });
    console.log('✓ Firebase Admin SDK initialized');
  }
  
  // Test 3: Test Firestore connection
  console.log('');
  console.log('Test 3: Firestore Connection');
  console.log('---------------------------');
  
  const db = admin.firestore();
  
  // Try to read a collection (without filtering first docs)
  db.collection('users').limit(1).get()
    .then((snapshot) => {
      console.log('✓ Firestore connection successful');
      console.log(`  - Total users in database: ${snapshot.size}`);
      
      // Print status
      printStatus(true);
    })
    .catch((error) => {
      console.log('✗ Firestore connection failed');
      console.log(`  - Error: ${error.message}`);
      
      // Check if it's a permission error
      if (error.message.includes('PERMISSION_DENIED')) {
        console.log('  - Cause: Check your Firestore Security Rules');
      } else if (error.message.includes('UNAUTHENTICATED')) {
        console.log('  - Cause: Check your service account credentials');
      }
      
      printStatus(false);
    });
  
} catch (error) {
  console.log('✗ firebase-service-account.json NOT found');
  console.log(`  - Error: ${error.message}`);
  console.log('');
  console.log('To fix:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to Settings → Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Save the JSON file as: backend/firebase-service-account.json');
  
  printStatus(false);
}

// Helper function to print final status
function printStatus(success) {
  console.log('');
  console.log('================================');
  if (success) {
    console.log('✓ All tests passed!');
    console.log('Your Firebase setup is correct.');
  } else {
    console.log('✗ Some tests failed!');
    console.log('Please check the errors above.');
  }
  console.log('================================');
}
