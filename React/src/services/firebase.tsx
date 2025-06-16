import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBIWSvstap59MxU0Z14jLucEbYNJseyw8A",
    authDomain: "flipcymru.firebaseapp.com",
    projectId: "flipcymru",
    storageBucket: "flipcymru.firebasestorage.app",
    messagingSenderId: "75100969430",
    appId: "1:75100969430:web:11ba8aaf8290649b8bec77",
    measurementId: "G-91L4T32K9R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
