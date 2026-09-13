"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useLanguage,
} from "@/context/LanguageContext";

import {
  useTheme,
} from "@/context/ThemeContext";

const API_URL = "http://127.0.0.1:8001";

/* =========================================================
   TYPES
========================================================= */

type FilterType =
  | "all"
  | "ai"
  | "crop"
  | "weather";

type NavItem = {
  id: string;
  labelKey: string;
  fallback: string;
  icon: string;
  path?: string;
};

type Message = {
  id?: number;
  role: string;
  content: string;
  sources?: unknown;
  created_at?: string;
};

type HistoryItem = {
  id: number;
  title?: string;
  user_id?: number;
  created_at?: string;
  message_count?: number;
  messages?: Message[];
};

/* =========================================================
   ICON COMPONENT
========================================================= */

function Icon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg">
      {children}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function MyHistoryPage() {
  const router = useRouter();

  const { t } = useLanguage();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDark = theme === "dark";

  /* =======================================================
     STATE
  ======================================================= */

  const [history, setHistory] = useState<
    HistoryItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [selectedChat, setSelectedChat] =
    useState<HistoryItem | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const [user, setUser] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [profileImage, setProfileImage] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [clearing, setClearing] =
    useState(false);

  const accountMenuRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     TRANSLATION HELPER
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
     THEME STYLES
  ======================================================= */

  const themeStyles = {
    page: isDark
      ? "bg-[#06110a] text-white"
      : "bg-[#f3f8f3] text-[#142117]",

    sidebar: isDark
      ? "border-white/10 bg-[#06120b]/95"
      : "border-[#b9d8c0] bg-white/95 shadow-xl",

    topbar: isDark
      ? "border-white/10 bg-[#06120b]/70"
      : "border-[#c8dfce] bg-white/80 shadow-sm",

    card: isDark
      ? "border-white/10 bg-[#08170e]/70"
      : "border-[#c8dfce] bg-white/80 shadow-[0_10px_30px_rgba(30,80,45,0.08)]",

    softCard: isDark
      ? "border-white/10 bg-white/[0.025]"
      : "border-[#c8dfce] bg-white/75 shadow-[0_8px_25px_rgba(30,80,45,0.06)]",

    innerCard: isDark
      ? "border-white/[0.06] bg-white/[0.03]"
      : "border-[#d9e8dc] bg-[#f8fcf8]",

    primaryText: isDark
      ? "text-white"
      : "text-[#142117]",

    secondaryText: isDark
      ? "text-white/55"
      : "text-[#526557]",

    mutedText: isDark
      ? "text-white/35"
      : "text-[#78897c]",

    inactiveNav: isDark
      ? "text-white/55"
      : "text-[#607064]",

    navHover: isDark
      ? "hover:bg-white/5 hover:text-white"
      : "hover:bg-green-50 hover:text-green-800",

    activeNav: isDark
      ? "bg-green-500/[0.10] text-green-400"
      : "bg-green-50 text-green-700",

    popup: isDark
      ? "border-white/10 bg-[#0b1b10]/95"
      : "border-[#c8dfce] bg-white/95 shadow-[0_15px_50px_rgba(30,80,45,0.18)]",
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      labelKey: "dashboard",
      fallback: "Dashboard",
      icon: "⌂",
      path: "/dashboard",
    },
    {
      id: "aiConsultation",
      labelKey: "aiConsultation",
      fallback: "AI Consultation",
      icon: "✦",
      path: "/chat",
    },
    {
      id: "cropHealth",
      labelKey: "cropHealth",
      fallback: "Crop Health",
      icon: "🌱",
      path: "/crop_health",
    },
    {
      id: "weatherInsights",
      labelKey: "weatherInsights",
      fallback: "Weather Insights",
      icon: "☀",
      path: "/weather-insights",
    },
    {
      id: "marketPrices",
      labelKey: "marketPrices",
      fallback: "Market Prices",
      icon: "📈",
      path: "/market-prices",
    },
    {
      id: "myHistory",
      labelKey: "myHistory",
      fallback: "My History",
      icon: "◷",
    },
  ];

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    const savedEmail =
      localStorage.getItem("email");

    if (savedUser) {
      setUser(savedUser);
    }

    if (savedEmail) {
      setEmail(savedEmail);
    }

    const userId =
      localStorage.getItem("user_id");

    if (!userId) return;

    async function loadProfile() {
      try {
        const response =
          await fetch(
            `${API_URL}/users/${userId}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) return;

        const data =
          await response.json();

        const fullName =
          `${data.first_name || ""} ${
            data.last_name || ""
          }`.trim();

        const finalName =
          fullName ||
          data.first_name ||
          savedUser ||
          "";

        const finalEmail =
          data.email ||
          savedEmail ||
          "";

        setUser(finalName);
        setEmail(finalEmail);

        if (data.profile_image) {
          const image =
            data.profile_image.startsWith(
              "http"
            )
              ? data.profile_image
              : `${API_URL}${data.profile_image}`;

          setProfileImage(
            `${image}?t=${Date.now()}`
          );
        }

        localStorage.setItem(
          "user",
          finalName
        );

        localStorage.setItem(
          "email",
          finalEmail
        );
      } catch (err) {
        console.error(
          "Profile error:",
          err
        );
      }
    }

    loadProfile();
  }, []);

  /* =======================================================
     CLOSE ACCOUNT MENU
  ======================================================= */

  useEffect(() => {
    function handleOutside(
      event: MouseEvent
    ) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener(
        "mousedown",
        handleOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, [accountMenuOpen]);

  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  const loadHistory =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const userId =
          localStorage.getItem(
            "user_id"
          ) || "1";

        const response =
          await fetch(
            `${API_URL}/history?user_id=${encodeURIComponent(
              userId
            )}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json().catch(
            () => null
          );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Failed to load history"
          );
        }

        let items: HistoryItem[] = [];

        if (Array.isArray(data)) {
          items = data;
        } else if (
          Array.isArray(data?.history)
        ) {
          items = data.history;
        } else if (
          Array.isArray(data?.conversations)
        ) {
          items = data.conversations;
        }

        setHistory(items);
      } catch (err) {
        console.error(
          "History error:",
          err
        );

        setError(
          "Unable to load your history. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* =======================================================
     FILTER CATEGORY
  ======================================================= */

  function getCategory(
    item: HistoryItem
  ): FilterType {
    const title =
      item.title
        ?.toLowerCase()
        .trim() || "";

    if (
      title.includes("crop") ||
      title.includes("disease") ||
      title.includes("plant") ||
      title.includes("leaf")
    ) {
      return "crop";
    }

    if (
      title.includes("weather") ||
      title.includes("forecast") ||
      title.includes("rain") ||
      title.includes("temperature")
    ) {
      return "weather";
    }

    return "ai";
  }

  /* =======================================================
     FILTERED HISTORY
  ======================================================= */

  const filteredHistory =
    useMemo(() => {
      let result = [...history];

      if (filter !== "all") {
        result = result.filter(
          (item) =>
            getCategory(item) === filter
        );
      }

      const query =
        search.trim().toLowerCase();

      if (query) {
        result = result.filter(
          (item) => {
            const title =
              item.title
                ?.toLowerCase() || "";

            const messages =
              item.messages || [];

            const messageMatch =
              messages.some(
                (message) =>
                  message.content
                    ?.toLowerCase()
                    .includes(query)
              );

            return (
              title.includes(query) ||
              messageMatch
            );
          }
        );
      }

      return result;
    }, [history, filter, search]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalMessages =
    history.reduce(
      (total, item) =>
        total +
        (item.message_count ??
          item.messages?.length ??
          0),
      0
    );

  const cropCount =
    history.filter(
      (item) =>
        getCategory(item) === "crop"
    ).length;

  const weatherCount =
    history.filter(
      (item) =>
        getCategory(item) === "weather"
    ).length;

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "Recently";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Recently";
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  /* =======================================================
     PREVIEW
  ======================================================= */

  function getPreview(
    item: HistoryItem
  ) {
    const messages =
      item.messages || [];

    if (!messages.length) {
      return "Open this consultation to view the conversation.";
    }

    const userMessage =
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "user"
        );

    const message =
      userMessage ||
      messages[messages.length - 1];

    const content =
      message?.content || "";

    if (!content) {
      return "Conversation available.";
    }

    return content.length > 150
      ? `${content.substring(
          0,
          150
        )}...`
      : content;
  }

  /* =======================================================
     CATEGORY DATA
  ======================================================= */

  function categoryInfo(
    item: HistoryItem
  ) {
    const category =
      getCategory(item);

    if (category === "crop") {
      return {
        label: "Crop Health",
        icon: "🌱",
      };
    }

    if (category === "weather") {
      return {
        label: "Weather Intelligence",
        icon: "☀️",
      };
    }

    return {
      label: "AI Consultation",
      icon: "✦",
    };
  }

  /* =======================================================
     OPEN CONVERSATION
  ======================================================= */

  function openConversation(
    item: HistoryItem
  ) {
    router.push(
      `/chat?conversation_id=${item.id}`
    );

    setMobileMenuOpen(false);
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteHistory(
    conversationId: number
  ) {
    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(
        conversationId
      );

      const userId =
        localStorage.getItem(
          "user_id"
        ) || "1";

      const response =
        await fetch(
          `${API_URL}/history/${conversationId}?user_id=${encodeURIComponent(
            userId
          )}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      setHistory(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              conversationId
          )
      );

      if (
        selectedChat?.id ===
        conversationId
      ) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      window.alert(
        "Unable to delete this conversation."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  async function clearAllHistory() {
    if (!history.length) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to clear your complete history? This cannot be undone."
      );

    if (!confirmed) return;

    try {
      setClearing(true);

      const userId =
        localStorage.getItem(
          "user_id"
        ) || "1";

      const response =
        await fetch(
          `${API_URL}/history?user_id=${encodeURIComponent(
            userId
          )}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Clear failed"
        );
      }

      setHistory([]);
      setSelectedChat(null);
    } catch (err) {
      console.error(
        "Clear history error:",
        err
      );

      window.alert(
        "Unable to clear history."
      );
    } finally {
      setClearing(false);
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "email"
    );

    localStorage.removeItem(
      "user_id"
    );

    setAccountMenuOpen(false);

    router.replace("/");
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function handleNavigation(
    item: NavItem
  ) {
    setAccountMenuOpen(false);

    if (item.path) {
      router.push(item.path);
    }

    setMobileMenuOpen(false);
  }

  /* =======================================================
     FILTER BUTTON
  ======================================================= */

  function FilterButton({
    type,
    label,
    icon,
  }: {
    type: FilterType;
    label: string;
    icon: string;
  }) {
    const active =
      filter === type;

    return (
      <button
        type="button"
        onClick={() =>
          setFilter(type)
        }
        className={`
          group flex shrink-0 items-center
          gap-2 rounded-xl border px-4 py-2.5
          text-xs font-semibold transition-all
          sm:text-sm
          ${
            active
              ? isDark
                ? "border-green-400/30 bg-green-400/[0.12] text-green-300 shadow-[0_0_25px_rgba(34,255,136,0.08)]"
                : "border-green-400 bg-green-50 text-green-700 shadow-sm"
              : isDark
              ? "border-white/10 bg-white/[0.025] text-white/45 hover:border-green-400/20 hover:bg-green-400/[0.05] hover:text-white"
              : "border-[#d3e5d7] bg-white text-[#718177] hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          }
        `}
      >
        <span>{icon}</span>
        {label}

        {type === "all" && (
          <span
            className={`
              rounded-md px-1.5 py-0.5 text-[10px]
              ${
                active
                  ? isDark
                    ? "bg-green-400/15 text-green-300"
                    : "bg-green-100 text-green-700"
                  : isDark
                  ? "bg-white/5 text-white/30"
                  : "bg-black/5 text-black/35"
              }
            `}
          >
            {history.length}
          </span>
        )}
      </button>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main
      className={`
        theme-root min-h-screen
        ${themeStyles.page}
      `}
    >
      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 hidden
          h-screen border-r transition-all
          duration-300 md:flex md:flex-col
          ${
            sidebarCollapsed
              ? "w-[72px]"
              : "w-[250px]"
          }
          ${themeStyles.sidebar}
        `}
      >
        {/* LOGO */}

        <div
          className={`
            flex h-[94px] shrink-0 items-center
            border-b border-green-400/10
            ${
              sidebarCollapsed
                ? "justify-center px-2"
                : "gap-3 px-5"
            }
          `}
        >
          <div
            className="
              grid h-12 w-12 shrink-0
              place-items-center rounded-2xl
              bg-gradient-to-br
              from-green-300
              via-emerald-500
              to-green-700
              text-2xl
              shadow-[0_0_30px_rgba(34,255,136,0.25)]
            "
          >
            🌾
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1
                className={`text-xl font-bold ${themeStyles.primaryText}`}
              >
                Agri
                <span className="text-green-500">
                  AI
                </span>
              </h1>

              <p
                className={`mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${themeStyles.mutedText}`}
              >
                Smart Farming
              </p>
            </div>
          )}
        </div>

        {/* MENU */}

        <div className="flex-1 overflow-y-auto px-3 py-6">
          {!sidebarCollapsed && (
            <p
              className={`
                mb-4 px-3 text-[11px]
                font-bold uppercase
                tracking-[0.18em]
                ${themeStyles.mutedText}
              `}
            >
              Main Menu
            </p>
          )}

          <nav className="space-y-2">
            {navItems.map(
              (item) => {
                const active =
                  item.id ===
                  "myHistory";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleNavigation(
                        item
                      )
                    }
                    title={
                      sidebarCollapsed
                        ? item.fallback
                        : undefined
                    }
                    className={`
                      relative flex w-full
                      items-center rounded-2xl
                      transition-all duration-200
                      ${
                        sidebarCollapsed
                          ? "justify-center px-2 py-3"
                          : "gap-3 px-3 py-3"
                      }
                      ${
                        active
                          ? themeStyles.activeNav
                          : `${themeStyles.inactiveNav} ${themeStyles.navHover}`
                      }
                    `}
                  >
                    {active && (
                      <span
                        className="
                          absolute left-0 top-1/2
                          h-7 w-1 -translate-y-1/2
                          rounded-r-full
                          bg-green-400
                          shadow-[0_0_12px_rgba(34,255,136,0.8)]
                        "
                      />
                    )}

                    <Icon>
                      <span
                        className={
                          active
                            ? "text-green-400"
                            : ""
                        }
                      >
                        {item.icon}
                      </span>
                    </Icon>

                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">
                        {text(
                          item.labelKey,
                          item.fallback
                        )}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </nav>
        </div>

        {/* ACCOUNT */}

        <div
          className="
            shrink-0 border-t
            border-green-400/10 p-3
          "
        >
          <div
            ref={
              accountMenuRef
            }
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setAccountMenuOpen(
                  (previous) =>
                    !previous
                )
              }
              className={`
                flex w-full items-center
                rounded-xl py-2
                transition
                hover:bg-green-500/[0.08]
                ${
                  sidebarCollapsed
                    ? "justify-center px-0"
                    : "gap-3 px-2"
                }
              `}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="
                    h-9 w-9 shrink-0
                    rounded-full object-cover
                    ring-2 ring-green-400/20
                  "
                />
              ) : (
                <div
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-green-500/20
                    text-sm font-bold
                    text-green-300
                  "
                >
                  {user
                    ? user
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>
              )}

              {!sidebarCollapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className={`
                        truncate text-xs
                        font-semibold
                        ${themeStyles.primaryText}
                      `}
                    >
                      {user || "User"}
                    </p>

                    <p
                      className={`
                        truncate text-[10px]
                        ${themeStyles.accountMuted}
                      `}
                    >
                      {email ||
                        "Farmer Account"}
                    </p>
                  </div>

                  <span
                    className={`text-xs ${themeStyles.mutedText}`}
                  >
                    ⋯
                  </span>
                </>
              )}
            </button>

            <AnimatePresence>
              {accountMenuOpen &&
                !sidebarCollapsed && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 8,
                      scale: 0.98,
                    }}
                    className={`
                      absolute bottom-14
                      left-0 right-0
                      overflow-hidden
                      rounded-2xl border
                      p-2 shadow-2xl
                      backdrop-blur-xl
                      ${themeStyles.popup}
                    `}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/settings"
                        )
                      }
                      className={`
                        flex w-full
                        items-center gap-2
                        rounded-xl px-3 py-2.5
                        text-left text-xs
                        ${themeStyles.primaryText}
                        ${themeStyles.navHover}
                      `}
                    >
                      ⚙️
                      Settings
                    </button>

                    <button
                      type="button"
                      onClick={
                        toggleTheme
                      }
                      className={`
                        flex w-full
                        items-center gap-2
                        rounded-xl px-3 py-2.5
                        text-left text-xs
                        ${themeStyles.primaryText}
                        ${themeStyles.navHover}
                      `}
                    >
                      {isDark
                        ? "☀️"
                        : "🌙"}

                      {isDark
                        ? "Light Theme"
                        : "Dark Theme"}
                    </button>

                    <div
                      className={`
                        my-1 border-t
                        ${
                          isDark
                            ? "border-white/10"
                            : "border-[#d9e8dc]"
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="
                        flex w-full
                        items-center gap-2
                        rounded-xl px-3 py-2.5
                        text-left text-xs
                        text-red-400
                        hover:bg-red-500/10
                      "
                    >
                      ↪
                      Log out
                    </button>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MOBILE SIDEBAR OVERLAY
      =================================================== */}

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
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              className="
                fixed inset-0 z-[60]
                bg-black/60
                backdrop-blur-sm
                md:hidden
              "
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
                stiffness: 300,
                damping: 30,
              }}
              className={`
                fixed left-0 top-0
                z-[70] flex h-screen
                w-[280px] flex-col
                border-r
                md:hidden
                ${themeStyles.sidebar}
              `}
            >
              {/* MOBILE LOGO */}

              <div
                className="
                  flex h-[90px]
                  items-center
                  justify-between
                  border-b
                  border-green-400/10
                  px-5
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      grid h-11 w-11
                      place-items-center
                      rounded-2xl
                      bg-gradient-to-br
                      from-green-300
                      via-emerald-500
                      to-green-700
                      text-xl
                    "
                  >
                    🌾
                  </div>

                  <div>
                    <h1 className="text-lg font-bold">
                      Agri
                      <span className="text-green-500">
                        AI
                      </span>
                    </h1>

                    <p
                      className={`text-[9px] uppercase tracking-[0.16em] ${themeStyles.mutedText}`}
                    >
                      Smart Farming
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    bg-white/5
                    text-lg
                  "
                >
                  ×
                </button>
              </div>

              {/* MOBILE NAV */}

              <div className="flex-1 overflow-y-auto px-3 py-6">
                <p
                  className={`
                    mb-4 px-3 text-[11px]
                    font-bold uppercase
                    tracking-[0.18em]
                    ${themeStyles.mutedText}
                  `}
                >
                  Main Menu
                </p>

                <nav className="space-y-2">
                  {navItems.map(
                    (item) => {
                      const active =
                        item.id ===
                        "myHistory";

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleNavigation(
                              item
                            )
                          }
                          className={`
                            relative flex w-full
                            items-center gap-3
                            rounded-2xl px-3 py-3
                            ${
                              active
                                ? themeStyles.activeNav
                                : `${themeStyles.inactiveNav} ${themeStyles.navHover}`
                            }
                          `}
                        >
                          {active && (
                            <span
                              className="
                                absolute left-0
                                top-1/2 h-7 w-1
                                -translate-y-1/2
                                rounded-r-full
                                bg-green-400
                              "
                            />
                          )}

                          <Icon>
                            <span
                              className={
                                active
                                  ? "text-green-400"
                                  : ""
                              }
                            >
                              {
                                item.icon
                              }
                            </span>
                          </Icon>

                          <span className="text-sm font-medium">
                            {text(
                              item.labelKey,
                              item.fallback
                            )}
                          </span>
                        </button>
                      );
                    }
                  )}
                </nav>
              </div>

              {/* MOBILE ACCOUNT */}

              <div
                className="
                  border-t
                  border-green-400/10
                  p-4
                "
              >
                <div className="flex items-center gap-3">
                  {profileImage ? (
                    <img
                      src={
                        profileImage
                      }
                      alt="Profile"
                      className="
                        h-10 w-10
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-green-500/20
                        font-bold
                        text-green-300
                      "
                    >
                      {user
                        ? user
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p
                      className={`
                        truncate text-sm
                        font-semibold
                        ${themeStyles.primaryText}
                      `}
                    >
                      {user ||
                        "User"}
                    </p>

                    <p
                      className={`
                        truncate text-[10px]
                        ${themeStyles.mutedText}
                      `}
                    >
                      Farmer Account
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div
        className={`
          min-h-screen transition-all
          duration-300
          ${
            sidebarCollapsed
              ? "md:pl-[72px]"
              : "md:pl-[250px]"
          }
        `}
      >
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header
          className={`
            sticky top-0 z-40
            flex h-[76px]
            items-center justify-between
            border-b px-4
            backdrop-blur-xl
            sm:px-6 lg:px-8
            ${themeStyles.topbar}
          `}
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* SIDEBAR BUTTON */}

            <button
              type="button"
              onClick={() => {
                if (
                  window.innerWidth <
                  768
                ) {
                  setMobileMenuOpen(
                    true
                  );
                } else {
                  setSidebarCollapsed(
                    (previous) =>
                      !previous
                  );
                }
              }}
              className={`
                flex h-9 w-9
                shrink-0 items-center
                justify-center
                rounded-xl border
                text-base transition
                ${
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-white/55 hover:border-green-400/30 hover:text-green-300"
                    : "border-[#c8dfce] bg-white text-[#607064] hover:border-green-400 hover:text-green-700"
                }
              `}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-green-500
                  sm:text-[10px]
                "
              >
                Agricultural Intelligence
              </p>

              <h2
                className={`
                  mt-1 truncate
                  text-base font-bold
                  sm:text-lg
                  ${themeStyles.primaryText}
                `}
              >
                My Farming History
              </h2>
            </div>
          </div>

          {/* HEADER RIGHT */}

          <div className="flex shrink-0 items-center gap-2">
            {/* THEME */}

            <button
              type="button"
              onClick={
                toggleTheme
              }
              title={
                isDark
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              className={`
                flex h-9 w-9
                items-center
                justify-center
                rounded-xl border
                transition
                ${
                  isDark
                    ? "border-white/10 bg-white/[0.03] hover:border-green-400/30 hover:bg-green-400/[0.05]"
                    : "border-[#c8dfce] bg-white hover:border-green-400 hover:bg-green-50"
                }
              `}
            >
              {isDark
                ? "☀️"
                : "🌙"}
            </button>

            {/* ASK AI */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/chat"
                )
              }
              className="
                hidden
                rounded-xl
                bg-gradient-to-r
                from-green-400
                to-emerald-500
                px-4 py-2.5
                text-xs font-bold
                text-[#03150b]
                shadow-[0_0_25px_rgba(34,255,136,0.18)]
                transition
                hover:scale-[1.02]
                sm:block
              "
            >
              Ask AI ✦
            </button>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* =================================================
              HERO
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className={`
              relative overflow-hidden
              rounded-3xl border
              p-5 sm:p-7 lg:p-8
              ${themeStyles.card}
            `}
          >
            {/* GLOW */}

            <div
              className="
                pointer-events-none
                absolute -right-20 -top-20
                h-64 w-64
                rounded-full
                bg-green-400/10
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute -bottom-28
                left-1/3
                h-56 w-56
                rounded-full
                bg-emerald-500/5
                blur-3xl
              "
            />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div
                  className="
                    inline-flex
                    items-center gap-2
                    rounded-full
                    border
                    border-green-400/20
                    bg-green-400/[0.06]
                    px-3 py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-green-400
                  "
                >
                  <span
                    className="
                      h-1.5 w-1.5
                      rounded-full
                      bg-green-400
                      shadow-[0_0_10px_rgba(34,255,136,0.8)]
                    "
                  />

                  Personal Activity
                </div>

                <h1
                  className={`
                    mt-4
                    text-3xl
                    font-bold
                    tracking-tight
                    sm:text-4xl
                    lg:text-5xl
                    ${themeStyles.primaryText}
                  `}
                >
                  Your farming
                  <br className="hidden sm:block" />

                  <span className="text-green-500">
                    intelligence history.
                  </span>
                </h1>

                <p
                  className={`
                    mt-4 max-w-xl
                    text-sm leading-6
                    sm:text-base
                    ${themeStyles.secondaryText}
                  `}
                >
                  Review your previous AI
                  consultations, farming
                  questions and agricultural
                  insights in one place.
                </p>
              </div>

              {/* HERO ICON */}

              <div className="relative hidden h-44 w-44 shrink-0 items-center justify-center lg:flex">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute
                    h-40 w-40
                    rounded-full
                    border
                    border-green-400/20
                  "
                />

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="
                    relative grid
                    h-20 w-20
                    place-items-center
                    rounded-full
                    bg-gradient-to-br
                    from-green-300
                    via-emerald-500
                    to-green-700
                    text-3xl
                    shadow-[0_0_60px_rgba(34,255,136,0.35)]
                  "
                >
                  ◷
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4">
            {[
              {
                label: "Total Consultations",
                value: history.length,
                icon: "✦",
              },
              {
                label: "Messages",
                value: totalMessages,
                icon: "💬",
              },
              {
                label: "Crop Analysis",
                value: cropCount,
                icon: "🌱",
              },
              {
                label: "Weather",
                value: weatherCount,
                icon: "☀️",
              },
            ].map(
              (stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.08 +
                      index * 0.06,
                  }}
                  whileHover={{
                    y: -4,
                  }}
                  className={`
                    rounded-3xl
                    border p-4
                    sm:p-5
                    ${themeStyles.card}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl">
                      {stat.icon}
                    </span>

                    <span
                      className="
                        h-1.5 w-1.5
                        rounded-full
                        bg-green-400
                        shadow-[0_0_10px_rgba(34,255,136,0.8)]
                      "
                    />
                  </div>

                  <p
                    className={`
                      mt-4
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      sm:text-[10px]
                      ${themeStyles.mutedText}
                    `}
                  >
                    {stat.label}
                  </p>

                  <h3
                    className={`
                      mt-1
                      text-2xl
                      font-bold
                      sm:text-3xl
                      ${themeStyles.primaryText}
                    `}
                  >
                    {stat.value}
                  </h3>
                </motion.div>
              )
            )}
          </section>

          {/* =================================================
              HISTORY SECTION
          ================================================= */}

          <section className="mt-7 sm:mt-9">
            {/* SECTION HEADER */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-green-500
                  "
                >
                  Activity
                </p>

                <h2
                  className={`
                    mt-1.5
                    text-2xl
                    font-bold
                    sm:text-3xl
                    ${themeStyles.primaryText}
                  `}
                >
                  Recent Activity
                </h2>

                <p
                  className={`
                    mt-1
                    text-xs
                    sm:text-sm
                    ${themeStyles.secondaryText}
                  `}
                >
                  Your latest conversations and
                  agricultural insights.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  clearing ||
                  history.length === 0
                }
                onClick={
                  clearAllHistory
                }
                className={`
                  rounded-xl
                  border px-4 py-2.5
                  text-xs font-semibold
                  transition
                  ${
                    clearing ||
                    history.length ===
                      0
                      ? "cursor-not-allowed opacity-35"
                      : isDark
                      ? "border-red-400/20 bg-red-400/[0.05] text-red-300 hover:bg-red-400/10"
                      : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  }
                `}
              >
                {clearing
                  ? "Clearing..."
                  : "Clear History"}
              </button>
            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div
              className={`
                rounded-3xl
                border p-4
                sm:p-5
                ${themeStyles.card}
              `}
            >
              <div className="relative">
                <span
                  className={`
                    pointer-events-none
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-sm
                    ${themeStyles.mutedText}
                  `}
                >
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search your farming conversations..."
                  className={`
                    h-12 w-full
                    rounded-2xl
                    border
                    pl-11 pr-4
                    text-sm
                    outline-none
                    transition
                    ${
                      isDark
                        ? "border-white/10 bg-white/[0.025] text-white placeholder:text-white/25 focus:border-green-400/30 focus:bg-green-400/[0.03]"
                        : "border-[#d9e8dc] bg-[#f8fcf8] text-[#142117] placeholder:text-[#8a988e] focus:border-green-400 focus:bg-white"
                    }
                  `}
                />
              </div>

              {/* FILTERS */}

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                <FilterButton
                  type="all"
                  label="All Activity"
                  icon="◉"
                />

                <FilterButton
                  type="ai"
                  label="AI Chat"
                  icon="✦"
                />

                <FilterButton
                  type="crop"
                  label="Crop Health"
                  icon="🌱"
                />

                <FilterButton
                  type="weather"
                  label="Weather"
                  icon="☀️"
                />
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={`
                  mt-4
                  rounded-2xl
                  border
                  p-4
                  ${
                    isDark
                      ? "border-red-400/20 bg-red-400/[0.05]"
                      : "border-red-200 bg-red-50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    ⚠️
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        text-sm font-semibold
                        ${themeStyles.primaryText}
                      `}
                    >
                      Unable to load history
                    </p>

                    <p
                      className={`
                        mt-1 text-xs
                        ${themeStyles.secondaryText}
                      `}
                    >
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      loadHistory
                    }
                    className="
                      rounded-lg
                      bg-green-500/10
                      px-3 py-2
                      text-xs
                      font-semibold
                      text-green-500
                    "
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="mt-5 space-y-3">
                {[
                  1, 2, 3, 4,
                ].map((item) => (
                  <div
                    key={item}
                    className={`
                      animate-pulse
                      rounded-3xl
                      border p-5
                      ${themeStyles.card}
                    `}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`
                          h-12 w-12
                          shrink-0 rounded-2xl
                          ${
                            isDark
                              ? "bg-white/5"
                              : "bg-black/5"
                          }
                        `}
                      />

                      <div className="flex-1">
                        <div
                          className={`
                            h-4 w-1/3
                            rounded
                            ${
                              isDark
                                ? "bg-white/10"
                                : "bg-black/10"
                            }
                          `}
                        />

                        <div
                          className={`
                            mt-3 h-3 w-3/4
                            rounded
                            ${
                              isDark
                                ? "bg-white/10"
                                : "bg-black/10"
                            }
                          `}
                        />

                        <div
                          className={`
                            mt-4 h-3 w-1/4
                            rounded
                            ${
                              isDark
                                ? "bg-white/10"
                                : "bg-black/10"
                            }
                          `}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length ===
              0 ? (
              /* ===============================================
                 EMPTY STATE
              =============================================== */

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={`
                  mt-5
                  flex min-h-[340px]
                  flex-col items-center
                  justify-center
                  rounded-3xl
                  border
                  px-6
                  text-center
                  ${themeStyles.card}
                `}
              >
                <div
                  className="
                    relative
                    mb-5
                    flex h-20 w-20
                    items-center
                    justify-center
                    rounded-3xl
                    bg-green-400/[0.08]
                    text-3xl
                  "
                >
                  {search
                    ? "⌕"
                    : "◷"}

                  <span
                    className="
                      absolute
                      right-1
                      top-1
                      h-2
                      w-2
                      rounded-full
                      bg-green-400
                      shadow-[0_0_12px_rgba(34,255,136,0.8)]
                    "
                  />
                </div>

                <h3
                  className={`
                    text-xl
                    font-bold
                    ${themeStyles.primaryText}
                  `}
                >
                  {search
                    ? "No matching activity"
                    : "Your history is empty"}
                </h3>

                <p
                  className={`
                    mt-2 max-w-md
                    text-sm leading-6
                    ${themeStyles.secondaryText}
                  `}
                >
                  {search
                    ? "Try another search term or select a different activity filter."
                    : "Start an AI consultation and your farming conversations will automatically appear here."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/chat"
                      )
                    }
                    className="
                      mt-6
                      rounded-xl
                      bg-gradient-to-r
                      from-green-400
                      to-emerald-500
                      px-5 py-3
                      text-sm
                      font-bold
                      text-[#03150b]
                      shadow-[0_0_25px_rgba(34,255,136,0.16)]
                      transition
                      hover:scale-[1.02]
                    "
                  >
                    Start AI Consultation →
                  </button>
                )}
              </motion.div>
            ) : (
              /* ===============================================
                 HISTORY LIST
              =============================================== */

              <div className="mt-5 space-y-3">
                {filteredHistory.map(
                  (item, index) => {
                    const info =
                      categoryInfo(
                        item
                      );

                    return (
                      <motion.div
                        key={item.id}
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.04,
                        }}
                        className={`
                          group
                          rounded-3xl
                          border
                          p-4
                          transition-all
                          duration-200
                          sm:p-5
                          ${themeStyles.card}
                          ${
                            isDark
                              ? "hover:border-green-400/20 hover:bg-green-400/[0.025]"
                              : "hover:border-green-300 hover:shadow-[0_12px_35px_rgba(30,100,45,0.09)]"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* ICON */}

                          <div
                            className={`
                              flex h-12 w-12
                              shrink-0
                              items-center
                              justify-center
                              rounded-2xl
                              text-xl
                              transition
                              group-hover:scale-105
                              ${
                                isDark
                                  ? "bg-green-400/[0.08]"
                                  : "bg-green-50"
                              }
                            `}
                          >
                            {info.icon}
                          </div>

                          {/* MAIN */}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedChat(
                                    item
                                  )
                                }
                                className={`
                                  min-w-0
                                  text-left
                                  text-sm
                                  font-semibold
                                  transition
                                  hover:text-green-500
                                  sm:text-base
                                  ${themeStyles.primaryText}
                                `}
                              >
                                <span className="line-clamp-2">
                                  {item.title ||
                                    "New Agricultural Consultation"}
                                </span>
                              </button>

                              <span
                                className={`
                                  shrink-0
                                  text-[10px]
                                  sm:text-xs
                                  ${themeStyles.mutedText}
                                `}
                              >
                                {formatDate(
                                  item.created_at
                                )}
                              </span>
                            </div>

                            <p
                              className={`
                                mt-2
                                line-clamp-2
                                text-xs
                                leading-5
                                sm:text-sm
                                ${themeStyles.secondaryText}
                              `}
                            >
                              {getPreview(
                                item
                              )}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  px-2.5
                                  py-1
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  tracking-wide
                                  ${
                                    isDark
                                      ? "border-green-400/10 bg-green-400/[0.06] text-green-300"
                                      : "border-green-200 bg-green-50 text-green-700"
                                  }
                                `}
                              >
                                {info.icon}
                                {info.label}
                              </span>

                              <span
                                className={`
                                  text-[10px]
                                  ${themeStyles.mutedText}
                                `}
                              >
                                {item.message_count ??
                                  item
                                    .messages
                                    ?.length ??
                                  0}{" "}
                                messages
                              </span>
                            </div>
                          </div>

                          {/* ACTIONS */}

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openConversation(
                                  item
                                )
                              }
                              className={`
                                hidden
                                h-9
                                items-center
                                justify-center
                                rounded-xl
                                px-3
                                text-xs
                                font-semibold
                                transition
                                sm:flex
                                ${
                                  isDark
                                    ? "bg-white/5 text-white/60 hover:bg-green-400/10 hover:text-green-300"
                                    : "bg-black/5 text-[#607064] hover:bg-green-50 hover:text-green-700"
                                }
                              `}
                            >
                              Open →
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                item.id
                              }
                              onClick={() =>
                                deleteHistory(
                                  item.id
                                )
                              }
                              title="Delete"
                              className={`
                                flex h-9 w-9
                                items-center
                                justify-center
                                rounded-xl
                                text-sm
                                transition
                                ${
                                  isDark
                                    ? "text-white/30 hover:bg-red-400/10 hover:text-red-300"
                                    : "text-[#87948b] hover:bg-red-50 hover:text-red-600"
                                }
                              `}
                            >
                              {deletingId ===
                              item.id
                                ? "..."
                                : "⌫"}
                            </button>
                          </div>
                        </div>

                        {/* MOBILE OPEN */}

                        <button
                          type="button"
                          onClick={() =>
                            openConversation(
                              item
                            )
                          }
                          className={`
                            mt-4
                            w-full
                            rounded-xl
                            py-2.5
                            text-xs
                            font-semibold
                            sm:hidden
                            ${
                              isDark
                                ? "bg-white/5 text-white/65 hover:bg-green-400/10 hover:text-green-300"
                                : "bg-black/5 text-[#607064] hover:bg-green-50 hover:text-green-700"
                            }
                          `}
                        >
                          Open Conversation →
                        </button>
                      </motion.div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="pb-8 pt-8 text-center">
            <p
              className={`
                text-[10px]
                ${themeStyles.mutedText}
              `}
            >
              AgriAI · Smart Farming Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          DETAIL MODAL
      =================================================== */}

      <AnimatePresence>
        {selectedChat && (
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
            onClick={() =>
              setSelectedChat(null)
            }
            className="
              fixed inset-0
              z-[100]
              flex items-center
              justify-center
              bg-black/60
              p-3
              backdrop-blur-sm
              sm:p-5
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className={`
                flex
                max-h-[88vh]
                w-full
                max-w-3xl
                flex-col
                overflow-hidden
                rounded-3xl
                border
                shadow-2xl
                ${themeStyles.card}
              `}
            >
              {/* MODAL HEADER */}

              <div
                className={`
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  px-5 py-4
                  sm:px-6
                  ${
                    isDark
                      ? "border-white/10"
                      : "border-[#d9e8dc]"
                  }
                `}
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-green-500
                    "
                  >
                    Conversation
                  </p>

                  <h3
                    className={`
                      mt-1
                      line-clamp-2
                      text-base
                      font-bold
                      sm:text-lg
                      ${themeStyles.primaryText}
                    `}
                  >
                    {selectedChat.title ||
                      "Agricultural Consultation"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedChat(
                      null
                    )
                  }
                  className={`
                    flex h-9 w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    text-lg
                    ${
                      isDark
                        ? "bg-white/5 text-white/60 hover:bg-white/10"
                        : "bg-black/5 text-[#607064] hover:bg-black/10"
                    }
                  `}
                >
                  ×
                </button>
              </div>

              {/* MESSAGES */}

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {(selectedChat.messages ||
                  []).length ===
                0 ? (
                  <div className="flex min-h-[250px] items-center justify-center text-center">
                    <p
                      className={`
                        text-sm
                        ${themeStyles.secondaryText}
                      `}
                    >
                      No detailed messages
                      available for this
                      conversation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedChat.messages?.map(
                      (
                        message,
                        index
                      ) => {
                        const isUser =
                          message.role ===
                          "user";

                        return (
                          <div
                            key={
                              message.id ??
                              `${message.role}-${index}`
                            }
                            className={`
                              flex
                              ${
                                isUser
                                  ? "justify-end"
                                  : "justify-start"
                              }
                            `}
                          >
                            <div
                              className={`
                                max-w-[90%]
                                rounded-2xl
                                border
                                px-4 py-3
                                sm:max-w-[82%]
                                ${
                                  isUser
                                    ? isDark
                                      ? "border-green-400/20 bg-green-400/[0.10]"
                                      : "border-green-200 bg-green-50"
                                    : isDark
                                    ? "border-white/[0.06] bg-white/[0.03]"
                                    : "border-[#d9e8dc] bg-[#f8fcf8]"
                                }
                              `}
                            >
                              <div
                                className={`
                                  mb-1
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  ${
                                    isUser
                                      ? "text-green-500"
                                      : themeStyles.mutedText
                                  }
                                `}
                              >
                                {isUser
                                  ? "You"
                                  : "AgriAI"}
                              </div>

                              <p
                                className={`
                                  whitespace-pre-wrap
                                  text-sm
                                  leading-6
                                  ${themeStyles.primaryText}
                                `}
                              >
                                {
                                  message.content
                                }
                              </p>

                              {message.created_at && (
                                <p
                                  className={`
                                    mt-2
                                    text-[9px]
                                    ${themeStyles.mutedText}
                                  `}
                                >
                                  {formatDate(
                                    message.created_at
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div
                className={`
                  border-t
                  p-4
                  ${
                    isDark
                      ? "border-white/10"
                      : "border-[#d9e8dc]"
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() =>
                    openConversation(
                      selectedChat
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-green-400
                    to-emerald-500
                    py-3
                    text-sm
                    font-bold
                    text-[#03150b]
                    shadow-[0_0_25px_rgba(34,255,136,0.14)]
                    transition
                    hover:scale-[1.01]
                  "
                >
                  Continue Conversation →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}