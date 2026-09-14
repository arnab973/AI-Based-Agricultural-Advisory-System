"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

import Background3D from "../../components/Background3D";
import { useFlashMessage } from "@/context/FlashMessageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export default function LoginPage() {
  const router = useRouter();
  const { showMessage } = useFlashMessage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMessage =
          data?.detail || "Invalid email or password";

        setError(errorMessage);
        showMessage(errorMessage, "error");
        return;
      }

      if (!data?.user_id) {
        throw new Error("User ID was not received from server");
      }

      localStorage.setItem("user", String(data.user || ""));
      localStorage.setItem("email", email);
      localStorage.setItem("user_id", String(data.user_id));

      showMessage("Login successful!", "success");

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again.";

      setError(errorMessage);
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(
    credentialResponse: CredentialResponse
  ) {
    if (!credentialResponse.credential) {
      const errorMessage =
        "Google login failed. Please try again.";

      setError(errorMessage);
      showMessage(errorMessage, "error");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail || "Google login failed"
        );
      }

      if (!data?.user_id) {
        throw new Error(
          "User ID was not received from server"
        );
      }

      localStorage.setItem(
        "user",
        String(data.user || "")
      );

      localStorage.setItem(
        "email",
        String(data.email || "")
      );

      localStorage.setItem(
        "user_id",
        String(data.user_id)
      );

      if (data.profile_image) {
        localStorage.setItem(
          "profile_image",
          String(data.profile_image)
        );
      }

      showMessage("Google login successful!", "success");

      router.push("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google login failed. Please try again.";

      setError(errorMessage);
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    const errorMessage =
      "Google login failed. Please try again.";

    setError(errorMessage);
    showMessage(errorMessage, "error");
  }

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider
      clientId={googleClientId || ""}
    >
      {/* =====================================================
          FULL LOGIN PAGE
      ===================================================== */}
      <div className="relative h-screen w-full overflow-hidden bg-[#04110a]">

        {/* ===================================================
            3D BACKGROUND
        =================================================== */}
        <div className="fixed inset-0 z-0">
          <Background3D />
        </div>

        {/* ===================================================
            LIGHT DARK OVERLAY
            Background remains clearly visible
        =================================================== */}
        <div
          className="
            pointer-events-none
            fixed
            inset-0
            z-[1]
            bg-gradient-to-b
            from-[#03140b]/5
            via-[#03140b]/15
            to-[#03140b]/35
          "
        />

        {/* ===================================================
            CENTER AI GLOW
        =================================================== */}
        <div
          className="
            pointer-events-none
            fixed
            left-1/2
            top-1/2
            z-[1]
            h-[500px]
            w-[500px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-emerald-400/[0.07]
            blur-[120px]
          "
        />

        {/* ===================================================
            LOGIN AREA
        =================================================== */}
        <div
          className="
            relative
            z-10
            flex
            h-screen
            w-full
            items-center
            justify-center
            overflow-hidden
            px-4
          "
        >

          {/* =================================================
              LOGIN CARD
          ================================================= */}
          <div
            className="
              relative
              w-full
              max-w-[420px]
              overflow-hidden
              rounded-3xl
              border
              border-white/[0.16]
              bg-[#06140d]/25
              px-6
              py-5
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              backdrop-blur-md
              sm:px-7
              sm:py-6
            "
          >

            {/* =================================================
                CARD TOP GLOW
            ================================================= */}
            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-28
                w-64
                -translate-x-1/2
                rounded-full
                bg-emerald-400/[0.07]
                blur-[65px]
              "
            />

            {/* =================================================
                LOGO
            ================================================= */}
            <div className="relative flex justify-center">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-emerald-300/20
                  bg-emerald-400/[0.08]
                  shadow-[0_0_25px_rgba(16,185,129,0.10)]
                "
              >
                <span className="text-xl">
                  🌱
                </span>
              </div>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}
            <div className="relative mt-3 text-center">
              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                  drop-shadow-lg
                "
              >
                Welcome Back
              </h1>

              <p
                className="
                  mt-1.5
                  text-sm
                  text-emerald-100/60
                "
              >
                Login to your AI Agricultural Assistant
              </p>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}
            {error && (
              <div
                className="
                  relative
                  mt-4
                  rounded-xl
                  border
                  border-red-400/30
                  bg-red-500/[0.12]
                  px-4
                  py-2.5
                  text-center
                  text-sm
                  text-red-200
                  backdrop-blur-sm
                "
              >
                {error}
              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================= */}
            <form
              className="relative mt-5 space-y-4"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}
              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-emerald-100/90
                  "
                >
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/[0.14]
                    bg-black/[0.16]
                    px-4
                    py-3
                    text-white
                    placeholder:text-white/30
                    outline-none
                    transition-all
                    duration-300
                    focus:border-emerald-400/60
                    focus:bg-black/[0.22]
                    focus:ring-2
                    focus:ring-emerald-400/15
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-emerald-100/90
                  "
                >
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/[0.14]
                    bg-black/[0.16]
                    px-4
                    py-3
                    text-white
                    placeholder:text-white/30
                    outline-none
                    transition-all
                    duration-300
                    focus:border-emerald-400/60
                    focus:bg-black/[0.22]
                    focus:ring-2
                    focus:ring-emerald-400/15
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />
              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-emerald-300/20
                  bg-emerald-500/85
                  py-3
                  font-semibold
                  text-white
                  shadow-[0_8px_25px_rgba(16,185,129,0.18)]
                  transition-all
                  duration-300
                  hover:bg-emerald-400
                  hover:shadow-[0_8px_30px_rgba(16,185,129,0.28)]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>

            {/* =================================================
                GOOGLE DIVIDER
            ================================================= */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.12]" />

              <span
                className="
                  text-xs
                  font-medium
                  tracking-wider
                  text-emerald-100/45
                "
              >
                OR
              </span>

              <div className="h-px flex-1 bg-white/[0.12]" />
            </div>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}
            <div className="flex justify-center overflow-hidden rounded-xl">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="350"
              />
            </div>

            {/* =================================================
                SIGN UP
            ================================================= */}
            <p
              className="
                mt-5
                text-center
                text-sm
                text-emerald-100/60
              "
            >
              Don't have an account?{" "}

              <Link
                href="/signup"
                className="
                  font-semibold
                  text-emerald-300
                  transition-colors
                  duration-300
                  hover:text-emerald-200
                  hover:underline
                "
              >
                Sign Up
              </Link>
            </p>

          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}