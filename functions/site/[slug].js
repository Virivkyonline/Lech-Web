import { isActiveLicense } from "../api/_utils.js";

export async function onRequestGet({ params, env }) {
  const slug = String(params.slug || "").trim();
  const website = await env.DB.prepare("SELECT * FROM websites WHERE slug = ? AND published = 1").bind(slug).first();

  if (!website) return html(notFoundPage(), 404);

  const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(website.account_id).first();
  if (!isActiveLicense(account)) return html(suspendedPage(website), 402);

  return html(renderWebsite(website));
}

function renderWebsite(site) {
  const services = safeJson(site.services_json);
  return `<!doctype html>
<html lang="sk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(site.title)}</title>
  <style>
    *{box-sizing:border-box} body{margin:0;font-family:Inter,Arial,sans-serif;background:#03040a;color:#fff} .wrap{min-height:100vh;padding:28px;background:radial-gradient(circle at 10% 10%,rgba(34,211,238,.25),transparent 35%),radial-gradient(circle at 90% 20%,rgba(217,70,239,.25),transparent 35%),#03040a}.nav,.hero,.card{max-width:1120px;margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:18px 0}.brand{font-weight:900;font-size:26px}.brand span{color:#22d3ee}.cta{display:inline-block;background:#22d3ee;color:#000;padding:14px 22px;border-radius:999px;font-weight:900;text-decoration:none;box-shadow:0 0 35px rgba(34,211,238,.65)}.hero{padding:80px 0}.badge{display:inline-block;border:1px solid rgba(217,70,239,.5);background:rgba(217,70,239,.12);padding:10px 14px;border-radius:999px;color:#f0abfc;font-weight:900}.hero h1{font-size:clamp(42px,7vw,86px);line-height:.92;margin:22px 0;letter-spacing:-.05em}.hero p{max-width:720px;color:#cbd5e1;font-size:20px;line-height:1.75}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1120px;margin:30px auto}.card{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);border-radius:30px;padding:28px;box-shadow:0 0 45px rgba(34,211,238,.08)}.card strong{color:#22d3ee;font-size:20px}.contact{max-width:1120px;margin:30px auto;padding:28px;border-radius:30px;background:linear-gradient(135deg,rgba(34,211,238,.12),rgba(217,70,239,.12));border:1px solid rgba(34,211,238,.22)}@media(max-width:800px){.grid{grid-template-columns:1fr}.nav{align-items:flex-start;gap:16px;flex-direction:column}.hero{padding:45px 0}}
  </style>
</head>
<body>
  <main class="wrap">
    <nav class="nav"><div class="brand">${esc(site.title)}<span>.</span></div><a class="cta" href="mailto:${esc(site.email || "")}">${esc(site.primary_cta || "Kontakt")}</a></nav>
    <section class="hero">
      <div class="badge">${esc(site.template || "Lech-Web šablóna")}</div>
      <h1>${esc(site.headline)}</h1>
      <p>${esc(site.subheadline || "")}</p>
      <a class="cta" href="mailto:${esc(site.email || "")}">${esc(site.primary_cta || "Nezáväzný dopyt")}</a>
    </section>
    <section class="grid">
      ${(services.length ? services : ["Profesionálna prezentácia", "Rýchly kontakt", "Moderný dizajn"]).map(item => `<article class="card"><strong>${esc(item)}</strong><p>Predajný blok pripravený v systéme Lech-Web.</p></article>`).join("")}
    </section>
    <section class="contact"><h2>Kontakt</h2><p>Telefón: ${esc(site.phone || "—")}</p><p>E-mail: ${esc(site.email || "—")}</p></section>
  </main>
</body>
</html>`;
}

function suspendedPage(site) {
  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Služba pozastavená</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#03040a;color:#fff;font-family:Arial}.box{max-width:680px;padding:40px;border:1px solid rgba(244,63,94,.4);border-radius:28px;background:rgba(244,63,94,.1)}h1{font-size:44px}</style></head><body><div class="box"><h1>Služba je pozastavená</h1><p>Web ${esc(site.title)} je dočasne nedostupný, pretože licencia nie je aktívna alebo predplatné nebolo uhradené.</p></div></body></html>`;
}

function notFoundPage() {
  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Web neexistuje</title></head><body style="font-family:Arial;background:#03040a;color:white;padding:40px"><h1>Web neexistuje</h1></body></html>`;
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function safeJson(value) { try { return JSON.parse(value || "[]"); } catch { return []; } }
function esc(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
