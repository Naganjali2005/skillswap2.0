"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("incoming");
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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

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
        { action: "cancel" },
        true
      );
      setMessage(res.detail || "Request cancelled.");
      await loadRequests();
    } catch (err) {
      setMessage(err?.detail || "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Learning requests
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Manage incoming and outgoing learning requests.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-emerald-600 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {message && (
          <p className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-2 text-xs">
          {["incoming", "outgoing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                "px-4 py-1.5 rounded-full border transition " +
                (activeTab === tab
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50")
              }
            >
              {tab === "incoming"
                ? `Incoming (${incoming.length})`
                : `Outgoing (${outgoing.length})`}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading…</p>
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

/* Incoming */
function IncomingList({ requests, onAction }) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No incoming requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-slate-800">
              {r.from_user_username}
            </p>
            <p className="text-xs text-slate-600">
              Status: {r.status}
            </p>
          </div>

          {r.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => onAction(r.id, "accept")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs"
              >
                Accept
              </button>
              <button
                onClick={() => onAction(r.id, "reject")}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs"
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

/* Outgoing */
function OutgoingList({ requests, onCancel }) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No outgoing requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-slate-800">
              {r.to_user_username}
            </p>
            <p className="text-xs text-slate-600">
              Status: {r.status}
            </p>
          </div>

          {r.status === "pending" && (
            <button
              onClick={() => onCancel(r.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs hover:bg-slate-300"
            >
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
