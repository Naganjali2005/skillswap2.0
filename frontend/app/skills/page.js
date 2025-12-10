"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useRouter } from "next/navigation";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState([]);
  const [haveList, setHaveList] = useState([]); // [{skill_id, skill_name, level}]
  const [wantList, setWantList] = useState([]); // [{skill_id, skill_name}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // dropdown selections
  const [newHaveSkill, setNewHaveSkill] = useState("");
  const [newHaveLevel, setNewHaveLevel] = useState("intermediate");
  const [newWantSkill, setNewWantSkill] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const skills = await apiGet("/api/skills/");
        setAllSkills(skills || []);

        const mySkills = await apiGet("/api/my-skills/");
        setHaveList(mySkills?.have || []);
        setWantList(mySkills?.want || []);
      } catch (err) {
        console.error("Error loading skills page:", err);
        setError(
          err?.detail ||
            "Could not load skills. Check if backend /api/skills/ and /api/my-skills/ are working."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function findSkillName(skillId) {
    const s = allSkills.find((sk) => sk.id === skillId);
    return s ? s.name : "Unknown";
  }

  // ---- ADD / REMOVE HANDLERS ----
  function addHave() {
    if (!newHaveSkill) return;
    const skillId = Number(newHaveSkill);
    if (!skillId) return;

    // don't duplicate
    if (haveList.some((h) => h.skill_id === skillId)) {
      setMessage("You already added this skill in 'can teach'.");
      return;
    }

    const skillName = findSkillName(skillId);

    setHaveList((prev) => [
      ...prev,
      {
        skill_id: skillId,
        skill_name: skillName,
        level: newHaveLevel || "intermediate",
      },
    ]);

    setNewHaveSkill("");
    setNewHaveLevel("intermediate");
    setMessage("");
  }

  function addWant() {
    if (!newWantSkill) return;
    const skillId = Number(newWantSkill);
    if (!skillId) return;

    if (wantList.some((w) => w.skill_id === skillId)) {
      setMessage("You already added this skill in 'want to learn'.");
      return;
    }

    const skillName = findSkillName(skillId);

    setWantList((prev) => [
      ...prev,
      {
        skill_id: skillId,
        skill_name: skillName,
      },
    ]);

    setNewWantSkill("");
    setMessage("");
  }

  function removeHave(skillId) {
    setHaveList((prev) => prev.filter((h) => h.skill_id !== skillId));
  }

  function removeWant(skillId) {
    setWantList((prev) => prev.filter((w) => w.skill_id !== skillId));
  }

  function changeHaveLevel(skillId, level) {
    setHaveList((prev) =>
      prev.map((h) =>
        h.skill_id === skillId
          ? { ...h, level }
          : h
      )
    );
  }

  // ---- SAVE TO BACKEND ----
  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const body = {
        have: haveList.map((h) => ({
          skill_id: h.skill_id,
          level: h.level || "intermediate",
        })),
        want: wantList.map((w) => ({
          skill_id: w.skill_id,
        })),
      };

      await apiPost("/api/my-skills/", body, true);
      setMessage("Skills updated successfully ✔");
    } catch (err) {
      console.error("Error saving skills:", err);
      setError(
        err?.detail || "Could not save skills. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // skills left for dropdowns
  const availableForHave = allSkills.filter(
    (s) => !haveList.some((h) => h.skill_id === s.id)
  );
  const availableForWant = allSkills.filter(
    (s) => !wantList.some((w) => w.skill_id === s.id)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl px-5 py-6 sm:px-7 sm:py-7 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Your skills
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Choose the skills you can teach (with level) and the skills you want to learn.
              We&apos;ll use this for matching and show it on your profile.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[11px] sm:text-xs text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {loading && (
          <p className="text-xs sm:text-sm text-slate-400">
            Loading skills…
          </p>
        )}

        {error && (
          <p className="text-[11px] text-red-300 bg-red-950/40 border border-red-800 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {message && !error && (
          <p className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* CAN TEACH */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-50">
                  Skills you can teach
                </p>

                {/* picker row */}
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <select
                    value={newHaveSkill}
                    onChange={(e) => setNewHaveSkill(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="">Select a skill…</option>
                    {availableForHave.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newHaveLevel}
                    onChange={(e) => setNewHaveLevel(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={addHave}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs sm:text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-700"
                    disabled={!newHaveSkill}
                  >
                    Add
                  </button>
                </div>

                {/* current list */}
                {haveList.length === 0 ? (
                  <p className="text-[11px] text-slate-500 mt-2">
                    You haven&apos;t added any skills yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {haveList.map((h) => (
                      <div
                        key={h.skill_id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-50">
                            {h.skill_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400">
                              Level:
                            </span>
                            <select
                              value={h.level || "intermediate"}
                              onChange={(e) =>
                                changeHaveLevel(h.skill_id, e.target.value)
                              }
                              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              {LEVELS.map((lvl) => (
                                <option key={lvl.value} value={lvl.value}>
                                  {lvl.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHave(h.skill_id)}
                          className="text-[11px] text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WANT TO LEARN */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-50">
                  Skills you want to learn
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <select
                    value={newWantSkill}
                    onChange={(e) => setNewWantSkill(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    <option value="">Select a skill…</option>
                    {availableForWant.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={addWant}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs sm:text-sm font-medium hover:bg-emerald-700 disabled:bg-slate-700"
                    disabled={!newWantSkill}
                  >
                    Add
                  </button>
                </div>

                {wantList.length === 0 ? (
                  <p className="text-[11px] text-slate-500 mt-2">
                    You haven&apos;t added any skills to learn yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {wantList.map((w) => (
                      <div
                        key={w.skill_id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-50">
                            {w.skill_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Wants to learn
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWant(w.skill_id)}
                          className="text-[11px] text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
