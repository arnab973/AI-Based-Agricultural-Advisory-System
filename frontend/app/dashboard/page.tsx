"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Farmland3D from "../../components/Farmland3D";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const API_URL = "http://127.0.0.1:8001";

/* =========================================================
   TYPES
========================================================= */

type NavItem = {
  id: string;
  labelKey: string;
  fallback: string;
  icon: string;
  path?: string;
};

type ProfileAvatarProps = {
  size?: string;
  textSize?: string;
  rounded?: string;
};

type NotificationType =
  | "weather"
  | "market"
  | "crop"
  | "ai"
  | "system";

type NotificationItem = {
  id: number;
  type: NotificationType;
  icon: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  timestamp?: number;
};

type DashboardWeather = {
  temperature: string;
  condition: string;
  location: string;
};

type DashboardMarket = {
  commodity: string;
  market: string;
  modalPrice: string;
  minPrice: string;
  maxPrice: string;
  unit: string;
  timestamp: number;
};

type DashboardCrop = {
  crop: string;
  status: string;
  disease: string;
  confidence: number;
  healthScore: number;
  timestamp: number;
};

type DashboardConversation = {
  id: number;
  title?: string;
  created_at?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  const router = useRouter();

  const {
    t,
  } = useLanguage();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDark = theme === "dark";

  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [activeItem, setActiveItem] =
    useState("dashboard");

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  /* =======================================================
     REAL DASHBOARD DATA
  ======================================================= */

  const [weatherData, setWeatherData] =
    useState<DashboardWeather | null>(null);

  const [marketData, setMarketData] =
    useState<DashboardMarket | null>(null);

  const [cropData, setCropData] =
    useState<DashboardCrop | null>(null);

  const [conversationCount, setConversationCount] =
    useState(0);

  const [latestConversation, setLatestConversation] =
    useState<DashboardConversation | null>(null);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const accountMenuRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     TEXT HELPER
  ======================================================= */

  const text = (
    key: string,
    fallback: string
  ) => {
    const translated = t(key);

    return translated === key
      ? fallback
      : translated;
  };

  /* =======================================================
     IMAGE URL
  ======================================================= */

  const getFullImageUrl = (
    imagePath: string | null
  ) => {
    if (!imagePath) {
      return "";
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  };

  /* =======================================================
     THEME STYLES
  ======================================================= */

  const themeStyles = {
    page: isDark
      ? "bg-[#06110a] text-white"
      : "bg-[#f3f8f3] text-[#142117]",

    overlay: isDark
      ? "bg-gradient-to-br from-[#03170a]/70 via-[#06110a]/80 to-[#02150e]/90"
      : "bg-gradient-to-br from-[#e9f8ec]/80 via-[#f5faf5]/85 to-[#e3f3e8]/80",

    sidebar: isDark
      ? "border-white/10 bg-[#06120b]/90"
      : "border-[#b9d8c0] bg-white/95 shadow-xl",

    mobileSidebar: isDark
      ? "border-white/10 bg-[#06120b]"
      : "border-[#b9d8c0] bg-white shadow-2xl",

    border: isDark
      ? "border-white/10"
      : "border-[#c8dfce]",

    topbar: isDark
      ? "border-white/10 bg-[#06120b]/90"
      : "border-[#c8dfce] bg-white/95 shadow-sm",

    card: isDark
      ? "border-white/10 bg-[#08170e]/80"
      : "border-[#c8dfce] bg-white/95 shadow-[0_10px_30px_rgba(30,80,45,0.08)]",

    softCard: isDark
      ? "border-white/10 bg-white/[0.035]"
      : "border-[#c8dfce] bg-white/95 shadow-[0_8px_25px_rgba(30,80,45,0.06)]",

    hero: isDark
      ? "border-green-400/15 bg-gradient-to-br from-green-400/[0.12] via-emerald-500/[0.06] to-transparent"
      : "border-green-500/20 bg-gradient-to-br from-green-100 via-emerald-50 to-white shadow-[0_15px_40px_rgba(40,120,65,0.10)]",

    primaryText: isDark
      ? "text-white"
      : "text-[#142117]",

    secondaryText: isDark
      ? "text-white/60"
      : "text-[#526557]",

    mutedText: isDark
      ? "text-white/40"
      : "text-[#78897c]",

    buttonSoft: isDark
      ? "border-white/10 bg-white/5 text-white/70 hover:border-green-400/30 hover:bg-white/[0.08] hover:text-green-300"
      : "border-[#c8dfce] bg-white text-[#526557] hover:border-green-400 hover:bg-green-50 hover:text-green-700",

    menuHover: isDark
      ? "hover:bg-white/[0.06] hover:text-white"
      : "hover:bg-green-50 hover:text-green-800",

    inactiveNav: isDark
      ? "text-white/55"
      : "text-[#607064]",

    popup: isDark
      ? "border-white/15 bg-[#0a1a0f] shadow-[0_25px_90px_rgba(0,0,0,0.75)]"
      : "border-[#b9d8c0] bg-white shadow-[0_25px_80px_rgba(30,80,45,0.25)]",

    innerCard: isDark
      ? "border-white/[0.07] bg-white/[0.035]"
      : "border-[#d9e8dc] bg-[#f8fcf8]",

    accountText: isDark
      ? "text-white"
      : "text-[#142117]",

    accountMuted: isDark
      ? "text-white/40"
      : "text-[#718074]",
  };

  /* =======================================================
     HELPER - SAFE NUMBER
  ======================================================= */

  const safeNumber = (
    value: unknown
  ): number | null => {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string"
    ) {
      const parsed =
        Number(
          value.replace(
            /[^0-9.-]/g,
            ""
          )
        );

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }

    return null;
  };

  /* =======================================================
     HELPER - FIND VALUE
  ======================================================= */

  const getValue = (
    object: any,
    keys: string[]
  ): any => {
    if (!object) {
      return undefined;
    }

    for (const key of keys) {
      if (
        object[key] !==
        undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }

    return undefined;
  };

  /* =======================================================
     HELPER - RELATIVE TIME
  ======================================================= */

  const relativeTime = (
    timestamp?: number
  ) => {
    if (!timestamp) {
      return "Recently";
    }

    const diff =
      Date.now() - timestamp;

    const seconds =
      Math.max(
        0,
        Math.floor(diff / 1000)
      );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} hour${
        hours > 1 ? "s" : ""
      } ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return new Date(
      timestamp
    ).toLocaleDateString();
  };

  /* =======================================================
     LOAD REAL WEATHER
  ======================================================= */

  const loadWeatherData =
    useCallback(async () => {
      if (
        typeof navigator ===
        "undefined"
      ) {
        return;
      }

      if (
        !navigator.geolocation
      ) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            const response =
              await fetch(
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
                  cache: "no-store",
                }
              );

            if (
              !response.ok
            ) {
              throw new Error(
                `Weather API error: ${response.status}`
              );
            }

            const data =
              await response.json();

            const current =
              data?.current ||
              data?.weather ||
              data;

            const temperatureValue =
              getValue(
                current,
                [
                  "temperature",
                  "temp",
                  "temperature_c",
                  "temp_c",
                  "current_temperature",
                ]
              );

            const conditionValue =
              getValue(
                current,
                [
                  "condition",
                  "weather",
                  "description",
                  "weather_description",
                  "main",
                ]
              );

            const locationValue =
              getValue(
                current,
                [
                  "location",
                  "city",
                  "place",
                  "name",
                ]
              );

            const temperature =
  safeNumber(temperatureValue);

const temperatureCelsius =
  temperature !== null
    ? temperature > 100
      ? temperature - 273.15
      : temperature
    : null;

setWeatherData({
  temperature:
    temperatureCelsius !== null
      ? `${Math.round(temperatureCelsius)}°C`
      : "—",
              condition:
                typeof conditionValue ===
                  "string" &&
                conditionValue.trim()
                  ? conditionValue
                  : "Weather available",
              location:
                typeof locationValue ===
                  "string"
                  ? locationValue
                  : "Your farming area",
            });
          } catch (error) {
            console.error(
              "Dashboard weather error:",
              error
            );
          }
        },
        (error) => {
          console.warn(
            "Dashboard weather location permission:",
            error.message
          );
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 10 * 60 * 1000,
        }
      );
    }, []);

  /* =======================================================
     LOCAL STORAGE MARKET DATA
  ======================================================= */

  const readMarketData =
    useCallback(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return null;
      }

      const possibleKeys = [
        "latest_market_price",
        "latestMarketPrice",
        "market_price_result",
        "marketPriceResult",
        "market_result",
        "marketResult",
        "last_market_price",
      ];

      let raw: string | null =
        null;

      for (
        const key of possibleKeys
      ) {
        const value =
          localStorage.getItem(
            key
          );

        if (value) {
          raw = value;
          break;
        }
      }

      if (!raw) {
        return null;
      }

      try {
        const parsed =
          JSON.parse(raw);

        const data =
          parsed?.data ||
          parsed?.result ||
          parsed;

        const commodity =
          getValue(
            data,
            [
              "commodity",
              "Commodity",
              "crop",
              "Crop",
            ]
          );

        const market =
          getValue(
            data,
            [
              "market",
              "Market",
              "market_name",
              "Market_Name",
            ]
          );

        const modal =
          getValue(
            data,
            [
              "modal_price",
              "modalPrice",
              "Modal_Price",
              "Modal",
              "price",
            ]
          );

        const minimum =
          getValue(
            data,
            [
              "min_price",
              "minPrice",
              "Min_Price",
              "Min",
            ]
          );

        const maximum =
          getValue(
            data,
            [
              "max_price",
              "maxPrice",
              "Max_Price",
              "Max",
            ]
          );

        const unit =
          getValue(
            data,
            [
              "unit",
              "Unit",
            ]
          );

        const timestampValue =
          getValue(
            data,
            [
              "timestamp",
              "created_at",
              "updated_at",
              "date",
            ]
          );

        let timestamp =
          Date.now();

        if (
          typeof timestampValue ===
          "number"
        ) {
          timestamp =
            timestampValue < 10000000000
              ? timestampValue *
                1000
              : timestampValue;
        }

        if (
          typeof timestampValue ===
          "string"
        ) {
          const parsedDate =
            Date.parse(
              timestampValue
            );

          if (
            !Number.isNaN(
              parsedDate
            )
          ) {
            timestamp =
              parsedDate;
          }
        }

        if (
          commodity ===
            undefined &&
          modal ===
            undefined
        ) {
          return null;
        }

        return {
          commodity:
            String(
              commodity ||
                "Crop"
            ),
          market:
            String(
              market ||
                "Selected Market"
            ),
          modalPrice:
            modal !==
              undefined
              ? String(
                  modal
                )
              : "—",
          minPrice:
            minimum !==
              undefined
              ? String(
                  minimum
                )
              : "—",
          maxPrice:
            maximum !==
              undefined
              ? String(
                  maximum
                )
              : "—",
          unit:
            String(
              unit ||
                "₹/quintal"
            ),
          timestamp,
        };
      } catch (error) {
        console.error(
          "Market localStorage parsing error:",
          error
        );

        return null;
      }
    }, []);

  /* =======================================================
     LOAD MARKET DATA
  ======================================================= */

  const loadMarketData =
    useCallback(() => {
      const data =
        readMarketData();

      if (data) {
        setMarketData(
          data
        );
      }
    }, [
      readMarketData,
    ]);

  /* =======================================================
     LOAD CROP HEALTH DATA
  ======================================================= */

  const loadCropData =
    useCallback(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const possibleKeys = [
        "latest_crop_health",
        "latestCropHealth",
        "crop_health_result",
        "cropHealthResult",
        "last_crop_health",
      ];

      let raw: string | null =
        null;

      for (
        const key of possibleKeys
      ) {
        const value =
          localStorage.getItem(
            key
          );

        if (value) {
          raw = value;
          break;
        }
      }

      if (!raw) {
        return;
      }

      try {
        const parsed =
          JSON.parse(raw);

        const data =
          parsed?.data ||
          parsed?.result ||
          parsed;

        const crop =
          getValue(
            data,
            [
              "crop",
              "Crop",
            ]
          );

        const status =
          getValue(
            data,
            [
              "status",
              "Status",
            ]
          );

        const disease =
          getValue(
            data,
            [
              "disease",
              "Disease",
            ]
          );

        const confidenceValue =
          getValue(
            data,
            [
              "confidence",
              "Confidence",
            ]
          );

        const healthScoreValue =
          getValue(
            data,
            [
              "health_score",
              "healthScore",
              "Health_Score",
            ]
          );

        const timestampValue =
          getValue(
            data,
            [
              "timestamp",
              "created_at",
              "updated_at",
            ]
          );

        let timestamp =
          Date.now();

        if (
          typeof timestampValue ===
          "number"
        ) {
          timestamp =
            timestampValue < 10000000000
              ? timestampValue *
                1000
              : timestampValue;
        }

        if (
          typeof timestampValue ===
          "string"
        ) {
          const parsedDate =
            Date.parse(
              timestampValue
            );

          if (
            !Number.isNaN(
              parsedDate
            )
          ) {
            timestamp =
              parsedDate;
          }
        }

        setCropData({
          crop:
            String(
              crop ||
                "Crop"
            ),
          status:
            String(
              status ||
                "Checked"
            ),
          disease:
            String(
              disease ||
                "Unknown"
            ),
          confidence:
            safeNumber(
              confidenceValue
            ) ?? 0,
          healthScore:
            safeNumber(
              healthScoreValue
            ) ?? 0,
          timestamp,
        });
      } catch (error) {
        console.error(
          "Crop health localStorage parsing error:",
          error
        );
      }
    }, []);

  /* =======================================================
     LOAD AI CONVERSATIONS
  ======================================================= */

  const loadConversationData =
    useCallback(async () => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const userId =
        localStorage.getItem(
          "user_id"
        );

      if (!userId) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/conversations?user_id=${encodeURIComponent(
              userId
            )}`,
            {
              cache: "no-store",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Conversation API error: ${response.status}`
          );
        }

        const data =
          await response.json();

        let conversations: DashboardConversation[] =
          [];

        if (
          Array.isArray(data)
        ) {
          conversations =
            data;
        } else if (
          Array.isArray(
            data?.conversations
          )
        ) {
          conversations =
            data.conversations;
        } else if (
          Array.isArray(
            data?.data
          )
        ) {
          conversations =
            data.data;
        }

        setConversationCount(
          conversations.length
        );

        if (
          conversations.length >
          0
        ) {
          const sorted =
            [
              ...conversations,
            ].sort(
              (
                a,
                b
              ) => {
                const aTime =
                  a.created_at
                    ? Date.parse(
                        a.created_at
                      )
                    : 0;

                const bTime =
                  b.created_at
                    ? Date.parse(
                        b.created_at
                      )
                    : 0;

                return (
                  bTime -
                  aTime
                );
              }
            );

          setLatestConversation(
            sorted[0]
          );
        } else {
          setLatestConversation(
            null
          );
        }
      } catch (error) {
        console.error(
          "Dashboard conversation loading error:",
          error
        );
      }
    }, []);

  /* =======================================================
     BUILD REAL NOTIFICATIONS
  ======================================================= */

  const buildNotifications =
    useCallback(() => {
      const userId =
        typeof window !==
        "undefined"
          ? localStorage.getItem(
              "user_id"
            )
          : null;

      const readKey =
        `dashboard_notification_read_${userId || "guest"}`;

      let readIds: number[] =
        [];

      if (
        typeof window !==
        "undefined"
      ) {
        try {
          const saved =
            localStorage.getItem(
              readKey
            );

          if (saved) {
            const parsed =
              JSON.parse(
                saved
              );

            if (
              Array.isArray(
                parsed
              )
            ) {
              readIds =
                parsed.filter(
                  (
                    value
                  ) =>
                    typeof value ===
                    "number"
                );
            }
          }
        } catch {
          readIds = [];
        }
      }

      const realNotifications: NotificationItem[] =
        [];

      /* -----------------------------------------------------
         WEATHER
      ----------------------------------------------------- */

      if (weatherData) {
        realNotifications.push({
          id: 1001,
          type: "weather",
          icon: "🌦️",
          title:
            "Weather Update",
          message:
            `${weatherData.condition} with ${weatherData.temperature} in ${weatherData.location}. Check weather insights for farming impact.`,
          time: "Just now",
          read:
            readIds.includes(
              1001
            ),
          timestamp:
            Date.now(),
        });
      }

      /* -----------------------------------------------------
         MARKET
      ----------------------------------------------------- */

      if (marketData) {
        realNotifications.push({
          id: 1002,
          type: "market",
          icon: "📈",
          title:
            "Market Price Update",
          message:
            `${marketData.commodity} at ${marketData.market}: ₹${marketData.modalPrice} ${marketData.unit}.`,
          time:
            relativeTime(
              marketData.timestamp
            ),
          read:
            readIds.includes(
              1002
            ),
          timestamp:
            marketData.timestamp,
        });
      }

      /* -----------------------------------------------------
         CROP HEALTH
      ----------------------------------------------------- */

      if (cropData) {
        const isHealthy =
          cropData.status
            .toLowerCase()
            .includes(
              "healthy"
            );

        realNotifications.push({
          id: 1003,
          type: "crop",
          icon: "🌱",
          title:
            "Crop Health Update",
          message:
            `${cropData.crop}: ${isHealthy ? "Healthy condition detected" : `Possible issue detected — ${cropData.disease}`}. Confidence ${cropData.confidence.toFixed(
              1
            )}%.`,
          time:
            relativeTime(
              cropData.timestamp
            ),
          read:
            readIds.includes(
              1003
            ),
          timestamp:
            cropData.timestamp,
        });
      }

      /* -----------------------------------------------------
         AI
      ----------------------------------------------------- */

      if (
        latestConversation ||
        conversationCount >
          0
      ) {
        const timestamp =
          latestConversation?.created_at
            ? Date.parse(
                latestConversation.created_at
              )
            : Date.now();

        realNotifications.push({
          id: 1004,
          type: "ai",
          icon: "🤖",
          title:
            "AI Recommendation",
          message:
            latestConversation?.title
              ? `Your latest AI consultation: "${latestConversation.title}". Continue your farming discussion with AgriAI.`
              : "Your AgriAI assistant is ready with your farming consultation history.",
          time:
            relativeTime(
              timestamp
            ),
          read:
            readIds.includes(
              1004
            ),
          timestamp,
        });
      }

      /* -----------------------------------------------------
         FALLBACK SYSTEM
      ----------------------------------------------------- */

      if (
        realNotifications.length ===
        0
      ) {
        realNotifications.push({
          id: 1005,
          type: "system",
          icon: "🌾",
          title:
            "AgriAI Ready",
          message:
            "Your agricultural dashboard is ready. Use AI consultation, crop health, weather and market tools to generate real farming updates.",
          time: "Just now",
          read:
            readIds.includes(
              1005
            ),
          timestamp:
            Date.now(),
        });
      }

      setNotifications(
        realNotifications
      );
    }, [
      weatherData,
      marketData,
      cropData,
      conversationCount,
      latestConversation,
    ]);

  /* =======================================================
     INITIAL REAL DATA LOAD
  ======================================================= */

  useEffect(() => {
    loadWeatherData();
    loadMarketData();
    loadCropData();
    loadConversationData();

    const interval =
      window.setInterval(() => {
        loadWeatherData();
        loadMarketData();
        loadCropData();
        loadConversationData();
      }, 60000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    loadWeatherData,
    loadMarketData,
    loadCropData,
    loadConversationData,
  ]);

  /* =======================================================
     REBUILD NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    buildNotifications();
  }, [
    buildNotifications,
  ]);

  /* =======================================================
     UNREAD COUNT
  ======================================================= */

  const unreadCount =
    notifications.filter(
      (
        notification
      ) =>
        !notification.read
    ).length;

  /* =======================================================
     SAVE READ NOTIFICATION IDS
  ======================================================= */

  const saveReadNotificationIds =
    (
      updatedNotifications: NotificationItem[]
    ) => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const userId =
        localStorage.getItem(
          "user_id"
        );

      const key =
        `dashboard_notification_read_${userId || "guest"}`;

      const ids =
        updatedNotifications
          .filter(
            (
              notification
            ) =>
              notification.read
          )
          .map(
            (
              notification
            ) =>
              notification.id
          );

      localStorage.setItem(
        key,
        JSON.stringify(ids)
      );
    };

  /* =======================================================
     NOTIFICATION FUNCTIONS
  ======================================================= */

  const markNotificationAsRead = (
    id: number
  ) => {
    setNotifications(
      (
        previous
      ) => {
        const updated =
          previous.map(
            (
              notification
            ) =>
              notification.id ===
              id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          );

        saveReadNotificationIds(
          updated
        );

        return updated;
      }
    );
  };

  const markAllNotificationsAsRead =
    () => {
      setNotifications(
        (
          previous
        ) => {
          const updated =
            previous.map(
              (
                notification
              ) => ({
                ...notification,
                read: true,
              })
            );

          saveReadNotificationIds(
            updated
          );

          return updated;
        }
      );
    };

  const clearAllNotifications =
    () => {
      setNotifications(
        (
          previous
        ) => {
          const updated =
            previous.map(
              (
                notification
              ) => ({
                ...notification,
                read: true,
              })
            );

          saveReadNotificationIds(
            updated
          );

          return [];
        }
      );
    };

  const handleNotificationClick = (
    notification: NotificationItem
  ) => {
    markNotificationAsRead(
      notification.id
    );

    setNotificationOpen(
      false
    );

    if (
      notification.type ===
      "weather"
    ) {
      router.push(
        "/weather-insights"
      );
    }

    if (
      notification.type ===
      "market"
    ) {
      router.push(
        "/market-prices"
      );
    }

    if (
      notification.type ===
      "crop"
    ) {
      router.push(
        "/crop_health"
      );
    }

    if (
      notification.type ===
      "ai"
    ) {
      router.push(
        "/chat"
      );
    }
  };

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target
        )
      ) {
        setNotificationOpen(
          false
        );
      }

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          target
        )
      ) {
        setAccountMenuOpen(
          false
        );
      }
    }

    if (
      notificationOpen ||
      accountMenuOpen
    ) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [
    notificationOpen,
    accountMenuOpen,
  ]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setNotificationOpen(
          false
        );

        setAccountMenuOpen(
          false
        );
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     LOAD USER PROFILE
  ======================================================= */

  useEffect(() => {
    const loadUserProfile =
      async () => {
        const userId =
          localStorage.getItem(
            "user_id"
          );

        const savedUser =
          localStorage.getItem(
            "user"
          );

        const savedEmail =
          localStorage.getItem(
            "email"
          );

        if (!userId) {
          if (!savedUser) {
            router.replace(
              "/login"
            );

            return;
          }

          setUser(
            savedUser
          );

          setEmail(
            savedEmail ||
              ""
          );

          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/users/${userId}`,
              {
                cache:
                  "no-store",
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Failed to load profile"
            );
          }

          const data =
            await response.json();

          const fullName =
            `${data.first_name || ""} ${
              data.last_name || ""
            }`.trim();

          const finalUser =
            fullName ||
            data.first_name ||
            savedUser ||
            "";

          const finalEmail =
            data.email ||
            savedEmail ||
            "";

          setUser(
            finalUser
          );

          setEmail(
            finalEmail
          );

          if (
            data.profile_image
          ) {
            const imageUrl =
              getFullImageUrl(
                data.profile_image
              );

            setProfileImage(
              `${imageUrl}?t=${Date.now()}`
            );
          } else {
            setProfileImage(
              ""
            );
          }

          localStorage.setItem(
            "user",
            finalUser
          );

          localStorage.setItem(
            "email",
            finalEmail
          );
        } catch (error) {
          console.error(
            "Dashboard profile loading error:",
            error
          );

          if (savedUser) {
            setUser(
              savedUser
            );
          }

          if (savedEmail) {
            setEmail(
              savedEmail
            );
          }
        }
      };

    loadUserProfile();
  }, [router]);

  /* =======================================================
   LOGOUT
======================================================= */

function handleLogout() {
  localStorage.removeItem("user");
  localStorage.removeItem("email");
  localStorage.removeItem("user_id");

  sessionStorage.setItem(
    "flash_message",
    JSON.stringify({
      message: "Logged out successfully!",
      type: "success",
    })
  );

  setAccountMenuOpen(false);
  setMobileMenuOpen(false);
  setNotificationOpen(false);

  router.replace("/");
}

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      labelKey: "dashboard",
      fallback: "Dashboard",
      icon: "⌂",
    },

    {
      id: "aiConsultation",
      labelKey:
        "aiConsultation",
      fallback:
        "AI Consultation",
      icon: "✦",
      path: "/chat",
    },

    {
      id: "cropHealth",
      labelKey: "cropHealth",
      fallback:
        "Crop Health",
      icon: "🌱",
      path: "/crop_health",
    },

    {
      id: "weatherInsights",
      labelKey:
        "weatherInsights",
      fallback:
        "Weather Insights",
      icon: "☀",
      path:
        "/weather-insights",
    },

    {
      id: "marketPrices",
      labelKey:
        "marketPrices",
      fallback:
        "Market Prices",
      icon: "📈",
      path:
        "/market-prices",
    },

    {
      id: "myHistory",
      labelKey: "myHistory",
      fallback: "My History",
      icon: "◷",
      path: "/my-history",
    },
  ];

  const handleNavigation = (
    item: NavItem
  ) => {
    setActiveItem(
      item.id
    );

    setAccountMenuOpen(
      false
    );

    setNotificationOpen(
      false
    );

    if (item.path) {
      router.push(
        item.path
      );
    }

    setMobileMenuOpen(
      false
    );
  };

  /* =======================================================
     PROFILE AVATAR
  ======================================================= */

  const ProfileAvatar = ({
    size = "h-11 w-11",
    textSize = "text-sm",
    rounded = "rounded-2xl",
  }: ProfileAvatarProps) => {
    return (
      <div
        className={`grid ${size} ${rounded} shrink-0 place-items-center overflow-hidden border border-green-400/20 bg-gradient-to-br from-cyan-400/30 to-blue-500/20 font-bold text-cyan-700`}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="h-full w-full object-cover"
            onError={() => {
              setProfileImage(
                ""
              );
            }}
          />
        ) : (
          <span
            className={
              textSize
            }
          >
            {user
              ? user
                  .charAt(
                    0
                  )
                  .toUpperCase()
              : "U"}
          </span>
        )}
      </div>
    );
  };

  /* =======================================================
     SIDEBAR CONTENT
  ======================================================= */

  const sidebarContent = (
    <>
      {/* =================================================
          LOGO
      ================================================= */}

      <div
        className={`flex h-20 shrink-0 items-center border-b px-5 ${themeStyles.border}`}
      >
        <motion.div
          animate={{
            rotate:
              sidebarOpen
                ? 0
                : 360,
          }}
          transition={{
            duration: 0.5,
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-700 text-xl shadow-[0_0_30px_rgba(34,255,136,0.35)]"
        >
          🌾
        </motion.div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -10,
              }}
              className="ml-3 overflow-hidden whitespace-nowrap"
            >
              <h1
                className={`text-lg font-bold tracking-wide ${themeStyles.primaryText}`}
              >
                Agri
                <span className="text-green-500">
                  AI
                </span>
              </h1>

              <p
                className={`text-[10px] uppercase tracking-[0.18em] ${themeStyles.mutedText}`}
              >
                {text(
                  "smartFarming",
                  "Smart Farming"
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="flex-1 overflow-y-auto px-3 py-5 sm:py-6">
        {sidebarOpen && (
          <p
            className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] ${themeStyles.mutedText}`}
          >
            {text(
              "mainMenu",
              "Main Menu"
            )}
          </p>
        )}

        <div className="space-y-2">
          {navItems.map(
            (
              item
            ) => {
              const active =
                activeItem ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    handleNavigation(
                      item
                    )
                  }
                  className={`group relative flex w-full items-center rounded-2xl px-3 py-3 text-left transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-600 shadow-[0_0_25px_rgba(34,255,136,0.08)]"
                      : `${themeStyles.inactiveNav} ${themeStyles.menuHover}`
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 h-7 w-[3px] rounded-r-full bg-green-500 shadow-[0_0_15px_rgba(34,255,136,0.8)]"
                    />
                  )}

                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${
                      isDark
                        ? "bg-white/[0.04]"
                        : "bg-green-50"
                    }`}
                  >
                    {
                      item.icon
                    }
                  </span>

                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="ml-3 whitespace-nowrap text-sm font-medium"
                      >
                        {text(
                          item.labelKey,
                          item.fallback
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =================================================
          AI CARD
      ================================================= */}

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            className={`mx-3 mb-4 shrink-0 rounded-2xl border border-green-400/20 bg-gradient-to-br from-green-400/10 to-emerald-500/5 p-4 ${themeStyles.primaryText}`}
          >
            <div className="text-2xl">
              🤖
            </div>

            <h3 className="mt-3 text-sm font-semibold">
              {text(
                "needFarmingAdvice",
                "Need farming advice?"
              )}
            </h3>

            <p
              className={`mt-1 text-xs leading-relaxed ${themeStyles.secondaryText}`}
            >
              {text(
                "askOurAiAboutCrops",
                "Ask our AI assistant about crops, diseases, soil and farming."
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(
                  false
                );

                setAccountMenuOpen(
                  false
                );

                setNotificationOpen(
                  false
                );

                router.push(
                  "/chat"
                );
              }}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-3 py-2 text-xs font-semibold text-[#03150b] transition hover:scale-[1.02]"
            >
              {text(
                "askAgriAI",
                "Ask AgriAI"
              )}{" "}
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          ACCOUNT
      ================================================= */}

      <div
        ref={
          accountMenuRef
        }
        className={`relative shrink-0 border-t p-3 ${themeStyles.border}`}
      >
        <AnimatePresence>
          {accountMenuOpen &&
            sidebarOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.96,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`absolute bottom-[calc(100%+8px)] left-3 right-3 z-[1000] overflow-hidden rounded-2xl border p-2 backdrop-blur-2xl ${themeStyles.popup}`}
              >
                <div
                  className={`rounded-xl border p-3 ${themeStyles.innerCard}`}
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar />

                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-semibold ${themeStyles.accountText}`}
                      >
                        {user ||
                          text(
                            "user",
                            "User"
                          )}
                      </p>

                      <p
                        className={`truncate text-xs ${themeStyles.accountMuted}`}
                      >
                        {email ||
                          text(
                            "noEmailAvailable",
                            "No email available"
                          )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* THEME */}

                <button
                  type="button"
                  onClick={
                    toggleTheme
                  }
                  className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${themeStyles.menuHover}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-400/10 text-base">
                    {isDark
                      ? "☀️"
                      : "🌙"}
                  </span>

                  <span className="flex-1">
                    <span
                      className={`block font-medium ${themeStyles.primaryText}`}
                    >
                      {isDark
                        ? "Light Mode"
                        : "Dark Mode"}
                    </span>

                    <span
                      className={`mt-0.5 block text-[11px] ${themeStyles.accountMuted}`}
                    >
                      Change dashboard appearance
                    </span>
                  </span>
                </button>

                {/* SETTINGS */}

                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(
                      false
                    );

                    setMobileMenuOpen(
                      false
                    );

                    router.push(
                      "/settings"
                    );
                  }}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${themeStyles.menuHover}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-400/10 text-base">
                    ⚙
                  </span>

                  <span className="flex-1">
                    <span
                      className={`block font-medium ${themeStyles.primaryText}`}
                    >
                      {text(
                        "settings",
                        "Settings"
                      )}
                    </span>

                    <span
                      className={`mt-0.5 block text-[11px] ${themeStyles.accountMuted}`}
                    >
                      {text(
                        "manageYourAccount",
                        "Manage your account"
                      )}
                    </span>
                  </span>

                  <span
                    className={
                      themeStyles.accountMuted
                    }
                  >
                    ›
                  </span>
                </button>

                <div
                  className={`my-2 h-px ${
                    isDark
                      ? "bg-white/[0.07]"
                      : "bg-[#d9e8dc]"
                  }`}
                />

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-500 transition hover:bg-red-500/10"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-base">
                    ↪
                  </span>

                  <span className="font-medium">
                    {text(
                      "logout",
                      "Logout"
                    )}
                  </span>
                </button>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setAccountMenuOpen(
                (
                  prev
                ) =>
                  !prev
              )
            }
            className={`flex min-w-0 flex-1 items-center rounded-2xl p-1.5 text-left transition ${
              isDark
                ? "hover:bg-white/[0.04]"
                : "hover:bg-green-50"
            }`}
          >
            <ProfileAvatar />

            {sidebarOpen && (
              <div className="ml-3 min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${themeStyles.primaryText}`}
                >
                  {user ||
                    text(
                      "user",
                      "User"
                    )}
                </p>

                <p
                  className={`text-xs ${themeStyles.accountMuted}`}
                >
                  {text(
                    "farmerAccount",
                    "Farmer Account"
                  )}
                </p>
              </div>
            )}
          </button>

          {sidebarOpen && (
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-red-400 transition hover:bg-red-500/10"
              title={text(
                "logout",
                "Logout"
              )}
            >
              ↪
            </button>
          )}
        </div>
      </div>
    </>
  );

  /* =======================================================
     DYNAMIC STATS
  ======================================================= */

  const weatherValue =
    weatherData?.temperature ||
    "—";

  const weatherSubtitle =
    weatherData
      ? weatherData.condition
      : "Allow location access";

  const marketValue =
    marketData
      ? `₹${marketData.modalPrice}`
      : "—";

  const marketSubtitle =
    marketData
      ? `${marketData.commodity} • ${marketData.market}`
      : "Open Market Prices";

  const cropValue =
    cropData &&
    cropData.healthScore >
      0
      ? `${Math.round(
          cropData.healthScore
        )}%`
      : cropData &&
        cropData.confidence >
          0
      ? `${Math.round(
          cropData.confidence
        )}%`
      : "—";

  const cropSubtitle =
    cropData
      ? cropData.status
      : "Check your crop";

  const aiValue =
    String(
      conversationCount
    );

  const aiSubtitle =
    conversationCount ===
    1
      ? "1 consultation"
      : `${conversationCount} consultations`;

  const stats = [
    {
      title: text(
        "todaysWeather",
        "Today's Weather"
      ),
      value:
        weatherValue,
      subtitle:
        weatherSubtitle,
      icon: "☀️",
      action: () =>
        router.push(
          "/weather-insights"
        ),
    },

    {
      title: text(
        "marketPrices",
        "Market Prices"
      ),
      value:
        marketValue,
      subtitle:
        marketSubtitle,
      icon: "📈",
      action: () =>
        router.push(
          "/market-prices"
        ),
    },

    {
      title: text(
        "cropHealth",
        "Crop Health"
      ),
      value:
        cropValue,
      subtitle:
        cropSubtitle,
      icon: "🌱",
      action: () =>
        router.push(
          "/crop_health"
        ),
    },

    {
      title: text(
        "aiConsultations",
        "AI Consultations"
      ),
      value:
        aiValue,
      subtitle:
        aiSubtitle,
      icon: "🤖",
      action: () =>
        router.push(
          "/chat"
        ),
    },

    {
      title: text(
        "smartAlerts",
        "Smart Alerts"
      ),
      value:
        String(
          unreadCount
        ).padStart(
          2,
          "0"
        ),
      subtitle:
        unreadCount ===
        1
          ? "New recommendation"
          : "New recommendations",
      icon: "🔔",
      action: () =>
        setNotificationOpen(
          true
        ),
    },
  ];

  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  const quickActions = [
    {
      title: text(
        "askAiAssistant",
        "Ask AI Assistant"
      ),
      description: text(
        "getInstantAgriculturalAdvice",
        "Get instant agricultural advice in your preferred language."
      ),
      icon: "🤖",
      action: () =>
        router.push(
          "/chat"
        ),
      highlight: true,
    },

    {
      title: text(
        "checkCropHealth",
        "Check Crop Health"
      ),
      description: text(
        "analyzeCropConditions",
        "Analyze crop conditions and get smart recommendations."
      ),
      icon: "🌱",
      action: () =>
        router.push(
          "/crop_health"
        ),
      highlight: false,
    },

    {
      title: text(
        "weatherIntelligence",
        "Weather Intelligence"
      ),
      description: text(
        "understandWeatherConditions",
        "Understand weather conditions and farming impact."
      ),
      icon: "🌦️",
      action: () =>
        router.push(
          "/weather-insights"
        ),
      highlight: false,
    },
  ];

  /* =======================================================
     REAL ACTIVITY
  ======================================================= */

  const activities = [
    {
      icon: "🌱",
      title: cropData
        ? `${cropData.crop} health check`
        : text(
            "cropCareRecommendation",
            "Crop care recommendation"
          ),
      description:
        cropData
          ? `${cropData.status} • ${cropData.disease}`
          : text(
              "aiGeneratedCropGuidance",
              "AI generated personalized guidance for your crops."
            ),
      time:
        cropData
          ? relativeTime(
              cropData.timestamp
            )
          : text(
              "recently",
              "Recently"
            ),
    },

    {
      icon: "💧",
      title: marketData
        ? `${marketData.commodity} market update`
        : text(
            "irrigationSuggestion",
            "Irrigation suggestion"
          ),
      description:
        marketData
          ? `${marketData.market} • ₹${marketData.modalPrice} ${marketData.unit}`
          : text(
              "smartWateringAdvice",
              "Smart watering advice based on crop conditions."
            ),
      time:
        marketData
          ? relativeTime(
              marketData.timestamp
            )
          : text(
              "today",
              "Today"
            ),
    },

    {
      icon: "🌦️",
      title:
        weatherData
          ? "Weather monitoring"
          : text(
              "weatherMonitoring",
              "Weather monitoring"
            ),
      description:
        weatherData
          ? `${weatherData.condition} • ${weatherData.temperature}`
          : text(
              "weatherConditionsMonitored",
              "Weather conditions are being monitored."
            ),
      time:
        weatherData
          ? "Active"
          : text(
              "active",
              "Active"
            ),
    },
  ];

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className={`relative flex min-h-[100dvh] overflow-hidden transition-colors duration-500 ${themeStyles.page}`}
    >
      {/* =================================================
          3D BACKGROUND
      ================================================= */}

      {isDark && (
        <Farmland3D />
      )}

      <div
        className={`pointer-events-none fixed inset-0 z-0 transition-colors duration-500 ${themeStyles.overlay}`}
      />

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <motion.aside
        animate={{
          width:
            sidebarOpen
              ? 270
              : 84,
        }}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
        }}
        className={`relative z-40 hidden min-h-screen flex-col border-r backdrop-blur-2xl transition-colors duration-500 lg:flex ${themeStyles.sidebar}`}
      >
        {sidebarContent}

        <button
          type="button"
          onClick={() => {
            setSidebarOpen(
              !sidebarOpen
            );

            setAccountMenuOpen(
              false
            );

            setNotificationOpen(
              false
            );
          }}
          className={`absolute -right-4 top-24 z-[50] grid h-8 w-8 place-items-center rounded-full border text-xs shadow-xl transition ${
            isDark
              ? "border-white/15 bg-[#0b1b10] text-white/60"
              : "border-[#b9d8c0] bg-white text-[#526557]"
          }`}
        >
          {sidebarOpen
            ? "‹"
            : "›"}
        </button>
      </motion.aside>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => {
                setMobileMenuOpen(
                  false
                );

                setAccountMenuOpen(
                  false
                );
              }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 240,
              }}
              className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[82vw] max-w-[320px] flex-col border-r backdrop-blur-2xl sm:w-[300px] lg:hidden ${themeStyles.mobileSidebar}`}
            >
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(
                    false
                  );

                  setAccountMenuOpen(
                    false
                  );
                }}
                className={`absolute right-3 top-3 z-[60] grid h-9 w-9 place-items-center rounded-xl border text-lg transition ${themeStyles.buttonSoft}`}
              >
                ×
              </button>

              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =================================================
          MAIN APP
      ================================================= */}

      <div className="relative z-10 flex min-h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header
          className={`relative z-[100] flex min-h-20 shrink-0 items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-2xl transition-colors duration-500 sm:px-8 ${themeStyles.topbar}`}
        >
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  true
                )
              }
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-lg lg:hidden ${themeStyles.buttonSoft}`}
            >
              ☰
            </button>

            {/* HEADER TEXT */}

            <div className="min-w-0">
              <p className="truncate text-[9px] uppercase tracking-[0.14em] text-green-500 sm:text-xs sm:tracking-[0.2em]">
                {text(
                  "agriculturalIntelligence",
                  "Agricultural Intelligence"
                )}
              </p>

              <h2
                className={`mt-1 truncate text-base font-semibold sm:text-2xl ${themeStyles.primaryText}`}
              >
                {text(
                  "goodToSeeYou",
                  "Good to see you"
                )}
                ,{" "}
                <span className="text-green-500">
                  {user ||
                    text(
                      "farmer",
                      "Farmer"
                    )}{" "}
                  👋
                </span>
              </h2>
            </div>
          </div>

          {/* =================================================
              TOPBAR ACTIONS
          ================================================= */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* THEME */}

            <button
              type="button"
              onClick={
                toggleTheme
              }
              className={`grid h-10 w-10 place-items-center rounded-xl border text-lg transition ${themeStyles.buttonSoft}`}
              title="Change theme"
            >
              {isDark
                ? "☀️"
                : "🌙"}
            </button>

            {/* =================================================
                NOTIFICATION WRAPPER
            ================================================= */}

            <div
              ref={
                notificationRef
              }
              className="relative z-[1000]"
            >

              {/* BELL BUTTON */}

              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(
                    (
                      previous
                    ) =>
                      !previous
                  );

                  setAccountMenuOpen(
                    false
                  );
                }}
                className={`relative grid h-10 w-10 place-items-center rounded-xl border transition ${themeStyles.buttonSoft}`}
                aria-label="Notifications"
                aria-expanded={
                  notificationOpen
                }
              >
                <span
                  className={
                    unreadCount >
                    0
                      ? "animate-[bell_0.8s_ease-in-out_1]"
                      : ""
                  }
                >
                  🔔
                </span>

                {/* UNREAD BADGE */}

                {unreadCount >
                  0 && (
                  <span
                    className={`absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 bg-red-500 px-1 text-[9px] font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.55)] ${
                      isDark
                        ? "border-[#0a1a0f]"
                        : "border-white"
                    }`}
                  >
                    {unreadCount >
                    9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* =================================================
                  NOTIFICATION PANEL
              ================================================= */}

              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className={`absolute right-0 top-[calc(100%+12px)] z-[9999] w-[calc(100vw-32px)] max-w-[390px] overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl ${themeStyles.popup}`}
                  >

                    {/* PANEL HEADER */}

                    <div
                      className={`border-b p-4 sm:p-5 ${themeStyles.border}`}
                    >
                      <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">

                            <h3
                              className={`text-base font-semibold ${themeStyles.primaryText}`}
                            >
                              Notifications
                            </h3>

                            {unreadCount >
                              0 && (
                              <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                                {
                                  unreadCount
                                }{" "}
                                new
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-1 text-xs ${themeStyles.secondaryText}`}
                          >
                            Farming updates and recommendations
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={
                            markAllNotificationsAsRead
                          }
                          disabled={
                            unreadCount ===
                            0
                          }
                          className={`shrink-0 text-[10px] font-semibold transition ${
                            unreadCount ===
                            0
                              ? "cursor-not-allowed opacity-30"
                              : "text-green-600 hover:text-green-500"
                          }`}
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>

                    {/* NOTIFICATION LIST */}

                    <div className="max-h-[390px] overflow-y-auto overscroll-contain">

                      {notifications.length ===
                      0 ? (

                        /* EMPTY STATE */

                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                          <div
                            className={`grid h-16 w-16 place-items-center rounded-2xl text-3xl ${
                              isDark
                                ? "bg-white/5"
                                : "bg-green-50"
                            }`}
                          >
                            🔕
                          </div>

                          <h4
                            className={`mt-4 text-sm font-semibold ${themeStyles.primaryText}`}
                          >
                            No notifications
                          </h4>

                          <p
                            className={`mt-1 max-w-[250px] text-xs leading-5 ${themeStyles.secondaryText}`}
                          >
                            You're all caught up. New farming updates will appear here.
                          </p>
                        </div>

                      ) : (

                        <div className="p-2">

                          {notifications.map(
                            (
                              notification
                            ) => (

                              <motion.button
                                layout
                                key={
                                  notification.id
                                }
                                type="button"
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className={`group mb-1 flex w-full gap-3 rounded-2xl p-3 text-left transition last:mb-0 ${
                                  notification.read
                                    ? themeStyles.menuHover
                                    : isDark
                                    ? "bg-green-400/[0.07] hover:bg-green-400/[0.12]"
                                    : "bg-green-50 hover:bg-green-100"
                                }`}
                              >

                                {/* ICON */}

                                <div
                                  className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ${
                                    notification.type ===
                                    "weather"
                                      ? "bg-sky-400/10"
                                      : notification.type ===
                                        "market"
                                      ? "bg-blue-400/10"
                                      : notification.type ===
                                        "crop"
                                      ? "bg-green-400/10"
                                      : notification.type ===
                                        "ai"
                                      ? "bg-purple-400/10"
                                      : "bg-gray-400/10"
                                  }`}
                                >
                                  {
                                    notification.icon
                                  }

                                  {!notification.read && (
                                    <span
                                      className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 bg-green-500 ${
                                        isDark
                                          ? "border-[#0a1a0f]"
                                          : "border-white"
                                      }`}
                                    />
                                  )}
                                </div>

                                {/* CONTENT */}

                                <div className="min-w-0 flex-1">

                                  <div className="flex items-start justify-between gap-2">

                                    <p
                                      className={`min-w-0 text-xs font-semibold ${
                                        notification.read
                                          ? themeStyles.secondaryText
                                          : themeStyles.primaryText
                                      }`}
                                    >
                                      {
                                        notification.title
                                      }
                                    </p>

                                    <span
                                      className={`shrink-0 text-[9px] ${themeStyles.mutedText}`}
                                    >
                                      {
                                        notification.time
                                      }
                                    </span>
                                  </div>

                                  <p
                                    className={`mt-1 text-[11px] leading-5 ${themeStyles.secondaryText}`}
                                  >
                                    {
                                      notification.message
                                    }
                                  </p>

                                  <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-green-600 opacity-80 transition group-hover:opacity-100">
                                    Open

                                    <span className="transition group-hover:translate-x-0.5">
                                      →
                                    </span>
                                  </div>
                                </div>
                              </motion.button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* PANEL FOOTER */}

                    {notifications.length >
                      0 && (
                      <div
                        className={`border-t p-3 ${themeStyles.border}`}
                      >
                        <button
                          type="button"
                          onClick={
                            clearAllNotifications
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
                        >
                          🗑️ Clear all notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ASK AI */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/chat"
                )
              }
              className="hidden rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03150b] shadow-[0_0_25px_rgba(34,255,136,0.2)] transition hover:scale-105 sm:block"
            >
              {text(
                "askAI",
                "Ask AI"
              )}{" "}
              ✦
            </button>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="relative z-0 flex-1 overflow-x-hidden overflow-y-auto">

          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">

            {/* =================================================
                HERO
            ================================================= */}

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
                duration: 0.7,
              }}
              className={`relative overflow-hidden rounded-[1.5rem] border p-5 transition-colors duration-500 sm:rounded-[2rem] sm:p-10 ${themeStyles.hero}`}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-400/10 blur-3xl sm:h-52 sm:w-52" />

              <div className="relative grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.5fr_1fr]">

                <div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-green-600 sm:text-[10px]">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                    {text(
                      "aiSystemOnline",
                      "AI System Online"
                    )}
                  </div>

                  <h1
                    className={`mt-4 max-w-3xl text-3xl font-bold leading-tight sm:mt-5 sm:text-4xl lg:text-5xl ${themeStyles.primaryText}`}
                  >
                    {text(
                      "smarterDecisions",
                      "Smarter decisions for"
                    )}{" "}

                    <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                      {text(
                        "betterFarming",
                        "better farming."
                      )}
                    </span>
                  </h1>

                  <p
                    className={`mt-4 max-w-2xl text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7 ${themeStyles.secondaryText}`}
                  >
                    {text(
                      "dashboardHeroDescription",
                      "Ask questions in your preferred language and receive AI-powered agricultural guidance for crops, diseases, irrigation, soil, and farming practices."
                    )}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/chat"
                        )
                      }
                      className="group w-full rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3.5 text-sm font-bold text-[#03150b] shadow-[0_0_30px_rgba(34,255,136,0.25)] transition hover:scale-[1.03] sm:w-auto"
                    >
                      {text(
                        "startAiConsultation",
                        "Start AI Consultation"
                      )}

                      <span className="ml-2 inline-block transition group-hover:translate-x-1">
                        →
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/insights"
                        )
                      }
                      className={`w-full rounded-2xl border px-6 py-3.5 text-sm font-medium backdrop-blur-xl transition sm:w-auto ${themeStyles.buttonSoft}`}
                    >
                      {text(
                        "exploreInsights",
                        "Explore Insights"
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative hidden min-h-[250px] items-center justify-center lg:flex">

                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 18,
                      repeat:
                        Infinity,
                      ease: "linear",
                    }}
                    className="absolute h-52 w-52 rounded-full border border-green-400/30"
                  />

                  <motion.div
                    animate={{
                      y: [
                        0,
                        -10,
                        0,
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat:
                        Infinity,
                    }}
                    className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-green-300 via-emerald-500 to-green-700 text-4xl shadow-[0_0_70px_rgba(34,255,136,0.45)]"
                  >
                    🌾
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* =================================================
                STATS

                FIX:
                5 cards now fit in one row on XL screens.
            ================================================= */}

            <section className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-8 sm:gap-4 xl:grid-cols-5">

              {stats.map(
                (
                  stat,
                  index
                ) => (
                  <motion.div
                    key={
                      stat.title
                    }
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
                        index *
                          0.08,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    onClick={
                      stat.action
                    }
                    className={`group min-w-0 rounded-3xl border p-5 backdrop-blur-xl transition ${themeStyles.card} ${
                      stat.action
                        ? "cursor-pointer"
                        : ""
                    }`}
                  >

                    <div className="flex items-start justify-between">

                      <div className="text-2xl">
                        {
                          stat.icon
                        }
                      </div>

                      <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(34,255,136,0.8)]" />
                    </div>

                    <p
                      className={`mt-5 text-xs uppercase tracking-widest ${themeStyles.mutedText}`}
                    >
                      {
                        stat.title
                      }
                    </p>

                    <h3
                      className={`mt-2 truncate text-3xl font-bold ${themeStyles.primaryText}`}
                    >
                      {
                        stat.value
                      }
                    </h3>

                    <p className="mt-1 truncate text-xs text-green-600">
                      {
                        stat.subtitle
                      }
                    </p>
                  </motion.div>
                )
              )}
            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="mt-8 sm:mt-10">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-500">
                {text(
                  "quickAccess",
                  "Quick Access"
                )}
              </p>

              <h2
                className={`mt-2 text-xl font-semibold sm:text-2xl ${themeStyles.primaryText}`}
              >
                {text(
                  "whatWouldYouLikeToDo",
                  "What would you like to do?"
                )}
              </h2>

              <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">

                {quickActions.map(
                  (
                    item
                  ) => (
                    <motion.button
                      key={
                        item.title
                      }
                      type="button"
                      whileHover={{
                        y: -6,
                        scale: 1.01,
                      }}
                      onClick={
                        item.action
                      }
                      className={`group relative w-full overflow-hidden rounded-3xl border p-5 text-left transition sm:p-6 ${
                        item.highlight
                          ? "border-green-400/30 bg-gradient-to-br from-green-400/15 to-emerald-500/5"
                          : themeStyles.softCard
                      }`}
                    >
                      <div className="relative">

                        <div
                          className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${
                            isDark
                              ? "bg-white/5"
                              : "bg-green-50"
                          }`}
                        >
                          {
                            item.icon
                          }
                        </div>

                        <h3
                          className={`mt-5 text-lg font-semibold sm:mt-6 ${themeStyles.primaryText}`}
                        >
                          {
                            item.title
                          }
                        </h3>

                        <p
                          className={`mt-2 text-sm leading-6 ${themeStyles.secondaryText}`}
                        >
                          {
                            item.description
                          }
                        </p>

                        <div className="mt-5 text-sm font-semibold text-green-600">
                          {text(
                            "open",
                            "Open"
                          )}{" "}
                          →
                        </div>
                      </div>
                    </motion.button>
                  )
                )}
              </div>
            </section>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="mt-8 grid gap-4 pb-6 sm:mt-10 sm:gap-6 sm:pb-10 xl:grid-cols-[1.4fr_0.9fr]">

              {/* =================================================
                  RECENT ACTIVITY
              ================================================= */}

              <div
                className={`min-w-0 rounded-3xl border p-5 backdrop-blur-xl sm:p-6 ${themeStyles.card}`}
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p
                      className={`text-xs uppercase tracking-[0.16em] ${themeStyles.mutedText}`}
                    >
                      {text(
                        "activity",
                        "Activity"
                      )}
                    </p>

                    <h3
                      className={`mt-2 text-lg font-semibold sm:text-xl ${themeStyles.primaryText}`}
                    >
                      {text(
                        "recentAiInsights",
                        "Recent AI Insights"
                      )}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/chat"
                      )
                    }
                    className="text-xs font-medium text-green-600"
                  >
                    {text(
                      "viewAI",
                      "View AI"
                    )}{" "}
                    →
                  </button>
                </div>

                <div className="mt-5 space-y-3 sm:mt-6">

                  {activities.map(
                    (
                      activity
                    ) => (
                      <div
                        key={
                          activity.title
                        }
                        className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 transition sm:gap-4 sm:p-4 ${themeStyles.innerCard}`}
                      >

                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-400/10 text-lg">
                          {
                            activity.icon
                          }
                        </div>

                        <div className="min-w-0 flex-1">

                          <p
                            className={`truncate text-sm font-medium ${themeStyles.primaryText}`}
                          >
                            {
                              activity.title
                            }
                          </p>

                          <p
                            className={`mt-1 truncate text-xs ${themeStyles.secondaryText}`}
                          >
                            {
                              activity.description
                            }
                          </p>
                        </div>

                        <span
                          className={`shrink-0 text-[10px] ${themeStyles.mutedText}`}
                        >
                          {
                            activity.time
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* =================================================
                  AI STATUS
              ================================================= */}

              <div
                className={`relative min-w-0 overflow-hidden rounded-3xl border border-green-400/20 bg-gradient-to-br p-5 sm:p-6 ${
                  isDark
                    ? "from-[#0d2415] to-[#07130c]"
                    : "from-green-50 to-white shadow-[0_10px_30px_rgba(30,100,50,0.08)]"
                }`}
              >

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs uppercase tracking-[0.16em] text-green-600">
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
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs text-green-600">

                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                      {text(
                        "online",
                        "Online"
                      )}
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">

                    {[
                      [
                        text(
                          "aiAssistant",
                          "AI Assistant"
                        ),
                        text(
                          "operational",
                          "Operational"
                        ),
                      ],

                      [
                        text(
                          "knowledgeBase",
                          "Knowledge Base"
                        ),
                        text(
                          "connected",
                          "Connected"
                        ),
                      ],

                      [
                        text(
                          "languageEngine",
                          "Language Engine"
                        ),
                        text(
                          "ready",
                          "Ready"
                        ),
                      ],

                      [
                        text(
                          "ragSystem",
                          "RAG System"
                        ),
                        text(
                          "active",
                          "Active"
                        ),
                      ],
                    ].map(
                      ([
                        label,
                        status,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          className="flex items-center justify-between gap-3"
                        >

                          <span
                            className={`text-sm ${themeStyles.secondaryText}`}
                          >
                            {
                              label
                            }
                          </span>

                          <span className="flex items-center gap-2 text-xs text-green-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            {
                              status
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/chat"
                      )
                    }
                    className="mt-9 w-full rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-3.5 text-sm font-bold text-[#03150b] shadow-[0_0_25px_rgba(34,255,136,0.2)] transition hover:scale-[1.02]"
                  >
                    {text(
                      "openAiConsultation",
                      "Open AI Consultation"
                    )}{" "}
                    →
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =======================================================
          BELL ANIMATION
      ======================================================= */}

      <style jsx>{`
        @keyframes bell {
          0%,
          100% {
            transform: rotate(0deg);
          }

          20% {
            transform: rotate(-12deg);
          }

          40% {
            transform: rotate(12deg);
          }

          60% {
            transform: rotate(-8deg);
          }

          80% {
            transform: rotate(8deg);
          }
        }
      `}</style>
    </main>
  );
}