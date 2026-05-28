
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin",
  };
}

function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h() });
}

function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

function fromEmail(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}

function escapeHtml(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Chýba RESEND_API_KEY." },
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

function htmlEmail(subject, message, companyName) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">${escapeHtml(subject)}</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml(companyName || "Lech-Web")}</p>
        </div>
        <div style="padding:24px;white-space:pre-line;line-height:1.6">${escapeHtml(message)}</div>
      </div>
    </div>
  `;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." }, 400);

    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const recipients = Array.isArray(body.recipients) ? body.recipients : [];
    const companyName = String(body.companyName || "").trim();

    if (!subject) return j({ success: false, error: "Chýba predmet emailu." }, 400);
    if (!message) return j({ success: false, error: "Chýba text emailu." }, 400);

    const emails = recipients
      .map((x) => String(x.email || x).trim().toLowerCase())
      .filter((x) => x && x.includes("@"));

    const unique = [...new Set(emails)].slice(0, 200);

    if (!unique.length) return j({ success: false, error: "Chýbajú príjemcovia." }, 400);

    const results = [];

    for (const to of unique) {
      const result = await sendResend(env, {
        from: fromEmail(env),
        to,
        subject,
        html: htmlEmail(subject, message, companyName),
      });

      results.push({
        to,
        sent: result.ok,
        resendStatus: result.status,
        result: result.data,
      });
    }

    return j({
      success: results.every((r) => r.sent),
      endpoint: "/api/admin/customers/mail",
      count: unique.length,
      sent: results.filter((r) => r.sent).length,
      failed: results.filter((r) => !r.sent).length,
      results,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Odoslanie info mailu zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
