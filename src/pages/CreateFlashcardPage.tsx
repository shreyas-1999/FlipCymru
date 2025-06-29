import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockWelshTranslations } from '../data/mockData';

const CreateFlashcardPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    english: '',
    category: 'custom',
    newCategory: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTranslation, setGeneratedTranslation] = useState<{
    welsh: string;
    pronunciation: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear generated translation when English text changes
    if (e.target.name === 'english') {
      setGeneratedTranslation(null);
    }
  };

  const generateWelshTranslation = async () => {
    if (!formData.english.trim()) return;

    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerInput = formData.english.toLowerCase().trim();
    const translation = mockWelshTranslations[lowerInput];
    
    if (translation) {
      setGeneratedTranslation(translation);
    } else {
      // Generate a mock translation for demo purposes
      setGeneratedTranslation({
        welsh: `[Welsh for "${formData.english}"]`,
        pronunciation: `[Pronunciation for "${formData.english}"]`,
      });
    }
    
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.english.trim() || !generatedTranslation) return;

    // Handle new category creation
    let categoryId = formData.category;
    if (formData.category === 'new' && formData.newCategory.trim()) {
      categoryId = formData.newCategory.toLowerCase().replace(/\s+/g, '-');
      const newCategory = {
        id: categoryId,
        name: formData.newCategory.trim(),
        icon: 'folder',
        color: 'bg-purple-500',
        isCustom: true,
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    }

    const newFlashcard = {
      id: Date.now().toString(),
      english: formData.english.trim(),
      welsh: generatedTranslation.welsh,
      pronunciation: generatedTranslation.pronunciation,
      category: categoryId,
      difficulty: formData.difficulty,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewed: '',
      nextReview: new Date().toISOString(),
      isCustom: true,
      stageCompleted: 0,
    };

    dispatch({ type: 'ADD_FLASHCARD', payload: newFlashcard });
    
    // Award XP for creating custom flashcard
    if (state.user) {
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { xp: state.user.xp + 15 } 
      });
    }
    
    // Unlock achievement
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'custom-creator' });
    
    dispatch({ type: 'SET_VIEW', payload: 'flashcards' });
  };

  const goBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'flashcards' });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Flashcards</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-welsh-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-welsh-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-welsh-green-500 to-welsh-green-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Create Custom Flashcard</h1>
          <p className="opacity-90">Enter an English word or phrase and we'll generate the Welsh translation</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* English Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              English Word or Phrase
            </label>
            <div className="flex space-x-3">
              <textarea
                name="english"
                value={formData.english}
                onChange={handleInputChange}
                placeholder="Enter the English word or phrase..."
                className="flex-1 h-24 px-3 py-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg focus:ring-2 focus:ring-welsh-green-500 focus:border-transparent dark:bg-welsh-slate-700 dark:text-white resize-none"
                required
              />
              <button
                type="button"
                onClick={generateWelshTranslation}
                disabled={!formData.english.trim() || isGenerating}
                className="px-4 py-2 bg-welsh-orange-600 hover:bg-welsh-orange-700 disabled:bg-gray-300 dark:disabled:bg-welsh-slate-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isGenerating ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click "Generate" to automatically create the Welsh translation and pronunciation
            </p>
          </div>

          {/* Generated Welsh Translation */}
          {generatedTranslation && (
            <div className="bg-gradient-to-br from-welsh-green-50 to-welsh-slate-50 dark:from-welsh-green-900/20 dark:to-welsh-slate-900/20 rounded-lg p-4 border border-welsh-green-200 dark:border-welsh-green-800">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Generated Translation</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Welsh Translation
                  </label>
                  <div className="text-lg font-semibold text-welsh-green-700 dark:text-welsh-green-400">
                    {generatedTranslation.welsh}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Pronunciation Guide
                  </label>
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {generatedTranslation.pronunciation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg focus:ring-2 focus:ring-welsh-green-500 focus:border-transparent dark:bg-welsh-slate-700 dark:text-white"
            >
              <option value="custom">Custom</option>
              {state.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              <option value="new">+ Create New Category</option>
            </select>
          </div>

          {/* New Category Name */}
          {formData.category === 'new' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Category Name
              </label>
              <input
                type="text"
                name="newCategory"
                value={formData.newCategory}
                onChange={handleInputChange}
                placeholder="Enter category name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-welsh-slate-600 rounded-lg focus:ring-2 focus:ring-welsh-green-500 focus:border-transparent dark:bg-welsh-slate-700 dark:text-white"
                required
              />
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
                { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
                { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
              ].map(difficulty => (
                <button
                  key={difficulty.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: difficulty.value as any })}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    formData.difficulty === difficulty.value
                      ? `${difficulty.color} border-current`
                      : 'border-gray-200 dark:border-welsh-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-welsh-slate-700'
                  }`}
                >
                  <span className="font-medium">{difficulty.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {formData.english && generatedTranslation && (
            <div className="bg-gray-50 dark:bg-welsh-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Flashcard Preview</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-welsh-green-500 to-welsh-green-600 rounded-lg p-4 text-white text-center">
                  <div className="text-lg font-semibold">{formData.english}</div>
                  <div className="text-sm opacity-80 mt-1">Front (English)</div>
                </div>
                <div className="bg-gradient-to-br from-welsh-slate-600 to-welsh-slate-700 rounded-lg p-4 text-white text-center">
                  <div className="text-lg font-semibold">{generatedTranslation.welsh}</div>
                  <div className="text-xs opacity-80 mt-1">{generatedTranslation.pronunciation}</div>
                  <div className="text-sm opacity-80 mt-1">Back (Welsh)</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-welsh-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-welsh-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.english.trim() || !generatedTranslation}
              className="flex-1 flex items-center justify-center space-x-2 bg-welsh-green-600 hover:bg-welsh-green-700 disabled:bg-gray-300 dark:disabled:bg-welsh-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save size={20} />
              <span>Create Flashcard</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gradient-to-br from-welsh-orange-50 to-welsh-green-50 dark:from-welsh-orange-900/20 dark:to-welsh-green-900/20 rounded-xl p-6 border border-welsh-orange-200 dark:border-welsh-orange-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Smart Translation Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-2">
            <span className="text-welsh-green-600 mt-1">•</span>
            <span>Automatic Welsh translation generation with pronunciation guides</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-welsh-green-600 mt-1">•</span>
            <span>Create custom categories to organize your learning</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-welsh-green-600 mt-1">•</span>
            <span>Earn XP points for creating custom flashcards</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-welsh-green-600 mt-1">•</span>
            <span>Your custom cards integrate seamlessly with quiz stages</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreateFlashcardPage;