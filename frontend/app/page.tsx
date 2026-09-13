"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import Background3D from "../components/Background3D";
import { useLanguage, type Language } from "@/context/LanguageContext";

type TextContent = {
  home: string;
  features: string;
  howItWorks: string;
  about: string;
  login: string;
  getStarted: string;

  badge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;

  startConsultation: string;
  exploreFeatures: string;

  trusted: string;
  aiPowered: string;
  multilingual: string;

  cropHealth: string;
  healthy: string;
  weather: string;
  weatherStatus: string;
  aiStatus: string;
  online: string;

  featuresLabel: string;
  featuresTitle1: string;
  featuresTitle2: string;
  featuresDescription: string;

  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  feature4Title: string;
  feature4Description: string;

  processLabel: string;
  processTitle1: string;
  processTitle2: string;

  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;

  aboutLabel: string;
  aboutTitle1: string;
  aboutTitle2: string;
  aboutDescription: string;

  readyTitle1: string;
  readyTitle2: string;
  readyDescription: string;

  footerDescription: string;
  platform: string;
  quickLinks: string;
  contact: string;
  rights: string;
};

const translations: Record<Language, TextContent> = {
  en: {
    home: "Home",
    features: "Features",
    howItWorks: "How It Works",
    about: "About",
    login: "Login",
    getStarted: "Get Started",

    badge: "AI-Powered Smart Farming",
    heroTitle1: "AI - Agricultural",
    heroTitle2: "Advisory System",
    heroDescription:
      "Get intelligent agricultural guidance, crop insights, weather information and multilingual AI assistance — all in one powerful platform.",

    startConsultation: "Start AI Consultation",
    exploreFeatures: "Explore Features",

    trusted: "SMART AGRICULTURE",
    aiPowered: "AI Powered",
    multilingual: "Multilingual",

    cropHealth: "Crop Health",
    healthy: "Healthy",
    weather: "Weather",
    weatherStatus: "Sunny & Clear",
    aiStatus: "AI Engine",
    online: "Online",

    featuresLabel: "POWERFUL FEATURES",
    featuresTitle1: "Everything you need",
    featuresTitle2: "for smarter farming.",
    featuresDescription:
      "A modern AI-powered platform designed to make agricultural knowledge easier to access and understand.",

    feature1Title: "AI Consultation",
    feature1Description:
      "Ask agricultural questions and receive intelligent guidance based on your farming needs.",

    feature2Title: "Weather Intelligence",
    feature2Description:
      "Understand weather conditions and make better farming decisions.",

    feature3Title: "Crop Guidance",
    feature3Description:
      "Get useful recommendations for crops, irrigation, diseases and farming practices.",

    feature4Title: "Multilingual Support",
    feature4Description:
      "Communicate with AgriAI in your preferred supported language.",

    processLabel: "HOW IT WORKS",
    processTitle1: "From a simple question",
    processTitle2: "to smarter guidance.",

    step1Title: "Ask Your Question",
    step1Description:
      "Tell AgriAI about your crop, farming challenge or agricultural requirement.",

    step2Title: "AI Analyzes",
    step2Description:
      "The AI system processes your question and relevant agricultural knowledge.",

    step3Title: "Get Smart Guidance",
    step3Description:
      "Receive useful recommendations to support better farming decisions.",

    aboutLabel: "WHY AGRIAI",
    aboutTitle1: "Agriculture meets",
    aboutTitle2: "intelligent technology.",
    aboutDescription:
      "AgriAI combines artificial intelligence with agricultural knowledge to create a simple, accessible and multilingual experience for farmers.",

    readyTitle1: "Ready to farm",
    readyTitle2: "smarter with AI?",
    readyDescription:
      "Start exploring intelligent agricultural assistance with AgriAI today.",

    footerDescription:
      "AI-powered agricultural advisory platform built to make farming knowledge more accessible.",
    platform: "Platform",
    quickLinks: "Quick Links",
    contact: "Contact",
    rights: "All rights reserved.",
  },

  hi: {
    home: "होम",
    features: "विशेषताएँ",
    howItWorks: "यह कैसे काम करता है",
    about: "हमारे बारे में",
    login: "लॉगिन",
    getStarted: "शुरू करें",

    badge: "AI-संचालित स्मार्ट खेती",
    heroTitle1: "स्मार्ट खेती।",
    heroTitle2: "बेहतर निर्णय।",
    heroDescription:
      "बुद्धिमान कृषि मार्गदर्शन, फसल जानकारी, मौसम संबंधी जानकारी और बहुभाषी AI सहायता एक ही प्लेटफॉर्म पर प्राप्त करें।",

    startConsultation: "AI परामर्श शुरू करें",
    exploreFeatures: "विशेषताएँ देखें",

    trusted: "स्मार्ट कृषि",
    aiPowered: "AI संचालित",
    multilingual: "बहुभाषी",

    cropHealth: "फसल स्वास्थ्य",
    healthy: "स्वस्थ",
    weather: "मौसम",
    weatherStatus: "धूप और साफ",
    aiStatus: "AI इंजन",
    online: "ऑनलाइन",

    featuresLabel: "शक्तिशाली विशेषताएँ",
    featuresTitle1: "स्मार्ट खेती के लिए",
    featuresTitle2: "आपको जो चाहिए।",
    featuresDescription:
      "कृषि ज्ञान को आसान और सुलभ बनाने के लिए आधुनिक AI प्लेटफॉर्म।",

    feature1Title: "AI परामर्श",
    feature1Description:
      "कृषि संबंधी प्रश्न पूछें और स्मार्ट मार्गदर्शन प्राप्त करें।",

    feature2Title: "मौसम जानकारी",
    feature2Description:
      "मौसम की जानकारी समझें और बेहतर कृषि निर्णय लें।",

    feature3Title: "फसल मार्गदर्शन",
    feature3Description:
      "फसल, सिंचाई, रोग और कृषि पद्धतियों के लिए उपयोगी सुझाव प्राप्त करें।",

    feature4Title: "बहुभाषी सहायता",
    feature4Description:
      "अपनी पसंदीदा समर्थित भाषा में AgriAI से बात करें।",

    processLabel: "यह कैसे काम करता है",
    processTitle1: "एक साधारण प्रश्न से",
    processTitle2: "स्मार्ट मार्गदर्शन तक।",

    step1Title: "अपना प्रश्न पूछें",
    step1Description:
      "अपनी फसल या कृषि समस्या के बारे में AgriAI को बताएं।",

    step2Title: "AI विश्लेषण करता है",
    step2Description:
      "AI आपके प्रश्न और कृषि ज्ञान का विश्लेषण करता है।",

    step3Title: "स्मार्ट मार्गदर्शन पाएं",
    step3Description:
      "बेहतर कृषि निर्णयों के लिए उपयोगी सुझाव प्राप्त करें।",

    aboutLabel: "क्यों AGRIAI",
    aboutTitle1: "कृषि मिलती है",
    aboutTitle2: "स्मार्ट तकनीक से।",
    aboutDescription:
      "AgriAI कृत्रिम बुद्धिमत्ता और कृषि ज्ञान को मिलाकर किसानों के लिए एक आसान अनुभव प्रदान करता है।",

    readyTitle1: "क्या आप तैयार हैं",
    readyTitle2: "स्मार्ट खेती के लिए?",
    readyDescription:
      "आज ही AgriAI के साथ AI-संचालित कृषि सहायता का अनुभव शुरू करें।",

    footerDescription:
      "कृषि ज्ञान को अधिक सुलभ बनाने के लिए बनाया गया AI-संचालित कृषि सलाहकारी प्लेटफॉर्म।",
    platform: "प्लेटफॉर्म",
    quickLinks: "त्वरित लिंक",
    contact: "संपर्क",
    rights: "सर्वाधिकार सुरक्षित।",
  },

  bn: {
    home: "হোম",
    features: "বৈশিষ্ট্য",
    howItWorks: "কীভাবে কাজ করে",
    about: "আমাদের সম্পর্কে",
    login: "লগইন",
    getStarted: "শুরু করুন",

    badge: "AI চালিত স্মার্ট কৃষি",
    heroTitle1: "স্মার্ট কৃষি।",
    heroTitle2: "আরও ভালো সিদ্ধান্ত।",
    heroDescription:
      "একটি শক্তিশালী প্ল্যাটফর্মে পান বুদ্ধিমান কৃষি নির্দেশনা, ফসলের তথ্য, আবহাওয়ার তথ্য এবং বহুভাষী AI সহায়তা।",

    startConsultation: "AI পরামর্শ শুরু করুন",
    exploreFeatures: "বৈশিষ্ট্য দেখুন",

    trusted: "স্মার্ট কৃষি",
    aiPowered: "AI চালিত",
    multilingual: "বহুভাষী",

    cropHealth: "ফসলের স্বাস্থ্য",
    healthy: "সুস্থ",
    weather: "আবহাওয়া",
    weatherStatus: "রৌদ্রোজ্জ্বল",
    aiStatus: "AI ইঞ্জিন",
    online: "অনলাইন",

    featuresLabel: "শক্তিশালী বৈশিষ্ট্য",
    featuresTitle1: "স্মার্ট কৃষির জন্য",
    featuresTitle2: "আপনার প্রয়োজনীয় সবকিছু।",
    featuresDescription:
      "কৃষি জ্ঞানকে আরও সহজ এবং সহজলভ্য করার জন্য তৈরি আধুনিক AI প্ল্যাটফর্ম।",

    feature1Title: "AI পরামর্শ",
    feature1Description:
      "কৃষি সম্পর্কিত প্রশ্ন করুন এবং বুদ্ধিমান নির্দেশনা পান।",

    feature2Title: "আবহাওয়া তথ্য",
    feature2Description:
      "আবহাওয়ার তথ্য বুঝুন এবং আরও ভালো কৃষি সিদ্ধান্ত নিন।",

    feature3Title: "ফসল নির্দেশনা",
    feature3Description:
      "ফসল, সেচ এবং কৃষি সমস্যার জন্য কার্যকর পরামর্শ পান।",

    feature4Title: "বহুভাষী সহায়তা",
    feature4Description:
      "আপনার পছন্দের সমর্থিত ভাষায় AgriAI ব্যবহার করুন।",

    processLabel: "কীভাবে কাজ করে",
    processTitle1: "একটি প্রশ্ন থেকে",
    processTitle2: "স্মার্ট নির্দেশনা পর্যন্ত।",

    step1Title: "আপনার প্রশ্ন করুন",
    step1Description:
      "আপনার ফসল বা কৃষি সমস্যা সম্পর্কে AgriAI-কে জানান।",

    step2Title: "AI বিশ্লেষণ করে",
    step2Description:
      "AI আপনার প্রশ্ন এবং প্রাসঙ্গিক কৃষি জ্ঞান বিশ্লেষণ করে।",

    step3Title: "স্মার্ট নির্দেশনা পান",
    step3Description:
      "আরও ভালো কৃষি সিদ্ধান্তের জন্য দরকারী পরামর্শ পান।",

    aboutLabel: "কেন AGRIAI",
    aboutTitle1: "কৃষির সঙ্গে",
    aboutTitle2: "বুদ্ধিমান প্রযুক্তি।",
    aboutDescription:
      "AgriAI কৃত্রিম বুদ্ধিমত্তা এবং কৃষি জ্ঞানকে একত্রিত করে কৃষকদের জন্য সহজ অভিজ্ঞতা তৈরি করে।",

    readyTitle1: "আপনি কি প্রস্তুত",
    readyTitle2: "স্মার্ট কৃষির জন্য?",
    readyDescription:
      "আজই AgriAI-এর সঙ্গে AI চালিত কৃষি সহায়তা ব্যবহার শুরু করুন।",

    footerDescription:
      "কৃষি জ্ঞানকে আরও সহজলভ্য করার জন্য তৈরি AI চালিত কৃষি পরামর্শ প্ল্যাটফর্ম।",
    platform: "প্ল্যাটফর্ম",
    quickLinks: "দ্রুত লিঙ্ক",
    contact: "যোগাযোগ",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
  },

  hinglish: {
    home: "Home",
    features: "Features",
    howItWorks: "Kaise Kaam Karta Hai",
    about: "About",
    login: "Login",
    getStarted: "Shuru Karo",

    badge: "AI-Powered Smart Farming",
    heroTitle1: "Smarter farming.",
    heroTitle2: "Better decisions.",
    heroDescription:
      "Smart agricultural guidance, crop insights, weather information aur multilingual AI assistance — sab kuch ek powerful platform mein.",

    startConsultation: "AI Consultation Start Karo",
    exploreFeatures: "Features Dekho",

    trusted: "SMART AGRICULTURE",
    aiPowered: "AI Powered",
    multilingual: "Multilingual",

    cropHealth: "Crop Health",
    healthy: "Healthy",
    weather: "Weather",
    weatherStatus: "Sunny & Clear",
    aiStatus: "AI Engine",
    online: "Online",

    featuresLabel: "POWERFUL FEATURES",
    featuresTitle1: "Smarter farming ke liye",
    featuresTitle2: "sab kuch ek jagah.",
    featuresDescription:
      "Agricultural knowledge ko easy aur accessible banane ke liye modern AI-powered platform.",

    feature1Title: "AI Consultation",
    feature1Description:
      "Agricultural questions pucho aur smart farming guidance pao.",

    feature2Title: "Weather Intelligence",
    feature2Description:
      "Weather conditions samjho aur better farming decisions lo.",

    feature3Title: "Crop Guidance",
    feature3Description:
      "Crop, irrigation, diseases aur farming practices ke liye recommendations pao.",

    feature4Title: "Multilingual Support",
    feature4Description:
      "Apni preferred supported language mein AgriAI se baat karo.",

    processLabel: "HOW IT WORKS",
    processTitle1: "Simple question se",
    processTitle2: "smart guidance tak.",

    step1Title: "Apna Question Pucho",
    step1Description:
      "Apni crop ya farming problem ke baare mein AgriAI ko batao.",

    step2Title: "AI Analyze Karta Hai",
    step2Description:
      "AI tumhare question aur relevant agricultural knowledge ko analyze karta hai.",

    step3Title: "Smart Guidance Pao",
    step3Description:
      "Better farming decisions ke liye useful recommendations pao.",

    aboutLabel: "WHY AGRIAI",
    aboutTitle1: "Agriculture milti hai",
    aboutTitle2: "intelligent technology se.",
    aboutDescription:
      "AgriAI artificial intelligence aur agricultural knowledge ko combine karke farmers ke liye smart experience provide karta hai.",

    readyTitle1: "Ready ho",
    readyTitle2: "smarter farming ke liye?",
    readyDescription:
      "Aaj hi AgriAI ke saath AI-powered agricultural assistance explore karo.",

    footerDescription:
      "Agricultural knowledge ko accessible banane ke liye AI-powered agricultural advisory platform.",
    platform: "Platform",
    quickLinks: "Quick Links",
    contact: "Contact",
    rights: "All rights reserved.",
  },
};

