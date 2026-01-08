"use client";

import Link from "next/link";
// import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-cyan-50 to-white text-slate-800">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-6">
        {/* NAVBAR */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-white font-semibold">
              SS
            </div>
            <div className="leading-tight">
              <p className="font-semibold">SkillSwap</p>
              <p className="text-xs text-slate-500">
                Learn together, grow together
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-emerald-400 px-4 py-1.5 font-medium text-white hover:bg-emerald-500"
            >
              Sign up
            </Link>
          </nav>
        </header>

        {/* HERO */}
        <main className="mt-16 grid items-center gap-16 md:grid-cols-2">
          {/* LEFT */}
          <section>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
              🌱 Peer-to-peer learning
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              Learn by exchanging skills,
              <span className="block text-emerald-500">
                and growing together.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-slate-600">
              SkillSwap connects students who want to learn with students who can
              teach — through real conversations, shared goals, and mutual
              growth.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Get started →
              </Link>

              <Link
                href="/signup"
                className="rounded-full border border-slate-300 px-6 py-2.5 text-sm text-slate-700 hover:bg-white"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              No ads. No pressure. Just learning.
            </p>
          </section>

         {/* RIGHT — FOX (PROPERLY CAMOUFLAGED) */}
<section className="relative flex justify-center">
  <div className="relative isolate">
    {/* soft glow behind fox */}
    <div className="absolute inset-0 -z-10 rounded-full bg-emerald-200/50 blur-3xl" />

    <Image
      src="/mascot/fox.png"
      alt="Learning fox mascot"
      width={320}
      height={320}
      priority
      className="fox-float drop-shadow-2xl mix-blend-multiply select-none"
    />

    <p className="mt-2 text-center text-xs text-slate-500">
      Your calm learning buddy 🦊
    </p>
  </div>
</section>

        </main>

        {/* HOW IT WORKS */}
        <section className="mt-24">
          <h2 className="text-lg font-semibold">How SkillSwap works</h2>
          <p className="mt-1 text-sm text-slate-500">
            Simple steps. Real learning.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Create your profile",
                desc: "Add skills you know and skills you want to learn.",
              },
              {
                title: "Get smart matches",
                desc: "Matched using similarity, not randomness.",
              },
              {
                title: "Chat & learn",
                desc: "Talk, plan sessions, and grow together.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-24 flex justify-between border-t pt-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SkillSwap</p>
          <p>Built with Django & Next.js</p>
        </footer>
      </div>
    </div>
  );
}
