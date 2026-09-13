# 🌱 AI-Based Agricultural Advisory System

> **Smart Farming • Better Decisions • AI-Powered Agriculture**

An AI-powered agricultural advisory platform designed to help farmers make better farming decisions through intelligent crop guidance, agricultural knowledge retrieval, weather insights, real-time market prices, crop health analysis, multilingual assistance, and voice-based interaction.

The system combines **Artificial Intelligence, Retrieval-Augmented Generation (RAG), Machine Learning, real-time agricultural data, and speech technologies** to provide an accessible digital farming assistant.

---

## ✨ Features

### 🤖 AI Agricultural Assistant

- AI-powered agricultural question answering
- Provides crop and farming-related guidance
- Context-aware conversational assistance
- RAG-based agricultural knowledge retrieval
- Helps farmers make informed farming decisions

### 📚 RAG-Based Agricultural Knowledge

The system uses **Retrieval-Augmented Generation (RAG)** to provide agriculture-related answers using a knowledge base.

**Pipeline:**

```text
Agricultural Documents
        ↓
Document Loading
        ↓
Text Chunking
        ↓
OpenAI Embeddings
        ↓
Pinecone Vector Database
        ↓
Similarity Search
        ↓
Relevant Context
        ↓
AI Generated Response

Technologies used:

OpenAI Embeddings
Pinecone Vector Database
Semantic Similarity Search
Agricultural Knowledge Documents
🌦️ Weather Insights

The system provides weather-related information to help farmers make better agricultural decisions.

Features include:

Weather information
Farming-related weather insights
Weather-based agricultural planning
Dedicated Weather Insights page
📈 Agricultural Market Prices

The platform provides agricultural commodity market price information.

Users can select:

State
  ↓
District
  ↓
Market
  ↓
Commodity
  ↓
Market Price

Market information includes:

Minimum Price
Maximum Price
Modal Price
Arrival Date
Variety
Grade
Commodity information

The system uses agricultural market data sources to provide updated commodity price information.

🌿 Crop Health & Disease Detection

The project includes a Machine Learning-based crop health module.

Users can upload a crop image for analysis.

Crop Health Pipeline
Crop Image
     ↓
Image Processing
     ↓
ML Model
     ↓
Disease Classification
     ↓
Disease Information
     ↓
Agricultural Guidance

The system includes:

Crop image analysis
Crop disease classification
Disease information
Crop health interface
Machine Learning model integration
🌐 Multilingual Support

The platform supports multiple languages to make the agricultural assistant accessible to more users.

Supported languages:

🇬🇧 English
🇮🇳 Hindi
🇮🇳 Bengali
💬 Hinglish

Users can change the language from the application interface.

The multilingual system is designed to support agricultural conversations and responses in the selected language.

🎙️ Speech-to-Text

The system supports voice-based agricultural queries.

Users can:

Start voice recording
Ask an agricultural question
Convert speech into text
Send the query to the AI assistant
Receive an agricultural response

Speech-to-Text is powered by Sarvam AI.

🔊 Text-to-Speech

AI-generated agricultural responses can also be converted into speech.

Features include:

AI response voice playback
Multilingual speech output
Start/stop speech control
Farmer-friendly voice interaction

Text-to-Speech is powered by Sarvam AI.

🔐 Authentication

The application provides user authentication features.

Supported authentication:

User Signup
User Login
Google Login
User-specific sessions
Profile information

The system also maintains user-specific agricultural conversation history.

💬 Chat History

Users can access their previous conversations through the history section.

Features include:

User-specific chat history
Previous agricultural questions
Previous AI responses
Conversation management
🎨 Interactive Dashboard

The application provides a modern interactive dashboard containing different agricultural services.

Dashboard features include:

🤖 AI Agricultural Assistant
🌦️ Weather Insights
📈 Market Prices
🌿 Crop Health
💬 Chat History
🌐 Language Selection
🎨 Interactive 3D Farming Environment

The frontend also includes interactive 3D agricultural visualizations.

🧠 System Architecture
                         ┌──────────────────────┐
                         │     Farmer / User    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Next.js Frontend  │
                         │                      │
                         │ Dashboard            │
                         │ AI Chat              │
                         │ Weather              │
                         │ Market Prices        │
                         │ Crop Health           │
                         │ Chat History         │
                         └──────────┬───────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Backend   │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │ RAG / AI    │       │ Weather API │       │ Market API  │
      └──────┬──────┘       └─────────────┘       └─────────────┘
             │
             ▼
      ┌─────────────┐
      │   OpenAI    │
      │ Embeddings  │
      └──────┬──────┘
             │
             ▼
      ┌─────────────┐
      │  Pinecone   │
      │ Vector DB   │
      └─────────────┘

      ┌──────────────────────┐
      │      Sarvam AI       │
      │      STT + TTS       │
      └──────────────────────┘

      ┌──────────────────────┐
      │   Crop Health ML     │
      │   Disease Detection  │
      └──────────────────────┘
🛠️ Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Three.js
React Three Fiber
HTML5
CSS3
JavaScript
Backend
Python
FastAPI
Pydantic
Uvicorn
SQLite
Artificial Intelligence
OpenAI
Retrieval-Augmented Generation (RAG)
OpenAI Embeddings
Pinecone
Semantic Similarity Search
Machine Learning
Python
Machine Learning
Deep Learning
Crop Disease Classification
Agricultural Dataset
Speech Technologies
Sarvam AI
Speech-to-Text
Text-to-Speech
Authentication
Custom Authentication
Google OAuth
Data Sources
Agricultural Market Data
Weather Data
Government Agricultural Data Sources
📁 Project Structure
AI-Based-Agricultural-Advisory-System/
│
├── backend/
│   │
│   ├── main.py
│   ├── schemas.py
│   │
│   ├── crop_health/
│   │   ├── __init__.py
│   │   ├── model.py
│   │   ├── router.py
│   │   ├── service.py
│   │   └── utils.py
│   │
│   ├── data/
│   │   └── crop_disease_info.json
│   │
│   ├── market/
│   │   ├── agmarknet.py
│   │   ├── market_service.py
│   │   └── market_routes.py
│   │
│   ├── speech/
│   │   └── tts_service.py
│   │
│   ├── rag/
│   │   ├── load_documents.py
│   │   ├── chunk_documents.py
│   │   ├── embeddings.py
│   │   ├── pinecone_db.py
│   │   └── rag_service.py
│   │
│   ├── check_dataset.py
│   ├── test_crop_model.py
│   ├── train_crop_model.py
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── app/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── crop_health/
│   │   ├── insights/
│   │   ├── market-prices/
│   │   ├── weather-insights/
│   │   ├── my-history/
│   │   ├── login/
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── Background3D.tsx
│   │   └── Farmland3D.tsx
│   │
│   ├── context/
│   │   ├── LanguageContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── FlashMessageContext.tsx
│   │
│   ├── package.json
│   └── .gitignore
│
├── .gitignore
└── README.md
⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/arnab973/AI-Based-Agricultural-Advisory-System.git

Go to the project directory:

cd AI-Based-Agricultural-Advisory-System
🔧 Backend Setup

Go to the backend directory:

cd backend

Create a Python virtual environment:

python -m venv venv

Activate the virtual environment on Windows:

venv\Scripts\activate

Install the required dependencies:

pip install -r requirements.txt
🔑 Backend Environment Variables

Create a .env file inside the backend directory.

Example:

OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
SARVAM_API_KEY=your_sarvam_api_key
GOOGLE_CLIENT_ID=your_google_client_id

⚠️ Never upload API keys or secrets to GitHub.

▶️ Run Backend

From the backend directory:

python -m uvicorn main:app --reload --port 8001

Backend:

http://127.0.0.1:8001

FastAPI Swagger documentation:

http://127.0.0.1:8001/docs
💻 Frontend Setup

Open a new terminal.

Go to the frontend directory:

cd frontend

Install dependencies:

npm install
🔑 Frontend Environment Variables

Create the required environment file.

Example:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
▶️ Run Frontend

Run the development server:

npm run dev

The frontend will normally be available at:

http://localhost:3000
🔑 Environment Variables
Variable	Purpose
OPENAI_API_KEY	OpenAI AI and embedding services
PINECONE_API_KEY	Pinecone vector database
SARVAM_API_KEY	Speech-to-Text and Text-to-Speech
GOOGLE_CLIENT_ID	Google authentication
NEXT_PUBLIC_API_URL	Frontend API endpoint
NEXT_PUBLIC_GOOGLE_CLIENT_ID	Google OAuth frontend configuration
📚 RAG Pipeline

The RAG system allows the AI assistant to retrieve relevant information from agricultural documents before generating a response.

                 Agricultural Documents
                           │
                           ▼
                   Document Loading
                           │
                           ▼
                     Text Chunking
                           │
                           ▼
                  OpenAI Embeddings
                           │
                           ▼
                   Pinecone Vector DB
                           │
                           ▼
                   Similarity Search
                           │
                           ▼
                  Relevant Information
                           │
                           ▼
                    AI Response

This approach helps the assistant provide responses grounded in the available agricultural knowledge base.

🌿 Crop Health Pipeline
Crop Image
    │
    ▼
Image Processing
    │
    ▼
Machine Learning Model
    │
    ▼
Disease Classification
    │
    ▼
Disease Information
    │
    ▼
Agricultural Guidance
🌐 Multilingual Architecture
User Query
     │
     ▼
Language Selection
     │
     ▼
Language Processing
     │
     ▼
AI Agricultural Assistant
     │
     ▼
Response Generation
     │
     ▼
Selected Language
     │
     ▼
Text / Voice Output

Supported languages:

English
Hindi
Bengali
Hinglish
🎯 Project Objective

The primary objective of this project is to provide farmers with an accessible AI-powered agricultural assistant that can support farming-related decision making.

The platform brings multiple agricultural services together in one system:

                 ┌─────────────────┐
                 │   AI Advisory   │
                 └────────┬────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Weather Data      Market Prices     Crop Health
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                  Multilingual AI
                          │
                          ▼
                   Voice Assistance
🔒 Security

The project follows basic security practices:

API credentials are stored using environment variables
.env files are excluded from Git
Local databases are excluded from Git
Python virtual environments are excluded
Large ML datasets are excluded
Generated ML model files are excluded
Sensitive credentials are not stored directly in source code
🚀 Future Scope

Future improvements may include:

Personalized crop recommendations
Soil health analysis
IoT-based farm monitoring
Satellite imagery integration
Advanced crop yield prediction
Fertilizer recommendations
Pest prediction
More regional Indian languages
Offline / low-connectivity support
Mobile application
Personalized weather alerts
Advanced farmer analytics
AI-powered farming recommendations
Voice-first agricultural assistance
🌟 Why This Project?

Farmers often need information from multiple sources for making agricultural decisions.

This project aims to bring important farming services together into a single intelligent platform.

        🌱 Agriculture
              +
          🤖 Artificial Intelligence
              +
          📚 Knowledge Retrieval
              +
          🌦️ Weather
              +
          📈 Market Prices
              +
          🌿 Crop Health
              +
          🌐 Languages
              +
          🎙️ Voice
              =
       Smart Agricultural Assistant
👨‍💻 Contributors
Arnab Das

Full Stack Developer & AI/ML Developer

Responsibilities:

Frontend Development
Backend Development
AI/RAG Integration
API Integration
Crop Health Module
Market Price Integration
Weather Integration
Speech Integration
Authentication
UI/UX Development
🙏 Acknowledgements

This project uses technologies and services including:

OpenAI
Pinecone
FastAPI
Next.js
React
Three.js
Sarvam AI
Agricultural Market Data Sources
Weather Data Sources
Government Agricultural Data Sources
📜 License

This project is currently developed for academic and educational purposes.

A formal open-source license may be added in the future if the project is released for public reuse.

⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

🌱 AI-Based Agricultural Advisory System

Smart Farming • Better Decisions • AI-Powered Agriculture