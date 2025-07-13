"use client"

import { useEffect, useState } from "react"
import { useApi } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { flashcardService, type FlashcardProgress } from "@/lib/firebase-flashcards"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Check, Play, Trophy } from "lucide-react"
import Link from "next/link"
import { FlashcardPopup } from "@/components/FlashcardPopup"
import { LearnDeckModal } from "@/components/LearnDeckModal"

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
  progress?: FlashcardProgress
}

interface Category {
  id: string
  name: string
  totalFlashcards: number
  learntFlashcards: number
  totalPoints: number
  averagePoints: number
}

export default function FlashcardsPage() {
  const api = useApi()
  const { user } = useAuth()
  const [flashcards, setFlashcards] = useState<FlashcardWithProgress[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All")
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardWithProgress | null>(null)
  const [learnDeckCategory, setLearnDeckCategory] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchFlashcards()
    }
  }, [searchTerm, selectedCategory, selectedDifficulty, user])

  const fetchData = async () => {
    if (!user) return

    try {
      const [flashcardsResponse, categoriesResponse] = await Promise.all([
        api.getFlashcards(),
        api.getFlashcardCategories(),
      ])

      if (flashcardsResponse.data && categoriesResponse.data) {
        // Fetch progress for all flashcards
        const flashcardsWithProgress: FlashcardWithProgress[] = []
        for (const card of flashcardsResponse.data) {
          const progress = await flashcardService.getCardProgress(user.uid, card.id)
          flashcardsWithProgress.push({
            ...card,
            progress,
          })
        }

        setFlashcards(flashcardsWithProgress)

        // Calculate enhanced category stats
        const enhancedCategories: Category[] = []
        for (const category of categoriesResponse.data) {
          const categoryCards = flashcardsWithProgress.filter((card) => card.category === category.name)
          const totalPoints = categoryCards.reduce((sum, card) => sum + (card.progress?.points || 0), 0)
          const learntCards = categoryCards.filter((card) => (card.progress?.points || 0) >= 50)

          enhancedCategories.push({
            ...category,
            totalPoints,
            averagePoints: categoryCards.length > 0 ? Math.round(totalPoints / categoryCards.length) : 0,
            learntFlashcards: learntCards.length,
          })
        }

        setCategories(enhancedCategories)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFlashcards = async () => {
    if (!user) return

    try {
      const params: any = {}
      if (selectedCategory !== "All") params.category = selectedCategory
      if (selectedDifficulty !== "All") params.difficulty = selectedDifficulty
      if (searchTerm) params.search_term = searchTerm

      const response = await api.getFlashcards(params)
      if (response.data) {
        // Fetch progress for filtered flashcards
        const flashcardsWithProgress: FlashcardWithProgress[] = []
        for (const card of response.data) {
          const progress = await flashcardService.getCardProgress(user.uid, card.id)
          flashcardsWithProgress.push({
            ...card,
            progress,
          })
        }
        setFlashcards(flashcardsWithProgress)
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error)
    }
  }

  const handleFlashcardClick = (flashcard: FlashcardWithProgress) => {
    setSelectedFlashcard(flashcard)
  }

  const handleCloseFlashcard = () => {
    setSelectedFlashcard(null)
  }

  const handleMarkAsLearnt = async (cardId: string) => {
    if (!user) return

    try {
      await flashcardService.updateCardProgress(user.uid, cardId, { learnt: true, points: 50 })
      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error marking card as learnt:", error)
    }
  }

  const handleMarkAsUnlearnt = async (cardId: string) => {
    if (!user) return

    try {
      await flashcardService.updateCardProgress(user.uid, cardId, { learnt: false, points: 0 })
      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error marking card as unlearnt:", error)
    }
  }

  const handleLearnDeck = (categoryName: string) => {
    setLearnDeckCategory(categoryName)
  }

  const handleCloseLearnDeck = () => {
    setLearnDeckCategory(null)
    // Refresh data after learning session
    fetchData()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
            <p className="text-gray-600">Study and practice your Welsh vocabulary with smart learning</p>
          </div>
          <Link href="/flashcards/create">
            <Button>Create New Card</Button>
          </Link>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    {category.totalPoints} pts
                  </Badge>
                </div>
                <CardDescription>
                  {category.learntFlashcards} / {category.totalFlashcards} mastered • Avg: {category.averagePoints} pts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          category.totalFlashcards > 0
                            ? (category.learntFlashcards / category.totalFlashcards) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${category.totalFlashcards > 0 ? (category.averagePoints / 50) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>

                  {category.totalFlashcards > category.learntFlashcards && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => handleLearnDeck(category.name)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Smart Learning ({category.totalFlashcards - category.learntFlashcards} cards)
                    </Button>
                  )}

                  {category.learntFlashcards === category.totalFlashcards && category.totalFlashcards > 0 && (
                    <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                      <Trophy className="h-4 w-4" />
                      Category Mastered!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flashcards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashcards.map((card) => (
            <Card
              key={card.id}
              className="hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handleFlashcardClick(card)}
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 text-center">{card.english}</h3>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{card.progress?.points || 0}/50 pts</span>
                    </div>
                    <Progress value={((card.progress?.points || 0) / 50) * 100} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <Badge variant="outline" className="text-xs">
                      {card.category}
                    </Badge>
                    {(card.progress?.points || 0) >= 50 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Mastered
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {flashcards.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "All" || selectedDifficulty !== "All"
                ? "Try adjusting your filters or search term."
                : "Create your first flashcard to start learning!"}
            </p>
            <Link href="/flashcards/create">
              <Button>Create Flashcard</Button>
            </Link>
          </div>
        )}

        {/* Flashcard Popup */}
        {selectedFlashcard && (
          <FlashcardPopup
            flashcard={selectedFlashcard}
            onClose={handleCloseFlashcard}
            onMarkAsLearnt={handleMarkAsLearnt}
            onMarkAsUnlearnt={handleMarkAsUnlearnt}
          />
        )}

        {/* Learn Deck Modal */}
        {learnDeckCategory && (
          <LearnDeckModal
            categoryName={learnDeckCategory}
            onClose={handleCloseLearnDeck}
            onMarkAsLearnt={handleMarkAsLearnt}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
