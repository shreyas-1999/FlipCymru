import React, { useState } from 'react';
import { Settings, Trophy, Calendar, Target, Bell, Moon, Sun, LogOut, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialAchievements } from '../data/mockData';

const ProfilePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('flipcymru-data');
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
    document.documentElement.classList.toggle('dark');
  };

  const unlockedAchievements = initialAchievements.filter(a => 
    state.achievements.some(ua => ua.id === a.id && ua.unlocked)
  );

  const progressStats = [
    { label: 'Total Cards Learned', value: state.userProgress.totalCardsLearned, goal: 100 },
    { label: 'Conversation Minutes', value: state.userProgress.conversationMinutes, goal: 60 },
    { label: 'Translation Lookups', value: state.userProgress.translationsLookup, goal: 50 },
    { label: 'Current Streak', value: state.userProgress.currentStreak, goal: 30 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-welsh-green-500 to-welsh-green-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {state.user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{state.user?.name}</h1>
              <p className="opacity-90">{state.user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Level {state.user?.level}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {state.user?.xp} XP
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  🔥 {state.user?.streak} day streak
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Edit3 size={20} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-welsh-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-welsh-slate-700 mb-6">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-welsh-green-100 dark:bg-welsh-green-900/20 text-welsh-green-600 dark:text-welsh-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Progress Overview */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {progressStats.map((stat, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-welsh-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.value}/{stat.goal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-welsh-slate-600 rounded-full h-2">
                      <div
                        className="bg-welsh-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((stat.value / stat.goal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Streak</h3>
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔥</div>
                  <div className="text-3xl font-bold text-welsh-orange-600">{state.user?.streak || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-3xl font-bold text-welsh-green-600">7</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="text-3xl font-bold text-yellow-600">{state.user?.level || 1}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current Level</div>
                </div>
              </div>
            </div>

            {/* Weekly Calendar */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Week</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{day}</div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        index < 4
                          ? 'bg-welsh-green-500 text-white'
                          : index === 4
                          ? 'bg-welsh-orange-500 text-white'
                          : 'bg-gray-200 dark:bg-welsh-slate-700 text-gray-400'
                      }`}
                    >
                      {index < 5 ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Achievements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {initialAchievements.map(achievement => {
                const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isUnlocked
                        ? 'border-welsh-green-200 dark:border-welsh-green-800 bg-welsh-green-50 dark:bg-welsh-green-900/20'
                        : 'border-gray-200 dark:border-welsh-slate-700 bg-gray-50 dark:bg-welsh-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`text-2xl ${
                          isUnlocked ? '' : 'grayscale'
                        }`}
                      >
                        {achievement.icon === 'footprints' && '👣'}
                        {achievement.icon === 'message-circle' && '💬'}
                        {achievement.icon === 'languages' && '🌐'}
                        {achievement.icon === 'flame' && '🔥'}
                        {achievement.icon === 'book-open' && '📖'}
                        {achievement.icon === 'mic' && '🎤'}
                        {achievement.icon === 'plus-circle' && '➕'}
                        {achievement.icon === 'shield' && '🛡️'}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${
                          isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        {isUnlocked && (
                          <p className="text-xs text-welsh-green-600 dark:text-welsh-green-400 mt-1">
                            Unlocked recently
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {state.user?.preferences.theme === 'dark' ? (
                    <Moon size={20} className="text-welsh-slate-600 dark:text-welsh-slate-400" />
                  ) : (
                    <Sun size={20} className="text-yellow-600" />
                  )}
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Theme</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {state.user?.preferences.theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.user?.preferences.theme === 'dark' ? 'bg-welsh-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.user?.preferences.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell size={20} className="text-welsh-orange-600" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Daily Reminders</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified about your daily learning goals
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-welsh-green-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Goals Settings */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Goals</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily XP Goal
                  </label>
                  <select className="w-full p-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg dark:bg-welsh-slate-700 dark:text-white">
                    <option value="50">50 XP (Relaxed)</option>
                    <option value="100" selected>100 XP (Regular)</option>
                    <option value="200">200 XP (Intense)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;