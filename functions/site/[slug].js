function htmlResponse(html, status = 200) {
  return new Response(new TextEncoder().encode(html), {
    status,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
function kv(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isActive(account) {
  if (!account) return true;
  if (["blocked", "suspended"].includes(account.status)) return false;
  if (account.status === "active") return true;
  const now = Date.now();
  const trial = account.trialUntil ? Date.parse(account.trialUntil) : 0;
  const paid = account.paidUntil ? Date.parse(account.paidUntil) : 0;
  return trial > now || paid > now;
}

function getTheme(theme) {
  const raw = typeof theme === "string" ? theme : (theme?.accent || "lechweb");
  const id = String(raw || "lechweb").trim().toLowerCase();

  const themes = {
    lechweb: { accent: "#67e8f9", accent2: "#e879f9", dark: "#03040a", panel: "#0f172a", glow: "rgba(103,232,249,.42)", rgb: false },
    cyan: { accent: "#67e8f9", accent2: "#22d3ee", dark: "#03040a", panel: "#0f172a", glow: "rgba(34,211,238,.42)", rgb: false },
    fuchsia: { accent: "#e879f9", accent2: "#67e8f9", dark: "#05030a", panel: "#14091f", glow: "rgba(232,121,249,.42)", rgb: false },
    violet: { accent: "#a78bfa", accent2: "#e879f9", dark: "#070512", panel: "#141026", glow: "rgba(167,139,250,.42)", rgb: false },
    emerald: { accent: "#34d399", accent2: "#67e8f9", dark: "#03110c", panel: "#082018", glow: "rgba(52,211,153,.42)", rgb: false },
    orange: { accent: "#fb923c", accent2: "#facc15", dark: "#130902", panel: "#211006", glow: "rgba(251,146,60,.42)", rgb: false },
    kawasaki: { accent: "#39ff14", accent2: "#b6ff00", dark: "#020800", panel: "#061a03", glow: "rgba(57,255,20,.50)", rgb: false },
    acidyellow: { accent: "#fff200", accent2: "#39ff14", dark: "#0b0b00", panel: "#1a1800", glow: "rgba(255,242,0,.48)", rgb: false },
    "acid-yellow": { accent: "#fff200", accent2: "#39ff14", dark: "#0b0b00", panel: "#1a1800", glow: "rgba(255,242,0,.96)", rgb: false },
    sharpred: { accent: "#ff073a", accent2: "#ff7a00", dark: "#110004", panel: "#210008", glow: "rgba(255,7,58,.50)", rgb: false },
    "sharp-red": { accent: "#ff073a", accent2: "#ff7a00", dark: "#110004", panel: "#210008", glow: "rgba(255,7,58,.96)", rgb: false },
    rgbglow: { accent: "#00f5ff", accent2: "#ff00f5", dark: "#02020a", panel: "#09091a", glow: "rgba(0,245,255,.45)", rgb: true },
    "rgb-glow": { accent: "#00f5ff", accent2: "#ff00f5", dark: "#02020a", panel: "#09091a", glow: "rgba(0,245,255,.92)", rgb: true },
  };

  return themes[id] || themes.lechweb;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function visible(items) {
  return list(items).filter((item) => item.visible !== false && item.visibility !== "hidden");
}

function normalizeSite(site) {
  const modules = site.modules || {};
  const eshop = site.eshop || {};
  const sidebar = eshop.sidebar || {};

  const menu = visible(modules.menuSettings?.items).length
    ? visible(modules.menuSettings.items)
    : (visible(eshop.topMenu).length ? visible(eshop.topMenu) : [
        { title: "Produkty", url: "#produkty" },
        { title: "Akcie", url: "#produkty" },
        { title: "Ako nakupovaĹĄ", url: "#info" },
        { title: "Kontakt", url: "#kontakt" },
      ]);

  const benefits = visible(modules.banners?.advantages).length
    ? visible(modules.banners.advantages)
    : [
        { title: "DarÄŤek zdarma", text: "Ku kaĹľdej objednĂˇvke.", icon: "*" },
        { title: "RĂ˝chle dodanie", text: "Pre produkty skladom.", icon: "R" },
        { title: "Na splĂˇtky", text: "RĂ˝chlo a bezpeÄŤne.", icon: "OK" },
        { title: "Doprava zdarma", text: "PodÄľa podmienok predajcu.", icon: "DOM" },
      ];

  const categoryObjects = visible(modules.categoriesAdvanced?.items);
  const categories = categoryObjects.length
    ? categoryObjects.map((x) => x.title).filter(Boolean)
    : (list(sidebar.categories).length ? list(sidebar.categories) : ["HlavnĂˇ kategĂłria", "AkÄŤnĂ˝ tovar", "Novinky"]);

  const products = list(eshop.products).length
    ? list(eshop.products)
    : (list(site.products).length ? list(site.products) : [
        { id: "p1", title: "UkĂˇĹľkovĂ˝ produkt", price: "â‚¬999", shortText: "Produkt upravĂ­te v admine zĂˇkaznĂ­ka.", badge: "TIP", availability: "Skladom", visibility: "visible" },
      ]);

  return { modules, eshop, menu, benefits, categories, products };
}

function renderLogo(site) {
  if (site.theme?.logo) return `<img class="logo-img" src="${esc(site.theme.logo)}" alt="${esc(site.companyName)}">`;
  return `<div class="logo-mark">LW</div><div class="logo-text">${esc(site.companyName || "Lech-Web")}</div>`;
}

function renderMenu(items) {
  return items.map((item) => `<a href="${esc(item.url || "#")}"${item.newWindow ? ' target="_blank" rel="noopener"' : ""}>${esc(item.title)}</a>`).join("");
}

function renderBenefits(items) {
  return items.map((item) => `
    <div class="benefit">
      <div class="benefit-icon">${esc(item.icon || "*")}</div>
      <div><b>${esc(item.title)}</b><span>${esc(item.text)}</span></div>
    </div>
  `).join("");
}

function renderSidebar(site, data, slug) {
  const email = site.email || site.siteEmail || site.ownerEmail || "";
  const phone = site.phone || "";
  const links = visible(data.modules.links?.items).length ? visible(data.modules.links.items) : [{ title: "Ako nakupovaĹĄ", url: "#info" }];
  const youtube = list(data.eshop.sidebar?.youtube).length ? list(data.eshop.sidebar.youtube) : [];

  return `
    <aside class="sidebar">
      <section class="side-box"><h2>KategĂłrie</h2><ul>${data.categories.map((c) => `<li><a href="#produkty">${esc(c)}</a></li>`).join("")}</ul></section>
      <section class="side-box" id="kontakt"><h2>Kontakt</h2><b>${esc(site.companyName || "")}</b>${email ? `<a href="mailto:${esc(email)}">Email: ${esc(email)}</a>` : ""}${phone ? `<a href="tel:${esc(phone)}">Tel: ${esc(phone)}</a>` : ""}<a class="side-button" href="/site/${esc(slug)}/kontakt">KontaktnĂ˝ formulĂˇr</a></section>
      <section class="side-box"><h2>VyhÄľadĂˇvanie</h2><div class="search"><input id="productSearch" placeholder="NĂˇzov tovaru..." oninput="filterProducts()"><button type="button" onclick="filterProducts()">HÄľadaĹĄ</button></div></section>
      <section class="side-box"><h2>Typy a rady</h2><ul>${links.map((x) => `<li><a href="${esc(x.url || "#")}">${esc(x.title)}</a></li>`).join("")}</ul></section>
      ${youtube.length ? `<section class="side-box"><h2>VideĂˇ YouTube</h2><ul>${youtube.map((x) => `<li><a href="${esc(x.url || "#")}">${esc(x.title)}</a></li>`).join("")}</ul></section>` : ""}
    </aside>
  `;
}

function productBadges(product) {
  const badges = [];
  if (product.badge) badges.push(product.badge);
  if (product.oldPrice || product.akcia || product.flagAkcia) badges.push("AKCIA");
  if (product.novinka || product.flagNovinka) badges.push("NOVINKA");
  if (product.tip || product.flagTip) badges.push("TIP");
  return [...new Set(badges)].map((x) => `<span>${esc(x)}</span>`).join("");
}

function renderProducts(products) {
  return products
    .filter((p) => p && p.visible !== false && p.visibility !== "hidden")
    .map((p, index) => `
      <article class="product" data-title="${esc(String(p.title || "").toLowerCase())}" data-category="${esc(String(p.category || "").toLowerCase())}">
        <div class="badges">${productBadges(p)}</div>
        <div class="pimg">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : `<div>Produkt</div>`}</div>
        <h3>${esc(p.title)}</h3>
        <div class="price">${p.oldPrice ? `<del>${esc(p.oldPrice)}</del>` : ""}<strong>${esc(p.price)}</strong></div>
        ${p.availability ? `<div class="availability">${esc(p.availability)}</div>` : ""}
        <div class="product-actions"><button class="detail" type="button" onclick="addToCart(${index})">DO KOĹ ĂŤKA</button>${p.detailUrl && p.detailUrl !== "#" ? `<a class="ghost-link" href="${esc(p.detailUrl)}">Detail</a>` : ""}</div>
        <p>${esc(p.shortText || p.description || "")}</p>
      </article>
    `).join("");
}

function renderFooter(site, data) {
  const links = visible(data.modules.links?.items).filter((x) => x.footer !== false);
  return `
    <footer class="footer">
      <div class="footer-grid">
        <div><h3>${esc(site.companyName)}</h3><p>${esc(site.description || "")}</p></div>
        <div><h3>InformĂˇcie</h3><ul>${links.map((l) => `<li><a href="${esc(l.url || "#")}">${esc(l.title)}</a></li>`).join("")}</ul></div>
        <div><h3>Kontakt</h3><p>${esc(site.phone || "")}<br>${esc(site.email || site.siteEmail || "")}</p></div>
      </div>
      <div class="copy">Â© ${new Date().getFullYear()} ${esc(site.companyName)}. VytvorenĂ© cez Lech-Web.</div>
    </footer>
  `;
}

function renderCookie(mod) {
  if (!mod?.enabled) return "";
  return `
    <div class="cookie" id="cookieBox">
      <div>${esc(mod.bannerText || "PouĹľĂ­vame cookies, aby sme vĂˇm zabezpeÄŤili ÄŤo najlepĹˇĂ­ zĂˇĹľitok na webe.")}</div>
      <div class="cookie-actions"><button onclick="rejectCookies()">OdmietnuĹĄ</button><button class="accept" onclick="acceptCookies()">${esc(mod.acceptText || "SĂşhlasĂ­m")}</button></div>
    </div>
  `;
}

export async function onRequestGet({ params, env }) {
  try {
    const store = kv(env);
    if (!store) return new Response("KV nie je nastavenĂ©.", { status: 500, headers: { "content-type": "text/plain; charset=UTF-8" } });

    const slug = String(params.slug || "").trim().toLowerCase();
    const site = await getJson(store, "site:" + slug);
    if (!site) return new Response("Web neexistuje: " + slug, { status: 404, headers: { "content-type": "text/plain; charset=UTF-8" } });

    const account = site.ownerEmail ? await getJson(store, "user:" + String(site.ownerEmail).toLowerCase()) : null;
    if (!isActive(account)) return new Response("Web je pozastavenĂ˝. Licencia nie je aktĂ­vna.", { status: 402, headers: { "content-type": "text/plain; charset=UTF-8" } });

    const data = normalizeSite(site);
    const theme = getTheme(site.theme);
    const titlePage = data.modules.titlePage || {};
    const heroTitle = titlePage.heroTitle || site.headline || site.companyName || "Lech-Web";
    const heroSubtitle = titlePage.heroSubtitle || site.description || "ModernĂ˝ web vytvorenĂ˝ cez Lech-Web.";
    const heroImage = titlePage.heroImage || site.theme?.heroImage || "";
    const productsJson = JSON.stringify(data.products || []);
    const slugJson = JSON.stringify(slug);

    const rgbCss = theme.rgb ? `
body{animation:rgbpulse 8s linear infinite}
.logo-mark,.benefit-icon,.detail,.submit,.search button,.cart-btn{animation:rgbpulseBtn 4s linear infinite}
@keyframes rgbpulse{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes rgbpulseBtn{0%{box-shadow:0 0 24px #00f5ff,0 0 70px #00f5ff}33%{box-shadow:0 0 24px #ff00f5,0 0 70px #ff00f5}66%{box-shadow:0 0 24px #39ff14,0 0 70px #39ff14}100%{box-shadow:0 0 24px #00f5ff,0 0 70px #00f5ff}}
` : "";

    const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titlePage.seoTitle || site.companyName || "Lech-Web")}</title>
<meta name="description" content="${esc(site.description || "")}">
<style>
:root{--a:${theme.accent};--a2:${theme.accent2};--dark:${theme.dark};--panel:${theme.panel};--glow:${theme.glow};--line:rgba(255,255,255,.14);--text:#f8fafc;--muted:#cbd5e1}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--text);font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at 14% 8%,color-mix(in srgb,var(--a) 24%,transparent),transparent 30%),radial-gradient(circle at 86% 6%,color-mix(in srgb,var(--a2) 20%,transparent),transparent 31%),linear-gradient(180deg,var(--dark),#02040a)}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.9),rgba(0,0,0,.2))}
a{text-decoration:none;color:inherit}button,input,textarea{font:inherit}.page{position:relative;width:min(1440px,calc(100% - 40px));margin:0 auto;min-height:100vh;background:rgba(3,4,10,.84);border-left:1px solid var(--line);border-right:1px solid var(--line)}
.top{height:88px;background:rgba(15,23,42,.90);display:grid;grid-template-columns:280px 1fr auto;align-items:center;border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}.logo{height:100%;display:flex;align-items:center;gap:14px;padding:0 26px;background:linear-gradient(135deg,color-mix(in srgb,var(--a) 20%,transparent),rgba(255,255,255,.03))}.logo-img{max-width:210px;max-height:70px;object-fit:contain}.logo-mark{width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;display:grid;place-items:center;font-weight:950}.logo-text{font-size:25px;font-weight:950}.menu{display:flex;gap:34px;font-weight:900}.menu a{color:#f8fafc}.icons{display:flex;height:100%}.icons div,.cart-btn{position:relative;width:72px;display:grid;place-items:center;border:0;border-left:1px solid var(--line);background:transparent;color:var(--a);font-size:15px;font-weight:950;cursor:pointer}.cart-count{position:absolute;right:10px;top:15px;min-width:22px;height:22px;border-radius:999px;display:grid;place-items:center;background:var(--a2);color:#020617;font-size:12px;font-weight:950}
.benefits{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;padding:30px 36px}.benefit{display:flex;gap:14px;align-items:center;border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.045);padding:18px}.benefit-icon{width:50px;height:50px;border-radius:15px;background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;display:grid;place-items:center;font-weight:950}.benefit span{display:block;color:var(--muted);margin-top:3px}
.main{display:grid;grid-template-columns:320px 1fr;gap:32px;padding:0 36px 42px}.sidebar{border-right:1px solid var(--line);padding-right:28px}.side-box{border-bottom:1px solid var(--line);padding:24px 0}.side-box h2{font-size:24px;margin:0 0 16px}.side-box ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}.side-box a{display:block;color:var(--a);margin-top:9px}.side-button{border:1px solid var(--a);border-radius:12px;padding:10px 12px;text-align:center;font-weight:900}.search{display:grid;grid-template-columns:1fr 82px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.search input{border:0;background:white;color:#111;padding:14px}.search button{border:0;background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;font-size:13px;font-weight:950;cursor:pointer}
.hero{min-height:330px;border:1px solid var(--line);border-radius:26px;background:${heroImage ? `linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.22)),url("${esc(heroImage)}") center/cover` : "linear-gradient(135deg,color-mix(in srgb,var(--a) 16%,transparent),color-mix(in srgb,var(--a2) 13%,transparent))"};display:flex;align-items:end;padding:36px;margin-bottom:30px}.hero h1{font-size:54px;line-height:1.02;margin:0 0 12px;letter-spacing:-.04em}.hero p{font-size:18px;color:var(--muted);max-width:760px;line-height:1.6}.hero-buttons{display:flex;gap:12px;margin-top:18px}.hero-buttons a{display:inline-flex;border:1px solid var(--line);border-radius:14px;padding:13px 18px;font-weight:950}.hero-buttons .primary{background:linear-gradient(135deg,var(--a),var(--a2));color:#020617}
.tabs{display:flex;justify-content:center;border-bottom:1px solid var(--line);margin-bottom:28px}.tabs span{border:1px solid var(--line);border-bottom:0;padding:14px 28px;font-weight:900}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.product{position:relative;text-align:center;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:0 18px 24px;min-height:540px}.badges{position:absolute;left:0;top:0;z-index:2;display:grid;gap:4px}.badges span{background:var(--a);color:#020617;padding:7px 13px;font-size:12px;font-weight:950}.pimg{height:240px;display:grid;place-items:center;margin-top:16px}.pimg img{max-width:100%;max-height:225px;object-fit:contain}.pimg div{width:100%;height:210px;border-radius:20px;background:rgba(255,255,255,.08);display:grid;place-items:center;color:var(--a);font-size:25px;font-weight:950}.product h3{font-size:17px;line-height:1.35;min-height:50px}.price{display:grid;gap:4px;margin:14px 0}.price strong{font-size:19px}.price del{color:#94a3b8}.availability{font-size:13px;color:#86efac;margin-bottom:10px}.product-actions{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap}.detail{border:2px solid var(--a);background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;padding:12px 28px;border-radius:12px;font-weight:950;cursor:pointer}.ghost-link{border:1px solid var(--line);padding:12px 20px;border-radius:12px;color:var(--muted);font-weight:900}.product p{color:var(--muted);line-height:1.5}
.home,.action-block{max-width:850px;margin:55px auto 20px;font-size:18px;line-height:1.65;color:#dbeafe}.home h2,.action-block h2{font-size:38px;line-height:1.1;color:white}.action-block{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:28px}.footer{border-top:1px solid var(--line);background:rgba(15,23,42,.76);padding:34px}.footer-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:25px}.footer ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}.footer a{color:var(--a)}.copy{margin-top:22px;color:#94a3b8}
.modal{display:none;position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.72);align-items:center;justify-content:center;padding:20px}.modal.open{display:flex}.modal-card{width:min(760px,100%);max-height:92vh;overflow:auto;border:1px solid var(--line);border-radius:26px;background:#0f172a;padding:24px}.modal-head{display:flex;justify-content:space-between;gap:15px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:15px}.close{background:transparent;color:white;border:1px solid var(--line);border-radius:12px;padding:10px 14px;cursor:pointer}.cart-lines{display:grid;gap:10px;margin:18px 0}.cart-line{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:16px;padding:12px}.qty{display:flex;gap:6px;align-items:center}.qty button{border:0;background:var(--a);color:#020617;border-radius:8px;padding:6px 10px;font-weight:950;cursor:pointer}.form{display:grid;gap:12px;margin-top:18px}.form input,.form textarea{width:100%;border:1px solid var(--line);background:#020617;color:white;border-radius:12px;padding:13px}.submit{background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;border:0;border-radius:14px;padding:15px;font-weight:950;cursor:pointer}.msg{margin-top:12px;color:var(--a);font-weight:900}.cookie{position:fixed;left:20px;right:20px;bottom:20px;z-index:110;background:#020617;color:white;border:1px solid var(--line);border-radius:18px;padding:16px;display:none;gap:14px;align-items:center;justify-content:space-between;box-shadow:0 20px 80px rgba(0,0,0,.45)}.cookie-actions{display:flex;gap:10px}.cookie button{border:1px solid var(--line);background:transparent;color:white;border-radius:12px;padding:10px 14px;cursor:pointer}.cookie .accept{background:var(--a);color:#020617}
.top,.sidebar,.hero,.product,.side-box,.benefit,.modal-card,.footer,.search,input,textarea,select,.tabs span{border-color:color-mix(in srgb,var(--a) 66%,rgba(255,255,255,.12))!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--a) 42%,transparent),0 0 26px color-mix(in srgb,var(--a) 30%,transparent),inset 0 0 22px rgba(255,255,255,.03)!important}.product:hover,.benefit:hover,.hero:hover,.side-box:hover,.tabs span:hover{border-color:var(--a)!important;box-shadow:0 0 0 1px var(--a),0 0 34px var(--glow),0 0 95px color-mix(in srgb,var(--a2) 34%,transparent),inset 0 0 32px color-mix(in srgb,var(--a) 12%,transparent)!important}.logo-mark,.benefit-icon,.detail,.submit,.search button,.cart-btn,.icons div{box-shadow:0 0 18px var(--glow),0 0 54px color-mix(in srgb,var(--a) 62%,transparent)!important}.menu a:hover,.sidebar a:hover,.footer a:hover,.price strong,.availability,.logo-text,.side-box h2,.hero h1{color:var(--a)!important;text-shadow:0 0 12px color-mix(in srgb,var(--a) 70%,transparent),0 0 26px var(--glow)!important}.pimg div{border:1px solid color-mix(in srgb,var(--a) 60%,transparent)!important;box-shadow:inset 0 0 55px color-mix(in srgb,var(--a) 18%,transparent),0 0 24px color-mix(in srgb,var(--a) 20%,transparent)!important}
${rgbCss}
@media(max-width:1050px){.page{width:100%}.top{grid-template-columns:1fr}.menu{overflow:auto;padding:15px 24px}.icons{display:none}.benefits{grid-template-columns:1fr 1fr}.main{grid-template-columns:1fr}.sidebar{border-right:0;padding-right:0;order:2}.grid{grid-template-columns:1fr 1fr}.footer-grid{grid-template-columns:1fr}}@media(max-width:650px){.benefits,.grid{grid-template-columns:1fr}.main{padding:0 18px 35px}.hero h1{font-size:34px}.cookie{display:block}}
/* LECH-WEB STRONG NEON EFFECTS */
.top,
.sidebar,
.hero,
.product,
.side-box,
.benefit,
.modal-card,
.footer,
.search,
input,
textarea,
select,
.tabs span {
  border-color: color-mix(in srgb, var(--a) 42%, rgba(255,255,255,.16)) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 18%, transparent),
    0 0 10px color-mix(in srgb, var(--a) 12%, transparent),
    inset 0 0 10px rgba(255,255,255,.018) !important;
}

.product:hover,
.benefit:hover,
.hero:hover,
.side-box:hover,
.tabs span:hover {
  border-color: color-mix(in srgb, var(--a) 70%, white) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 36%, transparent),
    0 0 18px color-mix(in srgb, var(--a) 28%, transparent),
    0 0 36px color-mix(in srgb, var(--a2) 16%, transparent),
    inset 0 0 14px color-mix(in srgb, var(--a) 5%, transparent) !important;
}

.logo-mark,
.benefit-icon,
.detail,
.submit,
.search button,
.cart-btn,
.icons div {
  background: linear-gradient(135deg, var(--a), var(--a2)) !important;
  color: #020617 !important;
  box-shadow:
    0 0 9px color-mix(in srgb, var(--a) 38%, transparent),
    0 0 20px color-mix(in srgb, var(--a) 22%, transparent) !important;
}

.menu a:hover,
.sidebar a:hover,
.footer a:hover,
.price strong,
.availability,
.logo-text,
.side-box h2,
.hero h1 {
  color: var(--a) !important;
  text-shadow:
    0 0 5px color-mix(in srgb, var(--a) 32%, transparent),
    0 0 12px color-mix(in srgb, var(--a) 18%, transparent) !important;
}

.badges span {
  background: var(--a) !important;
  color: #020617 !important;
  box-shadow: 0 0 10px color-mix(in srgb, var(--a) 26%, transparent) !important;
}

.pimg div {
  border: 1px solid color-mix(in srgb, var(--a) 38%, transparent) !important;
  box-shadow:
    inset 0 0 22px color-mix(in srgb, var(--a) 8%, transparent),
    0 0 8px color-mix(in srgb, var(--a) 10%, transparent) !important;
}
</style>
</head>
<body>
<div class="page">
  <header class="top"><a class="logo" href="/site/${esc(slug)}">${renderLogo(site)}</a><nav class="menu">${renderMenu(data.menu)}</nav><div class="icons"><div>HÄ˝ADAĹ¤</div><div>ĂšÄŚET</div><button class="cart-btn" type="button" onclick="openCart()">KOĹ ĂŤK<span class="cart-count" id="cartCount">0</span></button></div></header>
  <section class="benefits">${renderBenefits(data.benefits)}</section>
  <main class="main">
    ${renderSidebar(site, data, slug)}
    <section>
      <div class="hero"><div><h1>${esc(heroTitle)}</h1><p>${esc(heroSubtitle)}</p><div class="hero-buttons"><a class="primary" href="#produkty">PozrieĹĄ produkty</a><a href="#kontakt">Kontakt</a></div></div></div>
      <div class="tabs"><span>AkÄŤnĂ˝ tovar</span><span>Novinky</span></div>
      <div id="produkty" class="grid">${renderProducts(data.products)}</div>
      <article id="info" class="home"><h2>${esc(titlePage.seoTitle || site.headline || site.companyName)}</h2><p>${esc(titlePage.seoText || site.homepageText || site.description || "Sem zĂˇkaznĂ­k doplnĂ­ dlhĂ˝ SEO text pod produktami.")}</p></article>
      ${titlePage.actionBlock?.enabled ? `<section class="action-block"><h2>${esc(titlePage.actionBlock.title)}</h2><p>${esc(titlePage.actionBlock.text)}</p><a class="detail" href="${esc(titlePage.actionBlock.buttonUrl || "#produkty")}">${esc(titlePage.actionBlock.buttonText || "ZobraziĹĄ")}</a></section>` : ""}
    </section>
  </main>
  ${renderFooter(site, data)}
</div>

<div class="modal" id="cartModal"><div class="modal-card"><div class="modal-head"><h2>ObjednĂˇvka</h2><button class="close" type="button" onclick="closeCart()">ZavrieĹĄ</button></div><div class="cart-lines" id="cartLines"></div><form class="form" onsubmit="sendOrder(event)"><input id="cName" placeholder="Meno a priezvisko" required><input id="cEmail" placeholder="E-mail"><input id="cPhone" placeholder="TelefĂłn"><input id="cAddress" placeholder="Adresa / mesto"><textarea id="cNote" placeholder="PoznĂˇmka"></textarea><button class="submit" type="submit">OdoslaĹĄ objednĂˇvku</button><div class="msg" id="cartMsg"></div></form></div></div>
${renderCookie(data.modules.cookies)}
<script>
const SITE_SLUG=${slugJson};
const PRODUCTS=${productsJson};
let cart=[];
function safeText(value){return String(value||"").replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];});}
function updateCart(){const count=cart.reduce((sum,item)=>sum+item.qty,0);const countEl=document.getElementById("cartCount");if(countEl)countEl.textContent=count;renderCart();}
function addToCart(index){const product=PRODUCTS[index];if(!product)return;const id=String(product.id||index);const found=cart.find((item)=>item.id===id);if(found){found.qty+=1;}else{cart.push({id,title:product.title||"Produkt",price:product.price||"",image:product.image||"",qty:1});}updateCart();openCart();}
function changeQty(id,delta){const item=cart.find((x)=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter((x)=>x.id!==id);updateCart();}
function openCart(){document.getElementById("cartModal").classList.add("open");renderCart();}
function closeCart(){document.getElementById("cartModal").classList.remove("open");}
function renderCart(){const el=document.getElementById("cartLines");if(!el)return;if(!cart.length){el.innerHTML="<p>KoĹˇĂ­k je prĂˇzdny.</p>";return;}el.innerHTML=cart.map((item)=>'<div class="cart-line"><strong>'+safeText(item.title)+'</strong><span>'+safeText(item.price)+'</span><span class="qty"><button type="button" onclick="changeQty('+JSON.stringify(item.id)+',-1)">-</button>'+item.qty+'<button type="button" onclick="changeQty('+JSON.stringify(item.id)+',1)">+</button></span></div>').join("");}
function filterProducts(){const q=(document.getElementById("productSearch")?.value||"").trim().toLowerCase();document.querySelectorAll(".product").forEach((card)=>{const title=card.dataset.title||"";const cat=card.dataset.category||"";card.style.display=(title.includes(q)||cat.includes(q))?"":"none";});}
async function sendOrder(event){event.preventDefault();const msg=document.getElementById("cartMsg");if(!cart.length){msg.textContent="KoĹˇĂ­k je prĂˇzdny.";return;}msg.textContent="Odosielam...";const payload={siteSlug:SITE_SLUG,items:cart,customer:{name:document.getElementById("cName").value,email:document.getElementById("cEmail").value,phone:document.getElementById("cPhone").value,address:document.getElementById("cAddress").value,note:document.getElementById("cNote").value}};try{const res=await fetch("/api/orders/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();if(!data.success)throw new Error(data.error||"ObjednĂˇvka zlyhala.");cart=[];updateCart();msg.textContent="ObjednĂˇvka odoslanĂˇ. ÄŚĂ­slo: "+data.order.number;}catch(err){msg.textContent=err.message;}}
function acceptCookies(){localStorage.setItem("lechweb_cookie","yes");document.getElementById("cookieBox").style.display="none";}
function rejectCookies(){localStorage.setItem("lechweb_cookie","no");document.getElementById("cookieBox").style.display="none";}
if(document.getElementById("cookieBox") && !localStorage.getItem("lechweb_cookie")) document.getElementById("cookieBox").style.display="flex";
updateCart();
</script>
</body></html>`;

    return htmlResponse(html);
  } catch (err) {
    return new Response("Chyba renderovania verejnĂ©ho webu: " + String(err?.message || err), { status: 500, headers: { "content-type": "text/plain; charset=UTF-8" } });
  }
}


