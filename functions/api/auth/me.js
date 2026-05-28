
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

function getStore(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}


function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
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

function requireStore(env) {
  const store = getStore(env);
  if (!store) {
    return {
      store: null,
      response: json({
        success: false,
        error: "Chýba KV binding LECHWEB_KV.",
        fix: "Cloudflare Pages → lech-web → Settings → Bindings → Add KV namespace → Variable name LECHWEB_KV",
        requiredBinding: "LECHWEB_KV"
      }, 500)
    };
  }
  return { store, response: null };
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestGet({ request, env }) {
  try {
    const { store, response } = requireStore(env);
    if (response) return response;
    const url = new URL(request.url);
    const email = cleanEmail(url.searchParams.get("email"));
    if (!email) return json({ success: false, error: "Chýba email." }, 400);
    const account = await getJson(store, "user:" + email);
    if (!account) return json({ success: false, error: "Účet neexistuje." }, 404);
    return json({ success: true, active: isActive(account), account: publicAccount(account) });
  } catch (error) {
    return json({ success: false, error: "Serverová chyba.", detail: String(error && error.message ? error.message : error) }, 500);
  }
}
