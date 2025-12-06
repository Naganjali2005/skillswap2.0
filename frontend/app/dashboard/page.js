"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [me, recs, incoming, outgoing] = await Promise.all([
          apiGet("/api/auth/me/"),
          apiGet("/api/recommendations/"),
          apiGet("/api/requests/incoming/"),
          apiGet("/api/requests/outgoing/"),
        ]);
        setUser(me);
        setMatches(recs);
        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
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
    fetchData();
  }, [router]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    router.push("/login");
  }

  async function handleRequest(toUserId) {
    setRequestMsg("");
    try {
      await apiPost(
        "/api/requests/",
        { to_user_id: toUserId, message: "" },
        true
      );
      setRequestMsg("Request sent successfully ✔");

      // refresh outgoing requests so learner sees status
      const outgoing = await apiGet("/api/requests/outgoing/");
      setOutgoingRequests(outgoing);
    } catch (err) {
      setRequestMsg(
        err?.detail || "Could not send request. Maybe already pending?"
      );
    }
  }

  function renderSkills(skills) {
    if (!skills || skills.length === 0) return "–";
    if (typeof skills[0] === "string") return skills.join(", ");
    if (typeof skills[0] === "object" && skills[0] !== null) {
      return skills
        .map((s) => s.name || s.skill || s.title || "Skill")
        .join(", ");
    }
    return "–";
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {user ? `Welcome back, ${user.username} 👋` : "Welcome back 👋"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here are your latest SkillSwap matches and learning requests.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm text-red-600 hover:text-red-700 underline"
          >
            Logout
          </button>
        </div>

        {requestMsg && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            {requestMsg}
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column: profile + incoming + outgoing summary */}
          <div className="md:col-span-1 space-y-4">
            {/* Profile card */}
            <div className="border rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-semibold">
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.email || "No email set"}
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-600">
                <p className="font-semibold mb-1">Profile</p>
                <p>
                  • ID:{" "}
                  <span className="font-mono">
                    {user?.id ?? "—"}
                  </span>
                </p>
                <p>• More profile details coming soon…</p>
              </div>
            </div>

            {/* Incoming Requests summary */}
            <div className="border rounded-xl p-4 bg-slate-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Incoming requests</p>
                <Link
                  href="/requests"
                  className="text-[11px] text-blue-600 underline"
                >
                  View all
                </Link>
              </div>

              {incomingRequests.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No one has requested to learn from you yet.
                </p>
              ) : (
                <div className="space-y-1 text-xs">
                  {incomingRequests.slice(0, 3).map((r) => (
                    <div key={r.id}>
                      <span className="font-medium">
                        {r.from_user_username}
                      </span>
                      <span className="ml-1 text-slate-500">
                        ({r.status})
                      </span>
                    </div>
                  ))}
                  {incomingRequests.length > 3 && (
                    <p className="text-[11px] text-slate-500">
                      +{incomingRequests.length - 3} more…
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Outgoing Requests summary */}
            <div className="border rounded-xl p-4 bg-slate-50 flex flex-col gap-2">
              <p className="text-sm font-semibold">Your learning requests</p>
              {outgoingRequests.length === 0 ? (
                <p className="text-xs text-slate-500">
                  You haven&apos;t requested to learn from anyone yet.
                </p>
              ) : (
                <div className="space-y-1 text-xs">
                  {outgoingRequests.slice(0, 4).map((r) => (
                    <div key={r.id}>
                      <span className="font-medium">
                        {r.to_user_username}
                      </span>
                      <span className="ml-1 text-slate-500">
                        ({r.status})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Matches list */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Your Matches</h2>

            {loading && <p className="text-sm text-slate-500">Loading…</p>}

            {error && (
              <p className="text-sm text-red-600 mb-2">
                {error}
              </p>
            )}

            {!loading && !error && matches.length === 0 && (
              <p className="text-sm text-slate-500">
                No matches yet. Once you or others update skills, you&apos;ll
                see recommendations here.
              </p>
            )}

            {!loading && !error && matches.length > 0 && (
              <div className="space-y-4">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="border rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Match score:{" "}
                          <span className="font-mono">
                            {typeof m.score === "number"
                              ? m.score.toFixed(3)
                              : m.score}
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/users/${m.id}`}
                          className="text-xs sm:text-sm px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          View profile
                        </Link>
                        <button
                          onClick={() => handleRequest(m.id)}
                          className="text-xs sm:text-sm px-3 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Request to learn
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-700">
                      <p>
                        <span className="font-semibold">Has:</span>{" "}
                        {renderSkills(m.skills_have)}
                      </p>
                      <p>
                        <span className="font-semibold">Wants:</span>{" "}
                        {renderSkills(m.skills_want)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
