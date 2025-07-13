import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

// Connect to auth emulator in development if needed
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Only connect to emulator if not already connected
  try {
    if (!auth.config.emulator) {
      // Uncomment the line below if you want to use Firebase Auth emulator in development
      // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    }
  } catch (error) {
    // Emulator connection might fail, that's okay for production
    console.log("Auth emulator connection skipped")
  }
}

export { app, auth, db }
