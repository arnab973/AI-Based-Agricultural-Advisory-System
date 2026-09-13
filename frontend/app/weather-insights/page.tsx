"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import Farmland3D from "../../components/Farmland3D";
import { useTheme } from "@/context/ThemeContext";

import {
  AlertCircle,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  Thermometer,
  Wind,
  Navigation,
  CloudLightning,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FlaskConical,
  Tractor,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

type WeatherData = {
  temperature: number | null;
  feels_like: number | null;
  humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  condition: string;
};

function convertTemperature(value: number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // Kelvin → Celsius
  if (value > 150) {
    return Number((value - 273.15).toFixed(1));
  }

  return Number(value.toFixed(1));
}

function WeatherIcon({ condition }: { condition: string }) {
  const text = condition.toLowerCase();

  if (
    text.includes("thunder") ||
    text.includes("storm")
  ) {
    return <CloudLightning className="h-14 w-14 sm:h-20 sm:w-20" />;
  }

  if (
    text.includes("rain") ||
    text.includes("drizzle")
  ) {
    return <CloudRain className="h-14 w-14 sm:h-20 sm:w-20" />;
  }

  if (
    text.includes("cloud") ||
    text.includes("overcast") ||
    text.includes("broken")
  ) {
    return <Cloud className="h-14 w-14 sm:h-20 sm:w-20" />;
  }

  if (
    text.includes("clear") ||
    text.includes("sunny") ||
    text.includes("sun")
  ) {
    return <Sun className="h-14 w-14 sm:h-20 sm:w-20" />;
  }

  return <CloudSun className="h-14 w-14 sm:h-20 sm:w-20" />;
}

export default function WeatherInsightsPage() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [location, setLocation] =
    useState("Current Location");

  /* =========================
     THEME STYLES
  ========================= */

  const themeStyles = {
    page: isDark
      ? "bg-[#06110a] text-white"
      : "bg-[#f3f8f3] text-[#142117]",

    overlay: isDark
      ? "bg-gradient-to-br from-[#03170a]/70 via-[#06110a]/80 to-[#02150e]/90"
      : "bg-gradient-to-br from-[#e9f8ec]/80 via-[#f5faf5]/85 to-[#e3f3e8]/80",

    primaryText: isDark
      ? "text-white"
      : "text-[#142117]",

    secondaryText: isDark
      ? "text-white/55"
      : "text-[#526557]",

    mutedText: isDark
      ? "text-white/35"
      : "text-[#78897c]",

    border: isDark
      ? "border-white/10"
      : "border-[#c8dfce]",

    card: isDark
      ? "border-white/10 bg-[#08170e]/70"
      : "border-[#c8dfce] bg-white/85 shadow-[0_10px_30px_rgba(30,80,45,0.08)]",

    softCard: isDark
      ? "border-white/10 bg-white/[0.025]"
      : "border-[#d9e8dc] bg-white/80 shadow-[0_8px_25px_rgba(30,80,45,0.06)]",

    innerCard: isDark
      ? "border-white/[0.07] bg-white/[0.035]"
      : "border-[#d9e8dc] bg-[#f8fcf8]",

    hero: isDark
      ? "border-green-400/20 bg-gradient-to-br from-green-400/[0.14] via-emerald-500/[0.08] to-transparent"
      : "border-green-500/20 bg-gradient-to-br from-green-100 via-emerald-50 to-white shadow-[0_15px_40px_rgba(40,120,65,0.10)]",

    buttonSoft: isDark
      ? "border-white/10 bg-white/5 text-white/70 hover:border-green-400/30 hover:bg-white/[0.08]"
      : "border-[#c8dfce] bg-white text-[#526557] hover:border-green-400 hover:text-green-700 hover:bg-green-50",

    location: isDark
      ? "border-white/10 bg-white/[0.04]"
      : "border-[#c8dfce] bg-white/75",

    insight: isDark
      ? "border-green-400/20 bg-gradient-to-br from-green-400/[0.10] to-emerald-500/[0.03]"
      : "border-green-400/25 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-[0_12px_35px_rgba(40,120,65,0.08)]",
  };

  /* =========================
     FETCH WEATHER
  ========================= */

  const fetchWeather = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Your browser does not support location services."
      );

      setLoading(false);
      setRefreshing(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const response = await fetch(
            `${API_URL}/weather/current`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.detail ||
                "Unable to fetch weather information."
            );
          }

          if (
            !data?.success ||
            !data?.weather
          ) {
            throw new Error(
              "Weather data is unavailable."
            );
          }

          setWeather(data.weather);

          setLocation(
            `Latitude: ${latitude.toFixed(
              2
            )}, Longitude: ${longitude.toFixed(
              2
            )}`
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while fetching weather."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },

      (geoError) => {
        let message =
          "Unable to access your location.";

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          message =
            "Location permission denied. Please allow location access.";
        } else if (
          geoError.code ===
          geoError.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location could not be determined.";
        } else if (
          geoError.code ===
          geoError.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again.";
        }

        setError(message);
        setLoading(false);
        setRefreshing(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  /* =========================
     VALUES
  ========================= */

  const temperature = weather
    ? convertTemperature(
        weather.temperature
      )
    : null;

  const feelsLike = weather
    ? convertTemperature(
        weather.feels_like
      )
    : null;

  /* =========================
     AGRICULTURAL INSIGHT
  ========================= */

  const getInsight = () => {
    if (
      !weather ||
      temperature === null
    ) {
      return {
        title: "Weather Monitoring",
        message:
          "Weather information is currently being monitored.",
      };
    }

    const condition =
      weather.condition.toLowerCase();

    if (
      condition.includes("rain") ||
      condition.includes("drizzle")
    ) {
      return {
        title: "Rainfall Advisory",
        message:
          "Rainfall can provide natural irrigation. Avoid unnecessary watering and ensure proper drainage in your fields.",
      };
    }

    if (temperature >= 35) {
      return {
        title: "Heat Stress Alert",
        message:
          "High temperatures may cause crop stress. Water crops during early morning or evening to reduce evaporation.",
      };
    }

    if (
      weather.humidity !== null &&
      weather.humidity >= 80
    ) {
      return {
        title: "High Humidity Alert",
        message:
          "High humidity may increase the risk of fungal diseases. Monitor crops regularly and maintain proper airflow.",
      };
    }

    if (
      weather.wind_speed !== null &&
      weather.wind_speed >= 8
    ) {
      return {
        title: "Strong Wind Alert",
        message:
          "Strong winds may affect spraying operations. Avoid pesticide spraying until wind conditions become safer.",
      };
    }

    return {
      title: "Good Farming Conditions",
      message:
        "Current weather conditions appear suitable for regular farming activities.",
    };
  };

  const insight = getInsight();

  /* =========================
     TODAY'S FARMING DECISIONS
  ========================= */

  type FarmingDecision = {
    title: string;
    status: "Good" | "Caution" | "Avoid";
    reason: string;
    icon: ReactNode;
  };

  const getFarmingDecisions = (): FarmingDecision[] => {
    if (!weather || temperature === null) return [];

    const condition = weather.condition.toLowerCase();
    const isRainy = condition.includes("rain") || condition.includes("drizzle") || condition.includes("storm") || condition.includes("thunder");
    const isStorm = condition.includes("storm") || condition.includes("thunder");
    const humidity = weather.humidity ?? 0;
    const wind = weather.wind_speed ?? 0;

    const irrigation: FarmingDecision = isRainy
      ? { title: "Irrigation", status: "Avoid", reason: "Rainy conditions are present. Avoid unnecessary irrigation and check field drainage.", icon: <Droplets className="h-6 w-6" /> }
      : temperature >= 35
      ? { title: "Irrigation", status: "Caution", reason: "High temperature can increase water loss. Monitor soil moisture and irrigate during cooler hours if needed.", icon: <Droplets className="h-6 w-6" /> }
      : { title: "Irrigation", status: "Good", reason: "No rainfall signal is detected and the temperature is moderate. Check soil moisture before irrigating.", icon: <Droplets className="h-6 w-6" /> };

    const spraying: FarmingDecision = isStorm || isRainy || wind >= 5 || humidity >= 85
      ? { title: "Pesticide Spray", status: "Avoid", reason: isRainy ? "Rain can wash away spray and reduce effectiveness. Wait for a dry weather window." : wind >= 5 ? "Wind speed is relatively high. Avoid spraying until wind conditions are calmer." : "High humidity can make spraying less suitable. Wait for a more favorable weather window.", icon: <FlaskConical className="h-6 w-6" /> }
      : { title: "Pesticide Spray", status: "Good", reason: "Current weather is relatively calm and dry. Follow the crop-specific product label before spraying.", icon: <FlaskConical className="h-6 w-6" /> };

    const fertilizer: FarmingDecision = isStorm || isRainy
      ? { title: "Fertilizer", status: "Caution", reason: "Rainy conditions can increase nutrient loss. Consider waiting for a suitable dry window.", icon: <Sprout className="h-6 w-6" /> }
      : temperature >= 35
      ? { title: "Fertilizer", status: "Caution", reason: "High heat can stress crops. Apply fertilizer according to crop needs during cooler conditions.", icon: <Sprout className="h-6 w-6" /> }
      : { title: "Fertilizer", status: "Good", reason: "Current temperature is suitable for routine field management. Follow crop-specific fertilizer guidance.", icon: <Sprout className="h-6 w-6" /> };

    const fieldWork: FarmingDecision = isStorm
      ? { title: "Field Work", status: "Avoid", reason: "Thunderstorm conditions can make outdoor farm work unsafe. Wait until conditions improve.", icon: <Tractor className="h-6 w-6" /> }
      : isRainy || wind >= 8 || temperature >= 38
      ? { title: "Field Work", status: "Caution", reason: "Current weather may make outdoor work difficult. Plan field activities around safer conditions.", icon: <Tractor className="h-6 w-6" /> }
      : { title: "Field Work", status: "Good", reason: "Current conditions are generally suitable for routine outdoor farm activities.", icon: <Tractor className="h-6 w-6" /> };

    return [irrigation, spraying, fertilizer, fieldWork];
  };

  const farmingDecisions = getFarmingDecisions();

  const getDecisionStyles = (status: FarmingDecision["status"]) => {
    if (status === "Good") return { badge: isDark ? "border-green-400/20 bg-green-400/10 text-green-400" : "border-green-200 bg-green-50 text-green-700", icon: <CheckCircle2 className="h-4 w-4" />, dot: "bg-green-500" };
    if (status === "Avoid") return { badge: isDark ? "border-red-400/20 bg-red-400/10 text-red-400" : "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-4 w-4" />, dot: "bg-red-500" };
    return { badge: isDark ? "border-amber-400/20 bg-amber-400/10 text-amber-400" : "border-amber-200 bg-amber-50 text-amber-700", icon: <AlertTriangle className="h-4 w-4" />, dot: "bg-amber-500" };
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <main
        className={`relative flex min-h-screen items-center justify-center overflow-hidden transition-colors duration-500 ${themeStyles.page}`}
      >
        {isDark && <Farmland3D />}

        <div
          className={`pointer-events-none fixed inset-0 ${themeStyles.overlay}`}
        />

        <div className="relative z-10 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border backdrop-blur-2xl ${themeStyles.card}`}
          >
            <Loader2 className="h-9 w-9 animate-spin text-green-500" />
          </div>

          <h2
            className={`mt-6 text-2xl font-bold ${themeStyles.primaryText}`}
          >
            Getting Live Weather
          </h2>

          <p
            className={`mt-2 ${themeStyles.secondaryText}`}
          >
            Detecting your location...
          </p>
        </div>
      </main>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error && !weather) {
    return (
      <main
        className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 transition-colors duration-500 ${themeStyles.page}`}
      >
        {isDark && <Farmland3D />}

        <div
          className={`pointer-events-none fixed inset-0 ${themeStyles.overlay}`}
        />

        <div
          className={`relative z-10 w-full max-w-md rounded-3xl border p-8 text-center backdrop-blur-2xl ${themeStyles.card}`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertCircle className="h-9 w-9 text-red-500" />
          </div>

          <h2
            className={`mt-5 text-xl font-bold ${themeStyles.primaryText}`}
          >
            Weather Unavailable
          </h2>

          <p
            className={`mt-3 leading-relaxed ${themeStyles.secondaryText}`}
          >
            {error}
          </p>

          <button
            onClick={fetchWeather}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-3 font-semibold text-[#03150b] transition hover:scale-[1.03]"
          >
            <RefreshCw className="h-4 w-4" />

            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* =========================
     MAIN PAGE
  ========================= */

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${themeStyles.page}`}
    >
      {/* SAME DASHBOARD BACKGROUND */}

      {isDark && <Farmland3D />}

      <div
        className={`pointer-events-none fixed inset-0 transition-colors duration-500 ${themeStyles.overlay}`}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">

        {/* ================= HEADER ================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">
                Live Weather Intelligence
              </span>
            </div>

            <h1
              className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${themeStyles.primaryText}`}
            >
              Weather{" "}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>

            <p
              className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${themeStyles.secondaryText}`}
            >
              Real-time weather intelligence to help
              you make smarter farming decisions.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`group flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold backdrop-blur-xl transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 ${themeStyles.buttonSoft}`}
          >
            <RefreshCw
              className={`h-4 w-4 text-green-500 transition-transform duration-500 ${
                refreshing
                  ? "animate-spin"
                  : "group-hover:rotate-180"
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Weather"}
          </button>
        </motion.div>

        {/* ================= LOCATION ================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
          }}
          className={`mt-6 inline-flex max-w-full items-center gap-2 rounded-xl border px-4 py-2 text-sm backdrop-blur-xl ${themeStyles.location}`}
        >
          <MapPin className="h-4 w-4 shrink-0 text-green-500" />

          <span
            className={`truncate ${themeStyles.secondaryText}`}
          >
            {location}
          </span>

          <span
            className={`hidden sm:inline ${themeStyles.mutedText}`}
          >
            •
          </span>

          <span className="hidden text-green-600 sm:inline">
            Live Data
          </span>
        </motion.div>

        {/* ================= HERO WEATHER ================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.1,
          }}
          className={`relative mt-6 overflow-hidden rounded-[2rem] border p-5 backdrop-blur-2xl sm:p-8 lg:p-10 ${themeStyles.hero}`}
        >
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-400/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">

            {/* MAIN WEATHER */}

            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.9)]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">
                  Current Conditions
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">

                {/* ICON */}

                <div
                  className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border text-green-500 backdrop-blur-xl ${
                    isDark
                      ? "border-white/10 bg-white/[0.06]"
                      : "border-green-200 bg-white/70 shadow-lg"
                  }`}
                >
                  <WeatherIcon
                    condition={
                      weather?.condition || ""
                    }
                  />
                </div>

                {/* TEMPERATURE */}

                <div>
                  <div className="flex items-start">
                    <h2
                      className={`text-6xl font-bold tracking-tight sm:text-7xl ${themeStyles.primaryText}`}
                    >
                      {temperature ?? "--"}
                    </h2>

                    <span className="mt-2 text-2xl font-semibold text-green-500">
                      °C
                    </span>
                  </div>

                  <p
                    className={`mt-1 text-lg capitalize ${themeStyles.secondaryText}`}
                  >
                    {weather?.condition ||
                      "Unknown"}
                  </p>

                  <div
                    className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${themeStyles.innerCard}`}
                  >
                    <Thermometer className="h-4 w-4 text-orange-500" />

                    <span
                      className={
                        themeStyles.secondaryText
                      }
                    >
                      Feels like
                    </span>

                    <span
                      className={`font-bold ${themeStyles.primaryText}`}
                    >
                      {feelsLike ?? "--"}°C
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}

            <div className="grid grid-cols-2 gap-3 sm:gap-4">

              {/* HUMIDITY */}

              <div
                className={`rounded-3xl border p-5 backdrop-blur-xl ${themeStyles.innerCard}`}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10">
                    <Droplets className="h-5 w-5 text-cyan-500" />
                  </div>

                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                </div>

                <p
                  className={`mt-5 text-xs uppercase tracking-wider ${themeStyles.mutedText}`}
                >
                  Humidity
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${themeStyles.primaryText}`}
                >
                  {weather?.humidity ?? "--"}%
                </p>
              </div>

              {/* WIND */}

              <div
                className={`rounded-3xl border p-5 backdrop-blur-xl ${themeStyles.innerCard}`}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/10">
                    <Wind className="h-5 w-5 text-green-500" />
                  </div>

                  <span className="h-2 w-2 rounded-full bg-green-500" />
                </div>

                <p
                  className={`mt-5 text-xs uppercase tracking-wider ${themeStyles.mutedText}`}
                >
                  Wind Speed
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${themeStyles.primaryText}`}
                >
                  {weather?.wind_speed ?? "--"}

                  <span
                    className={`ml-1 text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    m/s
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ================= WEATHER DETAILS ================= */}

        <section className="mt-8">

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-600">
                Weather Metrics
              </p>

              <h2
                className={`mt-2 text-xl font-semibold sm:text-2xl ${themeStyles.primaryText}`}
              >
                Detailed Overview
              </h2>
            </div>

            <Navigation className="hidden h-6 w-6 text-green-500 sm:block" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 min-[450px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">

            {/* TEMPERATURE */}

            <motion.div
              whileHover={{
                y: -5,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl transition ${themeStyles.card}`}
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-400/10">
                  <Thermometer className="h-6 w-6 text-orange-500" />
                </div>

                <span className="h-2 w-2 rounded-full bg-orange-400" />
              </div>

              <p
                className={`mt-5 text-xs uppercase tracking-wider ${themeStyles.mutedText}`}
              >
                Temperature
              </p>

              <h3
                className={`mt-2 text-3xl font-bold ${themeStyles.primaryText}`}
              >
                {temperature ?? "--"}°C
              </h3>

              <p className="mt-2 text-xs text-green-600">
                Current temperature
              </p>
            </motion.div>

            {/* HUMIDITY */}

            <motion.div
              whileHover={{
                y: -5,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl transition ${themeStyles.card}`}
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10">
                  <Droplets className="h-6 w-6 text-cyan-500" />
                </div>

                <span className="h-2 w-2 rounded-full bg-cyan-400" />
              </div>

              <p
                className={`mt-5 text-xs uppercase tracking-wider ${themeStyles.mutedText}`}
              >
                Humidity
              </p>

              <h3
                className={`mt-2 text-3xl font-bold ${themeStyles.primaryText}`}
              >
                {weather?.humidity ?? "--"}%
              </h3>

              <p className="mt-2 text-xs text-green-600">
                Atmospheric moisture
              </p>
            </motion.div>

            {/* WIND */}

            <motion.div
              whileHover={{
                y: -5,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl transition ${themeStyles.card}`}
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-400/10">
                  <Wind className="h-6 w-6 text-green-500" />
                </div>

                <span className="h-2 w-2 rounded-full bg-green-500" />
              </div>

              <p
                className={`mt-5 text-xs uppercase tracking-wider ${themeStyles.mutedText}`}
              >
                Wind Speed
              </p>

              <h3
                className={`mt-2 text-3xl font-bold ${themeStyles.primaryText}`}
              >
                {weather?.wind_speed ?? "--"}

                <span
                  className={`ml-1 text-sm font-medium ${themeStyles.secondaryText}`}
                >
                  m/s
                </span>
              </h3>

              <p className="mt-2 text-xs text-green-600">
                Current wind movement
              </p>
            </motion.div>

            {/* PRESSURE */}

            <motion.div
              whileHover={{
                y: -5,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl transition ${themeStyles.card}`}
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-400/10">
                  <Gauge className="h-6 w-6 text-purple-500" />
                </div>

                <span className="h-2 w-2 rounded-full bg-purple-400" />
              </div>

              <p
                className={`mt-5 text-xs uppercase tracking-wider ${themeStyles.mutedText}`}
              >
                Pressure
              </p>

              <h3
                className={`mt-2 text-3xl font-bold ${themeStyles.primaryText}`}
              >
                {weather?.pressure ?? "--"}

                <span
                  className={`ml-1 text-sm font-medium ${themeStyles.secondaryText}`}
                >
                  hPa
                </span>
              </h3>

              <p className="mt-2 text-xs text-green-600">
                Atmospheric pressure
              </p>
            </motion.div>
          </div>
        </section>

        {/* ================= TODAY'S FARMING DECISIONS ================= */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="mt-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-600">
                Weather-Based Recommendations
              </p>
              <h2 className={`mt-2 text-xl font-semibold sm:text-2xl ${themeStyles.primaryText}`}>
                Today's Farming Decisions
              </h2>
              <p className={`mt-2 max-w-2xl text-sm leading-6 ${themeStyles.secondaryText}`}>
                Quick guidance based on the current temperature, humidity, wind and weather condition.
              </p>
            </div>

            <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex ${themeStyles.softCard}`}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Live weather-based advice
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {farmingDecisions.map((decision, index) => {
              const styles = getDecisionStyles(decision.status);
              return (
                <motion.div
                  key={decision.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + index * 0.06 }}
                  whileHover={{ y: -5 }}
                  className={`rounded-3xl border p-5 backdrop-blur-xl transition ${themeStyles.card}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${decision.status === "Good" ? "bg-green-400/10 text-green-500" : decision.status === "Avoid" ? "bg-red-400/10 text-red-500" : "bg-amber-400/10 text-amber-500"}`}>
                      {decision.icon}
                    </div>
                    <span className={`mt-2 h-2 w-2 rounded-full ${styles.dot}`} />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <h3 className={`text-lg font-bold ${themeStyles.primaryText}`}>
                      {decision.title}
                    </h3>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                      {styles.icon}
                      {decision.status}
                    </span>
                  </div>

                  <p className={`mt-3 text-sm leading-6 ${themeStyles.secondaryText}`}>
                    {decision.reason}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 text-xs leading-5 ${themeStyles.softCard}`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className={themeStyles.mutedText}>
              These are general weather-based suggestions. Always consider your crop, soil moisture, local conditions and product instructions before taking farm actions.
            </p>
          </div>
        </motion.section>

        {/* ================= AGRICULTURAL INSIGHT ================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className={`relative mt-8 overflow-hidden rounded-3xl border p-6 backdrop-blur-xl sm:p-8 ${themeStyles.insight}`}
        >
          <div className="absolute -right-10 -bottom-10 text-[180px] opacity-[0.03]">
            🌾
          </div>

          <div className="relative flex flex-col gap-5 sm:flex-row">

            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl border border-green-400/20 bg-green-400/10">
              <Sprout className="h-8 w-8 text-green-500" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />

                AI Agricultural Advisory
              </div>

              <h2
                className={`mt-3 text-2xl font-bold sm:text-3xl ${themeStyles.primaryText}`}
              >
                {insight.title}
              </h2>

              <p
                className={`mt-3 max-w-3xl text-sm leading-7 sm:text-base ${themeStyles.secondaryText}`}
              >
                {insight.message}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ================= REFRESH ERROR ================= */}

        {error && weather && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        <div className="h-8" />
      </div>
    </main>
  );
}