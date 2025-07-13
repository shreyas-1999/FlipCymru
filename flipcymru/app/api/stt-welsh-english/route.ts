import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await verifyAuthToken(request)

    const audioData = await request.arrayBuffer()

    if (!audioData || audioData.byteLength === 0) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 })
    }

    const contentType = request.headers.get("content-type") || "audio/webm"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent([
      {
        text: "Transcribe the audio provided. Identify the language and return only the transcribed text.",
      },
      {
        inlineData: {
          mimeType: contentType,
          data: Buffer.from(audioData).toString("base64"),
        },
      },
    ])

    const transcribedText = result.response.text()

    if (!transcribedText) {
      throw new Error("No transcription returned")
    }

    return NextResponse.json({
      transcribedText: transcribedText.trim(),
    })
  } catch (error: any) {
    console.error("STT error:", error)
    return NextResponse.json({ error: error.message || "Speech-to-text failed" }, { status: 500 })
  }
}
