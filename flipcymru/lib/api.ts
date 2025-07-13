interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string
  private getAuthToken: () => Promise<string | null>

  constructor(baseUrl: string, getAuthToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl
    this.getAuthToken = getAuthToken
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken()
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error("API request failed:", error)
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async translateText(params: {
    text: string
    sourceLanguage: string
    targetLanguage: string
    welshDialect?: string
    welshFormality?: string
  }) {
    return this.request<{
      translatedText: string
      pronunciationText?: string
      exampleSentences?: Array<{
        originalSentence: string
        sourceTranslation: string
      }>
    }>("/api/translate-text", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async createFlashcard(params: {
    englishText: string
    categoryName: string
    welshDialect?: string
    welshFormality?: string
  }) {
    return this.request<{
      message: string
      flashcard: any
    }>("/api/create-flashcard", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getFlashcards(params?: {
    category?: string
    difficulty?: string
    search_term?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append("category", params.category)
    if (params?.difficulty) searchParams.append("difficulty", params.difficulty)
    if (params?.search_term) searchParams.append("search_term", params.search_term)

    const queryString = searchParams.toString()
    const endpoint = `/api/get-flashcards${queryString ? `?${queryString}` : ""}`

    return this.request<
      Array<{
        id: string
        english: string
        welsh: string
        pronunciation: string
        category: string
        difficulty: string
        learnt: boolean
        createdAt: string
        lastReviewed?: string
        learntAt?: string
        exampleSentences?: Array<{
          originalSentence: string
          sourceTranslation: string
        }>
      }>
    >(endpoint)
  }

  async getFlashcardCategories() {
    return this.request<
      Array<{
        id: string
        name: string
        userId: string
        createdAt: string
        totalFlashcards: number
        learntFlashcards: number
      }>
    >("/api/get-flashcard-categories")
  }

  async getFlashcard(cardId: string) {
    return this.request<{
      id: string
      english: string
      welsh: string
      pronunciation: string
      category: string
      difficulty: string
      learnt: boolean
      createdAt: string
      lastReviewed?: string
      learntAt?: string
      exampleSentences?: Array<{
        originalSentence: string
        sourceTranslation: string
      }>
    }>(`/api/get-flashcard/${cardId}`)
  }

  async updateFlashcardStatus(cardId: string, learnt: boolean) {
    return this.request<{ message: string }>(`/api/update-flashcard-learnt-status/${cardId}`, {
      method: "PUT",
      body: JSON.stringify({ learnt }),
    })
  }

  async saveTranslationHistory(params: {
    sourceText: string
    translatedText: string
    sourceLang: string
    targetLang: string
    pronunciationText?: string
    exampleSentences?: Array<{
      originalSentence: string
      sourceTranslation: string
    }>
  }) {
    return this.request<{ message: string }>("/api/save-translation-history", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async textToSpeech(text: string): Promise<Blob | null> {
    try {
      const token = await this.getAuthToken()
      const response = await fetch(`${this.baseUrl}/api/tts-welsh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error("TTS error:", error)
      return null
    }
  }

  async speechToText(audioBlob: Blob): Promise<string | null> {
    try {
      const token = await this.getAuthToken()
      const response = await fetch(`${this.baseUrl}/api/stt-welsh-english`, {
        method: "POST",
        headers: {
          "Content-Type": audioBlob.type,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: audioBlob,
      })

      if (!response.ok) {
        throw new Error(`STT request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.transcribedText
    } catch (error) {
      console.error("STT error:", error)
      return null
    }
  }
}

export default ApiClient
