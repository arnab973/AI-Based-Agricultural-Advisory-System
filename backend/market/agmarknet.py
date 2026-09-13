import os
import json
import requests
from pathlib import Path
from urllib.parse import urlencode
from datetime import datetime
from typing import Optional
from time import time

from dotenv import load_dotenv


load_dotenv()


# =========================================================
# CONFIG
# =========================================================

API_KEY = os.getenv("AGMARKNET_API_KEY")

BASE_URL = (
    "https://api.data.gov.in/resource/"
    "35985678-0d79-46b4-9ed6-6f13308a1d24"
)

# Project structure:
#
# backend/
# ├── data/
# │   └── india_districts.json
# │
# └── market/
#     └── agmarknet.py

DISTRICT_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "india_districts.json"
)


# =========================================================
# CACHE
# =========================================================
# Prevent repeated identical requests from hitting
# Agmarknet again and again.
#
# Cache lives only while FastAPI is running.
# =========================================================

_API_CACHE = {}

CACHE_TTL_SECONDS = 60


def _cache_key(
    filters=None,
    limit=1000,
    offset=0,
    fields=None,
    sort_desc=True,
):
    return (
        str(filters or {}),
        int(limit),
        int(offset),
        tuple(fields or []),
        bool(sort_desc),
    )


def _get_cached(key):
    item = _API_CACHE.get(key)

    if not item:
        return None

    timestamp, data = item

    if time() - timestamp > CACHE_TTL_SECONDS:
        _API_CACHE.pop(key, None)
        return None

    print("Using cached Agmarknet response.")

    return data


def _set_cached(key, data):
    _API_CACHE[key] = (
        time(),
        data,
    )


# =========================================================
# INDIA STATES + UNION TERRITORIES
# =========================================================

INDIA_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    # Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
]


# =========================================================
# HELPERS
# =========================================================

def _clean(value):
    """
    Convert API value to clean string.
    """

    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    return value


def _normalize(value):
    """
    Case-insensitive normalized comparison.
    """

    if value is None:
        return ""

    return " ".join(
        str(value)
        .strip()
        .lower()
        .split()
    )


# =========================================================
# DATE PARSER
# =========================================================

def _parse_arrival_date(value):
    """
    Parse Agmarknet arrival date.

    Supported:
        DD/MM/YYYY
        DD-MM-YYYY
        YYYY-MM-DD
        DD/MM/YYYY HH:MM:SS
        DD-MM-YYYY HH:MM:SS
        YYYY-MM-DD HH:MM:SS
    """

    if not value:
        return None

    value = str(value).strip()

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",

        "%d/%m/%Y %H:%M:%S",
        "%d-%m-%Y %H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(
                value,
                fmt
            )
        except ValueError:
            continue

    return None


# =========================================================
# PRICE CLEANER
# =========================================================

def _clean_price(value):
    """
    Convert price string into integer/float where possible.
    """

    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    try:
        number = float(value)

        if number.is_integer():
            return int(number)

        return number

    except (ValueError, TypeError):
        return value


def _clean_price_record(record):
    """
    Return a cleaned copy of an API market-price record.
    """

    cleaned = dict(record)

    price_fields = [
        "Min_Price",
        "Max_Price",
        "Modal_Price",
    ]

    for field in price_fields:

        if field in cleaned:

            cleaned[field] = _clean_price(
                cleaned[field]
            )

    return cleaned


# =========================================================
# LOAD DISTRICT JSON
# =========================================================

