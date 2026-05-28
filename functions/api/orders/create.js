
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
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

function orderNumber() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `LW-${y}${m}${day}-${rnd}`;
}

function fromEmail(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}

function ownerEmail(site, env) {
  return (
    site.orderEmail ||
    site.email ||
    site.siteEmail ||
    site.ownerEmail ||
    env.CONTACT_TO ||
    "lechstav@gmail.com"
  );
}
function escapeHtml(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function orderHtml(order, title) {
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
          <h1 style="margin:0;font-size:24px">${escapeHtml(title)}</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml(order.number)}</p>
        </div>

        <div style="padding:24px">
          <h2 style="margin-top:0">Zákazník</h2>
          <p>
            <b>${escapeHtml(order.customer?.name)}</b><br>
            ${escapeHtml(order.customer?.email)}<br>
            ${escapeHtml(order.customer?.phone)}<br>
            ${escapeHtml(order.customer?.address)}
          </p>

          ${order.customer?.note ? `<p><b>Poznámka:</b><br>${escapeHtml(order.customer.note)}</p>` : ""}

          <h2>Produkty</h2>
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
            Dátum: ${escapeHtml(order.createdAt)}
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
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

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

    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatný JSON." }, 400);

    const siteSlug = clean(body.siteSlug || body.slug);
    if (!siteSlug) return j({ success: false, error: "Chýba siteSlug." }, 400);

    const site = await getJson(store, "site:" + siteSlug);
    if (!site) return j({ success: false, error: "Web neexistuje." }, 404);

    const customer = {
      name: clean(body.customer?.name || body.name),
      email: clean(body.customer?.email || body.email).toLowerCase(),
      phone: clean(body.customer?.phone || body.phone),
      address: clean(body.customer?.address || body.address),
      note: clean(body.customer?.note || body.note),
    };

    if (!customer.name) return j({ success: false, error: "Chýba meno." }, 400);
    if (!customer.email && !customer.phone) return j({ success: false, error: "Zadaj e-mail alebo telefón." }, 400);

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return j({ success: false, error: "Košík je prázdny." }, 400);

    const normalizedItems = items.map((item, index) => ({
      id: clean(item.id || "item-" + index),
      title: clean(item.title || item.name || "Produkt"),
      price: clean(item.price || ""),
      qty: Number(item.qty || 1) || 1,
      image: clean(item.image || ""),
    }));

    const order = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      number: orderNumber(),
      siteSlug,
      siteName: site.companyName || siteSlug,
      ownerEmail: site.ownerEmail || "",
      status: "new",
      customer,
      items: normalizedItems,
      source: "lech-web-public-site",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emails: {
        ownerSent: false,
        customerSent: false,
        ownerResult: null,
        customerResult: null,
      },
    };

    await putJson(store, "order:" + order.id, order);

    const siteOrdersKey = "orders:site:" + siteSlug;
    const siteOrders = (await getJson(store, siteOrdersKey)) || [];
    await putJson(store, siteOrdersKey, [order.id, ...siteOrders].slice(0, 500));

    const globalOrders = (await getJson(store, "orders:index")) || [];
    await putJson(store, "orders:index", [order.id, ...globalOrders].slice(0, 1000));

    const toOwner = ownerEmail(site, env);
    const from = fromEmail(env);

    const ownerMail = await sendResend(env, {
      from,
      to: toOwner,
      subject: `Nová objednávka ${order.number} - ${order.siteName}`,
      html: orderHtml(order, "Nová objednávka"),
      reply_to: customer.email || undefined,
    });

    order.emails.ownerSent = ownerMail.ok;
    order.emails.ownerResult = {
      status: ownerMail.status,
      data: ownerMail.data,
    };

    if (customer.email) {
      const customerMail = await sendResend(env, {
        from,
        to: customer.email,
        subject: `Potvrdenie objednávky ${order.number}`,
        html: orderHtml(order, "Ďakujeme za objednávku"),
      });

      order.emails.customerSent = customerMail.ok;
      order.emails.customerResult = {
        status: customerMail.status,
        data: customerMail.data,
      };
    }

    order.updatedAt = new Date().toISOString();
    await putJson(store, "order:" + order.id, order);

    return j({
      success: true,
      message: "Objednávka bola odoslaná.",
      order,
      emails: order.emails,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Vytvorenie objednávky zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
