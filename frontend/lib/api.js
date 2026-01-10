const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

function getAuthHeaders(withAuth) {
  const headers = { "Content-Type": "application/json" };

  if (withAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("access");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiPost(path, body, withAuth = false) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(withAuth),
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) throw data;
  return data;
}

export async function apiPatch(path, body, withAuth = false) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: getAuthHeaders(withAuth),
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) throw data;
  return data;
}

export async function apiGet(path) {
  const headers = {};

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { headers });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) throw data;
  return data;
}

export { WS_BASE };
