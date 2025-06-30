// src/app/auth/page.tsx
// This page serves as the entry point for user authentication (login and signup).
// It renders the Auth component, which handles the user interface and Firebase authentication logic.

import Auth from '@/components/Auth'; // Import the Auth component

const AuthPage: React.FC = () => {
  return (
    // The Auth component contains all the necessary UI and logic for user login/signup.
    // It is designed to take up the full screen and center its content.
    <Auth />
  );
};

export default AuthPage;