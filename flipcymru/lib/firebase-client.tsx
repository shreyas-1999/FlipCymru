"use client"

import { app } from "./firebase" // <-- server-safe core
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

/**
 * These SDKs touch `window`, so they MUST run in the browser.
 * Because this file is `"use client"` it is never executed during SSR.
 */
export const auth = getAuth(app)
export const db = getFirestore(app)
