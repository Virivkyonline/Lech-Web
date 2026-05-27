
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

function normalizeTemplate(v) {
  return String(v || "").toLowerCase();
}

function templateData(site) {
  const t = normalizeTemplate(site.template);

  if (t.includes("auto")) {
    return {
      badge: "Autoservis / pneuservis",
      heroTag: "rýchly servis • termíny • dôvera",
      cta: "Objednať servis",
      accent: "cyan",
      stats: [
        ["24h", "rýchla reakcia"],
        ["100%", "prehľadné služby"],
        ["online", "dopyt / objednávka"],
      ],
      defaultServices: ["Diagnostika vozidla", "Pneuservis", "Servis bŕzd", "Detailing", "Predaj áut"],
      sections: [
        ["Servis bez chaosu", "Jasná ponuka služieb, rýchly kontakt a profesionálny prvý dojem."],
        ["Pre lokálnych zákazníkov", "Web je postavený tak, aby zákazník hneď vedel, čo robíte a ako vás kontaktovať."],
        ["Pripravené na reklamu", "Vhodné pre Google, Facebook aj rýchle kampane."],
      ],
    };
  }

  if (t.includes("beauty") || t.includes("salón") || t.includes("wellness") || t.includes("spa")) {
    return {
      badge: "Beauty / wellness",
      heroTag: "luxus • dôvera • rezervácie",
      cta: "Rezervovať termín",
      accent: "pink",
      stats: [
        ["prémiový", "vizuálny štýl"],
        ["mobil", "responzívny web"],
        ["kontakt", "rýchla rezervácia"],
      ],
      defaultServices: ["Kozmetika", "Masáže", "Nechty", "Wellness služby", "Darčekové poukazy"],
      sections: [
        ["Luxusný prvý dojem", "Tmavý prémiový vzhľad, neónové akcenty a dôraz na emóciu."],
        ["Služby jasne na očiach", "Zákazník rýchlo nájde ponuku a kontakt."],
        ["Ideálne pre sociálne siete", "Web pôsobí ako silná značka, nie ako obyčajná vizitka."],
      ],
    };
  }

  if (t.includes("rešta") || t.includes("gastro") || t.includes("kavia")) {
    return {
      badge: "Reštaurácia / gastro",
      heroTag: "chuť • atmosféra • rezervácie",
      cta: "Rezervovať stôl",
      accent: "orange",
      stats: [
        ["menu", "prehľadná ponuka"],
        ["rezervácie", "rýchly kontakt"],
        ["lokál", "silný prvý dojem"],
      ],
      defaultServices: ["Denné menu", "Rozvoz", "Firemné akcie", "Káva a dezerty", "Rezervácie"],
      sections: [
        ["Web, ktorý predáva chuť", "Veľké titulky, silné CTA a jasná ponuka."],
        ["Pre hostí na mobile", "Zákazník rýchlo nájde menu, kontakt a rezerváciu."],
        ["Atmosféra značky", "Dizajn pomáha vyzerať profesionálne ešte pred návštevou."],
      ],
    };
  }

  if (t.includes("ubyt") || t.includes("hotel") || t.includes("apart")) {
    return {
      badge: "Ubytovanie",
      heroTag: "rezervácie • dôvera • lokalita",
      cta: "Opýtať sa na voľný termín",
      accent: "violet",
      stats: [
        ["rezervácie", "jednoduchý dopyt"],
        ["fotky", "pripravené sekcie"],
        ["mobil", "pre hostí v pohybe"],
      ],
      defaultServices: ["Apartmány", "Krátkodobé ubytovanie", "Parkovanie", "Wellness", "Rodinné pobyty"],
      sections: [
        ["Predaj pobytu cez emóciu", "Silný vizuál a jasné informácie pre hosťa."],
        ["Rýchly kontakt", "Hosť nemusí hľadať, ako sa opýtať na termín."],
        ["Profesionálny vzhľad", "Vhodné pre penzióny, chaty, hotely aj apartmány."],
      ],
    };
  }

  if (t.includes("e-shop") || t.includes("shop") || t.includes("obleč")) {
    return {
      badge: "E-shop / predaj",
      heroTag: "predaj • produkty • dôvera",
      cta: "Poslať dopyt",
      accent: "pink",
      stats: [
        ["produkty", "luxusné zobrazenie"],
        ["kontakt", "rýchly dopyt"],
        ["značka", "prémiový vzhľad"],
      ],
      defaultServices: ["Produkty", "Kolekcie", "Lookbook", "Doplnky", "Dopytový predaj"],
      sections: [
        ["Predajný dizajn", "Web pôsobí drahšie, čistejšie a profesionálnejšie."],
        ["Pre produkty a kolekcie", "Vhodné pre oblečenie, doplnky, nábytok aj lokálny predaj."],
        ["Bez zbytočného chaosu", "Jednoduchý dopyt namiesto komplikovaného systému."],
      ],
    };
  }

  return {
    badge: "Stavebná firma",
    heroTag: "remeslo • realizácie • dôvera",
    cta: "Požiadať o cenovú ponuku",
    accent: "cyan",
    stats: [
      ["10+", "typov služieb"],
      ["14 dní", "skúšobná doba"],
      ["online", "dopyt z webu"],
    ],
    defaultServices: ["Stavebné práce", "Montáže", "Kontajnery", "Garáže", "Rekonštrukcie"],
    sections: [
      ["Web pre reálne zákazky", "Jasne ukáže služby, dôveru a kontakt bez zbytočného textu."],
      ["Vhodné pre remeslá", "Stavebníctvo, montáže, strechy, ploty, kontajnery, technické služby."],
      ["Pripravené na reklamu", "Dobrý základ pre Google reklamu, Facebook aj lokálne SEO."],
    ],
  };
}

