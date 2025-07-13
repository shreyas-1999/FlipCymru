import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, getUserProfileDocRef } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user record by email
    const userRecord = await adminAuth.getUserByEmail(email)

    // Generate custom token
    const customToken = await adminAuth.createCustomToken(userRecord.uid)

    // Fetch user profile from Firestore
    const userProfileRef = getUserProfileDocRef(userRecord.uid)
    const userProfileDoc = await userProfileRef.get()
    const userProfileData = userProfileDoc.exists ? userProfileDoc.data() : null

    // Determine username
    const username = userProfileData?.username || userRecord.displayName || email.split("@")[0] || "User"

    return NextResponse.json({
      message: "User found, custom token generated.",
      uid: userRecord.uid,
      email: userRecord.email,
      username,
      customToken,
    })
  } catch (error: any) {
    console.error("Login error:", error)

    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 })
  }
}
