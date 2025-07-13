import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, getUserProfileDocRef } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Email, password, and username are required" }, { status: 400 })
    }

    // Create user in Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: username,
      emailVerified: false,
      disabled: false,
    })

    // Save user profile to Firestore
    const userProfileRef = getUserProfileDocRef(userRecord.uid)
    await userProfileRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      username,
      createdAt: FieldValue.serverTimestamp(),
      learningPreferences: {
        difficulty: "Beginner",
        dailyGoal: 10,
      },
      stats: {
        xp: 0,
        streak: 0,
        wordsMastered: 0,
      },
    })

    return NextResponse.json({
      message: "User registered successfully!",
      uid: userRecord.uid,
      email: userRecord.email,
      username,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "The provided email is already in use." }, { status: 409 })
    }

    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
