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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-10rem] h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute right-[-5rem] top-40 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* Page content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-6 lg:px-8">
        {/* NAVBAR */}
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
              <span className="text-lg font-semibold tracking-tight">SS</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-slate-100">
                SkillSwap
              </span>
              <span className="text-[11px] text-slate-400">
                Learn. Teach. Grow together.
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="#how-it-works"
              className="hidden text-slate-300 transition-colors hover:text-white md:inline"
            >
              How it works
            </Link>
            <Link
              href="#features"
              className="hidden text-slate-300 transition-colors hover:text-white md:inline"
            >
              Features
            </Link>
            <Link
              href="#why"
              className="hidden text-slate-300 transition-colors hover:text-white md:inline"
            >
              Why SkillSwap
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-700 bg-slate-900/40 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-slate-500 hover:bg-slate-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="hidden rounded-full bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-white md:inline-flex"
            >
              Sign up
            </Link>
          </nav>
        </header>

        {/* MAIN */}
        <main className="mt-6 flex flex-1 flex-col gap-12 lg:mt-12 lg:flex-row lg:items-center">
          {/* HERO LEFT */}
          <section className="max-w-xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium">Live learning • Peer to peer</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                Trade your skills,
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  {" "}
                  master something new.
                </span>
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-slate-300 sm:text-[15px]">
                SkillSwap connects students who{" "}
                <span className="font-medium text-slate-100">
                  have a skill
                </span>{" "}
                with those who{" "}
                <span className="font-medium text-slate-100">
                  want to learn it
                </span>
                . Chat, plan a live session, and grow together — no coaching
                centers, just real people helping each other.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:brightness-110"
              >
                Get started
                <span className="ml-1.5 text-lg transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 px-5 py-2 text-xs font-medium text-slate-100 shadow-sm transition hover:border-slate-500 hover:bg-slate-900"
              >
                Create free account
              </Link>

              <p className="w-full text-[11px] text-slate-400 sm:w-auto">
                No payment, no ads. Just skill exchange.
              </p>
            </div>

            {/* mini stats */}
            <div className="mt-4 grid max-w-md grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 shadow-sm">
                <p className="text-[11px] text-slate-400">Matches</p>
                <p className="text-lg font-semibold text-slate-50">120+</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 shadow-sm">
                <p className="text-[11px] text-slate-400">Skills listed</p>
                <p className="text-lg font-semibold text-slate-50">40+</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 shadow-sm">
                <p className="text-[11px] text-slate-400">Colleges</p>
                <p className="text-lg font-semibold text-slate-50">10+</p>
              </div>
            </div>
          </section>

          {/* HERO RIGHT – preview cards */}
          <section className="relative mt-4 flex flex-1 justify-center lg:mt-0">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -right-4 h-24 w-24 rounded-full border border-cyan-400/40 bg-cyan-400/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full border border-purple-500/40 bg-purple-500/10 blur-2xl" />

              <div className="space-y-4">
                {/* main match card */}
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-2xl backdrop-blur">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400" />
                      <div className="text-xs leading-tight">
                        <p className="font-semibold text-slate-100">
                          React Beginner
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Looking for: React basics
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                      Perfect match
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900/80 p-3 text-[11px] text-slate-300">
                    <p>
                      <span className="font-medium text-slate-100">You</span>{" "}
                      can teach{" "}
                      <span className="font-medium text-indigo-300">
                        Python & Git
                      </span>{" "}
                      and want to learn{" "}
                      <span className="font-medium text-cyan-300">
                        React & Tailwind
                      </span>
                      .
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Swap skills with Ananya this weekend and build a mini
                      project together.
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-900 transition hover:bg-white">
                      Send request
                    </button>
                    <button className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] text-slate-200 transition hover:border-slate-500">
                      View profile
                    </button>
                  </div>
                </div>

                {/* chat preview card */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-3 text-[11px] text-slate-200 shadow-lg backdrop-blur">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    Live chat preview
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="mt-1 h-6 w-6 rounded-full bg-slate-700" />
                      <div className="max-w-[75%] rounded-2xl bg-slate-800 px-3 py-2">
                        <p>Hey, can you help me with React hooks?</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <div className="max-w-[75%] rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-2 text-right">
                        <p>Sure! You can teach me DSA in return 😄</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* small info strip */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-[11px] text-slate-300 shadow-inner">
                  <p>Built for students who learn better together.</p>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    Beta
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mt-12 border-t border-slate-800/70 pt-8"
        >
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">
            How SkillSwap works
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Three simple steps to turn your skills into a two-way learning loop.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Create your profile",
                desc: "List what you can teach and what you want to learn. Be specific — this helps better matching.",
              },
              {
                title: "2. Get matched with peers",
                desc: "Our matching logic pairs you with students who want your skill and can teach you theirs.",
              },
              {
                title: "3. Chat & schedule sessions",
                desc: "Use built-in chat (and calls later) to decide a time, set goals, and learn together.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300 shadow-sm"
              >
                <p className="mb-1 text-[11px] font-semibold text-slate-100">
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY SECTION */}
        <section
          id="why"
          className="mt-10 grid gap-6 border-t border-slate-800/70 pt-8 md:grid-cols-[1.1fr,0.9fr]"
        >
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-100">
              Why SkillSwap instead of random YouTube tutorials?
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Because it is easier to stay consistent when someone is learning
              with you.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Learn in your own language + English, at your pace.
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-cyan-400" />
                No pressure of “teacher–student”; both sides are learners.
              </li>
              <li className="flex gap-2">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Perfect for building portfolio projects and revising core skills.
              </li>
            </ul>
          </div>

          {/* testimonial card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300 shadow-lg">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Student feedback
            </p>
            <p className="mt-2 text-[11px] italic text-slate-200">
              “I taught Git & basic Python, and in return learned React from a
              senior. We ended up building a mini project together, and I used
              it in my resume.”
            </p>
            <p className="mt-3 text-[11px] font-medium text-slate-100">
              – Third year, CSE
            </p>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="mt-10 border-t border-slate-800/70 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-100">
                What&apos;s inside SkillSwap?
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Designed like a real product you can show in interviews.
              </p>
            </div>
            <Link
              href="/login"
              className="hidden rounded-full border border-slate-700 px-3 py-1.5 text-[11px] text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 md:inline-flex"
            >
              Go to app
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Feature
              label="Smart matching"
              body="Get matched based on skills you have and skills you want, not just random lists."
            />
            <Feature
              label="Real-time chat"
              body="Send and receive messages instantly, plan sessions and share resources."
            />
            <Feature
              label="Profile-first"
              body="Each learner has a clean profile – skills, goals, and availability in one place."
            />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-10 border-t border-slate-800/70 pt-7">
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/80 px-5 py-6 text-center shadow-lg md:flex-row md:text-left">
            <div>
              <p className="text-sm font-semibold text-slate-50">
                Ready to turn your skills into a two-way exchange?
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Log in, list your skills, and get your first match in a few
                minutes.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-slate-50 px-5 py-2 text-xs font-semibold text-slate-950 shadow-md transition hover:bg-white"
              >
                Log in to SkillSwap
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} SkillSwap. For student learning only.</p>
          <p className="hidden md:inline">
            Built as a portfolio project • Django × Next.js
          </p>
        </footer>
      </div>
    </div>
  );
}

function Feature({ label, body }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-indigo-500/60 hover:shadow-lg">
      <p className="text-[11px] font-semibold text-slate-100 group-hover:text-indigo-200">
        {label}
      </p>
      <p className="mt-1.5 text-[11px] text-slate-400">{body}</p>
    </div>
  );
}
