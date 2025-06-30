# FlipCymruBackend/seed_firestore.py

import os
import json
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, exceptions # <--- Added 'exceptions'
import google.generativeai as genai
from datetime import datetime
import asyncio # Already imported, but emphasizing its use for sleep
import time # <--- Added time module for simple sleep

# --- Load Environment Variables ---
load_dotenv()

# --- Configuration ---
FIREBASE_ADMIN_SDK_CONFIG_STR = os.getenv("FIREBASE_ADMIN_SDK_CONFIG")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")

# Define your test users' UIDs here
# IMPORTANT: Replace with actual UIDs from your Firebase Console -> Authentication -> Users tab
TEST_USERS = [
    "cjg9hBYmszPO5K7IgqbKtBE8AsF3", # e.g., "abcdef1234567890abcdef12345567890"
    "1ArPhQZIwufwMfMVZGa4fQ9ldC83",
    "yiz418WmO9dOJdb9KZtAEg87haV2",
    # Add more UIDs if you have more test users
]

# Delay between Gemini API calls (in seconds)
GEMINI_API_CALL_DELAY = 2 # <--- NEW: Adjust as needed to avoid rate limits


# --- Initialize Firebase Admin SDK ---
if not FIREBASE_ADMIN_SDK_CONFIG_STR:
    raise ValueError("FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.")

# FIX: Updated Firebase Admin SDK initialization check
try:
    firebase_admin.get_app()
    print("Firebase Admin SDK already initialized for seeding.")
except ValueError: # This is the exception raised if the default app is not initialized
    try:
        service_account_info = json.loads(FIREBASE_ADMIN_SDK_CONFIG_STR)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully for seeding.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        exit(1)

db = firestore.client(database_id="flipcymru-db")

# --- Initialize Gemini API ---
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# --- Mock Data ---
MOCK_CATEGORIES = [
    {"name": "Daily Phrases"},
    {"name": "Food & Drink"},
    {"name": "Travel"},
    {"name": "Family"},
    {"name": "Nature"},
    {"name": "Places"},
]

MOCK_PHRASES = {
    "Daily Phrases": [
        {"english": "Good morning", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Thank you", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "How are you?", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Please", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Goodbye", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Yes", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "No", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Excuse me", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Sorry", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Hello, how are you?", "welshDialect": "South-Welsh", "welshFormality": "Informal"},
    ],
    "Food & Drink": [
        {"english": "Water", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Coffee", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Tea", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Milk", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Bread", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Cheese", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Apple", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Orange", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Breakfast", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Dinner", "welshDialect": "Standard", "welshFormality": "Standard"},
    ],
    "Travel": [
        {"english": "Where is the station?", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "How much?", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Train", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Bus", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Hotel", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Airport", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Ticket", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Left", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Right", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Straight on", "welshDialect": "Standard", "welshFormality": "Standard"},
    ],
    "Family": [
        {"english": "Mother", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Father", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Sister", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Brother", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Son", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Daughter", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Grandmother", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Grandfather", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Friend", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Family", "welshDialect": "Standard", "welshFormality": "Standard"},
    ],
    "Nature": [
        {"english": "Mountain", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "River", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Sea", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Tree", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Flower", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Bird", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Sun", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Moon", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Star", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Cloud", "welshDialect": "Standard", "welshFormality": "Standard"},
    ],
    "Places": [
        {"english": "Cardiff", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Newport", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Swansea", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Police Station", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Post Office", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "School", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Coffee Shop", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Grocery Store", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Hospital", "welshDialect": "Standard", "welshFormality": "Standard"},
        {"english": "Bank", "welshDialect": "Standard", "welshFormality": "Standard"},
    ]
}

# --- Helper Functions (adapted from main.py) ---

def get_flashcards_collection_ref(uid: str):
    app_id_for_path = "default-app-id"
    return db.collection(f"artifacts/{app_id_for_path}/users/{uid}/flashcards")

def get_flashcard_categories_collection_ref(uid: str):
    app_id_for_path = "default-app-id"
    return db.collection(f"artifacts/{app_id_for_path}/users/{uid}/flashcardCategories")

async def call_gemini_translate(text: str, source_lang: str, target_lang: str, dialect: str, formality: str):
    """Simulates the translate-text API call to Gemini."""
    prompt = f"""
    Translate the following text from {source_lang} to {target_lang}.
    When translating to Welsh, consider the following:
    - Dialect: {dialect} (e.g., "Standard", "North-Welsh", "South-Welsh")
    - Formality: {formality} (e.g., "Standard", "Formal", "Informal")

    For the translated text in the target language:
    1. Provide ONLY the single most appropriate translation of the input text.
    2. Provide its phonetic pronunciation guide (e.g., in a simple, easy-to-understand format like 'shoo-my' for 'Shwmae'). If a phonetic guide is not applicable or easily generated, return "N/A".
    3. Provide 3 example sentences using the translated phrase in context. For each example sentence, also provide its translation back into the source language ({source_lang}).

    Return the response as a JSON object with the following fields:
    - "translatedText" (string): The single, most appropriate translation of the input text in the target language.
    - "pronunciationText" (string): The phonetic pronunciation guide for the translated text.
    - "exampleSentences" (array of objects): An array of 3 objects, each with "originalSentence" and "sourceTranslation".

    Example (English to Welsh for "Hello", South-Welsh, Informal):
    Input: "Hello"
    Output: {{
        "translatedText": "Shwmae",
        "pronunciationText": "shoo-my",
        "exampleSentences": [
            {{"originalSentence": "Shwmae, sut wyt ti heddiw?", "sourceTranslation": "Hello, how are you today?"}},
            {{"originalSentence": "Shwmae, croeso i Gymru!", "sourceTranslation": "Hello, welcome to Wales!"}},
            {{"originalSentence": "Dw i'n dweud shwmae wrth y ci.", "sourceTranslation": "I'm saying hello to the dog."}}
        ]
    }}

    Input: "{text}" (from {source_lang} to {target_lang}, Dialect: {dialect}, Formality: {formality})
    Output:
    """

    response = gemini_model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "translatedText": {"type": "STRING"},
                    "pronunciationText": {"type": "STRING"},
                    "exampleSentences": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "originalSentence": {"type": "STRING"},
                                "sourceTranslation": {"type": "STRING"}
                            },
                            "required": ["originalSentence", "sourceTranslation"]
                        }
                    }
                },
                "required": ["translatedText", "pronunciationText", "exampleSentences"]
            }
        )
    )

    raw_translated_content = response.text
    parsed_content = json.loads(raw_translated_content)
    return parsed_content

