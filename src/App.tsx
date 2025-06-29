import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import TranslationPage from './pages/TranslationPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CreateFlashcardPage from './pages/CreateFlashcardPage';

const AppContent: React.FC = () => {
  const { state } = useApp();

  useEffect(() => {
    // Apply theme on mount
    if (state.user?.preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.user?.preferences.theme]);

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'translation':
        return <TranslationPage />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <ProfilePage />;
      case 'create-flashcard':
        return <CreateFlashcardPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-welsh-slate-900 transition-colors">
      <Header />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
      <Navigation />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;