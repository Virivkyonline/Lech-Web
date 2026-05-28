
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin",
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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestPost({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 500);
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." }, 400);

    const email = String(body.email || body.accountEmail || "").trim().toLowerCase();
    const slug = slugify(body.slug || body.siteSlug || "");

    let account = null;
    let site = null;

    if (email) {
      account = await getJson(store, "user:" + email);
      if (!account) return j({ success: false, error: "Účet neexistuje." }, 404);
      site = account.website || null;
    }

    if (!site && slug) {
      site = await getJson(store, "site:" + slug);
    }

    if (!site) return j({ success: false, error: "Web sa nenašiel." }, 404);

    const modules = body.modules && typeof body.modules === "object" ? body.modules : {};
    site.modules = {
      ...(site.modules || {}),
      ...modules,
      updatedAt: new Date().toISOString(),
    };

    const siteSlug = slugify(site.slug || slug || site.companyName || email);
    site.slug = siteSlug;

    await putJson(store, "site:" + siteSlug, site);

    if (account) {
      account.website = site;
      account.updatedAt = new Date().toISOString();
      await putJson(store, "user:" + account.email, account);
      await putJson(store, "account:" + account.id, account);
    }

    return j({
      success: true,
      message: "Moduly zo starého Web-main uložené.",
      siteSlug,
      modules: site.modules,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Uloženie modulov zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
