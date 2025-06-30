// src/app/api/stt-welsh-english/route.ts
// This Next.js API route handles Speech-to-Text (STT) transcription
// using the Google Gemini API, processing audio input and returning transcribed text.

import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  // Check if the Gemini API key is set.
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables for STT.');
    return NextResponse.json({ error: 'Server configuration error: Gemini API key missing.' }, { status: 500 });
  }

  try {
    // The request body will contain the audio data as a Blob or File.
    // We need to read the raw body.
    const audioBlob = await request.blob();
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'No audio data provided.' }, { status: 400 });
    }

    // Convert audio buffer to Base64 string for inlineData.
    const base64Audio = audioBuffer.toString('base64');

    // Determine the MIME type of the audio. Assume audio/webm for common browser recordings.
    // This should match the mimeType used by MediaRecorder on the client-side.
    const audioMimeType = request.headers.get('Content-Type') || 'audio/webm'; // Defaulting to webm

    // Prompt for Gemini to perform transcription.
    const prompt = `Transcribe the audio provided. Identify the language.`;

    // Gemini API endpoint for generating content with multimodal input.
    // Using a suitable Gemini model for audio processing, e.g., gemini-2.0-flash
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: audioMimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    };

    // Make the request to the Gemini API for transcription.
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini STT API error:', errorData);
      return NextResponse.json({ error: 'Failed to transcribe audio with AI.', details: errorData }, { status: geminiResponse.status });
    }

    const geminiData = await geminiResponse.json();
    const transcribedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!transcribedText) {
      console.error('Gemini did not return transcribed text:', geminiData);
      throw new Error('Transcription failed: No text received from AI.');
    }

    return NextResponse.json({ transcribedText });

  } catch (error: any) {
    console.error('Error in STT API route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during speech-to-text.' }, { status: 500 });
  }
}