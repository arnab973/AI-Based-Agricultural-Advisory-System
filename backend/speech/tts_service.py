
import os
import base64

from dotenv import load_dotenv
from sarvamai import SarvamAI


# =====================================================
# LOAD ENV
# =====================================================

load_dotenv()


# =====================================================
# SARVAM API KEY
# =====================================================

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

if not SARVAM_API_KEY:
    raise RuntimeError(
        "SARVAM_API_KEY not found in .env file"
    )


# =====================================================
# SARVAM CLIENT
# =====================================================

client = SarvamAI(
    api_subscription_key=SARVAM_API_KEY
)


# =====================================================
# LANGUAGE MAPPING
# =====================================================

LANGUAGE_CODES = {
    "en": "en-IN",
    "hi": "hi-IN",
    "bn": "bn-IN",

    # Hinglish ke liye Hindi voice/language
    "hinglish": "hi-IN",
}


# =====================================================
# TEXT TO SPEECH
# =====================================================

def text_to_speech(
    text: str,
    language: str = "en"
) -> bytes:

    try:

        # =============================================
        # VALIDATE TEXT
        # =============================================

        text = text.strip()

        if not text:
            raise ValueError(
                "Text cannot be empty"
            )


        # =============================================
        # GET LANGUAGE CODE
        # =============================================

        language_code = LANGUAGE_CODES.get(
            language,
            "en-IN"
        )


        # =============================================
        # SARVAM TTS
        # =============================================
        # IMPORTANT:
        # Use language_code
        # NOT target_language_code
        # =============================================

        response = client.text_to_speech.convert(
            text=text,
            language_code=language_code,
            model="bulbul:v3",
            speaker="shubh"
        )


        # =============================================
        # CHECK AUDIO RESPONSE
        # =============================================

        if not response.audios:
            raise RuntimeError(
                "No audio received from Sarvam AI"
            )


        # =============================================
        # BASE64 → AUDIO BYTES
        # =============================================

        audio_base64 = response.audios[0]

        audio_bytes = base64.b64decode(
            audio_base64
        )

        return audio_bytes


    except ValueError:
        raise


    except Exception as e:

        print(
            "Sarvam TTS Error:",
            repr(e)
        )

        raise RuntimeError(
            f"Unable to generate speech: {str(e)}"
        )
