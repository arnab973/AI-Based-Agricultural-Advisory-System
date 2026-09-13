"use client";

import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-green-700"
        >
          🌾 AI-Based Agricultural Advisory System
        </Link>

        <div className="flex items-center gap-4">
          <LanguageToggle
            value={language}
            onChange={setLanguage}
          />

          <Link
            href="/login"
            className="rounded-lg border border-green-600 px-5 py-2 text-green-600 transition hover:bg-green-50"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}