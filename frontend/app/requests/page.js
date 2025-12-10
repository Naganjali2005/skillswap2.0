"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("incoming"); // "incoming" | "outgoing"
  const router = useRouter();

  async function loadRequests() {
    try {
      const [incomingData, outgoingData] = await Promise.all([
        apiGet("/api/requests/incoming/"),
        apiGet("/api/requests/outgoing/"),
      ]);
      setIncoming(incomingData);
      setOutgoing(outgoingData);
    } catch (err) {
      setMessage("Error loading requests. Please login again.");
      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleIncomingAction(id, action) {
    setMessage("");
    try {
      const res = await apiPost(
        `/api/requests/${id}/action/`,
        { action },
        true
      );
      setMessage(res.detail || "Updated.");
      await loadRequests();
    } catch (err) {
      setMessage(err?.detail || "Something went wrong.");
    }
  }

  async function handleCancelOutgoing(id) {
    setMessage("");
    try {
      const res = await apiPost(
        `/api/requests/${id}/action/`,
        { action: "cancel" }, // adjust if your backend uses a different keyword
        true
      );
      setMessage(res.detail || "Request cancelled.");
      await loadRequests();
    } catch (err) {
      setMessage(err?.detail || "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl px-5 py-6 sm:px-7 sm:py-7 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Learning requests
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Manage who wants to learn from you, and the requests you have sent.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[11px] sm:text-xs text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-2 text-xs border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("incoming")}
            className={
              "px-3 py-1 rounded-full " +
              (activeTab === "incoming"
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-900 text-slate-200 border border-slate-700")
            }
          >
            Incoming ({incoming.length})
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={
              "px-3 py-1 rounded-full " +
              (activeTab === "outgoing"
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-900 text-slate-200 border border-slate-700")
            }
          >
            Outgoing ({outgoing.length})
          </button>
        </div>

        {/* Content */}
        {loading && (
          <p className="text-xs sm:text-sm text-slate-400 mt-3">Loading…</p>
        )}

        {!loading && activeTab === "incoming" && (
          <IncomingList
            requests={incoming}
            onAction={handleIncomingAction}
          />
        )}

        {!loading && activeTab === "outgoing" && (
          <OutgoingList
            requests={outgoing}
            onCancel={handleCancelOutgoing}
          />
        )}
      </div>
    </div>
  );
}

/* Incoming requests section – accept / reject */
function IncomingList({ requests, onAction }) {
  if (requests.length === 0) {
    return (
      <p className="text-xs sm:text-sm text-slate-400 mt-3">
        No incoming requests yet. When someone wants to learn from you, it will
        show up here.
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-3">
      {requests.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm"
        >
          <div>
            <p className="font-semibold text-slate-50">
              {r.from_user_username} wants to learn from you
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Status:{" "}
              <span className="font-mono text-slate-100">
                {r.status.toUpperCase()}
              </span>
            </p>
            {r.message && (
              <p className="text-[11px] text-slate-300 mt-1">
                Message: {r.message}
              </p>
            )}
          </div>

          {r.status === "pending" && (
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => onAction(r.id, "accept")}
                className="text-[11px] sm:text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Accept
              </button>
              <button
                onClick={() => onAction(r.id, "reject")}
                className="text-[11px] sm:text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* Outgoing requests section – cancel */
function OutgoingList({ requests, onCancel }) {
  if (requests.length === 0) {
    return (
      <p className="text-xs sm:text-sm text-slate-400 mt-3">
        You haven&apos;t requested to learn from anyone yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-3">
      {requests.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm"
        >
          <div>
            <p className="font-semibold text-slate-50">
              You requested to learn from {r.to_user_username}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Status:{" "}
              <span className="font-mono text-slate-100">
                {r.status.toUpperCase()}
              </span>
            </p>
            {r.message && (
              <p className="text-[11px] text-slate-300 mt-1">
                Message: {r.message}
              </p>
            )}
          </div>

          {r.status === "pending" && (
            <button
              onClick={() => onCancel(r.id)}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              Cancel request
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
