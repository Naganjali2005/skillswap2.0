"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [selectedSection, setSelectedSection] = useState("overview"); // sidebar section
  const router = useRouter();

  // 🔍 search state (NEW)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  // helper: find status of outgoing request to a specific user
  function getRequestStatusForUser(userId) {
    const req = outgoingRequests.find((r) => r.to_user === userId);
    return req ? req.status : null; // "pending" | "accepted" | "rejected" | null
  }

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

  // Simple connections derived from accepted requests
  const connections = useMemo(() => {
    const map = new Map();

    incomingRequests
      .filter((r) => r.status === "accepted")
      .forEach((r) => {
        map.set(`in-${r.from_user}`, {
          id: r.from_user,
          username: r.from_user_username,
        });
      });

    outgoingRequests
      .filter((r) => r.status === "accepted")
      .forEach((r) => {
        map.set(`out-${r.to_user}`, {
          id: r.to_user,
          username: r.to_user_username,
        });
      });

    return Array.from(map.values());
  }, [incomingRequests, outgoingRequests]);

  // Counts for overview
  const stats = {
    matches: matches.length,
    incoming: incomingRequests.length,
    outgoing: outgoingRequests.length,
    connections: connections.length,
  };

  // 🔍 search handler (NEW)
  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      // assuming your backend route is /api/users/search/
      const data = await apiGet(
        `/api/users/search/?q=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(data.results || data); // handle paginated or plain
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* SIDEBAR (desktop) */}
      <aside className="hidden sm:flex sm:flex-col w-56 border-r border-slate-900 bg-slate-950/90 p-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
            <span className="text-sm font-semibold">SS</span>
          </div>
          <span className="text-sm font-medium text-slate-100">
            SkillSwap
          </span>
        </Link>

        {/* User mini card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-xs">
          <p className="font-semibold text-slate-100">
            {user?.username || "User"}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {user?.email || "No email"}
          </p>
        </div>

        {/* Nav buttons */}
        <nav className="flex-1 text-sm space-y-1 mt-1">
          {[
            { key: "overview", label: "Overview" },
            { key: "matches", label: "Matches" },
            { key: "connections", label: "Connections" },
            { key: "requests", label: "Requests" },
            { key: "profile", label: "Profile" },
          ].map((item) => {
            const isActive = selectedSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedSection(item.key)}
                className={
                  "w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition " +
                  (isActive
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-300 hover:bg-slate-900/70")
                }
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="text-xs text-red-400 hover:text-red-300 text-left"
        >
          Logout
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-slate-900 bg-slate-950/90">
          <span className="text-sm font-medium">
            {user ? `Hi, ${user.username}` : "Dashboard"}
          </span>
          <button
            onClick={handleLogout}
            className="text-[11px] text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 py-5 sm:px-8 sm:py-6">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                {user ? `Welcome back, ${user.username} 👋` : "Welcome back 👋"}
              </h1>
              <p className="text-[12px] text-slate-400 mt-1">
                {selectedSection === "overview" &&
                  "Quick summary of your matches, requests and connections."}
                {selectedSection === "matches" &&
                  "All students we think are a good match for your skills."}
                {selectedSection === "requests" &&
                  "Manage requests you’ve received and sent."}
                {selectedSection === "connections" &&
                  "People who are already connected with you. Use the full connections page for chat and calls."}
                {selectedSection === "profile" &&
                  "Your basic account details."}
              </p>
            </div>

            {/* 🔍 Search bar – only in overview */}
            {selectedSection === "overview" && (
              <div>
                <input
                  type="text"
                  placeholder="Search for users…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full max-w-sm px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder-slate-500"
                />
              </div>
            )}
          </div>

          {requestMsg && (
            <p className="mb-4 text-[12px] text-emerald-300 bg-emerald-950/50 border border-emerald-800 px-3 py-2 rounded-lg">
              {requestMsg}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400 mb-3">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <>
              {/* 🔍 Search results – shown above overview cards */}
              {selectedSection === "overview" && searchResults.length > 0 && (
                <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs">
                  <p className="text-sm font-semibold mb-2 text-slate-50">
                    Search results
                  </p>
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border-b border-slate-800 py-2"
                    >
                      <span className="text-slate-200 text-sm">
                        @{u.username}
                      </span>
                      <Link
                        href={`/users/${u.id}`}
                        className="text-[11px] px-3 py-1 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                      >
                        View profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {selectedSection === "overview" && (
                <OverviewSection
                  stats={stats}
                  matches={matches}
                  incomingRequests={incomingRequests}
                  outgoingRequests={outgoingRequests}
                  renderSkills={renderSkills}
                  getRequestStatusForUser={getRequestStatusForUser}
                  handleRequest={handleRequest}
                />
              )}

              {selectedSection === "matches" && (
                <MatchesSection
                  matches={matches}
                  renderSkills={renderSkills}
                  getRequestStatusForUser={getRequestStatusForUser}
                  handleRequest={handleRequest}
                />
              )}

              {selectedSection === "requests" && (
                <RequestsSection
                  incomingRequests={incomingRequests}
                  outgoingRequests={outgoingRequests}
                />
              )}

              {selectedSection === "connections" && (
                <ConnectionsSection connections={connections} />
              )}

              {selectedSection === "profile" && <ProfileSection user={user} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* =========== SUB COMPONENTS =========== */

function OverviewSection({
  stats,
  matches,
  incomingRequests,
  outgoingRequests,
  renderSkills,
  getRequestStatusForUser,
  handleRequest,
}) {
  const topMatches = matches.slice(0, 3);
  const recentIncoming = incomingRequests.slice(0, 3);
  const recentOutgoing = outgoingRequests.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <StatCard label="Matches" value={stats.matches} />
        <StatCard label="Incoming requests" value={stats.incoming} />
        <StatCard label="Outgoing requests" value={stats.outgoing} />
        <StatCard label="Connections" value={stats.connections} />
      </div>

      {/* Top matches + Requests */}
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold mb-2 text-slate-50">
            Top matches
          </p>
          {topMatches.length === 0 ? (
            <p className="text-[12px] text-slate-400">
              No matches yet. Once you or others update skills, you&apos;ll see
              recommendations here.
            </p>
          ) : (
            <div className="space-y-3">
              {topMatches.map((m) => {
                const status = getRequestStatusForUser(m.id);
                const disabled =
                  status === "pending" || status === "accepted";
                const label =
                  status === "pending"
                    ? "Requested"
                    : status === "accepted"
                    ? "Connected"
                    : "Request to learn";

                return (
                  <div
                    key={m.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-50">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Match score:{" "}
                          <span className="font-mono">
                            {typeof m.score === "number"
                              ? m.score.toFixed(3)
                              : m.score}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => !disabled && handleRequest(m.id)}
                        disabled={disabled}
                        className={
                          "text-[11px] px-3 py-1 rounded-lg " +
                          (disabled
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-indigo-500 text-white hover:bg-indigo-600")
                        }
                      >
                        {label}
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-300 space-y-1">
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
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold mb-2 text-slate-50">
              Recent incoming requests
            </p>
            {recentIncoming.length === 0 ? (
              <p className="text-[12px] text-slate-400">
                No incoming requests yet.
              </p>
            ) : (
              <div className="space-y-1 text-[12px]">
                {recentIncoming.map((r) => (
                  <p key={r.id}>
                    <span className="font-medium">
                      {r.from_user_username}
                    </span>{" "}
                    <span className="text-slate-400">({r.status})</span>
                  </p>
                ))}
              </div>
            )}

            <div className="mt-3 text-[11px]">
              <Link
                href="/requests"
                className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
              >
                Go to requests page
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold mb-2 text-slate-50">
              Recent outgoing requests
            </p>
            {recentOutgoing.length === 0 ? (
              <p className="text-[12px] text-slate-400">
                You haven&apos;t requested anyone yet.
              </p>
            ) : (
              <div className="space-y-1 text-[12px]">
                {recentOutgoing.map((r) => (
                  <p key={r.id}>
                    <span className="font-medium">
                      {r.to_user_username}
                    </span>{" "}
                    <span className="text-slate-400">({r.status})</span>
                  </p>
                ))}
              </div>
            )}

            <div className="mt-3 text-[11px]">
              <Link
                href="/requests"
                className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
              >
                Manage all requests
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 mt-1">
        <Link
          href="/connections"
          className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
        >
          Go to connections (chat & calls)
        </Link>
      </div>
    </div>
  );
}

function MatchesSection({
  matches,
  renderSkills,
  getRequestStatusForUser,
  handleRequest,
}) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No matches yet. Once profiles & skills are updated, matches will appear
        here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => {
        const status = getRequestStatusForUser(m.id);
        const disabled = status === "pending" || status === "accepted";
        const label =
          status === "pending"
            ? "Requested"
            : status === "accepted"
            ? "Connected"
            : "Request to learn";

        return (
          <div
            key={m.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-50">{m.name}</p>
                <p className="text-[11px] text-slate-400">
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
                  className="text-[11px] px-3 py-1 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  View profile
                </Link>
                <button
                  onClick={() => !disabled && handleRequest(m.id)}
                  disabled={disabled}
                  className={
                    "text-[11px] px-3 py-1 rounded-lg " +
                    (disabled
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-500 text-white hover:bg-indigo-600")
                  }
                >
                  {label}
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-slate-300">
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
        );
      })}
    </div>
  );
}

function RequestsSection({ incomingRequests, outgoingRequests }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 text-xs">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-sm font-semibold mb-2 text-slate-50">
          Incoming requests
        </p>
        {incomingRequests.length === 0 ? (
          <p className="text-[12px] text-slate-400">
            No one has requested to learn from you yet.
          </p>
        ) : (
          <div className="space-y-1 text-[12px]">
            {incomingRequests.map((r) => (
              <p key={r.id}>
                <span className="font-medium">
                  {r.from_user_username}
                </span>{" "}
                <span className="text-slate-400">({r.status})</span>
              </p>
            ))}
          </div>
        )}

        <div className="mt-3 text-[11px]">
          <Link
            href="/requests"
            className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Open full requests page
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-sm font-semibold mb-2 text-slate-50">
          Outgoing requests
        </p>
        {outgoingRequests.length === 0 ? (
          <p className="text-[12px] text-slate-400">
            You haven&apos;t requested to learn from anyone yet.
          </p>
        ) : (
          <div className="space-y-1 text-[12px] text-slate-300">
            {outgoingRequests.map((r) => (
              <p key={r.id}>
                <span className="font-medium">
                  {r.to_user_username}
                </span>{" "}
                <span className="text-slate-400">({r.status})</span>
              </p>
            ))}
          </div>
        )}

        <div className="mt-3 text-[11px]">
          <Link
            href="/requests"
            className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Manage all requests
          </Link>
        </div>
      </div>
    </div>
  );
}

function ConnectionsSection({ connections }) {
  if (connections.length === 0) {
    return (
      <div className="space-y-3 text-sm text-slate-400">
        <p>
          No connections yet. Once a request is accepted, it will appear here.
        </p>
        <Link
          href="/connections"
          className="text-[11px] text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
        >
          Open connections page (chat & calls)
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      {connections.map((c) => (
        <div
          key={c.id}
          className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-slate-50">
              {c.username}
            </p>
            <p className="text-[11px] text-slate-400">
              Connected via accepted request
            </p>
          </div>
          <Link
            href="/connections"
            className="text-[11px] rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            Open chat & calls
          </Link>
        </div>
      ))}

      <div className="mt-2 text-[11px]">
        <Link
          href="/connections"
          className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
        >
          Go to full connections page
        </Link>
      </div>
    </div>
  );
}

function ProfileSection({ user }) {
  return (
    <div className="max-w-md text-sm space-y-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
        <p className="text-sm font-semibold mb-1 text-slate-50">
          Basic details
        </p>
        <p className="text-[13px]">
          <span className="text-slate-400">Username: </span>
          <span className="font-medium text-slate-100">
            {user?.username || "—"}
          </span>
        </p>
        <p className="text-[13px]">
          <span className="text-slate-400">Email: </span>
          <span className="font-medium text-slate-100">
            {user?.email || "—"}
          </span>
        </p>
        <p className="text-[13px]">
          <span className="text-slate-400">User ID: </span>
          <span className="font-mono text-slate-100">
            {user?.id ?? "—"}
          </span>
        </p>

        {/* buttons row */}
        <div className="pt-3 flex flex-wrap gap-2">
          <Link
            href="/skills"
            className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            Manage skills
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] text-indigo-200 hover:bg-slate-800"
          >
            Edit portfolio links
          </Link>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Keep your skills and links updated. Skills are used for matching, and
        portfolio links (GitHub, LinkedIn, LeetCode, resume) are optional but
        make your profile look much more professional.
      </p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 flex flex-col gap-1">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-lg font-semibold text-slate-50">
        {value}
      </span>
    </div>
  );
}
