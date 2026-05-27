
function headers() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: headers(),
  });
}

function getStore(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function addDays(date, days) {
  return new Date(date.getTime() + Number(days || 0) * 24 * 60 * 60 * 1000);
}

function makeVS(email) {
  let hash = 0;
  for (const ch of String(email || "")) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return String(7000000000 + (hash % 999999999)).slice(0, 10);
}

function planAmount(plan) {
  const p = String(plan || "").toLowerCase();
  if (p.includes("mini") || p.includes("shop") || p.includes("eshop")) return 119;
  if (p.includes("business")) return 69;
  return 39;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function putJson(store, key, value) {
  await store.put(key, JSON.stringify(value));
}

async function saveIndex(store, account) {
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
    paidUntil: account.paidUntil,
    variableSymbol: account.variableSymbol,
    amount: account.amount,
    source: account.source,
    sourceUrl: account.sourceUrl,
    createdAt: account.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const next = list.some((x) => x.id === account.id)
    ? list.map((x) => (x.id === account.id ? row : x))
    : [row, ...list];

  await putJson(store, "accounts:index", next.slice(0, 500));
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
    paidUntil: account.paidUntil,
    variableSymbol: account.variableSymbol,
    amount: account.amount,
    source: account.source,
    sourceUrl: account.sourceUrl,
    createdAt: account.createdAt,
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: headers() });
}

export async function onRequestGet({ env }) {
  const store = getStore(env);
  let kvWriteOk = false;
  let kvError = null;

  if (store) {
    try {
      await store.put("register:health", new Date().toISOString());
      kvWriteOk = true;
    } catch (e) {
      kvError = String(e && e.message ? e.message : e);
    }
  }

  return json({
    success: true,
    endpoint: "/api/auth/register",
    kvBindingFound: Boolean(store),
    kvWriteOk,
    kvError,
    requiredBinding: "LECHWEB_KV",
    trialDays: env.TRIAL_DAYS || "14",
    time: new Date().toISOString(),
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const store = getStore(env);

    if (!store) {
      return json({
        success: false,
        error: "Chýba KV binding LECHWEB_KV. Registrácia nemá kam ukladať účty.",
        requiredBinding: "LECHWEB_KV",
        fix: "Cloudflare Pages → lech-web → Settings → Bindings → Add → KV namespace → Variable name LECHWEB_KV → Save → nový deploy.",
      }, 200);
    }

    try {
      await store.put("register:test", new Date().toISOString());
    } catch (e) {
      return json({
        success: false,
        error: "KV binding existuje, ale nedá sa do neho zapisovať.",
        detail: String(e && e.message ? e.message : e),
      }, 200);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return json({ success: false, error: "Neplatný JSON." }, 200);
    }

    const companyName = String(
      body.companyName || body.company || body.businessName || body.name || body.firma || ""
    ).trim();

    const email = cleanEmail(body.email || body.contactEmail || body.userEmail);
    const password = String(body.password || body.pass || "").trim();
    const plan = String(body.plan || body.package || "Start Web").trim();
    const template = String(body.template || body.templateName || "Stavebná firma").trim();

    if (!companyName || !email || !password) {
      return json({ success: false, error: "Vyplň názov firmy, e-mail a heslo." }, 200);
    }

    if (!email.includes("@")) {
      return json({ success: false, error: "E-mail nie je platný." }, 200);
    }

    if (password.length < 6) {
      return json({ success: false, error: "Heslo musí mať aspoň 6 znakov." }, 200);
    }

    const existing = await store.get("user:" + email);
    if (existing) {
      return json({ success: false, error: "Účet s týmto e-mailom už existuje." }, 200);
    }

    const now = new Date();
    const amount = planAmount(plan);
    const variableSymbol = makeVS(email);

    const account = {
      id: crypto.randomUUID(),
      companyName,
      email,
      password,
      plan,
      template,
      amount,
      variableSymbol,
      status: "trial",
      source: "lech-web",
      sourceUrl: request.headers.get("referer") || "https://lech-web.pages.dev",
      createdAt: now.toISOString(),
      trialUntil: addDays(now, Number(env.TRIAL_DAYS || 14)).toISOString(),
      paidUntil: null,
      website: null,
    };

    await saveIndex(store, account);

    return json({
      success: true,
      message: "Účet bol vytvorený. Trial je aktívny 14 dní.",
      account: publicAccount(account),
      payment: {
        amount,
        currency: "EUR",
        variableSymbol,
        note: "Lech-Web " + companyName,
      },
    }, 200);
  } catch (error) {
    return json({
      success: false,
      error: "Serverová chyba pri registrácii.",
      detail: String(error && error.message ? error.message : error),
      stack: String(error && error.stack ? error.stack : ""),
    }, 200);
  }
}
