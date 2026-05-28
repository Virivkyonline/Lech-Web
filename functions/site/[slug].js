
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
  const a = String(theme?.accent || "lechweb").toLowerCase();

  if (a === "cyan") return ["#67e8f9", "#0f172a", "#03040a"];
  if (a === "fuchsia") return ["#e879f9", "#17051d", "#03040a"];
  if (a === "violet") return ["#a78bfa", "#111027", "#03040a"];
  if (a === "emerald") return ["#34d399", "#06251d", "#03040a"];
  if (a === "orange") return ["#fb923c", "#2a1003", "#03040a"];
  return ["#67e8f9", "#1e1030", "#03040a"];
}

function logo(site) {
  if (site.theme?.logo) {
    return `<img class="logo-img" src="${esc(site.theme.logo)}" alt="${esc(site.companyName)}"/>`;
  }

  return `
    <div class="logo-mark"></div>
    <div class="logo-text">${esc(site.companyName || "Lech-Web")}</div>
  `;
}

function normalizeEshop(site) {
  const oldPages = Array.isArray(site.pages) ? site.pages : [];
  const homePage = oldPages.find((p) => !p.slug || p.id === "home") || oldPages[0] || {};
  const oldServices = homePage.sections?.find((s) => s.type === "services")?.items || [];

  const existing = site.eshop || {};
  const sidebar = existing.sidebar || {};

  const products =
    Array.isArray(existing.products) && existing.products.length
      ? existing.products
      : oldServices.length
      ? oldServices.map((name, i) => ({
          id: "service-product-" + i,
          title: String(name),
          price: "",
          oldPrice: "",
          image: "",
          shortText: "Popis produktu alebo služby doplníte v editore.",
          badge: i === 0 ? "TIP" : "",
          detailUrl: "#",
        }))
      : [
          {
            id: "product-1",
            title: "Ukážkový produkt",
            price: "€999",
            oldPrice: "",
            image: "",
            shortText: "Krátky popis produktu. V admine doplň názov, cenu a obrázok.",
            badge: "TIP",
            detailUrl: "#",
          },
          {
            id: "product-2",
            title: "Druhý produkt",
            price: "€1 499",
            oldPrice: "",
            image: "",
            shortText: "Toto je ukážkový produkt v e-shop šablóne.",
            badge: "",
            detailUrl: "#",
          },
          {
            id: "product-3",
            title: "Akciový produkt",
            price: "€799",
            oldPrice: "€999",
            image: "",
            shortText: "Produkt v akcii so štítkom AKCIA.",
            badge: "AKCIA",
            detailUrl: "#",
          },
        ];

  return {
    enabled: true,
    topMenu:
      Array.isArray(existing.topMenu) && existing.topMenu.length
        ? existing.topMenu
        : [
            { title: "Produkty", url: "#produkty" },
            { title: "Akcie", url: "#produkty" },
            { title: "Ako nakupovať", url: "#info" },
            { title: "Kontakt", url: "#kontakt" },
          ],
    benefits:
      Array.isArray(existing.benefits) && existing.benefits.length
        ? existing.benefits
        : [
            { title: "Darček zdarma", text: "Ku každej objednávke." },
            { title: "Rýchle dodanie", text: "Pre produkty skladom." },
            { title: "Na splátky", text: "Rýchlo a bezpečne." },
            { title: "Doprava zdarma", text: "Podľa podmienok predajcu." },
          ],
    sidebar: {
      categories:
        Array.isArray(sidebar.categories) && sidebar.categories.length
          ? sidebar.categories
          : ["Hlavná kategória", "Akčný tovar", "Novinky", "Najpredávanejšie", "Doplnky", "Výpredaj"],
      contactTitle: sidebar.contactTitle || "Kontakt",
      contactName: sidebar.contactName || site.companyName || "",
      contactEmail: sidebar.contactEmail || site.email || site.ownerEmail || "",
      contactPhone: sidebar.contactPhone || site.phone || "",
      searchEnabled: sidebar.searchEnabled !== false,
      adviceLinks:
        Array.isArray(sidebar.adviceLinks) && sidebar.adviceLinks.length
          ? sidebar.adviceLinks
          : [
              { title: "Ako nakupovať", url: "#" },
              { title: "Obchodné podmienky", url: "#" },
              { title: "Ochrana osobných údajov", url: "#" },
            ],
      youtube:
        Array.isArray(sidebar.youtube) && sidebar.youtube.length
          ? sidebar.youtube
          : [{ title: "YouTube kanál", url: "#" }],
      customBlocks: Array.isArray(sidebar.customBlocks) ? sidebar.customBlocks : [],
    },
    products,
    footerLinks:
      Array.isArray(existing.footerLinks) && existing.footerLinks.length
        ? existing.footerLinks
        : [
            { title: "Ako nakupovať", url: "#" },
            { title: "Obchodné podmienky", url: "#" },
            { title: "Ochrana osobných údajov", url: "#" },
          ],
  };
}

