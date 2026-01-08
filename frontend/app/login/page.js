"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const data = await apiPost("/api/auth/login/", form);

      if (typeof window !== "undefined") {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
      }

      setMessage("Welcome back 🌱 Redirecting...");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      setMessage("Hmm 🤔 something went wrong. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-mint-100 flex items-center justify-center px-6 relative">
      
      {/* CENTER WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative"
      >

        {/* 🦊 FOX — ABSOLUTE (does NOT affect centering) */}
        <div className="hidden md:block absolute -left-72 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/mascot/fox-curious.png" // ✅ transparent PNG
              alt="Curious learning fox"
              width={220}
              height={220}
              priority
            />
          </motion.div>

          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-slate-800">
              Welcome back 👋
            </p>
            <p className="text-xs text-slate-600">
              Let’s see what you’re learning today.
            </p>
          </div>
        </div>

        {/* 🔐 LOGIN CARD — PERFECT CENTER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-[380px] rounded-2xl bg-white p-8 shadow-xl"
        >
          {/* LOGO */}
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
              Login to your space
            </h1>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-2 w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-white shadow hover:bg-emerald-600 transition"
            >
              Continue learning →
            </motion.button>
          </form>

          {message && (
            <p className="mt-3 text-xs text-center text-slate-500">
              {message}
            </p>
          )}

          <p className="mt-5 text-xs text-center text-slate-500">
            New here?{" "}
            <Link
              href="/signup"
              className="text-emerald-600 hover:underline underline-offset-2"
            >
              Create free account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
