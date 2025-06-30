// src/app/api/translate-text/route.ts
// This Next.js API route handles text translation using the Google Gemini API.
// It now leverages Gemini's multilingual capabilities for translation.

import { NextResponse } from 'next/server';

// Load the Gemini API key from environment variables.
// This key must be present and authorized for Gemini models.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  // Check if the Gemini API key is set.
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Gemini API key missing.' }, { status: 500 });
  }

  try {
    // Parse the request body to get the text, source language, and target language.
    const { text, sourceLanguage, targetLanguage } = await request.json();

    // Validate inputs.
    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: 'Text, sourceLanguage, and targetLanguage are required.' }, { status: 400 });
    }

    // Construct the prompt for Gemini. We ask it to translate and provide
    // a JSON output for easy parsing.
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    Return only the translated text in a JSON object with a single key "translatedText".

    Example:
    Input: "Hello" (from English to Welsh)
    Output: { "translatedText": "Shwmae" }

    Input: "${text}" (from ${sourceLanguage} to ${targetLanguage})
    Output:
    `;

    // Gemini API endpoint for generating content.
    // Using a suitable Gemini model for text generation, e.g., gemini-2.0-flash
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
          },
          required: ['translatedText'],
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
      console.error('Gemini API translation error:', errorData);
      return NextResponse.json({ error: 'Failed to get translation from AI.', details: errorData }, { status: geminiResponse.status });
    }

    // Parse the JSON response from Gemini.
    const geminiData = await geminiResponse.json();

    // The Gemini response will be a stringified JSON within 'parts[0].text'.
    const rawTranslatedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawTranslatedContent) {
        console.error('Gemini did not return expected structured content:', geminiData);
        throw new Error('Translation failed: Gemini did not return a valid response.');
    }

    // Parse the stringified JSON content
    const parsedContent = JSON.parse(rawTranslatedContent);
    const translatedText = parsedContent.translatedText;

    if (!translatedText) {
      console.error('Translated text is missing from Gemini response:', parsedContent);
      throw new Error('Translation failed: Translated text not found in AI response.');
    }

    // Return the translated text to the client.
    return NextResponse.json({ translatedText });

  } catch (error: any) {
    console.error('Error in translate-text API route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during Gemini translation.' }, { status: 500 });
  }
}