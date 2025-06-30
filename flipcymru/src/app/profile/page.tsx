// src/app/profile/page.tsx
// Placeholder page for the User Profile Management section of FlipCymru.
// It displays user information and provides options for profile customization and logout.

'use client'; // This directive indicates that this module should be treated as a client component.

import React, { useEffect } from 'react'; // Import useEffect
import Layout from '@/components/Layout';
import { User, Settings, Bell, Target, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Custom hook to access user authentication information
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

const ProfilePage: React.FC = () => {
  const { user, loading, logout } = useAuth(); // Destructure user, loading state, and logout function from auth context
  const router = useRouter(); // Initialize useRouter

  // --- Route Protection ---
  // Effect to check authentication status and redirect if necessary.
  useEffect(() => {
    // If not loading and no user is authenticated, redirect to the auth page.
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]); // Dependencies: re-run if user, loading, or router changes

  // Handle logout from this page
  const handleLogout = async () => {
    await logout();
    router.push('/auth'); // Redirect to login page after logout
  };

  // Display a loading spinner while authentication state is being determined.
  if (loading || !user) { // Combined loading and !user check
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
    <Layout> {/* Wrap the profile content with the consistent Layout component */}
      <div className="container mx-auto p-4 pb-20"> {/* Responsive padding, pb-20 to clear fixed navbar */}
        {/* Page Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left flex items-center">
          <User className="w-8 h-8 mr-3 text-orange-600" /> {/* User icon */}
          Profile Management
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center lg:text-left">
          Customize your learning preferences and manage your FlipCymru account.
        </p>

        {/* User Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            {/* Profile Picture (placeholder or actual) */}
            <img
              // If user has a photoURL, use it; otherwise, generate a placeholder image
              src={user.photoURL || `https://placehold.co/80x80/aabbcc/ffffff?text=${user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || 'U'}`}
              alt="Profile Avatar"
              className="w-20 h-20 rounded-full border-4 border-orange-300 dark:border-orange-500 object-cover"
            />
            {/* User Details */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.displayName || 'Learner'}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              {/* Display Firebase User ID (UID) for reference */}
              <p className="text-sm text-gray-500 dark:text-gray-400">UID: {user.uid}</p>
            </div>
          </div>

          {/* Profile Settings Options */}
          <div className="space-y-4">
            {/* Learning Preferences */}
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Settings className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Learning Preferences</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Set your preferred difficulty levels, learning pace, and content types.</p>
              </div>
            </div>
            {/* Notification Settings */}
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Bell className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Notification Settings</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage learning reminders, achievement alerts, and daily challenge notifications.</p>
              </div>
            </div>
            {/* Daily Goals */}
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Target className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Daily Goals</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Adjust your personalized daily learning objectives and track your progress.</p>
              </div>
            </div>
          </div>

          {/* Edit Profile Button - Placeholder for actual functionality */}
          <button
            onClick={() => alert('Profile customization functionality coming soon! You will be able to update your username, picture, etc.')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Edit Profile
          </button>

          {/* Log Out Button */}
          <button
            onClick={handleLogout} // Call the handleLogout function defined above
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <LogOut className="inline w-5 h-5 mr-2" />Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;