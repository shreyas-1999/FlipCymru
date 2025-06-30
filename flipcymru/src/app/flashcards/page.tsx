// src/app/flashcards/page.tsx
// This page displays a list of interactive flashcards for Welsh language learning.
// Updated to fetch flashcards from Firebase Firestore, allow creation of new cards
// with Gemini API for translation/pronunciation, and integrate TTS audio playback.

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/Layout'; // <--- ADDED THIS IMPORT
import Flashcard from '@/components/Flashcard';
import { BookOpen, PlusCircle, Search, Sparkles, Volume2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, addDoc, doc, serverTimestamp, orderBy, limit, deleteDoc } from 'firebase/firestore'; // Firebase Firestore functions
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, CircularProgress, IconButton, Alert } from '@mui/material'; // Material UI for dialogs and buttons
import { parseISO, formatDistanceToNowStrict } from 'date-fns'; // For time formatting

// Declare __app_id globally for TypeScript
declare const __app_id: string | undefined;

// Define the interface for a Flashcard object.
interface FlashcardType {
  id: string; // Firestore document ID
  english: string;
  welsh: string;
  pronunciation: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learnt: boolean;
  createdAt: any; // Timestamp
  lastReviewed?: any; // Optional timestamp for spaced repetition
}

// Define the interface for a Flashcard Category.
interface FlashcardCategory {
    id: string;
    name: string;
    userId: string;
}