function renderServices(services, fallback) {
  const list = services && services.length ? services : fallback;
  return list.map((s, i) => `
    <div class="service-card">
      <span>${String(i + 1).padStart(2, "0")}</span>
      <strong>${esc(s)}</strong>
      <p>Profesionálne spracovaná služba s jasným kontaktom a rýchlym dopytom.</p>
    </div>
  `).join("");
}

function renderBullets(items) {
  return items.map(([title, text]) => `
    <div class="info-card">
      <div class="mini-line"></div>
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
    </div>
  `).join("");
}

function renderStats(stats) {
  return stats.map(([big, label]) => `
    <div class="stat">
      <strong>${esc(big)}</strong>
      <span>${esc(label)}</span>
    </div>
  `).join("");
}

export async function onRequestGet({ params, env }) {
  const store = kv(env);
  if (!store) return new Response("KV nie je nastavené.", { status: 500 });

  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!active(acc)) return new Response("Web je pozastavený. Licencia nie je aktívna.", { status: 402 });

  const data = templateData(site);
  const company = site.companyName || "Moderná firma";
  const headline = site.headline || company;
  const description = site.description || "Moderný prezentačný web, ktorý buduje dôveru, ukazuje služby a vedie zákazníka ku kontaktu.";
  const phone = site.phone || "";
  const email = site.email || site.ownerEmail || "";

  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(company)}</title>
