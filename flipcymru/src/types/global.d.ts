// src/types/global.d.ts
// This file declares global variables injected by the Canvas environment
// and environment variables loaded by Next.js to satisfy TypeScript during local development.

// Declare __app_id as a global constant of type string.
// It's optional as it might not be present outside the Canvas runtime,
// and we handle its absence with a fallback in firebaseConfig.ts.
declare const __app_id: string | undefined;

// Declare __firebase_config as a global constant of type string.
declare const __firebase_config: string | undefined;

// Declare __initial_auth_token as a global constant of type string.
declare const __initial_auth_token: string | undefined;

// Declare environment variables accessible via process.env.
// Ensure all NEXT_PUBLIC_ variables are here.
// Server-side only variables (without NEXT_PUBLIC_) are also declared here for completeness.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_FIREBASE_API_KEY: string;
    readonly NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    readonly NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    readonly NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    readonly NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly NEXT_PUBLIC_FIREBASE_APP_ID: string;
    readonly NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string; // Optional
    readonly GOOGLE_TTS_API_KEY: string; // Now required for TTS
    readonly GEMINI_API_KEY: string; // Now required for Gemini Text/STT
    // If you kept GOOGLE_TRANSLATION_STT_API_KEY for other reasons:
    // readonly GOOGLE_TRANSLATION_STT_API_KEY?: string;
  }
}