def _load_district_data():

    if not DISTRICT_FILE.exists():

        raise FileNotFoundError(
            "india_districts.json not found.\n"
            f"Expected location:\n{DISTRICT_FILE}"
        )

    try:

        with open(
            DISTRICT_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

    except json.JSONDecodeError as e:

        raise Exception(
            f"Invalid india_districts.json: {e}"
        )

    if not isinstance(data, dict):

        raise Exception(
            "india_districts.json must contain "
            "a JSON object."
        )

    return data


# =========================================================
# STATES
# =========================================================

def get_states():

    return {
        "count": len(INDIA_STATES),
        "states": INDIA_STATES,
    }


# =========================================================
# DISTRICTS
# =========================================================

def get_districts(state: str):

    if not state:
        raise ValueError("State is required")

    state = state.strip()

    if not state:
        raise ValueError("State is required")

    data = _load_district_data()

    matched_state = None

    for stored_state in data.keys():

        if (
            _normalize(stored_state)
            == _normalize(state)
        ):

            matched_state = stored_state
            break

    if matched_state is None:

        return {
            "state": state,
            "count": 0,
            "districts": [],
        }

    raw_districts = data.get(
        matched_state,
        []
    )

    if not isinstance(
        raw_districts,
        list
    ):

        raise Exception(
            f"District data for '{matched_state}' "
            "must be a list."
        )

    districts = []

    for district in raw_districts:

        district = _clean(district)

        if district:
            districts.append(district)

    # Remove duplicates
    districts = list(
        dict.fromkeys(districts)
    )

    # Sort
    districts.sort(
        key=lambda x: x.lower()
    )

    return {
        "state": matched_state,
        "count": len(districts),
        "districts": districts,
    }


# =========================================================
# NORMALIZE STATE
# =========================================================

def _normalize_state(state):

    if not state:
        return None

    state = state.strip()

    for available_state in INDIA_STATES:

        if (
            _normalize(available_state)
            == _normalize(state)
        ):

            return available_state

    return state


# =========================================================
# NORMALIZE DISTRICT
# =========================================================

def _normalize_district(
    state,
    district
):

    if not district:
        return None

    district = district.strip()

    if not state:
        return district

    try:

        data = get_districts(state)

        available_districts = data.get(
            "districts",
            []
        )

        for available_district in available_districts:

            if (
                _normalize(available_district)
                == _normalize(district)
            ):

                return available_district

    except Exception as e:

        print(
            "District normalization warning:",
            e
        )

    return district


# =========================================================
# AGMARKNET API REQUEST
# =========================================================

def _call_agmarknet(
    filters=None,
    limit=1000,
    offset=0,
    fields=None,
    sort_desc=True,
):

    if not API_KEY:

        raise Exception(
            "AGMARKNET_API_KEY is missing in .env"
        )

    # -----------------------------------------------------
    # CACHE CHECK
    # -----------------------------------------------------

    key = _cache_key(
        filters=filters,
        limit=limit,
        offset=offset,
        fields=fields,
        sort_desc=sort_desc,
    )

    cached_data = _get_cached(key)

    if cached_data is not None:
        return cached_data

    # -----------------------------------------------------
    # PARAMETERS
    # -----------------------------------------------------

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }

    # -----------------------------------------------------
    # Filters
    # -----------------------------------------------------

    if filters:

        for key_name, value in filters.items():

            value = _clean(value)

            if not value:
                continue

            params[
                f"filters[{key_name}]"
            ] = value

    # -----------------------------------------------------
    # Fields
    # -----------------------------------------------------

    if fields:

        params["fields"] = ",".join(fields)

    # -----------------------------------------------------
    # Latest Arrival_Date first
    # -----------------------------------------------------

    if sort_desc:

        params[
            "sort[Arrival_Date]"
        ] = "desc"

    # -----------------------------------------------------
    # URL
    # -----------------------------------------------------

    url = (
        f"{BASE_URL}?"
        f"{urlencode(params)}"
    )

    print(
        "\n========== AGMARKNET REQUEST =========="
    )

    safe_url = url.replace(
        API_KEY,
        "***"
    )

    print(
        "URL:",
        safe_url
    )

    print(
        "========================================"
    )

    # -----------------------------------------------------
    # REQUESTS
    # -----------------------------------------------------

    try:

        response = requests.get(
            url,
            timeout=(15, 30),
        )

    except requests.exceptions.Timeout:

        raise Exception(
            "Agmarknet API request timed out."
        )

    except requests.exceptions.RequestException as e:

        raise Exception(
            "Agmarknet request error: "
            f"{str(e)}"
        )

    if not response.text.strip():

        raise Exception(
            "Empty response received from "
            "Agmarknet API"
        )

    # -----------------------------------------------------
    # JSON
    # -----------------------------------------------------

    try:

        data = response.json()

    except ValueError:

        raise Exception(
            "Invalid Agmarknet API response:\n"
            f"{response.text[:1500]}"
        )
    # -----------------------------------------------------
    # RATE LIMIT HANDLING
    # -----------------------------------------------------

    error_text = str(
        data.get("error", "")
    ).lower()

    if (
        "rate limit" in error_text
        or "rate_limit" in error_text
        or "too many requests" in error_text
        or data.get("status") == 429
    ):

        print(
            "\n⚠️ AGMARKNET RATE LIMIT EXCEEDED"
        )

        # Return a structured empty response instead
        # of crashing the complete application.
        return {
            "status": "rate_limited",
            "count": 0,
            "records": [],
            "rate_limited": True,
            "message": (
                "Agmarknet API rate limit exceeded. "
                "Please try again later."
            ),
        }

    # -----------------------------------------------------
    # NORMAL STATUS ERROR
    # -----------------------------------------------------

    if data.get("status") != "ok":

        raise Exception(
            "Agmarknet API returned error:\n"
            f"{data}"
        )

    # -----------------------------------------------------
    # CACHE SUCCESSFUL RESPONSE
    # -----------------------------------------------------

    _set_cached(
        key,
        data
    )

    return data


