"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

type InsightCard = {
  title: string;
  description: string;
  icon: string;
  path: string;
  badge: string;
};

export default function InsightsPage() {
  const router = useRouter();

  const { t } = useLanguage();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * ============================
   * TRANSLATION HELPER
   * ============================
   */

  const text = (
    key: string,
    fallback: string
  ) => {
    const translated = t(key);

    return translated === key
      ? fallback
      : translated;
  };

  /*
   * ============================
   * THEME STYLES
   * ============================
   */

  const themeStyles = {
    page: isDark
      ? "bg-[#06110a] text-white"
      : "bg-[#f3f8f3] text-[#142117]",

    overlay: isDark
      ? "bg-gradient-to-br from-[#03170a]/70 via-[#06110a]/80 to-[#02150e]/90"
      : "bg-gradient-to-br from-[#e9f8ec]/80 via-[#f5faf5]/85 to-[#e3f3e8]/80",

    header: isDark
      ? "border-white/10 bg-[#06120b]/70"
      : "border-[#c8dfce] bg-white/80 shadow-sm",

    primaryText: isDark
      ? "text-white"
      : "text-[#142117]",

    secondaryText: isDark
      ? "text-white/55"
      : "text-[#526557]",

    mutedText: isDark
      ? "text-white/35"
      : "text-[#78897c]",

    card: isDark
      ? "border-white/10 bg-[#08170e]/75"
      : "border-[#c8dfce] bg-white/85 shadow-[0_10px_35px_rgba(30,80,45,0.08)]",

    cardHover: isDark
      ? "hover:border-green-400/30 hover:bg-[#0b1d11]"
      : "hover:border-green-400 hover:bg-white",

    iconBg: isDark
      ? "bg-white/[0.045]"
      : "bg-green-50",

    hero: isDark
      ? "border-green-400/15 bg-gradient-to-br from-green-400/[0.12] via-emerald-500/[0.06] to-transparent"
      : "border-green-500/20 bg-gradient-to-br from-green-100 via-emerald-50 to-white shadow-[0_15px_40px_rgba(40,120,65,0.10)]",

    button: isDark
      ? "border-white/10 bg-white/5 text-white/70 hover:border-green-400/30 hover:text-green-300"
      : "border-[#c8dfce] bg-white text-[#526557] hover:border-green-400 hover:text-green-700",

    divider: isDark
      ? "bg-white/[0.07]"
      : "bg-[#d9e8dc]",
  };

  /*
   * ============================
   * INSIGHT DATA
   * ============================
   */

  const insights: InsightCard[] = [
    {
      title: text(
        "weatherInsights",
        "Weather Insights"
      ),
      description: text(
        "weatherInsightsDescription",
        "Monitor current weather conditions and understand how weather can affect your farming activities."
      ),
      icon: "☀️",
      path: "/weather-insights",
      badge: text(
        "weather",
        "Weather"
      ),
    },

    {
      title: text(
        "marketPriceInsights",
        "Market Price Insights"
      ),
      description: text(
        "marketPriceInsightsDescription",
        "Check the latest crop prices from markets across India and make better selling decisions."
      ),
      icon: "📈",
      path: "/market-prices",
      badge: text(
        "market",
        "Market"
      ),
    },

    {
      title: text(
        "cropHealthInsights",
        "Crop Health Insights"
      ),
      description: text(
        "cropHealthInsightsDescription",
        "Upload a crop image and get AI-powered disease detection, health score and recommendations."
      ),
      icon: "🌱",
      path: "/crop_health",
      badge: text(
        "cropHealth",
        "Crop Health"
      ),
    },

    {
      title: text(
        "aiFarmingInsights",
        "AI Farming Insights"
      ),
      description: text(
        "aiFarmingInsightsDescription",
        "Ask the AI assistant about crops, diseases, soil, irrigation and farming practices."
      ),
      icon: "🤖",
      path: "/chat",
      badge: text(
        "aiAssistant",
        "AI Assistant"
      ),
    },
  ];

  /*
   * ============================
   * QUICK NAVIGATION
   * ============================
   */

  const goBack = () => {
    router.push("/dashboard");
  };

  /*
   * ============================
   * PAGE
   * ============================
   */

  if (!mounted) {
    return (
      <main className="min-h-[100dvh] bg-[#06110a]" />
    );
  }

  return (
    <main
      className={`relative min-h-[100dvh] overflow-x-hidden transition-colors duration-500 ${themeStyles.page}`}
    >
      {/* BACKGROUND */}

      <div
        className={`pointer-events-none fixed inset-0 transition-colors duration-500 ${themeStyles.overlay}`}
      />

      {/* GLOW EFFECTS */}

      <div className="pointer-events-none fixed -left-32 top-24 h-72 w-72 rounded-full bg-green-400/10 blur-3xl" />

      <div className="pointer-events-none fixed -right-32 bottom-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* ============================
          HEADER
      ============================ */}

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors duration-500 ${themeStyles.header}`}
      >
        <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[76px] sm:px-8 lg:px-10">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">

            <button
              onClick={goBack}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-lg transition ${themeStyles.button}`}
              aria-label="Back to dashboard"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-green-500 sm:text-[10px] sm:tracking-[0.2em]">
                {text(
                  "agriculturalIntelligence",
                  "Agricultural Intelligence"
                )}
              </p>

              <h1
                className={`truncate text-base font-bold sm:text-xl ${themeStyles.primaryText}`}
              >
                {text(
                  "exploreInsights",
                  "Explore Insights"
                )}
              </h1>
            </div>
          </div>

          {/* RIGHT */}

          <button
            onClick={() =>
              router.push("/chat")
            }
            className="hidden shrink-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#03150b] shadow-[0_0_25px_rgba(34,255,136,0.2)] transition hover:scale-[1.03] sm:block"
          >
            {text(
              "askAI",
              "Ask AI"
            )}{" "}
            ✦
          </button>

          <button
            onClick={() =>
              router.push("/chat")
            }
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-[#03150b] sm:hidden"
            aria-label="Ask AI"
          >
            ✦
          </button>
        </div>
      </header>

      {/* ============================
          CONTENT
      ============================ */}

      <div className="relative z-10">

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">

          {/* ============================
              HERO
          ============================ */}

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
              duration: 0.6,
            }}
            className={`relative overflow-hidden rounded-[1.5rem] border p-5 transition-colors duration-500 sm:rounded-[2rem] sm:p-8 lg:p-10 ${themeStyles.hero}`}
          >
            {/* DECORATION */}

            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-400/10 blur-3xl sm:h-56 sm:w-56" />

            <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative max-w-4xl">

              {/* BADGE */}

              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-green-600 sm:text-[10px] sm:tracking-[0.16em]">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500" />

                <span className="truncate">
                  {text(
                    "smartFarmingInsights",
                    "Smart Farming Insights"
                  )}
                </span>
              </div>

              {/* TITLE */}

              <h2
                className={`mt-4 text-3xl font-bold leading-tight sm:mt-5 sm:text-4xl lg:text-5xl ${themeStyles.primaryText}`}
              >
                {text(
                  "makeBetterFarmingDecisions",
                  "Make better farming decisions."
                )}
              </h2>

              {/* DESCRIPTION */}

              <p
                className={`mt-4 max-w-3xl text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7 ${themeStyles.secondaryText}`}
              >
                {text(
                  "exploreInsightsDescription",
                  "Access weather intelligence, market prices, crop health analysis and AI-powered agricultural guidance from one place."
                )}
              </p>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">

                <button
                  onClick={() =>
                    router.push("/chat")
                  }
                  className="w-full rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3.5 text-sm font-bold text-[#03150b] shadow-[0_0_30px_rgba(34,255,136,0.2)] transition hover:scale-[1.02] sm:w-auto"
                >
                  {text(
                    "askAI",
                    "Ask AI"
                  )}{" "}
                  ✦
                </button>

                <button
                  onClick={goBack}
                  className={`w-full rounded-2xl border px-6 py-3.5 text-sm font-medium backdrop-blur-xl transition ${themeStyles.button} sm:w-auto`}
                >
                  ←{" "}
                  {text(
                    "dashboard",
                    "Dashboard"
                  )}
                </button>

              </div>
            </div>
          </motion.section>

          {/* ============================
              SECTION TITLE
          ============================ */}

          <section className="mt-8 sm:mt-10">

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-500">
                {text(
                  "insights",
                  "Insights"
                )}
              </p>

              <h2
                className={`mt-2 text-xl font-semibold sm:text-2xl ${themeStyles.primaryText}`}
              >
                {text(
                  "everythingYouNeed",
                  "Everything you need for smarter farming"
                )}
              </h2>

              <p
                className={`mt-2 max-w-2xl text-sm leading-6 ${themeStyles.secondaryText}`}
              >
                {text(
                  "insightsSectionDescription",
                  "Choose an insight to explore real-time information and AI-powered recommendations."
                )}
              </p>
            </motion.div>

            {/* ============================
                INSIGHT CARDS
            ============================ */}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">

              {insights.map(
                (item, index) => (
                  <motion.button
                    key={item.title}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        0.2 +
                        index * 0.08,
                    }}
                    whileHover={{
                      y: -6,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() =>
                      router.push(
                        item.path
                      )
                    }
                    className={`group relative min-w-0 overflow-hidden rounded-3xl border p-5 text-left backdrop-blur-xl transition-all duration-300 sm:p-6 ${themeStyles.card} ${themeStyles.cardHover}`}
                  >

                    {/* CARD GLOW */}

                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-400/5 blur-2xl transition group-hover:bg-green-400/10" />

                    <div className="relative">

                      {/* ICON + BADGE */}

                      <div className="flex items-start justify-between gap-3">

                        <div
                          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-105 ${themeStyles.iconBg}`}
                        >
                          {item.icon}
                        </div>

                        <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-green-600">
                          {item.badge}
                        </span>

                      </div>

                      {/* TITLE */}

                      <h3
                        className={`mt-6 text-lg font-semibold ${themeStyles.primaryText}`}
                      >
                        {item.title}
                      </h3>

                      {/* DESCRIPTION */}

                      <p
                        className={`mt-2 min-h-[72px] text-sm leading-6 ${themeStyles.secondaryText}`}
                      >
                        {item.description}
                      </p>

                      {/* OPEN */}

                      <div className="mt-6 flex items-center justify-between">

                        <span className="text-sm font-semibold text-green-600">
                          {text(
                            "open",
                            "Open"
                          )}
                        </span>

                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-400/10 text-green-600 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>

                      </div>

                    </div>
                  </motion.button>
                )
              )}

            </div>
          </section>

          {/* ============================
              SYSTEM STATUS
          ============================ */}

          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
            }}
            className={`mt-8 overflow-hidden rounded-3xl border p-5 backdrop-blur-xl sm:mt-10 sm:p-6 ${themeStyles.card}`}
          >

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <p className="text-xs uppercase tracking-[0.16em] text-green-500">
                  {text(
                    "systemStatus",
                    "System Status"
                  )}
                </p>

                <h3
                  className={`mt-2 text-lg font-semibold sm:text-xl ${themeStyles.primaryText}`}
                >
                  {text(
                    "agriAiEngine",
                    "AgriAI Engine"
                  )}
                </h3>

                <p
                  className={`mt-2 max-w-2xl text-sm leading-6 ${themeStyles.secondaryText}`}
                >
                  {text(
                    "agriAiEngineDescription",
                    "Your agricultural intelligence tools are available for weather, market prices, crop health and AI consultation."
                  )}
                </p>

              </div>

              <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-xs text-green-600 sm:self-center">

                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                {text(
                  "online",
                  "Online"
                )}

              </div>

            </div>

            {/* STATUS ITEMS */}

            <div
              className={`my-5 h-px ${themeStyles.divider}`}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {[
                [
                  "🤖",
                  text(
                    "aiAssistant",
                    "AI Assistant"
                  ),
                  text(
                    "ready",
                    "Ready"
                  ),
                ],
                [
                  "🌦️",
                  text(
                    "weather",
                    "Weather"
                  ),
                  text(
                    "connected",
                    "Connected"
                  ),
                ],
                [
                  "📈",
                  text(
                    "market",
                    "Market"
                  ),
                  text(
                    "available",
                    "Available"
                  ),
                ],
                [
                  "🌱",
                  text(
                    "cropHealth",
                    "Crop Health"
                  ),
                  text(
                    "ready",
                    "Ready"
                  ),
                ],
              ].map(
                ([icon, label, status]) => (
                  <div
                    key={label}
                    className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${themeStyles.iconBg} ${
                      isDark
                        ? "border-white/[0.06]"
                        : "border-[#d9e8dc]"
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-400/10">
                      {icon}
                    </span>

                    <div className="min-w-0">

                      <p
                        className={`truncate text-xs font-medium ${themeStyles.primaryText}`}
                      >
                        {label}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {status}
                      </p>

                    </div>
                  </div>
                )
              )}

            </div>

          </motion.section>

          {/* ============================
              BOTTOM
          ============================ */}

          <section className="mt-8 pb-8 sm:mt-10 sm:pb-10">

            <div
              className={`rounded-3xl border p-5 text-center backdrop-blur-xl sm:p-7 ${themeStyles.card}`}
            >

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-400/10 text-2xl">
                🌾
              </div>

              <h3
                className={`mt-4 text-lg font-semibold sm:text-xl ${themeStyles.primaryText}`}
              >
                {text(
                  "smartFarmingBetterDecisions",
                  "Smart farming. Better decisions."
                )}
              </h3>

              <p
                className={`mx-auto mt-2 max-w-2xl text-sm leading-6 ${themeStyles.secondaryText}`}
              >
                {text(
                  "smartFarmingFooterDescription",
                  "Use AI-powered agricultural intelligence to understand your crops, weather, market conditions and farming decisions."
                )}
              </p>

              <button
                onClick={() =>
                  router.push("/chat")
                }
                className="mt-5 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3 text-sm font-bold text-[#03150b] shadow-[0_0_25px_rgba(34,255,136,0.2)] transition hover:scale-[1.02]"
              >
                {text(
                  "startAiConsultation",
                  "Start AI Consultation"
                )}{" "}
                →
              </button>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}