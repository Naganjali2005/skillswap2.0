"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../lib/api"; // adjust path if needed

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(
          `/api/users/search/?q=${encodeURIComponent(query)}`
        );

        // handle DRF paginated or non-paginated
        setResults(data.results || data);
      } catch (err) {
        console.error(err);
        setError("Could not search users.");
      } finally {
        setLoading(false);
      }
    }, 400); // debounce: waits 400ms after typing stops

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Search users</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username or name..."
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {loading && (
        <p className="mt-3 text-sm text-slate-400">Searching…</p>
      )}

      <ul className="mt-4 space-y-3">
        {results.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3"
          >
            <div>
              <p className="font-medium">@{user.username}</p>
              {(user.first_name || user.last_name) && (
                <p className="text-sm text-slate-400">
                  {`${user.first_name || ""} ${user.last_name || ""}`}
                </p>
              )}
            </div>

            <Link
              href={`/users/${user.id}`}
              className="text-xs font-medium text-indigo-400 hover:underline"
            >
              View profile
            </Link>
          </li>
        ))}

        {!loading && query && results.length === 0 && !error && (
          <p className="mt-4 text-sm text-slate-400">
            No users found for "{query}".
          </p>
        )}
      </ul>
    </div>
  );
}