<meta name="description" content="${esc(description)}" />
<style>
:root{
  --bg:#03040a;
  --panel:rgba(8,10,18,.72);
  --panel2:rgba(255,255,255,.055);
  --text:#ffffff;
  --muted:#cbd5e1;
  --soft:#94a3b8;
  --cyan:#67e8f9;
  --pink:#e879f9;
  --lime:#bef264;
  --orange:#fb923c;
  --violet:#a78bfa;
  --accent:${data.accent === "pink" ? "#e879f9" : data.accent === "orange" ? "#fb923c" : data.accent === "violet" ? "#a78bfa" : "#67e8f9"};
  --accent2:${data.accent === "pink" ? "#67e8f9" : data.accent === "orange" ? "#facc15" : data.accent === "violet" ? "#67e8f9" : "#e879f9"};
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family:Inter,Arial,sans-serif;
  background:
    radial-gradient(circle at 12% 8%,rgba(103,232,249,.24),transparent 32%),
    radial-gradient(circle at 88% 18%,rgba(232,121,249,.22),transparent 34%),
    radial-gradient(circle at 50% 88%,rgba(103,232,249,.13),transparent 28%),
    #03040a;
  color:var(--text);
}
body:before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size:54px 54px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.9),rgba(0,0,0,.25));
}
a{color:inherit}
.wrap{width:min(1180px,calc(100% - 36px));margin:0 auto}
.nav{
  position:sticky;
  top:0;
  z-index:20;
  backdrop-filter:blur(18px);
  background:rgba(3,4,10,.72);
  border-bottom:1px solid rgba(255,255,255,.08);
}
.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
.logo{display:flex;align-items:center;gap:12px;font-weight:950;letter-spacing:-.04em}
.logo-mark{width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 0 30px color-mix(in srgb,var(--accent) 70%,transparent)}
.nav-links{display:flex;gap:18px;align-items:center;color:var(--muted);font-weight:800}
.nav-links a{text-decoration:none}
.nav-cta{padding:12px 16px;border-radius:999px;background:var(--accent);color:#020617;text-decoration:none;font-weight:950;box-shadow:0 0 28px color-mix(in srgb,var(--accent) 65%,transparent)}
.hero{padding:86px 0 70px}
.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:30px;align-items:center}
.badge{display:inline-flex;align-items:center;gap:10px;padding:11px 16px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid color-mix(in srgb,var(--accent) 50%,transparent);color:var(--accent);font-weight:950;text-transform:uppercase;font-size:12px;letter-spacing:.18em}
h1{font-size:clamp(48px,8vw,112px);line-height:.87;letter-spacing:-.08em;margin:25px 0 24px;max-width:840px}
.lead{font-size:clamp(18px,2.2vw,24px);line-height:1.65;color:var(--muted);max-width:760px}
.actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:32px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;padding:16px 22px;text-decoration:none;font-weight:950;border:1px solid rgba(255,255,255,.14)}
.btn-primary{background:var(--accent);color:#020617;box-shadow:0 0 36px color-mix(in srgb,var(--accent) 70%,transparent)}
.btn-secondary{background:rgba(255,255,255,.07);color:white}
.hero-card{
  border:1px solid rgba(255,255,255,.14);
  border-radius:34px;
  padding:28px;
  background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.035));
  box-shadow:0 0 60px rgba(0,0,0,.35), inset 0 0 40px rgba(255,255,255,.03);
}
.hero-card-top{height:190px;border-radius:26px;background:
  linear-gradient(135deg,color-mix(in srgb,var(--accent) 34%,transparent),transparent),
  radial-gradient(circle at 80% 30%,color-mix(in srgb,var(--accent2) 40%,transparent),transparent 35%),
  rgba(0,0,0,.32);
  border:1px solid rgba(255,255,255,.1);
  display:grid;place-items:center;
}
.pulse{width:82px;height:82px;border-radius:28px;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 0 60px var(--accent);animation:pulse 2.4s infinite}
@keyframes pulse{0%,100%{transform:scale(1);filter:saturate(1)}50%{transform:scale(1.08);filter:saturate(1.4)}}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}
.stat{background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:16px}
.stat strong{display:block;font-size:22px;color:var(--accent)}
.stat span{display:block;color:var(--soft);font-size:13px;margin-top:4px}
.section{padding:55px 0}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:24px}
.kicker{color:var(--accent);font-weight:950;text-transform:uppercase;letter-spacing:.24em;font-size:12px}
h2{font-size:clamp(34px,5vw,66px);line-height:.95;letter-spacing:-.06em;margin:10px 0 0}
.section-head p{max-width:540px;color:var(--muted);line-height:1.7}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.info-card,.service-card,.contact-panel{
  border:1px solid rgba(255,255,255,.12);
  border-radius:28px;
  background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
  padding:24px;
}
.mini-line{width:54px;height:5px;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent2));box-shadow:0 0 24px var(--accent);margin-bottom:24px}
.info-card h3,.service-card strong{font-size:22px;margin:0 0 12px;display:block}
.info-card p,.service-card p{color:var(--muted);line-height:1.65;margin:0}
.service-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.service-card span{display:inline-flex;width:42px;height:42px;border-radius:15px;align-items:center;justify-content:center;background:var(--accent);color:#020617;font-weight:950;margin-bottom:18px}
.contact{padding:70px 0 90px}
.contact-panel{display:grid;grid-template-columns:1fr .85fr;gap:24px;align-items:center;background:
  radial-gradient(circle at 15% 20%,color-mix(in srgb,var(--accent) 20%,transparent),transparent 30%),
  linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025));
}
.contact-list{display:grid;gap:14px}
.contact-item{padding:18px;border-radius:20px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.1);color:var(--muted)}
.contact-item strong{display:block;color:white;margin-bottom:6px}
.footer{border-top:1px solid rgba(255,255,255,.08);padding:24px 0;color:var(--soft);font-size:14px}
@media(max-width:900px){
  .hero-grid,.contact-panel{grid-template-columns:1fr}
  .cards{grid-template-columns:1fr}
  .service-grid{grid-template-columns:1fr 1fr}
  .nav-links{display:none}
  .hero{padding-top:54px}
}
@media(max-width:560px){
  .service-grid,.stats{grid-template-columns:1fr}
  .wrap{width:min(100% - 24px,1180px)}
  .hero-card,.info-card,.service-card,.contact-panel{border-radius:24px}
  h1{font-size:52px}
}
</style>
</head>
<body>
<nav class="nav">
  <div class="wrap nav-inner">
    <div class="logo"><span class="logo-mark"></span><span>${esc(company)}</span></div>
    <div class="nav-links">
      <a href="#sluzby">Služby</a>
      <a href="#vyhody">Výhody</a>
      <a href="#kontakt">Kontakt</a>
      <a class="nav-cta" href="mailto:${esc(email)}">${esc(data.cta)}</a>
    </div>
  </div>
