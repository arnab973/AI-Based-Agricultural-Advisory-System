from datetime import datetime

from .agmarknet import get_market_prices


def _parse_arrival_date(value):
    if not value:
        return None

    value = str(value).strip().replace("\\/", "/")

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d-%b-%Y",
        "%d-%B-%Y",
        "%Y-%m-%d",
        "%d/%m/%y",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue

    return None


def fetch_market_price(
    state: str,
    commodity: str,
    district: str | None = None,
    market: str | None = None
):
    data = get_market_prices(
        state=state,
        commodity=commodity,
        district=district,
        market=market
    )

    records = data.get("records") or []

    if not records:
        return {
            "count": 0,
            "latest": None,
            "records": []
        }

    valid_records = []

    for record in records:
        arrival_date = record.get("Arrival_Date")

        parsed_date = _parse_arrival_date(arrival_date)

        if parsed_date is not None:
            valid_records.append(
                (parsed_date, record)
            )

    if valid_records:
        valid_records.sort(
            key=lambda item: item[0],
            reverse=True
        )

        sorted_records = [
            record
            for _, record in valid_records
        ]

        return {
            "count": len(records),
            "latest": sorted_records[0],
            "records": sorted_records
        }

    # If date format is unknown, don't throw away the Agmarknet record
    return {
        "count": len(records),
        "latest": records[0],
        "records": records
    }