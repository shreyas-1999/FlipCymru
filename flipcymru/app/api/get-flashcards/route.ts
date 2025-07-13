import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { getFlashcardsCollectionRef } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request)
    const uid = decodedToken.uid

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const searchTerm = searchParams.get("search_term")

    const flashcardsRef = getFlashcardsCollectionRef(uid)
    let query = flashcardsRef.orderBy("createdAt", "desc")

    // Apply filters
    if (category && category !== "All") {
      query = query.where("category", "==", category)
    }
    if (difficulty && difficulty !== "All") {
      query = query.where("difficulty", "==", difficulty)
    }

    const snapshot = await query.get()
    const flashcards: any[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()

      // Apply search filter in memory
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          data.english?.toLowerCase().includes(searchLower) ||
          data.welsh?.toLowerCase().includes(searchLower) ||
          data.pronunciation?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return
      }

      // Convert timestamps
      const flashcard = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        lastReviewed: data.lastReviewed?.toDate()?.toISOString() || null,
        learntAt: data.learntAt?.toDate()?.toISOString() || null,
      }

      flashcards.push(flashcard)
    })

    return NextResponse.json(flashcards)
  } catch (error: any) {
    console.error("Get flashcards error:", error)
    return NextResponse.json({ error: error.message || "Failed to get flashcards" }, { status: 500 })
  }
}
