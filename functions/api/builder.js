
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

function store(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(kv, key) {
  const raw = await kv.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function putJson(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

function email(v) {
  return String(v || "").trim().toLowerCase();
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

function active(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}

function pub(acc) {
  const x = { ...acc };
  delete x.password;
  return x;
}

function normalizePages(body, siteSlug, companyName) {
  let pages = [];

  if (Array.isArray(body.pages)) {
    pages = body.pages;
  } else {
    pages = [
      {
        id: "home",
        title: "Domov",
        slug: "",
        headline: body.headline || body.title || companyName,
        description: body.description || body.text || "",
        heroImage: body.heroImage || body.image || "",
        sections: [
          {
            type: "services",
            title: "Služby",
            items: String(body.services || body.serviceList || body.sluzby || "")
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
          },
          {
            type: "gallery",
            title: "Galéria",
            images: Array.isArray(body.images) ? body.images : [],
          },
          {
            type: "contact",
            title: "Kontakt",
          },
        ],
      },
    ];
  }

  return pages.map((p, index) => {
    const title = String(p.title || (index === 0 ? "Domov" : "Stránka")).trim();
    let pageSlug = index === 0 ? "" : slugify(p.slug || title);
    if (p.slug === "" || p.id === "home") pageSlug = "";

    const sections = Array.isArray(p.sections) ? p.sections : [];

    return {
      id: String(p.id || pageSlug || "home"),
      title,
      slug: pageSlug,
      headline: String(p.headline || title || companyName).trim(),
      description: String(p.description || "").trim(),
      heroImage: String(p.heroImage || p.image || "").trim(),
      sections: sections.map((s) => ({
        type: String(s.type || "text"),
        title: String(s.title || "").trim(),
        text: String(s.text || "").trim(),
        items: Array.isArray(s.items) ? s.items.map(String) : [],
        images: Array.isArray(s.images)
          ? s.images.map((img) =>
              typeof img === "string"
                ? { url: img, title: "" }
                : { url: String(img.url || ""), title: String(img.title || "") }
            ).filter((img) => img.url)
          : [],
      })),
    };
  });
}

async function indexAccount(kv, acc) {
  await putJson(kv, "user:" + acc.email, acc);
  await putJson(kv, "account:" + acc.id, acc);

  const list = (await getJson(kv, "accounts:index")) || [];
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

  const next = list.some((a) => a.id === acc.id)
    ? list.map((a) => (a.id === acc.id ? row : a))
    : [row, ...list];

  await putJson(kv, "accounts:index", next.slice(0, 500));
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet({ env }) {
  const kv = store(env);
  let ok = false;
  let err = null;

  if (kv) {
    try {
      await kv.put("site-editor-health", new Date().toISOString());
      ok = true;
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    }
  }

  return j({
    success: true,
    endpoint: "/api/site/save",
    mode: "customer-site-editor",
    kvBindingFound: Boolean(kv),
    kvWriteOk: ok,
    kvError: err,
    supports: ["pages", "sections", "image URLs", "theme", "logo", "navigation"],
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const kv = store(env);
    if (!kv) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." });

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." });

    const accountEmail = email(
      body.accountEmail ||
      body.userEmail ||
      body.ownerEmail ||
      body.customerEmail ||
      body.loginEmail ||
      body.email ||
      body.siteEmail ||
      body.publicEmail ||
      body.contactEmail
    );

    if (!accountEmail) {
      return j({
        success: false,
        error: "Chýba e-mail účtu. Zákazník musí byť prihlásený.",
        receivedKeys: Object.keys(body),
      });
    }

    const acc = await getJson(kv, "user:" + accountEmail);
    if (!acc) return j({ success: false, error: "Účet neexistuje.", email: accountEmail });
    if (!active(acc)) return j({ success: false, error: "Licencia nie je aktívna.", account: pub(acc) });

    const companyName = String(
      body.companyName ||
      body.company ||
      body.businessName ||
      body.name ||
      acc.companyName ||
      ""
    ).trim();

    let siteSlug = slugify(
      body.slug ||
      body.siteSlug ||
      body.urlName ||
      body.url ||
      body.path ||
      companyName ||
      acc.companyName ||
      "web"
    );

    if (!siteSlug) siteSlug = "web-" + Date.now();

    const theme = {
      accent: String(body.theme?.accent || body.accent || "cyan"),
      dark: body.theme?.dark !== false,
      luxury: body.theme?.luxury !== false,
      logo: String(body.logo || body.theme?.logo || ""),
      heroImage: String(body.heroImage || body.theme?.heroImage || body.image || ""),
    };

    const pages = normalizePages(body, siteSlug, companyName);

    const website = {
      slug: siteSlug,
      ownerEmail: acc.email,
      companyName: companyName || acc.companyName,
      headline: String(body.headline || body.title || companyName || acc.companyName || "").trim(),
      description: String(body.description || body.text || body.copy || "").trim(),
      phone: String(body.phone || body.telefon || "").trim(),
      email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
      template: String(body.template || body.templateName || acc.template || "Stavebná firma"),
      theme,
      pages,
      source: "lech-web",
      status: "published",
      createdAt: acc.website && acc.website.createdAt ? acc.website.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    acc.website = website;

    await putJson(kv, "site:" + siteSlug, website);
    await indexAccount(kv, acc);

    return j({
      success: true,
      message: "Web bol uložený.",
      url: "/site/" + siteSlug,
      publicUrl: "https://lech-web.pages.dev/site/" + siteSlug,
      editModel: "pages + sections + images",
      website,
      account: pub(acc),
    });
  } catch (e) {
    return j({
      success: false,
      error: "Serverová chyba pri ukladaní webu.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : ""),
    });
  }
}
