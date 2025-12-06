"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await apiGet("/api/requests/incoming/");
        setRequests(data);
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
    loadRequests();
  }, [router]);

  async function handleAction(id, action) {
    setMessage("");
    try {
      const res = await apiPost(
        `/api/requests/${id}/action/`,
        { action },
        true
      );
      setMessage(res.detail || "Updated.");

      // refresh list
      const data = await apiGet("/api/requests/incoming/");
      setRequests(data);
    } catch (err) {
      setMessage(err?.detail || "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-xl sm:text-2xl font-semibold">Learning Requests</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs sm:text-sm text-blue-600 underline"
          >
            Back to dashboard
          </button>
        </div>

        {message && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {loading && <p className="text-sm text-slate-500">Loading…</p>}

        {!loading && requests.length === 0 && (
          <p className="text-sm text-slate-500">
            No incoming requests yet. When someone wants to learn from you, it
            will show up here.
          </p>
        )}

        {!loading && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="border rounded-xl p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {r.from_user_username} wants to learn from you
                  </p>
                  <p className="text-xs text-slate-500">
                    Status:{" "}
                    <span className="font-mono">{r.status.toUpperCase()}</span>
                  </p>
                  {r.message && (
                    <p className="text-xs text-slate-600 mt-1">
                      Message: {r.message}
                    </p>
                  )}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(r.id, "accept")}
                      className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(r.id, "reject")}
                      className="text-xs px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
