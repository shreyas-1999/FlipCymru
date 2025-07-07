# FlipCymru Backend Server

## 📝 Description

This repository contains the Python-based backend server for the FlipCymru Welsh language learning application. Built with FastAPI, it provides robust and secure API endpoints for user authentication, AI-powered translations (text-to-text, speech-to-text), text-to-speech generation for Welsh pronunciation, flashcard management, and translation history tracking, all integrated with Google Firebase and Google AI services.

## ✨ Features

The backend server exposes the following API endpoints:

* **User Management:**
    * `POST /api/register-user`: Register a new user with email, password, and username, storing profile data in Firestore.
    * `POST /api/login-user`: Log in an existing user and return a Firebase Custom Token for client-side authentication.
* **AI-Powered Translation & Speech:**
    * `POST /api/translate-text`: Translate text (English to Welsh) using Google Gemini, providing a single most appropriate translation, pronunciation guide, and 3 example sentences (with source translations). Supports Welsh dialect and formality options.
    * `POST /api/stt-welsh-english`: Transcribe audio input to text using Google Gemini.
    * `POST /api/tts-welsh`: Convert Welsh text to audio using Google Cloud Text-to-Speech, returning a `.wav` audio file.
* **Flashcard Management:**
    * `POST /api/create-flashcard`: Create a new flashcard for a user, using Gemini for translation/pronunciation, associating it with a category (existing or new), and setting its initial 'learnt' status to `false`.
    * `GET /api/get-flashcards`: Retrieve all flashcards for the authenticated user. Supports optional filters for category, difficulty, and search terms.
    * `GET /api/get-flashcards-by-category/{category_name}`: Retrieve all flashcards belonging to a specific category for the authenticated user.
    * `GET /api/get-flashcard/{card_id}`: Retrieve a single flashcard by ID, and update its `lastReviewed` timestamp.
    * `PUT /api/update-flashcard-learnt-status/{card_id}`: Update a flashcard's `learnt` status to `true` and set a `learntAt` timestamp.
* **Translation History:**
    * `POST /api/save-translation-history`: Save a translation (with all its details including pronunciation and example sentences) to the user's history, maintaining a maximum of 10 entries by removing the oldest if the limit is exceeded.
* **Category Management:**
    * `GET /api/get-flashcard-categories`: Retrieve all flashcard categories for the authenticated user, including the count of total and learned flashcards within each category.
* **Health Check:**
    * `GET /`: Basic endpoint to confirm the server is running.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.8+**: Recommended to use the latest LTS version (e.g., Python 3.9+ or 3.10+). Verify with `python --version`.
* **`pip`**: Python's package installer. Comes with Python. Verify with `pip --version`.
* **`venv`**: Python's built-in module for virtual environments.
* **Firebase Project**: An active Firebase project with Authentication (Email/Password, Google, Anonymous) and Firestore Database enabled.
* **Google Cloud API Keys**:
    * **Firebase Admin SDK Private Key**: A JSON file downloaded from Firebase Console (Project settings > Service accounts > Generate new private key).
    * **Google Gemini API Key**: An API key from Google AI Studio or Google Cloud Console (`Generative Language API` enabled).
    * **Google Cloud Text-to-Speech API Key**: An API key from Google Cloud Console (`Cloud Text-to-Speech API` enabled).

## 🛠️ Setup Instructions

Follow these steps to get the backend server running locally:

1.  **Clone the Repository:**
    If this backend is in a separate repository, clone it. If it's part of a monorepo, navigate to your `backend` directory.

    ```bash
    # Example for monorepo structure
    cd E:\Dissertation\FlipCymru Source Code\FlipCymru\backend
    ```

2.  **Create and Activate a Python Virtual Environment:**
    It's best practice to isolate your project dependencies.

    ```bash
    python -m venv venv
    ```

    * **Activate the virtual environment:**
        * **On Windows (Command Prompt):**
            ```bash
            venv\Scripts\activate.bat
            ```
        * **On Windows (PowerShell):**
            ```powershell
            .\venv\Scripts\Activate.ps1
            ```
        * *(You should see `(venv)` at the beginning of your command prompt line.)*

3.  **Install Python Dependencies:**
    With your virtual environment active, install all required packages:

    ```bash
    pip install fastapi uvicorn python-dotenv firebase-admin google-generativeai google-cloud-texttospeech
    ```

