"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, MessageCircle, TrendingUp, Award, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/DashboardLayout"

interface DashboardStats {
  totalFlashcards: number
  learntFlashcards: number
  categories: number
  streak: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const api = useApi()
  const [stats, setStats] = useState<DashboardStats>({
    totalFlashcards: 0,
    learntFlashcards: 0,
    categories: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [flashcardsResponse, categoriesResponse] = await Promise.all([
          api.getFlashcards(),
          api.getFlashcardCategories(),
        ])

        if (flashcardsResponse.data && categoriesResponse.data) {
          const totalFlashcards = flashcardsResponse.data.length
          const learntFlashcards = flashcardsResponse.data.filter((card) => card.learnt).length
          const categories = categoriesResponse.data.length

          setStats({
            totalFlashcards,
            learntFlashcards,
            categories,
            streak: 0, // TODO: Implement streak calculation
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [api])

  const progressPercentage =
    stats.totalFlashcards > 0 ? Math.round((stats.learntFlashcards / stats.totalFlashcards) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Croeso, {user?.displayName || "Learner"}! 👋</h1>
          <p className="text-blue-100">Ready to continue your Welsh learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
              <p className="text-xs text-muted-foreground">Flashcards created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastered</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.learntFlashcards}</div>
              <p className="text-xs text-muted-foreground">Cards learned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <p className="text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Learning topics</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/flashcards">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Flashcards
                </CardTitle>
                <CardDescription>Review and practice your Welsh vocabulary</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/translate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Translation
                </CardTitle>
                <CardDescription>Translate text and practice pronunciation</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/flashcards/create">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Flashcard
                </CardTitle>
                <CardDescription>Add new words to your learning collection</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Progress Section */}
        {stats.totalFlashcards > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>
                You've mastered {stats.learntFlashcards} out of {stats.totalFlashcards} flashcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{progressPercentage}% complete</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
