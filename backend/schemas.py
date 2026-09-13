from pydantic import BaseModel
from typing import Optional, List, Literal


# =========================
# Authentication Schemas
# =========================

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str

    # =========================
# User Profile Schemas
# =========================

class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: str


class UserProfileResponse(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: str
    profile_image: Optional[str] = None


# =========================
# RAG Source Schema
# =========================

class SourceResponse(BaseModel):
    file: str
    page: Optional[int] = None
    score: Optional[float] = None


# =========================
# Chat Schemas
# =========================

class ChatRequest(BaseModel):
    question: str
    conversation_id: Optional[int] = None
    language: Literal[
        "en",
        "hi",
        "bn",
        "hinglish"
    ] = "en"

    # Farmer's location for weather
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ChatResponse(BaseModel):
    conversation_id: int
    answer: str
    sources: List[SourceResponse] = []


# =========================
# TEXT TO SPEECH SCHEMA
# =========================

class TextToSpeechRequest(BaseModel):
    text: str
    language: Literal[
        "en",
        "hi",
        "bn",
        "hinglish"
    ] = "en"


# =========================
# Conversation Schemas
# =========================

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: str


# =========================
# Message Schema
# =========================

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: List[SourceResponse] = []
    created_at: str