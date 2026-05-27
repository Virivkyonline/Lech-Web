export function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin",
  };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cors(),
    },
  });
}

export function getStore(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || null;
}

export async function getJson(store, key) {
  const value = await store.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function putJson(store, key, value) {
  await store.put(key, JSON.stringify(value));
}

export function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function safeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function addDays(date, days) {
  return new Date(date.getTime() + Number(days || 0) * 24 * 60 * 60 * 1000);
}

export function planAmount(plan) {
  const p = String(plan || "").toLowerCase();
  if (p.includes("mini") || p.includes("shop") || p.includes("eshop")) return 119;
  if (p.includes("business")) return 69;
  return 39;
}

export function makeVS(email) {
  let hash = 0;
  for (const ch of String(email || "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return String(7000000000 + (hash % 999999999)).slice(0, 10);
}

export function publicAccount(account) {
  return {
    id: account.id,
    companyName: account.companyName,
    email: account.email,
    plan: account.plan,
    template: account.template,
    status: account.status,
    trialUntil: account.trialUntil,
    paidUntil: account.paidUntil || null,
    variableSymbol: account.variableSymbol,
    amount: account.amount,
    source: account.source || "lech-web",
    sourceUrl: account.sourceUrl || "",
    website: account.website || null,
    createdAt: account.createdAt,
  };
}

export function isActive(account) {
  if (!account) return false;
  if (account.status === "blocked" || account.status === "suspended") return false;
  if (account.status === "active") return true;
  const now = Date.now();
  const trialUntil = account.trialUntil ? Date.parse(account.trialUntil) : 0;
  const paidUntil = account.paidUntil ? Date.parse(account.paidUntil) : 0;
  return trialUntil > now || paidUntil > now;
}

export async function indexAccount(store, account) {
  await putJson(store, "user:" + account.email, account);
  await putJson(store, "account:" + account.id, account);

  const list = (await getJson(store, "accounts:index")) || [];
  const exists = list.some((x) => x.id === account.id);
  const row = {
    id: account.id,
    email: account.email,
    companyName: account.companyName,
    plan: account.plan,
    template: account.template,
    status: account.status,
    trialUntil: account.trialUntil,
    paidUntil: account.paidUntil || null,
    source: account.source || "lech-web",
    createdAt: account.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const next = exists ? list.map((x) => (x.id === account.id ? row : x)) : [row, ...list];
  await putJson(store, "accounts:index", next.slice(0, 500));
}

export function requireStore(env) {
  const store = getStore(env);
  if (!store) {
    return {
      store: null,
      response: json(
        {
          success: false,
          error: "Chýba Cloudflare KV binding.",
          fix: "Cloudflare Pages → lech-web → Settings → Bindings → Add KV namespace → Variable name LECHWEB_KV",
          requiredBinding: "LECHWEB_KV",
        },
        500
      ),
    };
  }
  return { store, response: null };
}

export function checkAdmin(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const header = request.headers.get("x-admin-pin") || "";
  const url = new URL(request.url);
  const queryPin = url.searchParams.get("pin") || "";
  return header === pin || queryPin === pin;
}
