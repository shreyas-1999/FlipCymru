import React from 'react';
import { Home, BookOpen, Languages, MessageCircle, User, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navigation: React.FC = () => {
  const { state, dispatch } = useApp();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'flashcards', icon: BookOpen, label: 'Cards' },
    { id: 'translation', icon: Languages, label: 'Translate' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-welsh-slate-800 border-t border-gray-200 dark:border-welsh-slate-700 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = state.currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-welsh-green-600 dark:text-welsh-green-400 bg-welsh-green-50 dark:bg-welsh-green-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-welsh-green-600 dark:hover:text-welsh-green-400'
              }`}
            >
              <Icon 
                size={20} 
                className={`mb-1 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Floating Action Button */}
      {state.currentView === 'flashcards' && (
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'create-flashcard' })}
          className="absolute -top-6 right-6 w-12 h-12 bg-welsh-green-600 hover:bg-welsh-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 animate-glow"
        >
          <Plus size={24} />
        </button>
      )}
    </nav>
  );
};

export default Navigation;