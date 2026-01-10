"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiPost } from "@/lib/api"; // adjust path if needed

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await apiPost("/api/auth/register/", form);
      setMessage("Account created 🌱 Redirecting...");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      setMessage(
        err?.email?.[0] ||
        err?.username?.[0] ||
        err?.password?.[0] ||
        "Signup failed 😅"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-mint-100 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-[380px] rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-semibold">
              SS
            </div>
            <span className="text-sm font-medium text-slate-800">
              SkillSwap
            </span>
          </Link>

          <h1 className="text-lg font-semibold text-slate-800">
            Create your account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join SkillSwap in under a minute
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"
            required
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"
            required
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-white shadow hover:bg-emerald-600 transition"
          >
            {loading ? "Creating..." : "Create free account →"}
          </motion.button>
        </form>

        {message && (
          <p className="mt-3 text-xs text-center text-slate-500">
            {message}
          </p>
        )}

        <p className="mt-5 text-xs text-center text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:underline underline-offset-2"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
