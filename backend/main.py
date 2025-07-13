# FlipCymruBackend/main.py

from fastapi import FastAPI, HTTPException, Request, Response, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="FlipCymru Backend API",
    description="API for Welsh learning features: Auth, Translation, STT, TTS.",
    version="1.0.0",
)

# --- CORS Configuration ---
# This is crucial for your React frontend to be able to call this backend.
# In production, replace "*" with your actual frontend domain (e.g., "https://your-flipcymru-app.vercel.app").
origins = [
    "http://localhost:3000", # Your Next.js frontend development server
    "http://localhost:8000", # If you run your frontend on a different port
    "http://127.0.0.1:3000",
    # Add your production frontend URL here when deployed
    # "https://your-production-frontend-url.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- Firebase Admin SDK Initialization ---
import firebase_admin
from firebase_admin import credentials, auth, firestore, exceptions # <--- Added exceptions for get_app()
import datetime
# from firebase_admin.firestore import Timestamp

# Load Firebase Admin SDK config from environment variable
firebase_admin_config_str = os.getenv("FIREBASE_ADMIN_SDK_CONFIG")
if not firebase_admin_config_str:
    raise ValueError("FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.")

# Initialize Firebase Admin SDK if it hasn't been initialized already.
# This prevents re-initialization errors if the app is reloaded (e.g., by uvicorn --reload).
try:
    # Try to get the default app. If it doesn't exist, it will raise a ValueError.
    firebase_admin.get_app()
    print("Firebase Admin SDK already initialized in backend.")
except ValueError: # This is the exception raised if the default app is not initialized
    try:
        service_account_info = json.loads(firebase_admin_config_str)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully in backend.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        raise

# Get the Firestore client. Specify the database_id if you created a named database.
db = firestore.client(database_id="flipcymru-db") # Ensure your database ID is correct here

# --- Google API Clients Initialization ---
import google.generativeai as genai
from google.cloud import texttospeech

# Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")
genai.configure(api_key=gemini_api_key)
gemini_model = genai.GenerativeModel('gemini-2.0-flash') # Using gemini-2.0-flash as per previous instructions

# Google Cloud Text-to-Speech API
tts_api_key = os.getenv("GOOGLE_TTS_API_KEY")
if not tts_api_key:
    raise ValueError("GOOGLE_TTS_API_KEY environment variable is not set.")
tts_client = texttospeech.TextToSpeechClient(client_options={"api_key": tts_api_key})


# --- Pydantic Models for Request/Response Bodies ---

class RegisterUserRequest(BaseModel):
    email: str
    password: str
    username: str

class LoginUserRequest(BaseModel):
    email: str
    password: str

class TranslateTextRequest(BaseModel):
    text: str
    sourceLanguage: str
    targetLanguage: str
    welshDialect: Optional[str] = "Standard" # "Standard", "North-Welsh", "South-Welsh"
    welshFormality: Optional[str] = "Standard" # "Standard", "Formal", "Informal"

# Pydantic model for each example sentence
class ExampleSentence(BaseModel):
    originalSentence: str # The example sentence in the target language (Welsh)
    sourceTranslation: str # The translation of the example sentence back into the source language (English)

# Updated TranslateTextResponse
class TranslateTextResponse(BaseModel):
    translatedText: str
    pronunciationText: Optional[str] = None
    exampleSentences: Optional[List[ExampleSentence]] = None # List of ExampleSentence objects

class SpeechToTextRequest(BaseModel):
    # This model is conceptual for input, actual binary audio handled by endpoint via Request.body()
    pass

class TextToSpeechRequest(BaseModel):
    text: str

# TranslationHistoryEntryRequest
class TranslationHistoryEntryRequest(BaseModel):
    sourceText: str
    translatedText: str
    sourceLang: str
    targetLang: str
    pronunciationText: Optional[str] = None
    exampleSentences: Optional[List[ExampleSentence]] = None

# Pydantic model for creating a flashcard
class CreateFlashcardRequest(BaseModel):
    englishText: str
    categoryName: str # User-selected or new category name
    # Optional parameters for the internal translation call
    welshDialect: Optional[str] = "Standard"
    welshFormality: Optional[str] = "Standard"
    # sourceLanguage and targetLanguage are assumed to be English and Welsh for flashcards

# Pydantic model for a Flashcard response (to match Firestore structure)
class FlashcardResponse(BaseModel):
    id: str
    english: str
    welsh: str
    pronunciation: str
    category: str
    difficulty: str
    learnt: bool
    createdAt: Any
    lastReviewed: Optional[Any]
    learntAt: Optional[Any]
    exampleSentences: Optional[List[ExampleSentence]] = None

# Pydantic model for a Flashcard Category response
class FlashcardCategoryResponse(BaseModel):
    id: str
    name: str
    userId: str
    createdAt: Any
    totalFlashcards: int = 0
    learntFlashcards: int = 0

# Pydantic model for updating flashcard status
class UpdateFlashcardStatusRequest(BaseModel):
    learnt: bool # The new status (should be true for this API's purpose)

# Pydantic model for UserProfile response
class UserProfileResponse(BaseModel):
    uid: str
    email: str
    username: str
    createdAt: Any
    learningPreferences: Dict[str, Any] # Flexible dict for now
    stats: Dict[str, Any] # Flexible dict for now

# --- Security Dependency ---
# This defines an HTTP Bearer scheme for extracting the ID token from the Authorization header.
oauth2_scheme = HTTPBearer()

# Dependency to verify Firebase ID Token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    """
    Verifies the Firebase ID token sent from the client.
    Raises HTTPException if the token is invalid or expired.
    Returns the decoded token (containing user UID).
    """
    try:
        # Verify the ID token using Firebase Admin SDK.
        # check_revoked=True ensures that if the token's refresh token was revoked, it's invalid.
        decoded_token = auth.verify_id_token(credentials.credentials, check_revoked=True)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not verify authentication token.",
        )


# --- Helper to get Firestore path for user data ---
def get_user_profile_doc_ref(uid: str):
    # Use the Firebase Project ID from environment variable for consistency
    firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not firebase_project_id:
        # Fallback to a default if not set, but it should be for proper pathing
        firebase_project_id = "default-firebase-project-id"
        print("Warning: FIREBASE_PROJECT_ID not set in .env. Using default.")

    # Using a fixed 'default-app-id' for the app path, consistent with frontend
    app_id_for_path = "default-app-id" 
    return db.collection(f"artifacts/{app_id_for_path}/users/{uid}/userProfile").document("data")

# Helper to get translation history collection reference
def get_translation_history_collection_ref(uid: str):
    firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not firebase_project_id:
        firebase_project_id = "default-firebase-project-id"
        print("Warning: FIREBASE_PROJECT_ID not set in .env. Using default.")
    app_id_for_path = "default-app-id"
    return db.collection(f"artifacts/{app_id_for_path}/users/{uid}/translationHistory")

# Helper to get flashcard collection reference
def get_flashcards_collection_ref(uid: str): # <--- NEW Helper
    firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not firebase_project_id:
        firebase_project_id = "default-firebase-project-id"
        print("Warning: FIREBASE_PROJECT_ID not set in .env. Using default.")
    app_id_for_path = "default-app-id"
    return db.collection(f"artifacts/{app_id_for_path}/users/{uid}/flashcards")

# Helper to get flashcard categories collection reference
def get_flashcard_categories_collection_ref(uid: str): # <--- NEW Helper
    firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not firebase_project_id:
        firebase_project_id = "default-firebase-project-id"
        print("Warning: FIREBASE_PROJECT_ID not set in .env. Using default.")
    app_id_for_path = "default-app-id"
    return db.collection(f"artifacts/{app_id_for_path}/users/{uid}/flashcardCategories")

# --- API Endpoints ---

@app.post("/api/register-user")
async def register_user(request_data: RegisterUserRequest):
    try:
        # 1. Create user in Firebase Authentication
        user_record = auth.create_user(
            email=request_data.email,
            password=request_data.password,
            display_name=request_data.username,
            email_verified=False,
            disabled=False
        )
        print(f"Successfully created new user in Firebase Auth: {user_record.uid}")

        # 2. Save user profile data to Firestore
        user_profile_ref = get_user_profile_doc_ref(user_record.uid)
        user_profile_ref.set({ # No 'await' needed here for synchronous Firestore client
            "uid": user_record.uid,
            "email": user_record.email,
            "username": request_data.username,
            "createdAt": firestore.SERVER_TIMESTAMP, # Use Admin SDK's serverTimestamp
            "learningPreferences": {
                "difficulty": "Beginner",
                "dailyGoal": 10,
            },
            "stats": {
                "xp": 0,
                "streak": 0,
                "wordsMastered": 0,
            }
        })
        print(f"User profile saved to Firestore for UID: {user_record.uid}")

        return {"message": "User registered successfully!", "uid": user_record.uid, "email": user_record.email, "username": request_data.username}

    except auth.EmailAlreadyExistsError:
        print(f"Registration failed: Email {request_data.email} already in use.")
        raise HTTPException(status_code=409, detail="The provided email is already in use.")
    except auth.AuthError as e:
        print(f"Firebase Auth error during registration: {e}")
        raise HTTPException(status_code=400, detail=f"Firebase Auth error: {e.code} - {e.message}")
    except Exception as e:
        print(f"An unexpected error occurred during user registration: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login-user")
async def login_user(request_data: LoginUserRequest):
    try:
        # Get user record by email. This will raise UserNotFoundError if not found.
        user_record = auth.get_user_by_email(request_data.email)
        
        # Generate a custom token for the client to sign in with.
        custom_token = auth.create_custom_token(user_record.uid).decode('utf-8')
        
        # Fetch user profile from Firestore
        user_profile_ref = get_user_profile_doc_ref(user_record.uid)
        user_profile_doc = user_profile_ref.get() # No 'await' needed here
        user_profile_data = user_profile_doc.to_dict() if user_profile_doc.exists else None

        # Determine the username to return, prioritizing Firestore profile, then Auth display name, then email prefix.
        returned_username = user_profile_data.get("username") if user_profile_data else user_record.display_name
        if not returned_username and user_record.email:
            returned_username = user_record.email.split('@')[0]
        if not returned_username:
            returned_username = "User"

        return {
            "message": "User found, custom token generated.",
            "uid": user_record.uid,
            "email": user_record.email,
            "username": returned_username,
            "customToken": custom_token # Frontend will use this to sign in
        }

    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found.")
    except Exception as e:
        print(f"Error during user login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate-text", response_model=TranslateTextResponse)
async def translate_text(request_data: TranslateTextRequest):
    try:
        # Construct a detailed prompt for Gemini, incorporating dialect and formality
        prompt = f"""
        Translate the following text from {request_data.sourceLanguage} to {request_data.targetLanguage}.
        When translating to Welsh, consider the following:
        - Dialect: {request_data.welshDialect} (e.g., "Standard", "North-Welsh", "South-Welsh")
        - Formality: {request_data.welshFormality} (e.g., "Standard", "Formal", "Informal")

        For the translated text in the target language:
        1. Provide **ONLY the single most appropriate translation** of the input text.
        2. Provide its phonetic pronunciation guide (e.g., in a simple, easy-to-understand format like 'shoo-my' for 'Shwmae'). If a phonetic guide is not applicable or easily generated, return "N/A".
        3. Provide 3 example sentences using the translated phrase in context. For each example sentence, also provide its translation back into the source language ({request_data.sourceLanguage}).

        Return the response as a JSON object with the following fields:
        - "translatedText" (string): The single, most appropriate translation of the input text in the target language.
        - "pronunciationText" (string): The phonetic pronunciation guide for the translated text.
        - "exampleSentences" (array of objects): An array of 3 objects, each with "originalSentence" (the example sentence in the target language) and "sourceTranslation" (its translation back to the source language).

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

        Input: "{request_data.text}" (from {request_data.sourceLanguage} to {request_data.targetLanguage}, Dialect: {request_data.welshDialect}, Formality: {request_data.welshFormality})
        Output:
        """
        
        # Use the configured Gemini model
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
        
        translated_text = parsed_content.get("translatedText")
        pronunciation_text = parsed_content.get("pronunciationText")
        example_sentences_data = parsed_content.get("exampleSentences")

        if not translated_text:
            raise ValueError("Gemini did not return translated text.")

        example_sentences_list = []
        if example_sentences_data:
            for item in example_sentences_data:
                if isinstance(item, dict) and "originalSentence" in item and "sourceTranslation" in item:
                    example_sentences_list.append(ExampleSentence(**item))
                else:
                    print(f"Warning: Invalid example sentence format received: {item}")
                    
        return TranslateTextResponse(
            translatedText=translated_text,
            pronunciationText=pronunciation_text,
            exampleSentences=example_sentences_list
        )

    except Exception as e:
        print(f"Error during text translation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stt-welsh-english")
async def speech_to_text(request: Request):
    try:
        audio_data = await request.body()
        
        if not audio_data:
            raise HTTPException(status_code=400, detail="No audio data provided.")

        content_type = request.headers.get("Content-Type", "audio/webm")

        contents = [
            {"role": "user", "parts": [{"text": "Transcribe the audio provided. Identify the language."}]},
            {"role": "user", "parts": [{"inline_data": {"mime_type": content_type, "data": audio_data}}]}
        ]
        
        response = gemini_model.generate_content(contents)
        transcribed_text = response.text

        if not transcribed_text:
            raise ValueError("Gemini did not return transcribed text.")

        return {"transcribedText": transcribed_text}

    except Exception as e:
        print(f"Error during speech-to-text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts-welsh")
async def text_to_speech(request_data: TextToSpeechRequest):
    try:
        synthesis_input = texttospeech.SynthesisInput(text=request_data.text)
        
        voice_params = texttospeech.VoiceSelectionParams(
            language_code="cy-GB",
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            sample_rate_hertz=24000
        )
        
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice_params,
            audio_config=audio_config
        )
        
        return Response(content=response.audio_content, media_type="audio/wav")

    except Exception as e:
        print(f"Error during text-to-speech: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-translation-history")
async def save_translation_history(
    request_data: TranslationHistoryEntryRequest,
    decoded_token: Dict[str, Any] = Depends(verify_token)
):
    """
    Saves a translation entry to the user's history in Firestore.
    Maintains a maximum of 10 entries by removing the oldest if limit is exceeded.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    Now includes pronunciation text and example sentences.
    """
    try:
        uid = decoded_token["uid"]
        history_ref = get_translation_history_collection_ref(uid)

        # 1. Get current history count and oldest entry
        query_snapshot = history_ref.order_by("timestamp", direction=firestore.Query.ASCENDING).get()
        current_entries = [{"id": doc.id, **doc.to_dict()} for doc in query_snapshot]

        # 2. If count is 10 or more, delete the oldest entry
        if len(current_entries) >= 10:
            oldest_entry_id = current_entries[0]["id"]
            history_ref.document(oldest_entry_id).delete()
            print(f"Deleted oldest translation history entry {oldest_entry_id} for user {uid}.")

        # 3. Add the new translation entry with all details
        new_entry_data = {
            "sourceText": request_data.sourceText,
            "translatedText": request_data.translatedText,
            "sourceLang": request_data.sourceLang,
            "targetLang": request_data.targetLang,
            "pronunciationText": request_data.pronunciationText, # <--- Added
            "exampleSentences": [item.dict() for item in request_data.exampleSentences] if request_data.exampleSentences else [], # <--- Added, convert Pydantic models to dicts
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        history_ref.add(new_entry_data)
        print(f"Added new translation history entry for user {uid}.")

        return {"message": "Translation history saved successfully."}

    except Exception as e:
        print(f"Error saving translation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/create-flashcard")
async def create_flashcard(
    request_data: CreateFlashcardRequest,
    decoded_token: Dict[str, Any] = Depends(verify_token)
):
    try:
        uid = decoded_token["uid"]
        flashcards_ref = get_flashcards_collection_ref(uid)
        categories_ref = get_flashcard_categories_collection_ref(uid)

        # Initialize category_name here to ensure it's always defined
        category_name = request_data.categoryName.strip() # <--- DEFINED HERE

        if not category_name:
            raise HTTPException(status_code=400, detail="Flashcard category name cannot be empty.")

        # Check if category exists or create it
        category_query = categories_ref.where("name", "==", category_name).limit(1).get()
        existing_category_docs = [{"id": doc.id, **doc.to_dict()} for doc in category_query]

        if not existing_category_docs:
            categories_ref.add({
                "name": category_name,
                "userId": uid,
                "createdAt": firestore.SERVER_TIMESTAMP
            })
            print(f"New flashcard category '{category_name}' created for user {uid}.")
        else:
            print(f"Category '{category_name}' already exists for user {uid}.")


        # 2. Call internal translate-text API to get translation data
        translation_request = TranslateTextRequest(
            text=request_data.englishText,
            sourceLanguage="English",
            targetLanguage="Welsh",
            welshDialect=request_data.welshDialect,
            welshFormality=request_data.welshFormality
        )

        translation_response = await translate_text(translation_request)

        translated_text = translation_response.translatedText
        pronunciation_text = translation_response.pronunciationText
        example_sentences = [item.dict() for item in translation_response.exampleSentences] if translation_response.exampleSentences else []


        # 3. Save the new flashcard to Firestore
        flashcard_data_for_db = {
            "english": request_data.englishText,
            "welsh": translated_text,
            "pronunciation": pronunciation_text,
            "category": category_name, # This now correctly references the variable defined above
            "difficulty": "Beginner",
            "learnt": False,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "exampleSentences": example_sentences
        }
        flashcards_ref.add(flashcard_data_for_db)
        print(f"New flashcard created and saved for user {uid} in category '{category_name}'.")

        return {"message": "Flashcard created successfully!",
                "flashcard": {
                    "english": request_data.englishText,
                    "welsh": translated_text,
                    "pronunciation": pronunciation_text,
                    "category": category_name, # This also correctly references the variable
                    "difficulty": "Beginner",
                    "learnt": False,
                    "exampleSentences": example_sentences
                }
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating flashcard: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/get-flashcards", response_model=List[FlashcardResponse])
async def get_flashcards(
    decoded_token: Dict[str, Any] = Depends(verify_token),
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search_term: Optional[str] = None
):
    """
    Retrieves flashcards for the authenticated user from Firestore.
    Supports filtering by category, difficulty, and searching by text.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    """
    try:
        uid = decoded_token["uid"]
        flashcards_collection = get_flashcards_collection_ref(uid)

        query_ref = flashcards_collection.order_by("createdAt", direction=firestore.Query.DESCENDING)

        if category and category != "All":
            query_ref = query_ref.where("category", "==", category)
        if difficulty and difficulty != "All":
            query_ref = query_ref.where("difficulty", "==", difficulty)

        docs = query_ref.get()
        
        fetched_flashcards = []
        for doc in docs:
            card_data = doc.to_dict()
            card_data["id"] = doc.id
            
            # Apply search_term filter in memory
            if search_term:
                search_lower = search_term.lower()
                if not (search_lower in card_data.get("english", "").lower() or
                        search_lower in card_data.get("welsh", "").lower() or
                        search_lower in card_data.get("pronunciation", "").lower()):
                    continue
            
            # FIX: More robust Timestamp conversion
            for field in ["createdAt", "lastReviewed", "learntAt"]:
                if field in card_data and card_data[field] is not None:
                    # Try converting to datetime and then isoformat
                    try:
                        # Firestore Timestamp objects have a to_datetime() method
                        if hasattr(card_data[field], 'to_datetime'):
                            card_data[field] = card_data[field].to_datetime().isoformat()
                        # Sometimes it might already be a datetime object
                        elif isinstance(card_data[field], datetime.datetime):
                            card_data[field] = card_data[field].isoformat()
                        else:
                            # If it's neither, set to None or log warning
                            card_data[field] = None
                            print(f"Warning: Field '{field}' for card {doc.id} is not a recognized Timestamp/datetime type: {type(card_data[field])}")
                    except Exception as conv_e:
                        card_data[field] = None
                        print(f"Error converting field '{field}' for card {doc.id}: {conv_e}")
                else:
                    card_data[field] = None # Ensure it's None if not present or None

            fetched_flashcards.append(FlashcardResponse(**card_data))

        return fetched_flashcards

    except Exception as e:
        print(f"Error retrieving flashcards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get-flashcard-categories", response_model=List[FlashcardCategoryResponse])
async def get_flashcard_categories(
    decoded_token: Dict[str, Any] = Depends(verify_token)
):
    """
    Retrieves flashcard categories for the authenticated user from Firestore,
    including counts of total and learnt flashcards within each category.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    """
    try:
        uid = decoded_token["uid"]
        categories_collection = get_flashcard_categories_collection_ref(uid)
        flashcards_collection = get_flashcards_collection_ref(uid)

        docs = categories_collection.order_by("createdAt", direction=firestore.Query.ASCENDING).get()
        
        fetched_categories = []
        for doc in docs:
            category_data = doc.to_dict()
            category_data["id"] = doc.id
            
            # FIX: More robust Timestamp conversion for createdAt
            if "createdAt" in category_data and category_data["createdAt"] is not None:
                try:
                    if hasattr(category_data["createdAt"], 'to_datetime'):
                        category_data["createdAt"] = category_data["createdAt"].to_datetime().isoformat()
                    elif isinstance(category_data["createdAt"], datetime.datetime):
                        category_data["createdAt"] = category_data["createdAt"].isoformat()
                    else:
                        category_data["createdAt"] = None
                        print(f"Warning: Field 'createdAt' for category {doc.id} is not a recognized Timestamp/datetime type: {type(category_data['createdAt'])}")
                except Exception as conv_e:
                    category_data["createdAt"] = None
                    print(f"Error converting 'createdAt' for category {doc.id}: {conv_e}")
            else:
                category_data["createdAt"] = None
            
            # --- Calculate counts for each category ---
            category_flashcards_query = flashcards_collection.where("category", "==", category_data["name"]).get()
            
            total_flashcards = 0
            learnt_flashcards = 0
            
            for card_doc in category_flashcards_query:
                total_flashcards += 1
                if card_doc.to_dict().get("learnt", False):
                    learnt_flashcards += 1
            
            category_data["totalFlashcards"] = total_flashcards
            category_data["learntFlashcards"] = learnt_flashcards
            # --- End Calculate counts ---

            fetched_categories.append(FlashcardCategoryResponse(**category_data))

        return fetched_categories

    except Exception as e:
        print(f"Error retrieving flashcard categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get-flashcards-by-category/{category_name}", response_model=List[FlashcardResponse])
async def get_flashcards_by_category(
    category_name: str,
    decoded_token: Dict[str, Any] = Depends(verify_token)
):
    """
    Retrieves all flashcards for a specific category for the authenticated user from Firestore.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    """
    try:
        uid = decoded_token["uid"]
        flashcards_collection = get_flashcards_collection_ref(uid)

        query_ref = flashcards_collection.where("category", "==", category_name).order_by("createdAt", direction=firestore.Query.DESCENDING)
        
        docs = query_ref.get()
        
        fetched_flashcards = []
        for doc in docs:
            card_data = doc.to_dict()
            card_data["id"] = doc.id
            
            # FIX: More robust Timestamp conversion
            for field in ["createdAt", "lastReviewed", "learntAt"]:
                if field in card_data and card_data[field] is not None:
                    try:
                        if hasattr(card_data[field], 'to_datetime'):
                            card_data[field] = card_data[field].to_datetime().isoformat()
                        elif isinstance(card_data[field], datetime.datetime):
                            card_data[field] = card_data[field].isoformat()
                        else:
                            card_data[field] = None
                            print(f"Warning: Field '{field}' for card {doc.id} is not a recognized Timestamp/datetime type: {type(card_data[field])}")
                    except Exception as conv_e:
                        card_data[field] = None
                        print(f"Error converting field '{field}' for card {doc.id}: {conv_e}")
                else:
                    card_data[field] = None

            fetched_flashcards.append(FlashcardResponse(**card_data))

        return fetched_flashcards

    except Exception as e:
        print(f"Error retrieving flashcards by category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get-flashcard/{card_id}", response_model=FlashcardResponse)
async def get_flashcard(
    card_id: str,
    decoded_token: Dict[str, Any] = Depends(verify_token)
):
    """
    Retrieves a single flashcard by its ID for the authenticated user.
    Updates the 'lastReviewed' field to the current time each time it's called.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    """
    try:
        uid = decoded_token["uid"]
        flashcard_doc_ref = get_flashcards_collection_ref(uid).document(card_id)

        doc_snapshot = flashcard_doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(status_code=404, detail="Flashcard not found.")

        card_data = doc_snapshot.to_dict()
        card_data["id"] = doc_snapshot.id

        # Update 'lastReviewed' field in Firestore
        update_data = {
            "lastReviewed": firestore.SERVER_TIMESTAMP
        }
        flashcard_doc_ref.update(update_data)

        # FIX: More robust Timestamp conversion for response
        for field in ["createdAt", "lastReviewed", "learntAt"]:
            if field in card_data and card_data[field] is not None:
                try:
                    if hasattr(card_data[field], 'to_datetime'):
                        card_data[field] = card_data[field].to_datetime().isoformat()
                    elif isinstance(card_data[field], datetime.datetime):
                        card_data[field] = card_data[field].isoformat()
                    else:
                        card_data[field] = None
                        print(f"Warning: Field '{field}' for card {card_id} is not a recognized Timestamp/datetime type: {type(card_data[field])}")
                except Exception as conv_e:
                    card_data[field] = None
                    print(f"Error converting field '{field}' for card {card_id}: {conv_e}")
            else:
                card_data[field] = None

        return FlashcardResponse(**card_data)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error retrieving or updating flashcard {card_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/update-flashcard-learnt-status/{card_id}")
async def update_flashcard_learnt_status(
    card_id: str, # Path parameter for flashcard ID
    request_data: UpdateFlashcardStatusRequest,
    decoded_token: Dict[str, Any] = Depends(verify_token)
):
    """
    Updates the 'learnt' status of a specific flashcard and sets 'learntAt' timestamp.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    """
    try:
        uid = decoded_token["uid"]
        flashcard_doc_ref = get_flashcards_collection_ref(uid).document(card_id)

        # Update the document
        update_data = {
            "learnt": request_data.learnt,
            "learntAt": firestore.SERVER_TIMESTAMP # Set learntAt to current server time
        }
        flashcard_doc_ref.update(update_data) # .update() will create learntAt if not present

        return {"message": f"Flashcard {card_id} learnt status updated to {request_data.learnt}."}

    except Exception as e:
        print(f"Error updating flashcard {card_id} learnt status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get-user-profile", response_model=UserProfileResponse) # <--- NEW GET Endpoint
async def get_user_profile(
    decoded_token: Dict[str, Any] = Depends(verify_token) # Secure this endpoint
):
    """
    Retrieves the authenticated user's profile data from Firestore.
    Requires a valid Firebase ID Token in the Authorization: Bearer header.
    """
    try:
        uid = decoded_token["uid"]
        user_profile_doc_ref = get_user_profile_doc_ref(uid)

        user_profile_doc = user_profile_doc_ref.get()

        if not user_profile_doc.exists:
            raise HTTPException(status_code=404, detail="User profile not found. Please register or ensure data exists.")

        profile_data = user_profile_doc.to_dict()

        # Convert Firestore Timestamp to ISO string for response
        if type(profile_data.get("createdAt")).__name__ == 'Timestamp':
            profile_data["createdAt"] = profile_data["createdAt"].isoformat()

        return UserProfileResponse(**profile_data)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error retrieving user profile for {uid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Health Check Endpoint ---
@app.get("/")
async def read_root():
    return {"message": "FlipCymru Backend is running!"}