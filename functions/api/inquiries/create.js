
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type",
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

function clean(v) {
  return String(v || "").trim();
}

function fromEmail(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}

function ownerEmail(site, env) {
  return site.inquiryEmail || site.email || site.siteEmail || site.ownerEmail || env.CONTACT_TO || "lechstav@gmail.com";
}

function escapeHtml(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inquiryNumber() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `DP-${y}${m}${day}-${rnd}`;
}

async function sendResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, status: 500, data: { error: "Chýba RESEND_API_KEY." } };
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

  return { ok: res.ok, status: res.status, data };
}

function emailHtml(inquiry) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">Nový dopyt z webu</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml(inquiry.number)}</p>
        </div>

        <div style="padding:24px">
          <h2 style="margin-top:0">Zákazník</h2>
          <p>
            <b>${escapeHtml(inquiry.customer.name)}</b><br>
            ${escapeHtml(inquiry.customer.email)}<br>
            ${escapeHtml(inquiry.customer.phone)}
          </p>

          <h2>Dopyt</h2>
          <p><b>Predmet:</b> ${escapeHtml(inquiry.subject)}</p>
          <p><b>Produkt / téma:</b> ${escapeHtml(inquiry.product)}</p>
          <p style="white-space:pre-line">${escapeHtml(inquiry.message)}</p>

          <p style="margin-top:24px;color:#64748b;font-size:13px">
            Web: ${escapeHtml(inquiry.siteName)}<br>
            Dátum: ${escapeHtml(inquiry.createdAt)}
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestPost({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 500);

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." }, 400);

    const siteSlug = clean(body.siteSlug || body.slug);
    if (!siteSlug) return j({ success: false, error: "Chýba siteSlug." }, 400);

    const site = await getJson(store, "site:" + siteSlug);
    if (!site) return j({ success: false, error: "Web neexistuje." }, 404);

    const customer = {
      name: clean(body.name || body.customer?.name),
      email: clean(body.email || body.customer?.email).toLowerCase(),
      phone: clean(body.phone || body.customer?.phone),
    };

    if (!customer.name) return j({ success: false, error: "Chýba meno." }, 400);
    if (!customer.email && !customer.phone) return j({ success: false, error: "Zadaj e-mail alebo telefón." }, 400);

    const inquiry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      number: inquiryNumber(),
      siteSlug,
      siteName: site.companyName || siteSlug,
      ownerEmail: site.ownerEmail || "",
      status: "new",
      customer,
      subject: clean(body.subject || "Dopyt z webu"),
      product: clean(body.product || ""),
      message: clean(body.message || body.note || ""),
      source: "lech-web-contact-form",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNote: "",
      email: {
        ownerSent: false,
        ownerResult: null,
        customerSent: false,
        customerResult: null,
      },
    };

    await putJson(store, "inquiry:" + inquiry.id, inquiry);

    const siteKey = "inquiries:site:" + siteSlug;
    const siteInquiries = (await getJson(store, siteKey)) || [];
    await putJson(store, siteKey, [inquiry.id, ...siteInquiries].slice(0, 500));

    const globalInquiries = (await getJson(store, "inquiries:index")) || [];
    await putJson(store, "inquiries:index", [inquiry.id, ...globalInquiries].slice(0, 1000));

    const ownerMail = await sendResend(env, {
      from: fromEmail(env),
      to: ownerEmail(site, env),
      subject: `Nový dopyt ${inquiry.number} - ${inquiry.siteName}`,
      html: emailHtml(inquiry),
      reply_to: customer.email || undefined,
    });

    inquiry.email.ownerSent = ownerMail.ok;
    inquiry.email.ownerResult = { status: ownerMail.status, data: ownerMail.data };

    if (customer.email) {
      const customerMail = await sendResend(env, {
        from: fromEmail(env),
        to: customer.email,
        subject: `Potvrdenie dopytu ${inquiry.number}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2>Ďakujeme za váš dopyt</h2>
            <p>Dobrý deň ${escapeHtml(customer.name)},</p>
            <p>váš dopyt bol prijatý. Ozveme sa vám čo najskôr.</p>
            <p><b>Číslo dopytu:</b> ${escapeHtml(inquiry.number)}</p>
            <p><b>Predmet:</b> ${escapeHtml(inquiry.subject)}</p>
          </div>
        `,
      });

      inquiry.email.customerSent = customerMail.ok;
      inquiry.email.customerResult = { status: customerMail.status, data: customerMail.data };
    }

    inquiry.updatedAt = new Date().toISOString();
    await putJson(store, "inquiry:" + inquiry.id, inquiry);

    return j({
      success: true,
      message: "Dopyt bol odoslaný.",
      inquiry,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Odoslanie dopytu zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
