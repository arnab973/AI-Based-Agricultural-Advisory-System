"use client";

/* =========================================================
   IMPORTS
========================================================= */

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
  type MouseEvent,
} from "react";

import { useRouter } from "next/navigation";

import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

/* =========================================================
   TYPES
========================================================= */

type Language = "en" | "hi" | "bn" | "hinglish";

type Source = {
  file?: string;
  page?: number | null;
  score?: number;
};

type Message = {
  id?: number;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  created_at?: string;
};

type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type MarketPrice = {
  Arrival_Date?: string;
  Commodity?: string;
  District?: string;
  Market?: string;
  Max_Price?: number | string;
  Min_Price?: number | string;
  Modal_Price?: number | string;
  State?: string;
  Variety?: string;
  Grade?: string;
};

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = "http://127.0.0.1:8001";

const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "hi",
  "bn",
  "hinglish",
];

/* =========================================================
   WEATHER KEYWORDS
========================================================= */

const MARKET_KEYWORDS = [
  "mandi",
  "market price",
  "market prices",
  "mandi price",
  "mandi prices",
  "today price",
  "today prices",
  "latest price",
  "latest prices",
  "current price",
  "current prices",
  "market rate",
  "market rates",
  "মাণ্ডি",
  "मंडी",
  "বাজার দর",
  "বাজারের দাম",
];

const MARKET_COMMODITIES = [
  "potato", "আলু", "आलू",
  "tomato", "টমেটো", "टमाटर",
  "onion", "পেঁয়াজ", "प्याज",
  "rice", "চাল", "चावल",
  "wheat", "গম", "गेहूं",
  "maize", "ভুট্টা", "मक्का",
  "mustard", "সরিষা", "सरसों",
  "brinjal", "বেগুন", "बैंगन",
  "cabbage", "বাঁধাকপি", "पत्तागोभी",
  "cauliflower", "ফুলকপি", "फूलगोभी",
  "chilli", "chili", "লঙ্কা", "মिर्च",
];

const MARKET_STATE_ALIASES: Record<string, string> = {
  "west bengal": "West Bengal",
  "wb": "West Bengal",
  "himachal pradesh": "Himachal Pradesh",
  "hp": "Himachal Pradesh",
  "bihar": "Bihar",
  "uttar pradesh": "Uttar Pradesh",
  "up": "Uttar Pradesh",
  "punjab": "Punjab",
  "haryana": "Haryana",
  "odisha": "Odisha",
  "jharkhand": "Jharkhand",
  "assam": "Assam",
  "maharashtra": "Maharashtra",
  "gujarat": "Gujarat",
  "rajasthan": "Rajasthan",
  "madhya pradesh": "Madhya Pradesh",
  "karnataka": "Karnataka",
  "kerala": "Kerala",
  "tamil nadu": "Tamil Nadu",
  "andhra pradesh": "Andhra Pradesh",
  "telangana": "Telangana",
};

const MARKET_DISTRICT_STATE: Record<string, string> = {
  "mandi": "Himachal Pradesh",
  "hooghly": "West Bengal",
  "howrah": "West Bengal",
  "kolkata": "West Bengal",
  "nadia": "West Bengal",
  "burdwan": "West Bengal",
  "bardhaman": "West Bengal",
  "darjeeling": "West Bengal",
  "jalpaiguri": "West Bengal",
  "murshidabad": "West Bengal",
  "malda": "West Bengal",
};

const WEATHER_KEYWORDS = [
  "weather",
  "temperature",
  "forecast",
  "rain",
  "raining",
  "rainfall",
  "humidity",
  "wind",
  "storm",
  "climate",
  "mausam",
  "मौसम",
  "बारिश",
  "तापमान",
  "आबोहवा",
  "আবহাওয়া",
  "বৃষ্টি",
  "তাপমাত্রা",
];

/* =========================================================
   LANGUAGE TEXT
========================================================= */

const WELCOME_MESSAGES: Record<Language, string> = {
  en: "Hello! 🌱 I'm your AI Agricultural Assistant. Ask me anything about crops, farming, irrigation, diseases, government schemes, agricultural practices, or today's weather.",

  hi: "नमस्ते! 🌱 मैं आपका AI Agricultural Assistant हूँ। आप फसलों, खेती, सिंचाई, रोग, सरकारी योजनाओं, कृषि या आज के मौसम के बारे में पूछ सकते हैं।",

  bn: "নমস্কার! 🌱 আমি আপনার AI Agricultural Assistant। আপনি ফসল, কৃষিকাজ, সেচ, রোগ, সরকারি প্রকল্প, কৃষি বা আজকের আবহাওয়া সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।",

  hinglish:
    "Hello! 🌱 Main aapka AI Agricultural Assistant hoon. Aap crops, farming, irrigation, diseases, government schemes, agriculture ya aaj ke weather ke baare mein kuch bhi pooch sakte ho.",
};

