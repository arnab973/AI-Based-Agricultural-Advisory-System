"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  useLanguage,
  type Language,
} from "@/context/LanguageContext";

import {
  useTheme,
  type Theme,
} from "@/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const languageOptions: {
  value: Language;
  label: string;
  native: string;
}[] = [
  {
    value: "en",
    label: "English",
    native: "English",
  },
  {
    value: "hi",
    label: "Hindi",
    native: "हिन्दी",
  },
  {
    value: "bn",
    label: "Bengali",
    native: "বাংলা",
  },
  {
    value: "hinglish",
    label: "Hinglish",
    native: "Hinglish",
  },
];

export default function SettingsPage() {
  const router = useRouter();

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const {
    theme,
    setTheme,
  } = useTheme();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [user, setUser] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [profileImage, setProfileImage] =
    useState("");

  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [
    editingProfile,
    setEditingProfile,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState(true);

  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(true);

  const [
    aiUpdates,
    setAiUpdates,
  ] = useState(true);

  const [saved, setSaved] =
    useState(false);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  // ============================================
  // THEME CLASSES
  // ============================================

  const isDark = theme === "dark";

  const pageBg = isDark
    ? "bg-[#06110a] text-white"
    : "bg-[#f4faf6] text-slate-900";

  const headerBg = isDark
    ? "border-white/10 bg-[#06120b]/70"
    : "border-slate-200 bg-white/80";

  const cardBg = isDark
    ? "border-white/10 bg-[#08170e]/70"
    : "border-slate-200 bg-white";

  const cardSoftBg = isDark
    ? "border-green-400/15 bg-gradient-to-br from-[#0d2415] to-[#07130c]"
    : "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50";

  const inputBg = isDark
    ? "border-white/10 bg-black/20 text-white placeholder:text-white/25"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";

  const mutedText = isDark
    ? "text-white/45"
    : "text-slate-500";

  const softText = isDark
    ? "text-white/30"
    : "text-slate-400";

  const divider = isDark
    ? "bg-white/[0.07]"
    : "bg-slate-200";

  const buttonSecondary = isDark
    ? "border-white/10 bg-white/5 text-white/70 hover:bg-green-400/10 hover:text-green-300"
    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-green-50 hover:text-green-700";

  const selectBg = isDark
    ? "border-white/10 bg-[#0b1b10] text-white"
    : "border-slate-200 bg-white text-slate-900";

  // ============================================
  // SAVED MESSAGE
  // ============================================

  const showSavedMessage = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

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

  // ============================================
  // LOAD USER PROFILE
  // ============================================

  useEffect(() => {
    const loadUserProfile = async () => {
      const userId =
        localStorage.getItem("user_id");

      if (!userId) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/users/${userId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
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

        const finalName =
          fullName ||
          data.first_name ||
          "";

        setUser(finalName);

        setEmail(
          data.email || ""
        );

        setEditName(finalName);

        setEditEmail(
          data.email || ""
        );

        setProfileImage(
          getFullImageUrl(
            data.profile_image
          )
        );

        localStorage.setItem(
          "user",
          finalName
        );

        localStorage.setItem(
          "email",
          data.email || ""
        );
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        const savedUser =
          localStorage.getItem("user");

        const savedEmail =
          localStorage.getItem("email");

        if (savedUser) {
          setUser(savedUser);
          setEditName(savedUser);
        }

        if (savedEmail) {
          setEmail(savedEmail);
          setEditEmail(savedEmail);
        }
      }

      const savedNotifications =
        localStorage.getItem(
          "notifications_enabled"
        );

      const savedEmailNotifications =
        localStorage.getItem(
          "email_notifications_enabled"
        );

      const savedAiUpdates =
        localStorage.getItem(
          "ai_updates_enabled"
        );

      if (
        savedNotifications !== null
      ) {
        setNotifications(
          savedNotifications === "true"
        );
      }

      if (
        savedEmailNotifications !== null
      ) {
        setEmailNotifications(
          savedEmailNotifications === "true"
        );
      }

      if (
        savedAiUpdates !== null
      ) {
        setAiUpdates(
          savedAiUpdates === "true"
        );
      }
    };

    loadUserProfile();
  }, [router]);

  // ============================================
  // SAVE PROFILE
  // ============================================

  const handleSaveProfile =
    async () => {
      if (!editName.trim()) {
        alert(
          "Please enter your name."
        );

        return;
      }

      if (!editEmail.trim()) {
        alert(
          "Please enter your email."
        );

        return;
      }

      const userId =
        localStorage.getItem(
          "user_id"
        );

      if (!userId) {
        router.replace("/login");
        return;
      }

      setSavingProfile(true);

      try {
        const nameParts =
          editName
            .trim()
            .split(" ");

        const firstName =
          nameParts[0] || "";

        const lastName =
          nameParts
            .slice(1)
            .join(" ");

        const response =
          await fetch(
            `${API_URL}/users/${userId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                first_name:
                  firstName,

                last_name:
                  lastName,

                email:
                  editEmail.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to update profile"
          );
        }

        const fullName =
          `${data.first_name || ""} ${
            data.last_name || ""
          }`.trim();

        const finalName =
          fullName ||
          data.first_name ||
          editName.trim();

        const finalEmail =
          data.email ||
          editEmail.trim();

        setUser(finalName);
        setEmail(finalEmail);

        setEditName(finalName);
        setEditEmail(finalEmail);

        localStorage.setItem(
          "user",
          finalName
        );

        localStorage.setItem(
          "email",
          finalEmail
        );

        setEditingProfile(false);

        showSavedMessage();
      } catch (error) {
        console.error(
          "Profile update error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to update profile."
        );
      } finally {
        setSavingProfile(false);
      }
    };

  // ============================================
  // UPLOAD PROFILE IMAGE
  // ============================================

  const handleProfileImage =
    async (
      event: ChangeEvent<
        HTMLInputElement
      >
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const userId =
        localStorage.getItem(
          "user_id"
        );

      if (!userId) {
        router.replace("/login");
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Please select a valid image file."
        );

        return;
      }

      setUploadingImage(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            `${API_URL}/users/${userId}/profile-image`,
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to upload image"
          );
        }

        const imageUrl =
          getFullImageUrl(
            data.profile_image
          );

        setProfileImage(
          `${imageUrl}?t=${Date.now()}`
        );

        showSavedMessage();
      } catch (error) {
        console.error(
          "Image upload error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to upload profile image."
        );
      } finally {
        setUploadingImage(false);

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }
      }
    };

  // ============================================
  // REMOVE PROFILE IMAGE
  // ============================================

  const handleRemoveImage =
    async () => {
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
            `${API_URL}/users/${userId}/profile-image`,
            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to remove image"
          );
        }

        setProfileImage("");

        showSavedMessage();
      } catch (error) {
        console.error(
          "Image remove error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to remove profile image."
        );
      }
    };

  // ============================================
  // SAVE PREFERENCES
  // ============================================

  const handleSavePreferences =
    () => {
      localStorage.setItem(
        "agriAI_language",
        language
      );

      localStorage.setItem(
        "agriAI_theme",
        theme
      );

      localStorage.setItem(
        "notifications_enabled",
        String(notifications)
      );

      localStorage.setItem(
        "email_notifications_enabled",
        String(
          emailNotifications
        )
      );

      localStorage.setItem(
        "ai_updates_enabled",
        String(aiUpdates)
      );

      showSavedMessage();
    };

  // ============================================
  // LANGUAGE CHANGE
  // ============================================

  const handleLanguageChange = (
    newLanguage: Language
  ) => {
    setLanguage(newLanguage);
  };

  // ============================================
  // THEME CHANGE
  // ============================================

  const handleThemeChange = (
    newTheme: Theme
  ) => {
    setTheme(newTheme);
  };

  // ============================================
  // PASSWORD
  // ============================================

  const handlePasswordChange =
    () => {
      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        alert(
          "Please fill all password fields."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        alert(
          "New passwords do not match."
        );

        return;
      }

      if (
        newPassword.length < 6
      ) {
        alert(
          "Password must be at least 6 characters."
        );

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSavedMessage();
    };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");

    router.replace("/");
  };

  // ============================================
  // TOGGLE COMPONENT
  // ============================================

  const Toggle = ({
    enabled,
    setEnabled,
  }: {
    enabled: boolean;
    setEnabled: (
      value: boolean
    ) => void;
  }) => {
    return (
      <button
        type="button"
        onClick={() =>
          setEnabled(!enabled)
        }
        aria-label="Toggle setting"
        className={`relative h-7 w-12 rounded-full transition ${
          enabled
            ? "bg-gradient-to-r from-green-400 to-emerald-500"
            : isDark
            ? "bg-white/10"
            : "bg-slate-200"
        }`}
      >
        <motion.div
          animate={{
            x: enabled ? 22 : 3,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg"
        />
      </button>
    );
  };

  return (
    <main
      className={`relative min-h-[100dvh] overflow-hidden transition-colors duration-300 ${pageBg}`}
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className={`absolute -left-32 top-20 h-80 w-80 rounded-full blur-[120px] ${
            isDark
              ? "bg-green-400/[0.07]"
              : "bg-green-300/20"
          }`}
        />

        <div
          className={`absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-[140px] ${
            isDark
              ? "bg-emerald-500/[0.06]"
              : "bg-emerald-200/30"
          }`}
        />

      </div>

      {/* SAVED MESSAGE */}

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            className={`fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-2xl sm:right-8 sm:top-6 ${
              isDark
                ? "border-green-400/20 bg-[#0b1b10]/95"
                : "border-green-200 bg-white/95"
            }`}
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-400/15 text-green-500">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold">
                {t("changesSaved")}
              </p>

              <p
                className={`text-xs ${mutedText}`}
              >
                {t("settingsUpdated")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}

      <header
        className={`relative z-20 border-b backdrop-blur-2xl ${headerBg}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-10">

          <div className="flex min-w-0 items-center gap-3 sm:gap-5">

            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-lg transition hover:border-green-400/40 hover:text-green-500 ${
                isDark
                  ? "border-white/10 bg-white/5 text-white/70"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              ←
            </button>

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-[0.18em] text-green-500/70 sm:text-xs">
                {t("accountManagement")}
              </p>

              <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">
                {t("settings")}
              </h1>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/chat")
            }
            className="hidden rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-2.5 text-sm font-bold text-[#03150b] shadow-[0_0_25px_rgba(34,255,136,0.2)] transition hover:scale-105 sm:block"
          >
            {t("askAI")} ✦
          </button>

        </div>
      </header>

      {/* MAIN CONTENT */}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10">

        {/* INTRO */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500/70">
            {t("personalPreferences")}
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            {t("manageAccount")}
          </h2>
        </motion.div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">

          {/* LEFT SIDE */}

          <div className="space-y-6">

            {/* PROFILE */}

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
                delay: 0.1,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl sm:p-7 ${cardBg}`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className={`text-xs uppercase tracking-[0.2em] ${softText}`}>
                    Profile
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    {t("personalInformation")}
                  </h3>

                  <p className={`mt-1 text-sm ${mutedText}`}>
                    {t("managePersonalInfo")}
                  </p>

                </div>

                {!editingProfile && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProfile(true)
                    }
                    className="rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-400/15"
                  >
                    {t("editProfile")}
                  </button>
                )}

              </div>

              <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center">

                <div className="relative mx-auto shrink-0 sm:mx-0">

                  <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl border border-green-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-4xl font-bold text-cyan-700 shadow-[0_0_30px_rgba(34,255,136,0.08)]">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user
                        .charAt(0)
                        .toUpperCase() ||
                      "U"
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploadingImage}
                    className={`absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl border border-green-400/20 text-sm text-green-500 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark
                        ? "bg-[#0d2415]"
                        : "bg-white"
                    }`}
                  >
                    {uploadingImage
                      ? "..."
                      : "📷"}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handleProfileImage
                    }
                    className="hidden"
                  />

                </div>

                <div className="flex-1">

                  <h4 className="text-lg font-semibold">
                    {user || "User"}
                  </h4>

                  <p className={`mt-1 text-sm ${mutedText}`}>
                    {email ||
                      t("noEmailAvailable")}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={uploadingImage}
                      className={`rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-50 ${buttonSecondary}`}
                    >
                      {uploadingImage
                        ? "Uploading..."
                        : t("changePhoto")}
                    </button>

                    {profileImage && (
                      <button
                        type="button"
                        onClick={
                          handleRemoveImage
                        }
                        className="rounded-xl px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        {t("remove")}
                      </button>
                    )}

                  </div>

                </div>

              </div>

              <AnimatePresence>

                {editingProfile && (

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
                    className="overflow-hidden"
                  >

                    <div className={`mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2 ${
                      isDark
                        ? "border-white/[0.07]"
                        : "border-slate-200"
                    }`}>

                      <div>

                        <label className={`text-xs font-medium ${mutedText}`}>
                          {t("fullName")}
                        </label>

                        <input
                          value={editName}
                          onChange={(e) =>
                            setEditName(
                              e.target.value
                            )
                          }
                          placeholder={t(
                            "enterYourName"
                          )}
                          className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-green-400/40 focus:ring-2 focus:ring-green-400/10 ${inputBg}`}
                        />

                      </div>

                      <div>

                        <label className={`text-xs font-medium ${mutedText}`}>
                          {t("emailAddress")}
                        </label>

                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) =>
                            setEditEmail(
                              e.target.value
                            )
                          }
                          placeholder={t(
                            "enterYourEmail"
                          )}
                          className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-green-400/40 focus:ring-2 focus:ring-green-400/10 ${inputBg}`}
                        />

                      </div>

                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={() => {
                          setEditName(user);
                          setEditEmail(email);
                          setEditingProfile(
                            false
                          );
                        }}
                        disabled={
                          savingProfile
                        }
                        className={`rounded-xl px-5 py-3 text-sm transition ${buttonSecondary}`}
                      >
                        {t("cancel")}
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSaveProfile
                        }
                        disabled={
                          savingProfile
                        }
                        className="rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-3 text-sm font-bold text-[#03150b] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingProfile
                          ? "Saving..."
                          : t("saveChanges")}
                      </button>

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>

            </motion.section>

            {/* SECURITY */}

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
                delay: 0.2,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl sm:p-7 ${cardBg}`}
            >

              <p className={`text-xs uppercase tracking-[0.2em] ${softText}`}>
                {t("security")}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {t("changePassword")}
              </h3>

              <p className={`mt-1 text-sm ${mutedText}`}>
                {t("strongPassword")}
              </p>

              <div className="mt-7 grid gap-4">

                <div>

                  <label className={`text-xs font-medium ${mutedText}`}>
                    {t("currentPassword")}
                  </label>

                  <div className="relative mt-2">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        currentPassword
                      }
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      placeholder={t(
                        "enterCurrentPassword"
                      )}
                      className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition focus:border-green-400/40 focus:ring-2 focus:ring-green-400/10 ${inputBg}`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-green-500 ${mutedText}`}
                    >
                      {showPassword
                        ? t("hide")
                        : t("show")}
                    </button>

                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className={`text-xs font-medium ${mutedText}`}>
                      {t("newPassword")}
                    </label>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        newPassword
                      }
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      placeholder={t(
                        "newPassword"
                      )}
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-green-400/40 focus:ring-2 focus:ring-green-400/10 ${inputBg}`}
                    />

                  </div>

                  <div>

                    <label className={`text-xs font-medium ${mutedText}`}>
                      {t("confirmPassword")}
                    </label>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder={t(
                        "confirmPassword"
                      )}
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-green-400/40 focus:ring-2 focus:ring-green-400/10 ${inputBg}`}
                    />

                  </div>

                </div>

                <div className="flex justify-end">

                  <button
                    type="button"
                    onClick={
                      handlePasswordChange
                    }
                    className="mt-2 rounded-xl border border-green-400/20 bg-green-400/10 px-5 py-3 text-sm font-semibold text-green-600 transition hover:bg-green-400/15"
                  >
                    {t("updatePassword")}
                  </button>

                </div>

              </div>

            </motion.section>

            {/* PREFERENCES */}

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
                delay: 0.3,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl sm:p-7 ${cardBg}`}
            >

              <p className={`text-xs uppercase tracking-[0.2em] ${softText}`}>
                {t("preferences")}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {t("applicationSettings")}
              </h3>

              <p className={`mt-1 text-sm ${mutedText}`}>
                {t("customizeExperience")}
              </p>

              {/* LANGUAGE */}

              <div className="mt-7">

                <label className={`text-xs font-medium ${mutedText}`}>
                  {t("preferredLanguage")}
                </label>

                <select
                  value={language}
                  onChange={(e) =>
                    handleLanguageChange(
                      e.target
                        .value as Language
                    )
                  }
                  className={`mt-2 w-full appearance-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-green-400/40 ${selectBg}`}
                >

                  {languageOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label} —{" "}
                        {option.native}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* THEME */}

              <div className="mt-7">

                <label className={`text-xs font-medium ${mutedText}`}>
                  Appearance
                </label>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      handleThemeChange(
                        "light"
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      theme === "light"
                        ? "border-green-400 bg-green-400/15 text-green-600 shadow-sm"
                        : isDark
                        ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ☀️ Light
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleThemeChange(
                        "dark"
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      theme === "dark"
                        ? "border-green-400 bg-green-400/15 text-green-500 shadow-sm"
                        : isDark
                        ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🌙 Dark
                  </button>

                </div>

              </div>

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={
                    handleSavePreferences
                  }
                  className="rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-3 text-sm font-bold text-[#03150b] transition hover:scale-[1.02]"
                >
                  {t("savePreferences")}
                </button>

              </div>

            </motion.section>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* NOTIFICATIONS */}

            <motion.section
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl sm:p-7 ${cardBg}`}
            >

              <p className={`text-xs uppercase tracking-[0.2em] ${softText}`}>
                {t("notifications")}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {t("stayUpdated")}
              </h3>

              <div className="mt-7 space-y-6">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium">
                      {t("pushNotifications")}
                    </p>

                    <p className={`mt-1 text-xs leading-5 ${mutedText}`}>
                      {t("farmingAlerts")}
                    </p>

                  </div>

                  <Toggle
                    enabled={
                      notifications
                    }
                    setEnabled={
                      setNotifications
                    }
                  />

                </div>

                <div className={`h-px ${divider}`} />

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium">
                      {t("emailUpdates")}
                    </p>

                    <p className={`mt-1 text-xs leading-5 ${mutedText}`}>
                      {t(
                        "emailRecommendations"
                      )}
                    </p>

                  </div>

                  <Toggle
                    enabled={
                      emailNotifications
                    }
                    setEnabled={
                      setEmailNotifications
                    }
                  />

                </div>

                <div className={`h-px ${divider}`} />

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium">
                      {t("aiInsights")}
                    </p>

                    <p className={`mt-1 text-xs leading-5 ${mutedText}`}>
                      {t(
                        "smartAgriculturalInsights"
                      )}
                    </p>

                  </div>

                  <Toggle
                    enabled={
                      aiUpdates
                    }
                    setEnabled={
                      setAiUpdates
                    }
                  />

                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleSavePreferences
                }
                className="mt-7 w-full rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-semibold text-green-600 transition hover:bg-green-400/15"
              >
                {t(
                  "saveNotificationSettings"
                )}
              </button>

            </motion.section>

            {/* ACCOUNT */}

            <motion.section
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 ${cardSoftBg}`}
            >

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-400/10 blur-3xl" />

              <div className="relative">

                <p className="text-xs uppercase tracking-[0.2em] text-green-600/70">
                  {t("yourAccount")}
                </p>

                <div className="mt-6 flex items-center gap-4">

                  <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400/25 to-blue-500/20 text-xl font-bold text-cyan-700">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user
                        .charAt(0)
                        .toUpperCase() ||
                      "U"
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-semibold">
                      {user || "User"}
                    </p>

                    <p className={`mt-1 truncate text-xs ${mutedText}`}>
                      {email ||
                        t(
                          "noEmailAvailable"
                        )}
                    </p>

                  </div>

                </div>

                <div
                  className={`mt-7 rounded-2xl border border-green-400/10 p-4 ${
                    isDark
                      ? "bg-green-400/[0.04]"
                      : "bg-white/60"
                  }`}
                >

                  <p className="text-xs text-green-600/70">
                    {t("agriAIAccount")}
                  </p>

                  <p className={`mt-2 text-sm ${mutedText}`}>
                    {t("accountActive")}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                >
                  <span>↪</span>

                  {t(
                    "logoutAccount"
                  )}
                </button>

              </div>

            </motion.section>

            {/* DANGER ZONE */}

            <motion.section
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.4,
              }}
              className={`rounded-3xl border border-red-500/15 p-5 sm:p-7 ${
                isDark
                  ? "bg-red-500/[0.025]"
                  : "bg-red-50/70"
              }`}
            >

              <p className="text-xs uppercase tracking-[0.2em] text-red-500/60">
                {t("dangerZone")}
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {t("deleteAccount")}
              </h3>

              <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
                {t(
                  "deleteAccountDescription"
                )}
              </p>

              <button
                type="button"
                onClick={() => {
                  const confirmed =
                    window.confirm(
                      "Are you sure? This action cannot be undone."
                    );

                  if (confirmed) {
                    alert(
                      "Delete account API can be connected here."
                    );
                  }
                }}
                className="mt-5 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
              >
                {t(
                  "deleteAccount"
                )}
              </button>

            </motion.section>

          </div>

        </div>

      </div>

    </main>
  );
}