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
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Your Connections
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              These are people you&apos;re already connected with on SkillSwap.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Back to dashboard
          </Link>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading…</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && connections.length === 0 && (
          <p className="text-sm text-slate-500">
            You don&apos;t have any connections yet. Once a request is accepted,
            you&apos;ll see it here.
          </p>
        )}

        {!loading && !error && connections.length > 0 && (
          <div className="space-y-4">
            {connections.map((c) => (
              <div
                key={c.id}
                className="border rounded-xl p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                    {c.other_user_username
                      ? c.other_user_username[0].toUpperCase()
                      : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {c.other_user_username}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.other_user_email || "No email set"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      You are their{" "}
                      <span className="font-medium">
                        {c.role === "teacher" ? "teacher" : "learner"}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/users/${c.other_user_id}`}
                    className="text-xs sm:text-sm px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    View profile
                  </Link>

                  <Link
                    href={{
                      pathname: `/chat/${c.id}`,
                      query: { name: c.other_user_username || "" },
                    }}
                    className="text-xs sm:text-sm px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Chat
                  </Link>

                  <button
                    disabled
                    className="text-xs sm:text-sm px-3 py-1 rounded-lg bg-slate-300 text-slate-600 cursor-not-allowed"
                    title="Video call & screenshare coming soon"
                  >
                    Video call (coming soon)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
