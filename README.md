# Voice-First Shopping for Bharat

An AI-powered shopping assistant that lets users browse and buy fashion products using **voice commands in regional Indian languages** (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati).

Built for Tier 2/3 city users who aren't comfortable with English UIs — solving a real accessibility gap in Indian e-commerce.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) + TailwindCSS |
| Backend | Python / FastAPI |
| Speech-to-Text | Deepgram (Nova-2, real-time) |
| Translation | Google Translate API |
| Text-to-Speech | gTTS |
| Database | MongoDB Atlas |
| ML | scikit-learn (content-based recommendations) |

## How It Works

```
User speaks: "मुझे लाल कुर्ता दिखाओ" (Show me red kurta)
    ↓ Deepgram transcribes voice
    ↓ Translator converts to English
    ↓ Intent parser extracts: {color: red, item: kurta}
    ↓ MongoDB finds matching products
    ↓ Response translated back to Hindi
    ↓ gTTS speaks: "यहाँ लाल कुर्ते हैं"
User sees products + hears response in their language
```

## Supported Languages

| Language | Script |
|----------|--------|
| Hindi | देवनागरी |
| Tamil | தமிழ் |
| Telugu | తెలుగు |
| Kannada | ಕನ್ನಡ |
| Bengali | বাংলা |
| Marathi | मराठी |
| Gujarati | ગુજરાતી |
| English | Latin |

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free tier)
- Deepgram API key (free $200 credit)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Seed Product Data
```bash
cd data
python process_data.py
cd ../backend
python -m app.database.seed
```

## Project Structure

```
├── frontend/          # React app (Vite + TailwindCSS)
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── models/    # Pydantic schemas
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic (STT, translation, search)
│   │   └── database/  # MongoDB connection & seeding
│   └── ml/            # Recommendation model
└── data/              # Product dataset & processing
```

## Features

- Voice search in 8 Indian languages
- Real-time speech-to-text with Deepgram
- Smart intent parsing (color, category, price range)
- Product recommendations (ML-based)
- Text-to-speech responses in user's language
- Mobile-first responsive design
- Shopping cart with session management
