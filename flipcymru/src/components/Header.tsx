// src/components/Header.tsx
// This component provides a consistent header across all authenticated pages of FlipCymru.
// It includes the app title, a logout button, and a theme toggle button.

'use client'; // This directive indicates that this module should be treated as a client component.

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; // <--- Import useTheme
import { LogOut } from 'lucide-react'; // Icon for the logout button

const Header: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { toggleTheme, ThemeIcon } = useTheme(); // <--- Get toggleTheme and ThemeIcon from useTheme
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  // Do not render the header if the user is not logged in or still loading.
  if (!user || loading) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-green-500 to-blue-600 shadow-md p-4 flex items-center justify-between text-white">
      {/* App Title/Logo */}
      <div className="flex items-center">
        <h1 className="text-xl md:text-2xl font-bold">FlipCymru</h1>
      </div>

      {/* Right side: Theme Toggle, User Info, Logout Button */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
          aria-label="Toggle theme"
          title="Toggle light/dark theme"
        >
          <ThemeIcon className="w-5 h-5 text-white" /> {/* Use ThemeIcon dynamically */}
        </button>

        {/* Display user's name or email if available */}
        <span className="text-sm hidden sm:block">
          Hi, {user.displayName || user.email?.split('@')[0]}
        </span>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          // Changed text color to ensure visibility against the gradient.
          // It was already text-white, but adding explicit color for dark mode might help.
          // bg-white bg-opacity-20 will be light enough.
          className="flex items-center px-3 py-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200 text-sm font-medium text-white"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-4 h-4 mr-1 hidden sm:inline-block" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;