# =========================================================
# MARKETS
# =========================================================

def get_markets(
    state: str,
    district: str
):

    if not state:
        raise ValueError("State is required")

    if not district:
        raise ValueError("District is required")

    state = _normalize_state(state)

    district = _normalize_district(
        state,
        district
    )

    print(
        "\n========== MARKET API =========="
    )

    print(
        "State:",
        state
    )

    print(
        "District:",
        district
    )

    print(
        "================================"
    )

    markets = set()

    # -----------------------------------------------------
    # DIRECT SEARCH
    # -----------------------------------------------------

    try:

        data = _call_agmarknet(
            filters={
                "State": state,
                "District": district,
    },
    limit=100,
    offset=0,
    fields=[
        "State",
        "District",
        "Market",
    ],
    sort_desc=False,
)

        records = data.get(
            "records",
            []
        )

        print(
            "Direct district records:",
            len(records)
        )

        for record in records:

            market = _clean(
                record.get("Market")
            )

            if market:
                markets.add(market)

    except Exception as e:

        print(
            "Direct district search failed:",
            e
        )

    # -----------------------------------------------------
    # FALLBACK
    # -----------------------------------------------------

    if not markets:

        print(
            "No direct markets found."
        )

        print(
            "Trying state-level fallback..."
        )

        offset = 0
        page_size = 1000

        target_district = _normalize(
            district
        )

        # Keep fallback limited.
        # Do not make 20 expensive API calls.
        for page in range(3):

            try:

                data = _call_agmarknet(
                    filters={
                        "State": state,
                    },
                    limit=page_size,
                    offset=offset,
                    fields=[
                        "State",
                        "District",
                        "Market",
                    ],
                )

            except Exception as e:

                print(
                    "Fallback request failed:",
                    e
                )

                break

            # Stop immediately if API is rate limited.
            if data.get("rate_limited"):

                print(
                    "Market fallback stopped "
                    "because API is rate limited."
                )

                break

            records = data.get(
                "records",
                []
            )

            if not records:
                break

            for record in records:

                api_district = _clean(
                    record.get("District")
                )

                if not api_district:
                    continue

                if (
                    _normalize(api_district)
                    != target_district
                ):
                    continue

                market = _clean(
                    record.get("Market")
                )

                if market:
                    markets.add(market)

            if len(records) < page_size:
                break

            offset += page_size

    # -----------------------------------------------------
    # RESULT
    # -----------------------------------------------------

    result = sorted(
        markets,
        key=lambda x: x.lower()
    )

    print(
        "Final Markets Found:",
        len(result)
    )

    print(
        "================================\n"
    )

    return {
        "state": state,
        "district": district,
        "count": len(result),
        "markets": result,
    }


# =========================================================
# COMMODITIES
# =========================================================

def get_commodities(
    state: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
):

    state = _normalize_state(state)

    district = _normalize_district(
        state,
        district
    )

    if market:
        market = market.strip()

    print(
        "\n========== COMMODITY API =========="
    )

    print(
        "Requested State:",
        state
    )

    print(
        "Requested District:",
        district
    )

    print(
        "Requested Market:",
        market
    )

    print(
        "==================================="
    )

    commodities = set()

    # =====================================================
    # EXACT SEARCH
    # =====================================================

    try:

        filters = {}

        if state:
            filters["State"] = state

        if district:
            filters["District"] = district

        if market:
            filters["Market"] = market

        data = _call_agmarknet(
            filters=filters,
            limit=1000,
            offset=0,
            fields=[
                "State",
                "District",
                "Market",
                "Commodity",
            ],
        )

        records = data.get(
            "records",
            []
        )

        print(
            "Exact search records:",
            len(records)
        )

        for record in records:

            commodity = _clean(
                record.get("Commodity")
            )

            if commodity:
                commodities.add(
                    commodity
                )

    except Exception as e:

        print(
            "Exact commodity search failed:",
            e
        )

    # =====================================================
    # FALLBACK
    # =====================================================

    if not commodities:

        print(
            "No commodities found using exact filter."
        )

        print(
            "Trying fallback..."
        )

        offset = 0
        page_size = 1000

        target_market = (
            _normalize(market)
            if market
            else None
        )

        # Limited fallback to protect API quota.
        for page in range(3):

            try:

                filters = {}

                if state:
                    filters["State"] = state

                if district:
                    filters["District"] = district

                data = _call_agmarknet(
                    filters=filters,
                    limit=page_size,
                    offset=offset,
                    fields=[
                        "State",
                        "District",
                        "Market",
                        "Commodity",
                    ],
                )

            except Exception as e:

                print(
                    "Fallback API request failed:",
                    e
                )

                break

            if data.get("rate_limited"):

                print(
                    "Commodity fallback stopped "
                    "because API is rate limited."
                )

                break

            records = data.get(
                "records",
                []
            )

            print(
                f"Fallback page {page + 1}:",
                len(records),
                "records"
            )

            if not records:
                break

            for record in records:

                api_market = _clean(
                    record.get("Market")
                )

                if not api_market:
                    continue

                if target_market:

                    if (
                        _normalize(api_market)
                        != target_market
                    ):
                        continue

                commodity = _clean(
                    record.get("Commodity")
                )

                if commodity:
                    commodities.add(
                        commodity
                    )

            if len(records) < page_size:
                break

            offset += page_size

    # =====================================================
    # RESULT
    # =====================================================

    result = sorted(
        commodities,
        key=lambda x: x.lower()
    )

    print(
        "Final Commodities Found:",
        len(result)
    )

    print(
        "===================================\n"
    )

    return {
        "state": state,
        "district": district,
        "market": market,
        "count": len(result),
        "commodities": result,
    }


