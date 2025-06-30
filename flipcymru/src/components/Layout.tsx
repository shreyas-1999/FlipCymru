// src/components/Layout.tsx
// This component provides a consistent layout for the FlipCymru application.
// It now includes a fixed header at the top and a fixed bottom navigation bar.

'use client'; // This directive indicates that this module should be treated as a client component.

import React, { ReactNode } from 'react';
import Navbar from './Navbar'; // Import the Navbar component
import Header from './Header'; // Import the new Header component

// Define the props interface for the Layout component.
interface LayoutProps {
  children: ReactNode; // React children to be rendered within the layout's main content area.
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Main container for the entire layout.
    // It takes up the full viewport height and uses a flex column layout.
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-inter">
      {/* Fixed header at the top of the page */}
      <Header />

      {/* Main content area.
          `flex-grow` allows it to take up available vertical space.
          Padding is applied responsive (p-4 for mobile, md:p-6, lg:p-8 for larger screens).
          `overflow-y-auto` enables vertical scrolling if content exceeds viewport height.
          `pt-16` is added to ensure content starts below the fixed header. */}
      <main className="flex-grow p-4 pt-16 md:p-6 md:pt-16 lg:p-8 lg:pt-16 overflow-y-auto">
        {children} {/* Render the content passed to the Layout component here */}
      </main>

      {/* Fixed bottom navigation bar. */}
      <Navbar />
    </div>
  );
};

export default Layout;