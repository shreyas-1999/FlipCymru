"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { flashcardService, type FlashcardProgress } from "@/lib/firebase-flashcards"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Volume2, Check, ArrowRight, RotateCcw, BookOpen, Trophy, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Flashcard {
  id: string
  english: string
  welsh: string
  pronunciation: string
  category: string
  difficulty: string
  learnt: boolean
  createdAt: string
  exampleSentences?: Array<{
    originalSentence: string
    sourceTranslation: string
  }>
}

interface FlashcardWithProgress extends Flashcard {
  progress: FlashcardProgress
}

interface QuizQuestion {
  card: FlashcardWithProgress
  userAnswer: string
  isCorrect?: boolean
}

interface LearnDeckModalProps {
  categoryName: string
  onClose: () => void
  onMarkAsLearnt: (cardId: string) => void
}

export function LearnDeckModal({ categoryName, onClose, onMarkAsLearnt }: LearnDeckModalProps) {
  const api = useApi()
  const { user } = useAuth()
  const { toast } = useToast()

  const [allCards, setAllCards] = useState<FlashcardWithProgress[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [viewedCards, setViewedCards] = useState<FlashcardWithProgress[]>([])
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showExamples, setShowExamples] = useState(false)

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState("")
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Learning cycle state
  const [cardsShownSinceQuiz, setCardsShownSinceQuiz] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    if (user) {
      fetchCardsWithProgress()
    }
  }, [categoryName, user])

  const fetchCardsWithProgress = async () => {
    if (!user) return

    try {
      const response = await api.getFlashcards({ category: categoryName })
      if (response.data) {
        const cardsWithProgress: FlashcardWithProgress[] = []

        for (const card of response.data) {
          const progress = await flashcardService.getCardProgress(user.uid, card.id)
          cardsWithProgress.push({
            ...card,
            progress: progress || {
              cardId: card.id,
              userId: user.uid,
              points: 0,
              lastReviewed: new Date(),
              reviewCount: 0,
              correctAnswers: 0,
              incorrectAnswers: 0,
              learnt: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }

        // Filter out fully learnt cards and sort by probability
        const unlearnedCards = cardsWithProgress.filter((card) => card.progress.points < 50)
        const shuffledCards = shuffleCardsByProbability(unlearnedCards)

        setAllCards(shuffledCards)
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setViewedCards([])
        setCardsShownSinceQuiz(0)

        // Calculate total points
        const total = cardsWithProgress.reduce((sum, card) => sum + card.progress.points, 0)
        setTotalPoints(total)
      }
    } catch (error) {
      console.error("Error fetching cards with progress:", error)
      toast({
        title: "Error",
        description: "Could not load flashcards",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const shuffleCardsByProbability = (cards: FlashcardWithProgress[]): FlashcardWithProgress[] => {
    // Create weighted array based on show probability
    const weightedCards: FlashcardWithProgress[] = []
    cards.forEach((card) => {
      const probability = flashcardService.getCardShowProbability(card.progress.points)
      const weight = Math.ceil(probability * 10) // Convert to integer weight
      for (let i = 0; i < weight; i++) {
        weightedCards.push(card)
      }
    })

    // Shuffle the weighted array
    for (let i = weightedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[weightedCards[i], weightedCards[j]] = [weightedCards[j], weightedCards[i]]
    }

    return weightedCards
  }

  const currentCard = allCards[currentCardIndex]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = async () => {
    if (!currentCard || !user) return

    // Add current card to viewed cards if not already there
    if (!viewedCards.find((card) => card.id === currentCard.id)) {
      setViewedCards((prev) => [...prev, currentCard])
    }

    // Update card as reviewed
    await flashcardService.updateCardProgress(user.uid, currentCard.id, {
      lastReviewed: new Date(),
    })

    const newCardsShown = cardsShownSinceQuiz + 1

    // Check if we should show a quiz (every 5 cards)
    if (newCardsShown >= 5 && viewedCards.length >= 2) {
      generateQuiz()
      return
    }

    // Move to next card or reshuffle
    const nextIndex = currentCardIndex + 1
    if (nextIndex < allCards.length) {
      setCurrentCardIndex(nextIndex)
      setIsFlipped(false)
      setCardsShownSinceQuiz(newCardsShown)
    } else {
      // Reshuffle and continue with available cards
      const availableCards = allCards.filter((card) => card.progress.points < 50)
      if (availableCards.length > 0) {
        const reshuffled = shuffleCardsByProbability(availableCards)
        setAllCards(reshuffled)
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setCardsShownSinceQuiz(newCardsShown)
      } else {
        // All cards are mastered
        toast({
          title: "Congratulations!",
          description: "You've mastered all cards in this category!",
        })
        onClose()
      }
    }
  }

  const generateQuiz = () => {
    // Select 2 random cards from viewed cards based on quiz probability
    const eligibleCards = viewedCards.filter((card) => card.progress.points < 50)
    const weightedCards: FlashcardWithProgress[] = []

    eligibleCards.forEach((card) => {
      const probability = flashcardService.getQuizProbability(card.progress.points)
      const weight = Math.ceil(probability * 10)
      for (let i = 0; i < weight; i++) {
        weightedCards.push(card)
      }
    })

    // Shuffle and pick 2 unique cards
    const shuffled = [...weightedCards].sort(() => Math.random() - 0.5)
    const selectedCards: FlashcardWithProgress[] = []
    const usedIds = new Set<string>()

    for (const card of shuffled) {
      if (!usedIds.has(card.id) && selectedCards.length < 2) {
        selectedCards.push(card)
        usedIds.add(card.id)
      }
    }

    const questions: QuizQuestion[] = selectedCards.map((card) => ({
      card,
      userAnswer: "",
    }))

    setQuizQuestions(questions)
    setCurrentQuizIndex(0)
    setQuizAnswer("")
    setQuizSubmitted(false)
    setShowQuiz(true)
  }

  const handleQuizSubmit = async () => {
    if (!user || !quizQuestions[currentQuizIndex]) return

    const currentQuestion = quizQuestions[currentQuizIndex]
    const correctAnswer = currentQuestion.card.welsh.toLowerCase().trim()
    const userAnswer = quizAnswer.toLowerCase().trim()
    const isCorrect = correctAnswer === userAnswer

    // Update question with result
    const updatedQuestions = [...quizQuestions]
    updatedQuestions[currentQuizIndex] = {
      ...currentQuestion,
      userAnswer: quizAnswer,
      isCorrect,
    }
    setQuizQuestions(updatedQuestions)
    setQuizSubmitted(true)

    // Add points if correct
    if (isCorrect) {
      const updatedProgress = await flashcardService.addPoints(user.uid, currentQuestion.card.id, 10, true)

      // Update the card in our local state
      setAllCards((prev) =>
        prev.map((card) => (card.id === currentQuestion.card.id ? { ...card, progress: updatedProgress } : card)),
      )

      // If card is now learnt, notify parent
      if (updatedProgress.learnt) {
        onMarkAsLearnt(currentQuestion.card.id)
      }

      toast({
        title: "Correct! +10 points",
        description: `${currentQuestion.card.english} → ${currentQuestion.card.welsh}`,
      })
    } else {
      await flashcardService.addPoints(user.uid, currentQuestion.card.id, 0, false)
      toast({
        title: "Incorrect",
        description: `Correct answer: ${currentQuestion.card.welsh}`,
        variant: "destructive",
      })
    }

    // Refresh total points
    const allProgress = await Promise.all(allCards.map((card) => flashcardService.getCardProgress(user.uid, card.id)))
    const total = allProgress.reduce((sum, progress) => sum + (progress?.points || 0), 0)
    setTotalPoints(total)
  }

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setQuizAnswer("")
      setQuizSubmitted(false)
    } else {
      // Quiz complete, return to learning
      setShowQuiz(false)
      setCardsShownSinceQuiz(0)
      handleNext()
    }
  }

  const playPronunciation = async (text: string) => {
    try {
      const audioBlob = await api.textToSpeech(text)
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error("Error playing pronunciation:", error)
      toast({
        title: "Error",
        description: "Could not play pronunciation",
        variant: "destructive",
      })
    }
  }

  const handleRestart = () => {
    fetchCardsWithProgress()
  }

  const handleShowExamples = () => {
    setShowExamples(true)
  }

  const handleCloseExamples = () => {
    setShowExamples(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (allCards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <Trophy className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
          <p className="text-gray-600 mb-6">You've mastered all flashcards in the {categoryName} category!</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  // Quiz Modal
  if (showQuiz && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentQuizIndex]
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Quiz Time!
              </h2>
              <p className="text-gray-600">
                Question {currentQuizIndex + 1} of {quizQuestions.length}
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              +10 points for correct answer
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Translate to Welsh:</h3>
              <p className="text-3xl font-bold text-blue-600">{currentQuestion.card.english}</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="quiz-answer">Your Answer:</Label>
              <Input
                id="quiz-answer"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                placeholder="Enter Welsh translation..."
                disabled={quizSubmitted}
                className="text-lg p-4"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !quizSubmitted && quizAnswer.trim()) {
                    handleQuizSubmit()
                  }
                }}
              />

              {quizSubmitted && (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {currentQuestion.isCorrect ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${currentQuestion.isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {currentQuestion.isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Correct answer:</strong> {currentQuestion.card.welsh}
                  </p>
                  {currentQuestion.card.pronunciation && (
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>Pronunciation:</strong> {currentQuestion.card.pronunciation}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Exit Learning
              </Button>
              <div className="space-x-2">
                {!quizSubmitted ? (
                  <Button onClick={handleQuizSubmit} disabled={!quizAnswer.trim()}>
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextQuizQuestion}>
                    {currentQuizIndex < quizQuestions.length - 1 ? "Next Question" : "Continue Learning"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Learning Modal
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Learning: {categoryName}</h2>
              <p className="text-gray-600">
                Card {currentCardIndex + 1} of {allCards.length} • Total Points: {totalPoints}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Progress */}
          <div className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Card Progress</span>
              <span className="text-sm text-gray-600">{currentCard.progress.points}/50 points</span>
            </div>
            <Progress value={(currentCard.progress.points / 50) * 100} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">{50 - currentCard.progress.points} points until mastered</p>
          </div>

          {/* Flashcard Container */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto">
            <div
              className={`flashcard ${isFlipped ? "flipped" : ""} w-full max-w-xl h-64 md:h-80`}
              onClick={handleFlip}
            >
              <div className="flashcard-inner">
                {/* Front (English) */}
                <div className="flashcard-front bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 h-full">
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4 text-center">
                      {currentCard.english}
                    </h2>
                    <p className="text-gray-600 text-sm md:text-lg text-center mb-2 md:mb-4">
                      Click to reveal Welsh translation
                    </p>
                    <Badge variant="outline" className="text-sm md:text-base px-2 md:px-3 py-1">
                      {currentCard.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Back (Welsh) */}
                <div className="flashcard-back bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 h-full">
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <h2 className="text-2xl md:text-4xl font-bold text-green-700 text-center">{currentCard.welsh}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          playPronunciation(currentCard.welsh)
                        }}
                      >
                        <Volume2 className="h-4 w-4 md:h-6 md:w-6" />
                      </Button>
                    </div>
                    {currentCard.pronunciation && (
                      <p className="pronunciation-text text-lg md:text-xl text-center">{currentCard.pronunciation}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Show Example Usage Button */}
            {isFlipped && currentCard.exampleSentences && currentCard.exampleSentences.length > 0 && (
              <div className="mt-4">
                <Button onClick={handleShowExamples} variant="outline" className="bg-transparent">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Show Example Usage
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 border-t bg-gray-50 flex-shrink-0 gap-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRestart} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart Deck
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">{cardsShownSinceQuiz}/5 cards until next quiz</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleNext}>
                Next Card
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Example Sentences Popup */}
      {showExamples && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          onClick={handleCloseExamples}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Examples Header */}
            <div className="flex justify-between items-center p-6 border-b bg-green-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Example Usage</h3>
                <p className="text-gray-600">
                  <span className="font-medium text-green-600">{currentCard.welsh}</span> - {currentCard.english}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseExamples}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Examples Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {currentCard.exampleSentences?.map((example, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-green-600 text-lg">{example.originalSentence}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playPronunciation(example.originalSentence)}
                        className="flex-shrink-0"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-700">{example.sourceTranslation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples Footer */}
            <div className="p-4 border-t bg-gray-50 text-center">
              <Button onClick={handleCloseExamples} variant="outline">
                Close Examples
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
