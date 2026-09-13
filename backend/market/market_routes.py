from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from .market_service import fetch_market_price
from .agmarknet import (
    get_states,
    get_districts,
    get_markets,
    get_commodities,
)


router = APIRouter(
    prefix="/market",
    tags=["Market"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class MarketPriceRequest(BaseModel):
    state: str
    commodity: str
    district: str | None = None
    market: str | None = None


# =========================================================
# STATES
# =========================================================

@router.get("/states")
def states():

    try:
        return get_states()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load states: {str(e)}"
        )


# =========================================================
# DISTRICTS
# =========================================================

@router.get("/districts")
def districts(
    state: str = Query(..., min_length=1)
):

    try:
        return get_districts(state)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load districts: {str(e)}"
        )


# =========================================================
# MARKETS
# =========================================================

@router.get("/markets")
def markets(
    state: str = Query(..., min_length=1),
    district: str = Query(..., min_length=1)
):

    try:
        return get_markets(
            state=state,
            district=district
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load markets: {str(e)}"
        )


# =========================================================
# COMMODITIES
# =========================================================

@router.get("/commodities")
def commodities(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    market: str | None = Query(default=None)
):

    try:
        return get_commodities(
            state=state,
            district=district,
            market=market
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load commodities: {str(e)}"
        )


# =========================================================
# MARKET PRICE
# =========================================================

@router.post("/price")
def market_price(
    request: MarketPriceRequest
):

    try:

        return fetch_market_price(
            state=request.state,
            commodity=request.commodity,
            district=request.district,
            market=request.market
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Market API error: {str(e)}"
        )