</nav>

<header class="hero">
  <div class="wrap hero-grid">
    <div>
      <div class="badge">${esc(data.badge)} • ${esc(data.heroTag)}</div>
      <h1>${esc(headline)}</h1>
      <p class="lead">${esc(description)}</p>
      <div class="actions">
        <a class="btn btn-primary" href="mailto:${esc(email)}">${esc(data.cta)} →</a>
        <a class="btn btn-secondary" href="#sluzby">Pozrieť služby</a>
      </div>
    </div>
    <div class="hero-card">
      <div class="hero-card-top"><div class="pulse"></div></div>
      <div class="stats">${renderStats(data.stats)}</div>
    </div>
  </div>
</header>

<section id="vyhody" class="section">
  <div class="wrap">
    <div class="section-head">
      <div>
        <div class="kicker">Prečo práve my</div>
        <h2>Jasná ponuka. Silný dojem. Rýchly kontakt.</h2>
      </div>
      <p>Web je navrhnutý tak, aby zákazník okamžite pochopil ponuku a nemusel premýšľať, čo má spraviť ďalej.</p>
    </div>
    <div class="cards">${renderBullets(data.sections)}</div>
  </div>
</section>

<section id="sluzby" class="section">
  <div class="wrap">
    <div class="section-head">
      <div>
        <div class="kicker">Služby</div>
        <h2>Čo ponúkame</h2>
      </div>
      <p>Prehľadné služby, ktoré sa dajú ďalej rozšíriť o fotky, realizácie, cenník alebo objednávkový formulár.</p>
    </div>
    <div class="service-grid">${renderServices(site.services, data.defaultServices)}</div>
  </div>
</section>

<section id="kontakt" class="contact">
  <div class="wrap">
    <div class="contact-panel">
      <div>
        <div class="kicker">Kontakt</div>
        <h2>Poďme riešiť vašu požiadavku.</h2>
        <p class="lead">Napíšte nám a ozveme sa späť s návrhom ďalšieho postupu.</p>
        <div class="actions">
          <a class="btn btn-primary" href="mailto:${esc(email)}">${esc(data.cta)} →</a>
          ${phone ? `<a class="btn btn-secondary" href="tel:${esc(phone)}">Zavolať</a>` : ""}
        </div>
      </div>
      <div class="contact-list">
        <div class="contact-item"><strong>Firma</strong>${esc(company)}</div>
        ${phone ? `<div class="contact-item"><strong>Telefón</strong>${esc(phone)}</div>` : ""}
        <div class="contact-item"><strong>E-mail</strong>${esc(email)}</div>
      </div>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="wrap">© ${new Date().getFullYear()} ${esc(company)} • Web vytvorený cez Lech-Web</div>
</footer>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
