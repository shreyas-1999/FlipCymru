// src/lib/firebaseConfig.ts
// This file initializes your Firebase application and services (Auth, Firestore)
// using configuration loaded from environment variables (.env.local).

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, Auth } from 'firebase/auth'; // Added Auth type import
import { getFirestore, Firestore } from 'firebase/firestore'; // Added Firestore type import

// Define the Firebase configuration using environment variables.
// NEXT_PUBLIC_ prefix is required for Next.js to expose these to the client-side.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

console.log('Firebase Config loaded:', firebaseConfig.projectId ? 'OK' : 'Error: Project ID missing'); // Log config status

// Initialize Firebase app.
// It checks if an app instance already exists to prevent re-initialization errors
// during Next.js development (e.g., hot module reloading).
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firebase Authentication and Firestore instances.
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase App and Services initialized:', {
  appName: app.name,
  authInstance: auth ? 'Initialized' : 'FAILED',
  dbInstance: db ? 'Initialized' : 'FAILED'
});

// Export the initialized Firebase services for easy access throughout the application.
export { app, auth, db };

// Declare global variables that might be provided by the Canvas environment.
// These are used for specific Canvas runtime behaviors like custom auth tokens.
// They are typed as 'any' to avoid TypeScript errors when running outside Canvas.
declare const __app_id: any;
declare const __firebase_config: any;
declare const __initial_auth_token: any;

/**
 * Initializes Firebase specifically for the Canvas environment, handling custom auth tokens.
 * This function ensures the Firebase app is correctly set up and authenticated
 * whether running in Canvas or a standard Next.js environment.
 * @returns An object containing the Firebase app, auth, firestore instances, and current userId.
 */
export async function initializeCanvasFirebase(): Promise<{ app: typeof app; auth: Auth; db: Firestore; userId: string }> {
  console.log('initializeCanvasFirebase called.');

  // Determine the application ID. Prioritize __app_id from Canvas, otherwise use a default.
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Get Firebase configuration. Prioritize __firebase_config from Canvas (parsed JSON),
  // otherwise fall back to the locally defined firebaseConfig from .env.local.
  const firebaseConfigFromCanvas = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : firebaseConfig;

  console.log('Config source:', typeof __firebase_config !== 'undefined' ? 'Canvas' : '.env.local');

  // Get initial authentication token. Prioritize __initial_auth_token from Canvas.
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // Initialize or retrieve the Firebase app instance.
  let currentAppInstance;
  if (!getApps().length) {
    currentAppInstance = initializeApp(firebaseConfigFromCanvas);
    console.log('Firebase app initialized via initializeCanvasFirebase (first time).');
  } else {
    currentAppInstance = getApp();
    console.log('Firebase app already exists, using existing instance.');
  }

  // Get the Auth instance for the current app.
  const authInstance = getAuth(currentAppInstance);
  const dbInstance = getFirestore(currentAppInstance); // Also get DB instance here

  if (!authInstance) {
    console.error('ERROR: getAuth(currentAppInstance) returned null or undefined.');
    throw new Error('Firebase Auth initialization failed.');
  }

  // Authenticate the user.
  if (initialAuthToken) {
    try {
      console.log('Attempting to sign in with custom token...');
      await signInWithCustomToken(authInstance, initialAuthToken);
      console.log('Signed in with custom token from Canvas.');
    } catch (error) {
      console.error('Error signing in with custom token:', error);
      console.log('Falling back to anonymous sign-in...');
      await signInAnonymously(authInstance);
      console.log('Signed in anonymously due to custom token failure.');
    }
  } else {
    console.log('No custom token provided. Signing in anonymously...');
    await signInAnonymously(authInstance);
    console.log('Signed in anonymously.');
  }

  // Return the initialized Firebase app, auth, firestore instances, and the current user's ID.
  // The userId is either the authenticated user's UID or a randomly generated UUID for anonymous users.
  return {
    app: currentAppInstance,
    auth: authInstance,
    db: dbInstance,
    userId: authInstance.currentUser?.uid || crypto.randomUUID()
  };
}