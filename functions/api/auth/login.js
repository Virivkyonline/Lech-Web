
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

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function isActive(account) {
  if (!account) return false;
  if (account.status === "blocked" || account.status === "suspended") return false;
  if (account.status === "active") return true;
  const now = Date.now();
  const trialUntil = account.trialUntil ? Date.parse(account.trialUntil) : 0;
  const paidUntil = account.paidUntil ? Date.parse(account.paidUntil) : 0;
  return trialUntil > now || paidUntil > now;
}

function publicAccount(account) {
  const copy = { ...account };
  delete copy.password;
  return copy;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: headers() });
}

export async function onRequestPost({ request, env }) {
  try {
    const store = getStore(env);
    if (!store) {
      return json({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 200);
    }

    const body = await request.json().catch(() => null);
    const email = cleanEmail(body && body.email);
    const password = String((body && body.password) || "").trim();

    if (!email || !password) return json({ success: false, error: "Zadaj e-mail a heslo." }, 200);

    const account = await getJson(store, "user:" + email);
    if (!account || account.password !== password) {
      return json({ success: false, error: "Nesprávny e-mail alebo heslo." }, 200);
    }

    if (!isActive(account)) {
      return json({ success: false, error: "Licencia nie je aktívna alebo vypršala.", account: publicAccount(account) }, 200);
    }

    return json({ success: true, account: publicAccount(account) }, 200);
  } catch (error) {
    return json({ success: false, error: "Serverová chyba pri prihlásení.", detail: String(error && error.message ? error.message : error) }, 200);
  }
}
