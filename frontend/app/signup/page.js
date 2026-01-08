"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await apiPost("/api/auth/register/", form);
      setMessage("Account created 🌱 Redirecting...");
      setTimeout(() => router.push("/login"), 900);
    } catch (err) {
      setMessage("Something went wrong 😅 Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-mint-100 flex items-center justify-center px-6">
      
      {/* SIGNUP CARD */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-[380px] rounded-2xl bg-white p-8 shadow-xl"
      >
        {/* LOGO + TITLE */}
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <input
            name="username"
            placeholder="Username"
            autoComplete="off"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition"
          />

          <input
            name="email"
            placeholder="Email"
            autoComplete="off"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="off"
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
            Create free account →
          </motion.button>
        </form>

        {message && (
          <p className="mt-3 text-xs text-center text-slate-500">
            {message}
          </p>
        )}

        {/* FOOTER */}
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
