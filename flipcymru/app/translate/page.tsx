"use client"

import { useState, useRef } from "react"
import { useApi } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Volume2, Mic, MicOff, ArrowRightLeft, Save, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TranslationResult {
  translatedText: string
  pronunciationText?: string
  exampleSentences?: Array<{
    originalSentence: string
    sourceTranslation: string
  }>
}

export default function TranslatePage() {
  const api = useApi()
  const { toast } = useToast()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [sourceText, setSourceText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("English")
  const [targetLanguage, setTargetLanguage] = useState("Welsh")
  const [welshDialect, setWelshDialect] = useState("Standard")
  const [welshFormality, setWelshFormality] = useState("Standard")
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError("Please enter text to translate")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.translateText({
        text: sourceText,
        sourceLanguage,
        targetLanguage,
        welshDialect,
        welshFormality,
      })

      if (response.data) {
        setTranslationResult(response.data)
      } else {
        setError(response.error || "Translation failed")
      }
    } catch (error) {
      setError("Translation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSwapLanguages = () => {
    if (translationResult) {
      setSourceText(translationResult.translatedText)
      setTranslationResult(null)
    }

    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await handleSpeechToText(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSpeechToText = async (audioBlob: Blob) => {
    setLoading(true)
    try {
      const transcribedText = await api.speechToText(audioBlob)
      if (transcribedText) {
        setSourceText(transcribedText)
        toast({
          title: "Success",
          description: "Speech transcribed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Could not transcribe speech",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Speech to text error:", error)
      toast({
        title: "Error",
        description: "Speech transcription failed",
        variant: "destructive",
      })
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
      toast({
        title: "Error",
        description: "Could not play pronunciation",
        variant: "destructive",
      })
    }
  }

  const saveToHistory = async () => {
    if (!translationResult) return

    try {
      const response = await api.saveTranslationHistory({
        sourceText,
        translatedText: translationResult.translatedText,
        sourceLang: sourceLanguage === "English" ? "en" : "cy",
        targetLang: targetLanguage === "Welsh" ? "cy" : "en",
        pronunciationText: translationResult.pronunciationText,
        exampleSentences: translationResult.exampleSentences,
      })

      if (response.data) {
        toast({
          title: "Saved",
          description: "Translation saved to history",
        })
      }
    } catch (error) {
      console.error("Error saving to history:", error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Translation</h1>
          <p className="text-gray-600">Translate text and practice pronunciation in real-time</p>
        </div>

        {/* Translation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {sourceLanguage}
                  <Badge variant="outline">{sourceLanguage}</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSwapLanguages} disabled={loading}>
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text to translate..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-32 resize-none"
                disabled={loading}
              />

              {targetLanguage === "Welsh" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Dialect</label>
                    <Select value={welshDialect} onValueChange={setWelshDialect}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="North-Welsh">North Welsh</SelectItem>
                        <SelectItem value="South-Welsh">South Welsh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Formality</label>
                    <Select value={welshFormality} onValueChange={setWelshFormality}>
                      <SelectTrigger className="mt-1">
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
              )}

              <Button onClick={handleTranslate} className="w-full mt-4" disabled={loading || !sourceText.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Translate
              </Button>
            </CardContent>
          </Card>

          {/* Target */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {targetLanguage}
                <Badge variant="outline">{targetLanguage}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {translationResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">{translationResult.translatedText}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playPronunciation(translationResult.translatedText)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translationResult.translatedText)}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {translationResult.pronunciationText && (
                      <p className="pronunciation-text">{translationResult.pronunciationText}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={saveToHistory}>
                      <Save className="h-4 w-4 mr-2" />
                      Save to History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-32 flex items-center justify-center text-gray-500">
                  Translation will appear here...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Sentences */}
        {translationResult?.exampleSentences && translationResult.exampleSentences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Example Sentences</CardTitle>
              <CardDescription>See how the translation is used in context</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {translationResult.exampleSentences.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-green-600">{example.originalSentence}</p>
                      <Button variant="ghost" size="sm" onClick={() => playPronunciation(example.originalSentence)}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-600">{example.sourceTranslation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="fixed bottom-4 right-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Recording... Click to stop
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
