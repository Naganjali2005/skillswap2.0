"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { useRouter, useParams } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();              // ✅ get params with hook
  const id = params?.id;                   // "1", "2", etc.

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    async function loadProfile() {
      try {
        const data = await apiGet(`/api/users/${id}/`);
        setProfile(data);
        setError("");
      } catch (err) {
        const msg =
          err?.detail ||
          err?.error ||
          JSON.stringify(err) ||
          "Could not load profile.";
        setError(msg);
      }
    }

    loadProfile();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-xl sm:text-2xl font-semibold">
            User Profile
          </h1>
          <button
            onClick={() => router.back()}
            className="text-xs sm:text-sm text-blue-600 underline"
          >
            Back
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {!profile && !error && (
          <p className="text-sm text-slate-500">Loading…</p>
        )}

        {profile && (
          <div className="space-y-4">
            <div className="border rounded-xl p-4 bg-slate-50 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-semibold">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{profile.username}</p>
                <p className="text-xs text-slate-500">
                  {profile.email || "No email set"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  User ID: {profile.id}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 bg-slate-50">
                <p className="text-sm font-semibold mb-2">
                  Skills they HAVE
                </p>
                {profile.skills_have.length === 0 ? (
                  <p className="text-xs text-slate-500">No skills listed.</p>
                ) : (
                  <ul className="text-xs space-y-1">
                    {profile.skills_have.map((s) => (
                      <li key={s.id}>
                        {s.skill_name}{" "}
                        <span className="text-slate-500">
                          ({s.level})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border rounded-xl p-4 bg-slate-50">
                <p className="text-sm font-semibold mb-2">
                  Skills they WANT
                </p>
                {profile.skills_want.length === 0 ? (
                  <p className="text-xs text-slate-500">No skills listed.</p>
                ) : (
                  <ul className="text-xs space-y-1">
                    {profile.skills_want.map((s) => (
                      <li key={s.id}>{s.skill_name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