const FlashcardsPage: React.FC = () => {
  const { db, userId, user, loading } = useAuth(); // Get user, loading
  const router = useRouter(); // Initialize useRouter
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]); // State for all flashcards from Firestore
  const [categories, setCategories] = useState<FlashcardCategory[]>([]); // State for flashcard categories
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showAddCardModal, setShowAddCardModal] = useState(false); // State for Add New Card modal visibility
  const [newEnglishText, setNewEnglishText] = useState(''); // State for new card English text input
  const [newCardCategory, setNewCardCategory] = useState(''); // State for new card category selection
  const [newCategoryName, setNewCategoryName] = useState(''); // State for creating a new category
  const [isGenerating, setIsGenerating] = useState(false); // State for generation loading indicator
  const [generationError, setGenerationError] = useState<string | null>(null); // State for generation errors

  // --- Route Protection ---
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Fetch flashcards and categories from Firestore when component mounts or userId changes
  useEffect(() => {
    if (!db || !userId) {
        setFlashcards([]); // Clear flashcards if no user/db
        setCategories([]); // Clear categories
        return;
    }

    // Determine the base path for user-specific data in Firestore
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userFlashcardsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/flashcards`);
    const userCategoriesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/flashcardCategories`);

    // Setup real-time listener for flashcards
    const unsubscribeFlashcards = onSnapshot(userFlashcardsCollectionRef, (snapshot) => {
      const fetchedCards: FlashcardType[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as FlashcardType));
      // Sort flashcards by creation date, newest first
      fetchedCards.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
      setFlashcards(fetchedCards);
    }, (error) => {
        console.error("Error fetching flashcards:", error);
    });

    // Setup real-time listener for categories
    const unsubscribeCategories = onSnapshot(userCategoriesCollectionRef, (snapshot) => {
        const fetchedCategories: FlashcardCategory[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as FlashcardCategory));
        setCategories(fetchedCategories);
    }, (error) => {
        console.error("Error fetching categories:", error);
    });


    // Cleanup listeners on component unmount
    return () => {
      unsubscribeFlashcards();
      unsubscribeCategories();
    };
  }, [db, userId]);


  // Filter flashcards based on search term, category, and difficulty
  const filteredFlashcards = flashcards.filter((card) => {
    const matchesSearch =
      searchTerm === '' ||
      card.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.welsh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.pronunciation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || card.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Unique difficulties for filter dropdown
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']; // Hardcode for consistency

  // Handle adding a new flashcard
  const handleAddNewCard = async () => {
    if (!db || !userId || !newEnglishText) {
      setGenerationError("Please enter English text for the new flashcard.");
      return;
    }
    if (!newCardCategory && !newCategoryName) {
        setGenerationError("Please select an existing category or provide a new category name.");
        return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
        let finalCategory = newCardCategory;
        if (newCategoryName) {
            // Check if new category already exists to avoid duplicates
            const existingCategory = categories.find(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase());
            if (existingCategory) {
                finalCategory = existingCategory.name; // Use existing category name
            } else {
                // Add new category to Firestore
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const categoriesColRef = collection(db, `artifacts/${appId}/users/${userId}/flashcardCategories`);
                const newCatDocRef = await addDoc(categoriesColRef, {
                    name: newCategoryName,
                    userId: userId,
                    createdAt: new Date(),
                });
                finalCategory = newCategoryName; // Use the newly created category name
                console.log("New category added:", newCategoryName);
            }
        }

        // Call Next.js API route for translation and pronunciation text
        const translationResponse = await fetch('/api/gemini-translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newEnglishText, targetLanguage: 'Welsh' }), // Request Welsh translation
        });

        if (!translationResponse.ok) {
            const errorBody = await translationResponse.json();
            throw new Error(`Translation API error: ${errorBody.error || translationResponse.statusText}`);
        }
        const { translatedText, pronunciationText } = await translationResponse.json();

        if (!translatedText) {
            throw new Error('Translation failed: No Welsh text returned.');
        }

        // Add the new flashcard to Firestore
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const flashcardsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/flashcards`);

        await addDoc(flashcardsCollectionRef, {
            english: newEnglishText,
            welsh: translatedText,
            pronunciation: pronunciationText || 'N/A', // Use generated pronunciation or 'N/A'
            category: finalCategory,
            difficulty: 'Beginner', // New cards start as beginner
            learnt: false, // Newly created cards are not yet learnt
            createdAt: serverTimestamp(), // Changed to serverTimestamp
        });

        // Reset form and close modal
        setNewEnglishText('');
        setNewCardCategory('');
        setNewCategoryName('');
        setShowAddCardModal(false);
        console.log('New flashcard added successfully!');

    } catch (error: any) {
        console.error('Error creating new flashcard:', error);
        setGenerationError(error.message || 'Failed to create new flashcard.');
    } finally {
        setIsGenerating(false);
    }
  };

  // Centralized audio playback function for Flashcard component.
  const handlePlayAudio = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/tts-welsh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing audio from FlashcardsPage:', error);
    }
  }, []);

  // Display loading spinner while authentication is being determined, or if user is not logged in
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 pb-20"> {/* Added pb-20 for navbar space */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
          Flashcards
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center lg:text-left">
          Master Welsh vocabulary with interactive flashcards and spaced repetition.
        </p>

        {/* Action Buttons & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search flashcards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search flashcards"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
            <button
              className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              onClick={() => setShowAddCardModal(true)} // Open the Add New Card modal
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Card
            </button>
            <button
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={() => alert('Start learning session functionality coming soon! This will implement spaced repetition and quizzes.')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Session
            </button>
          </div>
        </div>

        {/* Flashcards List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.length === 0 && searchTerm === '' && selectedCategory === 'All' && selectedDifficulty === 'All' ? (
            <p className="text-center text-gray-500 dark:text-gray-400 col-span-full py-10">
              No flashcards added yet. Click &quot;New Card&quot; to create your first one!
            </p>
          ) : filteredFlashcards.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 col-span-full py-10">
              No flashcards found matching your criteria. Try adjusting your search or filters.
            </p>
          ) : (
            filteredFlashcards.map((card) => (
              <Flashcard key={card.id} card={card} onAudioPlay={handlePlayAudio} />
            ))
          )}
        </div>
      </div>

      {/* Add New Flashcard Modal (Material-UI Dialog) */}
      <Dialog open={showAddCardModal} onClose={() => setShowAddCardModal(false)} fullWidth maxWidth="sm">
        <DialogTitle className="!bg-blue-600 !text-white">Create New Flashcard</DialogTitle>
        <DialogContent className="!py-6 !px-4 dark:!bg-gray-800">
            {generationError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 text-sm">
                    {generationError}
                </div>
            )}
          <TextField
            autoFocus
            margin="dense"
            label="English Text/Phrase"
            type="text"
            fullWidth
            variant="outlined"
            value={newEnglishText}
            onChange={(e) => setNewEnglishText(e.target.value)}
            disabled={isGenerating}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'gray-300' },
                    '&:hover fieldset': { borderColor: 'blue-500' },
                    '&.Mui-focused fieldset': { borderColor: 'blue-500' },
                    '& input': { color: 'gray-900', },
                },
                '& .MuiInputLabel-root': { color: 'gray-600' },
                '& .Mui-disabled': {
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray-400 !important' },
                    '& .MuiInputBase-input': { color: 'gray-500 !important' },
                    '& .MuiInputLabel-root': { color: 'gray-500 !important' }
                },
                // Dark mode styles
                '.dark & .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'gray-600' },
                    '&:hover fieldset': { borderColor: 'blue-400' },
                    '&.Mui-focused fieldset': { borderColor: 'blue-400' },
                    '& input': { color: 'white' },
                },
                '.dark & .MuiInputLabel-root': { color: 'gray-400' },
                '.dark & .Mui-disabled': {
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray-500 !important' },
                    '& .MuiInputBase-input': { color: 'gray-400 !important' },
                    '& .MuiInputLabel-root': { color: 'gray-500 !important' }
                },
            }}
          />

            <FormControl fullWidth margin="dense" variant="outlined" sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'gray-300' },
                    '&:hover fieldset': { borderColor: 'blue-500' },
                    '&.Mui-focused fieldset': { borderColor: 'blue-500' },
                    '& .MuiSelect-select': { color: 'gray-900' },
                },
                '& .MuiInputLabel-root': { color: 'gray-600' },
                '.dark & .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'gray-600' },
                    '&:hover fieldset': { borderColor: 'blue-400' },
                    '&.Mui-focused fieldset': { borderColor: 'blue-400' },
                    '& .MuiSelect-select': { color: 'white' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                },
                '.dark & .MuiInputLabel-root': { color: 'gray-400' },
            }}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                    labelId="category-select-label"
                    value={newCardCategory}
                    onChange={(e) => { setNewCardCategory(e.target.value as string); setNewCategoryName(''); }}
                    label="Category"
                    disabled={isGenerating}
                >
                    <MenuItem value="">
                        <em>None (or New Category)</em>
                    </MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                margin="dense"
                label="Or create New Category Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setNewCardCategory(''); }}
                disabled={isGenerating}
                sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-300' },
                        '&:hover fieldset': { borderColor: 'blue-500' },
                        '&.Mui-focused fieldset': { borderColor: 'blue-500' },
                        '& input': { color: 'gray-900' },
                    },
                    '& .MuiInputLabel-root': { color: 'gray-600' },
                    '& .Mui-disabled': {
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray-400 !important' },
                        '& .MuiInputBase-input': { color: 'gray-500 !important' },
                        '& .MuiInputLabel-root': { color: 'gray-500 !important' }
                    },
                    '.dark & .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-600' },
                        '&:hover fieldset': { borderColor: 'blue-400' },
                        '&.Mui-focused fieldset': { borderColor: 'blue-400' },
                        '& input': { color: 'white' },
                    },
                    '.dark & .MuiInputLabel-root': { color: 'gray-400' },
                    '.dark & .Mui-disabled': {
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray-500 !important' },
                        '& .MuiInputBase-input': { color: 'gray-400 !important' },
                        '& .MuiInputLabel-root': { color: 'gray-500 !important' }
                    },
                }}
            />
        </DialogContent>
        <DialogActions className="!bg-gray-100 dark:!bg-gray-900 !px-4 !py-3 !justify-between">
            <Button onClick={() => setShowAddCardModal(false)} disabled={isGenerating} sx={{ color: 'gray-600', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }, '.dark &': { color: 'gray-300', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } } }}>Cancel</Button>
            <Button
                onClick={handleAddNewCard}
                disabled={isGenerating || !newEnglishText || (!newCardCategory && !newCategoryName)}
                variant="contained"
                sx={{
                    bgcolor: 'blue-600',
                    color: 'white',
                    '&:hover': { bgcolor: 'blue-700' },
                    '&.Mui-disabled': { bgcolor: 'gray-400', color: 'gray-700' },
                    '.dark &': {
                        bgcolor: 'blue-500',
                        '&:hover': { bgcolor: 'blue-600' },
                        '&.Mui-disabled': { bgcolor: 'gray-700', color: 'gray-400' }
                    }
                }}
            >
                {isGenerating ? <CircularProgress size={24} color="inherit" /> : 'Add Card'}
            </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default FlashcardsPage;