const PLACEHOLDERS: Record<Language, string> = {
  en: "Ask anything about farming...",
  hi: "खेती के बारे में कुछ भी पूछें...",
  bn: "কৃষি সম্পর্কে যেকোনো প্রশ্ন করুন...",
  hinglish: "Farming ke baare mein kuch bhi poochho...",
};

const THINKING_MESSAGES: Record<Language, string> = {
  en: "AgriAI is thinking...",
  hi: "AgriAI सोच रहा है...",
  bn: "AgriAI ভাবছে...",
  hinglish: "AgriAI soch raha hai...",
};

const SPEECH_MESSAGES: Record<Language, string> = {
  en: "Converting speech to text...",
  hi: "आवाज़ को टेक्स्ट में बदला जा रहा है...",
  bn: "কথাকে টেক্সটে রূপান্তর করা হচ্ছে...",
  hinglish: "Speech ko text mein convert kiya ja raha hai...",
};

const LOCATION_MESSAGES: Record<Language, string> = {
  en: "Getting your location for weather information...",
  hi: "मौसम की जानकारी के लिए आपकी location ली जा रही है...",
  bn: "আবহাওয়ার তথ্যের জন্য আপনার অবস্থান নেওয়া হচ্ছে...",
  hinglish: "Weather information ke liye aapki location li ja rahi hai...",
};

const ERROR_MESSAGES: Record<Language, string> = {
  en: "⚠️ Unable to connect to the AI server. Please make sure the backend is running.",

  hi: "⚠️ AI server से connect नहीं हो पाया। कृपया backend के चलने की जाँच करें।",

  bn: "⚠️ AI server-এর সাথে সংযোগ করা যায়নি। অনুগ্রহ করে backend চালু আছে কিনা দেখুন।",

  hinglish:
    "⚠️ AI server se connect nahi ho paya. Please check karo ki backend running hai.",
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function isMarketQuestion(text: string) {
  const normalized = text.toLowerCase();
  const hasMarketWord = MARKET_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );
  const hasPriceWord = /\b(price|prices|rate|rates|দাম|দর|कीमत|भाव)\b/i.test(normalized);
  const hasCommodity = MARKET_COMMODITIES.some((commodity) =>
    normalized.includes(commodity.toLowerCase())
  );
  return hasMarketWord || (hasPriceWord && hasCommodity);
}

function detectMarketCommodity(text: string) {
  const normalized = text.toLowerCase();
  const aliases: Array<[string, string[]]> = [
    ["Potato", ["potato", "আলু", "आलू"]],
    ["Tomato", ["tomato", "টমেটো", "टमाटर"]],
    ["Onion", ["onion", "পেঁয়াজ", "प्याज"]],
    ["Rice", ["rice", "চাল", "चावल"]],
    ["Wheat", ["wheat", "গম", "गेहूं"]],
    ["Maize", ["maize", "ভুট্টা", "मक्का"]],
    ["Mustard", ["mustard", "সরিষা", "सरसों"]],
    ["Brinjal", ["brinjal", "বেগুন", "बैंगन"]],
    ["Cabbage", ["cabbage", "বাঁধাকপি", "पत्तागोभी"]],
    ["Cauliflower", ["cauliflower", "ফুলকপি", "फूलगोभी"]],
    ["Chilli", ["chilli", "chili", "লঙ্কা", "मिर्च"]],
  ];
  return aliases.find(([, words]) =>
    words.some((word) => normalized.includes(word.toLowerCase()))
  )?.[0] ?? null;
}

function detectMarketState(text: string, district: string | null) {
  const normalized = text.toLowerCase();
  for (const [alias, state] of Object.entries(MARKET_STATE_ALIASES)) {
    if (normalized.includes(alias)) return state;
  }
  if (district) return MARKET_DISTRICT_STATE[district.toLowerCase()] ?? null;
  return null;
}

function detectMarketDistrict(text: string) {
  const normalized = text.toLowerCase();
  const knownDistricts = Object.keys(MARKET_DISTRICT_STATE);
  return knownDistricts.find((district) =>
    normalized.includes(district.toLowerCase())
  ) ?? null;
}

