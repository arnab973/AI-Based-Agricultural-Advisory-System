import os
import requests
from dotenv import load_dotenv


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()

AGRO_API_KEY = os.getenv("AGRO_API_KEY")

BASE_URL = "http://api.agromonitoring.com/agro/1.0"


# =====================================================
# GET CURRENT WEATHER
# =====================================================

def get_current_weather(
    latitude: float,
    longitude: float
):
    """
    Get current weather data from AgroMonitoring API.
    """

    if not AGRO_API_KEY:
        raise ValueError(
            "AGRO_API_KEY is not configured in .env"
        )

    url = f"{BASE_URL}/weather"

    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": AGRO_API_KEY,
    }

    try:

        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        return {
            "success": True,
            "data": data,
        }

    except requests.exceptions.RequestException as e:

        print(
            "Weather API error:",
            repr(e)
        )

        return {
            "success": False,
            "error": str(e),
            "data": None,
        }


# =====================================================
# FORMAT WEATHER DATA
# =====================================================

def format_weather_data(
    weather_data: dict
):
    """
    Convert raw AgroMonitoring weather
    response into simple AI-friendly data.
    """

    if not weather_data:
        return None

    main = weather_data.get(
        "main",
        {}
    )

    wind = weather_data.get(
        "wind",
        {}
    )

    weather = weather_data.get(
        "weather",
        []
    )

    weather_condition = "Unknown"

    if weather:

        weather_condition = weather[0].get(
            "description",
            "Unknown"
        )

    temperature = main.get(
        "temp"
    )

    feels_like = main.get(
        "feels_like"
    )

    humidity = main.get(
        "humidity"
    )

    pressure = main.get(
        "pressure"
    )

    wind_speed = wind.get(
        "speed"
    )

    return {
        "temperature": temperature,
        "feels_like": feels_like,
        "humidity": humidity,
        "pressure": pressure,
        "wind_speed": wind_speed,
        "condition": weather_condition,
    }


# =====================================================
# GET WEATHER FOR AI
# =====================================================

def get_weather_for_ai(
    latitude: float,
    longitude: float
):
    """
    Fetch weather and return
    simplified information suitable
    for agricultural AI/RAG.
    """

    result = get_current_weather(
        latitude=latitude,
        longitude=longitude
    )

    if not result["success"]:

        return {
            "success": False,
            "weather": None,
            "error": result.get("error"),
        }

    formatted_weather = format_weather_data(
        result["data"]
    )

    return {
        "success": True,
        "weather": formatted_weather,
    }