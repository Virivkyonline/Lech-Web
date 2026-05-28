
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

function lines(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "").split("\n").map((x) => x.trim()).filter(Boolean);
}

function normalizeProducts(value) {
  if (Array.isArray(value) && value.length) {
    return value.map((p, i) => ({
      id: String(p.id || `product-${i + 1}`),
      title: String(p.title || p.name || `Produkt ${i + 1}`),
      price: String(p.price || ""),
      oldPrice: String(p.oldPrice || ""),
      image: String(p.image || p.imageUrl || ""),
      shortText: String(p.shortText || p.description || ""),
      category: String(p.category || ""),
      badge: String(p.badge || ""),
      detailUrl: String(p.detailUrl || ""),
    }));
  }

  return [
    {
      id: "product-1",
      title: "Ukážkový produkt",
      price: "€999",
      oldPrice: "",
      image: "",
      shortText: "Krátky popis produktu.",
      category: "Novinky",
      badge: "TIP",
      detailUrl: "",
    },
  ];
}

function defaultSidebar(body, site) {
  return {
    categories: lines(body.categories).length
      ? lines(body.categories)
      : [
          "Hlavná kategória",
          "Akčný tovar",
          "Novinky",
          "Najpredávanejšie",
          "Doplnky",
          "Výpredaj",
        ],
    contactTitle: String(body.sidebarContactTitle || "Kontakt"),
    contactName: String(body.sidebarContactName || site.companyName || ""),
    contactEmail: String(body.sidebarContactEmail || site.email || site.ownerEmail || ""),
    contactPhone: String(body.sidebarContactPhone || site.phone || ""),
    searchEnabled: body.searchEnabled !== false,
    adviceLinks: Array.isArray(body.adviceLinks)
      ? body.adviceLinks
      : [
          { title: "Ako nakupovať", url: "#" },
          { title: "Obchodné podmienky", url: "#" },
          { title: "Ochrana osobných údajov", url: "#" },
        ],
    youtube: Array.isArray(body.youtube)
      ? body.youtube
      : [
          { title: "YouTube kanál", url: "#" },
        ],
    customBlocks: Array.isArray(body.sidebarBlocks) ? body.sidebarBlocks : [],
  };
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
      await kv.put("site-save-eshop-health", new Date().toISOString());
      ok = true;
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    }
  }

  return j({
    success: true,
    endpoint: "/api/site/save",
    mode: "eshop-shoptet-style",
    kvBindingFound: Boolean(kv),
    kvWriteOk: ok,
    kvError: err,
    supports: [
      "top menu",
      "left categories",
      "contact sidebar",
      "search sidebar",
      "advice links",
      "youtube links",
      "product grid",
      "homepage description",
      "footer",
      "products",
      "categories",
    ],
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

    if (!accountEmail) return j({ success: false, error: "Chýba e-mail účtu.", receivedKeys: Object.keys(body) });

    const acc = await getJson(kv, "user:" + accountEmail);
    if (!acc) return j({ success: false, error: "Účet neexistuje.", email: accountEmail });
    if (!active(acc)) return j({ success: false, error: "Licencia nie je aktívna.", account: pub(acc) });

    const companyName = String(body.companyName || body.company || body.businessName || body.name || acc.companyName || "").trim();

    let siteSlug = slugify(body.slug || body.siteSlug || body.urlName || body.url || body.path || companyName || acc.companyName || "web");
    if (!siteSlug) siteSlug = "web-" + Date.now();

    const website = {
      slug: siteSlug,
      ownerEmail: acc.email,
      companyName: companyName || acc.companyName,
      headline: String(body.headline || body.title || companyName || acc.companyName || "").trim(),
      description: String(body.description || body.text || body.copy || "").trim(),
      homepageText: String(body.homepageText || body.longDescription || body.mainDescription || body.description || "").trim(),
      phone: String(body.phone || body.telefon || "").trim(),
      email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
      template: String(body.template || body.templateName || acc.template || "E-shop"),
      theme: {
        accent: String(body.theme?.accent || body.accent || "turquoise"),
        logo: String(body.logo || body.theme?.logo || ""),
        heroImage: String(body.heroImage || body.theme?.heroImage || body.image || ""),
      },
      eshop: {
        enabled: true,
        topMenu: Array.isArray(body.topMenu) ? body.topMenu : [
          { title: "Produkty", url: "#produkty" },
          { title: "Akcie", url: "#produkty" },
          { title: "Ako nakupovať", url: "#info" },
          { title: "Kontakt", url: "#kontakt" },
        ],
        benefits: Array.isArray(body.benefits) ? body.benefits : [
          { title: "Darček zdarma", text: "Ku každej objednávke." },
          { title: "Rýchle dodanie", text: "Pre produkty skladom." },
          { title: "Na splátky", text: "Rýchlo a bezpečne." },
          { title: "Doprava zdarma", text: "Podľa podmienok predajcu." },
        ],
        sidebar: defaultSidebar(body, {
          companyName: companyName || acc.companyName,
          email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
          ownerEmail: acc.email,
          phone: String(body.phone || body.telefon || "").trim(),
        }),
        products: normalizeProducts(body.products),
        footerLinks: Array.isArray(body.footerLinks) ? body.footerLinks : [
          { title: "Ako nakupovať", url: "#" },
          { title: "Obchodné podmienky", url: "#" },
          { title: "Ochrana osobných údajov", url: "#" },
        ],
      },
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
      message: "E-shop web bol uložený.",
      url: "/site/" + siteSlug,
      publicUrl: "https://lech-web.pages.dev/site/" + siteSlug,
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