function formatMarketDate(value?: string) {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

function priceNumber(value?: number | string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isWeatherQuestion(text: string) {
  const normalizedText = text.toLowerCase();

  return WEATHER_KEYWORDS.some((keyword) =>
    normalizedText.includes(keyword.toLowerCase())
  );
}

/* =========================================================
   MAIN CHAT PAGE
========================================================= */

export default function ChatPage() {
  const router = useRouter();

  const { language, setLanguage } = useLanguage();

  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  /* =======================================================
     CHAT STATES
  ======================================================= */

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [marketLoading, setMarketLoading] =
    useState(false);

  const [marketData, setMarketData] =
    useState<MarketPrice | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: WELCOME_MESSAGES.en,
      sources: [],
    },
  ]);

  /* =======================================================
     CONVERSATION STATES
  ======================================================= */

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [
    currentConversationId,
    setCurrentConversationId,
  ] = useState<number | null>(null);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [
    languageChanging,
    setLanguageChanging,
  ] = useState(false);

  /* =======================================================
     VOICE STATES
  ======================================================= */

  const [recording, setRecording] =
    useState(false);

  const [speechLoading, setSpeechLoading] =
    useState(false);

  const [ttsLoadingId, setTtsLoadingId] =
    useState<number | string | null>(null);

  /* =======================================================
     SIDEBAR STATES
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [sidebarSearch, setSidebarSearch] =
    useState("");

  /* =======================================================
     ACCOUNT STATES
  ======================================================= */

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const [userName, setUserName] =
    useState("");

  const [userEmail, setUserEmail] =
    useState("");

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  /* =======================================================
     REFERENCES
  ======================================================= */

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUrlRef =
    useRef<string | null>(null);

  const sidebarSearchRef =
    useRef<HTMLInputElement | null>(null);

  /* =======================================================
     USER AUTHENTICATION
  ======================================================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    const storedEmail =
      localStorage.getItem("email");

    const storedUserId =
      localStorage.getItem("user_id");

    if (!storedUserId) {
      router.replace("/login");
      return;
    }

    setUserName(storedUser || "User");

    setUserEmail(storedEmail || "");
  }, [router]);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    loading,
    speechLoading,
    languageChanging,
    locationLoading,
    marketLoading,
  ]);

  /* =======================================================
     AUTO RESIZE TEXTAREA
  ======================================================= */

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";

    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      128
    )}px`;
  }, [question]);

  /* =======================================================
     AUDIO CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );
      }
    };
  }, []);

  /* =======================================================
     ESCAPE SIDEBAR
  ======================================================= */

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleEscape = (
      event: globalThis.KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

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
  }, [sidebarOpen]);

  /* =======================================================
     GET USER ID
  ======================================================= */

  function getUserId(): number | null {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUserId =
      localStorage.getItem("user_id");

    if (!storedUserId) {
      return null;
    }

    const parsedUserId =
      Number(storedUserId);

    if (
      !Number.isFinite(parsedUserId) ||
      parsedUserId <= 0
    ) {
      return null;
    }

    return parsedUserId;
  }

  /* =======================================================
     GET USER LOCATION
  ======================================================= */

  async function getUserLocation(): Promise<UserLocation | null> {
    if (
      typeof window === "undefined" ||
      !navigator.geolocation
    ) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },

        (error) => {
          console.error(
            "Location error:",
            error
          );

          resolve(null);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  function formatDate(date: string) {
    try {
      return new Date(
        date
      ).toLocaleString();
    } catch {
      return "";
    }
  }

  /* =======================================================
     LOAD CONVERSATIONS
  ======================================================= */

  async function loadConversations() {
    const userId = getUserId();

    if (!userId) {
      setConversations([]);
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/conversations?user_id=${userId}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load conversations"
        );
      }

      const data =
        await response.json();

      setConversations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "History loading error:",
        error
      );

      setConversations([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  /* =======================================================
     SIDEBAR FUNCTIONS
  ======================================================= */

  function openSidebar() {
    setSidebarOpen(true);
    setSidebarCollapsed(false);
  }

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  function toggleDesktopSidebar() {
    setSidebarCollapsed(
      (current) => !current
    );
  }

  function handleSidebarSearchClick() {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setSidebarOpen(true);

      window.setTimeout(() => {
        sidebarSearchRef.current?.focus();
      }, 250);

      return;
    }

    sidebarSearchRef.current?.focus();
  }

  /* =======================================================
     NEW CHAT
  ======================================================= */

  function newChat() {
    if (
      loading ||
      languageChanging ||
      locationLoading ||
      marketLoading
    ) {
      return;
    }

    stopSpeaking();

    setCurrentConversationId(null);

    setMessages([
      {
        role: "assistant",
        content:
          WELCOME_MESSAGES[language],
        sources: [],
      },
    ]);

    setQuestion("");
    setMarketData(null);

    setSidebarSearch("");

    if (
      typeof window !== "undefined" &&
      window.innerWidth < 768
    ) {
      setSidebarOpen(false);
    }
  }

  /* =======================================================
     OPEN CONVERSATION
  ======================================================= */

  async function openConversation(
    conversationId: number,
    selectedLanguage: Language
  ) {
    if (
      historyLoading ||
      loading ||
      languageChanging
    ) {
      return;
    }

    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/conversations/${conversationId}?language=${encodeURIComponent(
          selectedLanguage
        )}`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to load conversation"
        );
      }

      setCurrentConversationId(data.id);

      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : []
      );

      setSidebarOpen(false);
    } catch (error) {
      console.error(
        "Conversation loading error:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  /* =======================================================
     LANGUAGE CHANGE
  ======================================================= */

  async function handleLanguageChange(
    nextLanguage: Language
  ) {
    if (
      nextLanguage === language ||
      languageChanging
    ) {
      return;
    }

    setLanguageChanging(true);

    try {
      setLanguage(nextLanguage);

      if (currentConversationId) {
        const response =
          await fetch(
            `${API_URL}/conversations/${currentConversationId}?language=${encodeURIComponent(
              nextLanguage
            )}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Failed to translate conversation"
          );
        }

        setMessages(
          Array.isArray(
            data?.messages
          )
            ? data.messages
            : []
        );
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              WELCOME_MESSAGES[
                nextLanguage
              ],
            sources: [],
          },
        ]);
      }
    } catch (error) {
      console.error(
        "Language change error:",
        error
      );
    } finally {
      setLanguageChanging(false);
    }
  }

  /* =======================================================
     START RECORDING
  ======================================================= */

  async function startRecording() {
    try {
      if (
        !navigator.mediaDevices
          ?.getUserMedia
      ) {
        alert(
          "Your browser does not support microphone access."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      audioChunksRef.current = [];

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType =
          "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        mimeType = "audio/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = async () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        await convertSpeechToText(
          audioBlob
        );
      };

      recorder.start();

      setRecording(true);
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      alert(
        "Microphone permission denied. Please allow microphone access."
      );
    }
  }

  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }

    setRecording(false);
  }

  /* =======================================================
     SPEECH TO TEXT
  ======================================================= */

  async function convertSpeechToText(
    audioBlob: Blob
  ) {
    try {
      setSpeechLoading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        audioBlob,
        "recording.webm"
      );

      const response =
        await fetch(
          `${API_URL}/speech-to-text`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Speech-to-text conversion failed"
        );
      }

      const spokenText =
        data?.text?.trim();

      if (spokenText) {
        setQuestion(spokenText);

        await sendMessage(
          spokenText
        );
      } else {
        alert(
          "No speech was detected. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "Speech conversion error:",
        error
      );

      alert(
        "Could not convert speech to text. Please try again."
      );
    } finally {
      setSpeechLoading(false);
    }
  }

  /* =======================================================
     STOP SPEAKING
  ======================================================= */

  function stopSpeaking() {
    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.currentTime =
        0;

      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(
        audioUrlRef.current
      );

      audioUrlRef.current = null;
    }

    setTtsLoadingId(null);
  }

  /* =======================================================
     TEXT TO SPEECH
  ======================================================= */

  async function speakText(
    text: string,
    messageId: number | string
  ) {
    if (!text.trim()) return;

    if (ttsLoadingId === messageId) {
      stopSpeaking();
      return;
    }

    if (audioRef.current) {
      stopSpeaking();
    }

    try {
      setTtsLoadingId(messageId);

      const response =
        await fetch(
          `${API_URL}/text-to-speech`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              text,
              language,
            }),
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
            "Text-to-speech failed"
        );
      }

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(
          audioBlob
        );

      audioUrlRef.current =
        audioUrl;

      const audio =
        new Audio(audioUrl);

      audioRef.current = audio;

      audio.onended = () => {
        if (
          audioRef.current === audio
        ) {
          audioRef.current = null;

          setTtsLoadingId(null);
        }

        URL.revokeObjectURL(
          audioUrl
        );

        if (
          audioUrlRef.current ===
          audioUrl
        ) {
          audioUrlRef.current =
            null;
        }
      };

      audio.onerror = () => {
        stopSpeaking();
      };

      await audio.play();
    } catch (error) {
      console.error(
        "Text-to-speech error:",
        error
      );

      stopSpeaking();

      alert(
        "Unable to play AI response."
      );
    }
  }

  /* =======================================================
     CREATE CONVERSATION
  ======================================================= */

  async function createConversation(
    title: string
  ): Promise<number> {
    const userId = getUserId();

    if (!userId) {
      router.replace("/login");

      throw new Error(
        "Please login again"
      );
    }

    const response =
      await fetch(
        `${API_URL}/conversations?user_id=${userId}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: title.substring(
              0,
              50
            ),
          }),
        }
      );

    const data =
      await response
        .json()
        .catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          "Could not create conversation"
      );
    }

    return data.id;
  }

  /* =======================================================
     LIVE MANDI PRICE
  ======================================================= */

  async function fetchLiveMarketPrice(text: string) {
    const commodity = detectMarketCommodity(text);
    const district = detectMarketDistrict(text);
    const state = detectMarketState(text, district);

    if (!commodity || !state) {
      setMarketData(null);
      return null;
    }

    setMarketLoading(true);

    try {
      const response = await fetch(`${API_URL}/market/price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state,
          commodity,
          district: district || undefined,
        }),
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Market API failed");
      }

      const latest = data?.latest ?? null;
      setMarketData(latest);
      return latest;
    } catch (error) {
      console.error("Live market price error:", error);
      setMarketData(null);
      return null;
    } finally {
      setMarketLoading(false);
    }
  }

  /* =======================================================
     SEND MESSAGE + WEATHER LOCATION
  ======================================================= */

  async function sendMessage(
    textOverride?: string
  ) {
    const text = (
      textOverride ?? question
    ).trim();

    if (
      !text ||
      loading ||
      speechLoading ||
      languageChanging ||
      locationLoading
    ) {
      return;
    }

    const userId = getUserId();

    if (!userId) {
      router.replace("/login");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: text,
      sources: [],
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setQuestion("");

    let locationData: UserLocation | null =
      null;

    const needsLocation =
      isWeatherQuestion(text);

    const needsMarket =
      isMarketQuestion(text);

    if (!needsMarket) {
      setMarketData(null);
    }

    try {
      let liveMarketPrice: MarketPrice | null = null;

if (needsMarket) {
  liveMarketPrice = await fetchLiveMarketPrice(text);
}
      if (needsLocation) {
        setLocationLoading(true);

        locationData =
          await getUserLocation();
      }

      setLoading(true);

      let conversationId =
        currentConversationId;

      if (!conversationId) {
        conversationId =
          await createConversation(text);

        setCurrentConversationId(
          conversationId
        );
      }

      const response = 
  await fetch( 
    `${API_URL}/chat?user_id=${userId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              question: text,

              conversation_id:
                conversationId,

              language,

              latitude:
                locationData?.latitude ??
                null,

              longitude:
                locationData?.longitude ??
                null,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Server error"
        );
      }

      const assistantMessage: Message =
        {
          id: data?.message_id,

          role: "assistant",

          content:
            data?.answer ||
            "No answer was generated.",

          sources: Array.isArray(
            data?.sources
          )
            ? data.sources
            : [],
        };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      await loadConversations();
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            ERROR_MESSAGES[language],

          sources: [],
        },
      ]);
    } finally {
      setLocationLoading(false);

      setLoading(false);
    }
  }

  /* =======================================================
     KEYBOARD
  ======================================================= */

  function handleKeyDown(
    event: KeyboardEvent<
      HTMLTextAreaElement
    >
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  }

  /* =======================================================
     FILE UPLOAD
  ======================================================= */

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    console.log(
      "Selected file:",
      file.name
    );

    event.target.value = "";
  }

  /* =======================================================
     DELETE CONVERSATION
  ======================================================= */

  async function deleteConversation(
    conversationId: number,
    event: MouseEvent<HTMLButtonElement>
  ) {
    event.stopPropagation();

    try {
      const response =
        await fetch(
          `${API_URL}/conversations/${conversationId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to delete conversation"
        );
      }

      if (
        currentConversationId ===
        conversationId
      ) {
        newChat();
      }

      await loadConversations();
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );
    }
  }

  /* =======================================================
     ACCOUNT FUNCTIONS
  ======================================================= */

  function handleAddAccount() {
    setAccountMenuOpen(false);

    router.push("/login");
  }

  function handleLogout() {
    stopSpeaking();

    localStorage.removeItem("user");

    localStorage.removeItem("email");

    localStorage.removeItem("user_id");

    setCurrentConversationId(null);

    setConversations([]);

    setMessages([
      {
        role: "assistant",

        content:
          WELCOME_MESSAGES[
            language
          ],

        sources: [],
      },
    ]);

    setAccountMenuOpen(false);

    router.replace("/login");
  }

  /* =======================================================
     FILTER CONVERSATIONS
  ======================================================= */

  const filteredConversations =
    conversations.filter(
      (conversation) =>
        conversation.title
          .toLowerCase()
          .includes(
            sidebarSearch.toLowerCase()
          )
    );

  const desktopSidebarWidth =
    sidebarCollapsed
      ? 76
      : 280;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className={`h-screen overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#07120d] text-white"
          : "bg-[#f5f8f6] text-[#1b2b20]"
      }`}
    >
      <div className="flex h-screen w-full">

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}

        {/* SIDEBAR */}

        <aside
          className={`fixed left-0 top-0 z-[90] flex h-screen shrink-0 flex-col border-r transition-all duration-300 md:relative md:z-20 md:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          } ${
            isDark
              ? "border-green-400/15 bg-[#0a1a12]"
              : "border-[#dbe6de] bg-white"
          }`}
          style={{
            width: `${desktopSidebarWidth}px`,
          }}
        >
          <div
            className={`flex shrink-0 items-center border-b py-4 ${
              sidebarCollapsed
                ? "justify-center px-2"
                : "justify-between px-4"
            } ${
              isDark
                ? "border-green-400/15"
                : "border-[#e5ece7]"
            }`}
          >
            {sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setSidebarOpen(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 text-lg"
              >
                🌾
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600">
                    🌾
                  </div>

                  <div>
                    <h1 className="text-sm font-bold">
                      Agri
                      <span className="text-green-500">
                        AI
                      </span>
                    </h1>

                    <p className="text-[9px] text-green-600">
                      AI Agricultural Assistant
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleDesktopSidebar}
                  className="text-lg opacity-60"
                >
                  ☰
                </button>
              </>
            )}
          </div>

          {sidebarCollapsed ? (
            <div className="flex flex-1 flex-col items-center gap-4 pt-5">
              <button
                type="button"
                onClick={newChat}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              >
                +
              </button>

              <button
                type="button"
                onClick={handleSidebarSearchClick}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              >
                ⌕
              </button>
            </div>
          ) : (
            <>
              <div className="px-3 pt-4">
                <button
                  type="button"
                  onClick={newChat}
                  disabled={
                    loading ||
                    languageChanging ||
                    locationLoading
                  }
                  className={`flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
                    isDark
                      ? "border-green-400/30 bg-green-500/[0.08] text-green-300"
                      : "border-green-500/30 bg-[#f1faf3] text-green-700"
                  }`}
                >
                  <span className="text-lg">
                    +
                  </span>

                  New Chat
                </button>
              </div>

              <div className="px-3 py-3">
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
                    isDark
                      ? "border-green-400/15 bg-white/[0.03]"
                      : "border-[#dbe6de] bg-[#f8faf8]"
                  }`}
                >
                  <span>⌕</span>

                  <input
                    ref={sidebarSearchRef}
                    value={sidebarSearch}
                    onChange={(event) =>
                      setSidebarSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search chats..."
                    className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3">
                <p className="mb-2 px-2 text-[9px] font-bold tracking-[0.18em] opacity-40">
                  HISTORY
                </p>

                {historyLoading && (
                  <p className="px-2 py-3 text-xs text-green-500">
                    Loading...
                  </p>
                )}

                <div className="space-y-1">
                  {filteredConversations.map(
                    (conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() =>
                          openConversation(
                            conversation.id,
                            language
                          )
                        }
                        className={`group flex cursor-pointer items-center rounded-xl px-3 py-2.5 transition ${
                          currentConversationId ===
                          conversation.id
                            ? isDark
                              ? "bg-green-500/[0.10]"
                              : "bg-[#eaf7ed]"
                            : "hover:bg-green-500/[0.05]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">
                            {conversation.title}
                          </p>

                          <p className="mt-1 text-[9px] opacity-40">
                            {formatDate(
                              conversation.created_at
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(event) =>
                            deleteConversation(
                              conversation.id,
                              event
                            )
                          }
                          className="hidden text-red-400 group-hover:block"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          <div className="relative shrink-0 border-t p-3">
            {accountMenuOpen && (
              <div
                className={`absolute bottom-[72px] z-50 rounded-2xl border p-2 ${
                  sidebarCollapsed
                    ? "left-2 w-[230px]"
                    : "left-3 right-3"
                } ${
                  isDark
                    ? "border-green-400/20 bg-[#10261a]"
                    : "bg-white"
                }`}
              >
                <div className="border-b px-3 py-3">
                  <p className="text-xs font-semibold">
                    {userName || "User"}
                  </p>

                  <p className="mt-1 text-[10px] opacity-50">
                    {userEmail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full justify-between px-3 py-3 text-xs"
                >
                  <span>
                    {isDark ? "🌙" : "☀️"} Appearance
                  </span>

                  <span className="text-green-600">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSettingsOpen((prev) => !prev)
                  }
                  className="flex w-full px-3 py-3 text-xs"
                >
                  ⚙️ Settings
                </button>

                {settingsOpen && (
                  <div className="px-3 pb-2 text-[10px] opacity-50">
                    More account settings can be added here.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="flex w-full px-3 py-3 text-xs"
                >
                  ➕ Add account
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full px-3 py-3 text-xs text-red-500"
                >
                  ↪ Log out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setAccountMenuOpen((prev) => !prev)
              }
              className={`flex w-full items-center ${
                sidebarCollapsed
                  ? "justify-center"
                  : "gap-3 px-2"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 text-sm font-bold text-green-600">
                {userName
                  ? userName.charAt(0).toUpperCase()
                  : "U"}
              </div>

              {!sidebarCollapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate text-left text-xs">
                    {userName || "User"}
                  </span>

                  <span>⋯</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN CHAT */}

        <section
          className={`flex min-w-0 flex-1 flex-col ${
            isDark
              ? "bg-[#07120d]"
              : "bg-[#f5f8f6]"
          }`}
        >
          {/* HEADER */}

          <header
            className={`flex h-[72px] shrink-0 items-center justify-between border-b px-3 sm:px-6 ${
              isDark
                ? "border-green-400/15 bg-[#0a1a12]"
                : "border-[#dce6de] bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    openSidebar();
                  } else {
                    toggleDesktopSidebar();
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border"
              >
                ☰
              </button>

              <div>
                <h2 className="text-[15px] font-semibold">
                  AI Agricultural Assistant
                </h2>

                <p className="mt-1 text-[10px] font-medium text-green-600">
                  ● RAG Assistant · Online
                </p>
              </div>
            </div>

            <div className="relative">
              <LanguageToggle
                value={language}
                onChange={handleLanguageChange}
              />

              {languageChanging && (
                <div className="absolute -bottom-5 right-0 text-[9px] text-green-500">
                  Translating...
                </div>
              )}
            </div>
          </header>

          {/* MESSAGES */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1000px] px-4 py-7 sm:px-6">
              <div className="space-y-6">

                {messages.map(
                  (message, index) => {
                    const messageKey =
                      message.id ??
                      `${message.role}-${index}`;

                    return (
                      <div
                        key={messageKey}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.role === "user" ? (
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-green-600 px-4 py-3 text-[14px] leading-6 text-white sm:max-w-[70%]">
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`w-full rounded-2xl border p-4 sm:p-5 ${
                              isDark
                                ? "border-green-400/15 bg-[#0c1d14]"
                                : "border-[#dbe6de] bg-white"
                            }`}
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15">
                                  🤖
                                </div>

                                <span className="text-xs font-semibold text-green-600">
                                  AgriAI
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  speakText(
                                    message.content,
                                    messageKey
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border"
                              >
                                {ttsLoadingId ===
                                messageKey
                                  ? "■"
                                  : "🔊"}
                              </button>
                            </div>

                            <p
                              className={`whitespace-pre-wrap text-[14px] leading-7 ${
                                isDark
                                  ? "text-white/85"
                                  : "text-[#26352b]"
                              }`}
                            >
                              {message.content}
                            </p>

                            {index === messages.length - 1 && marketData && (
                              <div className={`mt-5 rounded-2xl border p-4 ${
                                isDark
                                  ? "border-green-400/20 bg-green-500/[0.06]"
                                  : "border-green-200 bg-green-50/70"
                              }`}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-green-600">
                                      📊 Live Mandi Price
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                      {marketData.Commodity || "Commodity"} · {marketData.Market || "Market"}
                                    </p>
                                    <p className="mt-1 text-[10px] opacity-60">
                                      {marketData.District || ""}{marketData.State ? `, ${marketData.State}` : ""} · {formatMarketDate(marketData.Arrival_Date)}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-[9px] font-semibold text-green-600">
                                    Latest available
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  {[
                                    ["Min", marketData.Min_Price],
                                    ["Modal", marketData.Modal_Price],
                                    ["Max", marketData.Max_Price],
                                  ].map(([label, value]) => (
                                    <div key={label} className={`rounded-xl border p-3 text-center ${isDark ? "border-green-400/15 bg-black/10" : "border-green-200 bg-white"}`}>
                                      <p className="text-[9px] uppercase tracking-wider opacity-50">{label}</p>
                                      <p className="mt-1 text-sm font-bold">₹{priceNumber(value)?.toLocaleString("en-IN") ?? "—"}</p>
                                      <p className="mt-0.5 text-[8px] opacity-45">per quintal</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] opacity-55">
                                  {marketData.Variety && <span>Variety: {marketData.Variety}</span>}
                                  {marketData.Grade && <span>Grade: {marketData.Grade}</span>}
                                </div>
                              </div>
                            )}

                            {message.sources &&
                              message.sources.length >
                                0 && (
                                <div className="mt-5 border-t pt-4">
                                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider opacity-50">
                                    📚 Sources
                                  </p>

                                  <div className="space-y-2">
                                    {message.sources.map(
                                      (
                                        source,
                                        sourceIndex
                                      ) => (
                                        <div
                                          key={
                                            sourceIndex
                                          }
                                          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px]"
                                        >
                                          <span className="min-w-0 flex-1 truncate">
                                            {source.file ||
                                              "Unknown source"}
                                          </span>

                                          {source.page !==
                                            null &&
                                            source.page !==
                                              undefined && (
                                              <span>
                                                Page{" "}
                                                {
                                                  source.page
                                                }
                                              </span>
                                            )}

                                          {typeof source.score ===
                                            "number" && (
                                            <span className="text-green-600">
                                              {(
                                                source.score *
                                                100
                                              ).toFixed(
                                                1
                                              )}
                                              %
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {locationLoading && (
                  <div className="flex items-center gap-2 px-2 py-2 text-xs text-green-600">
                    <span className="animate-pulse">
                      📍
                    </span>

                    <span>
                      {
                        LOCATION_MESSAGES[
                          language
                        ]
                      }
                    </span>
                  </div>
                )}

                {marketLoading && (
                  <div className="flex items-center gap-2 px-2 py-2 text-xs text-green-600">
                    <span className="animate-pulse">📊</span>
                    <span>Fetching latest mandi price...</span>
                  </div>
                )}

                {languageChanging && (
                  <div className="flex items-center gap-2 px-2 text-xs text-green-600">
                    🌐 Translating conversation...
                  </div>
                )}

                {loading && (
                  <div className="flex items-center gap-2 px-2 py-2 text-xs text-green-600">
                    <span className="animate-pulse">
                      ●
                    </span>

                    <span>
                      {
                        THINKING_MESSAGES[
                          language
                        ]
                      }
                    </span>
                  </div>
                )}

                {speechLoading && (
                  <div className="flex items-center gap-2 px-2 py-2 text-xs text-green-600">
                    <span className="animate-pulse">
                      🎤
                    </span>

                    <span>
                      {
                        SPEECH_MESSAGES[
                          language
                        ]
                      }
                    </span>
                  </div>
                )}

                <div
                  ref={messagesEndRef}
                />
              </div>
            </div>
          </div>

          {/* INPUT */}

          <div
            className={`shrink-0 border-t px-3 py-4 sm:px-6 ${
              isDark
                ? "border-green-400/15 bg-[#0a1a12]"
                : "border-[#dce6de] bg-white"
            }`}
          >
            <div className="mx-auto w-full max-w-[1000px]">
              <div
                className={`flex items-end gap-2 rounded-2xl border px-3 py-2.5 ${
                  isDark
                    ? "border-green-400/25 bg-[#0d2116]"
                    : "border-[#ccdcd0] bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={
                    loading ||
                    locationLoading ||
                    marketLoading
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                >
                  +
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    locationLoading
                      ? LOCATION_MESSAGES[
                          language
                        ]
                      : speechLoading
                      ? SPEECH_MESSAGES[
                          language
                        ]
                      : loading
                      ? THINKING_MESSAGES[
                          language
                        ]
                      : PLACEHOLDERS[
                          language
                        ]
                  }
                  disabled={
                    loading ||
                    speechLoading ||
                    languageChanging ||
                    locationLoading ||
                    marketLoading
                  }
                  rows={1}
                  className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-1 py-2 text-[14px] leading-6 outline-none"
                />

                <button
                  type="button"
                  onClick={
                    recording
                      ? stopRecording
                      : startRecording
                  }
                  disabled={
                    loading ||
                    speechLoading ||
                    languageChanging ||
                    locationLoading
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                    recording
                      ? "animate-pulse border-red-400 text-red-500"
                      : "border-green-400/30 text-green-500"
                  }`}
                >
                  {speechLoading
                    ? "…"
                    : recording
                    ? "⏹"
                    : "🎤"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage()
                  }
                  disabled={
                    loading ||
                    speechLoading ||
                    languageChanging ||
                    locationLoading ||
                    marketLoading ||
                    !question.trim()
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white disabled:opacity-40"
                >
                  {loading
                    ? "…"
                    : "↑"}
                </button>
              </div>

              <p className="mt-2 text-center text-[9px] opacity-40">
                AI can make mistakes. Verify important
                agricultural decisions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}