const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  bn: "বাংলা",
  hinglish: "Hinglish",
};

/* =========================================================
   ANIMATION HELPERS
========================================================= */

const revealUp = {
  hidden: {
    opacity: 0,
    y: 55,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const revealLeft = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const revealRight = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const revealScale = {
  hidden: {
    opacity: 0,
    scale: 0.88,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const viewport = {
  once: true,
  amount: 0.18,
};

/* =========================================================
   HERO DESCRIPTION WORD ANIMATION
========================================================= */

function AnimatedDescription({
  text,
}: {
  text: string;
}) {
  const words = text.split(" ");

  return (
    <motion.p
      initial="hidden"
      animate="visible"
      className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8 lg:mx-0"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={{
            hidden: {
              opacity: 0,
              y: 12,
              filter: "blur(5px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                delay: 0.45 + index * 0.035,
                duration: 0.35,
              },
            },
          }}
          className="mr-[0.28em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const { language, setLanguage } = useLanguage();

  const text = translations[language];

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setLanguageOpen(false);
  };

  const features = [
    {
      icon: "🤖",
      number: "01",
      title: text.feature1Title,
      description: text.feature1Description,
      gradient:
        "from-emerald-400/20 via-emerald-500/5 to-transparent",
    },
    {
      icon: "🌦️",
      number: "02",
      title: text.feature2Title,
      description: text.feature2Description,
      gradient:
        "from-cyan-400/15 via-cyan-500/5 to-transparent",
    },
    {
      icon: "🌱",
      number: "03",
      title: text.feature3Title,
      description: text.feature3Description,
      gradient:
        "from-lime-400/15 via-green-500/5 to-transparent",
    },
    {
      icon: "🌐",
      number: "04",
      title: text.feature4Title,
      description: text.feature4Description,
      gradient:
        "from-violet-400/15 via-purple-500/5 to-transparent",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: "💬",
      title: text.step1Title,
      description: text.step1Description,
    },
    {
      number: "02",
      icon: "🧠",
      title: text.step2Title,
      description: text.step2Description,
    },
    {
      number: "03",
      icon: "🌾",
      title: text.step3Title,
      description: text.step3Description,
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#04110a] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 z-0">
        <Background3D />
      </div>

      {/* LIGHT CINEMATIC OVERLAY */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-[#04110a]/5 via-[#04110a]/20 to-[#04110a]/50" />

      {/* SOFT ATMOSPHERIC GLOW */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_20%,rgba(52,211,153,0.07),transparent_38%)]" />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <motion.header
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.09] bg-[#03100a]/80 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-2xl"
      >
        <div className="mx-auto flex h-[66px] max-w-7xl items-center justify-between px-4 sm:h-[70px] sm:px-6 lg:px-10">

          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setMenuOpen(false)}
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-700 shadow-[0_0_22px_rgba(34,197,94,0.3)] sm:h-10 sm:w-10">
              🌾
            </div>

            <span className="text-base font-bold tracking-wide sm:text-lg">
              Agri<span className="text-emerald-400">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">

            <nav className="flex items-center gap-7">
              <a
                href="#home"
                className="text-sm text-white/65 transition hover:text-emerald-300"
              >
                {text.home}
              </a>

              <a
                href="#features"
                className="text-sm text-white/65 transition hover:text-emerald-300"
              >
                {text.features}
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-white/65 transition hover:text-emerald-300"
              >
                {text.howItWorks}
              </a>

              <a
                href="#about"
                className="text-sm text-white/65 transition hover:text-emerald-300"
              >
                {text.about}
              </a>
            </nav>

            <div className="h-5 w-px bg-white/10" />

            <div className="flex items-center gap-2">

              {/* LANGUAGE */}

              <div className="relative">
                <button
                  onClick={() =>
                    setLanguageOpen(!languageOpen)
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/80 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.06]"
                >
                  <span>🌐</span>
                  <span>{languageNames[language]}</span>
                  <span className="text-xs text-white/50">
                    ⌄
                  </span>
                </button>

                <AnimatePresence>
                  {languageOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.96,
                      }}
                      className="absolute right-0 top-12 w-40 rounded-2xl border border-white/10 bg-[#07170e]/95 p-2 shadow-2xl backdrop-blur-xl"
                    >
                      {(
                        ["en", "hi", "bn", "hinglish"] as Language[]
                      ).map((lang) => (
                        <button
                          key={lang}
                          onClick={() =>
                            changeLanguage(lang)
                          }
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                            language === lang
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "text-white/65 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {languageNames[lang]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm text-white/70 transition hover:text-white"
              >
                {text.login}
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 px-4 py-2.5 text-sm font-bold text-[#021008] shadow-[0_0_22px_rgba(34,197,94,0.25)] transition hover:scale-[1.03]"
              >
                {text.getStarted} →
              </Link>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] lg:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden border-t border-white/10 bg-[#04120b]/96 backdrop-blur-2xl lg:hidden"
            >
              <div className="px-4 py-5">

                <p className="mb-3 text-[10px] uppercase tracking-widest text-white/40">
                  Language
                </p>

                <div className="mb-5 grid grid-cols-2 gap-2">
                  {(
                    ["en", "hi", "bn", "hinglish"] as Language[]
                  ).map((lang) => (
                    <button
                      key={lang}
                      onClick={() =>
                        changeLanguage(lang)
                      }
                      className={`rounded-xl border px-3 py-3 text-sm ${
                        language === lang
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-white/10 text-white/65"
                      }`}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col">
                  {[
                    ["#home", text.home],
                    ["#features", text.features],
                    ["#how-it-works", text.howItWorks],
                    ["#about", text.about],
                  ].map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="rounded-xl px-4 py-3 text-white/75 hover:bg-white/5"
                    >
                      {label}
                    </a>
                  ))}
                </div>

                <div className="my-4 border-t border-white/10" />

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm"
                  >
                    {text.login}
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 px-4 py-3 text-center text-sm font-bold text-[#021008]"
                  >
                    {text.getStarted}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="relative z-10 flex min-h-[100svh] items-center overflow-hidden pt-[70px]"
      >

        {/* HERO ATMOSPHERIC GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.14] blur-[120px]" />

        <div className="pointer-events-none absolute left-[15%] top-[25%] h-32 w-32 rounded-full bg-cyan-400/[0.05] blur-[80px]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:gap-8 lg:px-10 lg:py-16">

          {/* HERO LEFT */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={revealLeft}
            className="relative z-10 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
          >

            {/* BADGE */}

            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.8,
                },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                  },
                },
              }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.09] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300 shadow-[0_0_25px_rgba(34,197,94,0.08)] backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

              {text.badge}
            </motion.div>

            {/* PROJECT NAME */}

            <motion.p
              variants={revealUp}
              className="mt-4 text-[9px] font-medium uppercase tracking-[0.18em] text-white/45 sm:text-[10px]"
            >
              Smarter farming Better decisions.
            </motion.p>

            {/* MAIN TITLE */}

            <motion.h1
              variants={revealUp}
              className="mx-auto mt-3 max-w-xl text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:mx-0 lg:text-5xl xl:text-6xl"
            >
              {text.heroTitle1}

              <span className="block bg-gradient-to-r from-emerald-300 via-green-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(52,211,153,0.12)]">
                {text.heroTitle2}
              </span>
            </motion.h1>

            {/* DESCRIPTION */}

            <AnimatedDescription
              text={text.heroDescription}
            />

            {/* BUTTONS */}

            <motion.div
              variants={revealUp}
              className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/signup"
                className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 px-5 py-3.5 text-sm font-bold text-[#021008] shadow-[0_0_30px_rgba(34,197,94,0.24)] transition hover:scale-[1.02] hover:shadow-[0_0_38px_rgba(34,197,94,0.32)] sm:w-auto"
              >
                {text.startConsultation}

                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#features"
                className="flex w-full items-center justify-center rounded-xl border border-white/[0.13] bg-white/[0.055] px-5 py-3.5 text-sm font-semibold text-white/75 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/[0.08] sm:w-auto"
              >
                {text.exploreFeatures}
              </a>
            </motion.div>

            {/* STATS */}

            <motion.div
              variants={revealUp}
              className="mx-auto mt-7 grid max-w-md grid-cols-3 gap-3 border-t border-white/[0.1] pt-5 lg:mx-0"
            >
              <div>
                <p className="text-lg font-bold text-emerald-300">
                  24/7
                </p>

                <p className="mt-1 text-[8px] uppercase tracking-wider text-white/40">
                  {text.aiPowered}
                </p>
              </div>

              <div>
                <p className="text-lg font-bold text-cyan-300">
                  4+
                </p>

                <p className="mt-1 text-[8px] uppercase tracking-wider text-white/40">
                  {text.multilingual}
                </p>
              </div>

              <div>
                <p className="text-lg font-bold text-green-300">
                  AI
                </p>

                <p className="mt-1 text-[8px] uppercase tracking-wider text-white/40">
                  {text.trusted}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* HERO RIGHT */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={revealScale}
            className="relative mx-auto w-full max-w-[430px]"
          >

            <div className="absolute inset-8 rounded-full bg-emerald-400/10 blur-[90px]" />

            {/* WEATHER FLOAT */}

            <motion.div
              initial={{
                opacity: 0,
                x: 35,
                y: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -8, 0],
              }}
              transition={{
                opacity: {
                  delay: 0.6,
                  duration: 0.6,
                },
                x: {
                  delay: 0.6,
                  duration: 0.6,
                },
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute -right-3 top-3 z-20 hidden rounded-2xl border border-white/10 bg-[#08150f]/88 p-3 shadow-2xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-400/10">
                  ☀️
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    {text.weather}
                  </p>

                  <p className="text-[9px] text-white/45">
                    {text.weatherStatus}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-lg font-bold text-orange-200">
                24°C
              </p>
            </motion.div>

            {/* CROP FLOAT */}

            <motion.div
              initial={{
                opacity: 0,
                x: -35,
                y: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, 9, 0],
              }}
              transition={{
                opacity: {
                  delay: 0.8,
                  duration: 0.6,
                },
                x: {
                  delay: 0.8,
                  duration: 0.6,
                },
                y: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute -left-3 bottom-5 z-20 hidden rounded-2xl border border-emerald-400/15 bg-[#08150f]/88 p-3 shadow-2xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400/10">
                  🌱
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    {text.cropHealth}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                    <span className="text-[9px] text-emerald-300">
                      {text.healthy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-green-300" />
              </div>
            </motion.div>

            {/* DASHBOARD */}

            <motion.div
              initial={{
                opacity: 0,
                y: 50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.14] bg-gradient-to-br from-[#0b2115]/90 via-[#06150d]/88 to-[#03100a]/90 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-5"
            >

              {/* DASHBOARD TOP */}

              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-700">
                    🌾
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      AgriAI Intelligence
                    </p>

                    <p className="text-[9px] text-white/40">
                      Smart Farming Dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  <span className="text-[8px] font-semibold text-emerald-300">
                    {text.online}
                  </span>
                </div>
              </div>

              {/* FARM VISUAL */}

              <div className="relative mt-3 min-h-[245px] overflow-hidden rounded-2xl border border-emerald-400/[0.12] bg-gradient-to-b from-[#12351f] via-[#0b2114] to-[#06140b] sm:min-h-[275px]">

                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-emerald-400/[0.1] to-transparent" />

                {/* SUN */}

                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute right-[18%] top-[12%] h-12 w-12 rounded-full bg-emerald-300/20 blur-sm"
                />

                {/* HORIZON */}

                <div className="absolute left-0 right-0 top-[46%] h-px bg-emerald-400/20" />

                {/* FIELD */}

                <div className="absolute bottom-0 left-1/2 h-[55%] w-[140%] -translate-x-1/2">
                  {[0, 1, 2, 3, 4, 5].map((row) => (
                    <div
                      key={row}
                      className="absolute left-1/2 h-[2px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
                      style={{
                        bottom: `${row * 13 + 5}%`,
                        transform: `translateX(-50%) scale(${
                          0.45 + row * 0.11
                        })`,
                      }}
                    />
                  ))}
                </div>

                {/* CENTER AI */}

                <motion.div
                  animate={{
                    y: [0, -9, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-1/2 top-1/2 grid h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-emerald-300/30 bg-gradient-to-br from-emerald-300 via-emerald-500 to-green-700 text-3xl shadow-[0_0_55px_rgba(34,197,94,0.4)] sm:h-24 sm:w-24 sm:text-4xl"
                >
                  🌾
                </motion.div>

                {/* RINGS */}

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/15 sm:h-40 sm:w-40"
                />

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-400/15 sm:h-52 sm:w-52"
                />

                {/* SCANNING */}

                <motion.div
                  animate={{
                    top: ["25%", "75%", "25%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.9)]"
                />

                <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 backdrop-blur-xl">
                  <p className="text-[7px] uppercase tracking-[0.18em] text-white/40">
                    Smart Field Analysis
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-emerald-300">
                    AI Monitoring Active
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["Soil", "87%", "text-emerald-300"],
                  ["Moisture", "Good", "text-cyan-300"],
                  ["AI", "Ready", "text-green-300"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-2.5"
                  >
                    <p className="text-[7px] uppercase tracking-wider text-white/35">
                      {label}
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${color}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* MOBILE INFO */}

            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              <div className="rounded-xl border border-white/10 bg-[#08150f]/82 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span>☀️</span>
                  <span className="text-[10px] font-semibold">
                    {text.weather}
                  </span>
                </div>

                <p className="mt-1 text-lg font-bold text-orange-200">
                  24°C
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/15 bg-[#08150f]/85 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span>🌱</span>
                  <span className="text-[10px] font-semibold">
                    {text.cropHealth}
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-emerald-300">
                  {text.healthy}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="relative z-10 border-t border-white/[0.06] bg-[#030a07]/58 px-4 py-16 backdrop-blur-[7px] sm:px-6 sm:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={revealUp}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
              {text.featuresLabel}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {text.featuresTitle1}

              <span className="block text-white/45">
                {text.featuresTitle2}
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55">
              {text.featuresDescription}
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.number}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={
                  index % 2 === 0
                    ? revealLeft
                    : revealRight
                }
                whileHover={{
                  y: -6,
                  transition: {
                    duration: 0.2,
                  },
                }}
                className={`group relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br ${feature.gradient} p-6 shadow-[0_15px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:p-7`}
              >
                <div className="absolute inset-0 bg-[#06120b]/30 opacity-70 transition-opacity duration-300 group-hover:opacity-50" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xl shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
                      {feature.icon}
                    </div>

                    <span className="text-xs font-bold text-white/20">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
                    {feature.description}
                  </p>

                  <div className="mt-5 text-xs font-semibold text-emerald-300">
                    Explore →
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="relative z-10 bg-[#020806]/52 px-4 py-16 backdrop-blur-[5px] sm:px-6 sm:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={revealLeft}
              className="lg:sticky lg:top-28 lg:h-fit"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                {text.processLabel}
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                {text.processTitle1}

                <span className="block text-white/45">
                  {text.processTitle2}
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                AgriAI makes agricultural assistance simple. Ask,
                analyze and receive intelligent guidance.
              </p>
            </motion.div>

            <div className="relative space-y-4">

              <div className="absolute bottom-12 left-[27px] top-12 hidden w-px bg-gradient-to-b from-emerald-400 via-cyan-400 to-transparent opacity-70 sm:block" />

              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                  variants={
                    index === 0
                      ? revealUp
                      : index === 1
                      ? revealRight
                      : revealLeft
                  }
                  className="relative flex gap-4 rounded-3xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:gap-6 sm:p-6"
                >
                  <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-[#081a10]/85 text-xl shadow-[0_0_25px_rgba(34,197,94,0.07)]">
                    {step.icon}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-emerald-400">
                      {step.number}
                    </p>

                    <h3 className="mt-1.5 text-lg font-bold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-white/55">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        id="about"
        className="relative z-10 overflow-hidden border-y border-white/[0.06] bg-gradient-to-br from-[#071a10]/70 via-[#030b07]/52 to-[#020806]/45 px-4 py-16 backdrop-blur-[6px] sm:px-6 sm:py-20 lg:px-10"
      >
        <div className="absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-emerald-400/[0.08] blur-[110px]" />

        <div className="absolute bottom-0 left-0 h-[220px] w-[220px] rounded-full bg-cyan-400/[0.035] blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={revealLeft}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
              {text.aboutLabel}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {text.aboutTitle1}

              <span className="block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                {text.aboutTitle2}
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
              {text.aboutDescription}
            </p>

            <Link
              href="/signup"
              className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 px-5 py-3 text-sm font-bold text-[#021008] shadow-[0_0_25px_rgba(34,197,94,0.16)] transition hover:scale-[1.02]"
            >
              {text.getStarted} →
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={revealRight}
            className="grid grid-cols-2 gap-3"
          >
            {[
              ["🧠", "Intelligent AI", "Smart agricultural assistance"],
              ["⚡", "Fast Response", "Quick guidance when needed"],
              ["🌐", "Multilingual", "Multiple language support"],
              ["🌾", "Farmer Focused", "Built around farming needs"],
            ].map(([icon, title, description], index) => (
              <motion.div
                key={title}
                whileHover={{
                  y: -5,
                }}
                className={`rounded-3xl border border-white/[0.09] bg-white/[0.045] p-4 shadow-[0_15px_35px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-5 ${
                  index === 1 || index === 3
                    ? "sm:translate-y-5"
                    : ""
                }`}
              >
                <div className="text-2xl">
                  {icon}
                </div>

                <h3 className="mt-4 text-sm font-bold">
                  {title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-white/48">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="relative z-10 bg-[#020806]/48 px-4 py-16 backdrop-blur-[5px] sm:px-6 sm:py-20 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={revealUp}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.13] via-[#082014]/80 to-[#041009]/78 px-5 py-12 text-center shadow-[0_0_70px_rgba(34,197,94,0.09)] backdrop-blur-2xl sm:px-10 sm:py-16"
        >
          <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-[60px]" />

          <div className="absolute bottom-0 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-cyan-400/[0.04] blur-[70px]" />

          <div className="relative">

            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-xl shadow-[0_0_25px_rgba(34,197,94,0.12)]"
            >
              🤖
            </motion.div>

            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              {text.readyTitle1}

              <span className="block text-emerald-300">
                {text.readyTitle2}
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55">
              {text.readyDescription}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 px-6 py-3.5 text-sm font-bold text-[#021008] shadow-[0_0_25px_rgba(34,197,94,0.16)] transition hover:scale-[1.02]"
              >
                {text.startConsultation} →
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-white/75 backdrop-blur-xl transition hover:bg-white/[0.08]"
              >
                {text.login}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative z-10 border-t border-white/[0.08] bg-[#010503]/78 px-4 pt-12 backdrop-blur-xl sm:px-6 lg:px-10">

        <div className="mx-auto grid max-w-7xl gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-4">

          <div className="sm:col-span-2 lg:col-span-1">

            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-700">
                🌾
              </div>

              <span className="text-lg font-bold">
                Agri<span className="text-emerald-400">
                  AI
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/40">
              {text.footerDescription}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold">
              {text.platform}
            </h3>

            <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/45">
              <a
                href="#features"
                className="transition hover:text-emerald-300"
              >
                AI Consultation
              </a>

              <a
                href="#features"
                className="transition hover:text-emerald-300"
              >
                Crop Guidance
              </a>

              <a
                href="#features"
                className="transition hover:text-emerald-300"
              >
                Weather Intelligence
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">
              {text.quickLinks}
            </h3>

            <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/45">
              <a
                href="#home"
                className="transition hover:text-emerald-300"
              >
                {text.home}
              </a>

              <a
                href="#features"
                className="transition hover:text-emerald-300"
              >
                {text.features}
              </a>

              <a
                href="#about"
                className="transition hover:text-emerald-300"
              >
                {text.about}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">
              {text.contact}
            </h3>

            <div className="mt-4 space-y-2.5 text-sm text-white/45">
              <p>AI Agricultural Advisory</p>
              <p>AI Assistance Available 24/7</p>
              <p className="text-emerald-300">
                AgriAI Platform
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/[0.07] py-5 text-center text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} AgriAI.{" "}
            {text.rights}
          </p>

          <div className="flex justify-center gap-3">
            <span>AI Powered</span>
            <span>•</span>
            <span>Smart Agriculture</span>
          </div>
        </div>
      </footer>
    </main>
  );
}