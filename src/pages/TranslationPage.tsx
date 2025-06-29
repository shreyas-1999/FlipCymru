import React, { useState } from 'react';
import { ArrowUpDown, Volume2, Mic, Copy, Heart, BookOpen, Camera, History } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TranslationPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState<'welsh' | 'english'>('english');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const mockTranslations: Record<string, string> = {
    // English to Welsh
    'hello': 'helo',
    'good morning': 'bore da',
    'thank you': 'diolch',
    'please': 'os gwelwch yn dda',
    'excuse me': 'esgusodwch fi',
    'how are you': 'sut mae',
    'what is your name': 'beth yw eich enw',
    'my name is': 'fy enw i yw',
    'where is': 'ble mae',
    'i love you': 'rwy\'n dy garu di',
    'food': 'bwyd',
    'water': 'dŵr',
    'bread': 'bara',
    'milk': 'llaeth',
    'tea': 'te',
    'coffee': 'coffi',
    'family': 'teulu',
    'mother': 'mam',
    'father': 'tad',
    'school': 'ysgol',
    'house': 'tŷ',
    'car': 'car',
    'book': 'llyfr',
    'learn': 'dysgu',
    'speak': 'siarad',
    'understand': 'deall',
    // Welsh to English
    'helo': 'hello',
    'bore da': 'good morning',
    'diolch': 'thank you',
    'os gwelwch yn dda': 'please',
    'esgusodwch fi': 'excuse me',
    'sut mae': 'how are you',
    'beth yw eich enw': 'what is your name',
    'fy enw i yw': 'my name is',
    'ble mae': 'where is',
    'rwy\'n dy garu di': 'i love you',
    'bwyd': 'food',
    'dŵr': 'water',
    'bara': 'bread',
    'llaeth': 'milk',
    'te': 'tea',
    'coffi': 'coffee',
    'teulu': 'family',
    'mam': 'mother',
    'tad': 'father',
    'ysgol': 'school',
    'tŷ': 'house',
    'car': 'car',
    'llyfr': 'book',
    'dysgu': 'learn',
    'siarad': 'speak',
    'deall': 'understand',
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerInput = inputText.toLowerCase().trim();
    const translation = mockTranslations[lowerInput] || `[Translation for "${inputText}" not available in demo]`;
    
    setTranslatedText(translation);
    setIsLoading(false);

    // Add to translation history
    const newTranslation = {
      id: Date.now().toString(),
      originalText: inputText,
      translatedText: translation,
      fromLanguage,
      timestamp: new Date().toISOString(),
      isFavorite: false,
    };
    
    dispatch({ type: 'ADD_TRANSLATION', payload: newTranslation });
  };

  const swapLanguages = () => {
    setFromLanguage(fromLanguage === 'welsh' ? 'english' : 'welsh');
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const playAudio = (text: string, language: 'welsh' | 'english') => {
    console.log(`Playing ${language} audio for: ${text}`);
    // In real app would use Text-to-Speech API
  };

  const saveAsFlashcard = () => {
    if (!inputText.trim() || !translatedText.trim()) return;

    const newFlashcard = {
      id: Date.now().toString(),
      welsh: fromLanguage === 'welsh' ? inputText : translatedText,
      english: fromLanguage === 'english' ? inputText : translatedText,
      category: 'saved-translations',
      difficulty: 'beginner' as const,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewed: '',
      nextReview: new Date().toISOString(),
      isCustom: true,
    };

    dispatch({ type: 'ADD_FLASHCARD', payload: newFlashcard });
    
    // Show success message (in real app would use toast notification)
    alert('Saved as flashcard!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In real app would show toast notification
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Translation</h1>
          <p className="text-gray-600 dark:text-gray-400">Translate between Welsh and English</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-welsh-slate-700 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 transition-colors"
        >
          <History size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Translation History */}
      {showHistory && (
        <div className="bg-white dark:bg-welsh-slate-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-welsh-slate-700 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Translations</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {state.translationHistory.slice(0, 10).map(translation => (
              <div key={translation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-welsh-slate-700 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {translation.originalText} → {translation.translatedText}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {translation.fromLanguage === 'welsh' ? 'Welsh → English' : 'English → Welsh'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setInputText(translation.originalText);
                    setTranslatedText(translation.translatedText);
                    setFromLanguage(translation.fromLanguage);
                  }}
                  className="text-welsh-green-600 hover:text-welsh-green-700 text-sm"
                >
                  Use
                </button>
              </div>
            ))}
            {state.translationHistory.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No translations yet</p>
            )}
          </div>
        </div>
      )}

      {/* Main Translation Interface */}
      <div className="bg-white dark:bg-welsh-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-welsh-slate-700 overflow-hidden">
        {/* Language Selector */}
        <div className="bg-gray-50 dark:bg-welsh-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              fromLanguage === 'english' 
                ? 'bg-welsh-green-100 dark:bg-welsh-green-900/20 text-welsh-green-600 dark:text-welsh-green-400'
                : 'bg-gray-200 dark:bg-welsh-slate-600 text-gray-600 dark:text-gray-400'
            }`}>
              English
            </span>
            <button
              onClick={swapLanguages}
              className="p-2 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded-lg transition-colors"
            >
              <ArrowUpDown size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              fromLanguage === 'welsh' 
                ? 'bg-welsh-green-100 dark:bg-welsh-green-900/20 text-welsh-green-600 dark:text-welsh-green-400'
                : 'bg-gray-200 dark:bg-welsh-slate-600 text-gray-600 dark:text-gray-400'
            }`}>
              Welsh
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded-lg transition-colors">
              <Camera size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded-lg transition-colors">
              <Mic size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter text in ${fromLanguage === 'welsh' ? 'Welsh' : 'English'}...`}
            className="w-full h-32 resize-none border-none outline-none bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleTranslate();
              }
            }}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playAudio(inputText, fromLanguage)}
                disabled={!inputText.trim()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-welsh-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => copyToClipboard(inputText)}
                disabled={!inputText.trim()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-welsh-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Copy size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isLoading}
              className="bg-welsh-green-600 hover:bg-welsh-green-700 disabled:bg-gray-300 dark:disabled:bg-welsh-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>

        {/* Translation Result */}
        {(translatedText || isLoading) && (
          <div className="border-t border-gray-200 dark:border-welsh-slate-700 bg-gray-50 dark:bg-welsh-slate-700/50 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-welsh-green-600"></div>
              </div>
            ) : (
              <>
                <div className="text-lg text-gray-900 dark:text-white mb-4">
                  {translatedText}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => playAudio(translatedText, fromLanguage === 'welsh' ? 'english' : 'welsh')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded-lg transition-colors"
                    >
                      <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(translatedText)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded-lg transition-colors"
                    >
                      <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-welsh-slate-600 rounded-lg transition-colors">
                      <Heart size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={saveAsFlashcard}
                    className="flex items-center space-x-2 bg-welsh-orange-600 hover:bg-welsh-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <BookOpen size={16} />
                    <span>Save as Flashcard</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Translations */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Translations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { english: 'Hello', welsh: 'Helo' },
            { english: 'Thank you', welsh: 'Diolch' },
            { english: 'Good morning', welsh: 'Bore da' },
            { english: 'How are you?', welsh: 'Sut mae?' },
            { english: 'Please', welsh: 'Os gwelwch yn dda' },
            { english: 'Excuse me', welsh: 'Esgusodwch fi' },
          ].map((phrase, index) => (
            <button
              key={index}
              onClick={() => {
                setInputText(phrase.english);
                setTranslatedText(phrase.welsh);
                setFromLanguage('english');
              }}
              className="bg-white dark:bg-welsh-slate-800 border border-gray-200 dark:border-welsh-slate-700 rounded-lg p-3 text-left hover:bg-gray-50 dark:hover:bg-welsh-slate-700 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">{phrase.english}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{phrase.welsh}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationPage;