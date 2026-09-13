from datetime import datetime

from .agmarknet import get_market_prices


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

    records = data.get("records", [])

    if not records:
        return {
            "count": 0,
            "latest": None,
            "records": []
        }

    valid_records = []

    for record in records:
        arrival_date = record.get("Arrival_Date")

        if not arrival_date:
            continue

        try:
            parsed_date = datetime.strptime(
                arrival_date.replace("\\/", "/"),
                "%d/%m/%Y"
            )

            valid_records.append(
                (parsed_date, record)
            )

        except (ValueError, TypeError):
            continue

    valid_records.sort(
        key=lambda x: x[0],
        reverse=True
    )

    latest = (
        valid_records[0][1]
        if valid_records
        else None
    )

    return {
        "count": len(records),
        "latest": latest,
        "records": [
            record
            for _, record in valid_records
        ]
    }