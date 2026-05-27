
function headers() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: headers() });
}

function getStore(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function putJson(store, key, value) {
  await store.put(key, JSON.stringify(value));
}

function cleanEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function checkAdmin(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

async function saveAccount(store, account) {
  await putJson(store, "user:" + account.email, account);
  await putJson(store, "account:" + account.id, account);
  const list = (await getJson(store, "accounts:index")) || [];
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
  const next = list.some((x) => x.id === account.id)
    ? list.map((x) => (x.id === account.id ? row : x))
    : [row, ...list];
  await putJson(store, "accounts:index", next.slice(0, 500));
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: headers() });
}

export async function onRequestGet({ request, env }) {
  const store = getStore(env);
  if (!store) return json({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 200);
  if (!checkAdmin(request, env)) return json({ success: false, error: "Nesprávny admin PIN." }, 200);
  const accounts = (await getJson(store, "accounts:index")) || [];
  return json({ success: true, accounts }, 200);
}

export async function onRequestPost({ request, env }) {
  try {
    const store = getStore(env);
    if (!store) return json({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 200);
    if (!checkAdmin(request, env)) return json({ success: false, error: "Nesprávny admin PIN." }, 200);

    const body = await request.json().catch(() => null);
    if (!body) return json({ success: false, error: "Neplatný JSON." }, 200);

    const email = cleanEmail(body.email);
    const action = String(body.action || "").trim();
    const account = await getJson(store, "user:" + email);

    if (!account) return json({ success: false, error: "Účet neexistuje." }, 200);

    if (action === "activate" || action === "paid") {
      const months = Number(body.months || 1);
      const base = account.paidUntil && Date.parse(account.paidUntil) > Date.now()
        ? new Date(account.paidUntil)
        : new Date();
      account.status = "active";
      account.paidUntil = new Date(base.getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (action === "suspend") {
      account.status = "suspended";
    } else if (action === "cancel") {
      account.status = "blocked";
      account.trialUntil = new Date(Date.now() - 1000).toISOString();
      account.paidUntil = null;
    } else if (action === "trial") {
      const days = Number(body.days || 14);
      account.status = "trial";
      account.trialUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    } else {
      return json({ success: false, error: "Neznáma akcia." }, 200);
    }

    await saveAccount(store, account);
    const copy = { ...account };
    delete copy.password;
    return json({ success: true, account: copy }, 200);
  } catch (error) {
    return json({ success: false, error: "Serverová chyba admin licencie.", detail: String(error && error.message ? error.message : error) }, 200);
  }
}
