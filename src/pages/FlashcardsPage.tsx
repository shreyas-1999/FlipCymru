import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Volume2, RotateCcw, Check, X, Plus, Filter, Trophy, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';

interface QuizQuestion {
  id: string;
  english: string;
  options: string[];
  correctAnswer: string;
  pronunciation: string;
}

const FlashcardsPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    cardsInSession: 0,
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState('');

  const filteredCards = state.flashcards.filter(card => {
    if (selectedCategory !== 'all' && card.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && card.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const currentCard = filteredCards[currentCardIndex];
  const currentStage = state.quizStages.find(stage => stage.id === state.currentStage);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setFlipAnimation('');
  }, [selectedCategory, selectedDifficulty]);

  // Check if quiz should be triggered
  useEffect(() => {
    if (sessionStats.cardsInSession > 0 && sessionStats.cardsInSession % 8 === 0) {
      triggerQuiz();
    }
  }, [sessionStats.cardsInSession]);

  const handleCardFlip = () => {
    if (isFlipped) {
      setFlipAnimation('flip-backward');
      setTimeout(() => {
        setIsFlipped(false);
        setFlipAnimation('');
      }, 300);
    } else {
      setFlipAnimation('flip-forward');
      setTimeout(() => {
        setIsFlipped(true);
        setFlipAnimation('');
      }, 300);
    }
  };

  const handleCardAnswer = (isCorrect: boolean) => {
    if (!currentCard) return;

    const updates = {
      timesCorrect: isCorrect ? currentCard.timesCorrect + 1 : currentCard.timesCorrect,
      timesIncorrect: isCorrect ? currentCard.timesIncorrect : currentCard.timesIncorrect + 1,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(Date.now() + (isCorrect ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000)).toISOString(),
    };

    dispatch({ type: 'UPDATE_FLASHCARD', payload: { id: currentCard.id, updates } });

    setSessionStats(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
      total: prev.total + 1,
      cardsInSession: prev.cardsInSession + 1,
    }));

    // Award XP
    const xpGained = isCorrect ? 10 : 5;
    if (state.user) {
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { xp: state.user.xp + xpGained } 
      });
    }

    // Move to next card
    nextCard();
  };

  const triggerQuiz = () => {
    // Generate quiz questions from recent cards
    const recentCards = filteredCards.slice(Math.max(0, currentCardIndex - 8), currentCardIndex);
    const questions: QuizQuestion[] = recentCards.map(card => {
      // Generate wrong options
      const wrongOptions = filteredCards
        .filter(c => c.id !== card.id && c.category === card.category)
        .slice(0, 3)
        .map(c => c.welsh);
      
      // Ensure we have enough options
      while (wrongOptions.length < 3) {
        wrongOptions.push(`Option ${wrongOptions.length + 1}`);
      }

      const options = [card.welsh, ...wrongOptions].sort(() => Math.random() - 0.5);

      return {
        id: card.id,
        english: card.english,
        options,
        correctAnswer: card.welsh,
        pronunciation: card.pronunciation,
      };
    });

    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer('');
    setShowQuiz(true);
  };

  const handleQuizAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    
    setTimeout(() => {
      const isCorrect = answer === quizQuestions[currentQuizIndex].correctAnswer;
      if (isCorrect) {
        setQuizScore(prev => prev + 1);
      }

      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer('');
      } else {
        // Quiz completed
        const finalScore = isCorrect ? quizScore + 1 : quizScore;
        const percentage = Math.round((finalScore / quizQuestions.length) * 100);
        
        // Award bonus XP for quiz completion
        const bonusXP = percentage >= 80 ? 50 : percentage >= 60 ? 30 : 20;
        if (state.user) {
          dispatch({ 
            type: 'UPDATE_USER', 
            payload: { xp: state.user.xp + bonusXP } 
          });
        }

        // Check for stage completion
        if (currentStage && sessionStats.cardsInSession >= currentStage.requiredCards) {
          dispatch({ 
            type: 'COMPLETE_QUIZ_STAGE', 
            payload: { stageId: currentStage.id, score: percentage } 
          });
          
          // Unlock achievements
          if (percentage === 100) {
            dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'quiz-champion' });
          }
          if (currentStage.id === 1) {
            dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'stage-master' });
          }
        }

        setShowQuizResult(true);
      }
    }, 1000);
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setShowQuizResult(false);
    setSessionStats(prev => ({ ...prev, cardsInSession: 0 }));
  };

  const nextCard = () => {
    setIsFlipped(false);
    setFlipAnimation('');
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const previousCard = () => {
    setIsFlipped(false);
    setFlipAnimation('');
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(filteredCards.length - 1);
    }
  };

  const playPronunciation = (text: string, pronunciation: string) => {
    console.log(`Playing pronunciation for: ${text} (${pronunciation})`);
    // In real app would use Text-to-Speech API
  };

  if (showQuiz) {
    const currentQuestion = quizQuestions[currentQuizIndex];
    const progress = ((currentQuizIndex + 1) / quizQuestions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {showQuizResult ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quiz Complete!
            </h2>
            <div className="text-6xl font-bold text-welsh-green-600 mb-4">
              {Math.round((quizScore / quizQuestions.length) * 100)}%
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You got {quizScore} out of {quizQuestions.length} questions correct!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeQuiz}
                className="bg-welsh-green-600 hover:bg-welsh-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-welsh-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-welsh-slate-700 overflow-hidden">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-welsh-orange-500 to-welsh-orange-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Stage Quiz</h2>
                <div className="text-right">
                  <div className="text-sm opacity-90">Question {currentQuizIndex + 1} of {quizQuestions.length}</div>
                  <div className="text-sm opacity-90">Score: {quizScore}/{currentQuizIndex + (selectedAnswer ? 1 : 0)}</div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Quiz Question */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  What is the Welsh translation for:
                </h3>
                <div className="text-4xl font-bold text-welsh-green-600 mb-2">
                  {currentQuestion?.english}
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showResult = selectedAnswer !== '';

                  return (
                    <button
                      key={index}
                      onClick={() => !selectedAnswer && handleQuizAnswer(option)}
                      disabled={selectedAnswer !== ''}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : isSelected
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'border-gray-200 dark:border-welsh-slate-600 text-gray-500 dark:text-gray-400'
                          : 'border-gray-200 dark:border-welsh-slate-600 hover:border-welsh-green-500 hover:bg-welsh-green-50 dark:hover:bg-welsh-green-900/20 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="text-xl font-semibold">{option}</div>
                      {showResult && isCorrect && (
                        <div className="text-sm mt-2 opacity-80">
                          Pronunciation: {currentQuestion.pronunciation}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No flashcards found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first flashcard or adjust your filters
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'create-flashcard' })}
            className="bg-welsh-green-600 hover:bg-welsh-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Flashcard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Card {currentCardIndex + 1} of {filteredCards.length}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-welsh-slate-700 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 transition-colors"
          >
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stage Progress */}
      {currentStage && (
        <div className="bg-gradient-to-r from-welsh-green-50 to-welsh-orange-50 dark:from-welsh-green-900/20 dark:to-welsh-orange-900/20 rounded-xl p-4 mb-6 border border-welsh-green-200 dark:border-welsh-green-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Stage {currentStage.id}: {currentStage.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-welsh-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {sessionStats.cardsInSession}/{currentStage.requiredCards} cards
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-welsh-slate-700 rounded-full h-2">
            <div
              className="bg-welsh-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((sessionStats.cardsInSession / currentStage.requiredCards) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {currentStage.description}
          </p>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg dark:bg-welsh-slate-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {state.categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg dark:bg-welsh-slate-700 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Session Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-welsh-slate-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-welsh-slate-700">
          <div className="text-2xl font-bold text-welsh-green-600">{sessionStats.correct}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
        </div>
        <div className="bg-white dark:bg-welsh-slate-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-welsh-slate-700">
          <div className="text-2xl font-bold text-red-500">{sessionStats.incorrect}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
        </div>
        <div className="bg-white dark:bg-welsh-slate-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-welsh-slate-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessionStats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-welsh-slate-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-welsh-slate-700">
          <div className="text-2xl font-bold text-welsh-orange-600">{sessionStats.cardsInSession}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Session</div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative mb-8">
        <div className="perspective-1000">
          <div
            className={`relative w-full h-80 cursor-pointer transition-transform duration-600 transform-style-preserve-3d ${flipAnimation} ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleCardFlip}
          >
            {/* Front of card (English) */}
            <div className="absolute inset-0 w-full h-full backface-hidden">
              <div className="h-full bg-gradient-to-br from-welsh-green-500 to-welsh-green-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-white">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-4">
                    {currentCard?.english}
                  </div>
                  <div className="text-lg opacity-80 capitalize mb-4">
                    {currentCard?.category} • {currentCard?.difficulty}
                  </div>
                </div>
                <div className="absolute bottom-4 text-sm opacity-60">
                  Tap to see Welsh translation
                </div>
              </div>
            </div>

            {/* Back of card (Welsh) */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
              <div className="h-full bg-gradient-to-br from-welsh-slate-600 to-welsh-slate-700 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-white">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-4">
                    {currentCard?.welsh}
                  </div>
                  <div className="text-lg opacity-80 mb-4">
                    Pronunciation: {currentCard?.pronunciation}
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentCard?.welsh || '', currentCard?.pronunciation || '');
                      }}
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-4 text-sm opacity-60">
                  How well did you know this?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and Answer Buttons */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousCard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-welsh-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-welsh-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Previous</span>
        </button>

        {isFlipped && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleCardAnswer(false)}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors transform hover:scale-105"
            >
              <X size={20} />
              <span>Hard</span>
            </button>
            <button
              onClick={() => handleCardAnswer(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-welsh-green-500 hover:bg-welsh-green-600 text-white rounded-lg transition-colors transform hover:scale-105"
            >
              <Check size={20} />
              <span>Easy</span>
            </button>
          </div>
        )}

        <button
          onClick={nextCard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-welsh-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-welsh-slate-600 transition-colors"
        >
          <span>Next</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-welsh-slate-700 rounded-full h-2">
        <div
          className="bg-welsh-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FlashcardsPage;