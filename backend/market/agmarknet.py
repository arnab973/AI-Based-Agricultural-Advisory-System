import os
import json
import requests

from pathlib import Path
from datetime import datetime
from typing import Optional
from urllib.parse import urlencode
from time import time

from dotenv import load_dotenv


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# OLD DATA.GOV.IN CONFIG
# =========================================================
# Kept because the existing commodity/price functions still
# use the previous API flow.
# =========================================================

API_KEY = os.getenv("AGMARKNET_API_KEY")

BASE_URL = (
    "https://api.data.gov.in/resource/"
    "35985678-0d79-46b4-9ed6-6f13308a1d24"
)


# =========================================================
# NEW AGMARKNET 2.0 API
# =========================================================

AGMARKNET_V2_BASE_URL = "https://api.agmarknet.gov.in/v1"

AGMARKNET_FILTERS_URL = (
    f"{AGMARKNET_V2_BASE_URL}/daily-price-arrival/filters"
)

AGMARKNET_LOCATION_STATE_URL = (
    f"{AGMARKNET_V2_BASE_URL}/location/state"
)


# =========================================================
# DISTRICT DATA
# =========================================================

DISTRICT_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "india_districts.json"
)


# =========================================================
# CACHE
# =========================================================

_API_CACHE = {}

CACHE_TTL_SECONDS = 60


_FILTER_CACHE = None
_FILTER_CACHE_TIMESTAMP = 0

FILTER_CACHE_TTL_SECONDS = 600


# =========================================================
# INDIA STATES
# =========================================================

INDIA_STATES = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
]


# =========================================================
# BASIC HELPERS
# =========================================================

def _clean(value):
    """
    Convert any value to a clean string.
    """
    if value is None:
        return ""

    return str(value).strip()


def _normalize(value):
    """
    Normalize text for comparison.
    """
    return " ".join(
        _clean(value).lower().split()
    )


def _parse_arrival_date(value):
    """
    Parse Agmarknet arrival date.

    Supported examples:
        31/08/2026
        31-08-2026
        2026-08-31
    """

    if not value:
        return None

    value = _clean(value)

    value = value.replace("\\/", "/")

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%d/%m/%y",
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


def _clean_price(value):
    """
    Convert price value to float when possible.
    """

    if value is None:
        return None

    value = _clean(value)

    if not value:
        return None

    value = value.replace(",", "")

    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _clean_price_record(record):
    """
    Clean price-related fields without changing the
    original record structure too aggressively.
    """

    if not isinstance(record, dict):
        return record

    cleaned = dict(record)

    for key in [
        "Min_Price",
        "Max_Price",
        "Modal_Price",
        "Min",
        "Max",
        "Modal",
    ]:
        if key in cleaned:
            price = _clean_price(
                cleaned.get(key)
            )

            if price is not None:
                cleaned[key] = price

    return cleaned


# =========================================================
# DISTRICT DATA
# =========================================================

def _load_district_data():
    """
    Load local State -> District JSON.
    """

    if not DISTRICT_FILE.exists():
        print(
            f"District file not found: {DISTRICT_FILE}"
        )

        return {}

    try:
        with open(
            DISTRICT_FILE,
            "r",
            encoding="utf-8"
        ) as file:
            data = json.load(file)

        if isinstance(data, dict):
            return data

    except Exception as error:
        print(
            "Unable to load district JSON:",
            repr(error)
        )

    return {}


# =========================================================
# STATES
# =========================================================

def get_states():
    """
    Return all supported Indian states/UTs.
    """

    return INDIA_STATES


# =========================================================
# DISTRICTS
# =========================================================

def get_districts(state: str):
    """
    Return districts from local JSON.
    """

    state = _clean(state)

    if not state:
        return []

    data = _load_district_data()

    # Exact match first
    if state in data:
        districts = data[state]

        if isinstance(districts, list):
            return sorted(
                [_clean(item) for item in districts if _clean(item)]
            )

    # Normalized match
    normalized_state = _normalize(state)

    for key, districts in data.items():

        if _normalize(key) == normalized_state:

            if isinstance(districts, list):
                return sorted(
                    [
                        _clean(item)
                        for item in districts
                        if _clean(item)
                    ]
                )

    return []


# =========================================================
# STATE NORMALIZATION
# =========================================================

def _normalize_state(state: str):
    """
    Normalize state names for Agmarknet API.
    """

    state = _clean(state)

    aliases = {
        "andaman and nicobar islands":
            "Andaman and Nicobar",

        "andaman & nicobar islands":
            "Andaman and Nicobar",

        "jammu & kashmir":
            "Jammu and Kashmir",

        "odisha":
            "Odisha",

        "orissa":
            "Odisha",

        "uttaranchal":
            "Uttarakhand",

        "pondicherry":
            "Puducherry",
    }

    normalized = _normalize(state)

    return aliases.get(
        normalized,
        state
    )


# =========================================================
# DISTRICT NORMALIZATION
# =========================================================

def _normalize_district(
    state: str,
    district: str
):
    """
    Normalize district against local district JSON.
    """

    district = _clean(district)

    if not district:
        return ""

    districts = get_districts(state)

    normalized_district = _normalize(
        district
    )

    for item in districts:

        if _normalize(item) == normalized_district:
            return item

    return district


# =========================================================
# AGMARKNET 2.0 FILTER API
# =========================================================

def _get_agmarknet_filters():
    """
    Fetch Agmarknet 2.0 filter data.

    Endpoint:
        /v1/daily-price-arrival/filters

    This endpoint provides:
        - states
        - districts
        - markets
        - commodities
        - varieties
        - grades
        etc.
    """

    global _FILTER_CACHE
    global _FILTER_CACHE_TIMESTAMP

    now = time()

    # -----------------------------------------------------
    # CACHE
    # -----------------------------------------------------

    if (
        _FILTER_CACHE is not None
        and now - _FILTER_CACHE_TIMESTAMP
        < FILTER_CACHE_TTL_SECONDS
    ):
        return _FILTER_CACHE

    # -----------------------------------------------------
    # HEADERS
    # -----------------------------------------------------

    headers = {
        "Accept": (
            "application/json, "
            "text/plain, */*"
        ),
        "Origin": "https://agmarknet.gov.in",
        "Referer": "https://agmarknet.gov.in/",
        "User-Agent": "Mozilla/5.0",
    }

    print(
        "\n========== AGMARKNET 2.0 FILTERS =========="
    )

    try:

        response = requests.get(
            AGMARKNET_FILTERS_URL,
            headers=headers,
            timeout=(15, 30)
        )

        print(
            "Agmarknet filters status:",
            response.status_code
        )

        response.raise_for_status()

        payload = response.json()

    except requests.RequestException as error:

        print(
            "Agmarknet filters request failed:",
            repr(error)
        )

        raise RuntimeError(
            "Unable to fetch Agmarknet 2.0 filters."
        ) from error

    except ValueError as error:

        print(
            "Invalid JSON from Agmarknet:",
            repr(error)
        )

        raise RuntimeError(
            "Agmarknet returned invalid JSON."
        ) from error

    # -----------------------------------------------------
    # VALIDATE RESPONSE
    # -----------------------------------------------------

    if not payload.get("status"):

        raise RuntimeError(
            payload.get(
                "message",
                "Agmarknet filter request failed."
            )
        )

    data = payload.get("data")

    if not isinstance(data, dict):

        raise RuntimeError(
            "Agmarknet filter response has no valid data."
        )

    # -----------------------------------------------------
    # DEBUG COUNTS
    # -----------------------------------------------------

    print(
        "States:",
        len(data.get("state_data") or [])
    )

    print(
        "Districts:",
        len(data.get("district_data") or [])
    )

    print(
        "Markets:",
        len(data.get("market_data") or [])
    )

    print(
        "Commodities:",
        len(data.get("cmdt_data") or [])
    )

    # -----------------------------------------------------
    # CACHE
    # -----------------------------------------------------

    _FILTER_CACHE = data
    _FILTER_CACHE_TIMESTAMP = now

    return data


# =========================================================
# FIND STATE ID FROM AGMARKNET FILTER DATA
# =========================================================

def _find_state_id(
    filter_data,
    state: str
):
    """
    Find Agmarknet state ID.

    Agmarknet 2.0's /daily-price-arrival/filters response can contain
    state_data, but the deployed API has shown that this list may not
    contain the same state names as the location API.

    Therefore we use the official /v1/location/state endpoint first and
    keep the old filter-data lookup as a fallback.
    """

    requested_state = _normalize_state(state)
    normalized_requested = _normalize(requested_state)

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://agmarknet.gov.in",
        "Referer": "https://agmarknet.gov.in/",
        "User-Agent": "Mozilla/5.0",
    }

    # -----------------------------------------------------
    # OFFICIAL LOCATION API
    # -----------------------------------------------------

    print("Looking for Agmarknet state:", requested_state)

    try:
        response = requests.get(
            AGMARKNET_LOCATION_STATE_URL,
            params={"page": 1},
            headers=headers,
            timeout=(15, 30)
        )

        print(
            "Agmarknet location/state status:",
            response.status_code
        )

        response.raise_for_status()
        payload = response.json()
        states = payload.get("states") or []

        print(
            "Location states found:",
            len(states)
        )

        for item in states:
            if not isinstance(item, dict):
                continue

            api_state = _clean(
                item.get("state_name")
                or item.get("name")
            )

            state_id = (
                item.get("id")
                or item.get("state_id")
            )

            if not api_state or state_id is None:
                continue

            if _normalize(api_state) == normalized_requested:
                print(
                    "State matched:",
                    api_state,
                    "-> ID",
                    state_id
                )
                return state_id

            # Common Agmarknet naming variation.
            if (
                normalized_requested == "andaman and nicobar islands"
                and _normalize(api_state) == "andaman and nicobar"
            ):
                print(
                    "State matched:",
                    api_state,
                    "-> ID",
                    state_id
                )
                return state_id

    except requests.RequestException as error:
        print(
            "Agmarknet state location lookup failed:",
            repr(error)
        )
    except ValueError as error:
        print(
            "Invalid JSON from Agmarknet state location API:",
            repr(error)
        )
    except Exception as error:
        print(
            "Agmarknet state lookup error:",
            repr(error)
        )

    # -----------------------------------------------------
    # FALLBACK: FILTER DATA
    # -----------------------------------------------------

    state_data = (
        filter_data.get("state_data")
        or []
    )

    for item in state_data:
        if not isinstance(item, dict):
            continue

        api_state = _clean(
            item.get("state_name")
            or item.get("name")
        )

        if not api_state:
            continue

        if _normalize(api_state) == normalized_requested:
            state_id = (
                item.get("id")
                or item.get("state_id")
            )

            print(
                "State matched from filter data:",
                api_state,
                "-> ID",
                state_id
            )
            return state_id

        if (
            normalized_requested == "andaman and nicobar islands"
            and _normalize(api_state) == "andaman and nicobar"
        ):
            state_id = (
                item.get("id")
                or item.get("state_id")
            )

            return state_id

    print(
        "State ID not found:",
        requested_state
    )

    return None


# =========================================================
# FIND DISTRICT ID
# =========================================================

def _find_district_id(
    filter_data,
    state_id,
    state: str,
    district: str
):
    """
    Find district ID for the selected Agmarknet state.

    The official /v1/location/state endpoint returns states together
    with their districts, so use that source first. The existing
    filter-data lookup remains as a fallback.
    """

    requested_district = _normalize_district(
        state,
        district
    )

    normalized_requested = _normalize(
        requested_district
    )

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://agmarknet.gov.in",
        "Referer": "https://agmarknet.gov.in/",
        "User-Agent": "Mozilla/5.0",
    }

    print(
        "Looking for district:",
        requested_district,
        "in state ID:",
        state_id
    )

    # -----------------------------------------------------
    # OFFICIAL LOCATION API
    # -----------------------------------------------------

    try:
        response = requests.get(
            AGMARKNET_LOCATION_STATE_URL,
            params={"page": 1},
            headers=headers,
            timeout=(15, 30)
        )

        print(
            "Agmarknet location/state status:",
            response.status_code
        )

        response.raise_for_status()
        payload = response.json()
        states = payload.get("states") or []

        for state_item in states:
            if not isinstance(state_item, dict):
                continue

            current_state_id = (
                state_item.get("id")
                or state_item.get("state_id")
            )

            if (
                current_state_id is None
                or str(current_state_id) != str(state_id)
            ):
                continue

            districts = (
                state_item.get("districts")
                or []
            )

            print(
                "Districts found for state:",
                len(districts)
            )

            for item in districts:
                if isinstance(item, dict):
                    district_name = _clean(
                        item.get("district_name")
                        or item.get("name")
                    )

                    district_id = (
                        item.get("id")
                        or item.get("district_id")
                    )
                else:
                    district_name = _clean(item)
                    district_id = None

                if not district_name or district_id is None:
                    continue

                if _normalize(district_name) == normalized_requested:
                    print(
                        "District matched:",
                        district_name,
                        "-> ID",
                        district_id
                    )
                    return district_id

            print(
                "District not found in location API:",
                requested_district
            )
            break

    except requests.RequestException as error:
        print(
            "Agmarknet district location lookup failed:",
            repr(error)
        )
    except ValueError as error:
        print(
            "Invalid JSON from Agmarknet district location API:",
            repr(error)
        )
    except Exception as error:
        print(
            "Agmarknet district lookup error:",
            repr(error)
        )

    # -----------------------------------------------------
    # FALLBACK: FILTER DATA
    # -----------------------------------------------------

    district_data = (
        filter_data.get("district_data")
        or []
    )

    for item in district_data:
        if not isinstance(item, dict):
            continue

        district_name = _clean(
            item.get("district_name")
            or item.get("name")
        )

        if not district_name:
            continue

        item_state_id = (
            item.get("state_id")
            or item.get("stateId")
        )

        if (
            item_state_id is not None
            and state_id is not None
            and str(item_state_id) != str(state_id)
        ):
            continue

        if _normalize(district_name) == normalized_requested:
            district_id = (
                item.get("id")
                or item.get("district_id")
            )

            if district_id is not None:
                print(
                    "District matched from filter data:",
                    district_name,
                    "-> ID",
                    district_id
                )
                return district_id

    # -----------------------------------------------------
    # FALLBACK: NESTED FILTER STATE DATA
    # -----------------------------------------------------

    state_data = (
        filter_data.get("state_data")
        or []
    )

    for state_item in state_data:
        if not isinstance(state_item, dict):
            continue

        current_state_id = (
            state_item.get("id")
            or state_item.get("state_id")
        )

        if (
            current_state_id is None
            or str(current_state_id) != str(state_id)
        ):
            continue

        districts = (
            state_item.get("districts")
            or []
        )

        for item in districts:
            if isinstance(item, dict):
                district_name = _clean(
                    item.get("district_name")
                    or item.get("name")
                )

                district_id = (
                    item.get("id")
                    or item.get("district_id")
                )
            else:
                district_name = _clean(item)
                district_id = None

            if (
                district_name
                and district_id is not None
                and _normalize(district_name) == normalized_requested
            ):
                return district_id

    print(
        "District ID not found:",
        requested_district
    )

    return None


# =========================================================
# MARKETS - AGMARKNET 2.0
# =========================================================

def get_markets(
    state: str,
    district: str
):
    """
    Get markets for a selected State + District.

    Uses:
        /v1/daily-price-arrival/filters

    No india_markets.json is required.
    """

    state = _clean(state)
    district = _clean(district)

    if not state:
        return []

    if not district:
        return []

    # -----------------------------------------------------
    # NORMALIZE
    # -----------------------------------------------------

    state = _normalize_state(
        state
    )

    district = _normalize_district(
        state,
        district
    )

    print(
        "\n========== GET MARKETS =========="
    )

    print(
        "Requested state:",
        state
    )

    print(
        "Requested district:",
        district
    )

    # -----------------------------------------------------
    # GET FILTER DATA
    # -----------------------------------------------------

    filter_data = _get_agmarknet_filters()

    # -----------------------------------------------------
    # STATE ID
    # -----------------------------------------------------

    state_id = _find_state_id(
        filter_data,
        state
    )

    if state_id is None:

        print(
            "State ID not found:",
            state
        )

        return []

    print(
        "Agmarknet state_id:",
        state_id
    )

    # -----------------------------------------------------
    # DISTRICT ID
    # -----------------------------------------------------

    district_id = _find_district_id(
        filter_data,
        state_id,
        state,
        district
    )

    if district_id is None:

        print(
            "District ID not found:",
            district
        )

        return []

    print(
        "Agmarknet district_id:",
        district_id
    )

    # -----------------------------------------------------
    # FILTER MARKETS
    # -----------------------------------------------------

    market_data = (
        filter_data.get("market_data")
        or []
    )

    markets = []

    for item in market_data:

        if not isinstance(item, dict):
            continue

        market_name = _clean(
            item.get("mkt_name")
            or item.get("market_name")
            or item.get("name")
        )

        if not market_name:
            continue

        # Ignore global "All Markets"
        if _normalize(market_name) == "all markets":
            continue

        item_state_id = (
            item.get("state_id")
            or item.get("stateId")
        )

        item_district_id = (
            item.get("district_id")
            or item.get("districtId")
        )

        # -------------------------------------------------
        # STATE MATCH
        # -------------------------------------------------

        if (
            str(item_state_id)
            != str(state_id)
        ):
            continue

        # -------------------------------------------------
        # DISTRICT MATCH
        # -------------------------------------------------

        if (
            str(item_district_id)
            != str(district_id)
        ):
            continue

        markets.append(
            market_name
        )

    # -----------------------------------------------------
    # REMOVE DUPLICATES
    # -----------------------------------------------------

    markets = sorted(
        set(markets),
        key=lambda value: value.lower()
    )

    print(
        "Markets found:",
        len(markets)
    )

    # -----------------------------------------------------
    # RETURN
    # -----------------------------------------------------

    return markets


