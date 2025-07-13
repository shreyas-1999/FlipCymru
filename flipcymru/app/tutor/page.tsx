"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useApi } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Volume2, Bot, User, Mic, MicOff, RotateCcw, Sparkles, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

interface Scenario {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  context: string
}

const scenarios: Scenario[] = [
  {
    id: "cafe",
    title: "Ordering at a Café",
    description: "Practice ordering food and drinks in Welsh",
    difficulty: "Beginner",
    context:
      "You're at a Welsh café and want to order something to eat and drink. The server will help you practice common phrases.",
  },
  {
    id: "directions",
    title: "Asking for Directions",
    description: "Learn to ask for and understand directions",
    difficulty: "Beginner",
    context: "You're lost in a Welsh town and need to ask locals for directions to various places.",
  },
  {
    id: "shopping",
    title: "Shopping for Groceries",
    description: "Practice shopping vocabulary and interactions",
    difficulty: "Intermediate",
    context: "You're shopping for groceries in Wales and need to interact with shopkeepers and ask about products.",
  },
  {
    id: "job_interview",
    title: "Job Interview",
    description: "Practice professional Welsh conversation",
    difficulty: "Advanced",
    context: "You're in a job interview conducted in Welsh. Practice professional language and answering questions.",
  },
  {
    id: "doctor_visit",
    title: "Visiting the Doctor",
    description: "Learn medical vocabulary and expressions",
    difficulty: "Intermediate",
    context: "You're visiting a Welsh-speaking doctor and need to describe symptoms and understand medical advice.",
  },
  {
    id: "free_chat",
    title: "Free Conversation",
    description: "Open conversation practice on any topic",
    difficulty: "Beginner",
    context: "Have a free-flowing conversation in Welsh about any topic you'd like to practice.",
  },
]

