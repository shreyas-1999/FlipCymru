// src/app/api/gemini-translate/route.ts
// This Next.js API route handles text translation and pronunciation text generation
// using the Google Gemini API on the server-side, keeping the API key secure.

import { NextResponse } from 'next/server';

// Load the Gemini API key from environment variables.
// This key should be secured and not exposed to the client-side.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define the POST handler for the API route.
export async function POST(request: Request) {
  // Check if the Gemini API key is set.
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Gemini API key missing.' }, { status: 500 });
  }

  try {
    // Parse the request body to get the text to be translated and target language.
    const { text, targetLanguage = 'Welsh' } = await request.json();

    // Validate the input text.
    if (!text) {
      return NextResponse.json({ error: 'Text is required for translation.' }, { status: 400 });
    }

    // Prepare the prompt for the Gemini API to request translation and pronunciation.
    // We explicitly ask for the Welsh translation and a pronunciation guide.
    const prompt = `Translate the following English text into Welsh and provide its phonetic pronunciation guide (e.g., in a simple, easy-to-understand format like 'shoo-my' for 'Shwmae').
    Return the response as a JSON object with two fields: "translatedText" (Welsh translation) and "pronunciationText" (pronunciation guide).

    Example:
    Input: "Hello"
    Output: { "translatedText": "Shwmae", "pronunciationText": "shoo-my" }

    Input: "${text}"
    Output:
    `;

    // Gemini API endpoint for generating content.
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Payload for the Gemini API request.
    // We set responseMimeType to "application/json" and provide a schema for structured output.
    const geminiPayload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            translatedText: { type: 'STRING' },
            pronunciationText: { type: 'STRING' },
          },
          required: ['translatedText', 'pronunciationText'],
        },
      },
    };

    // Make the request to the Gemini API.
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    // Check if the Gemini API call was successful.
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Failed to get translation from AI.', details: errorData }, { status: geminiResponse.status });
    }

    // Parse the JSON response from Gemini.
    const geminiData = await geminiResponse.json();

    // Extract translatedText and pronunciationText from the response.
    // Ensure to handle cases where the structure might be unexpected.
    const translatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!translatedText) {
        throw new Error('Gemini did not return expected structured content.');
    }

    // Parse the JSON string from Gemini's response.
    const parsedGeminiContent = JSON.parse(translatedText);

    const finalTranslatedText = parsedGeminiContent.translatedText;
    const finalPronunciationText = parsedGeminiContent.pronunciationText;

    // Return the translated text and pronunciation text to the client.
    return NextResponse.json({
        translatedText: finalTranslatedText,
        pronunciationText: finalPronunciationText,
    });

  } catch (error: any) {
    console.error('Error in Gemini translation API route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during Gemini translation.' }, { status: 500 });
  }
}