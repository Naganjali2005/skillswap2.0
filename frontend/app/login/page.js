"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      setMessage("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      setMessage("Error: " + JSON.stringify(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 px-6 py-7 shadow-xl">
        {/* small logo + title */}
        <div className="flex flex-col items-center mb-5">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
              <span className="text-sm font-semibold">SS</span>
            </div>
            <span className="text-sm font-medium text-slate-100">
              SkillSwap
            </span>
          </Link>
          <h1 className="text-lg font-semibold">Login</h1>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />

          <input
            type="password"
            name="password"
            autoComplete="off"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-600 active:scale-[0.98] transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-3 text-xs text-center text-slate-300">{message}</p>
        )}

        <p className="mt-4 text-[11px] text-center text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
