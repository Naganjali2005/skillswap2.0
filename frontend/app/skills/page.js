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
  const [haveList, setHaveList] = useState([]);
  const [wantList, setWantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newHaveSkill, setNewHaveSkill] = useState("");
  const [newHaveLevel, setNewHaveLevel] = useState("intermediate");
  const [newWantSkill, setNewWantSkill] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadData() {
      try {
        const skills = await apiGet("/api/skills/");
        setAllSkills(skills || []);

        const mySkills = await apiGet("/api/my-skills/");
        setHaveList(mySkills?.have || []);
        setWantList(mySkills?.want || []);
      } catch (err) {
        setError(
          err?.detail || "Could not load skills. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function findSkillName(skillId) {
    const s = allSkills.find((sk) => sk.id === skillId);
    return s ? s.name : "Unknown";
  }

  function addHave() {
    if (!newHaveSkill) return;
    const skillId = Number(newHaveSkill);
    if (haveList.some((h) => h.skill_id === skillId)) {
      setMessage("You already added this skill.");
      return;
    }
    setHaveList((prev) => [
      ...prev,
      {
        skill_id: skillId,
        skill_name: findSkillName(skillId),
        level: newHaveLevel,
      },
    ]);
    setNewHaveSkill("");
  }

  function addWant() {
    if (!newWantSkill) return;
    const skillId = Number(newWantSkill);
    if (wantList.some((w) => w.skill_id === skillId)) {
      setMessage("You already added this skill.");
      return;
    }
    setWantList((prev) => [
      ...prev,
      { skill_id: skillId, skill_name: findSkillName(skillId) },
    ]);
    setNewWantSkill("");
  }

  function removeHave(id) {
    setHaveList((p) => p.filter((h) => h.skill_id !== id));
  }

  function removeWant(id) {
    setWantList((p) => p.filter((w) => w.skill_id !== id));
  }

  function changeHaveLevel(id, level) {
    setHaveList((p) =>
      p.map((h) => (h.skill_id === id ? { ...h, level } : h))
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiPost(
        "/api/my-skills/",
        {
          have: haveList.map((h) => ({
            skill_id: h.skill_id,
            level: h.level,
          })),
          want: wantList.map((w) => ({
            skill_id: w.skill_id,
          })),
        },
        true
      );
      setMessage("Skills updated successfully ✔");
    } catch (err) {
      setError(err?.detail || "Could not save skills.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-6 space-y-4">

        {/* HEADER */}
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Your skills
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Choose skills you can teach and want to learn.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-emerald-600 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {loading && (
          <p className="text-sm text-slate-600">Loading skills…</p>
        )}

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {message && !error && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 gap-4">

              {/* CAN TEACH */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <p className="font-semibold text-slate-800">
                  Skills you can teach
                </p>

                <div className="flex gap-2">
                  <select
                    value={newHaveSkill}
                    onChange={(e) => setNewHaveSkill(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="">Select skill…</option>
                    {allSkills.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <select
                    value={newHaveLevel}
                    onChange={(e) => setNewHaveLevel(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-800"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={addHave}
                    className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>

                {haveList.map((h) => (
                  <div
                    key={h.skill_id}
                    className="flex justify-between items-center border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {h.skill_name}
                      </p>
                      <select
                        value={h.level}
                        onChange={(e) =>
                          changeHaveLevel(h.skill_id, e.target.value)
                        }
                        className="mt-1 border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        {LEVELS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeHave(h.skill_id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* WANT */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <p className="font-semibold text-slate-800">
                  Skills you want to learn
                </p>

                <div className="flex gap-2">
                  <select
                    value={newWantSkill}
                    onChange={(e) => setNewWantSkill(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="">Select skill…</option>
                    {allSkills.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={addWant}
                    className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>

                {wantList.map((w) => (
                  <div
                    key={w.skill_id}
                    className="flex justify-between items-center border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <p className="text-slate-800">{w.skill_name}</p>
                    <button
                      onClick={() => removeWant(w.skill_id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700"
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
