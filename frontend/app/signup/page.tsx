"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Background3D from "../../components/Background3D";

export default function SignupPage() {
  const router = useRouter();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("(`${process.env.NEXT_PUBLIC_API_URL}/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "Account created successfully!");
      setLoading(false);

      // Redirect to login after a short delay
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
      setLoading(false);
    }
  }

return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      {/* 3D Animated Background */}
      <Background3D />

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-2xl shadow-2xl">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-white mb-8 drop-shadow">
          Sign Up
        </h1>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-4 py-3 rounded-lg text-center">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label className="block mb-2 font-medium text-emerald-100">
              First Name
            </label>

            <input
              type="text"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="w-full border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-2 font-medium text-emerald-100">
              Last Name
            </label>

            <input
              type="text"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
              className="w-full border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-emerald-100">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-medium text-emerald-100">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 font-medium text-emerald-100">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-400 transition duration-300 disabled:opacity-50 shadow-lg shadow-emerald-500/30"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-emerald-100/80">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-300 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