# =========================================================
# OLD API REQUEST HELPER
# =========================================================

def _call_agmarknet(
    filters: Optional[dict] = None,
    fields: Optional[str] = None,
    limit: int = 1000,
    offset: int = 0,
    sort: Optional[str] = None
):
    """
    Existing data.gov.in request helper.

    Kept for the existing commodity/price implementation.
    """

    if not API_KEY:

        raise RuntimeError(
            "AGMARKNET_API_KEY is not configured."
        )

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }

    if filters:
        params.update(filters)

    if fields:
        params["fields"] = fields

    if sort:
        params["sort"] = sort

    query_string = urlencode(
        params,
        safe="[],"
    )

    url = (
        f"{BASE_URL}?{query_string}"
    )

    cache_key = url

    now = time()

    # -----------------------------------------------------
    # CACHE
    # -----------------------------------------------------

    cached = _API_CACHE.get(
        cache_key
    )

    if cached:

        cached_time, cached_data = cached

        if (
            now - cached_time
            < CACHE_TTL_SECONDS
        ):
            return cached_data

    print(
        "\n========== OLD AGMARKNET API =========="
    )

    print(
        "Requesting data.gov.in..."
    )

    try:

        response = requests.get(
            url,
            timeout=(15, 30)
        )

        print(
            "Old Agmarknet status:",
            response.status_code
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as error:

        print(
            "Agmarknet API request failed:",
            repr(error)
        )

        raise RuntimeError(
            "Unable to fetch market data."
        ) from error

    except ValueError as error:

        print(
            "Invalid JSON from Agmarknet:",
            repr(error)
        )

        raise RuntimeError(
            "Agmarknet returned invalid JSON."
        ) from error

    # -----------------------------------------------------
    # VALIDATE
    # -----------------------------------------------------

    if not isinstance(data, dict):

        raise RuntimeError(
            "Invalid Agmarknet response."
        )

    # -----------------------------------------------------
    # CACHE
    # -----------------------------------------------------

    _API_CACHE[cache_key] = (
        now,
        data
    )

    return data


# =========================================================
# COMMODITIES
# =========================================================

def get_commodities(
    state: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None
):
    """
    Get commodities from Agmarknet 2.0.

    Uses the already-loaded /v1/daily-price-arrival/filters
    response instead of the old data.gov.in commodity lookup.

    The existing frontend/backend response format remains:
        list[str]
    """

    try:
        filter_data = _get_agmarknet_filters()

        commodity_data = (
            filter_data.get("cmdt_data")
            or []
        )

        requested_state = _normalize_state(state) if state else ""
        requested_district = (
            _normalize_district(requested_state, district)
            if requested_state and district
            else _clean(district)
        )
        requested_market = _clean(market)

        normalized_state = (
            _normalize(requested_state)
            if requested_state
            else ""
        )
        normalized_district = (
            _normalize(requested_district)
            if requested_district
            else ""
        )
        normalized_market = (
            _normalize(requested_market)
            if requested_market
            else ""
        )

        commodities = []

        for item in commodity_data:

            if isinstance(item, dict):

                commodity = _clean(
                    item.get("cmdt_name")
                    or item.get("commodity_name")
                    or item.get("Commodity")
                    or item.get("name")
                    or item.get("commodity")
                )

                item_state = _clean(
                    item.get("state_name")
                    or item.get("state")
                    or item.get("State")
                )

                item_district = _clean(
                    item.get("district_name")
                    or item.get("district")
                    or item.get("District")
                )

                item_market = _clean(
                    item.get("mkt_name")
                    or item.get("market_name")
                    or item.get("market")
                    or item.get("Market")
                )

            else:
                commodity = _clean(item)
                item_state = ""
                item_district = ""
                item_market = ""

            if not commodity:
                continue

            # -------------------------------------------------
            # LOCATION FILTER
            #
            # Some Agmarknet 2.0 deployments return cmdt_data
            # as a global commodity list without location fields.
            # In that case, keep the commodity instead of
            # incorrectly returning an empty list.
            # -------------------------------------------------

            if normalized_state and item_state:
                if _normalize(item_state) != normalized_state:
                    continue

            if normalized_district and item_district:
                if _normalize(item_district) != normalized_district:
                    continue

            if normalized_market and item_market:
                if _normalize(item_market) != normalized_market:
                    continue

            commodities.append(commodity)

        commodities = sorted(
            set(commodities),
            key=lambda value: value.lower()
        )

        print(
            "Commodities found:",
            len(commodities),
            "| State:",
            requested_state,
            "| District:",
            requested_district,
            "| Market:",
            requested_market
        )

        return commodities

    except Exception as error:

        print(
            "Commodity lookup failed:",
            repr(error)
        )

        return []


# =========================================================
# MARKET PRICE
# =========================================================

def get_market_prices(
    state: str,
    commodity: str,
    district: Optional[str] = None,
    market: Optional[str] = None
):
    """
    Existing market-price function.

    Uses the current data.gov.in implementation so the
    existing /market/price endpoint remains compatible.
    """

    filters = {}

    if state:
        filters["filters[State]"] = state

    if commodity:
        filters["filters[Commodity]"] = commodity

    if district:
        filters["filters[District]"] = district

    if market:
        filters["filters[Market]"] = market

    fields = (
        "State,"
        "District,"
        "Market,"
        "Commodity,"
        "Variety,"
        "Grade,"
        "Arrival_Date,"
        "Min_Price,"
        "Max_Price,"
        "Modal_Price,"
        "Commodity_Code"
    )

    try:

        data = _call_agmarknet(
            filters=filters,
            fields=fields,
            limit=1000,
            offset=0,
            sort="Arrival_Date:desc"
        )

        records = (
            data.get("records")
            or []
        )

        cleaned_records = []

        for record in records:

            if not isinstance(
                record,
                dict
            ):
                continue

            cleaned_records.append(
                _clean_price_record(
                    record
                )
            )

        return {
            "count": len(cleaned_records),
            "records": cleaned_records,
        }

    except Exception as error:

        print(
            "Market price lookup failed:",
            repr(error)
        )

        return {
            "count": 0,
            "records": [],
        }


# =========================================================
# FETCH MARKET PRICE
# =========================================================

def fetch_market_price(
    state: str,
    commodity: str,
    district: Optional[str] = None,
    market: Optional[str] = None
):
    """
    Return market price data with latest record.
    """

    data = get_market_prices(
        state=state,
        commodity=commodity,
        district=district,
        market=market
    )

    records = (
        data.get("records")
        or []
    )

    if not records:

        return {
            "count": 0,
            "latest": None,
            "records": [],
        }

    valid_records = []

    for record in records:

        arrival_date = record.get(
            "Arrival_Date"
        )

        parsed_date = (
            _parse_arrival_date(
                arrival_date
            )
        )

        if parsed_date is None:
            continue

        valid_records.append(
            (
                parsed_date,
                record
            )
        )

    # -----------------------------------------------------
    # SORT NEWEST FIRST
    # -----------------------------------------------------

    valid_records.sort(
        key=lambda item: item[0],
        reverse=True
    )

    latest = (
        valid_records[0][1]
        if valid_records
        else records[0]
    )

    return {
        "count": len(records),
        "latest": latest,
        "records": [
            record
            for _, record
            in valid_records
        ],
    }