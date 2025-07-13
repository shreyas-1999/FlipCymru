import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { TextToSpeechClient } from "@google-cloud/text-to-speech"

// Initialize the Text-to-Speech client with API key
const ttsClient = new TextToSpeechClient({
  apiKey: process.env.GOOGLE_TTS_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await verifyAuthToken(request)

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Configure the synthesis request
    const synthesisRequest = {
      input: { text },
      voice: {
        languageCode: "cy-GB", // Welsh (United Kingdom)
        ssmlGender: "FEMALE" as const,
      },
      audioConfig: {
        audioEncoding: "LINEAR16" as const,
        sampleRateHertz: 24000,
      },
    }

    // Perform the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(synthesisRequest)

    if (!response.audioContent) {
      throw new Error("No audio content received from TTS service")
    }

    // Return the audio as a WAV file
    return new Response(response.audioContent, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": response.audioContent.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("TTS error:", error)

    // Handle specific Google Cloud errors
    if (error.code === 3) {
      return NextResponse.json({ error: "Invalid API key or permissions" }, { status: 401 })
    }
    if (error.code === 8) {
      return NextResponse.json({ error: "Resource exhausted - quota exceeded" }, { status: 429 })
    }
    if (error.code === 7) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    return NextResponse.json({ error: error.message || "Text-to-Speech failed" }, { status: 500 })
  }
}
