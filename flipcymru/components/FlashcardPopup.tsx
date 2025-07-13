"use client"

import { useState } from "react"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Volume2, Check, RotateCcw, BookOpen } from "lucide-react"
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

interface FlashcardPopupProps {
  flashcard: Flashcard
  onClose: () => void
  onMarkAsLearnt: (cardId: string) => void
  onMarkAsUnlearnt?: (cardId: string) => void
}

export function FlashcardPopup({ flashcard, onClose, onMarkAsLearnt, onMarkAsUnlearnt }: FlashcardPopupProps) {
  const api = useApi()
  const { toast } = useToast()
  const [isFlipped, setIsFlipped] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
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

  const handleToggleLearnt = async () => {
    try {
      if (flashcard.learnt) {
        await api.updateFlashcardStatus(flashcard.id, false)
        if (onMarkAsUnlearnt) {
          onMarkAsUnlearnt(flashcard.id)
        }
        toast({
          title: "Updated",
          description: "Flashcard marked as unlearnt",
        })
      } else {
        onMarkAsLearnt(flashcard.id)
        toast({
          title: "Success",
          description: "Flashcard marked as learnt!",
        })
      }
    } catch (error) {
      console.error("Error updating flashcard status:", error)
      toast({
        title: "Error",
        description: "Could not update flashcard status",
        variant: "destructive",
      })
    }
  }

  const handleShowExamples = () => {
    setShowExamples(true)
  }

  const handleCloseExamples = () => {
    setShowExamples(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <div className="flex gap-2">
              <Badge variant="outline">{flashcard.category}</Badge>
              <Badge variant="outline">{flashcard.difficulty}</Badge>
              {flashcard.learnt && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Learnt
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Flashcard Container - Takes remaining space */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className={`flashcard ${isFlipped ? "flipped" : ""} w-full max-w-2xl h-80`} onClick={handleFlip}>
              <div className="flashcard-inner">
                {/* Front (English) */}
                <div className="flashcard-front bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 h-full">
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">{flashcard.english}</h2>
                    <p className="text-gray-600 text-lg text-center">Click to reveal Welsh translation</p>
                  </div>
                </div>

                {/* Back (Welsh) */}
                <div className="flashcard-back bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 h-full">
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <h2 className="text-4xl font-bold text-green-700 text-center">{flashcard.welsh}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          playPronunciation(flashcard.welsh)
                        }}
                      >
                        <Volume2 className="h-6 w-6" />
                      </Button>
                    </div>
                    {flashcard.pronunciation && (
                      <p className="pronunciation-text text-xl text-center">{flashcard.pronunciation}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Show Example Usage Button */}
            {isFlipped && flashcard.exampleSentences && flashcard.exampleSentences.length > 0 && (
              <div className="mt-6">
                <Button onClick={handleShowExamples} variant="outline" className="bg-transparent">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Show Example Usage
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50 flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleToggleLearnt}
              className={flashcard.learnt ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
            >
              {flashcard.learnt ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Mark as Unlearnt
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Learnt
                </>
              )}
            </Button>
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
                  <span className="font-medium text-green-600">{flashcard.welsh}</span> - {flashcard.english}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseExamples}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Examples Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {flashcard.exampleSentences?.map((example, index) => (
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
