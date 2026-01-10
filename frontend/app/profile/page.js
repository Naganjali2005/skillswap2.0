"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiPatch } from "../../lib/api";

export default function ProfilePage() {
  const [account, setAccount] = useState({ username: "", email: "" });
  const [initialAccount, setInitialAccount] = useState(null);

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

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchData() {
      try {
        const me = await apiGet("/api/auth/me/");
        setAccount({ username: me.username || "", email: me.email || "" });
        setInitialAccount({ username: me.username || "", email: me.email || "" });

        const data = await apiGet("/api/profile/links/");
        setForm({
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          leetcode_url: data.leetcode_url || "",
          portfolio_url: data.portfolio_url || "",
          resume_url: data.resume_url || "",
        });
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  function handleAccountChange(e) {
    const { name, value } = e.target;
    setAccount((p) => ({ ...p, [name]: value }));
    setAccountMessage("");
    setAccountError("");
  }

  function handleLinkChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setLinksMessage("");
    setLinksError("");
  }

  function validateUrls(values) {
    return Object.entries(values)
      .filter(([, v]) => v && !/^https?:\/\//i.test(v.trim()))
      .map(([k]) => k);
  }

  async function handleSaveAccount(e) {
    e.preventDefault();
    setAccountMessage("");
    setAccountError("");

    if (!account.username.trim()) return setAccountError("Username cannot be empty.");
    if (!account.email.trim()) return setAccountError("Email cannot be empty.");
    if (!/^\S+@\S+\.\S+$/.test(account.email.trim()))
      return setAccountError("Please enter a valid email address.");

    setSavingAccount(true);
    try {
      await apiPatch(
        "/api/auth/update/",
        { username: account.username.trim(), email: account.email.trim() },
        true
      );
      setAccountMessage("Account details updated ✔");
      setInitialAccount(account);
    } catch (err) {
      setAccountError(err?.detail || "Failed to update account.");
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleSaveLinks(e) {
    e.preventDefault();
    setLinksMessage("");
    setLinksError("");

    const invalid = validateUrls(form);
    if (invalid.length)
      return setLinksError(`Please enter full URLs (https://) for: ${invalid.join(", ")}`);

    setSavingLinks(true);
    try {
      const data = await apiPost("/api/profile/links/", form, true);
      setForm(data);
      setLinksMessage("Profile links updated ✔");
    } catch {
      setLinksError("Failed to save links.");
    } finally {
      setSavingLinks(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Profile & portfolio links
            </h1>
            <p className="text-xs text-slate-600">
              Edit your account details and optional portfolio links.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-emerald-600 hover:underline"
          >
            Back to dashboard
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
          <p className="font-semibold text-sm text-slate-800">Basic details</p>

          {accountError && <p className="text-xs text-red-500">{accountError}</p>}
          {accountMessage && <p className="text-xs text-emerald-600">{accountMessage}</p>}

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="username"
              value={account.username}
              onChange={handleAccountChange}
              placeholder="Username"
              className="bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 px-3 py-2 rounded-md text-sm"
            />
            <input
              name="email"
              type="email"
              value={account.email}
              onChange={handleAccountChange}
              placeholder="Email"
              className="bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 px-3 py-2 rounded-md text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveAccount}
              disabled={savingAccount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm"
            >
              {savingAccount ? "Saving…" : "Save account"}
            </button>
            <button
              onClick={() => initialAccount && setAccount(initialAccount)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* LINKS */}
        <form onSubmit={handleSaveLinks} className="space-y-3">
          {linksError && <p className="text-xs text-red-500">{linksError}</p>}
          {linksMessage && <p className="text-xs text-emerald-600">{linksMessage}</p>}

          {Object.keys(form).map((key) => (
            <input
              key={key}
              name={key}
              value={form[key]}
              onChange={handleLinkChange}
              placeholder={key.replace("_", " ").toUpperCase()}
              className="w-full bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 px-3 py-2 rounded-md text-sm"
            />
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingLinks}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm"
            >
              {savingLinks ? "Saving…" : "Save links"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
