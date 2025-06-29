# FlipCymru Python Backend

This directory contains the Python Flask backend for the FlipCymru web application. It handles user authentication using Firebase, data storage with Firestore, and integrates with the Google Gemini API for AI features.

## Table of Contents

1. [Prerequisites](#prerequisites)

2. [Setup Instructions](#setup-instructions)

   * [1. Clone the Repository](#1-clone-the-repository)

   * [2. Create and Activate a Virtual Environment](#2-create-and-activate-a-virtual-environment)

   * [3. Install Dependencies](#3-install-dependencies)

   * [4. Firebase Project Setup & Service Account Key](#4-firebase-project-setup--service-account-key)

   * [5. Google Gemini API Key](#5-google-gemini-api-key)

   * [6. Configure Environment Variables](#6-configure-environment-variables)

3. [Running the Server](#running-the-server)

4. [Project Structure](#project-structure)

5. [Key Technologies](#key-technologies)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Python 3.9+** (recommended)

* **pip** (Python package installer, usually comes with Python)

* **Git** (to clone the repository)

* **Firebase Project:** An existing Firebase project where you will manage authentication and Firestore data.

* **Google Gemini API Key:** An API key from [Google AI Studio](https://aistudio.google.com/app/apikey) for using the Gemini API.

## Setup Instructions

Follow these steps to get the backend server up and running on your local machine.

### 1. Clone the Repository

If you haven't already, clone your FlipCymru repository. This backend folder is expected to be located within the root of your main project.

```
git clone [https://github.com/shreyas-1999/FlipCymru.git](https://github.com/shreyas-1999/FlipCymru.git)
cd FlipCymru

```

Then navigate into the backend directory:

```
cd flipcymru-backend

```

### 2. Create and Activate a Virtual Environment

It's highly recommended to use a virtual environment to manage project dependencies.

```
# Create the virtual environment
python3 -m venv venv

# Activate the virtual environment:
# On macOS/Linux:
source venv/bin/activate

# On Windows (Command Prompt):
# venv\Scripts\activate.bat

# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

```

### 3. Install Dependencies

With your virtual environment activated, install the required Python packages using the `requirements.txt` file.

```
pip install -r requirements.txt

```

### 4. Firebase Project Setup & Service Account Key

For your Python backend to securely interact with Firebase, you need a Service Account Key.

1. **Go to the Firebase Console:** Visit <https://console.firebase.google.com/> and sign in.

2. **Select your Project:** Choose the Firebase project associated with your FlipCymru application.

3. **Generate a Private Key:**

   * Navigate to **Project settings** (gear icon) > **Service accounts** tab.

   * Click on **"Generate new private key"**, then click "Generate key".

   * A JSON file will be downloaded. **Rename this file to `serviceAccountKey.json`** and **place it directly inside your `flipcymru-backend` directory.**

   **SECURITY WARNING:** This `serviceAccountKey.json` grants administrative access to your Firebase project. **NEVER commit this file to your Git repository or share it publicly.** It is already listed in the `.gitignore` provided to prevent accidental commits.

### 5. Google Gemini API Key

You'll need a Google Gemini API key for the AI chat and translation features.

1. **Get your API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate an API key.
   (If you are using Google Cloud, you might get it from the Google Cloud Console's AI Platform or API & Services section, but AI Studio is generally simpler for quick access).

### 6. Configure Environment Variables

Create a file named `.env` in the root of your `flipcymru-backend` directory (the same level as `app.py`) and add your configuration details:

```
# flipcymru-backend/.env
PORT=5000
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE

```

* **`PORT`**: The port your Flask server will run on. Default is `5000`.

* **`GEMINI_API_KEY`**: Paste the Gemini API key you obtained in the previous step.

**SECURITY NOTE:** The `.env` file is excluded from version control by `.gitignore` to keep your sensitive keys private.

## Running the Server

Once all dependencies are installed and environment variables are configured:

1. **Ensure your virtual environment is active.**

2. **Navigate to the `flipcymru-backend` directory.**

3. **Run the Flask application:**

   ```
   python app.py
   
   ```

   You should see output similar to this:

   ```
    * Serving Flask app 'app'
    * Debug mode: on
   Firebase Admin SDK initialized successfully!
   Gemini API configured successfully using google-genai!
    * Running on [http://127.0.0.1:5000](http://127.0.0.1:5000)
   Press CTRL+C to quit
    * Restarting with stat
    * Debugger is active!
    * Debugger PIN: XXX-XXX-XXX
   
   ```

   You can now access the backend API at `http://127.0.0.1:5000/`.
   Visit `http://127.0.0.1:5000/health` to check the status of Firebase and Gemini API connections.

## Project Structure

```
flipcymru-backend/
├── venv/                      # Python virtual environment (ignored by Git)
├── .env                       # Environment variables (ignored by Git)
├── serviceAccountKey.json     # Firebase Service Account Key (ignored by Git)
├── .gitignore                 # Specifies files/folders to ignore in Git
├── app.py                     # Main Flask application file
└── requirements.txt           # List of Python dependencies

```

## Key Technologies

* **Flask:** Lightweight Python web framework.

* **Firebase Admin SDK:** For backend interactions with Firebase Authentication and Firestore.

* **Google Gemini API:** For generative AI capabilities (chatbot, translation).

* **Flask-Cors:** Middleware for handling Cross-Origin Resource Sharing.

* **python-dotenv:** For loading environment variables.