4.  **Configure Environment Variables (`.env` file):**
    * In the **root of your `backend` directory**, create a file named `.env`.
    * Open the JSON file you downloaded for your **Firebase Admin SDK Private Key**. Copy its entire content.
    * Paste the copied content and your other API keys into `.env` as follows. **Ensure the JSON content for `FIREBASE_ADMIN_SDK_CONFIG` is on a single line** (remove newlines).

        ```dotenv
        # .env (for Python backend)

        # Firebase Admin SDK Service Account Private Key (entire JSON content as a single string)
        # IMPORTANT: Keep this file secure and do NOT commit to Git!
        FIREBASE_ADMIN_SDK_CONFIG='{"type": "service_account", "project_id": "your-project-id", "private_key_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", "client_email": "...", "client_id": "...", "auth_uri": "...", "token_uri": "...", "auth_provider_x509_cert_url": "...", "universe_domain": "..."}'

        # Google Gemini API Key (ensure Generative Language API is enabled in GCP)
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

        # Google Cloud Text-to-Speech API Key (ensure Cloud Text-to-Speech API is enabled in GCP)
        GOOGLE_TTS_API_KEY="YOUR_GOOGLE_CLOUD_TTS_API_KEY"

        # Your Firebase Project ID (e.g., "flipcymru-xyz") - used for Firestore paths
        FIREBASE_PROJECT_ID="your-firebase-project-id"
        ```
    * **Add `.env` to your backend's `.gitignore` file** to prevent it from being committed.

5.  **Firebase/Google Cloud Console Setup:**

    * **Firestore Database:** Ensure you have created your Firestore database instance in the Firebase Console. If you created a named database (e.g., `flipcymru-db`), verify that `db = firestore.client(database_id="flipcymru-db")` in `main.py` matches this ID.
    * **API Enablement:** Confirm `Generative Language API` (for Gemini) and `Cloud Text-to-Speech API` are enabled in your Google Cloud Console (APIs & Services > Enabled APIs & services) under your Firebase project.
    * **API Key Restrictions:** Ensure your `GEMINI_API_KEY` and `GOOGLE_TTS_API_KEY` (if separate) are restricted to *only* their respective APIs in Google Cloud Console (APIs & Services > Credentials).

## 🏃 Running the Server

1.  **Activate your virtual environment** (if not already active).
    ```bash
    # On Windows Command Prompt:
    venv\Scripts\activate.bat
    ```

2.  **Start the FastAPI server:**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    * `main:app`: Refers to the `app` object within `main.py`.
    * `--reload`: Automatically restarts the server when code changes are detected.
    * `--port 8000`: Runs the server on port 8000. (Your frontend will typically run on port 3000).

3.  **Access API Documentation:**
    Once the server starts, open your browser to `http://localhost:8000/docs` to see the interactive Swagger UI documentation for all your API endpoints.

4.  **Stopping the Server:**
    * In the terminal where the server is running, press `Ctrl + C`.

## 🧪 Testing API Endpoints with Postman

All API endpoints require a **Firebase ID Token** in the `Authorization: Bearer <ID_TOKEN>` header for authenticated requests.

### **Authentication Flow to Get ID Token (One-Time Setup in Postman):**

1.  **Get a Firebase Custom Token (`POST http://localhost:8000/api/login-user`):**
    * **Headers:** `Content-Type: application/json`
    * **Body (raw JSON):** `{"email": "your_email@example.com", "password": "your_password"}`
    * **Response:** Copy the `customToken` value.