export default function TutorPage() {
  const api = useApi()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startScenario = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return

    setCurrentScenario(scenario)
    setMessages([])
    setConversationStarted(true)

    // Send initial message to start the scenario
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Croeso! Welcome to the "${scenario.title}" scenario. ${scenario.context}\n\nI'm Tiwtor Cymraeg, your Welsh language tutor. I'll help you practice Welsh in this context. Feel free to start the conversation, and I'll respond as your Welsh tutor. You can ask questions, practice phrases, or just have a natural conversation. Shall we begin?`,
      timestamp: new Date(),
    }

    setMessages([initialMessage])
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)

    try {
      // Import Gemini AI dynamically
      const { GoogleGenerativeAI } = await import("@google/generative-ai")

      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured")
      }

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      // Scenario-specific prompts
      const scenarioPrompts = {
        cafe: `You are a Welsh language tutor helping a student practice ordering at a Welsh café. You should:
- Respond as a friendly café server who speaks Welsh
- Help the student learn café vocabulary and phrases
- Provide Welsh translations and pronunciations
- Correct mistakes gently and offer alternatives
- Include common café expressions and polite phrases
- Mix Welsh and English to help learning progression`,

        directions: `You are a Welsh language tutor helping a student practice asking for directions in Wales. You should:
- Respond as a helpful local Welsh speaker
- Teach direction vocabulary and phrases
- Help with location names and landmarks
- Provide Welsh translations for common direction words
- Include polite ways to ask for help in Welsh
- Explain Welsh place names and their meanings`,

        shopping: `You are a Welsh language tutor helping a student practice shopping conversations. You should:
- Respond as a Welsh-speaking shopkeeper
- Teach shopping vocabulary and phrases
- Help with numbers, prices, and quantities in Welsh
- Include polite shopping expressions
- Provide Welsh names for common items
- Help with asking about products and making purchases`,

        job_interview: `You are a Welsh language tutor helping a student practice professional Welsh conversation. You should:
- Respond as a Welsh-speaking interviewer
- Teach professional vocabulary and formal expressions
- Help with job-related terminology
- Include formal greetings and polite language
- Provide Welsh translations for professional concepts
- Focus on formal register and workplace communication`,

        doctor_visit: `You are a Welsh language tutor helping a student practice medical conversations. You should:
- Respond as a Welsh-speaking doctor or medical professional
- Teach medical vocabulary and health-related phrases
- Help with describing symptoms and understanding medical advice
- Include polite medical expressions
- Provide Welsh translations for body parts and common conditions
- Focus on clear, helpful medical communication`,

        free_chat: `You are a friendly Welsh language tutor having an open conversation. You should:
- Engage in natural conversation about any topic
- Help with Welsh vocabulary, grammar, and pronunciation
- Provide translations and explanations when needed
- Correct mistakes gently and offer alternatives
- Share interesting facts about Welsh culture and language
- Adapt to the student's level and interests`,
      }

      const basePrompt = `You are Tiwtor Cymraeg (Welsh Tutor), an expert Welsh language teacher and conversation partner. Your role is to help students learn Welsh through interactive conversation.

CORE PRINCIPLES:
- Always be encouraging, patient, and supportive
- Provide Welsh translations with pronunciation guides when helpful
- Explain grammar points naturally within conversation
- Correct mistakes gently by modeling correct usage
- Mix Welsh and English appropriately for the student's level
- Include cultural context and interesting facts about Wales
- Use phonetic pronunciation guides like [pronunciation] when introducing new Welsh words

RESPONSE FORMAT:
- Engage naturally in the conversation scenario
- Include Welsh phrases with English translations when helpful
- Provide pronunciation guides for new Welsh words
- Offer gentle corrections and alternatives
- Ask follow-up questions to continue the conversation
- Include encouraging feedback on the student's progress

WELSH PRONUNCIATION GUIDE FORMAT:
Use this format: Welsh word [pronunciation] - English meaning
Example: Bore da [BOH-reh dah] - Good morning

Remember: You're not just translating, you're teaching through conversation and making Welsh learning enjoyable and practical.`

      // Build the conversation context
      const scenarioPrompt =
        scenarioPrompts[currentScenario?.id as keyof typeof scenarioPrompts] || scenarioPrompts.free_chat

      const systemPrompt = `${basePrompt}\n\nSCENARIO CONTEXT:\n${scenarioPrompt}`

      // Build conversation history for context
      const conversationContext = messages
        .slice(-10) // Keep last 10 messages for context
        .map((msg) => `${msg.role === "user" ? "Student" : "Tiwtor"}: ${msg.content}`)
        .join("\n")

      const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationContext}

CURRENT STUDENT MESSAGE: ${content.trim()}

