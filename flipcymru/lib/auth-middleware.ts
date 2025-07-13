import type { NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export async function verifyAuthToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No valid authorization header")
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token, true)

    return decodedToken
  } catch (error) {
    console.error("Token verification error:", error)
    throw new Error("Invalid or expired token")
  }
}
