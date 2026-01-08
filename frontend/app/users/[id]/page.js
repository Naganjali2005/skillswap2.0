"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useRouter, useParams } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();
  const id = Number(params?.id);

  const [profile, setProfile] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // pending | accepted | null
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        // load profile
        const user = await apiGet(`/api/users/${id}/`);
        setProfile(user);

        // load outgoing requests
        const outgoing = await apiGet("/api/requests/outgoing/");
        const req = outgoing.find((r) => r.to_user === id);
        setRequestStatus(req?.status || null);
      } catch (err) {
        setError(
          err?.detail ||
            err?.error ||
            "Could not load user profile."
        );
      }
    }

    loadData();
  }, [id]);

  async function handleRequest() {
    try {
      await apiPost(
        "/api/requests/",
        { to_user_id: id, message: "" },
        true
      );
      setRequestStatus("pending");
    } catch (err) {
      console.error(err);
    }
  }

  // ----------------- SKILL RENDER HELPERS -----------------
  function renderHaveSkills(skills) {
    if (!skills || skills.length === 0) {
      return <p className="text-xs text-slate-500">No skills listed.</p>;
    }
    return (
      <ul className="text-sm space-y-1">
        {skills.map((s, idx) => (
          <li key={idx} className="text-slate-700">
            {s.skill_name || s.name}
            {s.level && (
              <span className="text-slate-500"> ({s.level})</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  function renderWantSkills(skills) {
    if (!skills || skills.length === 0) {
      return <p className="text-xs text-slate-500">No skills listed.</p>;
    }
    return (
      <ul className="text-sm space-y-1">
        {skills.map((s, idx) => (
          <li key={idx} className="text-slate-700">
            {s.skill_name || s.name}
          </li>
        ))}
      </ul>
    );
  }

  // ----------------- UI -----------------
  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-slate-800">
            User Profile
          </h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-emerald-600 hover:underline"
          >
            Back
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!profile && !error && (
          <p className="text-sm text-slate-500">Loading…</p>
        )}

        {profile && (
          <>
            {/* TOP CARD */}
            <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-semibold text-emerald-700">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {profile.username}
                  </p>
                  <p className="text-sm text-slate-500">
                    {profile.email || "No email"}
                  </p>
                  <p className="text-xs text-slate-400">
                    User ID: {profile.id}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div>
                {requestStatus === "accepted" ? (
                  <button
                    onClick={() => router.push("/connections")}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                  >
                    Connected
                  </button>
                ) : requestStatus === "pending" ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-600 text-sm cursor-not-allowed"
                  >
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={handleRequest}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                  >
                    Request to learn
                  </button>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-semibold text-sm text-slate-800 mb-2">
                  Skills they HAVE
                </p>
                {renderHaveSkills(profile.skills_have)}
              </div>

              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-semibold text-sm text-slate-800 mb-2">
                  Skills they WANT
                </p>
                {renderWantSkills(profile.skills_want)}
              </div>

              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-semibold text-sm text-slate-800 mb-2">
                  Profile links
                </p>
                {profile.profile_links ? (
                  <div className="space-y-1 text-sm">
                    {Object.entries(profile.profile_links).map(
                      ([k, v]) =>
                        v && (
                          <a
                            key={k}
                            href={v}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-emerald-600 hover:underline"
                          >
                            {k}
                          </a>
                        )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No profile links.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
