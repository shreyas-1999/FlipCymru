import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { getFlashcardCategoriesCollectionRef, getFlashcardsCollectionRef } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request)
    const uid = decodedToken.uid

    const categoriesRef = getFlashcardCategoriesCollectionRef(uid)
    const flashcardsRef = getFlashcardsCollectionRef(uid)

    const categoriesSnapshot = await categoriesRef.orderBy("createdAt", "asc").get()
    const categories: any[] = []

    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data()

      // Count flashcards in this category
      const flashcardsQuery = await flashcardsRef.where("category", "==", data.name).get()
      let totalFlashcards = 0
      let learntFlashcards = 0

      flashcardsQuery.forEach((flashcardDoc) => {
        totalFlashcards++
        if (flashcardDoc.data().learnt) {
          learntFlashcards++
        }
      })

      const category = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        totalFlashcards,
        learntFlashcards,
      }

      categories.push(category)
    }

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: error.message || "Failed to get categories" }, { status: 500 })
  }
}
