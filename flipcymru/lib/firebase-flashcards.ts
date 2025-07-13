import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface FlashcardProgress {
  cardId: string
  userId: string
  points: number
  lastReviewed: Date
  reviewCount: number
  correctAnswers: number
  incorrectAnswers: number
  learnt: boolean
  createdAt: Date
  updatedAt: Date
}

export class FirebaseFlashcardService {
  private getProgressDocId(userId: string, cardId: string): string {
    return `${userId}_${cardId}`
  }

  async getCardProgress(userId: string, cardId: string): Promise<FlashcardProgress | null> {
    try {
      const docId = this.getProgressDocId(userId, cardId)
      const docRef = doc(db, "flashcard_progress", docId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          cardId,
          userId,
          points: data.points || 0,
          lastReviewed: data.lastReviewed?.toDate() || new Date(),
          reviewCount: data.reviewCount || 0,
          correctAnswers: data.correctAnswers || 0,
          incorrectAnswers: data.incorrectAnswers || 0,
          learnt: data.learnt || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        }
      }

      return null
    } catch (error) {
      console.error("Error getting card progress:", error)
      return null
    }
  }

  async updateCardProgress(
    userId: string,
    cardId: string,
    updates: Partial<FlashcardProgress>,
  ): Promise<FlashcardProgress> {
    try {
      const docId = this.getProgressDocId(userId, cardId)
      const docRef = doc(db, "flashcard_progress", docId)

      // Get existing progress or create new
      const existing = await this.getCardProgress(userId, cardId)
      const now = new Date()

      const progressData: FlashcardProgress = {
        cardId,
        userId,
        points: updates.points ?? existing?.points ?? 0,
        lastReviewed: now,
        reviewCount: (existing?.reviewCount ?? 0) + 1,
        correctAnswers: updates.correctAnswers ?? existing?.correctAnswers ?? 0,
        incorrectAnswers: updates.incorrectAnswers ?? existing?.incorrectAnswers ?? 0,
        learnt: updates.learnt ?? existing?.learnt ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...updates,
      }

      // Auto-mark as learnt if points reach 50
      if (progressData.points >= 50) {
        progressData.learnt = true
      }

      await setDoc(docRef, {
        ...progressData,
        lastReviewed: progressData.lastReviewed,
        createdAt: progressData.createdAt,
        updatedAt: progressData.updatedAt,
      })

      return progressData
    } catch (error) {
      console.error("Error updating card progress:", error)
      throw error
    }
  }

  async addPoints(userId: string, cardId: string, points: number, correct: boolean): Promise<FlashcardProgress> {
    const existing = await this.getCardProgress(userId, cardId)
    const newPoints = Math.min((existing?.points ?? 0) + points, 50) // Cap at 50 points

    return this.updateCardProgress(userId, cardId, {
      points: newPoints,
      correctAnswers: correct ? (existing?.correctAnswers ?? 0) + 1 : existing?.correctAnswers,
      incorrectAnswers: !correct ? (existing?.incorrectAnswers ?? 0) + 1 : existing?.incorrectAnswers,
      learnt: newPoints >= 50,
    })
  }

  async getCategoryProgress(userId: string, categoryName: string): Promise<FlashcardProgress[]> {
    try {
      const q = query(collection(db, "flashcard_progress"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      const allProgress: FlashcardProgress[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        allProgress.push({
          cardId: data.cardId,
          userId: data.userId,
          points: data.points || 0,
          lastReviewed: data.lastReviewed?.toDate() || new Date(),
          reviewCount: data.reviewCount || 0,
          correctAnswers: data.correctAnswers || 0,
          incorrectAnswers: data.incorrectAnswers || 0,
          learnt: data.learnt || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        })
      })

      return allProgress
    } catch (error) {
      console.error("Error getting category progress:", error)
      return []
    }
  }

  // Calculate probability of showing a card based on points (lower points = higher probability)
  getCardShowProbability(points: number): number {
    if (points >= 50) return 0 // Don't show learnt cards
    return Math.max(0.1, 1 - points / 50) // Linear decrease from 1.0 to 0.1
  }

  // Calculate probability of including card in quiz (lower points = higher probability)
  getQuizProbability(points: number): number {
    if (points >= 50) return 0 // Don't quiz learnt cards
    return Math.max(0.2, 1 - points / 50) // Linear decrease from 1.0 to 0.2
  }
}

export const flashcardService = new FirebaseFlashcardService()
