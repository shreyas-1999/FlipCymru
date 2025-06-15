# FlipCymru
A web application to allow users to learn welsh using flashcards that translate daily use words from english to welsh.

## Install Flask server dependencies:
pip install flask flask-cors flask-jwt-extended psycopg2-binary gtts python-dotenv bcrypt

## Project Structure

### Backend Structure
flipcymru-backend/
├── venv/
├── app/
│   ├── __init__.py
│   ├── auth.py
│   ├── flashcards.py
│   ├── models.py
│   └── tts.py
├── .env
├── run.py

### Frontend Structure
flipcymru-frontend/
├── index.html          ← login page
├── register.html       ← user registration
├── home.html           ← category list
├── flashcards.html     ← flashcard viewer
├── create.html         ← new page for custom flashcards
├── partials/
│   ├── header.html
│   └── footer.html
├── script/
│   ├── auth.js         ← login/register logic
│   ├── home.js         ← fetch & show categories
│   ├── flashcards.js   ← flip cards + audio
│   ├── layout.js       ← handles header/footer loading
│   └── create.js
├── styles.css          ← optional custom CSS
├── firebase.js         ← config for google login

### To Launch the project:
✅ 1. Activate your Python virtual environment

Open Command Prompt and run:
cd path\to\flipcymru-backend
venv\Scripts\activate

Replace path\to\ with the actual path where your backend folder is.

✅ 2. Run your Flask app
Make sure you have run.py at the root

Then in bash run:
python run.py
You should see:

 * Running on http://127.0.0.1:5000/
✅ Your API is live on http://localhost:5000

✅ 3. Launch your frontend
You must use a local server if using Firebase Google Login (to avoid browser security restrictions).

Option A: Python’s built-in web server

cd path\to\flipcymru-frontend
python -m http.server 8000

Now go to:
http://localhost:8000/index.html

Option B: VS Code + Live Server Extension
Open your flipcymru-frontend folder in VS Code

Install the Live Server extension

Right-click on index.html → Open with Live Server