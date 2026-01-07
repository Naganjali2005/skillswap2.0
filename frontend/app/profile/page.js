"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiPatch } from "../../lib/api";

export default function ProfilePage() {
  // account form (username / email)
  const [account, setAccount] = useState({
    username: "",
    email: "",
  });

  // keep original account for reset
  const [initialAccount, setInitialAccount] = useState(null);

  // profile links form
  const [form, setForm] = useState({
    github_url: "",
    linkedin_url: "",
    leetcode_url: "",
    portfolio_url: "",
    resume_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingLinks, setSavingLinks] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  const [linksMessage, setLinksMessage] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [linksError, setLinksError] = useState("");
  const [accountError, setAccountError] = useState("");

  const router = useRouter();

  // -------------------------------
  // LOAD DATA
  // -------------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        // load auth user (username / email)
        const me = await apiGet("/api/auth/me/");
        setAccount({
          username: me.username || "",
          email: me.email || "",
        });
        setInitialAccount({
          username: me.username || "",
          email: me.email || "",
        });

        // load profile links
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
        setLinksError("Could not load profile. Please login again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // -------------------------------
  // HANDLERS
  // -------------------------------
  function handleAccountChange(e) {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
    setAccountMessage("");
    setAccountError("");
  }

  function handleLinkChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLinksMessage("");
    setLinksError("");
  }

  function validateUrls(values) {
    const invalid = [];
    Object.entries(values).forEach(([k, v]) => {
      if (v && !/^https?:\/\//i.test(v.trim())) {
        invalid.push(k);
      }
    });
    return invalid;
  }

  // -------------------------------
  // SAVE ACCOUNT (PATCH)
  // -------------------------------
  async function handleSaveAccount(e) {
    e.preventDefault();
    setAccountMessage("");
    setAccountError("");

    if (!account.username.trim()) {
      setAccountError("Username cannot be empty.");
      return;
    }
    if (!account.email.trim()) {
      setAccountError("Email cannot be empty.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(account.email.trim())) {
      setAccountError("Please enter a valid email address.");
      return;
    }

    setSavingAccount(true);
    try {
      await apiPatch(
        "/api/auth/update/",
        {
          username: account.username.trim(),
          email: account.email.trim(),
        },
        true
      );

      setAccountMessage("Account details updated ✔");
      setInitialAccount(account);
    } catch (err) {
      console.error(err);
      setAccountError(
        err?.detail || "Failed to update account. Email or username may be taken."
      );
    } finally {
      setSavingAccount(false);
    }
  }

  // -------------------------------
  // SAVE LINKS (POST)
  // -------------------------------
  async function handleSaveLinks(e) {
    e.preventDefault();
    setLinksMessage("");
    setLinksError("");

    const invalidKeys = validateUrls(form);
    if (invalidKeys.length > 0) {
      setLinksError(
        `Please enter full URLs (starting with https://) for: ${invalidKeys.join(
          ", "
        )}`
      );
      return;
    }

    setSavingLinks(true);
    try {
      const data = await apiPost("/api/profile/links/", form, true);
      setForm({
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        leetcode_url: data.leetcode_url || "",
        portfolio_url: data.portfolio_url || "",
        resume_url: data.resume_url || "",
      });
      setLinksMessage("Profile links updated ✔");
    } catch (err) {
      console.error(err);
      setLinksError("Failed to save links. Please try again.");
    } finally {
      setSavingLinks(false);
    }
  }

  // -------------------------------
  // UI
  // -------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-semibold">Profile & portfolio links</h1>
            <p className="text-xs text-slate-400">
              Edit your account details and optional portfolio links.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-indigo-300 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="border border-slate-800 rounded-lg p-4 space-y-3">
          <p className="font-semibold text-sm">Basic details</p>

          {accountError && (
            <p className="text-xs text-red-300">{accountError}</p>
          )}
          {accountMessage && (
            <p className="text-xs text-emerald-300">{accountMessage}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="username"
              value={account.username}
              onChange={handleAccountChange}
              placeholder="Username"
              className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-sm"
            />
            <input
              name="email"
              type="email"
              value={account.email}
              onChange={handleAccountChange}
              placeholder="Email"
              className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveAccount}
              disabled={savingAccount}
              className="bg-indigo-600 px-4 py-2 rounded-md text-sm"
            >
              {savingAccount ? "Saving…" : "Save account"}
            </button>
            <button
              onClick={() => initialAccount && setAccount(initialAccount)}
              className="bg-slate-800 px-4 py-2 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* LINKS */}
        <form onSubmit={handleSaveLinks} className="space-y-3">
          {linksError && <p className="text-xs text-red-300">{linksError}</p>}
          {linksMessage && <p className="text-xs text-emerald-300">{linksMessage}</p>}

          {["github_url", "linkedin_url", "leetcode_url", "portfolio_url", "resume_url"].map(
            (key) => (
              <input
                key={key}
                name={key}
                value={form[key]}
                onChange={handleLinkChange}
                placeholder={key.replace("_", " ").toUpperCase()}
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-sm"
              />
            )
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingLinks}
              className="bg-indigo-600 px-4 py-2 rounded-md text-sm"
            >
              {savingLinks ? "Saving…" : "Save links"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
