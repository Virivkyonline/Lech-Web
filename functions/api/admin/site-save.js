
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin",
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
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function putJson(store, key, value) {
  await store.put(key, JSON.stringify(value));
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

function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;

  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

function cleanEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function publicAccount(acc) {
  const clean = { ...acc };
  delete clean.password;
  delete clean.passwordHash;
  return clean;
}

async function indexAccount(store, acc) {
  await putJson(store, "user:" + acc.email, acc);
  await putJson(store, "account:" + acc.id, acc);

  const list = (await getJson(store, "accounts:index")) || [];

  const row = {
    id: acc.id,
    email: acc.email,
    companyName: acc.companyName,
    plan: acc.plan,
    template: acc.template,
    status: acc.status,
    trialUntil: acc.trialUntil,
    paidUntil: acc.paidUntil || null,
    source: acc.source || "lech-web",
    createdAt: acc.createdAt,
    updatedAt: new Date().toISOString(),
    website: acc.website || null,
  };

  const next = list.some((x) => x.id === acc.id)
    ? list.map((x) => (x.id === acc.id ? row : x))
    : [row, ...list];

  await putJson(store, "accounts:index", next.slice(0, 1000));
}

function extendDate(currentIso, days) {
  const base = currentIso && Date.parse(currentIso) > Date.now() ? new Date(currentIso) : new Date();
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function normalizeWebsite(acc, bodyWebsite) {
  const old = acc.website || {};
  const w = bodyWebsite || {};

  const slug = slugify(w.slug || old.slug || acc.companyName || acc.email);

  return {
    ...old,
    ...w,
    slug,
    ownerEmail: acc.email,
    companyName: String(w.companyName || old.companyName || acc.companyName || "").trim(),
    email: String(w.email || w.siteEmail || old.email || acc.email || "").trim(),
    phone: String(w.phone || old.phone || "").trim(),
    template: String(w.template || old.template || acc.template || "E-shop").trim(),
    status: "published",
    updatedAt: new Date().toISOString(),
    createdAt: old.createdAt || new Date().toISOString(),
  };
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

    const email = cleanEmail(body.email || body.accountEmail || body.customerEmail);
    if (!email) return j({ success: false, error: "Chýba email účtu." }, 400);

    const acc = await getJson(store, "user:" + email);
    if (!acc) return j({ success: false, error: "Účet neexistuje." }, 404);

    if (body.licenseAction === "activate_month") {
      acc.status = "active";
      acc.paidUntil = extendDate(acc.paidUntil, 30);
    }

    if (body.licenseAction === "activate_year") {
      acc.status = "active";
      acc.paidUntil = extendDate(acc.paidUntil, 365);
    }

    if (body.licenseAction === "activate_2years") {
      acc.status = "active";
      acc.paidUntil = extendDate(acc.paidUntil, 730);
    }

    if (body.licenseAction === "trial14") {
      acc.status = "trial";
      acc.trialUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }

    if (body.licenseAction === "suspend") {
      acc.status = "suspended";
    }

    if (body.licenseAction === "reactivate") {
      acc.status = "active";
    }

    if (body.accountPatch && typeof body.accountPatch === "object") {
      const allowed = ["companyName", "plan", "template", "source"];
      for (const key of allowed) {
        if (key in body.accountPatch) acc[key] = body.accountPatch[key];
      }
    }

    if (body.website && typeof body.website === "object") {
      const oldSlug = acc.website?.slug;
      const website = normalizeWebsite(acc, body.website);
      acc.website = website;

      await putJson(store, "site:" + website.slug, website);

      if (oldSlug && oldSlug !== website.slug) {
        await store.delete("site:" + oldSlug);
      }
    }

    acc.updatedAt = new Date().toISOString();
    await indexAccount(store, acc);

    return j({
      success: true,
      message: "Admin zmena uložená.",
      account: publicAccount(acc),
      publicUrl: acc.website?.slug ? "https://lech-web.pages.dev/site/" + acc.website.slug : null,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Admin uloženie zlyhalo.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : ""),
    }, 500);
  }
}
