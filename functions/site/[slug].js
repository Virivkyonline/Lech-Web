
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

export async function onRequestGet({ params, env }) {
  const store = kv(env);
  if (!store) return new Response("KV nie je nastavene.", { status: 500 });

  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson(store, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });

  const acc = await getJson(store, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!active(acc)) return new Response("Web je pozastaveny. Licencia nie je aktivna.", { status: 402 });

  const services = (site.services || []).map((s) => `<li>${esc(s)}</li>`).join("");

  const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(site.companyName)}</title><style>
body{margin:0;background:#03040a;color:white;font-family:Arial,sans-serif}
.wrap{min-height:100vh;display:grid;place-items:center;padding:40px;background:radial-gradient(circle at 20% 20%,rgba(34,211,238,.28),transparent 32%),radial-gradient(circle at 80% 25%,rgba(217,70,239,.28),transparent 32%),#03040a}
.card{max-width:1050px;border:1px solid rgba(34,211,238,.35);border-radius:36px;padding:46px;background:rgba(0,0,0,.58);box-shadow:0 0 80px rgba(34,211,238,.22)}
.badge{display:inline-block;background:#67e8f9;color:#000;border-radius:999px;padding:10px 14px;font-weight:900}
h1{font-size:clamp(40px,7vw,86px);line-height:.94;margin:26px 0}
p{font-size:20px;line-height:1.7;color:#cbd5e1}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:30px}
.box{border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:18px;background:rgba(255,255,255,.06)}
a{display:inline-block;margin-top:30px;background:#67e8f9;color:#000;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:900;box-shadow:0 0 35px rgba(34,211,238,.75)}
</style></head><body><main class="wrap"><section class="card"><span class="badge">${esc(site.template || "Lech-Web")}</span><h1>${esc(site.headline || site.companyName)}</h1><p>${esc(site.description || "Moderný web vytvorený cez Lech-Web.")}</p><div class="grid">${services ? `<div class="box"><strong>Služby</strong><ul>${services}</ul></div>` : ""}<div class="box"><strong>Kontakt</strong><p>${esc(site.phone)}<br>${esc(site.email)}</p></div></div><a href="mailto:${esc(site.email)}">Kontaktovať firmu</a></section></main></body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
