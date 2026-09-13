from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

import os
import shutil
import uuid
import json
import re
import traceback

from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response

from sqlalchemy.orm import Session

from fastapi.middleware.cors import CORSMiddleware


# =====================================================
# SERVICES
# =====================================================

from speech.speech_service import speech_to_text
from speech.tts_service import text_to_speech


# =====================================================
# PROJECT IMPORTS
# =====================================================

import models
import schemas
import auth

from google.oauth2 import id_token
from google.auth.transport import requests

from market.market_routes import router as market_router
from market.market_service import fetch_market_price

from weather.weather_routes import router as weather_router
from weather.weather_service import get_weather_for_ai

from crop_health.router import router as crop_health_router

from database import (
    engine,
    SessionLocal,
    Base,
)

from rag.rag_service import (
    generate_rag_answer,
    translate_conversation_messages,
)


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="AI-Based Agricultural Advisory System"
    
)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


# =====================================================
# ROUTERS
# =====================================================

app.include_router(market_router)
app.include_router(weather_router)
app.include_router(crop_health_router)


# =====================================================
# PROFILE IMAGE UPLOADS
# =====================================================

UPLOAD_DIR = "uploads/profile_images"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# DATABASE
# =====================================================

Base.metadata.create_all(
    bind=engine
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message":
        "Backend is Running Successfully 🚀"
    }


# =====================================================
# SIGNUP
# =====================================================

@app.post("/signup")
def signup(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    new_user = auth.create_user(
        db,
        user
    )

    if new_user is None:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message":
        "User Registered Successfully"
    }


# =====================================================
# LOGIN
# =====================================================

@app.post("/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = auth.login_user(
        db,
        user
    )

    if existing_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    return {
        "message":
        "Login Successful",

        "user":
        existing_user.first_name,

        "user_id":
        existing_user.id,

        "profile_image":
        existing_user.profile_image,
    }

# =====================================================
# GOOGLE LOGIN
# =====================================================

@app.post("/auth/google")
def google_login(data: dict, db: Session = Depends(get_db)):
    credential = data.get("credential")

    if not credential:
        raise HTTPException(
            status_code=400,
            detail="Google credential is required"
        )

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

    email = google_user.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google account email not found"
        )

    first_name = google_user.get("given_name", "")
    last_name = google_user.get("family_name", "")
    profile_image = google_user.get("picture")

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        user = models.User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password="GOOGLE_AUTH",
            profile_image=profile_image
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    else:
        if not user.profile_image and profile_image:
            user.profile_image = profile_image

        db.commit()
        db.refresh(user)

    return {
        "user": user.first_name,
        "user_id": user.id,
        "email": user.email,
        "profile_image": user.profile_image
    }


# =====================================================
# GET USER PROFILE
# =====================================================

@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = auth.get_user_profile(
        db,
        user_id
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "profile_image": user.profile_image,
    }


# =====================================================
# UPDATE USER PROFILE
# =====================================================

@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    profile: schemas.UserProfileUpdate,
    db: Session = Depends(get_db)
):

    updated_user = auth.update_user_profile(
        db,
        user_id,
        profile
    )

    if updated_user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if updated_user == "EMAIL_EXISTS":

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message":
        "Profile updated successfully",

        "id":
        updated_user.id,

        "first_name":
        updated_user.first_name,

        "last_name":
        updated_user.last_name,

        "email":
        updated_user.email,

        "profile_image":
        updated_user.profile_image,
    }


# =====================================================
# UPLOAD PROFILE IMAGE
# =====================================================

@app.post("/users/{user_id}/profile-image")
async def upload_profile_image(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    user = auth.get_user_profile(
        db,
        user_id
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not file.content_type:

        raise HTTPException(
            status_code=400,
            detail="Invalid file"
        )

    if not file.content_type.startswith("image/"):

        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )

    file_extension = os.path.splitext(
        file.filename or ""
    )[1].lower()

    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]

    if file_extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=
            "Only JPG, JPEG, PNG and WEBP are allowed"
        )

    unique_filename = (
        f"{uuid.uuid4()}{file_extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    image_url = (
        f"/uploads/profile_images/{unique_filename}"
    )

    updated_user = auth.update_profile_image(
        db,
        user_id,
        image_url
    )

    return {
        "message":
        "Profile image uploaded successfully",

        "profile_image":
        updated_user.profile_image,
    }


# =====================================================
# REMOVE PROFILE IMAGE
# =====================================================