2.  **Exchange Custom Token for ID Token (`POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=YOUR_FRONTEND_FIREBASE_API_KEY`):**
    * **URL:** Use Firebase Auth REST API with your `NEXT_PUBLIC_FIREBASE_API_KEY` (from your frontend's `.env.local`).
    * **Headers:** `Content-Type: application/json`
    * **Body (raw JSON):** `{"token": "PASTE_CUSTOM_TOKEN_HERE", "returnSecureToken": true}`
    * **Response:** Copy the `idToken` value. This is your authentication token for backend calls.

---

### **Sample API Calls (Using the `ID_TOKEN` from above):**

#### **1. `GET /` (Health Check)**

* **Method:** `GET`
* **URL:** `http://localhost:8000/`
* **Headers:** (None needed)
* **Expected Response:** `{"message": "FlipCymru Backend is running!"}`

#### **2. `POST /api/register-user`**

* **Method:** `POST`
* **URL:** `http://localhost:8000/api/register-user`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
    ```json
    {
      "email": "newuser@test.com",
      "password": "strongpassword",
      "username": "TestUser"
    }
    ```

#### **3. `POST /api/translate-text`**

* **Method:** `POST`
* **URL:** `http://localhost:8000/api/translate-text`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
    ```json
    {
      "text": "Where is the post office?",
      "sourceLanguage": "English",
      "targetLanguage": "Welsh",
      "welshDialect": "Standard",
      "welshFormality": "Standard"
    }
    ```

#### **4. `POST /api/stt-welsh-english`**

* **Method:** `POST`
* **URL:** `http://localhost:8000/api/stt-welsh-english`
* **Headers:**
    * `Content-Type: audio/webm` (or `audio/wav`, `audio/mp3` depending on your file)
* **Body:** Select `binary` and upload a small audio file (e.g., `.webm` or `.wav`).

#### **5. `POST /api/tts-welsh`**

* **Method:** `POST`
* **URL:** `http://localhost:8000/api/tts-welsh`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
    ```json
    {
      "text": "Croeso i Gaerdydd."
    }
    ```

#### **6. `POST /api/save-translation-history`**

* **Method:** `POST`
* **URL:** `http://localhost:8000/api/save-translation-history`
* **Headers:**
    * `Content-Type: application/json`
    * `Authorization: Bearer YOUR_ID_TOKEN_HERE` (from the authentication flow above)
* **Body (raw JSON):**
    ```json
    {
      "sourceText": "Good morning",
      "translatedText": "Bore da",
      "sourceLang": "en",
      "targetLang": "cy",
      "pronunciationText": "bor-eh dah",
      "exampleSentences": [
        {"originalSentence": "Bore da, sut wyt ti?", "sourceTranslation": "Good morning, how are you?"}
      ]
    }
    ```

#### **7. `POST /api/create-flashcard`**

* **Method:** `POST`
* **URL:** `http://localhost:8000/api/create-flashcard`
* **Headers:**
    * `Content-Type: application/json`
    * `Authorization: Bearer YOUR_ID_TOKEN_HERE`
* **Body (raw JSON):**
    ```json
    {
      "englishText": "Where is the school?",
      "categoryName": "Places",
      "welshDialect": "Standard",
      "welshFormality": "Standard"
    }
    ```

#### **8. `GET /api/get-flashcard-categories`**

* **Method:** `GET`
* **URL:** `http://localhost:8000/api/get-flashcard-categories`
* **Headers:** `Authorization: Bearer YOUR_ID_TOKEN_HERE`

#### **9. `GET /api/get-flashcards`**

* **Method:** `GET`
* **URL:** `http://localhost:8000/api/get-flashcards?category=Daily Phrases&difficulty=Beginner`
* **Headers:** `Authorization: Bearer YOUR_ID_TOKEN_HERE`
* *(Optional query parameters: `category`, `difficulty`, `search_term`)*

#### **10. `GET /api/get-flashcards-by-category/{category_name}`**

* **Method:** `GET`
* **URL:** `http://localhost:8000/api/get-flashcards-by-category/Daily%20Phrases`
* **Headers:** `Authorization: Bearer YOUR_ID_TOKEN_HERE`
* *(Remember to URL-encode category names with spaces, like `Daily%20Phrases`)*

#### **11. `GET /api/get-flashcard/{card_id}`**

* **Method:** `GET`
* **URL:** `http://localhost:8000/api/get-flashcard/YOUR_FLASHCARD_ID`
* **Headers:** `Authorization: Bearer YOUR_ID_TOKEN_HERE`
* *(Replace `YOUR_FLASHCARD_ID` with an actual ID from your Firestore console or `get-flashcards` API call)*

---

## 🌱 Seeding Mock Data (Optional)

To populate your Firestore database with mock flashcard categories and cards for testing:

1.  **Update `seed_firestore.py`:**
    * **Crucially**, update the `TEST_USERS` list with the actual UIDs of your test users from the Firebase Authentication console.
    * You can uncomment the lines that clear existing data if you want a fresh set of seeded data each time you run the script.
2.  **Run the script:**
    ```bash
    # Activate your virtual environment first if not active
    venv\Scripts\activate.bat
    python seed_firestore.py
    ```
    * *(This script will make calls to Gemini, so it might take a few minutes.)*

## 🐛 Troubleshooting

* **`ImportError: cannot import name '...'`**: Ensure all Python dependencies are installed correctly in your virtual environment. If issues persist, try deleting and recreating your `venv`, then reinstalling.
* **`uvicorn.importer.ImportFromStringError`**: Double-check that your `uvicorn` command (`uvicorn main:app`) correctly points to your FastAPI app instance.
* **`ValueError` related to environment variables**: Ensure your `.env` file is correctly formatted (especially the `FIREBASE_ADMIN_SDK_CONFIG` JSON on a single line) and that the keys are present and correctly named.
* **Firebase `404 database does not exist`**: Verify your Firestore database is created in the Firebase console and that the `database_id` in `main.py` matches.
* **`TypeError: 'Sentinel' object is not iterable`**: This typically means `firestore.SERVER_TIMESTAMP` was accidentally included in a FastAPI response. Ensure it's only used when writing to Firestore, not returned directly.
* **`module 'firebase_admin.firestore' has no attribute 'Timestamp'` (or similar `Timestamp` errors)**: Ensure you've followed the latest fix for this, using `type(obj).__name__ == 'Timestamp'` for `isinstance` checks if direct imports fail.
* **Server hangs or crashes on startup**: Check terminal output for errors, ensure all API keys are correct, and try a fresh `pip install` in your `venv`.