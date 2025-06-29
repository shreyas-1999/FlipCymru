import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialFlashcards, initialAchievements } from '../data/mockData';

const LoginPage: React.FC = () => {
  const { dispatch } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    const user = {
      id: '1',
      name: formData.name || 'Welsh Learner',
      email: formData.email,
      level: 1,
      xp: 0,
      streak: 0,
      lastLoginDate: new Date().toISOString(),
      preferences: {
        theme: 'light' as const,
        notifications: true,
        dailyGoal: 20,
      },
    };

    dispatch({ type: 'LOGIN', payload: user });
    
    // Initialize flashcards and achievements
    initialFlashcards.forEach(flashcard => {
      dispatch({ type: 'ADD_FLASHCARD', payload: flashcard });
    });
    
    dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-welsh-green-50 to-welsh-slate-100 dark:from-welsh-slate-900 dark:to-welsh-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-welsh-green-500 to-welsh-green-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">FlipCymru</h1>
          <p className="text-gray-600 dark:text-gray-300">Learn Welsh with interactive flashcards</p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white dark:bg-welsh-slate-800 rounded-2xl shadow-xl p-8 animate-slide-up">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-welsh-green-100 dark:bg-welsh-green-900/20 text-welsh-green-600 dark:text-welsh-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-welsh-green-100 dark:bg-welsh-green-900/20 text-welsh-green-600 dark:text-welsh-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg focus:ring-2 focus:ring-welsh-green-500 focus:border-transparent dark:bg-welsh-slate-700 dark:text-white"
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg focus:ring-2 focus:ring-welsh-green-500 focus:border-transparent dark:bg-welsh-slate-700 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg focus:ring-2 focus:ring-welsh-green-500 focus:border-transparent dark:bg-welsh-slate-700 dark:text-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-welsh-green-500 to-welsh-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-welsh-green-600 hover:to-welsh-green-700 transition-all duration-200 transform hover:scale-105"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button className="w-full border border-gray-300 dark:border-welsh-slate-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-welsh-slate-700 transition-colors">
              Continue with Google
            </button>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Start your Welsh learning journey today
        </div>
      </div>
    </div>
  );
};

export default LoginPage;