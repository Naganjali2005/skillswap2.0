"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, go directly to dashboard
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access");
      if (token) router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">SkillSwap</h1>
        <p className="text-sm text-slate-600 mb-8">
          Connect with peers, exchange skills, and grow together.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="w-full border border-slate-900 text-slate-900 py-2 rounded-lg hover:bg-slate-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
