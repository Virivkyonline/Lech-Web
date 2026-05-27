export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...extraHeaders,
    },
  });
}

export function getCorsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function sha256(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomId(prefix = "id") {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const token = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${token}`;
}

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function isActiveLicense(account) {
  if (!account) return false;
  if (account.license_status === "active" && account.paid_until && new Date(account.paid_until) > new Date()) return true;
  if (account.license_status === "trial" && account.trial_until && new Date(account.trial_until) > new Date()) return true;
  return false;
}
