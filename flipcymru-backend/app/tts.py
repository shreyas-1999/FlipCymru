from gtts import gTTS
import os

def generate_audio(text, filename):
    tts = gTTS(text=text, lang='cy')
    filepath = f'static/audio/{filename}.mp3'
    tts.save(filepath)
    return filepath
