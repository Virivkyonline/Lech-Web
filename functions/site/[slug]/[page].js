
function kv(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
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

function esc(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function accent(theme) {
  const a = String(theme?.accent || "cyan").toLowerCase();
  if (a === "pink") return ["#e879f9", "#67e8f9"];
  if (a === "orange") return ["#fb923c", "#facc15"];
  if (a === "violet") return ["#a78bfa", "#67e8f9"];
  if (a === "lime") return ["#bef264", "#67e8f9"];
  return ["#67e8f9", "#e879f9"];
}

function findPage(site, pageSlug) {
  const pages = Array.isArray(site.pages) && site.pages.length
    ? site.pages
    : [{
        id: "home",
        title: "Domov",
        slug: "",
        headline: site.headline || site.companyName,
        description: site.description || "",
        heroImage: site.theme?.heroImage || "",
        sections: [
          { type: "services", title: "Služby", items: [] },
          { type: "contact", title: "Kontakt" },
        ],
      }];

  const clean = String(pageSlug || "").replace(/^\/+|\/+$/g, "");
  return pages.find((p) => String(p.slug || "") === clean) || pages[0];
}

function nav(site) {
  const pages = Array.isArray(site.pages) ? site.pages : [];
  return pages.map((p, i) => {
    const href = i === 0 || !p.slug ? `/site/${site.slug}` : `/site/${site.slug}/${p.slug}`;
    return `<a href="${href}">${esc(p.title || "Stránka")}</a>`;
  }).join("");
}

function renderSection(section, site) {
  const type = String(section.type || "text").toLowerCase();

  if (type === "services") {
    const items = Array.isArray(section.items) && section.items.length
      ? section.items
      : ["Služba 1", "Služba 2", "Služba 3"];

    return `<section class="section"><div class="wrap">
      <div class="section-head"><div><div class="kicker">Služby</div><h2>${esc(section.title || "Služby")}</h2></div><p>${esc(section.text || "Prehľadné služby, ktoré si zákazník vie upraviť vo vlastnom editore.")}</p></div>
      <div class="service-grid">${items.map((x, i) => `<div class="service-card"><span>${String(i+1).padStart(2,"0")}</span><strong>${esc(x)}</strong><p>Jasne popísaná ponuka pripravená pre dopyt zákazníka.</p></div>`).join("")}</div>
    </div></section>`;
  }

  if (type === "gallery") {
    const imgs = Array.isArray(section.images) ? section.images : [];
    if (!imgs.length) return "";
    return `<section class="section"><div class="wrap">
      <div class="section-head"><div><div class="kicker">Galéria</div><h2>${esc(section.title || "Galéria")}</h2></div><p>${esc(section.text || "Obrázky a realizácie, ktoré si zákazník nastaví sám.")}</p></div>
      <div class="gallery">${imgs.map((img) => `<figure><img src="${esc(img.url || img)}" alt="${esc(img.title || "")}" loading="lazy"/><figcaption>${esc(img.title || "")}</figcaption></figure>`).join("")}</div>
    </div></section>`;
  }

  if (type === "contact") {
    return `<section class="contact" id="kontakt"><div class="wrap"><div class="contact-panel">
      <div><div class="kicker">Kontakt</div><h2>${esc(section.title || "Kontaktujte nás")}</h2><p class="lead">${esc(section.text || "Napíšte nám a ozveme sa späť.")}</p><a class="btn btn-primary" href="mailto:${esc(site.email || site.ownerEmail)}">Poslať dopyt →</a></div>
      <div class="contact-list"><div class="contact-item"><strong>Firma</strong>${esc(site.companyName)}</div>${site.phone ? `<div class="contact-item"><strong>Telefón</strong>${esc(site.phone)}</div>` : ""}<div class="contact-item"><strong>E-mail</strong>${esc(site.email || site.ownerEmail)}</div></div>
    </div></div></section>`;
  }

  return `<section class="section"><div class="wrap">
    <div class="text-block"><div class="kicker">${esc(section.type || "Sekcia")}</div><h2>${esc(section.title || "Sekcia")}</h2><p>${esc(section.text || "")}</p></div>
  </div></section>`;
}

export async function onRequestGet({ params, env }) {
  const store = kv(env);
  if (!store) return new Response("KV nie je nastavené.", { status: 500 });

  const slug = String(params.slug || "").trim().toLowerCase();
  const pagePath = String(params.page || "").trim().toLowerCase();

  const site = await getJson(store, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!active(acc)) return new Response("Web je pozastavený. Licencia nie je aktívna.", { status: 402 });

  const page = findPage(site, pagePath);
  const [a1, a2] = accent(site.theme);
  const heroImage = page.heroImage || site.theme?.heroImage || "";

  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(page.title || site.companyName)} | ${esc(site.companyName)}</title>
<meta name="description" content="${esc(page.description || site.description || "")}"/>
<style>
:root{--a:${a1};--b:${a2};--bg:#03040a;--text:#fff;--muted:#cbd5e1;--soft:#94a3b8}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--a) 24%,transparent),transparent 32%),radial-gradient(circle at 88% 18%,color-mix(in srgb,var(--b) 24%,transparent),transparent 34%),#03040a;color:white;font-family:Inter,Arial,sans-serif}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.8),rgba(0,0,0,.2))}
.wrap{width:min(1180px,calc(100% - 36px));margin:0 auto}
.nav{position:sticky;top:0;z-index:20;backdrop-filter:blur(18px);background:rgba(3,4,10,.76);border-bottom:1px solid rgba(255,255,255,.08)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
.logo{display:flex;align-items:center;gap:12px;font-weight:950;letter-spacing:-.04em}
.logo img{width:42px;height:42px;object-fit:cover;border-radius:14px;box-shadow:0 0 25px var(--a)}
.logo-mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 0 30px var(--a)}
.nav-links{display:flex;gap:18px;align-items:center;color:var(--muted);font-weight:800}
.nav-links a{text-decoration:none;color:inherit}
.nav-cta{padding:12px 16px;border-radius:999px;background:var(--a);color:#020617!important;text-decoration:none;font-weight:950;box-shadow:0 0 28px var(--a)}
.hero{padding:90px 0 76px}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:32px;align-items:center}
.badge{display:inline-flex;padding:11px 16px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid color-mix(in srgb,var(--a) 50%,transparent);color:var(--a);font-weight:950;text-transform:uppercase;font-size:12px;letter-spacing:.18em}
h1{font-size:clamp(48px,8vw,108px);line-height:.88;letter-spacing:-.08em;margin:25px 0 24px}
.lead{font-size:clamp(18px,2.2vw,24px);line-height:1.65;color:var(--muted);max-width:760px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;padding:16px 22px;text-decoration:none;font-weight:950;border:1px solid rgba(255,255,255,.14)}
.btn-primary{background:var(--a);color:#020617;box-shadow:0 0 36px var(--a)}
.hero-media{min-height:380px;border:1px solid rgba(255,255,255,.14);border-radius:36px;background:${heroImage ? `url("${esc(heroImage)}") center/cover` : "linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.035))"};box-shadow:0 0 70px rgba(0,0,0,.35);position:relative;overflow:hidden}
.hero-media:after{content:"";position:absolute;inset:0;background:linear-gradient(145deg,transparent,rgba(0,0,0,.35)),radial-gradient(circle at 30% 30%,color-mix(in srgb,var(--a) 40%,transparent),transparent 35%)}
.section{padding:58px 0}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:24px}
.kicker{color:var(--a);font-weight:950;text-transform:uppercase;letter-spacing:.24em;font-size:12px}
h2{font-size:clamp(34px,5vw,66px);line-height:.95;letter-spacing:-.06em;margin:10px 0 0}
.section-head p{max-width:540px;color:var(--muted);line-height:1.7}
.service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.service-card,.contact-panel,.text-block{border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));padding:24px}
.service-card span{display:inline-flex;width:42px;height:42px;border-radius:15px;align-items:center;justify-content:center;background:var(--a);color:#020617;font-weight:950;margin-bottom:18px}
.service-card strong{font-size:22px;display:block;margin-bottom:12px}
.service-card p,.text-block p{color:var(--muted);line-height:1.65}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.gallery figure{margin:0;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.gallery img{width:100%;height:260px;object-fit:cover;display:block}
.gallery figcaption{padding:14px;color:var(--muted)}
.contact{padding:70px 0 90px}
.contact-panel{display:grid;grid-template-columns:1fr .85fr;gap:24px;align-items:center;background:radial-gradient(circle at 15% 20%,color-mix(in srgb,var(--a) 20%,transparent),transparent 30%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))}
.contact-list{display:grid;gap:14px}
.contact-item{padding:18px;border-radius:20px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.1);color:var(--muted)}
.contact-item strong{display:block;color:white;margin-bottom:6px}
.footer{border-top:1px solid rgba(255,255,255,.08);padding:24px 0;color:var(--soft);font-size:14px}
@media(max-width:900px){.hero-grid,.contact-panel{grid-template-columns:1fr}.service-grid,.gallery{grid-template-columns:1fr}.nav-links{display:none}.hero{padding-top:54px}}
</style>
</head>
<body>
<nav class="nav"><div class="wrap nav-inner">
  <div class="logo">${site.theme?.logo ? `<img src="${esc(site.theme.logo)}" alt="${esc(site.companyName)}"/>` : `<span class="logo-mark"></span>`}<span>${esc(site.companyName)}</span></div>
  <div class="nav-links">${nav(site)}<a class="nav-cta" href="#kontakt">Kontakt</a></div>
</div></nav>

<header class="hero"><div class="wrap hero-grid">
  <div><div class="badge">${esc(site.template || "Lech-Web")}</div><h1>${esc(page.headline || site.headline || site.companyName)}</h1><p class="lead">${esc(page.description || site.description || "Moderný web vytvorený cez Lech-Web.")}</p><a class="btn btn-primary" href="#kontakt">Kontaktovať →</a></div>
  <div class="hero-media"></div>
</div></header>

${(page.sections || []).map((s) => renderSection(s, site)).join("")}

<footer class="footer"><div class="wrap">© ${new Date().getFullYear()} ${esc(site.companyName)} • Web vytvorený cez Lech-Web</div></footer>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
