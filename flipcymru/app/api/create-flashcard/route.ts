import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { getFlashcardsCollectionRef, getFlashcardCategoriesCollectionRef } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request)
    const uid = decodedToken.uid

    const { englishText, categoryName, welshDialect = "Standard", welshFormality = "Standard" } = await request.json()

    if (!englishText || !categoryName) {
      return NextResponse.json({ error: "English text and category name are required" }, { status: 400 })
    }

    const flashcardsRef = getFlashcardsCollectionRef(uid)
    const categoriesRef = getFlashcardCategoriesCollectionRef(uid)

    // Check if category exists or create it
    const categoryQuery = await categoriesRef.where("name", "==", categoryName.trim()).limit(1).get()

    if (categoryQuery.empty) {
      await categoriesRef.add({
        name: categoryName.trim(),
        userId: uid,
        createdAt: FieldValue.serverTimestamp(),
      })
    }

    // Call internal translate API
    const translateResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/translate-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify({
        text: englishText,
        sourceLanguage: "English",
        targetLanguage: "Welsh",
        welshDialect,
        welshFormality,
      }),
    })

    if (!translateResponse.ok) {
      throw new Error("Translation failed")
    }

    const translationData = await translateResponse.json()

    // Save flashcard to Firestore
    const flashcardData = {
      english: englishText,
      welsh: translationData.translatedText,
      pronunciation: translationData.pronunciationText || "",
      category: categoryName.trim(),
      difficulty: "Beginner",
      learnt: false,
      createdAt: FieldValue.serverTimestamp(),
      exampleSentences: translationData.exampleSentences || [],
    }

    await flashcardsRef.add(flashcardData)

    return NextResponse.json({
      message: "Flashcard created successfully!",
      flashcard: {
        ...flashcardData,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Create flashcard error:", error)
    return NextResponse.json({ error: error.message || "Failed to create flashcard" }, { status: 500 })
  }
}
