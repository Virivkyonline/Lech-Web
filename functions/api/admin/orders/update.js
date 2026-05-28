
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
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

function statusText(status) {
  const map = {
    new: "Nová objednávka",
    processing: "Objednávka sa vybavuje",
    done: "Objednávka bola vybavená",
    canceled: "Objednávka bola zrušená",
  };
  return map[status] || status || "Zmena objednávky";
}

function escapeHtml(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailHtml(order, status, note) {
  const items = (order.items || [])
    .map((x) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml(x.title)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${escapeHtml(x.qty)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${escapeHtml(x.price)}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">${escapeHtml(statusText(status))}</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">Objednávka ${escapeHtml(order.number)}</p>
        </div>

        <div style="padding:24px">
          <p>Dobrý deň,</p>
          <p>stav vašej objednávky bol zmenený na:</p>
          <p style="font-size:20px;font-weight:bold;color:#0f172a">${escapeHtml(statusText(status))}</p>

          ${note ? `<p><b>Poznámka predajcu:</b><br>${escapeHtml(note)}</p>` : ""}

          <h2 style="margin-top:24px">Objednané produkty</h2>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;padding:10px;border-bottom:2px solid #e5e7eb">Produkt</th>
                <th style="text-align:center;padding:10px;border-bottom:2px solid #e5e7eb">Ks</th>
                <th style="text-align:right;padding:10px;border-bottom:2px solid #e5e7eb">Cena</th>
              </tr>
            </thead>
            <tbody>${items}</tbody>
          </table>

          <p style="margin-top:24px;color:#64748b;font-size:13px">
            Web: ${escapeHtml(order.siteName)}<br>
            Dátum zmeny: ${escapeHtml(new Date().toISOString())}
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

    const id = String(body.id || body.orderId || "").trim();
    if (!id) return j({ success: false, error: "Chýba ID objednávky." }, 400);

    const order = await getJson(store, "order:" + id);
    if (!order) return j({ success: false, error: "Objednávka neexistuje." }, 404);

    const previousStatus = order.status;
    const allowed = new Set(["new", "processing", "done", "canceled"]);

    if (body.status && allowed.has(String(body.status))) {
      order.status = String(body.status);
    }

    if ("adminNote" in body) {
      order.adminNote = String(body.adminNote || "");
    }

    const notifyCustomer = body.notifyCustomer !== false;
    let statusEmail = null;

    if (
      notifyCustomer &&
      order.customer?.email &&
      order.status &&
      previousStatus !== order.status
    ) {
      statusEmail = await sendResend(env, {
        from: fromEmail(env),
        to: order.customer.email,
        subject: `${statusText(order.status)} - objednávka ${order.number}`,
        html: emailHtml(order, order.status, order.adminNote || ""),
      });
    }

    order.updatedAt = new Date().toISOString();

    const history = Array.isArray(order.history) ? order.history : [];
    history.unshift({
      at: order.updatedAt,
      previousStatus,
      status: order.status,
      note: String(order.adminNote || ""),
      notifyCustomer,
      emailSent: statusEmail ? statusEmail.ok : false,
      emailResult: statusEmail ? { status: statusEmail.status, data: statusEmail.data } : null,
      source: "admin",
    });
    order.history = history.slice(0, 50);

    await putJson(store, "order:" + id, order);

    return j({
      success: true,
      message: "Objednávka bola aktualizovaná.",
      order,
      statusEmail: statusEmail ? {
        sent: statusEmail.ok,
        resendStatus: statusEmail.status,
        result: statusEmail.data,
      } : null,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Aktualizácia objednávky zlyhala.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
