// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Import Firebase auth and db instances
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export function useAuth() {
    return useContext(AuthContext);
}

// Auth Provider Component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null); // Firebase authenticated user object
    const [loading, setLoading] = useState(true); // Loading state for initial auth check
    const [userProfile, setUserProfile] = useState(null); // User data from Firestore

    // Function to handle user registration (client-side Firebase Auth)
    const signup = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Optional: Update user profile directly in Firebase Auth (display name)
            // if (displayName) {
            //     await updateProfile(user, { displayName: displayName });
            // }

            // Send registration data to your Python backend
            // The backend will create the user in Firebase Auth (Admin SDK) and Firestore
            // This is crucial to ensure the backend's user collection is populated.
            const backendResponse = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, displayName }), // Backend handles display name too
            });

            if (!backendResponse.ok) {
                const errorData = await backendResponse.json();
                throw new Error(errorData.message || 'Backend registration failed.');
            }

            const backendResult = await backendResponse.json();
            console.log('Backend registration successful:', backendResult);
            return user; // Return the Firebase Auth user object
        } catch (error) {
            console.error("Error during signup:", error);
            throw error; // Re-throw for component to handle
        }
    };

    // Function to handle user login (client-side Firebase Auth)
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get Firebase ID Token after successful client-side login
            const idToken = await user.getIdToken();

            // Send the ID Token to your Python backend for verification and profile fetching
            const backendResponse = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Send token for verification
                },
                body: JSON.stringify({ idToken }) // Backend expects idToken
            });

            if (!backendResponse.ok) {
                const errorData = await backendResponse.json();
                throw new Error(errorData.message || 'Backend login verification failed.');
            }

            const backendResult = await backendResponse.json();
            console.log('Backend login verification successful:', backendResult);
            setUserProfile(backendResult.profile); // Update user profile from backend
            return user;
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    };

    // Function to handle user logout
    const logout = () => {
        return signOut(auth);
    };

    // Effect to listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // If user is logged in, try to fetch their profile from Firestore
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                } else {
                    // If Firestore doc doesn't exist (e.g., first login after migration),
                    // create a basic one based on Firebase Auth data.
                    console.warn("Firestore user profile not found, creating a basic one.");
                    await setDoc(docRef, {
                        email: user.email,
                        displayName: user.displayName || '',
                        createdAt: serverTimestamp(),
                    });
                    const freshDocSnap = await getDoc(docRef); // Fetch again to get timestamp
                    setUserProfile(freshDocSnap.data());
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false); // Auth state is determined, stop loading
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    // Provide these values to children components
    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Render children only after auth state is determined */}
        </AuthContext.Provider>
    );
}
