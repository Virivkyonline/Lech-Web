
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

function kv(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}

async function getJson(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function putJson(store, key, value) {
  await store.put(key, JSON.stringify(value));
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

function replyHtml(inquiry, replyText) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">Odpoveď na váš dopyt</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml(inquiry.number)}</p>
        </div>

        <div style="padding:24px">
          <p>Dobrý deň ${escapeHtml(inquiry.customer?.name)},</p>

          <div style="white-space:pre-line;line-height:1.6;font-size:15px">
            ${escapeHtml(replyText)}
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">

          <p style="color:#64748b;font-size:13px">
            Pôvodný dopyt:<br>
            <b>${escapeHtml(inquiry.subject)}</b><br>
            ${escapeHtml(inquiry.message)}
          </p>
        </div>
      </div>
    </div>
  `;
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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestPost({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 500);
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." }, 400);

    const id = String(body.id || body.inquiryId || "").trim();
    const replyText = String(body.replyText || body.message || "").trim();

    if (!id) return j({ success: false, error: "Chýba ID dopytu." }, 400);
    if (!replyText) return j({ success: false, error: "Chýba text odpovede." }, 400);

    const inquiry = await getJson(store, "inquiry:" + id);
    if (!inquiry) return j({ success: false, error: "Dopyt neexistuje." }, 404);

    if (!inquiry.customer?.email) {
      return j({ success: false, error: "Dopyt nemá e-mail zákazníka." }, 400);
    }

    const result = await sendResend(env, {
      from: fromEmail(env),
      to: inquiry.customer.email,
      subject: `Odpoveď na dopyt ${inquiry.number}`,
      html: replyHtml(inquiry, replyText),
    });

    const now = new Date().toISOString();

    const replies = Array.isArray(inquiry.replies) ? inquiry.replies : [];
    replies.unshift({
      at: now,
      text: replyText,
      sent: result.ok,
      resendStatus: result.status,
      result: result.data,
      source: "admin",
    });

    inquiry.replies = replies.slice(0, 50);
    inquiry.status = "contacted";
    inquiry.updatedAt = now;

    const history = Array.isArray(inquiry.history) ? inquiry.history : [];
    history.unshift({
      at: now,
      status: "contacted",
      note: "Odoslaná odpoveď zákazníkovi.",
      emailSent: result.ok,
      emailResult: { status: result.status, data: result.data },
      source: "admin",
    });
    inquiry.history = history.slice(0, 50);

    await putJson(store, "inquiry:" + id, inquiry);

    return j({
      success: result.ok,
      message: result.ok ? "Odpoveď bola odoslaná." : "Odpoveď sa nepodarilo odoslať.",
      inquiry,
      email: {
        sent: result.ok,
        resendStatus: result.status,
        result: result.data,
      },
    }, result.ok ? 200 : 500);
  } catch (e) {
    return j({
      success: false,
      error: "Odoslanie odpovede zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
