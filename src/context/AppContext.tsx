import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  lastLoginDate: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    dailyGoal: number;
  };
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentView: string;
  flashcards: Flashcard[];
  userProgress: UserProgress;
  achievements: Achievement[];
  translationHistory: Translation[];
  quizStages: QuizStage[];
  currentStage: number;
  categories: Category[];
}

interface Flashcard {
  id: string;
  english: string;
  welsh: string;
  pronunciation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed: string;
  nextReview: string;
  isCustom?: boolean;
  stageCompleted?: number;
}

interface QuizStage {
  id: number;
  name: string;
  description: string;
  requiredCards: number;
  completed: boolean;
  score?: number;
  completedAt?: string;
  unlockedAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

interface UserProgress {
  totalCardsLearned: number;
  conversationMinutes: number;
  translationsLookup: number;
  currentStreak: number;
  weeklyXP: number[];
  accuracyRate: number;
  stagesCompleted: number;
  totalQuizScore: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  fromLanguage: 'welsh' | 'english';
  timestamp: string;
  isFavorite: boolean;
  savedAsFlashcard?: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_FLASHCARD'; payload: Flashcard }
  | { type: 'UPDATE_FLASHCARD'; payload: { id: string; updates: Partial<Flashcard> } }
  | { type: 'DELETE_FLASHCARD'; payload: string }
  | { type: 'ADD_TRANSLATION'; payload: Translation }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<UserProgress> }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'COMPLETE_QUIZ_STAGE'; payload: { stageId: number; score: number } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_CURRENT_STAGE'; payload: number };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentView: 'dashboard',
  flashcards: [],
  userProgress: {
    totalCardsLearned: 0,
    conversationMinutes: 0,
    translationsLookup: 0,
    currentStreak: 0,
    weeklyXP: [0, 0, 0, 0, 0, 0, 0],
    accuracyRate: 0,
    stagesCompleted: 0,
    totalQuizScore: 0,
  },
  achievements: [],
  translationHistory: [],
  quizStages: [
    {
      id: 1,
      name: 'Welsh Basics',
      description: 'Master basic Welsh greetings and common phrases',
      requiredCards: 10,
      completed: false,
      unlockedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Food & Drink',
      description: 'Learn Welsh vocabulary for food and beverages',
      requiredCards: 15,
      completed: false,
      unlockedAt: '',
    },
    {
      id: 3,
      name: 'Family & Friends',
      description: 'Discover Welsh terms for family relationships',
      requiredCards: 12,
      completed: false,
      unlockedAt: '',
    },
    {
      id: 4,
      name: 'Daily Life',
      description: 'Expand your vocabulary for everyday activities',
      requiredCards: 20,
      completed: false,
      unlockedAt: '',
    },
    {
      id: 5,
      name: 'Welsh Culture',
      description: 'Explore advanced Welsh cultural expressions',
      requiredCards: 25,
      completed: false,
      unlockedAt: '',
    },
  ],
  currentStage: 1,
  categories: [
    { id: 'greetings', name: 'Greetings', icon: 'hand-heart', color: 'bg-welsh-green-500' },
    { id: 'food', name: 'Food & Drink', icon: 'utensils', color: 'bg-welsh-orange-500' },
    { id: 'family', name: 'Family', icon: 'users', color: 'bg-welsh-slate-500' },
    { id: 'education', name: 'Education', icon: 'graduation-cap', color: 'bg-blue-500' },
    { id: 'language', name: 'Language', icon: 'globe', color: 'bg-purple-500' },
    { id: 'society', name: 'Society', icon: 'building', color: 'bg-indigo-500' },
    { id: 'travel', name: 'Travel', icon: 'map', color: 'bg-green-500' },
    { id: 'time', name: 'Time', icon: 'clock', color: 'bg-yellow-500' },
    { id: 'colors', name: 'Colors', icon: 'palette', color: 'bg-pink-500' },
    { id: 'numbers', name: 'Numbers', icon: 'hash', color: 'bg-cyan-500' },
  ],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        currentView: 'login',
      };
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'ADD_FLASHCARD':
      return {
        ...state,
        flashcards: [...state.flashcards, action.payload],
      };
    case 'UPDATE_FLASHCARD':
      return {
        ...state,
        flashcards: state.flashcards.map(card =>
          card.id === action.payload.id
            ? { ...card, ...action.payload.updates }
            : card
        ),
      };
    case 'DELETE_FLASHCARD':
      return {
        ...state,
        flashcards: state.flashcards.filter(card => card.id !== action.payload),
      };
    case 'ADD_TRANSLATION':
      return {
        ...state,
        translationHistory: [action.payload, ...state.translationHistory.slice(0, 49)],
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        userProgress: { ...state.userProgress, ...action.payload },
      };
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload
            ? { ...achievement, unlocked: true, unlockedDate: new Date().toISOString() }
            : achievement
        ),
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                theme: state.user.preferences.theme === 'light' ? 'dark' : 'light',
              },
            }
          : null,
      };
    case 'COMPLETE_QUIZ_STAGE':
      const updatedStages = state.quizStages.map(stage =>
        stage.id === action.payload.stageId
          ? { 
              ...stage, 
              completed: true, 
              score: action.payload.score,
              completedAt: new Date().toISOString()
            }
          : stage
      );
      
      // Unlock next stage
      const nextStage = updatedStages.find(stage => stage.id === action.payload.stageId + 1);
      if (nextStage && !nextStage.unlockedAt) {
        nextStage.unlockedAt = new Date().toISOString();
      }

      return {
        ...state,
        quizStages: updatedStages,
        userProgress: {
          ...state.userProgress,
          stagesCompleted: state.userProgress.stagesCompleted + 1,
          totalQuizScore: state.userProgress.totalQuizScore + action.payload.score,
        },
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case 'SET_CURRENT_STAGE':
      return {
        ...state,
        currentStage: action.payload,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('flipcymru-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.user) {
          dispatch({ type: 'LOGIN', payload: parsedData.user });
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('flipcymru-data', JSON.stringify({
        user: state.user,
        flashcards: state.flashcards,
        userProgress: state.userProgress,
        achievements: state.achievements,
        translationHistory: state.translationHistory,
        quizStages: state.quizStages,
        currentStage: state.currentStage,
        categories: state.categories,
      }));
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export type { User, Flashcard, UserProgress, Achievement, Translation, QuizStage, Category };