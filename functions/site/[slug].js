
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
function palette(theme) {
  const a = String(theme?.accent || "original").toLowerCase();
  if (a === "neon") return ["#67e8f9", "#e879f9", "#061019"];
  if (a === "pink") return ["#e879f9", "#67e8f9", "#120616"];
  if (a === "violet") return ["#a78bfa", "#67e8f9", "#0b0719"];
  if (a === "orange") return ["#fb923c", "#facc15", "#160b04"];
  if (a === "lime") return ["#bef264", "#67e8f9", "#071308"];
  if (a === "turquoise") return ["#4fc3c7", "#5ff3ee", "#ffffff"];
  return ["#48bfc3", "#55e8e2", "#ffffff"];
}
function renderLogo(site) {
  if (site.theme?.logo) return `<img class="logo-img" src="${esc(site.theme.logo)}" alt="${esc(site.companyName)}"/>`;
  return `<div class="logo-text">${esc(site.companyName)}</div>`;
}
function renderTopMenu(menu) {
  return (menu || []).map((m) => `<a href="${esc(m.url || "#")}">${esc(m.title || "")}</a>`).join("");
}
function renderBenefits(items) {
  return (items || []).map((b) => `<div class="benefit"><div class="benefit-icon">✦</div><div><strong>${esc(b.title)}</strong><span>${esc(b.text)}</span></div></div>`).join("");
}
function renderSidebar(sidebar) {
  const cats = (sidebar.categories || []).map((c) => `<li><a href="#">${esc(c)}</a></li>`).join("");
  const advice = (sidebar.adviceLinks || []).map((x) => `<li><a href="${esc(x.url || "#")}">${esc(x.title || "")}</a></li>`).join("");
  const youtube = (sidebar.youtube || []).map((x) => `<li><a href="${esc(x.url || "#")}">${esc(x.title || "")}</a></li>`).join("");
  const blocks = (sidebar.customBlocks || []).map((b) => `<div class="side-box"><h3>${esc(b.title || "")}</h3><p>${esc(b.text || "")}</p></div>`).join("");
  return `<aside class="sidebar">
    <div class="side-box"><h3>Kategórie</h3><ul class="cat-list">${cats}</ul></div>
    <div class="side-box" id="kontakt"><h3>${esc(sidebar.contactTitle || "Kontakt")}</h3><div class="contact-name">${esc(sidebar.contactName || "")}</div>${sidebar.contactEmail ? `<a href="mailto:${esc(sidebar.contactEmail)}">✉ ${esc(sidebar.contactEmail)}</a>` : ""}${sidebar.contactPhone ? `<a href="tel:${esc(sidebar.contactPhone)}">☎ ${esc(sidebar.contactPhone)}</a>` : ""}</div>
    ${sidebar.searchEnabled !== false ? `<div class="side-box"><h3>Vyhľadávanie</h3><form class="search-box"><input placeholder="Názov tovaru..."/><button type="button">→</button></form></div>` : ""}
    <div class="side-box"><h3>Typy a rady</h3><ul class="link-list">${advice}</ul></div>
    <div class="side-box"><h3>Videá YouTube</h3><ul class="link-list">${youtube}</ul></div>
    ${blocks}
  </aside>`;
}
function renderProducts(products) {
  return (products || []).map((p) => `<article class="product">
    <div class="badges">${p.badge ? `<span>${esc(p.badge)}</span>` : ""}${p.oldPrice ? `<span class="sale">AKCIA</span>` : ""}</div>
    <div class="product-img">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"/>` : `<div class="placeholder">Produkt</div>`}</div>
    <h3>${esc(p.title)}</h3>
    <div class="price">${p.oldPrice ? `<del>${esc(p.oldPrice)}</del>` : ""}<strong>${esc(p.price)}</strong></div>
    <a class="detail" href="${esc(p.detailUrl || "#")}">DETAIL</a>
    <p>${esc(p.shortText || "")}</p>
  </article>`).join("");
}
function renderFooter(site) {
  const links = site.eshop?.footerLinks || [];
  return `<footer class="footer"><div class="footer-grid"><div><h3>${esc(site.companyName)}</h3><p>${esc(site.description || "")}</p></div><div><h3>Informácie pre vás</h3><ul>${links.map((l) => `<li><a href="${esc(l.url || "#")}">${esc(l.title || "")}</a></li>`).join("")}</ul></div><div><h3>Nákupný košík</h3><div class="cart-box">0 ks / €0</div></div></div><div class="copy">© ${new Date().getFullYear()} ${esc(site.companyName)}. Vytvorené cez Lech-Web.</div></footer>`;
}
function renderEshop(site) {
  const e = site.eshop || {};
  const sidebar = e.sidebar || {};
  const products = e.products || [];
  const [a, b, pageBg] = palette(site.theme);
  const hero = site.theme?.heroImage;
  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(site.companyName)}</title><meta name="description" content="${esc(site.description || "")}"/>
<style>
:root{--a:${a};--b:${b};--pageBg:${pageBg};--text:#10131a;--muted:#5b6573;--line:#d7e1e2;--soft:#f5f8f8}
*{box-sizing:border-box}body{margin:0;background:${pageBg === "#ffffff" ? b : "#03040a"};font-family:Arial,Helvetica,sans-serif;color:var(--text)}a{color:inherit;text-decoration:none}
.page{width:min(1420px,calc(100% - 48px));margin:0 auto;background:white;min-height:100vh}.topbar{height:92px;background:var(--a);display:grid;grid-template-columns:230px 1fr auto;align-items:center;border-bottom:1px solid rgba(255,255,255,.25)}
.logo{padding:0 26px;display:flex;align-items:center;height:100%;background:rgba(255,255,255,.08)}.logo-img{max-width:190px;max-height:70px;object-fit:contain}.logo-text{font-size:30px;font-weight:900;letter-spacing:-.04em;color:white}
.menu{display:flex;align-items:center;gap:34px;font-weight:800;color:white}.menu a{color:white}.icons{display:flex;height:100%}.icons div{width:74px;display:grid;place-items:center;border-left:1px solid rgba(255,255,255,.25);color:white;font-size:25px}
.benefits{display:grid;grid-template-columns:repeat(4,1fr);gap:25px;padding:28px 38px 35px}.benefit{display:flex;gap:16px;align-items:center}.benefit-icon{width:54px;height:54px;border:3px solid var(--a);border-radius:16px;display:grid;place-items:center;color:var(--a);font-size:24px}.benefit strong{display:block;font-size:18px}.benefit span{display:block;color:#111;line-height:1.35}
.main{display:grid;grid-template-columns:320px 1fr;gap:34px;padding:0 36px}.sidebar{border-right:1px solid var(--line);padding-right:28px}.side-box{border-bottom:1px solid var(--line);padding:22px 0}.side-box h3{font-size:22px;margin:0 0 15px;font-weight:900}.cat-list,.link-list{list-style:none;margin:0;padding:0;display:grid;gap:9px}.cat-list a,.link-list a{color:#111}.contact-name{font-weight:900;margin-bottom:10px}.side-box a{display:block;color:var(--a);margin:8px 0}.search-box{display:grid;grid-template-columns:1fr 50px;border:1px solid #aaa}.search-box input{border:0;padding:14px;font-size:15px;outline:none}.search-box button{border:0;border-left:1px solid #aaa;background:white;font-size:28px;cursor:pointer}
.content{padding-bottom:40px}.hero{margin-bottom:28px;min-height:260px;border:1px solid var(--line);background:${hero ? `url("${esc(hero)}") center/cover` : "linear-gradient(135deg,#e7ffff,#fff)"};display:flex;align-items:end;padding:34px}.hero h1{font-size:42px;line-height:1.05;margin:0 0 12px;max-width:700px}.hero p{font-size:18px;max-width:760px;margin:0;color:#1e293b}
.tabs{display:flex;justify-content:center;border-bottom:1px solid var(--line);margin-bottom:30px}.tabs span{padding:14px 28px;border:1px solid var(--line);border-bottom:0;background:white;font-weight:700}.product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}.product{border:1px solid var(--line);padding:0 22px 24px;position:relative;text-align:center;min-height:530px}.badges{position:absolute;left:0;top:0;z-index:2;display:grid;gap:4px}.badges span{background:#009aa2;color:white;font-size:13px;font-weight:900;padding:7px 14px}.badges .sale{background:#d83a42}.product-img{height:245px;display:grid;place-items:center;margin-top:14px}.product-img img{max-width:100%;max-height:235px;object-fit:contain}.placeholder{width:100%;height:210px;background:#e8f7f8;display:grid;place-items:center;color:var(--a);font-size:22px;font-weight:900}.product h3{font-size:17px;line-height:1.35;font-weight:500;min-height:48px}.price{display:grid;gap:4px;margin:14px 0}.price del{color:#6b7280}.price strong{font-size:18px}.detail{display:inline-block;border:2px solid var(--a);color:var(--a);padding:12px 48px;margin:10px 0 16px;font-weight:700}.product p{line-height:1.45;margin:0}.home-text{max-width:760px;margin:55px auto 25px;font-size:18px;line-height:1.65}.home-text h2{font-size:36px;line-height:1.1;margin:0 0 20px}.footer{background:#f6f6f6;margin-top:20px;padding:36px}.footer-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px}.footer h3{font-size:22px;margin-top:0}.footer ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}.footer a{color:var(--a)}.cart-box{border:1px solid var(--a);height:58px;display:grid;place-items:center;color:var(--a)}.copy{border-top:1px solid #ddd;margin-top:34px;padding-top:22px;font-size:14px}
@media(max-width:1050px){.page{width:100%}.topbar{grid-template-columns:1fr auto}.logo{grid-column:1/3}.menu{overflow:auto;padding:16px 20px}.benefits{grid-template-columns:1fr 1fr}.main{grid-template-columns:1fr}.sidebar{border-right:0;padding-right:0;order:2}.product-grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.benefits{grid-template-columns:1fr}.product-grid{grid-template-columns:1fr}.main{padding:0 18px}.footer-grid{grid-template-columns:1fr}.hero h1{font-size:32px}}
</style></head><body><div class="page"><header class="topbar"><a class="logo" href="/site/${esc(site.slug)}">${renderLogo(site)}</a><nav class="menu">${renderTopMenu(e.topMenu)}</nav><div class="icons"><div>⌕</div><div>♙</div><div>🛒</div></div></header><section class="benefits">${renderBenefits(e.benefits)}</section><main class="main">${renderSidebar(sidebar)}<section class="content"><div class="hero"><div><h1>${esc(site.headline || site.companyName)}</h1><p>${esc(site.description || "")}</p></div></div><div class="tabs"><span>Akčný tovar</span><span>Novinky</span></div><div id="produkty" class="product-grid">${renderProducts(products)}</div><article id="info" class="home-text"><h2>${esc(site.headline || site.companyName)}</h2><p>${esc(site.homepageText || site.description || "Sem zákazník doplní dlhý popis hlavnej stránky, SEO text, rady, výhody a informácie o produktoch.")}</p></article></section></main>${renderFooter(site)}</div></body></html>`;
}
function renderFallback(site) {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(site.companyName)}</title></head><body><h1>${esc(site.companyName)}</h1><p>${esc(site.description || "")}</p></body></html>`;
}
export async function onRequestGet({ params, env }) {
  const store = kv(env);
  if (!store) return new Response("KV nie je nastavené.", { status: 500 });
  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });
  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!active(acc)) return new Response("Web je pozastavený. Licencia nie je aktívna.", { status: 402 });
  const isEshop = site.eshop?.enabled || String(site.template || "").toLowerCase().includes("shop") || String(site.template || "").toLowerCase().includes("e-shop");
  return new Response(isEshop ? renderEshop(site) : renderFallback(site), { headers: { "content-type": "text/html; charset=utf-8" } });
}
