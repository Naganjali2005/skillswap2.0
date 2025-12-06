const BASE_URL = "http://127.0.0.1:8000"; // Django backend

export async function apiPost(path, body, withAuth = false) {
  const headers = { "Content-Type": "application/json" };

  if (withAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("access");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    throw data;
  }
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
  } catch (e) {
    data = {};
  }
  if (!res.ok) throw data;
  return data;
}
