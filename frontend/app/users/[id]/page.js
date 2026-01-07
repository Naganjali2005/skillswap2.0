"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { useRouter, useParams } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams(); // get route params
  const id = params?.id;

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
          (typeof err === "object" ? JSON.stringify(err) : err) ||
          "Could not load profile.";
        setError(msg);
      }
    }

    loadProfile();
  }, [id]);

  // safe render helpers (handles different shapes)
  function renderHaveSkills(skills) {
    if (!skills || skills.length === 0) {
      return <p className="text-xs text-slate-400">No skills listed.</p>;
    }
    return (
      <ul className="text-sm space-y-2">
        {skills.map((s, idx) => {
          // try common property names
          const name = s.skill_name ?? s.name ?? s.skill ?? (typeof s === "string" ? s : `Skill ${idx + 1}`);
          const level = s.level ? ` (${s.level})` : s.level_label ? ` (${s.level_label})` : "";
          return (
            <li key={s.id ?? idx} className="text-slate-200">
              {name}
              <span className="text-slate-400">{level}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderWantSkills(skills) {
    if (!skills || skills.length === 0) {
      return <p className="text-xs text-slate-400">No skills listed.</p>;
    }
    return (
      <ul className="text-sm space-y-2">
        {skills.map((s, idx) => {
          const name = s.skill_name ?? s.name ?? s.skill ?? (typeof s === "string" ? s : `Skill ${idx + 1}`);
          return (
            <li key={s.id ?? idx} className="text-slate-200">
              {name}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">User Profile</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-indigo-300 hover:text-indigo-200"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-rose-950/40 border border-rose-800 p-3">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {!profile && !error && (
          <div className="rounded-md bg-slate-900/50 border border-slate-800 p-4">
            <p className="text-sm text-slate-400">Loading…</p>
          </div>
        )}

        {profile && (
          <>
            {/* top card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center text-xl font-semibold">
                {profile.username ? profile.username[0].toUpperCase() : "U"}
              </div>

              <div className="flex-1">
                <p className="text-lg font-semibold text-slate-50">{profile.username}</p>
                <p className="text-sm text-slate-400 mt-1">{profile.email || "No email set"}</p>
                <p className="text-xs text-slate-500 mt-1">
                  User ID: <span className="font-mono text-slate-300">{profile.id}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* optional: keep this as a UI affordance; action already exists on server */}
                <button
                  onClick={() => {
                    // navigate to requests page with prefilled user (optional UX)
                    router.push(`/requests?to=${profile.id}`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                >
                  Request to learn
                </button>
                <a
                  className="text-xs text-slate-300 underline-offset-2 hover:underline"
                  href={`/connections?user=${profile.id}`}
                >
                  Open connections
                </a>
              </div>
            </div>

            {/* skills + links */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-100 mb-3">Skills they HAVE</p>
                {renderHaveSkills(profile.skills_have)}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-100 mb-3">Skills they WANT</p>
                {renderWantSkills(profile.skills_want)}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-100 mb-3">Profile links</p>
                {profile.profile_links ? (
                  <div className="space-y-2 text-sm">
                    {profile.profile_links.github && (
                      <a
                        href={profile.profile_links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-200 block hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {profile.profile_links.linkedin && (
                      <a
                        href={profile.profile_links.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-200 block hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {profile.profile_links.leetcode && (
                      <a
                        href={profile.profile_links.leetcode}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-200 block hover:underline"
                      >
                        LeetCode
                      </a>
                    )}
                    {profile.profile_links.portfolio && (
                      <a
                        href={profile.profile_links.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-200 block hover:underline"
                      >
                        Portfolio
                      </a>
                    )}
                    {profile.profile_links.resume && (
                      <a
                        href={profile.profile_links.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-200 block hover:underline"
                      >
                        Resume
                      </a>
                    )}
                    {/* fallback: list any other keys */}
                    {Object.entries(profile.profile_links).map(([k, v]) => {
                      if (!v) return null;
                      const known = ["github", "linkedin", "leetcode", "portfolio", "resume"];
                      if (known.includes(k)) return null;
                      return (
                        <a
                          key={k}
                          href={v}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-200 block hover:underline"
                        >
                          {k}
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No profile links.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
