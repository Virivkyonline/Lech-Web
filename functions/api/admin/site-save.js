
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin,authorization",
  };
}

function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h() });
}

function kv(env) {
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

function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

function slugify(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeProduct(p, index) {
  return {
    id: String(p.id || "p" + (index + 1)),
    title: String(p.title || p.name || "Produkt " + (index + 1)),
    code: String(p.code || ""),
    price: String(p.price || ""),
    oldPrice: String(p.oldPrice || ""),
    image: String(p.image || ""),
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    shortText: String(p.shortText || p.description || ""),
    longText: String(p.longText || ""),
    badge: String(p.badge || ""),
    category: String(p.category || ""),
    availability: String(p.availability || "Skladom"),
    visibility: String(p.visibility || "visible"),
    stock: String(p.stock || ""),
    vat: String(p.vat || ""),
    detailUrl: String(p.detailUrl || "#"),
    seoTitle: String(p.seoTitle || ""),
    seoDescription: String(p.seoDescription || ""),
    relatedProducts: String(p.relatedProducts || ""),
    youtube: String(p.youtube || ""),
    ...p,
  };
}

function normalizeWebsite(input, account) {
  const w = input && typeof input === "object" ? input : {};
  const companyName = String(w.companyName || account.companyName || "");
  const slug = slugify(w.slug || companyName || account.email || account.id);

  const existingProducts =
    Array.isArray(w.eshop?.products) ? w.eshop.products :
    Array.isArray(w.products) ? w.products :
    [];

  const products = existingProducts.map(normalizeProduct);

  const theme = {
    accent: "lechweb",
    logo: "",
    heroImage: "",
    ...(w.theme || {}),
  };

  const modules = {
    ...(w.modules || {}),
  };

  const eshop = {
    enabled: true,
    ...(w.eshop || {}),
    products,
    sidebar: {
      ...(w.eshop?.sidebar || {}),
    },
  };

  return {
    ...w,
    slug,
    companyName,
    headline: String(w.headline || companyName || ""),
    description: String(w.description || ""),
    homepageText: String(w.homepageText || ""),
    phone: String(w.phone || ""),
    email: String(w.email || w.siteEmail || account.email || ""),
    siteEmail: String(w.siteEmail || w.email || account.email || ""),
    ownerEmail: account.email,
    template: String(w.template || account.template || "E-shop"),
    theme,
    modules,
    eshop,
    products,
    updatedAt: new Date().toISOString(),
  };
}

function addDays(date, days) {
  const d = new Date(date || Date.now());
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function addMonths(date, months) {
  const d = new Date(date || Date.now());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

function applyLicense(account, action) {
  const now = new Date().toISOString();
  const base = account.paidUntil && Date.parse(account.paidUntil) > Date.now() ? account.paidUntil : now;

  if (action === "trial14") {
    account.status = "trial";
    account.trialUntil = addDays(now, 14);
  }

  if (action === "activate_month") {
    account.status = "active";
    account.paidUntil = addMonths(base, 1);
  }

  if (action === "activate_year") {
    account.status = "active";
    account.paidUntil = addMonths(base, 12);
  }

  if (action === "activate_2years") {
    account.status = "active";
    account.paidUntil = addMonths(base, 24);
  }

  if (action === "suspend") {
    account.status = "suspended";
  }

  if (action === "unsuspend") {
    account.status = "active";
  }

  return account;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet({ env }) {
  const store = kv(env);
  let kvOk = false;
  let error = null;

  if (store) {
    try {
      await store.put("_health/admin-site-save.txt", "ok " + new Date().toISOString());
      kvOk = true;
    } catch (e) {
      error = String(e && e.message ? e.message : e);
    }
  }

  return j({
    success: true,
    endpoint: "/api/admin/site-save",
    mode: "robust-product-saving",
    kvBindingFound: Boolean(store),
    kvWriteOk: kvOk,
    kvError: error,
    saves: [
      "website",
      "website.eshop.products",
      "website.products",
      "website.modules",
      "website.theme",
      "license actions"
    ],
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 500);
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." }, 400);

    const email = String(body.email || body.accountEmail || "").trim().toLowerCase();
    if (!email) return j({ success: false, error: "Chýba email účtu." }, 400);

    const account = await getJson(store, "user:" + email);
    if (!account) return j({ success: false, error: "Účet neexistuje: " + email }, 404);

    if (body.licenseAction) applyLicense(account, String(body.licenseAction));

    const website = normalizeWebsite(body.website || body.site || {}, account);
    account.website = website;
    account.updatedAt = new Date().toISOString();

    await putJson(store, "user:" + account.email, account);
    if (account.id) await putJson(store, "account:" + account.id, account);
    await putJson(store, "site:" + website.slug, website);

    const siteIndex = (await getJson(store, "sites:index")) || [];
    const nextIndex = [website.slug, ...siteIndex.filter((x) => x !== website.slug)].slice(0, 1000);
    await putJson(store, "sites:index", nextIndex);

    return j({
      success: true,
      message: "Web zákazníka bol uložený.",
      mode: "robust-product-saving",
      account,
      website,
      publicUrl: new URL(request.url).origin + "/site/" + website.slug,
      savedProducts: website.eshop?.products?.length || 0,
      savedModules: Boolean(website.modules),
      savedTheme: Boolean(website.theme),
    });
  } catch (e) {
    return j({
      success: false,
      error: "Uloženie webu zlyhalo.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : ""),
    }, 500);
  }
}
