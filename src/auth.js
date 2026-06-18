const LOGIN_URL = import.meta.env.VITE_N8N_LOGIN_URL || "/webhook/auth/login";
const REGISTER_URL = import.meta.env.VITE_N8N_REGISTER_URL || "/webhook/auth/register";
const DEVICES_URL = import.meta.env.VITE_N8N_DEVICES_URL || "/webhook/auth/devices";
const REVOKE_URL = import.meta.env.VITE_N8N_REVOKE_URL || "/webhook/auth/revoke";
const OAUTH_URL = import.meta.env.VITE_N8N_OAUTH_URL || "/webhook/auth/oauth";

const TOKEN_KEY = "unite_jwt";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const payload = decodeToken(token);
  if (!payload) return false;
  if (payload.exp && Date.now() >= payload.exp * 1000) return false;
  return true;
}

export function getUser(token) {
  const p = decodeToken(token);
  if (!p) return null;
  return {
    email: p.email || p.sub || "",
    name: p.name || p.given_name || (p.email ? p.email.split("@")[0] : "Пользователь"),
  };
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function postToken(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Сервер недоступен. Попробуйте позже.");
  }

  const data = await readJson(res);

  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || "Ошибка авторизации");
  }

  const token = data && (data.token || data.jwt || data.access_token);
  if (!token) throw new Error("Сервер не вернул токен");
  return token;
}

export function login(email, password) {
  return postToken(LOGIN_URL, { email, password, device: deviceHint() });
}

export function register(email, password) {
  return postToken(REGISTER_URL, { email, password, device: deviceHint() });
}

export function oauthStart(provider) {
  const redirect = `${window.location.origin}/login`;
  const url = `${OAUTH_URL}/${provider}?redirect=${encodeURIComponent(redirect)}`;
  window.location.href = url;
}

export async function fetchDevices(token) {
  let res;
  try {
    res = await fetch(DEVICES_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Не удалось загрузить устройства");
  }
  if (!res.ok) throw new Error("Не удалось загрузить устройства");
  const data = await readJson(res);
  return Array.isArray(data) ? data : (data && data.devices) || [];
}

export async function revokeDevice(token, id) {
  let res;
  try {
    res = await fetch(REVOKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
  } catch {
    throw new Error("Не удалось завершить сессию");
  }
  if (!res.ok) {
    const data = await readJson(res);
    throw new Error((data && (data.message || data.error)) || "Не удалось завершить сессию");
  }
}

function deviceHint() {
  return {
    ua: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
}
