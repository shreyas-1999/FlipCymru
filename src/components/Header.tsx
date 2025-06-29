import React from 'react';
import { Sun, Moon, Settings, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
    document.documentElement.classList.toggle('dark');
  };

  if (!state.isAuthenticated) return null;

  return (
    <header className="bg-white dark:bg-welsh-slate-800 shadow-sm border-b border-gray-200 dark:border-welsh-slate-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-welsh-green-500 to-welsh-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">FlipCymru</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Welcome back, {state.user?.name}!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Streak Counter */}
          <div className="flex items-center bg-welsh-orange-100 dark:bg-welsh-orange-900/20 px-3 py-1 rounded-full">
            <span className="text-welsh-orange-600 dark:text-welsh-orange-400 text-sm font-semibold">
              🔥 {state.user?.streak || 0}
            </span>
          </div>
          
          {/* Level Badge */}
          <div className="flex items-center bg-welsh-green-100 dark:bg-welsh-green-900/20 px-3 py-1 rounded-full">
            <span className="text-welsh-green-600 dark:text-welsh-green-400 text-sm font-semibold">
              Level {state.user?.level || 1}
            </span>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-welsh-slate-700 transition-colors"
          >
            {state.user?.preferences.theme === 'dark' ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-welsh-slate-600" />
            )}
          </button>
          
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-welsh-slate-700 transition-colors relative">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-welsh-orange-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;