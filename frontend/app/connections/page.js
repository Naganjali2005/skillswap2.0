"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchConnections() {
      try {
        const data = await apiGet("/api/connections/");
        setConnections(data);
      } catch (err) {
        setError("Session expired. Please login again.");
        if (typeof window !== "undefined") {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchConnections();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl px-5 py-6 sm:px-7 sm:py-7 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Your connections
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              These are the students you&apos;re connected with. Start a chat or
              jump into a call.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[11px] sm:text-xs text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {/* ERROR / LOADING */}
        {error && (
          <p className="text-[11px] text-red-300 bg-red-950/40 border border-red-800 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Loading connections…
          </p>
        )}

        {/* NO CONNECTIONS */}
        {!loading && !error && connections.length === 0 && (
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            You don&apos;t have any connections yet. Once a learning request is
            accepted, it will appear here.
          </p>
        )}

        {/* CONNECTIONS LIST */}
        {!loading && !error && connections.length > 0 && (
          <div className="space-y-3 mt-2">
            {connections.map((c) => {
              const hasConversation = !!c.conversation_id;

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm"
                >
                  {/* USER INFO */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold">
                      {c.other_user_username
                        ? c.other_user_username[0].toUpperCase()
                        : "U"}
                    </div>

                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-50">
                        {c.other_user_username}
                      </p>
                      {c.other_user_email && (
                        <p className="text-[11px] text-slate-400">
                          {c.other_user_email}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">
                        You are their{" "}
                        <span className="font-medium text-slate-100">
                          {c.role === "teacher" ? "teacher" : "learner"}
                        </span>
                        .
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Status:{" "}
                        <span className="font-mono text-slate-200">
                          {c.status?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {/* View profile */}
                    <Link
                      href={`/users/${c.other_user_id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] sm:text-xs text-slate-100 hover:bg-slate-800"
                    >
                      View profile
                    </Link>

                    {/* Chat */}
                    {hasConversation ? (
                      <Link
                        href={`/chat/${c.conversation_id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white hover:bg-indigo-600"
                      >
                        Chat
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] sm:text-xs text-slate-500 cursor-not-allowed"
                      >
                        Chat unavailable
                      </button>
                    )}

                    {/* Call */}
                    {hasConversation ? (
                      <Link
                        href={`/video/${c.conversation_id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white hover:bg-emerald-600"
                      >
                        Call
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] sm:text-xs text-slate-500 cursor-not-allowed"
                      >
                        Call unavailable
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
