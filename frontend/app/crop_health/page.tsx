"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft,
  Upload,
  Leaf,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  FileImage,
  X,
  Activity,
  Brain,
  RotateCcw,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8001";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/* =========================================================
   TYPES
========================================================= */

interface TopPrediction {
  disease: string;
  confidence: number;
}

interface PredictionResult {
  success: boolean;
  crop: string;
  status: string;
  disease: string;
  confidence: number;
  health_score: number;
  recommendation: string;
  top_predictions?: TopPrediction[];
  filename?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDiseaseName(name: string) {
  if (!name) return "Unknown";

  return name
    .replace(/___/g, " - ")
    .replace(/__/g, " ")
    .replace(/_/g, " ")
    .replace(/Tomato YellowLeaf Curl Virus/gi, "Tomato Yellow Leaf Curl Virus")
    .replace(/Tomato mosaic virus/gi, "Tomato Mosaic Virus")
    .replace(
      /Spider mites Two spotted spider mite/gi,
      "Spider Mites"
    );
}

function isHealthy(status: string) {
  return status?.toLowerCase().includes("healthy");
}

/* =========================================================
   PAGE
========================================================= */

export default function CropHealthPage() {
  const router = useRouter();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [result, setResult] =
    useState<PredictionResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [dragActive, setDragActive] = useState(false);

  /* =======================================================
     THEME
  ======================================================= */

  const pageBg = isDark
    ? "bg-[#00140d]"
    : "bg-[#f3f8f3]";

  const mainText = isDark
    ? "text-white"
    : "text-[#15251a]";

  const secondaryText = isDark
    ? "text-gray-400"
    : "text-[#5c6e61]";

  const mutedText = isDark
    ? "text-gray-500"
    : "text-[#718174]";

  const panelBg = isDark
    ? "bg-[#02291b]/70"
    : "bg-white/85";

  const cardBg = isDark
    ? "bg-[#011a11]/70"
    : "bg-white";

  const borderColor = isDark
    ? "border-emerald-500/20"
    : "border-[#c9ddcf]";

  const softBorder = isDark
    ? "border-white/10"
    : "border-[#d8e6dc]";

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Please upload a JPG, JPEG, PNG or WEBP image."
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Image size must be less than 10 MB."
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     HANDLE FILE
  ======================================================= */

  const handleFile = (file: File) => {
    setError("");
    setResult(null);

    if (!validateFile(file)) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreview(imageUrl);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  /* =======================================================
     DRAG & DROP
  ======================================================= */

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     ANALYZE CROP
  ======================================================= */

  const analyzeCrop = async () => {
    if (!selectedFile) {
      setError(
        "Please upload a crop leaf image first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/crop-health/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from backend."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Crop analysis failed."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to analyze the image."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Crop Health Error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to backend. Please make sure FastAPI is running on port 8001."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetAll = () => {
    removeImage();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className={`
        min-h-screen
        transition-colors duration-500
        ${pageBg}
        ${mainText}
      `}
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`
            absolute inset-0
            ${
              isDark
                ? "bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,140,0.07),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(0,200,120,0.05),transparent_35%)]"
                : "bg-[radial-gradient(circle_at_20%_20%,rgba(30,160,80,0.08),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(30,180,100,0.05),transparent_35%)]"
            }
          `}
        />

        <div
          className={`
            absolute -top-48 -left-40
            h-[500px] w-[500px]
            rounded-full blur-[150px]
            ${
              isDark
                ? "bg-emerald-500/10"
                : "bg-emerald-300/20"
            }
          `}
        />

        <div
          className={`
            absolute top-[45%] -right-48
            h-[550px] w-[550px]
            rounded-full blur-[170px]
            ${
              isDark
                ? "bg-green-500/10"
                : "bg-green-300/15"
            }
          `}
        />
      </div>

      {/* ===================================================
          FIXED TOP NAVBAR
          ONLY THIS SECTION IS FIXED
      =================================================== */}

      <header
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50
          border-b
          backdrop-blur-xl
          transition-colors duration-500
          ${
            isDark
              ? "border-emerald-500/10 bg-[#00150e]/90"
              : "border-[#d8e6dc] bg-white/90"
          }
        `}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="h-[76px] flex items-center justify-between">
            {/* BACK */}

            <button
              onClick={() => router.back()}
              className={`
                flex items-center gap-3
                transition
                ${
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-[#617265] hover:text-[#16271b]"
                }
              `}
            >
              <div
                className={`
                  h-10 w-10
                  rounded-xl
                  border
                  flex items-center justify-center
                  ${
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-[#d5e3d8] bg-white"
                  }
                `}
              >
                <ArrowLeft size={18} />
              </div>

              <span className="hidden sm:block text-sm">
                Back to Dashboard
              </span>
            </button>

            {/* BRAND */}

            <div className="flex items-center gap-3">
              <div
                className={`
                  h-10 w-10
                  rounded-xl
                  border
                  flex items-center justify-center
                  ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50"
                  }
                `}
              >
                <Leaf
                  size={21}
                  className="text-emerald-500"
                />
              </div>

              <div>
                <p className="font-semibold">
                  Crop Health
                </p>

                <p
                  className={`
                    text-[11px]
                    ${mutedText}
                  `}
                >
                  AI Agricultural Intelligence
                </p>
              </div>
            </div>

            {/* MODEL STATUS */}

            <div
              className={`
                hidden sm:flex
                items-center gap-2
                rounded-full
                px-4 py-2
                border
                ${
                  isDark
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-emerald-200 bg-emerald-50"
                }
              `}
            >
              <span
                className="
                  h-2 w-2
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_10px_rgba(0,255,140,0.8)]
                "
              />

              <span className="text-xs text-emerald-500 font-medium">
                AI MODEL ACTIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          SPACE FOR FIXED HEADER
      =================================================== */}

      <div className="h-[76px]" />

      {/* ===================================================
          HERO
          NOT FIXED
          NOT STICKY
      =================================================== */}

      <section
        className={`
          relative
          z-20
          border-b
          backdrop-blur-xl
          transition-colors duration-500
          ${
            isDark
              ? "bg-[#00140d]/80 border-emerald-500/10"
              : "bg-[#f3f8f3]/80 border-[#d5e4d9]"
          }
        `}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="py-12 sm:py-14 lg:py-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              {/* HERO TEXT */}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="
                      h-2 w-2
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_12px_rgba(0,255,140,0.9)]
                    "
                  />

                  <span className="text-xs sm:text-sm tracking-[0.2em] uppercase text-emerald-500 font-medium">
                    AI Crop Intelligence
                  </span>
                </div>

                <h1
                  className="
                    text-4xl
                    sm:text-5xl
                    lg:text-6xl
                    font-bold
                    tracking-tight
                    leading-[1.05]
                  "
                >
                  Check Your Crop&apos;s{" "}
                  <span className="text-emerald-500">
                    Health
                  </span>
                </h1>

                <p
                  className={`
                    mt-5
                    max-w-2xl
                    text-sm
                    sm:text-base
                    leading-7
                    ${secondaryText}
                  `}
                >
                  Upload a crop leaf image and get
                  AI-powered disease detection, health
                  scoring and practical agricultural
                  recommendations.
                </p>
              </div>

              {/* HERO BADGE */}

              <div
                className={`
                  flex items-center gap-3
                  self-start
                  lg:self-end
                  rounded-2xl
                  border
                  px-5 py-4
                  ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-emerald-200 bg-emerald-50/70"
                  }
                `}
              >
                <Sparkles
                  size={20}
                  className="text-emerald-500"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Intelligent Diagnosis
                  </p>

                  <p
                    className={`
                      text-xs
                      mt-1
                      ${mutedText}
                    `}
                  >
                    MobileNetV2 • 15 conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SCROLLABLE CONTENT
      =================================================== */}

      <section className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-10">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-6
              rounded-2xl
              border border-red-500/20
              bg-red-500/[0.06]
              px-5 py-4
              flex items-start gap-3
            "
          >
            <AlertTriangle
              size={19}
              className="text-red-400 mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">
                Analysis Error
              </p>

              <p className="text-sm text-red-400/70 mt-1">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError("")}
              className="text-gray-500 hover:text-red-400"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            MAIN ANALYSIS PANEL
        ================================================= */}

        <div
          className={`
            rounded-[28px]
            border
            overflow-hidden
            transition-colors duration-500
            ${panelBg}
            ${borderColor}
            ${
              isDark
                ? "shadow-[0_0_70px_rgba(0,255,140,0.04)]"
                : "shadow-[0_15px_50px_rgba(30,80,45,0.08)]"
            }
          `}
        >
          {/* PANEL HEADER */}

          <div
            className={`
              px-6
              sm:px-8
              lg:px-10
              py-5
              border-b
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
              ${
                isDark
                  ? "border-emerald-500/10"
                  : "border-[#e0e9e2]"
              }
            `}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-[11px] tracking-[0.2em] uppercase text-emerald-500">
                  Crop Analysis
                </span>
              </div>

              <h2 className="text-xl font-semibold">
                Upload & Analyze
              </h2>
            </div>

            <div
              className={`
                flex items-center gap-2
                text-xs
                ${mutedText}
              `}
            >
              <ShieldCheck
                size={15}
                className="text-emerald-500"
              />

              Secure AI processing
            </div>
          </div>

          {/* PANEL BODY */}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
              {/* =================================================
                  UPLOAD
              ================================================= */}

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p
                      className={`text-xs ${mutedText}`}
                    >
                      STEP 01
                    </p>

                    <h3 className="text-xl font-semibold mt-1">
                      Upload Leaf Image
                    </h3>
                  </div>

                  <div
                    className={`
                      h-11 w-11
                      rounded-xl
                      border
                      flex items-center justify-center
                      ${
                        isDark
                          ? "border-emerald-500/20 bg-emerald-500/10"
                          : "border-emerald-200 bg-emerald-50"
                      }
                    `}
                  >
                    <Camera
                      size={20}
                      className="text-emerald-500"
                    />
                  </div>
                </div>

                {/* EMPTY UPLOAD */}

                {!preview ? (
                  <div
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      min-h-[370px]
                      rounded-2xl
                      border-2
                      border-dashed
                      flex
                      flex-col
                      items-center
                      justify-center
                      text-center
                      cursor-pointer
                      transition-all duration-300
                      ${
                        dragActive
                          ? "border-emerald-400 bg-emerald-400/10"
                          : isDark
                          ? "border-emerald-500/15 bg-[#011a11]/70 hover:border-emerald-500/35 hover:bg-emerald-500/[0.04]"
                          : "border-[#c9ddcf] bg-[#f9fcf9] hover:border-emerald-400 hover:bg-emerald-50/50"
                      }
                    `}
                  >
                    <div
                      className={`
                        h-20 w-20
                        rounded-2xl
                        border
                        flex items-center justify-center
                        mb-5
                        ${
                          isDark
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-emerald-50 border-emerald-200"
                        }
                      `}
                    >
                      <Upload
                        size={30}
                        className="text-emerald-500"
                      />
                    </div>

                    <h4 className="text-lg font-semibold">
                      {dragActive
                        ? "Drop image here"
                        : "Upload crop leaf image"}
                    </h4>

                    <p
                      className={`
                        max-w-md
                        mt-3
                        text-sm
                        leading-6
                        ${mutedText}
                      `}
                    >
                      Drag & drop your leaf image here or
                      click to browse from your device.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                      {[
                        "JPG",
                        "JPEG",
                        "PNG",
                        "WEBP",
                      ].map((type) => (
                        <span
                          key={type}
                          className={`
                            px-3 py-1.5
                            rounded-lg
                            border
                            text-[10px]
                            ${
                              isDark
                                ? "border-white/10 bg-white/[0.03] text-gray-500"
                                : "border-[#dbe7de] bg-white text-gray-500"
                            }
                          `}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <p
                      className={`
                        text-[11px]
                        mt-5
                        ${mutedText}
                      `}
                    >
                      Maximum file size: 10 MB
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  /* IMAGE PREVIEW */

                  <div
                    className={`
                      relative
                      rounded-2xl
                      overflow-hidden
                      border
                      ${softBorder}
                      ${
                        isDark
                          ? "bg-black/30"
                          : "bg-[#f7faf7]"
                      }
                    `}
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={preview}
                        alt="Crop leaf preview"
                        className="
                          absolute
                          inset-0
                          w-full
                          h-full
                          object-contain
                        "
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      <button
                        onClick={removeImage}
                        className="
                          absolute
                          top-4
                          right-4
                          h-10
                          w-10
                          rounded-xl
                          bg-black/60
                          border
                          border-white/10
                          backdrop-blur-md
                          flex
                          items-center
                          justify-center
                          hover:bg-red-500/80
                          transition
                        "
                      >
                        <X size={18} />
                      </button>

                      <div className="absolute left-4 right-4 bottom-4">
                        <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-3 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FileImage
                              size={18}
                              className="text-emerald-400"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {selectedFile?.name}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {selectedFile
                                ? (
                                    selectedFile.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)
                                : "0"}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}

                {preview && (
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={loading}
                      className={`
                        h-12
                        rounded-xl
                        border
                        text-sm
                        font-medium
                        transition
                        disabled:opacity-50
                        ${
                          isDark
                            ? "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07]"
                            : "border-[#d5e2d8] bg-white text-[#536457] hover:bg-[#f2f7f3]"
                        }
                      `}
                    >
                      Change Image
                    </button>

                    <button
                      onClick={analyzeCrop}
                      disabled={loading}
                      className="
                        h-12
                        rounded-xl
                        bg-emerald-500
                        hover:bg-emerald-400
                        text-black
                        font-semibold
                        text-sm
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition
                        disabled:opacity-60
                      "
                    >
                      {loading ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />

                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          Analyze Crop
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* =================================================
                  RESULT
              ================================================= */}

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p
                      className={`text-xs ${mutedText}`}
                    >
                      STEP 02
                    </p>

                    <h3 className="text-xl font-semibold mt-1">
                      AI Analysis Result
                    </h3>
                  </div>

                  {result && (
                    <button
                      onClick={resetAll}
                      className={`
                        h-10
                        w-10
                        rounded-xl
                        border
                        flex
                        items-center
                        justify-center
                        transition
                        ${
                          isDark
                            ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                            : "border-[#d5e2d8] bg-white hover:bg-[#f2f7f3]"
                        }
                      `}
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>

                {!result ? (
                  <div
                    className={`
                      min-h-[370px]
                      rounded-2xl
                      border
                      flex
                      flex-col
                      items-center
                      justify-center
                      text-center
                      px-7
                      ${softBorder}
                      ${cardBg}
                    `}
                  >
                    <div
                      className={`
                        h-20
                        w-20
                        rounded-full
                        border
                        flex
                        items-center
                        justify-center
                        mb-5
                        ${
                          isDark
                            ? "border-emerald-500/10 bg-emerald-500/[0.04]"
                            : "border-emerald-100 bg-emerald-50"
                        }
                      `}
                    >
                      <Brain
                        size={31}
                        className="text-emerald-500/40"
                      />
                    </div>

                    <h4
                      className={`
                        text-lg
                        font-semibold
                        ${
                          isDark
                            ? "text-gray-400"
                            : "text-[#617265]"
                        }
                      `}
                    >
                      Waiting for analysis
                    </h4>

                    <p
                      className={`
                        max-w-sm
                        text-sm
                        leading-6
                        mt-3
                        ${mutedText}
                      `}
                    >
                      Upload a crop leaf image and start
                      the AI analysis to view the health
                      condition here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* STATUS */}

                    <div
                      className={`
                        rounded-2xl
                        border
                        p-5
                        ${
                          isHealthy(result.status)
                            ? isDark
                              ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                              : "border-emerald-200 bg-emerald-50/70"
                            : "border-red-500/20 bg-red-500/[0.06]"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              h-11
                              w-11
                              rounded-xl
                              flex
                              items-center
                              justify-center
                              ${
                                isHealthy(
                                  result.status
                                )
                                  ? "bg-emerald-500/10"
                                  : "bg-red-500/10"
                              }
                            `}
                          >
                            {isHealthy(
                              result.status
                            ) ? (
                              <CheckCircle2
                                size={22}
                                className="text-emerald-500"
                              />
                            ) : (
                              <AlertTriangle
                                size={22}
                                className="text-red-400"
                              />
                            )}
                          </div>

                          <div>
                            <p
                              className={`
                                text-[11px]
                                uppercase
                                tracking-wider
                                ${mutedText}
                              `}
                            >
                              Plant Status
                            </p>

                            <p
                              className={`
                                text-lg
                                font-bold
                                mt-1
                                ${
                                  isHealthy(
                                    result.status
                                  )
                                    ? "text-emerald-500"
                                    : "text-red-400"
                                }
                              `}
                            >
                              {result.status}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`
                              text-[11px]
                              ${mutedText}
                            `}
                          >
                            Crop
                          </p>

                          <p className="font-semibold mt-1">
                            {result.crop}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CONDITION */}

                    <div
                      className={`
                        rounded-2xl
                        border
                        p-5
                        ${softBorder}
                        ${cardBg}
                      `}
                    >
                      <p
                        className={`
                          text-[11px]
                          uppercase
                          tracking-wider
                          ${mutedText}
                        `}
                      >
                        Detected Condition
                      </p>

                      <h4 className="text-xl font-bold mt-2 leading-7">
                        {formatDiseaseName(
                          result.disease
                        )}
                      </h4>

                      <div className="mt-5">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`
                              text-xs
                              ${mutedText}
                            `}
                          >
                            AI Confidence
                          </span>

                          <span className="text-sm font-semibold text-emerald-500">
                            {Number(
                              result.confidence
                            ).toFixed(2)}
                            %
                          </span>
                        </div>

                        <div
                          className={`
                            h-2
                            rounded-full
                            overflow-hidden
                            ${
                              isDark
                                ? "bg-white/5"
                                : "bg-emerald-100"
                            }
                          `}
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-emerald-400
                              transition-all
                              duration-700
                            "
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(
                                    result.confidence
                                  )
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* METRICS */}

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`
                          rounded-2xl
                          border
                          p-5
                          ${softBorder}
                          ${cardBg}
                        `}
                      >
                        <p
                          className={`
                            text-xs
                            ${mutedText}
                          `}
                        >
                          Health Score
                        </p>

                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold text-emerald-500">
                            {result.health_score}
                          </span>

                          <span
                            className={`
                              text-xs
                              ${mutedText}
                            `}
                          >
                            /100
                          </span>
                        </div>
                      </div>

                      <div
                        className={`
                          rounded-2xl
                          border
                          p-5
                          ${softBorder}
                          ${cardBg}
                        `}
                      >
                        <p
                          className={`
                            text-xs
                            ${mutedText}
                          `}
                        >
                          Confidence
                        </p>

                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold">
                            {Number(
                              result.confidence
                            ).toFixed(1)}
                          </span>

                          <span
                            className={`
                              text-xs
                              ${mutedText}
                            `}
                          >
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RECOMMENDATION */}

                    <div
                      className={`
                        rounded-2xl
                        border
                        p-5
                        ${
                          isDark
                            ? "border-emerald-500/15 bg-emerald-500/[0.05]"
                            : "border-emerald-200 bg-emerald-50/70"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles
                          size={17}
                          className="text-emerald-500"
                        />

                        <span className="text-sm font-semibold text-emerald-600">
                          Agricultural Recommendation
                        </span>
                      </div>

                      <p
                        className={`
                          text-sm
                          leading-7
                          ${
                            isDark
                              ? "text-gray-300"
                              : "text-[#4f6154]"
                          }
                        `}
                      >
                        {result.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TOP PREDICTIONS
        ================================================= */}

        {result?.top_predictions &&
          result.top_predictions.length > 0 && (
            <div
              className={`
                mt-8
                rounded-[28px]
                border
                p-6
                sm:p-8
                ${softBorder}
                ${panelBg}
              `}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`
                    h-10
                    w-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    ${
                      isDark
                        ? "bg-emerald-500/10"
                        : "bg-emerald-50"
                    }
                  `}
                >
                  <Activity
                    size={18}
                    className="text-emerald-500"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-500">
                    Model Output
                  </p>

                  <h3 className="text-xl font-semibold mt-1">
                    Top Predictions
                  </h3>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {result.top_predictions.map(
                  (prediction, index) => (
                    <div
                      key={`${prediction.disease}-${index}`}
                      className={`
                        rounded-2xl
                        border
                        p-4
                        ${softBorder}
                        ${cardBg}
                      `}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`
                              h-8
                              w-8
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-xs
                              ${
                                isDark
                                  ? "bg-white/[0.04] text-gray-500"
                                  : "bg-emerald-50 text-emerald-600"
                              }
                            `}
                          >
                            {index + 1}
                          </div>

                          <p
                            className={`
                              text-sm
                              truncate
                              ${
                                isDark
                                  ? "text-gray-300"
                                  : "text-[#526457]"
                              }
                            `}
                          >
                            {formatDiseaseName(
                              prediction.disease
                            )}
                          </p>
                        </div>

                        <span className="text-xs text-emerald-500 shrink-0">
                          {Number(
                            prediction.confidence
                          ).toFixed(2)}
                          %
                        </span>
                      </div>

                      <div
                        className={`
                          h-1.5
                          rounded-full
                          mt-4
                          overflow-hidden
                          ${
                            isDark
                              ? "bg-white/5"
                              : "bg-emerald-100"
                          }
                        `}
                      >
                        <div
                          className="
                            h-full
                            bg-emerald-400
                            rounded-full
                          "
                          style={{
                            width: `${Math.min(
                              100,
                              prediction.confidence
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <InfoCard
            icon={<Camera size={19} />}
            number="01"
            title="Capture"
            text="Take a clear and well-lit photo of the crop leaf."
            isDark={isDark}
            softBorder={softBorder}
            cardBg={cardBg}
            mutedText={mutedText}
          />

          <InfoCard
            icon={<Sparkles size={19} />}
            number="02"
            title="Analyze"
            text="Our trained AI model analyzes visual leaf patterns."
            isDark={isDark}
            softBorder={softBorder}
            cardBg={cardBg}
            mutedText={mutedText}
          />

          <InfoCard
            icon={<ShieldCheck size={19} />}
            number="03"
            title="Improve"
            text="Get a health score and practical farming recommendation."
            isDark={isDark}
            softBorder={softBorder}
            cardBg={cardBg}
            mutedText={mutedText}
          />
        </div>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div className="mt-7 flex justify-center pb-12">
          <p
            className={`
              max-w-3xl
              text-center
              text-[11px]
              leading-5
              ${mutedText}
            `}
          >
            AI predictions are provided as an agricultural
            advisory tool. For severe or uncertain crop
            conditions, consult a qualified agricultural
            expert.
          </p>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  number,
  title,
  text,
  isDark,
  softBorder,
  cardBg,
  mutedText,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
  isDark: boolean;
  softBorder: string;
  cardBg: string;
  mutedText: string;
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        transition-all duration-300
        hover:-translate-y-0.5
        ${softBorder}
        ${cardBg}
      `}
    >
      <div className="flex items-center justify-between">
        <div
          className={`
            h-10
            w-10
            rounded-xl
            flex
            items-center
            justify-center
            text-emerald-500
            ${
              isDark
                ? "bg-emerald-500/10 border border-emerald-500/10"
                : "bg-emerald-50 border border-emerald-100"
            }
          `}
        >
          {icon}
        </div>

        <span
          className={`
            text-xs
            font-mono
            ${
              isDark
                ? "text-gray-700"
                : "text-gray-300"
            }
          `}
        >
          {number}
        </span>
      </div>

      <h4 className="font-semibold mt-5">
        {title}
      </h4>

      <p
        className={`
          text-sm
          leading-6
          mt-2
          ${mutedText}
        `}
      >
        {text}
      </p>
    </div>
  );
}