# --- Main Seeding Logic ---
async def seed_firestore():
    print("\n--- Starting Firestore Seeding ---")

    for user_uid in TEST_USERS:
        if user_uid.startswith("YOUR_TEST_USER_UID"): # Check for placeholder UIDs
            print(f"Skipping placeholder UID: {user_uid}. Please update TEST_USERS list.")
            continue

        print(f"\nSeeding data for user: {user_uid}")
        user_categories_ref = get_flashcard_categories_collection_ref(user_uid)
        user_flashcards_ref = get_flashcards_collection_ref(user_uid)

        # Optional: Clear existing data for this user (uncomment to clear on each run)
        # print(f"Clearing existing categories and flashcards for {user_uid}...")
        # for doc in user_categories_ref.get(): doc.reference.delete()
        # for doc in user_flashcards_ref.get(): doc.reference.delete()
        # print("Cleared.")

        # Seed Categories
        print(f"Seeding categories for user {user_uid}...")
        for category_data in MOCK_CATEGORIES:
            category_name = category_data["name"]
            # Check if category already exists to avoid duplicates
            existing_category_docs = user_categories_ref.where("name", "==", category_name).limit(1).get()
            if not existing_category_docs:
                user_categories_ref.add({
                    "name": category_name,
                    "userId": user_uid,
                    "createdAt": datetime.now() # Use Python datetime for seed script
                })
                print(f"  Added category: {category_name}")
            else:
                print(f"  Category '{category_name}' already exists.")

        # Seed Flashcards for each category
        print(f"Seeding flashcards for user {user_uid}...")
        for category_name, phrases in MOCK_PHRASES.items():
            for phrase_data in phrases:
                english_text = phrase_data["english"]
                dialect = phrase_data.get("welshDialect", "Standard")
                formality = phrase_data.get("welshFormality", "Standard")

                # Check if flashcard already exists to avoid duplicates
                existing_card_query = user_flashcards_ref.where("english", "==", english_text).where("category", "==", category_name).limit(1).get()
                if existing_card_query:
                    print(f"  Flashcard '{english_text}' in '{category_name}' already exists. Skipping.")
                    continue

                print(f"  Generating data for '{english_text}' in '{category_name}'...")
                try:
                    # Call Gemini for translation, pronunciation, and examples
                    gemini_response = await call_gemini_translate(
                        text=english_text,
                        source_lang="English",
                        target_lang="Welsh",
                        dialect=dialect,
                        formality=formality
                    )

                    translated_text = gemini_response.get("translatedText")
                    pronunciation_text = gemini_response.get("pronunciationText")
                    example_sentences = gemini_response.get("exampleSentences", [])

                    if not translated_text:
                        print(f"    Warning: No translation returned for '{english_text}'. Skipping.")
                        continue

                    flashcard_data = {
                        "english": english_text,
                        "welsh": translated_text,
                        "pronunciation": pronunciation_text,
                        "category": category_name,
                        "difficulty": "Beginner", # All seeded cards start as Beginner
                        "learnt": False, # All seeded cards start as not learned
                        "createdAt": datetime.now(), # Use Python datetime for seed script
                        "exampleSentences": example_sentences
                    }
                    user_flashcards_ref.add(flashcard_data)
                    print(f"    Added flashcard: '{english_text}' -> '{translated_text}'")
                except Exception as e:
                    print(f"    Error generating/adding flashcard '{english_text}': {e}")

                # FIX: Add a delay after each Gemini API call
                await asyncio.sleep(GEMINI_API_CALL_DELAY) # <--- ADDED DELAY HERE

    print("\n--- Firestore Seeding Complete ---")

# --- Run the seeding script ---
if __name__ == "__main__":
    # Ensure TEST_USERS is populated with actual UIDs before running
    if any(uid.startswith("YOUR_TEST_USER_UID") for uid in TEST_USERS):
        print("ERROR: Please update TEST_USERS list in seed_firestore.py with actual Firebase UIDs.")
        exit(1)

    # Run the async seeding function
    asyncio.run(seed_firestore())