# =========================================================
# GET MARKET PRICE RECORDS
# =========================================================

def get_market_prices(
    state: str,
    commodity: str,
    district: Optional[str] = None,
    market: Optional[str] = None,
):
    """
    Fetch market price records from Agmarknet.

    Flow:

        State
          ↓
        District
          ↓
        Market
          ↓
        Commodity
          ↓
        Latest Market Price

    IMPORTANT:
    Only the first sorted page is requested.
    This avoids unnecessary API calls and rate limits.
    """

    # =====================================================
    # VALIDATION
    # =====================================================

    if not state or not state.strip():

        raise ValueError(
            "State is required"
        )

    if not commodity or not commodity.strip():

        raise ValueError(
            "Commodity is required"
        )

    state = _normalize_state(state)

    commodity = commodity.strip()

    district = _normalize_district(
        state,
        district
    )

    if market:
        market = market.strip()

    print(
        "\n========== MARKET PRICE API =========="
    )

    print(
        "State:",
        state
    )

    print(
        "District:",
        district
    )

    print(
        "Market:",
        market
    )

    print(
        "Commodity:",
        commodity
    )

    print(
        "======================================"
    )

    # =====================================================
    # API FILTERS
    # =====================================================

    filters = {
        "State": state,
        "Commodity": commodity,
    }

    if district:
        filters["District"] = district

    if market:
        filters["Market"] = market

    # =====================================================
    # FETCH ONLY FIRST PAGE
    # =====================================================
    #
    # We already sort by Arrival_Date descending.
    #
    # Therefore the newest records are on page 1.
    #
    # No 50,000-record pagination is required.
    # =====================================================

    data = _call_agmarknet(
        filters=filters,
        limit=1000,
        offset=0,
        fields=[
            "State",
            "District",
            "Market",
            "Commodity",
            "Variety",
            "Grade",
            "Arrival_Date",
            "Min_Price",
            "Max_Price",
            "Modal_Price",
            "Commodity_Code",
        ],
        sort_desc=True,
    )

    # =====================================================
    # RATE LIMIT
    # =====================================================

    if data.get("rate_limited"):

        print(
            "Market price request was rate limited."
        )

        return {
            "success": False,
            "rate_limited": True,
            "count": 0,

            "state": state,
            "district": district,
            "market": market,
            "commodity": commodity,

            "latest": None,
            "records": [],

            "message": (
                "Live market price is temporarily "
                "unavailable because the Agmarknet "
                "API rate limit has been reached."
            ),
        }

    # =====================================================
    # RECORDS
    # =====================================================

    records = data.get(
        "records",
        []
    )

    print(
        "Initial price records:",
        len(records)
    )

    # =====================================================
    # LOCAL EXACT FILTERING
    # =====================================================

    filtered_records = []

    target_state = _normalize(state)

    target_commodity = _normalize(
        commodity
    )

    target_district = (
        _normalize(district)
        if district
        else None
    )

    target_market = (
        _normalize(market)
        if market
        else None
    )

    for record in records:

        api_state = _normalize(
            record.get("State")
        )

        api_commodity = _normalize(
            record.get("Commodity")
        )

        api_district = _normalize(
            record.get("District")
        )

        api_market = _normalize(
            record.get("Market")
        )

        # -------------------------------------------------
        # State
        # -------------------------------------------------

        if (
            target_state
            and api_state
            and api_state != target_state
        ):
            continue

        # -------------------------------------------------
        # Commodity
        # -------------------------------------------------

        if (
            target_commodity
            and api_commodity
            and api_commodity != target_commodity
        ):
            continue

        # -------------------------------------------------
        # District
        # -------------------------------------------------

        if (
            target_district
            and api_district
            and api_district != target_district
        ):
            continue

        # -------------------------------------------------
        # Market
        # -------------------------------------------------

        if (
            target_market
            and api_market
            and api_market != target_market
        ):
            continue

        filtered_records.append(
            record
        )

    print(
        "Records after local filtering:",
        len(filtered_records)
    )

    # =====================================================
    # DATE SORTING
    # =====================================================

    dated_records = []

    invalid_date_records = []

    for index, record in enumerate(
        filtered_records
    ):

        arrival_date = record.get(
            "Arrival_Date"
        )

        parsed_date = _parse_arrival_date(
            arrival_date
        )

        if parsed_date:

            dated_records.append(
                (
                    parsed_date,
                    index,
                    record,
                )
            )

        else:

            invalid_date_records.append(
                record
            )

    # =====================================================
    # NEWEST FIRST
    # =====================================================

    dated_records.sort(
        key=lambda item: (
            item[0],
            -item[1],
        ),
        reverse=True,
    )

    # =====================================================
    # CLEAN RECORDS
    # =====================================================

    cleaned_records = []

    for _, _, record in dated_records:

        cleaned_records.append(
            _clean_price_record(
                record
            )
        )

    # =====================================================
    # LATEST RECORD
    # =====================================================

    latest = None

    if cleaned_records:

        latest = cleaned_records[0]

    # =====================================================
    # DEBUG
    # =====================================================

    print(
        "\n========== LATEST MARKET PRICE =========="
    )

    if latest:

        print(
            "Latest Date:",
            latest.get("Arrival_Date")
        )

        print(
            "Commodity:",
            latest.get("Commodity")
        )

        print(
            "District:",
            latest.get("District")
        )

        print(
            "Market:",
            latest.get("Market")
        )

        print(
            "Variety:",
            latest.get("Variety")
        )

        print(
            "Min Price:",
            latest.get("Min_Price")
        )

        print(
            "Max Price:",
            latest.get("Max_Price")
        )

        print(
            "Modal Price:",
            latest.get("Modal_Price")
        )

    else:

        print(
            "NO VALID MARKET PRICE FOUND"
        )

    print(
        "=========================================\n"
    )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {
        "success": True,

        "count": len(cleaned_records),

        "state": state,
        "district": district,
        "market": market,
        "commodity": commodity,

        "latest": latest,

        "records": cleaned_records,

        "invalid_date_records": len(
            invalid_date_records
        ),
    }


