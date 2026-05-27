const encoder = new TextEncoder();

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function cookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options.path || "/"}`);
  parts.push("HttpOnly");
  parts.push("SameSite=Lax");
  parts.push("Secure");
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}

export function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    header.split(";").map((item) => {
      const [key, ...rest] = item.trim().split("=");
      return [key, rest.join("=")];
    }).filter(([key]) => key)
  );
  return cookies[name] || "";
}

export function randomId(prefix = "id") {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function isLicenseActive(user) {
  const now = Date.now();
  if (!user) return false;
  if (user.license_status === "active" && user.license_ends_at && Date.parse(user.license_ends_at) > now) return true;
  if (user.license_status === "trial" && user.trial_ends_at && Date.parse(user.trial_ends_at) > now) return true;
  return false;
}

export async function hashPassword(password, saltBase64) {
  const salt = base64ToBytes(saltBase64);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    key,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

export function createSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bytesToBase64(salt);
}

export async function signToken(payload, secret) {
  const data = bytesToBase64(encoder.encode(JSON.stringify(payload)));
  const sig = await hmac(data, secret);
  return `${data}.${sig}`;
}

export async function verifyToken(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const good = await hmac(data, secret);
  if (sig !== good) return null;
  const payload = JSON.parse(new TextDecoder().decode(base64ToBytes(data)));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function getCurrentUser(request, env) {
  const token = getCookie(request, "lech_web_session");
  const payload = await verifyToken(token, env.JWT_SECRET || env.ADMIN_SECRET || "dev-secret");
  if (!payload?.sub) return null;
  return env.DB.prepare("SELECT id, email, license_status, trial_ends_at, license_ends_at, created_at FROM users WHERE id = ?")
    .bind(payload.sub)
    .first();
}

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64(new Uint8Array(sig));
}

function bytesToBase64(bytes) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64ToBytes(base64url) {
  const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((base64url.length + 3) % 4);
  const str = atob(base64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    licenseStatus: user.license_status,
    trialEndsAt: user.trial_ends_at ? user.trial_ends_at.slice(0, 10) : null,
    licenseEndsAt: user.license_ends_at ? user.license_ends_at.slice(0, 10) : null,
    active: isLicenseActive(user),
  };
}
