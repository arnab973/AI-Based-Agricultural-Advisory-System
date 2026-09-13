import os
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

if not SARVAM_API_KEY:
    raise RuntimeError("SARVAM_API_KEY is missing in .env")

client = SarvamAI(
    api_subscription_key=SARVAM_API_KEY
)


def speech_to_text(audio_bytes: bytes, filename: str = "recording.webm") -> str:
    try:
        if not audio_bytes:
            raise ValueError("Audio file is empty")

        print("================================")
        print("Speech-to-text request")
        print("Filename:", filename)
        print("Audio size:", len(audio_bytes), "bytes")
        print("================================")

        # Create a temporary file because Sarvam needs an actual file object
        temp_dir = "speech/temp"
        os.makedirs(temp_dir, exist_ok=True)

        temp_path = os.path.join(temp_dir, filename)

        with open(temp_path, "wb") as f:
            f.write(audio_bytes)

        print("Temporary audio file:", temp_path)

        with open(temp_path, "rb") as audio_file:

            response = client.speech_to_text.transcribe(
                file=audio_file,
                model="saaras:v3",
                mode="transcribe"
            )

        print("Sarvam response:", response)

        # SDK response can expose transcript as an attribute
        transcript = getattr(response, "transcript", None)

        if not transcript:
            # Fallback if response behaves like a dictionary
            if isinstance(response, dict):
                transcript = response.get("transcript")

        if not transcript:
            raise ValueError("Sarvam returned an empty transcript")

        return transcript

    except Exception as e:
        print("Speech-to-text error:", repr(e))
        raise

    finally:
        # Remove temporary file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass