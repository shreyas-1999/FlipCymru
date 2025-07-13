import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await verifyAuthToken(request)

    const {
      text,
      sourceLanguage,
      targetLanguage,
      welshDialect = "Standard",
      welshFormality = "Standard",
    } = await request.json()

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: "Text, sourceLanguage, and targetLanguage are required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    When translating to Welsh, consider the following:
    - Dialect: ${welshDialect} (e.g., "Standard", "North-Welsh", "South-Welsh")
    - Formality: ${welshFormality} (e.g., "Standard", "Formal", "Informal")

    For the translated text in the target language:
    1. Provide **ONLY the single most appropriate translation** of the input text.
    2. Provide its phonetic pronunciation guide (e.g., in a simple, easy-to-understand format like 'shoo-my' for 'Shwmae'). If a phonetic guide is not applicable or easily generated, return "N/A".
    3. Provide 3 example sentences using the translated phrase in context. For each example sentence, also provide its translation back into the source language (${sourceLanguage}).

    Return the response as a JSON object with the following fields:
    - "translatedText" (string): The single, most appropriate translation of the input text in the target language.
    - "pronunciationText" (string): The phonetic pronunciation guide for the translated text.
    - "exampleSentences" (array of objects): An array of 3 objects, each with "originalSentence" (the example sentence in the target language) and "sourceTranslation" (its translation back to the source language).

    Input: "${text}" (from ${sourceLanguage} to ${targetLanguage}, Dialect: ${welshDialect}, Formality: ${welshFormality})
    Output:
    `

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            translatedText: { type: "string" },
            pronunciationText: { type: "string" },
            exampleSentences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  originalSentence: { type: "string" },
                  sourceTranslation: { type: "string" },
                },
                required: ["originalSentence", "sourceTranslation"],
              },
            },
          },
          required: ["translatedText", "pronunciationText", "exampleSentences"],
        },
      },
    })

    const response = result.response
    const parsedContent = JSON.parse(response.text())

    return NextResponse.json({
      translatedText: parsedContent.translatedText,
      pronunciationText: parsedContent.pronunciationText,
      exampleSentences: parsedContent.exampleSentences || [],
    })
  } catch (error: any) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: error.message || "Translation failed" }, { status: 500 })
  }
}