# =========================================================
# FETCH MARKET PRICE
# =========================================================

def fetch_market_price(
    state: str,
    commodity: str,
    district: Optional[str] = None,
    market: Optional[str] = None,
):
    """
    Main public function for market price.
    """

    # =====================================================
    # VALIDATION
    # =====================================================

    if not state or not state.strip():

        raise ValueError(
            "State is required"
        )

    if not commodity or not commodity.strip():

        raise ValueError(
            "Commodity is required"
        )

    state = state.strip()

    commodity = commodity.strip()

    if district:
        district = district.strip()

    if market:
        market = market.strip()

    # =====================================================
    # FETCH
    # =====================================================

    data = get_market_prices(
        state=state,
        commodity=commodity,
        district=district,
        market=market,
    )

    # =====================================================
    # RATE LIMIT
    # =====================================================

    if data.get("rate_limited"):

        return {
            "success": False,

            "rate_limited": True,

            "count": 0,

            "state": state,
            "district": district,
            "market": market,
            "commodity": commodity,

            "latest": None,

            "records": [],

            "message": data.get(
                "message",
                "Market API rate limit exceeded."
            ),
        }

    records = data.get(
        "records",
        []
    )

    latest = data.get(
        "latest"
    )

    # =====================================================
    # NO DATA
    # =====================================================

    if not records:

        return {
            "success": True,

            "count": 0,

            "state": state,
            "district": district,
            "market": market,
            "commodity": commodity,

            "latest": None,

            "records": [],

            "message": (
                "No market price data found "
                "for the selected location "
                "and commodity."
            ),
        }

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {
        "success": True,

        "count": len(records),

        "state": state,
        "district": district,
        "market": market,
        "commodity": commodity,

        "latest": latest,

        "records": records,
    }