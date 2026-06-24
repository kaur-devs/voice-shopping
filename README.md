# Voice-First Shopping for Bharat

An AI-powered shopping assistant that lets users browse and buy fashion products using **voice commands in regional Indian languages** (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati).

Built for Tier 2/3 city users who aren't comfortable with English UIs — solving a real accessibility gap in Indian e-commerce.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) + TailwindCSS |
| Backend | Python / FastAPI |
| Speech-to-Text | Deepgram Nova-2 (REST API) |
| Translation | Google Translate API |
| Text-to-Speech | gTTS |
| Database | MongoDB Atlas |
| ML | scikit-learn (content-based recommendations) |
| Product Data | Scraped from Indian Shopify stores (Libas, Snitch, Sassafras, Jaipur Kurti) |

## How It Works

```
User speaks: "मुझे लाल कुर्ता दिखाओ" (Show me red kurta)
    ↓ Deepgram transcribes voice
    ↓ Auto-detects language, translates to English
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
- Python 3.12
- MongoDB Atlas account (free tier)
- Deepgram API key (free $200 credit)

### Backend
```bash
cd backend
python3.12 -m venv venv
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
python data/process_data.py
cd backend && source venv/bin/activate
python -m app.database.seed
```

## Project Structure

```
├── frontend/          # React app (Vite + TailwindCSS)
│   └── src/
│       ├── components/  # ProductCard, VoiceButton, Navbar, etc.
│       ├── pages/       # Home (chat UI), Products, Cart
│       ├── hooks/       # useVoiceRecorder, useCart
│       └── services/    # API client
├── backend/           # FastAPI server
│   └── app/
│       ├── routes/      # voice, products, cart, recommendations
│       ├── services/    # STT, translation, TTS, search, recommender
│       └── database/    # MongoDB connection & seeding
└── data/              # Scraper & product pipeline
```

## Features

- Chat-style UI with conversational voice assistant
- Voice search in 8 Indian languages
- Speech-to-text via Deepgram Nova-2 REST API
- Smart intent parsing (color, category, price range, gender)
- 300 real products scraped from Indian fashion stores
- Text-to-speech responses in user's language
- Product recommendations (ML content-based filtering)
- Shopping cart with session management
- Mobile-first responsive design
