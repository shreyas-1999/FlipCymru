// src/app/layout.tsx
// This is the root layout file for your Next.js application.
// It defines the HTML structure, imports global styles, and wraps the application
// with AuthProvider and ThemeProvider for global context.

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext'; // <--- Import ThemeProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlipCymru - Welsh Learning App',
  description: 'A comprehensive Welsh language learning web application combining interactive flashcards, real-time translation, AI-powered conversations, and gamified learning experiences.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body> {/* No 'dark' class here; ThemeProvider will add it to documentElement */}
        {/* Wrap the entire application with ThemeProvider first */}
        <ThemeProvider>
          {/* Then wrap with AuthProvider */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}