function renderMenu(items) {
  return (items || []).map((m) => `<a href="${esc(m.url || "#")}">${esc(m.title || "")}</a>`).join("");
}

function renderBenefits(items) {
  return (items || [])
    .map(
      (b) => `
      <div class="benefit">
        <div class="benefit-icon">✦</div>
        <div>
          <strong>${esc(b.title)}</strong>
          <span>${esc(b.text)}</span>
        </div>
      </div>
    `
    )
    .join("");
}

function renderSidebar(sidebar) {
  const cats = (sidebar.categories || []).map((c) => `<li><a href="#">${esc(c)}</a></li>`).join("");
  const advice = (sidebar.adviceLinks || []).map((x) => `<li><a href="${esc(x.url || "#")}">${esc(x.title || "")}</a></li>`).join("");
  const youtube = (sidebar.youtube || []).map((x) => `<li><a href="${esc(x.url || "#")}">${esc(x.title || "")}</a></li>`).join("");
  const blocks = (sidebar.customBlocks || [])
    .map((b) => `<div class="side-box"><h3>${esc(b.title || "")}</h3><p>${esc(b.text || "")}</p></div>`)
    .join("");

  return `
    <aside class="sidebar">
      <div class="side-box">
        <h3>Kategórie</h3>
        <ul>${cats}</ul>
      </div>

      <div class="side-box" id="kontakt">
        <h3>${esc(sidebar.contactTitle || "Kontakt")}</h3>
        <b>${esc(sidebar.contactName || "")}</b>
        ${sidebar.contactEmail ? `<a href="mailto:${esc(sidebar.contactEmail)}">✉ ${esc(sidebar.contactEmail)}</a>` : ""}
        ${sidebar.contactPhone ? `<a href="tel:${esc(sidebar.contactPhone)}">☎ ${esc(sidebar.contactPhone)}</a>` : ""}
      </div>

      ${
        sidebar.searchEnabled !== false
          ? `<div class="side-box"><h3>Vyhľadávanie</h3><div class="search"><input placeholder="Názov tovaru..." /><button>→</button></div></div>`
          : ""
      }

      <div class="side-box">
        <h3>Typy a rady</h3>
        <ul>${advice}</ul>
      </div>

      <div class="side-box">
        <h3>Videá YouTube</h3>
        <ul>${youtube}</ul>
      </div>

      ${blocks}
    </aside>
  `;
}

