import * as admin from 'firebase-admin';
import { applicationDefault, initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found. Using environment variables from the system.');
  dotenv.config();
}

// Log Firebase configuration for debugging (without sensitive data)
console.log('Firebase Configuration:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '(not set)');
console.log('- FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET || '(not set)');
console.log('- FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL || '(not set)');

// Check if the Firebase Admin SDK is already initialized
if (!admin.apps.length) {
  try {
    // Initialize the app with environment variables
    const app = initializeApp({
      credential: process.env.NODE_ENV === 'production' 
        ? applicationDefault()
        : admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'yourwealth-coach',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk@yourwealth-coach.iam.gserviceaccount.com',
            // Replace newlines in private key if they exist
            privateKey: process.env.FIREBASE_PRIVATE_KEY 
              ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
              : 'your-private-key-here',
          }),
      projectId: process.env.FIREBASE_PROJECT_ID || 'yourwealth-coach',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'yourwealth-coach.appspot.com',
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://yourwealth-coach.firebaseio.com',
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    
    // In development or test environments, we can continue with a mock
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Continuing without Firebase in non-production environment');
    } else {
      throw error; // Re-throw in production
    }
  }
}

// Export the storage instance
export const storage = getStorage();

// Export admin for direct usage
export { admin }; 