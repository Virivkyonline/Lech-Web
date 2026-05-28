
function h(contentType = "text/html; charset=utf-8") {
  return { "content-type": contentType };
}

function kv(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function esc(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isActive(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}

function accent(site) {
  const a = String(site.theme?.accent || "lechweb").toLowerCase();
  if (a === "fuchsia") return "#e879f9";
  if (a === "violet") return "#a78bfa";
  if (a === "emerald") return "#34d399";
  if (a === "orange") return "#fb923c";
  return "#67e8f9";
}

export async function onRequestGet({ params, env, request }) {
  const store = kv(env);
  if (!store) return new Response("KV nie je nastavené.", { status: 500 });

  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!isActive(acc)) return new Response("Web je pozastavený. Licencia nie je aktívna.", { status: 402 });

  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  const url = new URL(request.url);
  const suppliedPin = url.searchParams.get("pin") || "";
  const pinOk = !pin || suppliedPin === pin;

  if (!pinOk) {
    const loginHtml = `<!doctype html>
<html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zákazníci | ${esc(site.companyName)}</title>
<style>body{margin:0;font-family:Arial,sans-serif;background:#020617;color:white;display:grid;place-items:center;min-height:100vh}.card{width:min(420px,calc(100% - 32px));border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#0f172a;padding:28px}input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.15);background:#020617;color:white;border-radius:14px;padding:14px;margin:12px 0}button{width:100%;border:0;background:#67e8f9;color:#020617;border-radius:14px;padding:14px;font-weight:900}</style></head>
<body><form class="card" onsubmit="event.preventDefault(); location.search='?pin='+encodeURIComponent(document.getElementById('pin').value)"><h1>Admin zákazníci</h1><p>Zadaj ADMIN_PIN.</p><input id="pin" placeholder="ADMIN_PIN" type="password"><button>Otvoriť</button></form></body></html>`;
    return new Response(loginHtml, { headers: h() });
  }

  const a = accent(site);
  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zákazníci | ${esc(site.companyName)}</title>
<style>
:root{--a:${a};--line:rgba(255,255,255,.12);--muted:#cbd5e1}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at top left,color-mix(in srgb,var(--a) 20%,transparent),transparent 30%),#020617;color:white}
a{text-decoration:none;color:inherit}
.top{height:72px;border-bottom:1px solid var(--line);background:rgba(15,23,42,.86);display:flex;align-items:center;justify-content:space-between;padding:0 22px;position:sticky;top:0;z-index:20;backdrop-filter:blur(14px)}
.logo{font-size:22px;font-weight:950}
.nav{display:flex;gap:12px}.nav a{border:1px solid var(--line);border-radius:12px;padding:10px 13px;color:var(--muted)}
.page{width:min(1400px,calc(100% - 32px));margin:24px auto;display:grid;gap:20px}
.card{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:22px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.stat{border:1px solid var(--line);border-radius:18px;background:#0f172a;padding:18px}.stat b{display:block;font-size:32px;color:var(--a)}
.filters{display:grid;grid-template-columns:1fr 180px 180px auto;gap:10px;margin:18px 0}
input,select,textarea{width:100%;border:1px solid var(--line);background:#020617;color:white;border-radius:14px;padding:13px}
button{border:0;background:var(--a);color:#020617;border-radius:14px;padding:13px 16px;font-weight:950;cursor:pointer}
table{width:100%;border-collapse:collapse}th,td{padding:13px;border-bottom:1px solid var(--line);text-align:left}th{color:var(--muted);font-size:13px}.pill{display:inline-flex;border:1px solid var(--a);color:var(--a);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900}.mail{display:grid;gap:12px}.msg{color:var(--a);font-weight:900}
@media(max-width:900px){.cards,.filters{grid-template-columns:1fr}.nav{display:none}}
</style>
</head>
<body>
<header class="top">
  <a class="logo" href="/site/${esc(slug)}">${esc(site.companyName)} — Zákazníci</a>
  <nav class="nav">
    <a href="/site/${esc(slug)}">Verejný web</a>
    <a href="/site/${esc(slug)}/admin-dopyty?pin=${esc(suppliedPin)}">Dopyty</a>
  </nav>
</header>

<main class="page">
  <section class="cards">
    <div class="stat">Všetci <b id="sTotal">0</b></div>
    <div class="stat">VIP <b id="sVip">0</b></div>
    <div class="stat">Veľkoobchod <b id="sWholesale">0</b></div>
    <div class="stat">S emailom <b id="sEmail">0</b></div>
  </section>

  <section class="card">
    <h1>Prehľad zákazníkov</h1>
    <div class="filters">
      <input id="q" placeholder="Meno, email, telefón">
      <select id="type">
        <option value="">Všetci</option>
        <option value="vip">VIP</option>
        <option value="velkoobchod">Veľkoobchod</option>
        <option value="bez-objednavky">Bez objednávky</option>
      </select>
      <select id="mailTarget">
        <option value="all">Všetkým z filtra</option>
        <option value="vip">Len VIP</option>
        <option value="email">Len s emailom</option>
      </select>
      <button onclick="loadCustomers()">Filtrovať</button>
    </div>

    <div id="table"></div>
  </section>

  <section class="card">
    <h2>Hromadný info mail</h2>
    <div class="mail">
      <input id="subject" placeholder="Predmet emailu" value="Novinky a akcie">
      <textarea id="message">Dobrý deň,

pripravili sme pre Vás nové informácie, akcie a novinky z našej ponuky.

V prípade záujmu nás neváhajte kontaktovať.

S pozdravom
${esc(site.companyName)}</textarea>
      <button onclick="sendMail()">Odoslať info mail</button>
      <div class="msg" id="msg"></div>
    </div>
  </section>
</main>

<script>
const PIN = ${JSON.stringify(suppliedPin)};
const SITE_SLUG = ${JSON.stringify(slug)};
const COMPANY = ${JSON.stringify(site.companyName || "")};
let CUSTOMERS = [];

async function loadCustomers() {
  const q = document.getElementById("q").value;
  const type = document.getElementById("type").value;
  const url = "/api/admin/customers?pin=" + encodeURIComponent(PIN) + "&siteSlug=" + encodeURIComponent(SITE_SLUG) + "&q=" + encodeURIComponent(q) + "&type=" + encodeURIComponent(type);

  const res = await fetch(url);
  const data = await res.json();

  if (!data.success) {
    document.getElementById("table").innerHTML = "<p>" + (data.error || "Chyba") + "</p>";
    return;
  }

  CUSTOMERS = data.customers || [];
  document.getElementById("sTotal").textContent = data.summary.total;
  document.getElementById("sVip").textContent = data.summary.vip;
  document.getElementById("sWholesale").textContent = data.summary.wholesale;
  document.getElementById("sEmail").textContent = data.summary.withEmail;

  if (!CUSTOMERS.length) {
    document.getElementById("table").innerHTML = "<p>Žiadni zákazníci.</p>";
    return;
  }

  document.getElementById("table").innerHTML = '<table><thead><tr><th>Zákazník</th><th>Kontakt</th><th>Typ</th><th>Objednávky</th><th>Dopyty</th><th>Posledná aktivita</th></tr></thead><tbody>' +
    CUSTOMERS.map(c => '<tr><td><b>' + safe(c.name) + '</b></td><td>' + safe(c.email || c.phone) + '</td><td><span class="pill">' + safe(c.type) + '</span></td><td>' + c.ordersCount + '</td><td>' + c.inquiriesCount + '</td><td>' + safe((c.lastOrderAt || c.lastInquiryAt || "").slice(0,10)) + '</td></tr>').join("") +
    '</tbody></table>';
}

function safe(v) {
  return String(v || "").replace(/[&<>"']/g, function(ch) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}

async function sendMail() {
  const msg = document.getElementById("msg");
  const target = document.getElementById("mailTarget").value;

  let recipients = CUSTOMERS.filter(c => c.email);
  if (target === "vip") recipients = recipients.filter(c => c.type === "VIP");
  if (target === "email") recipients = recipients.filter(c => c.email);

  if (!recipients.length) {
    msg.textContent = "Nie sú vybraní žiadni príjemcovia.";
    return;
  }

  msg.textContent = "Odosielam " + recipients.length + " emailov...";

  try {
    const res = await fetch("/api/admin/customers/mail?pin=" + encodeURIComponent(PIN), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        companyName: COMPANY,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
        recipients
      })
    });

    const data = await res.json();
    if (!data.success && !data.sent) throw new Error(data.error || "Odoslanie zlyhalo.");

    msg.textContent = "Odoslané: " + data.sent + ", chyba: " + data.failed;
  } catch (err) {
    msg.textContent = err.message;
  }
}

loadCustomers();
</script>
</body>
</html>`;
  return new Response(html, { headers: h() });
}
