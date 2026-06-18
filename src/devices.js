export function detectType(ua = "") {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet";
  if (/mobi|iphone|android.*mobile|phone/.test(s)) return "mobile";
  return "desktop";
}

export function describe(ua = "") {
  const s = ua;
  let os = "Неизвестная ОС";
  if (/windows nt 10/i.test(s)) os = "Windows 10";
  else if (/windows nt 11|windows nt 10\.0; win64/i.test(s)) os = "Windows";
  else if (/windows/i.test(s)) os = "Windows";
  else if (/iphone os (\d+)/i.test(s)) os = "iOS " + s.match(/iphone os (\d+)/i)[1];
  else if (/ipad/i.test(s)) os = "iPadOS";
  else if (/mac os x/i.test(s)) os = "macOS";
  else if (/android (\d+)/i.test(s)) os = "Android " + s.match(/android (\d+)/i)[1];
  else if (/android/i.test(s)) os = "Android";
  else if (/linux/i.test(s)) os = "Linux";

  let browser = "браузер";
  if (/edg\//i.test(s)) browser = "Edge";
  else if (/opr\/|opera/i.test(s)) browser = "Opera";
  else if (/chrome\//i.test(s) && !/edg\//i.test(s)) browser = "Chrome";
  else if (/firefox\//i.test(s)) browser = "Firefox";
  else if (/safari\//i.test(s) && !/chrome/i.test(s)) browser = "Safari";

  return `${os} · ${browser}`;
}

export function timeAgo(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} дн назад`;
  return new Date(t).toLocaleDateString("ru-RU");
}
