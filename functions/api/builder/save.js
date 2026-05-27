
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

async function putJson(store, key, value) {
  await store.put(key, JSON.stringify(value));
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function addDays(date, days) {
  return new Date(date.getTime() + Number(days || 0) * 24 * 60 * 60 * 1000);
}

function makeVS(email) {
  let hash = 0;
  for (const ch of String(email || "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return String(7000000000 + (hash % 999999999)).slice(0, 10);
}

function planAmount(plan) {
  const p = String(plan || "").toLowerCase();
  if (p.includes("mini") || p.includes("shop") || p.includes("eshop")) return 119;
  if (p.includes("business")) return 69;
  return 39;
}

function safeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

async function indexAccount(store, account) {
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

  const exists = list.some((x) => x.id === account.id);
  const next = exists ? list.map((x) => (x.id === account.id ? row : x)) : [row, ...list];
  await putJson(store, "accounts:index", next.slice(0, 500));
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

function checkAdmin(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost({ request, env }) {
  try {
    const { store, response } = requireStore(env);
    if (response) return response;

    const body = await request.json().catch(() => null);
    if (!body) return json({ success: false, error: "Neplatný JSON." }, 400);

    const email = cleanEmail(body.email || body.accountEmail || body.userEmail);
    let slug = safeSlug(body.slug || body.siteSlug || body.urlName || body.url || "");
    if (!email) return json({ success: false, error: "Chýba e-mail účtu." }, 400);
    if (!slug) slug = safeSlug(body.companyName || body.company || "web");

    const account = await getJson(store, "user:" + email);
    if (!account) return json({ success: false, error: "Účet neexistuje." }, 404);
    if (!isActive(account)) return json({ success: false, error: "Licencia nie je aktívna alebo vypršala.", account: publicAccount(account) }, 403);

    const website = {
      slug,
      ownerEmail: email,
      companyName: String(body.companyName || body.company || account.companyName || "").trim(),
      headline: String(body.headline || body.title || "").trim(),
      description: String(body.description || body.text || "").trim(),
      phone: String(body.phone || "").trim(),
      email: String(body.siteEmail || body.publicEmail || email).trim(),
      services: Array.isArray(body.services) ? body.services : String(body.services || "").split("\\n").map((x) => x.trim()).filter(Boolean),
      template: String(body.template || account.template || "Stavebná firma"),
      source: "lech-web",
      createdAt: account.website && account.website.createdAt ? account.website.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "published"
    };

    account.website = website;

    await putJson(store, "site:" + slug, website);
    await indexAccount(store, account);

    return json({ success: true, message: "Web bol uložený.", url: "/site/" + slug, website, account: publicAccount(account) });
  } catch (error) {
    return json({ success: false, error: "Serverová chyba pri ukladaní webu.", detail: String(error && error.message ? error.message : error) }, 500);
  }
}