@app.delete("/users/{user_id}/profile-image")
def delete_profile_image(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = auth.get_user_profile(
        db,
        user_id
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    old_image = user.profile_image

    updated_user = auth.remove_profile_image(
        db,
        user_id
    )

    if old_image:

        file_path = old_image.lstrip("/")

        if os.path.exists(file_path):

            os.remove(file_path)

    return {
        "message":
        "Profile image removed successfully"
    }


# =====================================================
# CREATE NEW CONVERSATION
# =====================================================

@app.post("/conversations")
def create_conversation(
    request: schemas.ConversationCreate,
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.id == user_id
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    conversation = models.Conversation(
        title=request.title or "New Chat",
        user_id=user_id
    )

    db.add(
        conversation
    )

    db.commit()

    db.refresh(
        conversation
    )

    return {
        "id":
        conversation.id,

        "title":
        conversation.title,

        "created_at":
        conversation.created_at,
    }


# =====================================================
# MARKET QUERY HELPERS
# =====================================================

MARKET_KEYWORDS = [
    "market price", "market prices", "market rate", "market rates",
    "mandi price", "mandi prices", "mandi rate", "mandi rates",
    "mandi bhav", "mandi bhaav", "mandi ka bhav",
    "market bhav", "current price", "current market price",
    "latest price", "latest market price", "today price",
    "today's price", "today market price", "price today",
    "bazaar price", "bazaar rate",
    "बाजार भाव", "बाजार का भाव", "मंडी भाव", "मंडी का भाव",
    "मंडी रेट", "मंडी का रेट",
    "বাজার দর", "বাজার দাম", "মাণ্ডি দাম",
]

COMMODITY_ALIASES = {
    "potato": "Potato", "potatoes": "Potato", "aloo": "Potato",
    "आलू": "Potato", "আলু": "Potato",
    "rice": "Rice", "chawal": "Rice", "चावल": "Rice",
    "paddy": "Paddy", "धान": "Paddy",
    "tomato": "Tomato", "tomatoes": "Tomato", "tamatar": "Tomato",
    "टमाटर": "Tomato", "টমেটো": "Tomato",
    "onion": "Onion", "onions": "Onion", "pyaz": "Onion",
    "प्याज": "Onion", "পেঁয়াজ": "Onion",
    "wheat": "Wheat", "gehun": "Wheat", "गेहूं": "Wheat", "গম": "Wheat",
    "maize": "Maize", "corn": "Maize", "makka": "Maize",
    "मक्का": "Maize", "ভুট্টা": "Maize",
    "mustard": "Mustard", "sarso": "Mustard",
    "सरसों": "Mustard", "সরিষা": "Mustard",
    "jute": "Jute", "pat": "Jute", "पाट": "Jute", "পাট": "Jute",
}

STATE_ALIASES = {
    "andhra pradesh": "Andhra Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    "assam": "Assam",
    "bihar": "Bihar",
    "chhattisgarh": "Chhattisgarh",
    "goa": "Goa",
    "gujarat": "Gujarat",
    "haryana": "Haryana",
    "himachal pradesh": "Himachal Pradesh",
    "hp": "Himachal Pradesh",
    "jharkhand": "Jharkhand",
    "karnataka": "Karnataka",
    "kerala": "Kerala",
    "madhya pradesh": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "manipur": "Manipur",
    "meghalaya": "Meghalaya",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil nadu": "Tamil Nadu",
    "telangana": "Telangana",
    "tripura": "Tripura",
    "uttar pradesh": "Uttar Pradesh",
    "uttarakhand": "Uttarakhand",
    "west bengal": "West Bengal",
    "west-bengal": "West Bengal",
    "wb": "West Bengal",
    "delhi": "Delhi",
    "nct of delhi": "Delhi",
    "jammu and kashmir": "Jammu and Kashmir",
    "ladakh": "Ladakh",
    "पश्चिम बंगाल": "West Bengal",
    "पंजाब": "Punjab",
    "राजस्थान": "Rajasthan",
    "महाराष्ट्र": "Maharashtra",
    "হিমাচল প্রদেশ": "Himachal Pradesh",
    "পশ্চিমবঙ্গ": "West Bengal",
}

DEFAULT_MARKET_STATE = "West Bengal"


def is_market_question(question: str) -> bool:
    text = question.lower().strip()

    if any(keyword in text for keyword in MARKET_KEYWORDS):
        return True

    commodity = detect_commodity(question)

    return bool(
        commodity
        and any(
            word in text
            for word in (
                "price", "rate", "mandi", "market",
                "bhav", "bhaav", "दाम", "भाव", "দাম", "দর"
            )
        )
    )


def detect_commodity(question: str):
    text = question.lower()

    for alias in sorted(COMMODITY_ALIASES, key=len, reverse=True):
        if re.search(r"(?<!\w)" + re.escape(alias) + r"(?!\w)", text):
            return COMMODITY_ALIASES[alias]

    return None


def detect_state(question: str):
    text = question.lower()

    for alias in sorted(STATE_ALIASES, key=len, reverse=True):
        if re.search(r"(?<![a-z])" + re.escape(alias) + r"(?![a-z])", text):
            return STATE_ALIASES[alias]

    return DEFAULT_MARKET_STATE


def clean_location(value: str | None):
    if not value:
        return None

    value = value.strip()
    value = re.sub(r"[?.!,]+$", "", value)
    value = re.sub(r"\s+", " ", value)

    # Remove query words that can accidentally become part of a location.
    value = re.sub(
        r"\b(?:what|is|the|latest|current|today|price|prices|"
        r"rate|rates|of|for|market)\b",
        " ",
        value,
        flags=re.IGNORECASE,
    )
    value = re.sub(r"\s+", " ", value).strip()

    return value or None


def _state_aliases_for(state: str):
    return sorted(
        [alias for alias, name in STATE_ALIASES.items() if name == state],
        key=len,
        reverse=True,
    )


def detect_district(question: str):
    text = question.strip()
    state = detect_state(question)

    # Best pattern:
    # "in Mandi Himachal Pradesh"
    # "in Nashik Maharashtra"
    for alias in _state_aliases_for(state):
        pattern = (
            r"\b(?:in|at|near)\s+"
            r"([A-Za-z][A-Za-z\s-]{0,60}?)\s+"
            + re.escape(alias)
            + r"\b"
        )
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            location = clean_location(match.group(1))
            if location:
                return location.title()

    # Explicit district: Mandi
    match = re.search(
        r"\bdistrict\s*[:\-]?\s*"
        r"([A-Za-z][A-Za-z\s-]{1,50})",
        text,
        flags=re.IGNORECASE,
    )
    if match:
        location = clean_location(match.group(1))
        if location:
            return location.title()

    return None


def detect_market(question: str):
    text = question.strip()

    # Only treat a place as market when the place name is explicitly
    # attached to "market" or "mandi". Generic "mandi price" is ignored.
    patterns = [
        r"\b([A-Za-z][A-Za-z\s-]{1,50}?)\s+(?:market|mandi)\b",
        r"\b(?:market|mandi)\s*[:\-]\s*([A-Za-z][A-Za-z\s-]{1,50})",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if not match:
            continue

        location = clean_location(match.group(1))
        if not location:
            continue

        low = location.lower().strip()
        invalid = {
            "potato", "latest potato", "tomato", "latest tomato",
            "onion", "latest onion", "price", "latest price",
            "current price", "the",
        }

        if low in invalid:
            continue

        # Avoid "latest potato mandi" being treated as a market.
        if any(word in low.split() for word in ("potato", "tomato", "onion", "wheat", "rice")):
            continue

        return location.title()

    return None


def format_market_answer(
    records,
    commodity,
    state,
    district=None,
    market=None,
    language="en",
):
    if not records:
        location = ""
        if district:
            location += f" in {district}"
        if state:
            location += f", {state}" if location else f" in {state}"

        if language == "hi":
            return f"{commodity} ke liye latest market price data{location} nahi mila."
        if language == "bn":
            return f"{commodity}-এর জন্য{location} সর্বশেষ বাজারের দামের তথ্য পাওয়া যায়নি।"
        if language == "hinglish":
            return f"{commodity} ka latest market price data{location} nahi mila."

        return f"No latest market price data was found for {commodity}{location}."

    record = records[0]

    commodity_name = record.get("Commodity") or commodity
    market_name = record.get("Market") or market or "N/A"
    district_name = record.get("District") or district or "N/A"
    state_name = record.get("State") or state or "N/A"
    arrival_date = record.get("Arrival_Date", "N/A")
    min_price = record.get("Min_Price", "N/A")
    max_price = record.get("Max_Price", "N/A")
    modal_price = record.get("Modal_Price", "N/A")

    if language == "hi":
        return (
            f"{commodity_name} ka latest market price:\n\n"
            f"📍 State: {state_name}\n"
            f"📍 District: {district_name}\n"
            f"🏪 Market: {market_name}\n"
            f"📅 Date: {arrival_date}\n\n"
            f"Minimum Price: ₹{min_price}\n"
            f"Maximum Price: ₹{max_price}\n"
            f"Modal Price: ₹{modal_price}"
        )

    if language == "bn":
        return (
            f"{commodity_name}-এর সর্বশেষ বাজার মূল্য:\n\n"
            f"📍 রাজ্য: {state_name}\n"
            f"📍 জেলা: {district_name}\n"
            f"🏪 বাজার: {market_name}\n"
            f"📅 তারিখ: {arrival_date}\n\n"
            f"সর্বনিম্ন মূল্য: ₹{min_price}\n"
            f"সর্বোচ্চ মূল্য: ₹{max_price}\n"
            f"মোডাল মূল্য: ₹{modal_price}"
        )

    if language == "hinglish":
        return (
            f"{commodity_name} ka latest market price:\n\n"
            f"📍 State: {state_name}\n"
            f"📍 District: {district_name}\n"
            f"🏪 Market: {market_name}\n"
            f"📅 Date: {arrival_date}\n\n"
            f"Minimum Price: ₹{min_price}\n"
            f"Maximum Price: ₹{max_price}\n"
            f"Modal Price: ₹{modal_price}"
        )

    return (
        f"{commodity_name} Latest Market Price:\n\n"
        f"📍 State: {state_name}\n"
        f"📍 District: {district_name}\n"
        f"🏪 Market: {market_name}\n"
        f"📅 Arrival Date: {arrival_date}\n\n"
        f"Minimum Price: ₹{min_price}\n"
        f"Maximum Price: ₹{max_price}\n"
        f"Modal Price: ₹{modal_price}"
    )


# =====================================================
# WEATHER QUERY HELPERS
# =====================================================

WEATHER_KEYWORDS = [

    # Current weather
    "current weather",
    "weather now",
    "weather today",
    "today's weather",
    "today weather",

    "current temperature",
    "temperature today",
    "temperature now",

    "current rain",
    "rain today",
    "raining today",

    "current rainfall",
    "rainfall today",

    "current forecast",
    "today forecast",

    "current humidity",
    "humidity today",

    "current wind",
    "wind today",

    "current storm",
    "storm today",

    "current cloud",
    "cloudy today",

    "weather condition",

    # General weather words
    "weather",
    "forecast",
    "rainfall",
    "raining",
    "climate",
    "humidity",
    "wind",
    "windy",
    "storm",
    "cloudy",
    "sunny",

    # Hinglish
    "mausam",
    "aaj ka mausam",
    "abhi ka mausam",
    "baarish",
    "barish",
    "barsaat",
    "aaj baarish",
    "aaj barish",
    "tapman",
    "aaj ka tapman",
    "garmi",
    "thand",

    # Hindi
    "मौसम",
    "आज का मौसम",
    "अभी का मौसम",
    "बारिश",
    "बरसात",
    "आज बारिश",
    "तापमान",
    "आज का तापमान",
    "गर्मी",
    "ठंड",

    # Bengali
    "আবহাওয়া",
    "আজকের আবহাওয়া",
    "বর্তমান আবহাওয়া",
    "বৃষ্টি",
    "আজ বৃষ্টি",
    "তাপমাত্রা",
    "আজকের তাপমাত্রা",
]


def is_weather_question(
    question: str
) -> bool:

    text = question.lower().strip()

    return any(
        keyword in text
        for keyword in WEATHER_KEYWORDS
    )


# =====================================================
# WEATHER CONTEXT
# =====================================================

def build_weather_context(
    weather: dict
):

    if not weather:

        return ""

    temperature_kelvin = weather.get(
        "temperature"
    )

    feels_like_kelvin = weather.get(
        "feels_like"
    )

    humidity = weather.get(
        "humidity"
    )

    pressure = weather.get(
        "pressure"
    )

    wind_speed = weather.get(
        "wind_speed"
    )

    condition = weather.get(
        "condition",
        "Unknown"
    )

    # -------------------------------------------------
    # KELVIN -> CELSIUS
    # -------------------------------------------------

    temperature_c = None

    if temperature_kelvin is not None:

        try:

            temperature_c = round(
                float(temperature_kelvin) - 273.15,
                1
            )

        except (
            TypeError,
            ValueError
        ):

            temperature_c = None

    feels_like_c = None

    if feels_like_kelvin is not None:

        try:

            feels_like_c = round(
                float(feels_like_kelvin) - 273.15,
                1
            )

        except (
            TypeError,
            ValueError
        ):

            feels_like_c = None

    return f"""
CURRENT LIVE WEATHER CONDITIONS:

Temperature: {temperature_c} °C
Feels like: {feels_like_c} °C
Humidity: {humidity}%
Pressure: {pressure} hPa
Wind speed: {wind_speed} m/s
Condition: {condition}

IMPORTANT INSTRUCTIONS:

1. Use the above live weather information
   when answering the farmer's question.

2. Do not invent weather values.

3. Do not change the provided weather values.

4. If the question is related to agriculture,
   explain how the current weather may affect
   the crop.

5. Give practical and simple farming advice.

6. Answer in the requested language.
"""


# =====================================================
# CHAT / RAG + LIVE MARKET + LIVE WEATHER
# =====================================================

@app.post("/chat")
def chat(
    request: schemas.ChatRequest,
    user_id: int | None = None,
    db: Session = Depends(get_db)
):

    try:

        # =================================================
        # 1. GET QUESTION
        # =================================================

        question = request.question.strip()

        if not question:

            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )


        # =================================================
        # 2. VALIDATE LANGUAGE
        # =================================================

        supported_languages = [
            "en",
            "hi",
            "bn",
            "hinglish",
        ]

        language = request.language

        if language not in supported_languages:

            language = "en"


        # =================================================
        # 3. FIND CONVERSATION
        # =================================================

        # Resolve the logged-in user. The query parameter is optional so the
        # existing chat frontend remains backward compatible.
        request_user_id = getattr(request, "user_id", None)
        effective_user_id = user_id or request_user_id or 1

        user = db.query(models.User).filter(
            models.User.id == effective_user_id
        ).first()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        conversation = None

        if request.conversation_id:

            conversation = db.query(
                models.Conversation
            ).filter(
                models.Conversation.id == request.conversation_id,
                models.Conversation.user_id == effective_user_id
            ).first()

            if conversation is None:

                raise HTTPException(
                    status_code=404,
                    detail="Conversation not found"
                )

        else:

            title = question[:50]

            conversation = models.Conversation(
                title=title,
                user_id=effective_user_id
            )

            db.add(
                conversation
            )

            db.commit()

            db.refresh(
                conversation
            )


        # =================================================
        # 4. SAVE USER QUESTION
        # =================================================

        user_message = models.Message(
            conversation_id=conversation.id,
            role="user",
            content=question,
            sources=None,
        )

        db.add(
            user_message
        )

        db.commit()


        # =================================================
        # 5. DETECT QUESTION TYPE
        # =================================================

        market_question = is_market_question(
            question
        )

        weather_question = is_weather_question(
            question
        )

        answer = ""
        sources = []


        # =================================================
        # 6A. LIVE WEATHER API
        # =================================================

        if weather_question:

            print(
                "\n========== LIVE WEATHER QUERY =========="
            )

            print(
                "Question:",
                question
            )

            latitude = request.latitude
            longitude = request.longitude

            print(
                "Latitude:",
                latitude
            )

            print(
                "Longitude:",
                longitude
            )


            # -------------------------------------------------
            # LOCATION REQUIRED
            # -------------------------------------------------

            if (
                latitude is None
                or longitude is None
            ):

                if language == "hi":

                    answer = (
                        "Current weather information dene ke "
                        "liye aapki location chahiye. "
                        "Please location permission allow karein."
                    )

                elif language == "bn":

                    answer = (
                        "বর্তমান আবহাওয়ার তথ্য দিতে আপনার "
                        "লোকেশন প্রয়োজন। "
                        "দয়া করে লোকেশন permission দিন।"
                    )

                elif language == "hinglish":

                    answer = (
                        "Current weather check karne ke liye "
                        "aapki location chahiye. "
                        "Please location permission allow karo."
                    )

                else:

                    answer = (
                        "I need your location to provide "
                        "the current weather conditions. "
                        "Please allow location access."
                    )

                sources = []


            # -------------------------------------------------
            # FETCH LIVE WEATHER
            # -------------------------------------------------

            else:

                try:

                    weather_result = get_weather_for_ai(
                        latitude=latitude,
                        longitude=longitude
                    )

                except Exception as weather_error:

                    print(
                        "Weather API error:",
                        repr(weather_error)
                    )

                    weather_result = {
                        "success": False
                    }


                # -------------------------------------------------
                # WEATHER API FAILED
                # -------------------------------------------------

                if not weather_result.get(
                    "success"
                ):

                    if language == "hi":

                        answer = (
                            "Sorry, abhi current weather "
                            "information fetch nahi ho pa rahi hai. "
                            "Please thodi der baad try karein."
                        )

                    elif language == "bn":

                        answer = (
                            "দুঃখিত, এই মুহূর্তে বর্তমান "
                            "আবহাওয়ার তথ্য পাওয়া যাচ্ছে না। "
                            "দয়া করে কিছুক্ষণ পরে চেষ্টা করুন।"
                        )

                    elif language == "hinglish":

                        answer = (
                            "Sorry, abhi current weather "
                            "information fetch nahi ho pa rahi hai. "
                            "Please thodi der baad try karo."
                        )

                    else:

                        answer = (
                            "Sorry, I could not fetch the "
                            "current weather information right now. "
                            "Please try again later."
                        )

                    sources = []


                # -------------------------------------------------
                # WEATHER SUCCESS
                # -------------------------------------------------

                else:

                    weather = weather_result.get(
                        "weather"
                    )

                    if not weather:

                        if language == "hi":

                            answer = (
                                "Sorry, weather data "
                                "available nahi hai."
                            )

                        elif language == "bn":

                            answer = (
                                "দুঃখিত, আবহাওয়ার তথ্য "
                                "পাওয়া যায়নি।"
                            )

                        elif language == "hinglish":

                            answer = (
                                "Sorry, weather data "
                                "available nahi hai."
                            )

                        else:

                            answer = (
                                "Sorry, weather data "
                                "is currently unavailable."
                            )

                        sources = []

                    else:

                        weather_context = (
                            build_weather_context(
                                weather
                            )
                        )


                        # -------------------------------------------------
                        # SEND WEATHER + QUESTION TO AI
                        # -------------------------------------------------

                        enhanced_question = f"""
Farmer's Question:

{question}


{weather_context}


TASK:

Answer the farmer's question using the
live weather information above.

If the question is related to farming,
explain how the current weather may affect
the crop and provide practical agricultural
advice.

Be clear, concise, practical and
farmer-friendly.

Do not invent weather information.

Answer in the requested language.
"""


                        try:

                            rag_result = (
                                generate_rag_answer(
                                    enhanced_question,
                                    language
                                )
                            )

                            answer = rag_result.get(
                                "answer",
                                "Sorry, I could not generate an answer."
                            )

                            sources = rag_result.get(
                                "sources",
                                []
                            )

                        except Exception as rag_error:

                            print(
                                "Weather RAG error:",
                                repr(rag_error)
                            )

                            # Fallback if AI generation fails

                            temperature = weather.get(
                                "temperature"
                            )

                            if temperature is not None:

                                try:

                                    temperature_c = round(
                                        float(temperature)
                                        - 273.15,
                                        1
                                    )

                                except (
                                    TypeError,
                                    ValueError
                                ):

                                    temperature_c = "N/A"

                            else:

                                temperature_c = "N/A"


                            condition = weather.get(
                                "condition",
                                "Unknown"
                            )

                            humidity = weather.get(
                                "humidity",
                                "N/A"
                            )


                            if language == "hi":

                                answer = (
                                    f"Current temperature "
                                    f"{temperature_c}°C hai, "
                                    f"humidity {humidity}% hai aur "
                                    f"weather condition {condition} hai."
                                )

                            elif language == "bn":

                                answer = (
                                    f"বর্তমান তাপমাত্রা "
                                    f"{temperature_c}°C, "
                                    f"আর্দ্রতা {humidity}% এবং "
                                    f"আবহাওয়া {condition}।"
                                )

                            elif language == "hinglish":

                                answer = (
                                    f"Abhi temperature "
                                    f"{temperature_c}°C hai, "
                                    f"humidity {humidity}% hai aur "
                                    f"weather {condition} hai."
                                )

                            else:

                                answer = (
                                    f"The current temperature is "
                                    f"{temperature_c}°C, humidity is "
                                    f"{humidity}%, and the condition "
                                    f"is {condition}."
                                )

                            sources = []


                        # -------------------------------------------------
                        # ADD WEATHER SOURCE
                        # -------------------------------------------------

                        sources.append({
                            "source":
                            "OpenWeatherMap",

                            "type":
                            "live_weather"
                        })


            print(
                "========== WEATHER QUERY END ==========\n"
            )


        # =================================================
        # 6B. LIVE MARKET API
        # =================================================

        elif market_question:

            print(
                "\n========== LIVE MARKET QUERY =========="
            )

            print(
                "Question:",
                question
            )

            commodity = detect_commodity(
                question
            )

            state = detect_state(
                question
            )

            district = detect_district(
                question
            )

            market = detect_market(
                question
            )

            print(
                "Detected commodity:",
                commodity
            )

            print(
                "Detected state:",
                state
            )

            print(
                "Detected district:",
                district
            )

            print(
                "Detected market:",
                market
            )


            if commodity is None:

                if language == "hi":

                    answer = (
                        "Market price check karne ke liye "
                        "commodity ka naam batayein. "
                        "Example: Potato ka latest mandi price kya hai?"
                    )

                elif language == "bn":

                    answer = (
                        "বাজারের দাম জানতে ফসলের নাম বলুন। "
                        "উদাহরণ: আলুর সর্বশেষ বাজার দর কত?"
                    )

                elif language == "hinglish":

                    answer = (
                        "Market price check karne ke liye "
                        "commodity ka naam batao. "
                        "Example: Potato ka latest mandi price kya hai?"
                    )

                else:

                    answer = (
                        "Please mention the commodity name "
                        "to get the latest market price. "
                        "Example: What is the latest potato market price?"
                    )

                sources = []


            else:

                try:

                    market_result = fetch_market_price(
                        state=state,
                        commodity=commodity,
                        district=district,
                        market=market
                    )

                    # IMPORTANT: Always use the actual latest record
                    # calculated by market_service.py.
                    # This prevents an older record from being shown even
                    # when the API returns multiple records.
                    latest_record = market_result.get("latest")

                    if latest_record:
                        records = [latest_record]
                    else:
                        records = []

                    print("Latest Market Record:", latest_record)

                except Exception as market_error:

                    print(
                        "Market API error:",
                        repr(market_error)
                    )

                    records = []


                answer = format_market_answer(
                    records=records,
                    commodity=commodity,
                    state=state,
                    district=district,
                    market=market,
                    language=language
                )

                sources = [
                    {
                        "source":
                        "AGMARKNET / data.gov.in",

                        "type":
                        "live_market_price"
                    }
                ]


            print(
                "========== MARKET QUERY END ==========\n"
            )


        # =================================================
        # 6C. EXISTING RAG
        # =================================================

        else:

            print(
                "\n========== RAG QUERY =========="
            )

            print(
                "Question:",
                question
            )

            rag_result = generate_rag_answer(
                question,
                language
            )

            answer = rag_result.get(
                "answer",
                "Sorry, I could not generate an answer."
            )

            sources = rag_result.get(
                "sources",
                []
            )

            print(
                "========== RAG QUERY END ==========\n"
            )


        # =================================================
        # 7. SAVE AI ANSWER
        # =================================================

        assistant_message = models.Message(
            conversation_id=conversation.id,
            role="assistant",
            content=answer,
            sources=json.dumps(
                sources
            ),
        )

        db.add(
            assistant_message
        )

        db.commit()

        db.refresh(
            assistant_message
        )


        # =================================================
        # 8. SOURCE TYPE
        # =================================================

        if weather_question:

            source_type = (
                "live_weather_api"
            )

        elif market_question:

            source_type = (
                "live_market_api"
            )

        else:

            source_type = "rag"


        # =================================================
        # 9. RETURN RESPONSE
        # =================================================

        return {

            "success":
            True,

            "conversation_id":
            conversation.id,

            "question":
            question,

            "answer":
            answer,

            "sources":
            sources,

            "language":
            language,

            "source_type":
            source_type,
        }


    # =====================================================
    # HTTP EXCEPTION
    # =====================================================

    except HTTPException:

        raise


    # =====================================================
    # GENERAL ERROR
    # =====================================================

    except Exception as e:

        print(
            "\n========== CHAT ERROR =========="
        )

        print("Error type:", type(e).__name__)
        print("Error:", repr(e))
        print("\nFULL TRACEBACK:")
        traceback.print_exc()

        print(
            "================================\n"
        )

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )


# =====================================================
# GET ALL CONVERSATIONS
# =====================================================

@app.get("/conversations")
def get_conversations(
    user_id: int,
    db: Session = Depends(get_db)
):

    conversations = db.query(
        models.Conversation
    ).filter(
        models.Conversation.user_id
        == user_id
    ).order_by(
        models.Conversation.created_at.desc()
    ).all()

    return [

        {
            "id":
            conversation.id,

            "title":
            conversation.title,

            "created_at":
            conversation.created_at,
        }

        for conversation
        in conversations
    ]


# =====================================================
# GET SINGLE CONVERSATION
# =====================================================

@app.get(
    "/conversations/{conversation_id}"
)
def get_conversation(
    conversation_id: int,
    language: str = "en",
    user_id: int | None = None,
    db: Session = Depends(get_db)
):

    supported_languages = [
        "en",
        "hi",
        "bn",
        "hinglish",
    ]

    if language not in supported_languages:

        language = "en"


    # =================================================
    # FIND CONVERSATION
    # =================================================

    conversation_query = db.query(
        models.Conversation
    ).filter(
        models.Conversation.id == conversation_id
    )

    if user_id is not None:
        conversation_query = conversation_query.filter(
            models.Conversation.user_id == user_id
        )

    conversation = conversation_query.first()

    if conversation is None:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )


    # =================================================
    # GET MESSAGES
    # =================================================

    messages = db.query(
        models.Message
    ).filter(
        models.Message.conversation_id
        == conversation_id
    ).order_by(
        models.Message.created_at.asc()
    ).all()


    # =================================================
    # FORMAT MESSAGES
    # =================================================

    formatted_messages = []

    for message in messages:

        sources = []

        if message.sources:

            try:

                sources = json.loads(
                    message.sources
                )

            except Exception:

                sources = []

        formatted_messages.append({

            "id":
            message.id,

            "role":
            message.role,

            "content":
            message.content,

            "sources":
            sources,

            "created_at":
            message.created_at,
        })


    # =================================================
    # TRANSLATE CONVERSATION
    # =================================================

    if formatted_messages:

        try:

            translated_messages = (
                translate_conversation_messages(
                    formatted_messages,
                    language
                )
            )

            translated_map = {

                translated_message["id"]:
                translated_message["content"]

                for translated_message
                in translated_messages

                if translated_message.get("id")
                is not None
            }

            for message in formatted_messages:

                message_id = message["id"]

                if message_id in translated_map:

                    message["content"] = (
                        translated_map[
                            message_id
                        ]
                    )

        except Exception as translation_error:

            print(
                "Conversation translation error:",
                repr(translation_error)
            )


    # =================================================
    # RETURN CONVERSATION
    # =================================================

    return {

        "id":
        conversation.id,

        "title":
        conversation.title,

        "created_at":
        conversation.created_at,

        "language":
        language,

        "messages":
        formatted_messages,
    }


# =====================================================
# DELETE CONVERSATION
# =====================================================

@app.delete(
    "/conversations/{conversation_id}"
)
def delete_conversation(
    conversation_id: int,
    user_id: int | None = None,
    db: Session = Depends(get_db)
):

    conversation_query = db.query(
        models.Conversation
    ).filter(
        models.Conversation.id == conversation_id
    )

    if user_id is not None:
        conversation_query = conversation_query.filter(
            models.Conversation.user_id == user_id
        )

    conversation = conversation_query.first()

    if conversation is None:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    db.delete(
        conversation
    )

    db.commit()

    return {
        "message":
        "Conversation deleted successfully"
    }


# =====================================================
# MY HISTORY
# =====================================================

@app.get("/history")
def get_history(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    conversations = db.query(models.Conversation).filter(
        models.Conversation.user_id == user_id
    ).order_by(
        models.Conversation.created_at.desc()
    ).all()

    history = []

    for conversation in conversations:
        messages = db.query(models.Message).filter(
            models.Message.conversation_id == conversation.id
        ).order_by(
            models.Message.created_at.asc()
        ).all()

        formatted_messages = []
        for message in messages:
            sources = []
            if message.sources:
                try:
                    sources = json.loads(message.sources)
                except Exception:
                    sources = []

            formatted_messages.append({
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "sources": sources,
                "created_at": message.created_at,
            })

        history.append({
            "id": conversation.id,
            "title": conversation.title or "New Chat",
            "created_at": conversation.created_at,
            "messages": formatted_messages,
        })

    return {
        "success": True,
        "count": len(history),
        "history": history,
    }


# =====================================================
# DELETE ONE HISTORY ITEM
# =====================================================

@app.delete("/history/{conversation_id}")
def delete_history_item(
    conversation_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == user_id
    ).first()

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()

    return {
        "success": True,
        "message": "History item deleted successfully",
        "conversation_id": conversation_id,
    }


# =====================================================
# CLEAR ALL HISTORY FOR ONE USER
# =====================================================

@app.delete("/history")
def clear_history(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    conversations = db.query(models.Conversation).filter(
        models.Conversation.user_id == user_id
    ).all()

    deleted_count = len(conversations)

    for conversation in conversations:
        db.delete(conversation)

    db.commit()

    return {
        "success": True,
        "message": "All history cleared successfully",
        "deleted_count": deleted_count,
    }


# =====================================================
# SPEECH TO TEXT
# =====================================================

@app.post("/speech-to-text")
async def speech_to_text_endpoint(
    file: UploadFile = File(...)
):

    try:

        audio_bytes = await file.read()

        print(
            "Received file:",
            file.filename
        )

        print(
            "Content type:",
            file.content_type
        )

        print(
            "Size:",
            len(audio_bytes)
        )

        if not audio_bytes:

            raise HTTPException(
                status_code=400,
                detail="Empty audio file"
            )

        text = speech_to_text(
            audio_bytes,
            file.filename
            or "recording.webm"
        )

        return {
            "text":
            text
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "Speech endpoint error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=
            "Unable to convert speech to text"
        )


# =====================================================
# TEXT TO SPEECH - SARVAM AI
# =====================================================

@app.post("/text-to-speech")
def text_to_speech_endpoint(
    request: schemas.TextToSpeechRequest
):

    try:

        supported_languages = [
            "en",
            "hi",
            "bn",
            "hinglish",
        ]

        language = request.language

        if language not in supported_languages:

            language = "en"


        # =================================================
        # GENERATE AUDIO
        # =================================================

        audio_bytes = text_to_speech(
            text=request.text,
            language=language
        )


        # =================================================
        # RETURN AUDIO
        # =================================================

        return Response(

            content=audio_bytes,

            media_type="audio/wav",

            headers={

                "Content-Disposition":
                "inline; filename=agri-ai-response.wav"
            }

        )


    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


    except Exception as e:

        print(
            "Text-to-Speech endpoint error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=
            "Unable to generate speech"
        )