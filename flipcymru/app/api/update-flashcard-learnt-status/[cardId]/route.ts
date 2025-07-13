import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { getFlashcardsCollectionRef } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function PUT(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request)
    const uid = decodedToken.uid
    const { cardId } = params

    const { learnt } = await request.json()

    if (typeof learnt !== "boolean") {
      return NextResponse.json({ error: "learnt field must be a boolean" }, { status: 400 })
    }

    const flashcardRef = getFlashcardsCollectionRef(uid).doc(cardId)

    await flashcardRef.update({
      learnt,
      learntAt: learnt ? FieldValue.serverTimestamp() : null,
    })

    return NextResponse.json({
      message: `Flashcard ${cardId} learnt status updated to ${learnt}.`,
    })
  } catch (error: any) {
    console.error("Update flashcard status error:", error)
    return NextResponse.json({ error: error.message || "Failed to update flashcard status" }, { status: 500 })
  }
}
