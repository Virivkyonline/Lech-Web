
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

function statusText(s) {
  return {
    new: "Nový",
    contacted: "Kontaktovaný",
    closed: "Vyriešený",
    spam: "Spam",
  }[s] || s || "Nový";
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
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dopyty | ${esc(site.companyName)}</title>
<style>
body{margin:0;font-family:Arial,sans-serif;background:#020617;color:white;display:grid;place-items:center;min-height:100vh}
.card{width:min(420px,calc(100% - 32px));border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#0f172a;padding:28px}
input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.15);background:#020617;color:white;border-radius:14px;padding:14px;margin:12px 0}
button{width:100%;border:0;background:#67e8f9;color:#020617;border-radius:14px;padding:14px;font-weight:900}
</style>
</head>
<body>
<form class="card" onsubmit="event.preventDefault(); location.search='?pin='+encodeURIComponent(document.getElementById('pin').value)">
<h1>Admin dopyty</h1>
<p>Zadaj ADMIN_PIN.</p>
<input id="pin" placeholder="ADMIN_PIN" type="password">
<button>Otvoriť</button>
</form>
</body>
</html>`;
    return new Response(loginHtml, { headers: h() });
  }

  const index = (await getJson(store, "inquiries:site:" + slug)) || [];
  const inquiries = [];
  for (const id of index.slice(0, 100)) {
    const inquiry = await getJson(store, "inquiry:" + id);
    if (inquiry) inquiries.push(inquiry);
  }

  const a = accent(site);

  const rows = inquiries.map((x) => `
    <tr onclick="openDetail('${esc(x.id)}')" data-id="${esc(x.id)}">
      <td><b>${esc(x.number)}</b></td>
      <td>${esc(x.customer?.name)}</td>
      <td>${esc(x.customer?.email || x.customer?.phone)}</td>
      <td>${esc(x.subject)}</td>
      <td><span class="pill">${esc(statusText(x.status))}</span></td>
      <td>${esc((x.createdAt || "").slice(0,10))}</td>
    </tr>
  `).join("");

  const details = inquiries.map((x) => {
    const replyHistory = (x.replies || []).map((r) => `
      <div class="reply">
        <b>${esc((r.at || "").replace("T"," ").slice(0,16))}</b>
        <span>${r.sent ? "odoslané" : "chyba"}</span>
        <p>${esc(r.text)}</p>
      </div>
    `).join("");

    return `
      <section class="detail" id="detail-${esc(x.id)}">
        <h2>${esc(x.number)}</h2>
        <div class="box">
          <b>${esc(x.customer?.name)}</b><br>
          ${esc(x.customer?.email)}<br>
          ${esc(x.customer?.phone)}
        </div>

        <div class="box">
          <b>Predmet:</b> ${esc(x.subject)}<br>
          <b>Produkt / téma:</b> ${esc(x.product)}<br><br>
          <div class="message">${esc(x.message)}</div>
        </div>

        <label>Stav</label>
        <select id="status-${esc(x.id)}">
          <option value="new" ${x.status === "new" ? "selected" : ""}>Nový</option>
          <option value="contacted" ${x.status === "contacted" ? "selected" : ""}>Kontaktovaný</option>
          <option value="closed" ${x.status === "closed" ? "selected" : ""}>Vyriešený</option>
          <option value="spam" ${x.status === "spam" ? "selected" : ""}>Spam</option>
        </select>

        <label>Interná poznámka</label>
        <textarea id="note-${esc(x.id)}">${esc(x.adminNote || "")}</textarea>

        <button onclick="saveInquiry('${esc(x.id)}')">Uložiť dopyt</button>

        <hr>

        <h3>Odpovedať zákazníkovi</h3>
        <textarea id="reply-${esc(x.id)}" placeholder="Napíš odpoveď zákazníkovi..."></textarea>
        <button onclick="replyInquiry('${esc(x.id)}')">Poslať odpoveď emailom</button>

        <div class="msg" id="msg-${esc(x.id)}"></div>

        <h3>História odpovedí</h3>
        ${replyHistory || `<p class="empty-small">Zatiaľ nebola odoslaná odpoveď.</p>`}
      </section>
    `;
  }).join("");

  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dopyty | ${esc(site.companyName)}</title>
<style>
:root{--a:${a};--line:rgba(255,255,255,.12);--muted:#cbd5e1}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at top left,color-mix(in srgb,var(--a) 20%,transparent),transparent 30%),#020617;color:white}
a{text-decoration:none;color:inherit}
.top{height:72px;border-bottom:1px solid var(--line);background:rgba(15,23,42,.86);display:flex;align-items:center;justify-content:space-between;padding:0 22px;position:sticky;top:0;z-index:20;backdrop-filter:blur(14px)}
.logo{font-size:22px;font-weight:950}
.nav{display:flex;gap:12px}
.nav a{border:1px solid var(--line);border-radius:12px;padding:10px 13px;color:var(--muted)}
.page{width:min(1400px,calc(100% - 32px));margin:24px auto;display:grid;grid-template-columns:1fr 450px;gap:20px}
.card{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:22px}
h1,h2,h3{margin-top:0}
table{width:100%;border-collapse:collapse}
th,td{padding:13px;border-bottom:1px solid var(--line);text-align:left}
th{color:var(--muted);font-size:13px}
tr{cursor:pointer}
tr:hover{background:rgba(255,255,255,.05)}
.pill{display:inline-flex;border:1px solid var(--a);color:var(--a);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900}
.detail{display:none}
.detail.open{display:block}
.box{border:1px solid var(--line);border-radius:16px;background:#020617;padding:14px;margin:12px 0;color:var(--muted);line-height:1.5}
.message{white-space:pre-line;color:white}
label{display:block;font-weight:900;margin:14px 0 7px}
select,textarea{width:100%;border:1px solid var(--line);background:#020617;color:white;border-radius:14px;padding:13px}
textarea{min-height:130px}
button{margin-top:14px;border:0;background:var(--a);color:#020617;border-radius:14px;padding:14px 18px;font-weight:950;cursor:pointer}
.msg{margin-top:12px;color:var(--a);font-weight:900}
.empty{color:var(--muted);padding:30px;text-align:center}
.empty-small{color:var(--muted)}
hr{border:0;border-top:1px solid var(--line);margin:22px 0}
.reply{border:1px solid var(--line);border-radius:14px;background:#020617;padding:12px;margin:10px 0;color:var(--muted)}
.reply span{float:right;color:var(--a);font-size:12px;font-weight:900}
.reply p{white-space:pre-line;color:white}
@media(max-width:900px){.page{grid-template-columns:1fr}.nav{display:none}}
</style>
</head>
<body>
<header class="top">
  <a class="logo" href="/site/${esc(slug)}">${esc(site.companyName)} — Dopyty</a>
  <nav class="nav">
    <a href="/site/${esc(slug)}">Verejný web</a>
    <a href="/site/${esc(slug)}/kontakt">Kontakt formulár</a>
  </nav>
</header>

<main class="page">
  <section class="card">
    <h1>Dopyty z webu</h1>
    ${inquiries.length ? `
      <table>
        <thead>
          <tr>
            <th>Číslo</th>
            <th>Meno</th>
            <th>Kontakt</th>
            <th>Predmet</th>
            <th>Stav</th>
            <th>Dátum</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    ` : `<div class="empty">Zatiaľ nie sú žiadne dopyty.</div>`}
  </section>

  <aside class="card">
    ${details || `<h2>Detail</h2><p class="empty">Vyber dopyt.</p>`}
  </aside>
</main>

<script>
const PIN = ${JSON.stringify(suppliedPin)};

function openDetail(id) {
  document.querySelectorAll(".detail").forEach((el) => el.classList.remove("open"));
  const el = document.getElementById("detail-" + id);
  if (el) el.classList.add("open");
}

async function saveInquiry(id) {
  const msg = document.getElementById("msg-" + id);
  msg.textContent = "Ukladám...";

  try {
    const res = await fetch("/api/admin/inquiries/update?pin=" + encodeURIComponent(PIN), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        status: document.getElementById("status-" + id).value,
        adminNote: document.getElementById("note-" + id).value
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Uloženie zlyhalo.");

    msg.textContent = "Uložené.";
  } catch (err) {
    msg.textContent = err.message;
  }
}

async function replyInquiry(id) {
  const msg = document.getElementById("msg-" + id);
  const text = document.getElementById("reply-" + id).value;

  if (!text.trim()) {
    msg.textContent = "Napíš odpoveď.";
    return;
  }

  msg.textContent = "Odosielam odpoveď...";

  try {
    const res = await fetch("/api/admin/inquiries/reply?pin=" + encodeURIComponent(PIN), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        replyText: text
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Odoslanie zlyhalo.");

    msg.textContent = "Odpoveď odoslaná.";
    setTimeout(() => location.reload(), 900);
  } catch (err) {
    msg.textContent = err.message;
  }
}

const first = document.querySelector(".detail");
if (first) first.classList.add("open");
</script>
</body>
</html>`;

  return new Response(html, { headers: h() });
}
