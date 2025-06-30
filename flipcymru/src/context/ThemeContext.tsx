// src/context/ThemeContext.tsx
// This context manages the application's light/dark theme state.

'use client'; // This directive indicates that this module should be treated as a client component.

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'; // <--- ADDED useCallback
import { Sun, Moon } from 'lucide-react'; // Icons for theme toggling

// Define the shape of our ThemeContext
interface ThemeContextType {
  theme: 'light' | 'dark'; // The current theme
  toggleTheme: () => void; // Function to switch the theme
  ThemeIcon: React.ElementType; // The current icon (Sun or Moon) based on theme
}

// Create the ThemeContext with a default value (will be overridden by Provider)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider component to wrap your application and provide theme context
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize theme from localStorage or prefer system setting, default to 'light'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      // Check for user preference in localStorage first
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // If no saved theme, check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default to light if no preference is found
  });

  // Apply the 'dark' class to the <html> element based on the theme state
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]); // Re-run effect whenever the theme changes

  // Function to toggle between 'light' and 'dark' themes
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Determine which icon to display based on the current theme
  const ThemeIcon = theme === 'light' ? Moon : Sun;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ThemeIcon }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily access the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};