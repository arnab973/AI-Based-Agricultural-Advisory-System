from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from weather.weather_service import get_weather_for_ai


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


# =====================================================
# REQUEST MODEL
# =====================================================

class WeatherRequest(BaseModel):

    latitude: float
    longitude: float


# =====================================================
# GET CURRENT WEATHER
# =====================================================

@router.post("/current")
def current_weather(
    request: WeatherRequest
):

    try:

        result = get_weather_for_ai(
            latitude=request.latitude,
            longitude=request.longitude
        )

        if not result.get("success"):

            raise HTTPException(
                status_code=502,
                detail="Unable to fetch weather data"
            )

        return {
            "success": True,
            "weather": result.get("weather")
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "Weather route error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Weather service unavailable"
        )