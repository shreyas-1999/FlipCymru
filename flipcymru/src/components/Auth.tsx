// src/components/Auth.tsx
// This component provides the user authentication interface (login and signup forms).
// It uses Firebase Authentication for email/password and Google Sign-In.

'use client'; // This directive indicates that this module should be treated as a client component.

import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

const Auth: React.FC = () => {
  // Local states for form inputs and UI feedback
  const [isLogin, setIsLogin] = useState(true); // Toggles between login and signup modes
  const [email, setEmail] = useState('');       // Stores email input
  const [password, setPassword] = useState(''); // Stores password input
  const [username, setUsername] = useState(''); // Stores username input (for signup)
  const [error, setError] = useState<string | null>(null); // Stores authentication error messages
  const [localLoading, setLocalLoading] = useState(false); // Controls loading state for buttons within this component

  // Global authentication states from AuthContext
  // `user`: The authenticated Firebase user object, or null
  // `loading`: The loading state of the overall authentication process from AuthContext
  // `auth`: The Firebase Auth instance
  const { auth, user, loading: authContextLoading } = useAuth();

  const router = useRouter(); // Next.js router instance for navigation

  // Effect to handle redirection after authentication status is determined.
  // This runs after the component's render phase.
  useEffect(() => {
    // Check if the AuthContext has finished loading its authentication state
    // AND if a user is currently authenticated.
    if (!authContextLoading && user) {
      // If both conditions are true, redirect the user to the dashboard ('/')
      router.push('/');
    }
  }, [user, authContextLoading, router]); // Dependencies: Re-run this effect if 'user', 'authContextLoading', or 'router' changes.

  /**
   * Handles user authentication via email and password (login or signup).
   * @param e The form submission event.
   */
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission behavior (page reload)
    setError(null);     // Clear any previous error messages
    setLocalLoading(true); // Activate local loading state for buttons

    // Ensure Firebase Auth is initialized before attempting operations.
    if (!auth) {
      setError('Firebase authentication service is not available. Please try again later.');
      setLocalLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Attempt to sign in an existing user with email and password.
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully!');
      } else {
        // Attempt to create a new user account with email and password.
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered successfully!');
        // Additional step: Optionally update the new user's profile with the provided username
        // if Firebase `updateProfile` is imported and used here.
      }
      // The `useEffect` hook above will handle the redirection to the dashboard upon successful authentication.
    } catch (err: any) {
      // Catch and display any errors that occur during Firebase email/password authentication.
      setError(err.message || 'An unexpected error occurred during email/password authentication.');
      console.error('Email/Password Auth error:', err);
    } finally {
      setLocalLoading(false); // Deactivate local loading state regardless of success or failure.
    }
  };

  /**
   * Handles user authentication via Google Sign-In.
   */
  const handleGoogleSignIn = async () => {
    setError(null);     // Clear any previous error messages
    setLocalLoading(true); // Activate local loading state for buttons

    // Ensure Firebase Auth is initialized.
    if (!auth) {
      setError('Firebase authentication service is not available. Please try again later.');
      setLocalLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider(); // Create an instance of the Google Auth provider.
      await signInWithPopup(auth, provider);     // Open a Google sign-in pop-up window.
      console.log('Signed in with Google successfully!');
      // The `useEffect` hook above will handle the redirection to the dashboard upon successful authentication.
    } catch (err: any) {
      // Catch and display errors specific to Google Sign-In.
      setError(err.message || 'An unexpected error occurred with Google Sign-In.');
      console.error('Google Sign-In error:', err);
    } finally {
      setLocalLoading(false); // Deactivate local loading state.
    }
  };

  // --- Conditional Rendering for the Auth Component ---
  // 1. If AuthContext is still in its loading phase (determining user status), display a loading spinner.
  if (authContextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // 2. If AuthContext has finished loading AND a user is authenticated,
  //    return null. The `useEffect` above will handle the actual `router.push`.
  //    This prevents the login/signup form from being rendered at all if the user is already logged in.
  if (user) {
    return null;
  }

  // 3. If AuthContext has finished loading AND no user is authenticated,
  //    render the login/signup form. This is the primary render path for unauthenticated users.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          {isLogin ? 'Welcome Back!' : 'Join FlipCymru'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                  required={!isLogin}
                  aria-label="Username"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                required
                aria-label="Email Address"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
                required
                aria-label="Password"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={localLoading}
          >
            {localLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isLogin ? 'Log In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          disabled={localLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.24 10.27v-2.31h3.33c.09-.59.61-1.44.61-2.19 0-1.89-1.22-3.23-3.08-3.23-1.84 0-3.32 1.54-3.32 3.44s1.48 3.44 3.32 3.44c1.02 0 1.94-.42 2.65-1.09l1.83 1.83c-1.12 1.12-2.58 1.76-4.48 1.76-3.71 0-6.72-3.01-6.72-6.72s3.01-6.72 6.72-6.72c3.67 0 6.13 2.52 6.13 6.01 0 .61-.06 1.15-.17 1.67h-5.96z" fill="#fff" />
            <path d="M22.5 12.002c0-.52-.06-1.04-.17-1.55h-1.63v-.002h-3.32v3.08c1.37 0 2.5-.5 3.01-1.01l.01-.01.01-.01c.42-.42.66-.99.66-1.5z" fill="#fff" />
            <path d="M12.24 22c-3.66 0-6.72-3.01-6.72-6.72s3.01-6.72 6.72-6.72c3.67 0 6.13 2.52 6.13 6.01 0 .61-.06 1.15-.17 1.67h-5.96z" fill="#fff" />
            <path d="M22.5 12.002c0-.52-.06-1.04-.17-1.55h-1.63v-.002h-3.32v3.08c1.37 0 2.5-.5 3.01-1.01l.01-.01.01-.01c.42-.42.66-.99.66-1.5z" fill="#fff" />
            <path d="M12.24 22c-3.66 0-6.72-3.01-6.72-6.72s3.01-6.72 6.72-6.72c3.67 0 6.13 2.52 6.13 6.01 0 .61-.06 1.15-.17 1.67h-5.96z" fill="#FFC107"/>
            <path d="M22.5 12.002c0-.52-.06-1.04-.17-1.55h-1.63v-.002h-3.32v3.08c1.37 0 2.5-.5 3.01-1.01l.01-.01.01-.01c.42-.42.66-.99.66-1.5z" fill="#4CAF50"/>
            <path d="M12.24 22c-3.66 0-6.72-3.01-6.72-6.72s3.01-6.72 6.72-6.72c3.67 0 6.13 2.52 6.13 6.01 0 .61-.06 1.15-.17 1.67h-5.96z" fill="#1976D2"/>
          </svg>
          {localLoading ? 'Signing In...' : 'Google'}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-none"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;