function renderProducts(products) {
  return (products || [])
    .map(
      (p) => `
      <article class="product">
        <div class="badges">
          ${p.badge ? `<span>${esc(p.badge)}</span>` : ""}
          ${p.oldPrice ? `<span class="sale">AKCIA</span>` : ""}
        </div>

        <div class="pimg">
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"/>` : `<div>Produkt</div>`}
        </div>

        <h3>${esc(p.title)}</h3>

        <div class="price">
          ${p.oldPrice ? `<del>${esc(p.oldPrice)}</del>` : ""}
          <strong>${esc(p.price)}</strong>
        </div>

        <a class="detail" href="${esc(p.detailUrl || "#")}">DETAIL</a>
        <p>${esc(p.shortText || "")}</p>
      </article>
    `
    )
    .join("");
}

function renderFooter(site, e) {
  const links = e.footerLinks || [];

  return `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <h3>${esc(site.companyName)}</h3>
          <p>${esc(site.description || "")}</p>
        </div>

        <div>
          <h3>Informácie pre vás</h3>
          <ul>${links.map((l) => `<li><a href="${esc(l.url || "#")}">${esc(l.title || "")}</a></li>`).join("")}</ul>
        </div>

        <div>
          <h3>Nákupný košík</h3>
          <div class="cart-box">0 ks / €0</div>
        </div>
      </div>

      <div class="copy">© ${new Date().getFullYear()} ${esc(site.companyName)} • Vytvorené cez Lech-Web</div>
    </footer>
  `;
}

export async function onRequestGet({ params, env }) {
  const store = kv(env);

  if (!store) return new Response("KV nie je nastavené.", { status: 500 });

  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);

  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());

  if (!active(acc)) return new Response("Web je pozastavený. Licencia nie je aktívna.", { status: 402 });

  const e = normalizeEshop(site);
  const [accent] = palette(site.theme);
  const hero = site.theme?.heroImage;

  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(site.companyName)}</title>
<meta name="description" content="${esc(site.description || "")}"/>
<style>
:root{
  --a:${accent};
  --line:rgba(255,255,255,.12);
  --muted:#cbd5e1;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  background:
    radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--a) 26%,transparent),transparent 32%),
    radial-gradient(circle at 88% 8%,rgba(232,121,249,.18),transparent 32%),
    #03040a;
  color:white;
  font-family:Arial,Helvetica,sans-serif;
}
body:before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
  background-size:54px 54px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.85),rgba(0,0,0,.2));
}
a{text-decoration:none;color:inherit}
.page{
  position:relative;
  width:min(1440px,calc(100% - 40px));
  margin:0 auto;
  min-height:100vh;
  background:rgba(3,4,10,.82);
  border-left:1px solid var(--line);
  border-right:1px solid var(--line);
}
.top{
  height:88px;
  background:rgba(15,23,42,.88);
  display:grid;
  grid-template-columns:280px 1fr auto;
  align-items:center;
  border-bottom:1px solid var(--line);
  backdrop-filter:blur(18px);
}
.logo{
  height:100%;
  display:flex;
  align-items:center;
  gap:14px;
  padding:0 26px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--a) 20%,transparent),rgba(255,255,255,.03));
}
.logo-img{max-width:210px;max-height:70px;object-fit:contain}
.logo-mark{
  width:44px;
  height:44px;
  border-radius:16px;
  background:linear-gradient(135deg,var(--a),#e879f9);
  box-shadow:0 0 35px color-mix(in srgb,var(--a) 80%,transparent);
}
.logo-text{font-size:26px;font-weight:950;color:white}
.menu{display:flex;gap:34px;font-weight:900}
.menu a{color:white}
.icons{display:flex;height:100%}
.icons div{
  width:72px;
  display:grid;
  place-items:center;
  border-left:1px solid var(--line);
  color:var(--a);
  font-size:24px;
}
.benefits{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:22px;
  padding:30px 36px;
}
.benefit{
  display:flex;
  gap:14px;
  align-items:center;
  border:1px solid var(--line);
  border-radius:22px;
  background:rgba(255,255,255,.045);
  padding:18px;
}
.benefit-icon{
  width:48px;
  height:48px;
  border-radius:15px;
  background:var(--a);
  color:#020617;
  display:grid;
  place-items:center;
  font-weight:950;
}
.benefit strong{display:block}
.benefit span{display:block;color:#cbd5e1;margin-top:3px}
.main{
  display:grid;
  grid-template-columns:320px 1fr;
  gap:32px;
  padding:0 36px 42px;
}
.sidebar{
  border-right:1px solid var(--line);
  padding-right:28px;
}
.side-box{
  border-bottom:1px solid var(--line);
  padding:24px 0;
}
.side-box h3{
  font-size:24px;
  margin:0 0 16px;
}
.side-box ul{
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  gap:10px;
}
.side-box a{
  color:var(--a);
  display:block;
  margin-top:9px;
}
.side-box p{color:#cbd5e1;line-height:1.55}
.search{
  display:grid;
  grid-template-columns:1fr 50px;
  border:1px solid var(--line);
  border-radius:12px;
  overflow:hidden;
}
.search input{
  background:white;
  color:#111;
  border:0;
  padding:14px;
}
.search button{
  border:0;
  background:var(--a);
  font-size:24px;
  color:#020617;
}
.hero{
  min-height:270px;
  border:1px solid var(--line);
  border-radius:26px;
  background:${hero ? `url("${esc(hero)}") center/cover` : "linear-gradient(135deg,rgba(103,232,249,.12),rgba(232,121,249,.10))"};
  display:flex;
  align-items:end;
  padding:34px;
  margin-bottom:30px;
}
.hero h1{
  font-size:46px;
  line-height:1.05;
  margin:0 0 12px;
}
.hero p{
  font-size:18px;
  color:#cbd5e1;
  max-width:760px;
}
.tabs{
  display:flex;
  justify-content:center;
  border-bottom:1px solid var(--line);
  margin-bottom:28px;
}
.tabs span{
  border:1px solid var(--line);
  border-bottom:0;
  padding:14px 28px;
  font-weight:900;
}
.grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:24px;
}
.product{
  position:relative;
  text-align:center;
  border:1px solid var(--line);
  border-radius:24px;
  background:rgba(255,255,255,.045);
  padding:0 18px 24px;
  min-height:520px;
}
.badges{
  position:absolute;
  left:0;
  top:0;
  z-index:2;
  display:grid;
  gap:4px;
}
.badges span{
  background:#009aa2;
  padding:7px 13px;
  font-size:12px;
  font-weight:950;
}
.badges .sale{background:#e11d48}
.pimg{
  height:240px;
  display:grid;
  place-items:center;
  margin-top:16px;
}
.pimg img{
  max-width:100%;
  max-height:225px;
  object-fit:contain;
}
.pimg div{
  width:100%;
  height:210px;
  border-radius:20px;
  background:rgba(103,232,249,.12);
  display:grid;
  place-items:center;
  color:var(--a);
  font-size:25px;
  font-weight:950;
}
.product h3{
  font-size:17px;
  line-height:1.35;
  min-height:50px;
}
.price{
  display:grid;
  gap:4px;
  margin:14px 0;
}
.price strong{font-size:19px}
.price del{color:#94a3b8}
.detail{
  display:inline-block;
  border:2px solid var(--a);
  color:var(--a);
  padding:12px 48px;
  border-radius:10px;
  font-weight:950;
}
.product p{
  color:#cbd5e1;
  line-height:1.5;
}
.home{
  max-width:790px;
  margin:55px auto 20px;
  font-size:18px;
  line-height:1.65;
  color:#dbeafe;
}
.home h2{
  font-size:38px;
  line-height:1.1;
  color:white;
}
.footer{
  border-top:1px solid var(--line);
  background:rgba(15,23,42,.76);
  padding:34px;
}
.footer-grid{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:35px;
}
.footer h3{margin-top:0}
.footer p,.footer li{color:#cbd5e1}
.footer ul{
  list-style:none;
  margin:0;
  padding:0;
  display:grid;
  gap:8px;
}
.footer a{color:var(--a)}
.cart-box{
  border:1px solid var(--a);
  height:58px;
  display:grid;
  place-items:center;
  color:var(--a);
  border-radius:12px;
}
.copy{
  margin-top:28px;
  border-top:1px solid var(--line);
  padding-top:20px;
  color:#94a3b8;
}
@media(max-width:1050px){
  .page{width:100%}
  .top{grid-template-columns:1fr}
  .menu{overflow:auto;padding:15px 24px}
  .icons{display:none}
  .benefits{grid-template-columns:1fr 1fr}
  .main{grid-template-columns:1fr}
  .sidebar{border-right:0;padding-right:0;order:2}
  .grid{grid-template-columns:1fr 1fr}
}
@media(max-width:650px){
  .benefits,.grid,.footer-grid{grid-template-columns:1fr}
  .main{padding:0 18px 35px}
  .hero h1{font-size:34px}
}
</style>
</head>
<body>
<div class="page">
  <header class="top">
    <a class="logo" href="/site/${esc(site.slug)}">${logo(site)}</a>
    <nav class="menu">${renderMenu(e.topMenu)}</nav>
    <div class="icons">
      <div>⌕</div>
      <div>♙</div>
      <div>🛒</div>
    </div>
  </header>

  <section class="benefits">${renderBenefits(e.benefits)}</section>

  <main class="main">
    ${renderSidebar(e.sidebar)}

    <section>
      <div class="hero">
        <div>
          <h1>${esc(site.headline || site.companyName)}</h1>
          <p>${esc(site.description || "")}</p>
        </div>
      </div>

      <div class="tabs">
        <span>Akčný tovar</span>
        <span>Novinky</span>
      </div>

      <div id="produkty" class="grid">${renderProducts(e.products)}</div>

      <article id="info" class="home">
        <h2>${esc(site.headline || site.companyName)}</h2>
        <p>${esc(site.homepageText || site.description || "Sem zákazník doplní dlhý SEO text pod produktami.")}</p>
      </article>
    </section>
  </main>

  ${renderFooter(site, e)}
</div>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
