// src/components/Navbar.tsx
// This component renders the persistent bottom navigation bar for the FlipCymru application.
// It uses Next.js `usePathname` to highlight the currently active navigation link.

'use client'; // This directive indicates that this module should be treated as a client component.

import React from 'react';
import Link from 'next/link'; // Next.js Link component for client-side navigation
import { usePathname } from 'next/navigation'; // Hook to get the current URL pathname
import { Home, BookOpen, MessageSquare, Globe, User } from 'lucide-react'; // Icons from the lucide-react library

// Define the structure for each navigation item in the bar.
interface NavItem {
  name: string;          // Display name for the navigation link (e.g., "Dashboard")
  href: string;          // The URL path for the link (e.g., "/")
  icon: React.ElementType; // The Lucide React icon component to display (e.g., Home)
}

// Array of navigation items that will be rendered in the Navbar.
const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Flashcards', href: '/flashcards', icon: BookOpen },
  { name: 'Translate', href: '/translate', icon: Globe },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

const Navbar: React.FC = () => {
  const pathname = usePathname(); // Get the current URL path to determine which link is active.

  return (
    // The main navigation element, fixed to the bottom of the viewport.
    // Uses Tailwind CSS for styling: background, shadow, border, padding, z-index.
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 p-2 z-50">
      {/* Container for navigation links, centered horizontally and using flexbox for even distribution. */}
      <div className="max-w-md mx-auto flex justify-around items-center">
        {/* Map through the navItems array to render each link. */}
        {navItems.map((item) => {
          // Determine if the current navigation item's href matches the current pathname.
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href} // The destination URL for the link.
              key={item.name} // Unique key for React list rendering.
              className="flex flex-col items-center p-2 rounded-lg group" // Styling for the link container.
            >
              {/* Icon component.
                  Color changes based on `isActive` state and hover (`group-hover`).
                  Transitions add a smooth animation effect. */}
              <item.icon
                className={`w-6 h-6 transition-colors duration-200 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300'
                }`}
              />
              {/* Text label for the navigation item.
                  Font weight and color change based on `isActive` state and hover. */}
              <span
                className={`text-xs mt-1 transition-colors duration-200 ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;