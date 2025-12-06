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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            
            value={form.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            name="password"
             autoComplete="off" 
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center">{message}</p>}

        <p className="mt-4 text-xs text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
