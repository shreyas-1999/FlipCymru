"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, MessageCircle, Mic, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 welsh-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">FlipCymru</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn Welsh with{" "}
            <span className="bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">AI Power</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Master the Welsh language through interactive flashcards, real-time translation, and AI-powered conversation
            practice. Your modern Welsh learning companion.
          </p>
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Smart Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-generated flashcards with pronunciation guides and contextual examples
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Live Translation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Instant English-Welsh translation with dialect and formality options</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mic className="w-12 h-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Voice Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Speech-to-text and text-to-speech for perfect pronunciation practice</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>AI Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Personalized learning with AI-powered feedback and progress tracking</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Master Welsh?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of learners discovering the beauty of the Welsh language
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-12">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 FlipCymru. Made with ❤️ for Welsh learners everywhere.</p>
        </div>
      </footer>
    </div>
  )
}