Please respond as Tiwtor Cymraeg, staying in character and helping the student learn Welsh through this conversation. Include Welsh phrases with pronunciations when appropriate, and keep the conversation engaging and educational.`

      // Generate response
      const result = await model.generateContent(fullPrompt)
      const response = result.response
      const responseText = response.text()

      // Check if response contains Welsh text
      const welshPattern = /[\u00C0-\u017F\u1E00-\u1EFF]|[ŵŷâêîôûäëïöüÿ]|[ŴŶÂÊÎÔÛÄËÏÖÜŸ]/
      const containsWelsh =
        welshPattern.test(responseText) ||
        responseText.toLowerCase().includes("cymraeg") ||
        responseText.toLowerCase().includes("bore da") ||
        responseText.toLowerCase().includes("diolch") ||
        responseText.toLowerCase().includes("croeso")

      // Extract Welsh text for TTS (look for text in brackets or common Welsh phrases)
      let welshText = ""
      const welshMatches = responseText.match(/\[([^\]]+)\]/g)
      if (welshMatches) {
        welshText = welshMatches.map((match) => match.replace(/[[\]]/g, "")).join(" ")
      } else if (containsWelsh) {
        // Try to extract Welsh words/phrases
        const words = responseText.split(" ")
        const welshWords = words.filter(
          (word) =>
            welshPattern.test(word) ||
            ["bore", "da", "nos", "diolch", "croeso", "cymraeg", "iawn", "dim"].some((w) =>
              word.toLowerCase().includes(w),
            ),
        )
        welshText = welshWords.join(" ")
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Generate audio for Welsh responses
      if (containsWelsh && welshText) {
        try {
          const audioBlob = await api.textToSpeech(welshText)
          if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob)
            setMessages((prev) => prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, audioUrl } : msg)))
          }
        } catch (error) {
          console.error("Error generating audio:", error)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send message. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
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
        setInputMessage(transcribedText)
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

  const playMessageAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const resetConversation = () => {
    setMessages([])
    setCurrentScenario(null)
    setConversationStarted(false)
    setSelectedScenario("")
  }

  const startFreeChat = () => {
    setCurrentScenario(null)
    setMessages([])
    setConversationStarted(true)

    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Shwmae! I'm Tiwtor Cymraeg, your Welsh language tutor powered by AI. I'm here to help you learn Welsh through conversation!\n\nYou can:\n• Ask me to translate words or phrases\n• Practice Welsh conversation\n• Learn about Welsh grammar and pronunciation\n• Get help with Welsh culture and expressions\n\nJust start typing in English or Welsh, and I'll help you learn! What would you like to practice today?`,
      timestamp: new Date(),
    }

    setMessages([initialMessage])
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            AI Welsh Tutor
          </h1>
          <p className="text-gray-600">Practice Welsh with Gemini AI - your intelligent conversation partner</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scenarios Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practice Options</CardTitle>
                <CardDescription>Choose how you'd like to practice Welsh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Free Chat Option */}
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    !currentScenario && conversationStarted
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={startFreeChat}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Free Chat
                    </h4>
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                      AI Powered
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Chat freely with your AI Welsh tutor about anything</p>
                </div>

                <div className="border-t pt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Scenario Practice</h5>
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors mb-2 ${
                        currentScenario?.id === scenario.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedScenario(scenario.id)
                        startScenario(scenario.id)
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{scenario.title}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            scenario.difficulty === "Beginner"
                              ? "border-green-500 text-green-600"
                              : scenario.difficulty === "Intermediate"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-red-500 text-red-600"
                          }`}
                        >
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{scenario.description}</p>
                    </div>
                  ))}
                </div>

                {conversationStarted && (
                  <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={resetConversation}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[70vh] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      {currentScenario ? currentScenario.title : "Tiwtor Cymraeg"}
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                        Powered by Gemini AI
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {currentScenario
                        ? `Practicing: ${currentScenario.description}`
                        : conversationStarted
                          ? "Free conversation with your AI Welsh tutor"
                          : "Select a practice option to start learning Welsh!"}
                    </CardDescription>
                  </div>
                  {currentScenario && (
                    <Badge variant="outline" className="text-sm">
                      {currentScenario.difficulty}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {!conversationStarted && (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Tiwtor Cymraeg!</h3>
                    <p className="text-gray-600 mb-4">
                      Your AI-powered Welsh tutor is ready to help you learn. Choose a practice option from the sidebar
                      to get started.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                      <strong>What I can help you with:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                        <li>Welsh translations and meanings</li>
                        <li>Pronunciation guidance</li>
                        <li>Grammar explanations</li>
                        <li>Conversation practice</li>
                        <li>Cultural context and expressions</li>
                      </ul>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
                        }`}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                          {message.audioUrl && message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playMessageAudio(message.audioUrl!)}
                              className="h-6 w-6 p-0 hover:bg-white/20"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message in English or Welsh..."
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={loading}
                      className={isRecording ? "bg-red-50 border-red-200" : ""}
                    >
                      {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="submit" disabled={loading || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {isRecording && (
                  <Alert className="mt-2">
                    <AlertDescription className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Recording... Click the microphone button again to stop
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
