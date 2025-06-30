// src/app/chat/page.tsx
// Placeholder page for the AI Conversation Practice feature of FlipCymru.
// Updated to include route protection.

'use client';

import React, { useEffect } from 'react'; // Import useEffect
import Layout from '@/components/Layout';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter

const ChatPage: React.FC = () => {
  const { user, loading } = useAuth(); // Get user, loading
  const router = useRouter(); // Initialize useRouter

  // --- Route Protection ---
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Display loading spinner while authentication is being determined, or if user is not logged in
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 pb-20">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-pink-600" />
          AI Conversation Practice
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center lg:text-left">
          Engage in natural Welsh conversations with your AI tutor, tailored to your skill level.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p className="text-center">
            AI Chat functionality coming soon!
            <br />
            You'll be able to select conversation topics, receive real-time corrections, and ask for grammar help.
          </p>
        </div>
        <button className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50">
          Start Chatting
        </button>
      </div>
    </Layout>
  );
};

export default ChatPage;