
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

export async function onRequestGet({ params, env }) {
  const store = kv(env);
  if (!store) return new Response("KV nie je nastavené.", { status: 500 });

  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);

  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!isActive(acc)) return new Response("Web je pozastavený. Licencia nie je aktívna.", { status: 402 });

  const a = accent(site);

  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kontakt | ${esc(site.companyName)}</title>
<meta name="description" content="Kontaktujte ${esc(site.companyName)}. Pošlite dopyt k produktu, dodaniu alebo službe.">
<style>
:root{--a:${a};--line:rgba(255,255,255,.12);--text:#f8fafc;--muted:#cbd5e1}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--text);background:radial-gradient(circle at top left,color-mix(in srgb,var(--a) 18%,transparent),transparent 28%),linear-gradient(180deg,#09111e,#03040a)}
a{color:inherit;text-decoration:none}
.container{width:min(1120px,calc(100% - 32px));margin:0 auto}
.top{position:sticky;top:0;z-index:20;background:rgba(2,6,23,.86);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.top-inner{height:76px;display:flex;align-items:center;justify-content:space-between}
.logo{font-weight:950;font-size:24px;color:white}
.nav{display:flex;gap:20px;font-weight:900;color:var(--muted)}
.hero{padding:70px 0 30px}
.hero h1{font-size:54px;line-height:1.05;margin:0 0 16px}
.hero p{font-size:18px;color:var(--muted);max-width:720px;line-height:1.6}
.grid{display:grid;grid-template-columns:1fr 420px;gap:28px;padding-bottom:70px}
.card{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.05);padding:26px;box-shadow:0 18px 50px rgba(0,0,0,.35)}
.form{display:grid;gap:14px}
input,textarea,select{width:100%;border:1px solid var(--line);background:#020617;color:white;border-radius:14px;padding:14px;outline:none}
textarea{min-height:150px;resize:vertical}
button{border:0;background:var(--a);color:#020617;border-radius:14px;padding:15px 20px;font-weight:950;cursor:pointer}
.info{display:grid;gap:16px}
.info-row{border-bottom:1px solid var(--line);padding-bottom:14px}
.info-row strong{display:block;color:white}
.info-row span,.info-row a{color:var(--muted)}
.msg{margin-top:12px;color:var(--a);font-weight:900}
.footer{border-top:1px solid var(--line);padding:28px 0;color:var(--muted)}
@media(max-width:850px){.grid{grid-template-columns:1fr}.hero h1{font-size:38px}.nav{display:none}}
</style>
</head>
<body>
<header class="top">
  <div class="container top-inner">
    <a class="logo" href="/site/${esc(slug)}">${esc(site.companyName)}</a>
    <nav class="nav">
      <a href="/site/${esc(slug)}">Domov</a>
      <a href="/site/${esc(slug)}#produkty">Produkty</a>
      <a href="/site/${esc(slug)}/kontakt">Kontakt</a>
    </nav>
  </div>
</header>

<main class="container">
  <section class="hero">
    <h1>Kontaktujte nás</h1>
    <p>Pošlite dopyt k produktu, výbave, dodaniu alebo službe. Odpovieme vám čo najskôr.</p>
  </section>

  <section class="grid">
    <div class="card">
      <form class="form" onsubmit="sendInquiry(event)">
        <input id="name" placeholder="Meno a priezvisko" required>
        <input id="email" placeholder="E-mail">
        <input id="phone" placeholder="Telefón">
        <input id="product" placeholder="Produkt alebo téma">
        <select id="subject">
          <option>Dopyt k produktu</option>
          <option>Doprava a dodanie</option>
          <option>Servis</option>
          <option>Cenová ponuka</option>
          <option>Iné</option>
        </select>
        <textarea id="message" placeholder="Napíšte správu"></textarea>
        <button type="submit">Odoslať dopyt</button>
        <div class="msg" id="msg"></div>
      </form>
    </div>

    <aside class="card info">
      <div class="info-row">
        <strong>Firma</strong>
        <span>${esc(site.companyName)}</span>
      </div>
      <div class="info-row">
        <strong>E-mail</strong>
        <a href="mailto:${esc(site.email || site.siteEmail || site.ownerEmail || "")}">${esc(site.email || site.siteEmail || site.ownerEmail || "")}</a>
      </div>
      <div class="info-row">
        <strong>Telefón</strong>
        <a href="tel:${esc(site.phone || "")}">${esc(site.phone || "")}</a>
      </div>
      <div class="info-row">
        <strong>Web</strong>
        <a href="/site/${esc(slug)}">Späť na web</a>
      </div>
    </aside>
  </section>
</main>

<footer class="footer">
  <div class="container">© ${new Date().getFullYear()} ${esc(site.companyName)} • Vytvorené cez Lech-Web</div>
</footer>

<script>
const SITE_SLUG = ${JSON.stringify(slug)};

async function sendInquiry(event) {
  event.preventDefault();

  const msg = document.getElementById("msg");
  msg.textContent = "Odosielam...";

  const payload = {
    siteSlug: SITE_SLUG,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    product: document.getElementById("product").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value
  };

  try {
    const res = await fetch("/api/inquiries/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Odoslanie zlyhalo.");

    msg.textContent = "Dopyt bol odoslaný. Číslo: " + data.inquiry.number;
    event.target.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
}
</script>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
