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
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      setMessage("Error: " + JSON.stringify(err));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
             autoComplete="off" 
            value={form.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="email"
            placeholder="Email"
             autoComplete="off" 
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
             autoComplete="off" 
            value={form.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
          >
            Sign Up
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center">{message}</p>}

        <p className="mt-4 text-xs text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
