// src/app/api/tts-welsh/route.ts
// This Next.js API route handles requests for Welsh Text-to-Speech (TTS) audio.
// It uses the Google Cloud Text-to-Speech API on the server-side to generate audio,
// keeping the sensitive GOOGLE_TTS_API_KEY secure.

import { NextResponse } from 'next/server';

// Load the Google Cloud Text-to-Speech API key from environment variables.
// This key should be secured and not exposed to the client-side.
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

// Define the POST handler for the API route.
export async function POST(request: Request) {
  // Check if the API key is set.
  if (!GOOGLE_TTS_API_KEY) {
    console.error('GOOGLE_TTS_API_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: TTS API key missing.' }, { status: 500 });
  }

  try {
    // Parse the request body to get the text to be spoken.
    const { text } = await request.json();

    // Validate the input text.
    if (!text) {
      return NextResponse.json({ error: 'Text is required for TTS.' }, { status: 400 });
    }

    // Google Cloud Text-to-Speech API endpoint.
    const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

    // Request body for the Google Cloud Text-to-Speech API.
    // - input: The text content to be synthesized.
    // - voice: Specifies the language code (cy-GB for Welsh) and gender for the voice.
    // - audioConfig: Defines the desired audio format (LINEAR16 for WAV, MP3, etc.).
    const ttsRequestBody = {
      input: { text: text },
      voice: { languageCode: 'cy-GB', ssmlGender: 'FEMALE' as const }, // 'FEMALE' or 'MALE'
      audioConfig: { audioEncoding: 'LINEAR16' as const, sampleRateHertz: 24000 }, // LINEAR16 is a common raw audio format
    };

    // Make the request to the Google Cloud Text-to-Speech API.
    const ttsResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsRequestBody),
    });

    // Check if the TTS API call was successful.
    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      console.error('Google TTS API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate speech audio.', details: errorData }, { status: ttsResponse.status });
    }

    // Parse the JSON response from the TTS API.
    const ttsData = await ttsResponse.json();

    // The audio content is base64 encoded. Decode it.
    const audioContent = Buffer.from(ttsData.audioContent, 'base64');

    // Return the audio content as an audio/wav response.
    // LINEAR16 is raw PCM data. To make it directly playable in a browser,
    // we set the Content-Type to audio/wav, assuming the client can handle raw PCM in WAV.
    // A more robust solution might involve adding a WAV header here if strictly needed,
    // or using a format like MP3 directly from TTS API which is typically self-contained.
    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioContent.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error in TTS API route:', error);
    return NextResponse.json({ error: 'Internal server error during TTS generation.' }, { status: 500 });
  }
}