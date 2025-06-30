// src/app/page.tsx
// This is the main dashboard page of the FlipCymru application.
// It serves as the user's personalized hub, displaying learning statistics and progress.

'use client'; // This directive indicates that this module should be treated as a client component.

import React from 'react';
import { useAuth } from '@/context/AuthContext'; // Custom hook to access authentication data (user, loading, userId)
import { useRouter } from 'next/navigation'; // Next.js router for programmatic navigation
import Layout from '@/components/Layout'; // Layout component for consistent UI structure
import {
  Sparkles, Award, TrendingUp, CalendarDays, BarChart3, Target, BookOpen // Removed MessageSquare, Globe from here
} from 'lucide-react'; // Icons from lucide-react for visual elements

const DashboardPage: React.FC = () => {
  const { user, loading, userId } = useAuth(); // Destructure user, loading, and userId from the authentication context
  const router = useRouter(); // Initialize Next.js router instance

  // If the authentication state is still loading, display a loading spinner.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // If there is no authenticated user after loading, redirect to the authentication page.
  if (!user) {
    router.push('/auth'); // Redirect to login/signup
    return null; // Don't render the dashboard content if not authenticated
  }

  // Mock data for dashboard statistics.
  // In a real application, this data would be fetched from Firebase Firestore
  // for the current user.
  const learningStats = {
    streak: 7, // Current learning streak in days
    xpPoints: 1250, // Total experience points
    level: 5, // Current learning level
    badgesEarned: 3, // Number of achievement badges earned
    wordsMastered: 120, // Total number of words mastered
    conversationMinutes: 45, // Total minutes spent in AI conversations
    accuracy: 85, // Overall accuracy in quizzes/flashcards
    dailyGoalProgress: { // Progress for example daily goals
      'Learn 15 new words': 10, // Example: 10 out of 15 words
      'Have a 10-minute conversation': 7, // Example: 7 out of 10 minutes
    },
    learningActivity: [ // Mock learning activity for a week (for calendar display)
      { date: '2025-06-24', intensity: 'low' },
      { date: '2025-06-25', intensity: 'medium' },
      { date: '2025-06-26', intensity: 'high' },
      { date: '2025-06-27', intensity: 'medium' },
      { date: '2025-06-28', intensity: 'low' },
      { date: '2025-06-29', intensity: 'high' },
      { date: '2025-06-30', intensity: 'none' }, // Example: Today's date (if no activity yet)
    ],
  };

  return (
    <Layout> {/* Wrap the dashboard content with the consistent Layout component */}
      <div className="container mx-auto p-4 pb-20"> {/* Responsive padding, pb-20 to clear fixed navbar */}
        {/* Welcome heading with user's display name or email prefix */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left">
          Shwmae, {user.displayName || user.email?.split('@')[0]}! {/* "Shwmae" is Welsh for "Hello" */}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center lg:text-left">
          Welcome to your FlipCymru Dashboard. Keep up the great work!
          <span className="block text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your User ID: {userId} {/* Display userId for debugging/multi-user identification */}
          </span>
        </p>

        {/* Learning Statistics Section - Grid layout for key metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Current Streak Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center space-x-4 transition-transform duration-300 hover:scale-[1.02]">
            <Sparkles className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{learningStats.streak} Days</p>
            </div>
          </div>
          {/* XP Points Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center space-x-4 transition-transform duration-300 hover:scale-[1.02]">
            <Award className="w-10 h-10 text-purple-500 dark:text-purple-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">XP Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{learningStats.xpPoints}</p>
            </div>
          </div>
          {/* Level Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center space-x-4 transition-transform duration-300 hover:scale-[1.02]">
            <TrendingUp className="w-10 h-10 text-green-500 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{learningStats.level}</p>
            </div>
          </div>
        </section>

        {/* Progress Tracking & Achievements Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Overall Progress Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Overall Progress
            </h3>
            {/* Placeholder for future chart integration (e.g., using Recharts) */}
            <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
              <p>Charts and graphs will appear here soon!</p>
            </div>
            {/* Detailed progress metrics */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <p>Words Mastered: <span className="font-semibold text-gray-800 dark:text-white">{learningStats.wordsMastered}</span></p>
              <p>Conversation Minutes: <span className="font-semibold text-gray-800 dark:text-white">{learningStats.conversationMinutes}</span></p>
              <p>Overall Accuracy: <span className="font-semibold text-gray-800 dark:text-white">{learningStats.accuracy}%</span></p>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Example Badges - these would dynamically appear based on user achievements */}
              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center shadow-sm">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-2">First Steps</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">10 Flashcards</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center shadow-sm">
                {/* Note: This is a placeholder icon for "Chatterbox". */}
                {/* To use MessageSquare here, you would need to import it again. */}
                {/* For consistency with the Navbar, I'll avoid re-importing if not critical for dashboard itself. */}
                <span className="w-8 h-8 text-green-500 flex items-center justify-center">💬</span> {/* Emoji placeholder */}
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-2">Chatterbox</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">5 AI Conversations</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center shadow-sm">
                {/* Note: This is a placeholder icon for "Translator". */}
                {/* To use Globe here, you would need to import it again. */}
                <span className="w-8 h-8 text-blue-500 flex items-center justify-center">🌐</span> {/* Emoji placeholder */}
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-2">Translator</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">50 Translations</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
              You&apos;ve earned <span className="font-bold">{learningStats.badgesEarned}</span> badges! Keep learning to unlock more.
            </p>
          </div>
        </section>

        {/* Daily Goals & Weekly Activity Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Daily Goals Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-500" />
              Daily Goals
            </h3>
            <ul className="space-y-3">
              {Object.entries(learningStats.dailyGoalProgress).map(([goal, progress], index) => (
                <li key={index} className="flex flex-col">
                  <div className="flex justify-between items-center text-gray-800 dark:text-white text-sm font-medium">
                    <span>{goal}</span>
                    <span>{progress}%</span> {/* Display progress as percentage */}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }} // Dynamic width based on progress
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Learning Activity Calendar Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-teal-500" />
              Learning Activity
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {/* Day headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="font-semibold text-gray-600 dark:text-gray-300">
                  {day}
                </div>
              ))}
              {/* Activity days - colored based on intensity */}
              {learningStats.learningActivity.map((day, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    day.intensity === 'high' ? 'bg-green-200 dark:bg-green-700' :
                    day.intensity === 'medium' ? 'bg-blue-200 dark:bg-blue-700' :
                    day.intensity === 'low' ? 'bg-yellow-200 dark:bg-yellow-700' :
                    'bg-gray-200 dark:bg-gray-700'
                  } transition-colors duration-200 shadow-sm`}
                  title={`Intensity: ${day.intensity}`} // Tooltip for intensity
                >
                  {new Date(day.date).getDate()} {/* Display day of the month */}
                </div>
              ))}
            </div>
            {/* Legend for intensity colors */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Intensity: <span className="inline-block w-3 h-3 rounded-full bg-green-500 mx-1"></span> High
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mx-1"></span> Medium
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mx-1"></span> Low
            </p>
          </div>
        </section>

        {/* Weak Areas Section Placeholder */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-red-500" /> {/* BookOpen is used here, so it's kept */}
            Weak Areas
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            This section will dynamically identify vocabulary or grammar concepts that need more attention
            based on your performance. Focused practice sessions will be generated here to help you improve.
          </p>
          <button className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
            Start Focused Practice
          </button>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardPage;