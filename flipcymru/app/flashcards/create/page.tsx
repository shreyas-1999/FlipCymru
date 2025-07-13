"use client"

import type React from "react"

import { useState } from "react"
import { useApi } from "@/hooks/useApi"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Volume2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CreateFlashcardPage() {
  const api = useApi()
  const router = useRouter()
  const { toast } = useToast()

  const [englishText, setEnglishText] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [welshDialect, setWelshDialect] = useState("Standard")
  const [welshFormality, setWelshFormality] = useState("Standard")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<{
    welsh: string
    pronunciation: string
    exampleSentences: Array<{
      originalSentence: string
      sourceTranslation: string
    }>
  } | null>(null)

  const handlePreview = async () => {
    if (!englishText.trim()) {
      setError("Please enter English text")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.translateText({
        text: englishText,
        sourceLanguage: "English",
        targetLanguage: "Welsh",
        welshDialect,
        welshFormality,
      })

      if (response.data) {
        setPreview({
          welsh: response.data.translatedText,
          pronunciation: response.data.pronunciationText || "",
          exampleSentences: response.data.exampleSentences || [],
        })
      } else {
        setError(response.error || "Failed to generate preview")
      }
    } catch (error) {
      setError("Failed to generate preview")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!englishText.trim() || !categoryName.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.createFlashcard({
        englishText,
        categoryName,
        welshDialect,
        welshFormality,
      })

      if (response.data) {
        toast({
          title: "Success!",
          description: "Flashcard created successfully",
        })
        router.push("/flashcards")
      } else {
        setError(response.error || "Failed to create flashcard")
      }
    } catch (error) {
      setError("Failed to create flashcard")
    } finally {
      setLoading(false)
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
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/flashcards">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flashcards
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Flashcard</h1>
            <p className="text-gray-600">Add a new word to your learning collection</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Flashcard</CardTitle>
            <CardDescription>Enter an English word or phrase to create a Welsh flashcard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="englishText">English Text *</Label>
                <Input
                  id="englishText"
                  value={englishText}
                  onChange={(e) => setEnglishText(e.target.value)}
                  placeholder="Enter English word or phrase..."
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryName">Category *</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Daily Phrases, Food & Drink, Places..."
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="welshDialect">Welsh Dialect</Label>
                  <Select value={welshDialect} onValueChange={setWelshDialect}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="North-Welsh">North Welsh</SelectItem>
                      <SelectItem value="South-Welsh">South Welsh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welshFormality">Formality</Label>
                  <Select value={welshFormality} onValueChange={setWelshFormality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Informal">Informal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={loading || !englishText.trim()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Preview Translation
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Flashcard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>Translation Preview</CardTitle>
              <CardDescription>This is how your flashcard will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{englishText}</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-green-600">{preview.welsh}</span>
                      <Button variant="ghost" size="sm" onClick={() => playPronunciation(preview.welsh)}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {preview.pronunciation && <p className="pronunciation-text">{preview.pronunciation}</p>}
                  </div>
                </div>

                {preview.exampleSentences.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Example Sentences:</h4>
                    <div className="space-y-3">
                      {preview.exampleSentences.map((example, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <p className="text-green-600 mb-1">{example.originalSentence}</p>
                          <p className="text-gray-600 text-sm">{example.sourceTranslation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
