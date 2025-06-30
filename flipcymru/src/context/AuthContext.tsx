// src/context/AuthContext.tsx
// This context manages the Firebase authentication state for the entire application.
// It uses the initializeCanvasFirebase function from firebaseConfig.ts to handle auth setup.

'use client'; // This directive indicates that this module should be treated as a client component.

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { initializeCanvasFirebase } from '@/lib/firebaseConfig'; // Import the canvas initialization function

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null; // The authenticated Firebase user object, or null if not authenticated
  loading: boolean; // Indicates if the authentication state is still loading
  logout: () => Promise<void>; // Function to log out the current user
  db: Firestore | null; // Firestore instance
  auth: Auth | null; // Auth instance
  userId: string | null; // Current user ID (UID if authenticated, or a random ID if anonymous)
}

// Create the AuthContext with a default null value.
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component to wrap your application and provide authentication context to all children.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    // Asynchronously initialize Firebase and set up the authentication listener.
    const initFirebaseAndListen = async () => {
      console.log('AuthContext useEffect: Initializing Firebase and setting up listener...');
      try {
        // Call the specific initialization function that handles Canvas context.
        const { auth: initializedAuth, db: initializedDb, userId: initialUserId } = await initializeCanvasFirebase();
        
        // Immediately set the auth and db instances in state once they are available.
        setAuth(initializedAuth);
        setDb(initializedDb);
        setUserId(initialUserId); // Set initial userId

        console.log('AuthContext: Firebase instances obtained, setting up onAuthStateChanged...');

        // Set up the Firebase Auth state change listener.
        // This listener will be triggered whenever the user's sign-in state changes (login, logout).
        unsubscribeAuth = onAuthStateChanged(initializedAuth, (currentUser) => {
          console.log('AuthContext: onAuthStateChanged triggered. Current User:', currentUser?.uid);
          setUser(currentUser);
          // Update userId based on the current authenticated user's UID,
          // or retain the existing anonymous userId if no user is authenticated.
          // This ensures userId is reactive to login/logout.
          setUserId(currentUser?.uid || initialUserId);
          setLoading(false); // Authentication state has been determined, stop loading.
        }, (error) => {
            console.error('AuthContext: onAuthStateChanged error:', error);
            setLoading(false); // Stop loading even if auth state listener errors
        });

      } catch (error) {
        console.error('AuthContext useEffect: Failed to initialize Firebase or set up auth listener:', error);
        setLoading(false); // Stop loading even if an error occurs during initialization
        setAuth(null); // Explicitly set to null on failure
        setDb(null); // Explicitly set to null on failure
        setUserId(null); // Explicitly set to null on failure
      }
    };

    initFirebaseAndListen(); // Call the initialization function when the component mounts.

    // Clean up the listener when the component unmounts to prevent memory leaks.
    return () => {
        console.log('AuthContext useEffect: Cleaning up auth listener.');
        if (unsubscribeAuth) {
            unsubscribeAuth();
        }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  // Function to handle user logout.
  const logout = async () => {
    if (auth) { // Ensure auth instance is available
      console.log('AuthContext: Attempting to log out...');
      try {
        await signOut(auth); // Sign out the current user
        console.log('AuthContext: User logged out successfully.');
      } catch (error) {
        console.error('AuthContext: Error logging out:', error);
      }
    } else {
        console.warn('AuthContext: Cannot log out, auth instance is null.');
    }
  };

  console.log('AuthContext Provider Render:', { user: user?.uid, loading, authInitialized: !!auth, dbInitialized: !!db, currentUserId: userId });

  // Provide the authentication context values to all children components.
  return (
    <AuthContext.Provider value={{ user, loading, logout, db, auth, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the authentication context from any child component.
 * Throws an error if used outside of an AuthProvider, ensuring correct usage.
 * @returns The current AuthContextType values.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    // This error should ideally not be reached if AuthProvider wraps the app correctly.
    console.error('useAuth called outside AuthProvider. Context is null.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};