"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "../../lib/api";

export default function ProfilePage() {
  const [form, setForm] = useState({
    github_url: "",
    linkedin_url: "",
    leetcode_url: "",
    portfolio_url: "",
    resume_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchLinks() {
      try {
        const data = await apiGet("/api/profile/links/");
        setForm({
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          leetcode_url: data.leetcode_url || "",
          portfolio_url: data.portfolio_url || "",
          resume_url: data.resume_url || "",
        });
      } catch (err) {
        console.error(err);
        setError(
          err?.detail || "Could not load profile links. Please login again."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const data = await apiPost("/api/profile/links/", form, true);
      setForm({
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        leetcode_url: data.leetcode_url || "",
        portfolio_url: data.portfolio_url || "",
        resume_url: data.resume_url || "",
      });
      setMessage("Profile links updated ✔");
    } catch (err) {
      console.error(err);
      setError(err?.detail || "Failed to save links. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl px-5 py-6 sm:px-7 sm:py-7 space-y-4">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Profile & portfolio links
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              These links are optional, but they help others quickly see your work
              and take you more seriously as a collaborator.
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
          <p className="text-xs sm:text-sm text-slate-400">Loading…</p>
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

        {!loading && (
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <Field
              label="GitHub"
              name="github_url"
              value={form.github_url}
              onChange={handleChange}
              placeholder="https://github.com/your-username"
            />
            <Field
              label="LinkedIn"
              name="linkedin_url"
              value={form.linkedin_url}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/your-profile"
            />
            <Field
              label="LeetCode"
              name="leetcode_url"
              value={form.leetcode_url}
              onChange={handleChange}
              placeholder="https://leetcode.com/your-username"
            />
            <Field
              label="Portfolio / personal site"
              name="portfolio_url"
              value={form.portfolio_url}
              onChange={handleChange}
              placeholder="https://your-portfolio.com"
            />
            <Field
              label="Resume (Google Drive / PDF link)"
              name="resume_url"
              value={form.resume_url}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
            />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-700"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        <p className="text-[10px] sm:text-[11px] text-slate-500">
          Tip: Keep these links public and up to date. When someone opens your
          profile, they can quickly decide if they want to collaborate with you.
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] sm:text-xs text-slate-200">
        {label}
      </label>
      <input
        type="url"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
    </div>
  );
}
