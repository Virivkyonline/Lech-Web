
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function onRequestGet({ params, env }) {
  const store = getStore(env);
  if (!store) return new Response("Licenčný systém nie je nastavený.", { status: 500 });
  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const account = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!isActive(account)) return new Response("Web je dočasne pozastavený. Licencia nie je aktívna.", { status: 402 });

  const services = (site.services || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(site.companyName)}</title><style>body{margin:0;background:#03040a;color:white;font-family:Arial,sans-serif}.wrap{min-height:100vh;display:grid;place-items:center;padding:40px;background:radial-gradient(circle at 20% 20%,rgba(34,211,238,.25),transparent 30%),radial-gradient(circle at 80% 30%,rgba(217,70,239,.25),transparent 30%),#03040a}.card{max-width:1000px;border:1px solid rgba(34,211,238,.35);border-radius:36px;padding:42px;background:rgba(0,0,0,.55);box-shadow:0 0 70px rgba(34,211,238,.22)}.badge{display:inline-block;background:#67e8f9;color:#000;border-radius:999px;padding:10px 14px;font-weight:900}h1{font-size:clamp(40px,7vw,82px);line-height:.95;margin:25px 0}p{font-size:20px;line-height:1.7;color:#cbd5e1}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:30px}.box{border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:18px;background:rgba(255,255,255,.06)}a{display:inline-block;margin-top:30px;background:#67e8f9;color:#000;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:900;box-shadow:0 0 35px rgba(34,211,238,.75)}</style></head><body><main class="wrap"><section class="card"><span class="badge">${escapeHtml(site.template || "Lech-Web")}</span><h1>${escapeHtml(site.headline || site.companyName)}</h1><p>${escapeHtml(site.description || "Moderný web vytvorený cez Lech-Web.")}</p><div class="grid">${services ? `<div class="box"><strong>Služby</strong><ul>${services}</ul></div>` : ""}<div class="box"><strong>Kontakt</strong><p>${escapeHtml(site.phone)}<br>${escapeHtml(site.email)}</p></div></div><a href="mailto:${escapeHtml(site.email)}">Kontaktovať firmu</a></section></main></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
