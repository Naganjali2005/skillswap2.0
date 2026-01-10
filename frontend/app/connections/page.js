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
    const token = localStorage.getItem("access");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchConnections() {
      try {
        const data = await apiGet("/api/connections/");
        setConnections(data);
      } catch (err) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchConnections();
  }, [router]);

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 px-6 py-6 space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Your connections
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Students you’re connected with. Start a chat to collaborate.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-emerald-600 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-xs text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* LOADING */}
        {loading && (
          <p className="text-sm text-slate-500">
            Loading connections…
          </p>
        )}

        {/* EMPTY */}
        {!loading && !error && connections.length === 0 && (
          <p className="text-sm text-slate-500">
            You don’t have any connections yet.
          </p>
        )}

        {/* LIST */}
        {!loading && !error && connections.length > 0 && (
          <div className="space-y-3">
            {connections.map((c) => {
              const hasConversation = !!c.conversation_id;

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  {/* USER INFO */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                      {c.other_user_username
                        ? c.other_user_username[0].toUpperCase()
                        : "U"}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {c.other_user_username}
                      </p>
                      {c.other_user_email && (
                        <p className="text-xs text-slate-500">
                          {c.other_user_email}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-0.5">
                        You are their{" "}
                        <span className="font-medium">
                          {c.role === "teacher" ? "teacher" : "learner"}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Status: {c.status?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <Link
                      href={`/users/${c.other_user_id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      View profile
                    </Link>

                    {hasConversation ? (
                      <Link
                        href={`/chat/${c.conversation_id}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Chat
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-slate-200 text-xs text-slate-500 cursor-not-allowed"
                      >
                        Chat unavailable
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
