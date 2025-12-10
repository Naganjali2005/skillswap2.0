"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      setMessage("Signup successful! Redirecting...");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      setMessage("Error: " + JSON.stringify(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      {/* Compact Card */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 px-6 py-7 shadow-xl">
        {/* small logo */}
        <div className="flex flex-col items-center mb-5">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
              <span className="text-sm font-semibold">SS</span>
            </div>
            <span className="text-sm font-medium text-slate-100">
              SkillSwap
            </span>
          </Link>

          <h1 className="text-lg font-semibold">Create Account</h1>
          <p className="text-[12px] text-slate-400 mt-1">
            Join SkillSwap in a minute
          </p>
        </div>

        {/* signup form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <input
            name="username"
            placeholder="Username"
            autoComplete="off"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />

          <input
            name="email"
            placeholder="Email"
            autoComplete="off"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="off"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-600 active:scale-[0.98] transition"
          >
            Sign Up
          </button>

          {message && (
            <p className="mt-2 text-center text-[12px] text-slate-300">
              {message}
            </p>
          )}
        </form>

        {/* footer */}
        <p className="mt-4 text-[11px] text-center text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
