// src/components/Flashcard.tsx
// This component displays a single interactive flashcard.
// It flips to reveal the Welsh translation and pronunciation on click
// and includes placeholder actions for audio playback and marking status.
// Updated to integrate with Firestore for 'learnt' status and prepare for TTS audio.

'use client';

import React, { useState } from 'react';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth to get Firestore instance
import { doc, updateDoc } from 'firebase/firestore'; // Firebase Firestore functions

// Define the interface for the Flashcard's properties (props).
interface FlashcardProps {
  card: {
    id: string; // Unique identifier for the flashcard (Firestore document ID)
    english: string;
    welsh: string;
    pronunciation: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    learnt: boolean; // Indicates if the user has 'mastered' this card
    // Add other fields relevant for spaced repetition like lastReviewed, reviewInterval, etc.
  };
  // Optional prop to indicate if this card is part of an active session
  // This helps determine if markAsLearnt should trigger next card logic or just update status
  isLearningSession?: boolean;
  onCardStatusChange?: (cardId: string, learntStatus: boolean) => void; // Callback for parent when status changes
  onAudioPlay?: (text: string) => void; // Callback for playing audio in parent (if managed centrally)
}

const Flashcard: React.FC<FlashcardProps> = ({ card, isLearningSession = false, onCardStatusChange, onAudioPlay }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStatus, setShowStatus] = useState<'correct' | 'incorrect' | null>(null);
  const { db, userId } = useAuth(); // Get Firestore instance and userId from AuthContext

  // Function to toggle the flipped state of the card.
  const handleFlip = () => {
    if (!showStatus) { // Prevent flipping if a status message is active
      setIsFlipped(!isFlipped);
    }
  };

  /**
   * Function for playing audio.
   * This now makes a fetch request to a Next.js API route to get the audio.
   * @param text The text to be spoken in Welsh.
   */
  const playAudio = async (text: string) => {
    if (onAudioPlay) {
      onAudioPlay(text); // Use parent-provided audio play if available
      return;
    }

    try {
      // Make a request to your Next.js API route to get the Welsh audio
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

      // Get the audio blob and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Clean up the object URL after playing
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      // You could show a user-friendly message box here instead of alert()
      // For now, using console.error as per instruction
    }
  };


  /**
   * Marks a card as correct or incorrect and updates its 'learnt' status in Firestore.
   * This would also feed into a spaced repetition algorithm (future enhancement).
   * @param correct Boolean indicating if the user answered correctly.
   */
  const markAsLearnt = async (correct: boolean) => {
    setShowStatus(correct ? 'correct' : 'incorrect'); // Show status for visual feedback

    if (db && userId && card.id) {
      try {
        // Construct the Firestore document path
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const cardRef = doc(db, `artifacts/${appId}/users/${userId}/flashcards`, card.id);

        // Update the 'learnt' status (and potentially other spaced repetition fields)
        await updateDoc(cardRef, {
          learnt: correct,
          // You would add more sophisticated spaced repetition logic here:
          // lastReviewed: new Date(),
          // reviewInterval: calculateNextInterval(card.reviewInterval, correct),
          // nextReviewDate: calculateNextReviewDate(new Date(), correct),
        });
        console.log(`Flashcard ${card.id} marked as ${correct ? 'learnt' : 'not learnt'} in Firestore.`);

        if (onCardStatusChange) {
            onCardStatusChange(card.id, correct);
        }
      } catch (error) {
        console.error('Error updating flashcard status in Firestore:', error);
        // Implement a non-blocking UI message for the user if needed
      }
    } else {
        console.warn("Firestore or User ID not available, cannot update flashcard status.");
    }

    // After a short delay, reset status and flip back
    setTimeout(() => {
      setIsFlipped(false);
      setShowStatus(null);
      // In a real learning session, you might trigger `onCardStatusChange`
      // to handle progression to the next card or quiz.
    }, 1500);
  };

  // Tailwind CSS classes for different difficulty levels for visual indication.
  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
    'Intermediate': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200',
    'Advanced': 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200',
  };

  return (
    // Main container for the flashcard.
    // `perspective-1000` is crucial for the 3D flip effect.
    // `rotate-y-180` is applied when `isFlipped` is true, controlled by `transition-transform`.
    <div
      className={`relative w-full h-60 rounded-xl shadow-lg transform transition-transform duration-500 cursor-pointer ${
        isFlipped ? 'rotate-y-180' : ''
      } perspective-1000`}
      onClick={handleFlip} // Attach click handler to flip the card.
    >
      {/* Front of the card */}
      <div
        className={`absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex flex-col items-center justify-center p-6 text-white text-center shadow-lg transition-opacity duration-300 ${
          isFlipped ? 'opacity-0' : 'opacity-100' // Hide front when flipped, show when not.
        }`}
      >
        <p className="text-3xl font-bold mb-3">{card.english}</p>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[card.difficulty]}`}>
          {card.difficulty}
        </span>
        <p className="absolute bottom-4 left-4 text-xs text-indigo-200">Category: {card.category}</p>
      </div>

      {/* Back of the card */}
      <div
        className={`absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-lg transition-opacity duration-300 ${
          isFlipped ? 'opacity-100' : 'opacity-0' // Show back when flipped, hide when not.
        }`}
      >
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{card.welsh}</p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 italic">({card.pronunciation})</p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the parent div's onClick (card flip) from firing.
            playAudio(card.welsh); // Call the audio playback function.
          }}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 shadow-md"
          aria-label={`Play pronunciation for ${card.welsh}`}
        >
          <Volume2 className="w-6 h-6" /> {/* Speaker icon */}
        </button>

        {/* Mark as learnt/not learnt buttons (visible only when the card is flipped) */}
        {isFlipped && (
          <div className="absolute bottom-4 flex space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card flip.
                markAsLearnt(true); // Mark as correct.
              }}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-all duration-200 transform active:scale-95"
              title="Mark as Correct"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card flip.
                markAsLearnt(false); // Mark as incorrect.
              }}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all duration-200 transform active:scale-95"
              title="Mark as Incorrect"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Status overlay (Correct/Incorrect) - fades in/out */}
        {showStatus && (
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-xl bg-opacity-70 text-white font-bold text-2xl transition-opacity duration-300 ${
              showStatus === 'correct' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {showStatus === 'correct' ? 'Correct!' : 'Incorrect!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;