"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* =========================================================
   TYPES
========================================================= */

interface PriceRecord {
  State?: string;
  District?: string;
  Market?: string;
  Commodity?: string;
  Variety?: string;
  Grade?: string;
  Arrival_Date?: string;
  Min_Price?: number | string | null;
  Max_Price?: number | string | null;
  Modal_Price?: number | string | null;
  Commodity_Code?: string;
}

interface PriceResponse {
  success: boolean;
  count: number;
  state: string;
  district?: string | null;
  market?: string | null;
  commodity: string;
  latest?: PriceRecord | null;
  records: PriceRecord[];
  message?: string;
}

interface StatesResponse {
  count: number;
  states: string[];
}

interface DistrictsResponse {
  state: string;
  count: number;
  districts: string[];
}

interface MarketsResponse {
  state: string;
  district: string;
  count: number;
  markets: string[];
}

interface CommoditiesResponse {
  state?: string | null;
  district?: string | null;
  market?: string | null;
  count: number;
  commodities: string[];
}

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const text = value.trim();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // DD/MM/YYYY
  if (text.includes("/")) {
    const parts = text.split("/");

    if (parts.length >= 3) {
      const day = parts[0];
      const month = Number(parts[1]);
      const year = parts[2].split(" ")[0];

      if (month >= 1 && month <= 12) {
        return `${day} ${monthNames[month - 1]} ${year}`;
      }
    }
  }

  // DD-MM-YYYY
  if (text.includes("-")) {
    const parts = text.split("-");

    if (parts.length >= 3 && parts[0].length <= 2) {
      const day = parts[0];
      const month = Number(parts[1]);
      const year = parts[2].split(" ")[0];

      if (month >= 1 && month <= 12) {
        return `${day} ${monthNames[month - 1]} ${year}`;
      }
    }
  }

  return text;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MarketPricePage() {
  /* -------------------------------------------------------
     THEME
  ------------------------------------------------------- */

  const { theme } = useTheme();
  const isDark = theme === "dark";

  /* -------------------------------------------------------
     DROPDOWN DATA
  ------------------------------------------------------- */

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);

  /* -------------------------------------------------------
     SELECTED VALUES
  ------------------------------------------------------- */

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("");
  const [selectedMarket, setSelectedMarket] =
    useState<string>("");
  const [selectedCommodity, setSelectedCommodity] =
    useState<string>("");

  /* -------------------------------------------------------
     PRICE DATA
  ------------------------------------------------------- */

  const [priceData, setPriceData] =
    useState<PriceResponse | null>(null);

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const [loadingStates, setLoadingStates] =
    useState<boolean>(false);

  const [loadingDistricts, setLoadingDistricts] =
    useState<boolean>(false);

  const [loadingMarkets, setLoadingMarkets] =
    useState<boolean>(false);

  const [loadingCommodities, setLoadingCommodities] =
    useState<boolean>(false);

  const [loadingPrice, setLoadingPrice] =
    useState<boolean>(false);

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  const [error, setError] = useState<string>("");

  /* =========================================================
     LOAD STATES
  ========================================================= */

  useEffect(() => {
    void loadStates();
  }, []);

  async function loadStates(): Promise<void> {
    try {
      setLoadingStates(true);
      setError("");

      const response = await fetch(
        `${API_URL}/market/states`,
      );

      if (!response.ok) {
        throw new Error("Failed to load states");
      }

      const data: StatesResponse = await response.json();

      setStates(data.states ?? []);
    } catch (err) {
      console.error("State error:", err);

      setError(
        "Unable to load states. Make sure backend is running.",
      );
    } finally {
      setLoadingStates(false);
    }
  }

  /* =========================================================
     STATE CHANGE
  ========================================================= */

  async function handleStateChange(
    state: string,
  ): Promise<void> {
    setSelectedState(state);

    setSelectedDistrict("");
    setSelectedMarket("");
    setSelectedCommodity("");

    setDistricts([]);
    setMarkets([]);
    setCommodities([]);

    setPriceData(null);
    setError("");

    if (!state) {
      return;
    }

    try {
      setLoadingDistricts(true);

      const params = new URLSearchParams({
        state,
      });

      const response = await fetch(
        `${API_URL}/market/districts?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load districts");
      }

      const data: DistrictsResponse =
        await response.json();

      setDistricts(data.districts ?? []);
    } catch (err) {
      console.error("District error:", err);

      setError(
        "Unable to load districts for this state.",
      );
    } finally {
      setLoadingDistricts(false);
    }
  }

  /* =========================================================
     DISTRICT CHANGE
  ========================================================= */

  async function handleDistrictChange(
    district: string,
  ): Promise<void> {
    setSelectedDistrict(district);

    setSelectedMarket("");
    setSelectedCommodity("");

    setMarkets([]);
    setCommodities([]);

    setPriceData(null);
    setError("");

    if (!district || !selectedState) {
      return;
    }

    try {
      setLoadingMarkets(true);

      const params = new URLSearchParams({
        state: selectedState,
        district,
      });

      const response = await fetch(
        `${API_URL}/market/markets?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load markets");
      }

      const data: MarketsResponse =
        await response.json();

      setMarkets(data.markets ?? []);
    } catch (err) {
      console.error("Market error:", err);

      setError(
        "Unable to load markets for this district.",
      );
    } finally {
      setLoadingMarkets(false);
    }
  }

  /* =========================================================
     MARKET CHANGE
  ========================================================= */

  async function handleMarketChange(
    market: string,
  ): Promise<void> {
    setSelectedMarket(market);

    setSelectedCommodity("");
    setCommodities([]);

    setPriceData(null);
    setError("");

    if (
      !market ||
      !selectedState ||
      !selectedDistrict
    ) {
      return;
    }

    try {
      setLoadingCommodities(true);

      const params = new URLSearchParams({
        state: selectedState,
        district: selectedDistrict,
        market,
      });

      const response = await fetch(
        `${API_URL}/market/commodities?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load commodities",
        );
      }

      const data: CommoditiesResponse =
        await response.json();

      setCommodities(data.commodities ?? []);
    } catch (err) {
      console.error("Commodity error:", err);

      setError(
        "Unable to load commodities for this market.",
      );
    } finally {
      setLoadingCommodities(false);
    }
  }

  /* =========================================================
     COMMODITY CHANGE
  ========================================================= */

  function handleCommodityChange(
    commodity: string,
  ): void {
    setSelectedCommodity(commodity);
    setPriceData(null);
    setError("");
  }

  /* =========================================================
     GET MARKET PRICE
  ========================================================= */

  async function handleGetPrice(): Promise<void> {
    if (!selectedState) {
      setError("Please select a state.");
      return;
    }

    if (!selectedCommodity) {
      setError("Please select a commodity.");
      return;
    }

    try {
      setLoadingPrice(true);
      setError("");
      setPriceData(null);

      const response = await fetch(
        `${API_URL}/market/price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: selectedState,
            district: selectedDistrict || null,
            market: selectedMarket || null,
            commodity: selectedCommodity,
          }),
        },
      );

      const data: PriceResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch market price.",
        );
      }

      setPriceData(data);

      if (
        !data.latest &&
        (!data.records || data.records.length === 0)
      ) {
        setError(
          data.message ||
            "No market price data found.",
        );
      }
    } catch (err) {
      console.error("Price error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to fetch market price.",
        );
      }
    } finally {
      setLoadingPrice(false);
    }
  }

  /* =========================================================
     RESET
  ========================================================= */

  function handleReset(): void {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedMarket("");
    setSelectedCommodity("");

    setDistricts([]);
    setMarkets([]);
    setCommodities([]);

    setPriceData(null);
    setError("");
  }

  const latest = priceData?.latest ?? null;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className={
        isDark
          ? "min-h-screen bg-[#050505] text-white"
          : "min-h-screen bg-slate-50 text-zinc-900"
      }
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={
            isDark
              ? "absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-green-500/10 blur-[120px]"
              : "absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-green-400/10 blur-[120px]"
          }
        />

        <div
          className={
            isDark
              ? "absolute right-[10%] top-[35%] h-80 w-80 rounded-full bg-emerald-400/10 blur-[130px]"
              : "absolute right-[10%] top-[35%] h-80 w-80 rounded-full bg-emerald-300/10 blur-[130px]"
          }
        />

        <div
          className={
            isDark
              ? "absolute bottom-[5%] left-[35%] h-72 w-72 rounded-full bg-lime-500/5 blur-[120px]"
              : "absolute bottom-[5%] left-[35%] h-72 w-72 rounded-full bg-lime-300/10 blur-[120px]"
          }
        />
      </div>

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8">
          <div
            className={
              isDark
                ? "mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/5 px-3 py-1.5 text-xs text-green-300"
                : "mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-xs text-green-700"
            }
          >
            <span className="h-2 w-2 rounded-full bg-green-400" />
            LIVE MARKET DATA
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Agricultural{" "}
            <span className="text-green-500">
              Market Price
            </span>
          </h1>

          <p
            className={
              isDark
                ? "mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base"
                : "mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base"
            }
          >
            Select your location and commodity to
            check the latest agricultural market
            prices.
          </p>
        </header>

        {/* =================================================
            FILTER CARD
        ================================================= */}

        <section
          className={
            isDark
              ? "rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-7"
              : "rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl backdrop-blur-xl sm:p-7"
          }
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2
                className={
                  isDark
                    ? "text-xl font-semibold text-white"
                    : "text-xl font-semibold text-zinc-900"
                }
              >
                Find Market Price
              </h2>

              <p
                className={
                  isDark
                    ? "mt-1 text-xs text-zinc-500"
                    : "mt-1 text-xs text-zinc-500"
                }
              >
                State → District → Market → Commodity
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className={
                isDark
                  ? "rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
                  : "rounded-xl border border-zinc-200 px-4 py-2 text-xs text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              }
            >
              Reset
            </button>
          </div>

          {/* Dropdowns */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SelectBox
              label="State"
              value={selectedState}
              placeholder={
                loadingStates
                  ? "Loading..."
                  : "Select State"
              }
              options={states}
              disabled={loadingStates}
              onChange={handleStateChange}
              isDark={isDark}
            />

            <SelectBox
              label="District"
              value={selectedDistrict}
              placeholder={
                !selectedState
                  ? "Select State First"
                  : loadingDistricts
                    ? "Loading..."
                    : "Select District"
              }
              options={districts}
              disabled={
                !selectedState ||
                loadingDistricts
              }
              onChange={handleDistrictChange}
              isDark={isDark}
            />

            <SelectBox
              label="Market"
              value={selectedMarket}
              placeholder={
                !selectedDistrict
                  ? "Select District First"
                  : loadingMarkets
                    ? "Loading..."
                    : "Select Market"
              }
              options={markets}
              disabled={
                !selectedDistrict ||
                loadingMarkets
              }
              onChange={handleMarketChange}
              isDark={isDark}
            />

            <SelectBox
              label="Commodity"
              value={selectedCommodity}
              placeholder={
                !selectedMarket
                  ? "Select Market First"
                  : loadingCommodities
                    ? "Loading..."
                    : "Select Commodity"
              }
              options={commodities}
              disabled={
                !selectedMarket ||
                loadingCommodities
              }
              onChange={handleCommodityChange}
              isDark={isDark}
            />
          </div>

          {/* Get Price Button */}

          <button
            type="button"
            onClick={handleGetPrice}
            disabled={
              loadingPrice ||
              !selectedState ||
              !selectedCommodity
            }
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-green-500 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loadingPrice ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Fetching Price...
              </>
            ) : (
              <>
                <span className="text-xl">₹</span>
                Get Market Price
              </>
            )}
          </button>

          {/* Error */}

          {error && (
            <div
              className={
                isDark
                  ? "mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  : "mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              }
            >
              ⚠️ {error}
            </div>
          )}
        </section>

        {/* =================================================
            SELECTED PATH
        ================================================= */}

        {selectedState && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={
                isDark
                  ? "text-zinc-500"
                  : "text-zinc-500"
              }
            >
              Selected:
            </span>

            <Tag text={selectedState} isDark={isDark} />

            {selectedDistrict && (
              <>
                <span
                  className={
                    isDark
                      ? "text-zinc-600"
                      : "text-zinc-400"
                  }
                >
                  →
                </span>

                <Tag
                  text={selectedDistrict}
                  isDark={isDark}
                />
              </>
            )}

            {selectedMarket && (
              <>
                <span
                  className={
                    isDark
                      ? "text-zinc-600"
                      : "text-zinc-400"
                  }
                >
                  →
                </span>

                <Tag
                  text={selectedMarket}
                  isDark={isDark}
                />
              </>
            )}

            {selectedCommodity && (
              <>
                <span
                  className={
                    isDark
                      ? "text-zinc-600"
                      : "text-zinc-400"
                  }
                >
                  →
                </span>

                <Tag
                  text={selectedCommodity}
                  isDark={isDark}
                />
              </>
            )}
          </div>
        )}

        {/* =================================================
            LATEST PRICE
        ================================================= */}

        {latest && (
          <section className="mt-10">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-green-500">
                Latest Available Price
              </p>

              <h2
                className={
                  isDark
                    ? "mt-2 text-2xl font-bold text-white sm:text-3xl"
                    : "mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl"
                }
              >
                {latest.Commodity ||
                  selectedCommodity}
              </h2>

              <p
                className={
                  isDark
                    ? "mt-1 text-sm text-zinc-500"
                    : "mt-1 text-sm text-zinc-600"
                }
              >
                {latest.Market ||
                  selectedMarket ||
                  "Market"}
                {" • "}
                {formatDate(
                  latest.Arrival_Date,
                )}
              </p>
            </div>

            {/* Price Cards */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <PriceCard
                title="Minimum Price"
                value={formatPrice(
                  latest.Min_Price,
                )}
                subtitle="Per Quintal"
                isDark={isDark}
              />

              <PriceCard
                title="Maximum Price"
                value={formatPrice(
                  latest.Max_Price,
                )}
                subtitle="Per Quintal"
                isDark={isDark}
              />

              <PriceCard
                title="Modal Price"
                value={formatPrice(
                  latest.Modal_Price,
                )}
                subtitle="Most Common Price"
                featured
                isDark={isDark}
              />
            </div>

            {/* Details */}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard
                label="State"
                value={
                  latest.State ||
                  selectedState
                }
                isDark={isDark}
              />

              <DetailCard
                label="District"
                value={
                  latest.District ||
                  selectedDistrict ||
                  "—"
                }
                isDark={isDark}
              />

              <DetailCard
                label="Market"
                value={
                  latest.Market ||
                  selectedMarket ||
                  "—"
                }
                isDark={isDark}
              />

              <DetailCard
                label="Arrival Date"
                value={formatDate(
                  latest.Arrival_Date,
                )}
                isDark={isDark}
              />

              <DetailCard
                label="Variety"
                value={
                  latest.Variety || "—"
                }
                isDark={isDark}
              />

              <DetailCard
                label="Grade"
                value={
                  latest.Grade || "—"
                }
                isDark={isDark}
              />

              <DetailCard
                label="Commodity Code"
                value={
                  latest.Commodity_Code ||
                  "—"
                }
                isDark={isDark}
              />

              <DetailCard
                label="Total Records"
                value={String(
                  priceData?.count ?? 0,
                )}
                isDark={isDark}
              />
            </div>
          </section>
        )}

        {/* =================================================
            PRICE HISTORY
        ================================================= */}

        {priceData &&
          priceData.records &&
          priceData.records.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-green-500">
                  Price History
                </p>

                <h2
                  className={
                    isDark
                      ? "mt-2 text-2xl font-bold text-white"
                      : "mt-2 text-2xl font-bold text-zinc-900"
                  }
                >
                  Recent Market Records
                </h2>
              </div>

              <div
                className={
                  isDark
                    ? "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                    : "overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg"
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr
                        className={
                          isDark
                            ? "border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500"
                            : "border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500"
                        }
                      >
                        <th className="px-5 py-4">
                          Date
                        </th>

                        <th className="px-5 py-4">
                          Market
                        </th>

                        <th className="px-5 py-4">
                          Variety
                        </th>

                        <th className="px-5 py-4">
                          Min Price
                        </th>

                        <th className="px-5 py-4">
                          Max Price
                        </th>

                        <th className="px-5 py-4">
                          Modal Price
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {priceData.records
                        .slice(0, 50)
                        .map(
                          (
                            record: PriceRecord,
                            index: number,
                          ) => (
                            <tr
                              key={`${record.Arrival_Date ?? "date"}-${index}`}
                              className={
                                isDark
                                  ? "border-b border-white/5 text-sm transition hover:bg-white/5"
                                  : "border-b border-zinc-100 text-sm transition hover:bg-zinc-50"
                              }
                            >
                              <td
                                className={
                                  isDark
                                    ? "px-5 py-4 text-zinc-300"
                                    : "px-5 py-4 text-zinc-700"
                                }
                              >
                                {formatDate(
                                  record.Arrival_Date,
                                )}
                              </td>

                              <td
                                className={
                                  isDark
                                    ? "px-5 py-4 font-medium text-white"
                                    : "px-5 py-4 font-medium text-zinc-900"
                                }
                              >
                                {record.Market ||
                                  "—"}
                              </td>

                              <td
                                className={
                                  isDark
                                    ? "px-5 py-4 text-zinc-400"
                                    : "px-5 py-4 text-zinc-600"
                                }
                              >
                                {record.Variety ||
                                  "—"}
                              </td>

                              <td
                                className={
                                  isDark
                                    ? "px-5 py-4 text-zinc-300"
                                    : "px-5 py-4 text-zinc-700"
                                }
                              >
                                {formatPrice(
                                  record.Min_Price,
                                )}
                              </td>

                              <td
                                className={
                                  isDark
                                    ? "px-5 py-4 text-zinc-300"
                                    : "px-5 py-4 text-zinc-700"
                                }
                              >
                                {formatPrice(
                                  record.Max_Price,
                                )}
                              </td>

                              <td className="px-5 py-4 font-semibold text-green-500">
                                {formatPrice(
                                  record.Modal_Price,
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

        {/* =================================================
            NO DATA
        ================================================= */}

        {priceData &&
          priceData.records &&
          priceData.records.length === 0 &&
          !loadingPrice && (
            <div
              className={
                isDark
                  ? "mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center"
                  : "mt-8 rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-lg"
              }
            >
              <div className="text-4xl">📊</div>

              <h3
                className={
                  isDark
                    ? "mt-4 text-xl font-semibold text-white"
                    : "mt-4 text-xl font-semibold text-zinc-900"
                }
              >
                No Market Data Found
              </h3>

              <p
                className={
                  isDark
                    ? "mx-auto mt-2 max-w-md text-sm text-zinc-500"
                    : "mx-auto mt-2 max-w-md text-sm text-zinc-600"
                }
              >
                No price records are available
                for the selected location and
                commodity.
              </p>
            </div>
          )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className={
            isDark
              ? "mt-12 border-t border-white/5 pt-5 text-center text-xs text-zinc-600"
              : "mt-12 border-t border-zinc-200 pt-5 text-center text-xs text-zinc-500"
          }
        >
          Market data provided through
          Agmarknet / Government of India data
          services.
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   SELECT BOX
========================================================= */

interface SelectBoxProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
  isDark: boolean;
}

function SelectBox({
  label,
  value,
  placeholder,
  options,
  disabled = false,
  onChange,
  isDark,
}: SelectBoxProps) {
  return (
    <div>
      <label
        className={
          isDark
            ? "mb-2 block text-xs font-medium text-zinc-400"
            : "mb-2 block text-xs font-medium text-zinc-600"
        }
      >
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={
            isDark
              ? "h-14 w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 pr-10 text-sm text-white outline-none transition focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10 disabled:cursor-not-allowed disabled:opacity-40"
              : "h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 pr-10 text-sm text-zinc-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          }
        >
          <option
            value=""
            className={
              isDark
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-900"
            }
          >
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
              className={
                isDark
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-900"
              }
            >
              {option}
            </option>
          ))}
        </select>

        <span
          className={
            isDark
              ? "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              : "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
          }
        >
          ▼
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   PRICE CARD
========================================================= */

interface PriceCardProps {
  title: string;
  value: string;
  subtitle: string;
  featured?: boolean;
  isDark: boolean;
}

function PriceCard({
  title,
  value,
  subtitle,
  featured = false,
  isDark,
}: PriceCardProps) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        featured
          ? isDark
            ? "border-green-400/30 bg-green-400/10"
            : "border-green-500/30 bg-green-50"
          : isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-zinc-200 bg-white shadow-md"
      }`}
    >
      <p
        className={
          isDark
            ? "text-sm text-zinc-500"
            : "text-sm text-zinc-500"
        }
      >
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${
          featured
            ? "text-green-500"
            : isDark
              ? "text-white"
              : "text-zinc-900"
        }`}
      >
        {value}
      </p>

      <p
        className={
          isDark
            ? "mt-2 text-xs text-zinc-600"
            : "mt-2 text-xs text-zinc-500"
        }
      >
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

interface DetailCardProps {
  label: string;
  value: string;
  isDark: boolean;
}

function DetailCard({
  label,
  value,
  isDark,
}: DetailCardProps) {
  return (
    <div
      className={
        isDark
          ? "rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          : "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      }
    >
      <p
        className={
          isDark
            ? "text-[10px] uppercase tracking-wider text-zinc-600"
            : "text-[10px] uppercase tracking-wider text-zinc-500"
        }
      >
        {label}
      </p>

      <p
        className={
          isDark
            ? "mt-2 truncate text-sm font-medium text-zinc-200"
            : "mt-2 truncate text-sm font-medium text-zinc-800"
        }
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TAG
========================================================= */

interface TagProps {
  text: string;
  isDark: boolean;
}

function Tag({
  text,
  isDark,
}: TagProps) {
  return (
    <span
      className={
        isDark
          ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-400"
          : "rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-600 shadow-sm"
      }
    >
      {text}
    </span>
  );
}