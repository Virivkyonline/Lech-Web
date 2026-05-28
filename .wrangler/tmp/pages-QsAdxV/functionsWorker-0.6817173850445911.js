var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/admin/customers/mail.js
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h, "h");
function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h() });
}
__name(j, "j");
function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk, "adminOk");
function fromEmail(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}
__name(fromEmail, "fromEmail");
function escapeHtml(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(escapeHtml, "escapeHtml");
async function sendResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Ch\xFDba RESEND_API_KEY." }
    };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
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
    data
  };
}
__name(sendResend, "sendResend");
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
__name(htmlEmail, "htmlEmail");
async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}
__name(onRequestOptions, "onRequestOptions");
async function onRequestPost({ request, env }) {
  try {
    if (!adminOk(request, env)) return j({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return j({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const recipients = Array.isArray(body.recipients) ? body.recipients : [];
    const companyName = String(body.companyName || "").trim();
    if (!subject) return j({ success: false, error: "Ch\xFDba predmet emailu." }, 400);
    if (!message) return j({ success: false, error: "Ch\xFDba text emailu." }, 400);
    const emails = recipients.map((x) => String(x.email || x).trim().toLowerCase()).filter((x) => x && x.includes("@"));
    const unique = [...new Set(emails)].slice(0, 200);
    if (!unique.length) return j({ success: false, error: "Ch\xFDbaj\xFA pr\xEDjemcovia." }, 400);
    const results = [];
    for (const to of unique) {
      const result = await sendResend(env, {
        from: fromEmail(env),
        to,
        subject,
        html: htmlEmail(subject, message, companyName)
      });
      results.push({
        to,
        sent: result.ok,
        resendStatus: result.status,
        result: result.data
      });
    }
    return j({
      success: results.every((r) => r.sent),
      endpoint: "/api/admin/customers/mail",
      count: unique.length,
      sent: results.filter((r) => r.sent).length,
      failed: results.filter((r) => !r.sent).length,
      results
    });
  } catch (e) {
    return j({
      success: false,
      error: "Odoslanie info mailu zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost, "onRequestPost");

// api/admin/inquiries/reply.js
function h2() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h2, "h");
function j2(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h2() });
}
__name(j2, "j");
function kv(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv, "kv");
async function getJson(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson, "getJson");
async function putJson(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson, "putJson");
function adminOk2(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk2, "adminOk");
function fromEmail2(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}
__name(fromEmail2, "fromEmail");
function escapeHtml2(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(escapeHtml2, "escapeHtml");
function replyHtml(inquiry, replyText) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">Odpove\u010F na v\xE1\u0161 dopyt</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml2(inquiry.number)}</p>
        </div>

        <div style="padding:24px">
          <p>Dobr\xFD de\u0148 ${escapeHtml2(inquiry.customer?.name)},</p>

          <div style="white-space:pre-line;line-height:1.6;font-size:15px">
            ${escapeHtml2(replyText)}
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">

          <p style="color:#64748b;font-size:13px">
            P\xF4vodn\xFD dopyt:<br>
            <b>${escapeHtml2(inquiry.subject)}</b><br>
            ${escapeHtml2(inquiry.message)}
          </p>
        </div>
      </div>
    </div>
  `;
}
__name(replyHtml, "replyHtml");
async function sendResend2(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Ch\xFDba RESEND_API_KEY." }
    };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
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
    data
  };
}
__name(sendResend2, "sendResend");
async function onRequestOptions2() {
  return new Response(null, { status: 204, headers: h2() });
}
__name(onRequestOptions2, "onRequestOptions");
async function onRequestPost2({ request, env }) {
  try {
    const store3 = kv(env);
    if (!store3) return j2({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk2(request, env)) return j2({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return j2({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const id = String(body.id || body.inquiryId || "").trim();
    const replyText = String(body.replyText || body.message || "").trim();
    if (!id) return j2({ success: false, error: "Ch\xFDba ID dopytu." }, 400);
    if (!replyText) return j2({ success: false, error: "Ch\xFDba text odpovede." }, 400);
    const inquiry = await getJson(store3, "inquiry:" + id);
    if (!inquiry) return j2({ success: false, error: "Dopyt neexistuje." }, 404);
    if (!inquiry.customer?.email) {
      return j2({ success: false, error: "Dopyt nem\xE1 e-mail z\xE1kazn\xEDka." }, 400);
    }
    const result = await sendResend2(env, {
      from: fromEmail2(env),
      to: inquiry.customer.email,
      subject: `Odpove\u010F na dopyt ${inquiry.number}`,
      html: replyHtml(inquiry, replyText)
    });
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const replies = Array.isArray(inquiry.replies) ? inquiry.replies : [];
    replies.unshift({
      at: now,
      text: replyText,
      sent: result.ok,
      resendStatus: result.status,
      result: result.data,
      source: "admin"
    });
    inquiry.replies = replies.slice(0, 50);
    inquiry.status = "contacted";
    inquiry.updatedAt = now;
    const history = Array.isArray(inquiry.history) ? inquiry.history : [];
    history.unshift({
      at: now,
      status: "contacted",
      note: "Odoslan\xE1 odpove\u010F z\xE1kazn\xEDkovi.",
      emailSent: result.ok,
      emailResult: { status: result.status, data: result.data },
      source: "admin"
    });
    inquiry.history = history.slice(0, 50);
    await putJson(store3, "inquiry:" + id, inquiry);
    return j2({
      success: result.ok,
      message: result.ok ? "Odpove\u010F bola odoslan\xE1." : "Odpove\u010F sa nepodarilo odosla\u0165.",
      inquiry,
      email: {
        sent: result.ok,
        resendStatus: result.status,
        result: result.data
      }
    }, result.ok ? 200 : 500);
  } catch (e) {
    return j2({
      success: false,
      error: "Odoslanie odpovede zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost2, "onRequestPost");

// api/admin/inquiries/update.js
function h3() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h3, "h");
function j3(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h3() });
}
__name(j3, "j");
function kv2(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv2, "kv");
async function getJson2(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson2, "getJson");
async function putJson2(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson2, "putJson");
function adminOk3(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk3, "adminOk");
async function onRequestOptions3() {
  return new Response(null, { status: 204, headers: h3() });
}
__name(onRequestOptions3, "onRequestOptions");
async function onRequestPost3({ request, env }) {
  try {
    const store3 = kv2(env);
    if (!store3) return j3({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk3(request, env)) return j3({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return j3({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const id = String(body.id || body.inquiryId || "").trim();
    if (!id) return j3({ success: false, error: "Ch\xFDba ID dopytu." }, 400);
    const inquiry = await getJson2(store3, "inquiry:" + id);
    if (!inquiry) return j3({ success: false, error: "Dopyt neexistuje." }, 404);
    const allowed = /* @__PURE__ */ new Set(["new", "contacted", "closed", "spam"]);
    if (body.status && allowed.has(String(body.status))) inquiry.status = String(body.status);
    if ("adminNote" in body) inquiry.adminNote = String(body.adminNote || "");
    inquiry.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const history = Array.isArray(inquiry.history) ? inquiry.history : [];
    history.unshift({
      at: inquiry.updatedAt,
      status: inquiry.status,
      note: inquiry.adminNote,
      source: "admin"
    });
    inquiry.history = history.slice(0, 50);
    await putJson2(store3, "inquiry:" + id, inquiry);
    return j3({
      success: true,
      message: "Dopyt bol aktualizovan\xFD.",
      inquiry
    });
  } catch (e) {
    return j3({
      success: false,
      error: "Aktualiz\xE1cia dopytu zlyhala.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost3, "onRequestPost");

// api/admin/modules/defaults.js
function h4() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h4, "h");
function j4(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h4() });
}
__name(j4, "j");
function webMainDefaults() {
  return {
    source: "Web-main.zip",
    version: "lech-web-webmain-modules-foundation-v1",
    titlePage: {
      enabled: true,
      heroTitle: "",
      heroSubtitle: "",
      button1Text: "Pozrie\u0165 produkty",
      button1Url: "#produkty",
      button2Text: "Kontakt",
      button2Url: "#kontakt",
      heroImage: "",
      featuredCategories: [],
      topProducts: [],
      seoTitle: "",
      seoText: "",
      actionBlock: {
        enabled: true,
        title: "Akciov\xE1 ponuka",
        text: "Vybran\xE9 produkty m\xE1me pripraven\xE9 skladom alebo s r\xFDchlym dodan\xEDm.",
        buttonText: "Zobrazi\u0165 akcie",
        buttonUrl: "#produkty"
      },
      contactBlock: {
        enabled: true,
        title: "Potrebujete poradi\u0165?",
        phone: "",
        email: ""
      }
    },
    banners: {
      enabled: true,
      main: [],
      carousel: [],
      advantages: [
        { title: "Dar\u010Dek zdarma", text: "Ku ka\u017Edej objedn\xE1vke.", icon: "\u2726", visible: true },
        { title: "R\xFDchle dodanie", text: "Pre produkty skladom.", icon: "\u21BB", visible: true },
        { title: "Na spl\xE1tky", text: "R\xFDchlo a bezpe\u010Dne.", icon: "\u2713", visible: true },
        { title: "Doprava zdarma", text: "Pod\u013Ea podmienok predajcu.", icon: "\u2302", visible: true }
      ]
    },
    menuSettings: {
      enabled: true,
      items: [
        { title: "Produkty", url: "#produkty", type: "internal", visible: true, mobile: true, submenu: [] },
        { title: "Akcie", url: "#produkty", type: "internal", visible: true, mobile: true, submenu: [] },
        { title: "Ako nakupova\u0165", url: "#info", type: "internal", visible: true, mobile: true, submenu: [] },
        { title: "Kontakt", url: "#kontakt", type: "internal", visible: true, mobile: true, submenu: [] }
      ]
    },
    links: {
      enabled: true,
      items: [
        { title: "Ako nakupova\u0165", url: "#info", type: "internal", visible: true, footer: true, menu: false, newWindow: false },
        { title: "Obchodn\xE9 podmienky", url: "#", type: "document", visible: true, footer: true, menu: false, newWindow: false },
        { title: "Ochrana osobn\xFDch \xFAdajov", url: "#", type: "document", visible: true, footer: true, menu: false, newWindow: false }
      ],
      quickLinks: []
    },
    icons: {
      enabled: true,
      items: [
        { title: "Servis", code: "service", type: "svg", url: "", visible: true, usage: ["advantages"], description: "Ikona pre servis a podporu." },
        { title: "Doprava", code: "delivery", type: "svg", url: "", visible: true, usage: ["advantages"], description: "Ikona pre dopravu." }
      ]
    },
    cookies: {
      enabled: true,
      mode: "basic",
      acceptText: "S\xFAhlas\xEDm",
      settingsText: "Nastavenia",
      bannerText: "Pou\u017E\xEDvame cookies, aby sme v\xE1m zabezpe\u010Dili \u010Do najlep\u0161\xED z\xE1\u017Eitok na webe.",
      position: "bottom",
      backgroundColor: "#020617",
      textColor: "#ffffff",
      buttonColor: "#67e8f9",
      privacyUrl: "#",
      cookiesUrl: "#",
      consentDays: 180,
      allowRejectAnalytics: true,
      allowRejectMarketing: true,
      showFooterSettingsLink: true
    },
    categoriesAdvanced: {
      enabled: true,
      items: [
        { title: "Hlavn\xE1 kateg\xF3ria", url: "#produkty", type: "normal", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
        { title: "Ak\u010Dn\xFD tovar", url: "#produkty", type: "normal", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
        { title: "Novinky", url: "#produkty", type: "normal", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true }
      ]
    },
    productsAdvanced: {
      enabled: true,
      filters: {
        code: true,
        category: true,
        visibility: true,
        flags: true,
        availability: true
      },
      flags: ["Akcia", "Novinka", "Tip", "Viac farieb skladom", "V\xFDpredaj"],
      availability: ["Skladom", "Na objedn\xE1vku", "Vypredan\xE9"],
      vatRates: ["0", "10", "20", "23"],
      galleryEnabled: true,
      relatedProductsEnabled: true,
      youtubeVideoEnabled: true
    },
    customerFields: {
      enabled: true,
      billing: {
        name: "required",
        street: "optional",
        houseNumber: "optional",
        city: "optional",
        district: "hidden",
        zip: "optional",
        country: "optional"
      },
      company: {
        companyEnabled: "optional",
        companyName: "optional",
        ico: "optional",
        icDph: "optional",
        dic: "optional"
      },
      contact: {
        phone: "required",
        email: "required",
        birthDate: "hidden",
        marketingConsent: "optional"
      },
      delivery: {
        enabled: "optional",
        name: "optional",
        street: "optional",
        houseNumber: "optional",
        city: "optional",
        zip: "optional",
        country: "optional"
      }
    },
    documents: {
      enabled: true,
      orders: {
        prefix: "OBJ",
        numberLength: 10,
        startFrom: 1,
        syncWithOrder: true
      },
      proformaInvoices: {
        prefix: "ZF",
        numberLength: 10,
        startFrom: 1,
        depositPercent: 50,
        syncVsWithOrder: true
      },
      invoices: {
        prefix: "FA",
        numberLength: 10,
        startFrom: 1,
        showWarranty: true,
        showQrCode: true
      },
      creditNotes: {
        prefix: "DBP",
        numberLength: 10,
        startFrom: 1,
        autoRestockItems: false
      },
      deliveryNotes: {
        prefix: "DL",
        numberLength: 10,
        startFrom: 1,
        printBarcodes: false
      },
      export: {
        isdoc: false,
        moneyS3: false
      },
      visual: {
        logo: "",
        stamp: ""
      }
    },
    adminDashboard: {
      enabled: true,
      cards: ["Dne\u0161n\xE9 predaje", "Dne\u0161n\xE9 objedn\xE1vky", "T\xFD\u017Ede\u0148", "Mesiac", "Rok"],
      recentOrders: true,
      charts: true
    }
  };
}
__name(webMainDefaults, "webMainDefaults");
async function onRequestOptions4() {
  return new Response(null, { status: 204, headers: h4() });
}
__name(onRequestOptions4, "onRequestOptions");
async function onRequestGet() {
  return j4({
    success: true,
    mode: "webmain-default-modules",
    modules: webMainDefaults()
  });
}
__name(onRequestGet, "onRequestGet");

// api/admin/modules/save.js
function h5() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h5, "h");
function j5(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h5() });
}
__name(j5, "j");
function kv3(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv3, "kv");
async function getJson3(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson3, "getJson");
async function putJson3(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson3, "putJson");
function adminOk4(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk4, "adminOk");
function slugify(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify, "slugify");
async function onRequestOptions5() {
  return new Response(null, { status: 204, headers: h5() });
}
__name(onRequestOptions5, "onRequestOptions");
async function onRequestPost4({ request, env }) {
  try {
    const store3 = kv3(env);
    if (!store3) return j5({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk4(request, env)) return j5({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return j5({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const email3 = String(body.email || body.accountEmail || "").trim().toLowerCase();
    const slug = slugify(body.slug || body.siteSlug || "");
    let account = null;
    let site = null;
    if (email3) {
      account = await getJson3(store3, "user:" + email3);
      if (!account) return j5({ success: false, error: "\xDA\u010Det neexistuje." }, 404);
      site = account.website || null;
    }
    if (!site && slug) {
      site = await getJson3(store3, "site:" + slug);
    }
    if (!site) return j5({ success: false, error: "Web sa nena\u0161iel." }, 404);
    const modules = body.modules && typeof body.modules === "object" ? body.modules : {};
    site.modules = {
      ...site.modules || {},
      ...modules,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const siteSlug = slugify(site.slug || slug || site.companyName || email3);
    site.slug = siteSlug;
    await putJson3(store3, "site:" + siteSlug, site);
    if (account) {
      account.website = site;
      account.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await putJson3(store3, "user:" + account.email, account);
      await putJson3(store3, "account:" + account.id, account);
    }
    return j5({
      success: true,
      message: "Moduly zo star\xE9ho Web-main ulo\u017Een\xE9.",
      siteSlug,
      modules: site.modules
    });
  } catch (e) {
    return j5({
      success: false,
      error: "Ulo\u017Eenie modulov zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost4, "onRequestPost");

// api/admin/orders/update.js
function h6() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h6, "h");
function j6(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h6() });
}
__name(j6, "j");
function kv4(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv4, "kv");
async function getJson4(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson4, "getJson");
async function putJson4(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson4, "putJson");
function adminOk5(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk5, "adminOk");
function fromEmail3(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}
__name(fromEmail3, "fromEmail");
function statusText(status) {
  const map = {
    new: "Nov\xE1 objedn\xE1vka",
    processing: "Objedn\xE1vka sa vybavuje",
    done: "Objedn\xE1vka bola vybaven\xE1",
    canceled: "Objedn\xE1vka bola zru\u0161en\xE1"
  };
  return map[status] || status || "Zmena objedn\xE1vky";
}
__name(statusText, "statusText");
function escapeHtml3(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(escapeHtml3, "escapeHtml");
function emailHtml(order, status, note) {
  const items = (order.items || []).map((x) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml3(x.title)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${escapeHtml3(x.qty)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${escapeHtml3(x.price)}</td>
      </tr>
    `).join("");
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">${escapeHtml3(statusText(status))}</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">Objedn\xE1vka ${escapeHtml3(order.number)}</p>
        </div>

        <div style="padding:24px">
          <p>Dobr\xFD de\u0148,</p>
          <p>stav va\u0161ej objedn\xE1vky bol zmenen\xFD na:</p>
          <p style="font-size:20px;font-weight:bold;color:#0f172a">${escapeHtml3(statusText(status))}</p>

          ${note ? `<p><b>Pozn\xE1mka predajcu:</b><br>${escapeHtml3(note)}</p>` : ""}

          <h2 style="margin-top:24px">Objednan\xE9 produkty</h2>
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
            Web: ${escapeHtml3(order.siteName)}<br>
            D\xE1tum zmeny: ${escapeHtml3((/* @__PURE__ */ new Date()).toISOString())}
          </p>
        </div>
      </div>
    </div>
  `;
}
__name(emailHtml, "emailHtml");
async function sendResend3(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Ch\xFDba RESEND_API_KEY." }
    };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
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
    data
  };
}
__name(sendResend3, "sendResend");
async function onRequestOptions6() {
  return new Response(null, { status: 204, headers: h6() });
}
__name(onRequestOptions6, "onRequestOptions");
async function onRequestPost5({ request, env }) {
  try {
    const store3 = kv4(env);
    if (!store3) return j6({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk5(request, env)) return j6({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return j6({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const id = String(body.id || body.orderId || "").trim();
    if (!id) return j6({ success: false, error: "Ch\xFDba ID objedn\xE1vky." }, 400);
    const order = await getJson4(store3, "order:" + id);
    if (!order) return j6({ success: false, error: "Objedn\xE1vka neexistuje." }, 404);
    const previousStatus = order.status;
    const allowed = /* @__PURE__ */ new Set(["new", "processing", "done", "canceled"]);
    if (body.status && allowed.has(String(body.status))) {
      order.status = String(body.status);
    }
    if ("adminNote" in body) {
      order.adminNote = String(body.adminNote || "");
    }
    const notifyCustomer = body.notifyCustomer !== false;
    let statusEmail = null;
    if (notifyCustomer && order.customer?.email && order.status && previousStatus !== order.status) {
      statusEmail = await sendResend3(env, {
        from: fromEmail3(env),
        to: order.customer.email,
        subject: `${statusText(order.status)} - objedn\xE1vka ${order.number}`,
        html: emailHtml(order, order.status, order.adminNote || "")
      });
    }
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const history = Array.isArray(order.history) ? order.history : [];
    history.unshift({
      at: order.updatedAt,
      previousStatus,
      status: order.status,
      note: String(order.adminNote || ""),
      notifyCustomer,
      emailSent: statusEmail ? statusEmail.ok : false,
      emailResult: statusEmail ? { status: statusEmail.status, data: statusEmail.data } : null,
      source: "admin"
    });
    order.history = history.slice(0, 50);
    await putJson4(store3, "order:" + id, order);
    return j6({
      success: true,
      message: "Objedn\xE1vka bola aktualizovan\xE1.",
      order,
      statusEmail: statusEmail ? {
        sent: statusEmail.ok,
        resendStatus: statusEmail.status,
        result: statusEmail.data
      } : null
    });
  } catch (e) {
    return j6({
      success: false,
      error: "Aktualiz\xE1cia objedn\xE1vky zlyhala.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost5, "onRequestPost");

// api/_utils.js
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...extraHeaders
    }
  });
}
__name(json, "json");
function getCorsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(getCorsResponse, "getCorsResponse");
function addDays(days) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
__name(addDays, "addDays");
function isActiveLicense(account) {
  if (!account) return false;
  if (account.license_status === "active" && account.paid_until && new Date(account.paid_until) > /* @__PURE__ */ new Date()) return true;
  if (account.license_status === "trial" && account.trial_until && new Date(account.trial_until) > /* @__PURE__ */ new Date()) return true;
  return false;
}
__name(isActiveLicense, "isActiveLicense");

// api/admin/accounts.js
async function onRequestOptions7() {
  return getCorsResponse();
}
__name(onRequestOptions7, "onRequestOptions");
async function onRequestGet2({ request, env }) {
  try {
    const adminKey = request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    if (!env.ADMIN_API_KEY || adminKey !== env.ADMIN_API_KEY) {
      return json({ success: false, error: "Neopr\xE1vnen\xFD pr\xEDstup." }, 401);
    }
    const result = await env.DB.prepare(`
      SELECT a.id, a.email, a.company_name, a.plan, a.template, a.license_status, a.trial_until, a.paid_until,
             w.slug, w.title, w.published
      FROM accounts a
      LEFT JOIN websites w ON w.account_id = a.id
      ORDER BY a.created_at DESC
      LIMIT 200
    `).all();
    return json({ success: true, accounts: result.results || [] });
  } catch {
    return json({ success: false, error: "Na\u010D\xEDtanie z\xE1kazn\xEDkov zlyhalo." }, 500);
  }
}
__name(onRequestGet2, "onRequestGet");

// _utils/auth.js
var encoder = new TextEncoder();
function json2(data, status = 200, headers4 = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers4
    }
  });
}
__name(json2, "json");
function cookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options.path || "/"}`);
  parts.push("HttpOnly");
  parts.push("SameSite=Lax");
  parts.push("Secure");
  if (options.maxAge !== void 0) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}
__name(cookie, "cookie");
function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    header.split(";").map((item) => {
      const [key, ...rest] = item.trim().split("=");
      return [key, rest.join("=")];
    }).filter(([key]) => key)
  );
  return cookies[name] || "";
}
__name(getCookie, "getCookie");
function randomId(prefix = "id") {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}
__name(randomId, "randomId");
function addDays2(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}
__name(addDays2, "addDays");
function isLicenseActive(user) {
  const now = Date.now();
  if (!user) return false;
  if (user.license_status === "active" && user.license_ends_at && Date.parse(user.license_ends_at) > now) return true;
  if (user.license_status === "trial" && user.trial_ends_at && Date.parse(user.trial_ends_at) > now) return true;
  return false;
}
__name(isLicenseActive, "isLicenseActive");
async function verifyToken(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const good = await hmac(data, secret);
  if (sig !== good) return null;
  const payload = JSON.parse(new TextDecoder().decode(base64ToBytes(data)));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) return null;
  return payload;
}
__name(verifyToken, "verifyToken");
async function getCurrentUser(request, env) {
  const token = getCookie(request, "lech_web_session");
  const payload = await verifyToken(token, env.JWT_SECRET || env.ADMIN_SECRET || "dev-secret");
  if (!payload?.sub) return null;
  return env.DB.prepare("SELECT id, email, license_status, trial_ends_at, license_ends_at, created_at FROM users WHERE id = ?").bind(payload.sub).first();
}
__name(getCurrentUser, "getCurrentUser");
async function hmac(data, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64(new Uint8Array(sig));
}
__name(hmac, "hmac");
function bytesToBase64(bytes) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
__name(bytesToBase64, "bytesToBase64");
function base64ToBytes(base64url) {
  const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((base64url.length + 3) % 4);
  const str = atob(base64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}
__name(base64ToBytes, "base64ToBytes");

// api/admin/activate-license.js
async function onRequestPost6({ request, env }) {
  try {
    const secret = request.headers.get("X-Admin-Secret") || "";
    if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) return json2({ success: false, error: "Neopr\xE1vnen\xFD pr\xEDstup." }, 401);
    const body = await request.json();
    const email3 = String(body.email || "").trim().toLowerCase();
    const months = Math.max(1, Number(body.months || 1));
    const status = body.status === "blocked" ? "blocked" : "active";
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email3).first();
    if (!user) return json2({ success: false, error: "Pou\u017E\xEDvate\u013E neexistuje." }, 404);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const endBase = user.license_ends_at && Date.parse(user.license_ends_at) > Date.now() ? user.license_ends_at : now;
    const licenseEndsAt = status === "blocked" ? user.license_ends_at : addDays2(endBase, months * 31);
    await env.DB.prepare("UPDATE users SET license_status = ?, license_ends_at = ?, updated_at = ? WHERE email = ?").bind(status, licenseEndsAt, now, email3).run();
    return json2({ success: true, email: email3, status, licenseEndsAt });
  } catch {
    return json2({ success: false, error: "Aktiv\xE1cia licencie zlyhala." }, 500);
  }
}
__name(onRequestPost6, "onRequestPost");

// api/admin/customers.js
function h7() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h7, "h");
function j7(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h7() });
}
__name(j7, "j");
function kv5(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv5, "kv");
async function getJson5(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson5, "getJson");
function adminOk6(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk6, "adminOk");
function customerKey(c) {
  const email3 = String(c.email || "").trim().toLowerCase();
  const phone = String(c.phone || "").trim();
  return email3 || phone || c.name || crypto.randomUUID();
}
__name(customerKey, "customerKey");
function upsertCustomer(map, data) {
  const key = customerKey(data);
  const old = map.get(key) || {
    id: key,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    type: "Be\u017En\xFD",
    ordersCount: 0,
    inquiriesCount: 0,
    totalValueText: "",
    lastOrderAt: "",
    lastInquiryAt: "",
    source: [],
    notes: ""
  };
  const merged = {
    ...old,
    name: old.name || data.name || "",
    email: old.email || data.email || "",
    phone: old.phone || data.phone || ""
  };
  if (data.source && !merged.source.includes(data.source)) merged.source.push(data.source);
  if (data.orderAt && (!merged.lastOrderAt || data.orderAt > merged.lastOrderAt)) merged.lastOrderAt = data.orderAt;
  if (data.inquiryAt && (!merged.lastInquiryAt || data.inquiryAt > merged.lastInquiryAt)) merged.lastInquiryAt = data.inquiryAt;
  if (merged.ordersCount >= 3) merged.type = "VIP";
  if (merged.ordersCount >= 6) merged.type = "Ve\u013Ekoobchod";
  map.set(key, merged);
  return merged;
}
__name(upsertCustomer, "upsertCustomer");
async function onRequestOptions8() {
  return new Response(null, { status: 204, headers: h7() });
}
__name(onRequestOptions8, "onRequestOptions");
async function onRequestGet3({ request, env }) {
  try {
    const store3 = kv5(env);
    if (!store3) return j7({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk6(request, env)) return j7({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const url = new URL(request.url);
    const siteSlug = String(url.searchParams.get("siteSlug") || "").trim();
    const customers = /* @__PURE__ */ new Map();
    const orderIds = await getJson5(store3, siteSlug ? "orders:site:" + siteSlug : "orders:index") || [];
    for (const id of orderIds.slice(0, 500)) {
      const order = await getJson5(store3, "order:" + id);
      if (!order || !order.customer) continue;
      const c = upsertCustomer(customers, {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        source: "order",
        orderAt: order.createdAt
      });
      c.ordersCount += 1;
      c.totalValueText = "pod\u013Ea objedn\xE1vok";
      if (order.customer.address && !c.address) c.address = order.customer.address;
    }
    const inquiryIds = await getJson5(store3, siteSlug ? "inquiries:site:" + siteSlug : "inquiries:index") || [];
    for (const id of inquiryIds.slice(0, 500)) {
      const inquiry = await getJson5(store3, "inquiry:" + id);
      if (!inquiry || !inquiry.customer) continue;
      const c = upsertCustomer(customers, {
        name: inquiry.customer.name,
        email: inquiry.customer.email,
        phone: inquiry.customer.phone,
        source: "inquiry",
        inquiryAt: inquiry.createdAt
      });
      c.inquiriesCount += 1;
      if (inquiry.message && !c.lastInquiryMessage) c.lastInquiryMessage = inquiry.message;
    }
    let list2 = Array.from(customers.values());
    const type = String(url.searchParams.get("type") || "").trim();
    const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
    if (type) {
      if (type === "vip") list2 = list2.filter((c) => c.type === "VIP");
      if (type === "velkoobchod") list2 = list2.filter((c) => c.type === "Ve\u013Ekoobchod");
      if (type === "bez-objednavky") list2 = list2.filter((c) => !c.ordersCount);
    }
    if (q) {
      list2 = list2.filter(
        (c) => String(c.name || "").toLowerCase().includes(q) || String(c.email || "").toLowerCase().includes(q) || String(c.phone || "").toLowerCase().includes(q)
      );
    }
    list2.sort((a, b) => String(b.lastOrderAt || b.lastInquiryAt || "").localeCompare(String(a.lastOrderAt || a.lastInquiryAt || "")));
    const summary = {
      total: list2.length,
      vip: list2.filter((c) => c.type === "VIP").length,
      wholesale: list2.filter((c) => c.type === "Ve\u013Ekoobchod").length,
      withoutOrder: list2.filter((c) => !c.ordersCount).length,
      withEmail: list2.filter((c) => c.email).length
    };
    return j7({
      success: true,
      endpoint: "/api/admin/customers",
      mode: "customer-crm-from-orders-inquiries",
      siteSlug: siteSlug || null,
      summary,
      count: list2.length,
      customers: list2
    });
  } catch (e) {
    return j7({
      success: false,
      error: "Na\u010D\xEDtanie z\xE1kazn\xEDkov zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestGet3, "onRequestGet");

// api/admin/inquiries.js
function h8() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h8, "h");
function j8(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h8() });
}
__name(j8, "j");
function kv6(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv6, "kv");
async function getJson6(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson6, "getJson");
function adminOk7(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk7, "adminOk");
async function onRequestOptions9() {
  return new Response(null, { status: 204, headers: h8() });
}
__name(onRequestOptions9, "onRequestOptions");
async function onRequestGet4({ request, env }) {
  try {
    const store3 = kv6(env);
    if (!store3) return j8({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk7(request, env)) return j8({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const url = new URL(request.url);
    const siteSlug = String(url.searchParams.get("siteSlug") || "").trim();
    const key = siteSlug ? "inquiries:site:" + siteSlug : "inquiries:index";
    const ids = await getJson6(store3, key) || [];
    const inquiries = [];
    for (const id of ids.slice(0, 100)) {
      const inquiry = await getJson6(store3, "inquiry:" + id);
      if (inquiry) inquiries.push(inquiry);
    }
    return j8({
      success: true,
      endpoint: "/api/admin/inquiries",
      count: inquiries.length,
      siteSlug: siteSlug || null,
      inquiries
    });
  } catch (e) {
    return j8({
      success: false,
      error: "Na\u010D\xEDtanie dopytov zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestGet4, "onRequestGet");

// api/admin/license.js
async function onRequestOptions10() {
  return getCorsResponse();
}
__name(onRequestOptions10, "onRequestOptions");
async function onRequestPost7({ request, env }) {
  try {
    const adminKey = request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    if (!env.ADMIN_API_KEY || adminKey !== env.ADMIN_API_KEY) {
      return json({ success: false, error: "Neopr\xE1vnen\xFD pr\xEDstup." }, 401);
    }
    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    const action = String(body.action || "activate").trim();
    const months = Number(body.months || 1);
    if (!accountId) return json({ success: false, error: "Ch\xFDba accountId." }, 400);
    let status = "active";
    let paidUntil = addDays(30 * Math.max(1, months));
    if (action === "suspend") {
      status = "suspended";
      paidUntil = null;
    }
    await env.DB.prepare("UPDATE accounts SET license_status = ?, paid_until = ?, updated_at = ? WHERE id = ?").bind(status, paidUntil, (/* @__PURE__ */ new Date()).toISOString(), accountId).run();
    return json({ success: true, accountId, licenseStatus: status, paidUntil });
  } catch {
    return json({ success: false, error: "Zmena licencie zlyhala." }, 500);
  }
}
__name(onRequestPost7, "onRequestPost");

// api/admin/licenses.js
function headers() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin"
  };
}
__name(headers, "headers");
function json3(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: headers() });
}
__name(json3, "json");
function getStore(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(getStore, "getStore");
async function getJson7(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson7, "getJson");
async function putJson5(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson5, "putJson");
function cleanEmail(v) {
  return String(v || "").trim().toLowerCase();
}
__name(cleanEmail, "cleanEmail");
function checkAdmin(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(checkAdmin, "checkAdmin");
async function saveAccount(store3, account) {
  await putJson5(store3, "user:" + account.email, account);
  await putJson5(store3, "account:" + account.id, account);
  const list2 = await getJson7(store3, "accounts:index") || [];
  const row = {
    id: account.id,
    email: account.email,
    companyName: account.companyName,
    plan: account.plan,
    template: account.template,
    status: account.status,
    trialUntil: account.trialUntil,
    paidUntil: account.paidUntil || null,
    source: account.source || "lech-web",
    createdAt: account.createdAt,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const next = list2.some((x) => x.id === account.id) ? list2.map((x) => x.id === account.id ? row : x) : [row, ...list2];
  await putJson5(store3, "accounts:index", next.slice(0, 500));
}
__name(saveAccount, "saveAccount");
async function onRequestOptions11() {
  return new Response(null, { status: 204, headers: headers() });
}
__name(onRequestOptions11, "onRequestOptions");
async function onRequestGet5({ request, env }) {
  const store3 = getStore(env);
  if (!store3) return json3({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 200);
  if (!checkAdmin(request, env)) return json3({ success: false, error: "Nespr\xE1vny admin PIN." }, 200);
  const accounts = await getJson7(store3, "accounts:index") || [];
  return json3({ success: true, accounts }, 200);
}
__name(onRequestGet5, "onRequestGet");
async function onRequestPost8({ request, env }) {
  try {
    const store3 = getStore(env);
    if (!store3) return json3({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 200);
    if (!checkAdmin(request, env)) return json3({ success: false, error: "Nespr\xE1vny admin PIN." }, 200);
    const body = await request.json().catch(() => null);
    if (!body) return json3({ success: false, error: "Neplatn\xFD JSON." }, 200);
    const email3 = cleanEmail(body.email);
    const action = String(body.action || "").trim();
    const account = await getJson7(store3, "user:" + email3);
    if (!account) return json3({ success: false, error: "\xDA\u010Det neexistuje." }, 200);
    if (action === "activate" || action === "paid") {
      const months = Number(body.months || 1);
      const base = account.paidUntil && Date.parse(account.paidUntil) > Date.now() ? new Date(account.paidUntil) : /* @__PURE__ */ new Date();
      account.status = "active";
      account.paidUntil = new Date(base.getTime() + months * 30 * 24 * 60 * 60 * 1e3).toISOString();
    } else if (action === "suspend") {
      account.status = "suspended";
    } else if (action === "cancel") {
      account.status = "blocked";
      account.trialUntil = new Date(Date.now() - 1e3).toISOString();
      account.paidUntil = null;
    } else if (action === "trial") {
      const days = Number(body.days || 14);
      account.status = "trial";
      account.trialUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1e3).toISOString();
    } else {
      return json3({ success: false, error: "Nezn\xE1ma akcia." }, 200);
    }
    await saveAccount(store3, account);
    const copy = { ...account };
    delete copy.password;
    return json3({ success: true, account: copy }, 200);
  } catch (error) {
    return json3({ success: false, error: "Serverov\xE1 chyba admin licencie.", detail: String(error && error.message ? error.message : error) }, 200);
  }
}
__name(onRequestPost8, "onRequestPost");

// api/admin/orders.js
function h9() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h9, "h");
function j9(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h9() });
}
__name(j9, "j");
function kv7(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv7, "kv");
async function getJson8(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson8, "getJson");
function adminOk8(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk8, "adminOk");
async function onRequestOptions12() {
  return new Response(null, { status: 204, headers: h9() });
}
__name(onRequestOptions12, "onRequestOptions");
async function onRequestGet6({ request, env }) {
  try {
    const store3 = kv7(env);
    if (!store3) {
      return j9({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    }
    if (!adminOk8(request, env)) {
      return j9({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    }
    const url = new URL(request.url);
    const siteSlug = String(url.searchParams.get("siteSlug") || "").trim();
    const indexKey = siteSlug ? "orders:site:" + siteSlug : "orders:index";
    const ids = await getJson8(store3, indexKey) || [];
    const orders = [];
    for (const id of ids.slice(0, 100)) {
      const order = await getJson8(store3, "order:" + id);
      if (order) orders.push(order);
    }
    return j9({
      success: true,
      endpoint: "/api/admin/orders",
      mode: "admin-orders-list",
      count: orders.length,
      siteSlug: siteSlug || null,
      orders
    });
  } catch (e) {
    return j9({
      success: false,
      error: "Na\u010D\xEDtanie objedn\xE1vok zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestGet6, "onRequestGet");

// api/admin/site-save.js
function h10() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin,authorization"
  };
}
__name(h10, "h");
function j10(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h10() });
}
__name(j10, "j");
function kv8(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv8, "kv");
async function getJson9(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson9, "getJson");
async function putJson6(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson6, "putJson");
function adminOk9(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk9, "adminOk");
function slugify2(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify2, "slugify");
function normalizeProduct(p, index) {
  return {
    id: String(p.id || "p" + (index + 1)),
    title: String(p.title || p.name || "Produkt " + (index + 1)),
    code: String(p.code || ""),
    price: String(p.price || ""),
    oldPrice: String(p.oldPrice || ""),
    image: String(p.image || ""),
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    shortText: String(p.shortText || p.description || ""),
    longText: String(p.longText || ""),
    badge: String(p.badge || ""),
    category: String(p.category || ""),
    availability: String(p.availability || "Skladom"),
    visibility: String(p.visibility || "visible"),
    stock: String(p.stock || ""),
    vat: String(p.vat || ""),
    detailUrl: String(p.detailUrl || "#"),
    seoTitle: String(p.seoTitle || ""),
    seoDescription: String(p.seoDescription || ""),
    relatedProducts: String(p.relatedProducts || ""),
    youtube: String(p.youtube || ""),
    ...p
  };
}
__name(normalizeProduct, "normalizeProduct");
function normalizeWebsite(input, account) {
  const w = input && typeof input === "object" ? input : {};
  const companyName = String(w.companyName || account.companyName || "");
  const slug = slugify2(w.slug || companyName || account.email || account.id);
  const existingProducts = Array.isArray(w.eshop?.products) ? w.eshop.products : Array.isArray(w.products) ? w.products : [];
  const products = existingProducts.map(normalizeProduct);
  const theme = {
    accent: "lechweb",
    logo: "",
    heroImage: "",
    ...w.theme || {}
  };
  const modules = {
    ...w.modules || {}
  };
  const eshop = {
    enabled: true,
    ...w.eshop || {},
    products,
    sidebar: {
      ...w.eshop?.sidebar || {}
    }
  };
  return {
    ...w,
    slug,
    companyName,
    headline: String(w.headline || companyName || ""),
    description: String(w.description || ""),
    homepageText: String(w.homepageText || ""),
    phone: String(w.phone || ""),
    email: String(w.email || w.siteEmail || account.email || ""),
    siteEmail: String(w.siteEmail || w.email || account.email || ""),
    ownerEmail: account.email,
    template: String(w.template || account.template || "E-shop"),
    theme,
    modules,
    eshop,
    products,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(normalizeWebsite, "normalizeWebsite");
function addDays3(date, days) {
  const d = new Date(date || Date.now());
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}
__name(addDays3, "addDays");
function addMonths(date, months) {
  const d = new Date(date || Date.now());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}
__name(addMonths, "addMonths");
function applyLicense(account, action) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const base = account.paidUntil && Date.parse(account.paidUntil) > Date.now() ? account.paidUntil : now;
  if (action === "trial14") {
    account.status = "trial";
    account.trialUntil = addDays3(now, 14);
  }
  if (action === "activate_month") {
    account.status = "active";
    account.paidUntil = addMonths(base, 1);
  }
  if (action === "activate_year") {
    account.status = "active";
    account.paidUntil = addMonths(base, 12);
  }
  if (action === "activate_2years") {
    account.status = "active";
    account.paidUntil = addMonths(base, 24);
  }
  if (action === "suspend") {
    account.status = "suspended";
  }
  if (action === "unsuspend") {
    account.status = "active";
  }
  return account;
}
__name(applyLicense, "applyLicense");
async function onRequestOptions13() {
  return new Response(null, { status: 204, headers: h10() });
}
__name(onRequestOptions13, "onRequestOptions");
async function onRequestGet7({ env }) {
  const store3 = kv8(env);
  let kvOk = false;
  let error = null;
  if (store3) {
    try {
      await store3.put("_health/admin-site-save.txt", "ok " + (/* @__PURE__ */ new Date()).toISOString());
      kvOk = true;
    } catch (e) {
      error = String(e && e.message ? e.message : e);
    }
  }
  return j10({
    success: true,
    endpoint: "/api/admin/site-save",
    mode: "robust-product-saving",
    kvBindingFound: Boolean(store3),
    kvWriteOk: kvOk,
    kvError: error,
    saves: [
      "website",
      "website.eshop.products",
      "website.products",
      "website.modules",
      "website.theme",
      "license actions"
    ]
  });
}
__name(onRequestGet7, "onRequestGet");
async function onRequestPost9({ request, env }) {
  try {
    const store3 = kv8(env);
    if (!store3) return j10({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk9(request, env)) return j10({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return j10({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const email3 = String(body.email || body.accountEmail || "").trim().toLowerCase();
    if (!email3) return j10({ success: false, error: "Ch\xFDba email \xFA\u010Dtu." }, 400);
    const account = await getJson9(store3, "user:" + email3);
    if (!account) return j10({ success: false, error: "\xDA\u010Det neexistuje: " + email3 }, 404);
    if (body.licenseAction) applyLicense(account, String(body.licenseAction));
    const website = normalizeWebsite(body.website || body.site || {}, account);
    account.website = website;
    account.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await putJson6(store3, "user:" + account.email, account);
    if (account.id) await putJson6(store3, "account:" + account.id, account);
    await putJson6(store3, "site:" + website.slug, website);
    const siteIndex = await getJson9(store3, "sites:index") || [];
    const nextIndex = [website.slug, ...siteIndex.filter((x) => x !== website.slug)].slice(0, 1e3);
    await putJson6(store3, "sites:index", nextIndex);
    return j10({
      success: true,
      message: "Web z\xE1kazn\xEDka bol ulo\u017Een\xFD.",
      mode: "robust-product-saving",
      account,
      website,
      publicUrl: new URL(request.url).origin + "/site/" + website.slug,
      savedProducts: website.eshop?.products?.length || 0,
      savedModules: Boolean(website.modules),
      savedTheme: Boolean(website.theme)
    });
  } catch (e) {
    return j10({
      success: false,
      error: "Ulo\u017Eenie webu zlyhalo.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : "")
    }, 500);
  }
}
__name(onRequestPost9, "onRequestPost");

// api/admin/sites.js
function h11() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin"
  };
}
__name(h11, "h");
function j11(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h11() });
}
__name(j11, "j");
function kv9(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv9, "kv");
async function getJson10(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson10, "getJson");
function adminOk10(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk10, "adminOk");
function publicAccount(acc) {
  if (!acc) return null;
  const clean3 = { ...acc };
  delete clean3.password;
  delete clean3.passwordHash;
  return clean3;
}
__name(publicAccount, "publicAccount");
async function onRequestOptions14() {
  return new Response(null, { status: 204, headers: h11() });
}
__name(onRequestOptions14, "onRequestOptions");
async function onRequestGet8({ request, env }) {
  try {
    const store3 = kv9(env);
    if (!store3) return j11({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    if (!adminOk10(request, env)) return j11({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const index = await getJson10(store3, "accounts:index") || [];
    const accounts = [];
    for (const row of index) {
      const full = row.email ? await getJson10(store3, "user:" + String(row.email).toLowerCase()) : null;
      accounts.push(publicAccount(full || row));
    }
    const now = Date.now();
    const summary = {
      total: accounts.length,
      active: accounts.filter((a) => a.status === "active").length,
      trial: accounts.filter((a) => a.status === "trial").length,
      suspended: accounts.filter((a) => a.status === "suspended" || a.status === "blocked").length,
      expired: accounts.filter((a) => {
        if (a.status === "active") return false;
        const trial = a.trialUntil ? Date.parse(a.trialUntil) : 0;
        const paid = a.paidUntil ? Date.parse(a.paidUntil) : 0;
        return trial && paid ? Math.max(trial, paid) < now : false;
      }).length
    };
    return j11({
      success: true,
      summary,
      count: accounts.length,
      accounts,
      mode: "lech-web-final-admin-platform",
      sections: [
        "Dashboard",
        "Objedn\xE1vky",
        "Produkty",
        "Kateg\xF3rie",
        "Z\xE1kazn\xEDci",
        "Vzh\u013Ead a obsah",
        "Marketing / SEO",
        "Nastavenia",
        "Licencie"
      ]
    });
  } catch (e) {
    return j11({
      success: false,
      error: "Admin zoznam zlyhal.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestGet8, "onRequestGet");

// api/admin/users.js
async function onRequestGet9({ request, env }) {
  const secret = request.headers.get("X-Admin-Secret") || "";
  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) return json2({ success: false, error: "Neopr\xE1vnen\xFD pr\xEDstup." }, 401);
  const users = await env.DB.prepare("SELECT id,email,license_status,trial_ends_at,license_ends_at,created_at FROM users ORDER BY created_at DESC LIMIT 100").all();
  return json2({ success: true, users: users.results || [] });
}
__name(onRequestGet9, "onRequestGet");

// api/auth/login.js
function headers2() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin"
  };
}
__name(headers2, "headers");
function json4(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: headers2() });
}
__name(json4, "json");
function getStore2(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(getStore2, "getStore");
function cleanEmail2(value) {
  return String(value || "").trim().toLowerCase();
}
__name(cleanEmail2, "cleanEmail");
async function getJson11(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson11, "getJson");
function isActive(account) {
  if (!account) return false;
  if (account.status === "blocked" || account.status === "suspended") return false;
  if (account.status === "active") return true;
  const now = Date.now();
  const trialUntil = account.trialUntil ? Date.parse(account.trialUntil) : 0;
  const paidUntil = account.paidUntil ? Date.parse(account.paidUntil) : 0;
  return trialUntil > now || paidUntil > now;
}
__name(isActive, "isActive");
function publicAccount2(account) {
  const copy = { ...account };
  delete copy.password;
  return copy;
}
__name(publicAccount2, "publicAccount");
async function onRequestOptions15() {
  return new Response(null, { status: 204, headers: headers2() });
}
__name(onRequestOptions15, "onRequestOptions");
async function onRequestPost10({ request, env }) {
  try {
    const store3 = getStore2(env);
    if (!store3) {
      return json4({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 200);
    }
    const body = await request.json().catch(() => null);
    const email3 = cleanEmail2(body && body.email);
    const password = String(body && body.password || "").trim();
    if (!email3 || !password) return json4({ success: false, error: "Zadaj e-mail a heslo." }, 200);
    const account = await getJson11(store3, "user:" + email3);
    if (!account || account.password !== password) {
      return json4({ success: false, error: "Nespr\xE1vny e-mail alebo heslo." }, 200);
    }
    if (!isActive(account)) {
      return json4({ success: false, error: "Licencia nie je akt\xEDvna alebo vypr\u0161ala.", account: publicAccount2(account) }, 200);
    }
    return json4({ success: true, account: publicAccount2(account) }, 200);
  } catch (error) {
    return json4({ success: false, error: "Serverov\xE1 chyba pri prihl\xE1sen\xED.", detail: String(error && error.message ? error.message : error) }, 200);
  }
}
__name(onRequestPost10, "onRequestPost");

// api/auth/logout.js
async function onRequestPost11() {
  return json2({ success: true }, 200, { "Set-Cookie": cookie("lech_web_session", "", { maxAge: 0 }) });
}
__name(onRequestPost11, "onRequestPost");

// api/auth/me.js
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin"
  };
}
__name(corsHeaders, "corsHeaders");
function json5(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}
__name(json5, "json");
function getStore3(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(getStore3, "getStore");
async function getJson12(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson12, "getJson");
function cleanEmail3(value) {
  return String(value || "").trim().toLowerCase();
}
__name(cleanEmail3, "cleanEmail");
function isActive2(account) {
  if (!account) return false;
  if (account.status === "blocked" || account.status === "suspended") return false;
  if (account.status === "active") return true;
  const now = Date.now();
  const trialUntil = account.trialUntil ? Date.parse(account.trialUntil) : 0;
  const paidUntil = account.paidUntil ? Date.parse(account.paidUntil) : 0;
  return trialUntil > now || paidUntil > now;
}
__name(isActive2, "isActive");
function publicAccount3(account) {
  return {
    id: account.id,
    companyName: account.companyName,
    email: account.email,
    plan: account.plan,
    template: account.template,
    status: account.status,
    trialUntil: account.trialUntil,
    paidUntil: account.paidUntil || null,
    variableSymbol: account.variableSymbol,
    amount: account.amount,
    source: account.source || "lech-web",
    sourceUrl: account.sourceUrl || "",
    website: account.website || null,
    createdAt: account.createdAt
  };
}
__name(publicAccount3, "publicAccount");
function requireStore(env) {
  const store3 = getStore3(env);
  if (!store3) {
    return {
      store: null,
      response: json5({
        success: false,
        error: "Ch\xFDba KV binding LECHWEB_KV.",
        fix: "Cloudflare Pages \u2192 lech-web \u2192 Settings \u2192 Bindings \u2192 Add KV namespace \u2192 Variable name LECHWEB_KV",
        requiredBinding: "LECHWEB_KV"
      }, 500)
    };
  }
  return { store: store3, response: null };
}
__name(requireStore, "requireStore");
async function onRequestOptions16() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
__name(onRequestOptions16, "onRequestOptions");
async function onRequestGet10({ request, env }) {
  try {
    const { store: store3, response } = requireStore(env);
    if (response) return response;
    const url = new URL(request.url);
    const email3 = cleanEmail3(url.searchParams.get("email"));
    if (!email3) return json5({ success: false, error: "Ch\xFDba email." }, 400);
    const account = await getJson12(store3, "user:" + email3);
    if (!account) return json5({ success: false, error: "\xDA\u010Det neexistuje." }, 404);
    return json5({ success: true, active: isActive2(account), account: publicAccount3(account) });
  } catch (error) {
    return json5({ success: false, error: "Serverov\xE1 chyba.", detail: String(error && error.message ? error.message : error) }, 500);
  }
}
__name(onRequestGet10, "onRequestGet");

// api/auth/register.js
function headers3() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Pin"
  };
}
__name(headers3, "headers");
function json6(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: headers3()
  });
}
__name(json6, "json");
function getStore4(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(getStore4, "getStore");
function cleanEmail4(value) {
  return String(value || "").trim().toLowerCase();
}
__name(cleanEmail4, "cleanEmail");
function addDays4(date, days) {
  return new Date(date.getTime() + Number(days || 0) * 24 * 60 * 60 * 1e3);
}
__name(addDays4, "addDays");
function makeVS(email3) {
  let hash = 0;
  for (const ch of String(email3 || "")) {
    hash = hash * 31 + ch.charCodeAt(0) >>> 0;
  }
  return String(7e9 + hash % 999999999).slice(0, 10);
}
__name(makeVS, "makeVS");
function planAmount(plan) {
  const p = String(plan || "").toLowerCase();
  if (p.includes("mini") || p.includes("shop") || p.includes("eshop")) return 119;
  if (p.includes("business")) return 69;
  return 39;
}
__name(planAmount, "planAmount");
async function getJson13(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson13, "getJson");
async function putJson7(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson7, "putJson");
async function saveIndex(store3, account) {
  await putJson7(store3, "user:" + account.email, account);
  await putJson7(store3, "account:" + account.id, account);
  const list2 = await getJson13(store3, "accounts:index") || [];
  const row = {
    id: account.id,
    email: account.email,
    companyName: account.companyName,
    plan: account.plan,
    template: account.template,
    status: account.status,
    trialUntil: account.trialUntil,
    paidUntil: account.paidUntil,
    variableSymbol: account.variableSymbol,
    amount: account.amount,
    source: account.source,
    sourceUrl: account.sourceUrl,
    createdAt: account.createdAt,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const next = list2.some((x) => x.id === account.id) ? list2.map((x) => x.id === account.id ? row : x) : [row, ...list2];
  await putJson7(store3, "accounts:index", next.slice(0, 500));
}
__name(saveIndex, "saveIndex");
function publicAccount4(account) {
  return {
    id: account.id,
    companyName: account.companyName,
    email: account.email,
    plan: account.plan,
    template: account.template,
    status: account.status,
    trialUntil: account.trialUntil,
    paidUntil: account.paidUntil,
    variableSymbol: account.variableSymbol,
    amount: account.amount,
    source: account.source,
    sourceUrl: account.sourceUrl,
    createdAt: account.createdAt
  };
}
__name(publicAccount4, "publicAccount");
async function onRequestOptions17() {
  return new Response(null, { status: 204, headers: headers3() });
}
__name(onRequestOptions17, "onRequestOptions");
async function onRequestGet11({ env }) {
  const store3 = getStore4(env);
  let kvWriteOk = false;
  let kvError = null;
  if (store3) {
    try {
      await store3.put("register:health", (/* @__PURE__ */ new Date()).toISOString());
      kvWriteOk = true;
    } catch (e) {
      kvError = String(e && e.message ? e.message : e);
    }
  }
  return json6({
    success: true,
    endpoint: "/api/auth/register",
    kvBindingFound: Boolean(store3),
    kvWriteOk,
    kvError,
    requiredBinding: "LECHWEB_KV",
    trialDays: env.TRIAL_DAYS || "14",
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
}
__name(onRequestGet11, "onRequestGet");
async function onRequestPost12({ request, env }) {
  try {
    const store3 = getStore4(env);
    if (!store3) {
      return json6({
        success: false,
        error: "Ch\xFDba KV binding LECHWEB_KV. Registr\xE1cia nem\xE1 kam uklada\u0165 \xFA\u010Dty.",
        requiredBinding: "LECHWEB_KV",
        fix: "Cloudflare Pages \u2192 lech-web \u2192 Settings \u2192 Bindings \u2192 Add \u2192 KV namespace \u2192 Variable name LECHWEB_KV \u2192 Save \u2192 nov\xFD deploy."
      }, 200);
    }
    try {
      await store3.put("register:test", (/* @__PURE__ */ new Date()).toISOString());
    } catch (e) {
      return json6({
        success: false,
        error: "KV binding existuje, ale ned\xE1 sa do neho zapisova\u0165.",
        detail: String(e && e.message ? e.message : e)
      }, 200);
    }
    const body = await request.json().catch(() => null);
    if (!body) {
      return json6({ success: false, error: "Neplatn\xFD JSON." }, 200);
    }
    const companyName = String(
      body.companyName || body.company || body.businessName || body.name || body.firma || ""
    ).trim();
    const email3 = cleanEmail4(body.email || body.contactEmail || body.userEmail);
    const password = String(body.password || body.pass || "").trim();
    const plan = String(body.plan || body.package || "Start Web").trim();
    const template = String(body.template || body.templateName || "Stavebn\xE1 firma").trim();
    if (!companyName || !email3 || !password) {
      return json6({ success: false, error: "Vypl\u0148 n\xE1zov firmy, e-mail a heslo." }, 200);
    }
    if (!email3.includes("@")) {
      return json6({ success: false, error: "E-mail nie je platn\xFD." }, 200);
    }
    if (password.length < 6) {
      return json6({ success: false, error: "Heslo mus\xED ma\u0165 aspo\u0148 6 znakov." }, 200);
    }
    const existing = await store3.get("user:" + email3);
    if (existing) {
      return json6({ success: false, error: "\xDA\u010Det s t\xFDmto e-mailom u\u017E existuje." }, 200);
    }
    const now = /* @__PURE__ */ new Date();
    const amount = planAmount(plan);
    const variableSymbol = makeVS(email3);
    const account = {
      id: crypto.randomUUID(),
      companyName,
      email: email3,
      password,
      plan,
      template,
      amount,
      variableSymbol,
      status: "trial",
      source: "lech-web",
      sourceUrl: request.headers.get("referer") || "https://lech-web.pages.dev",
      createdAt: now.toISOString(),
      trialUntil: addDays4(now, Number(env.TRIAL_DAYS || 14)).toISOString(),
      paidUntil: null,
      website: null
    };
    await saveIndex(store3, account);
    return json6({
      success: true,
      message: "\xDA\u010Det bol vytvoren\xFD. Trial je akt\xEDvny 14 dn\xED.",
      account: publicAccount4(account),
      payment: {
        amount,
        currency: "EUR",
        variableSymbol,
        note: "Lech-Web " + companyName
      }
    }, 200);
  } catch (error) {
    return json6({
      success: false,
      error: "Serverov\xE1 chyba pri registr\xE1cii.",
      detail: String(error && error.message ? error.message : error),
      stack: String(error && error.stack ? error.stack : "")
    }, 200);
  }
}
__name(onRequestPost12, "onRequestPost");

// api/builder/save.js
function h12() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin"
  };
}
__name(h12, "h");
function j12(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h12() });
}
__name(j12, "j");
function store(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(store, "store");
async function getJson14(kv18, key) {
  const raw = await kv18.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson14, "getJson");
async function putJson8(kv18, key, value) {
  await kv18.put(key, JSON.stringify(value));
}
__name(putJson8, "putJson");
function email(v) {
  return String(v || "").trim().toLowerCase();
}
__name(email, "email");
function slugify3(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify3, "slugify");
function active(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(active, "active");
function pub(acc) {
  const x = { ...acc };
  delete x.password;
  return x;
}
__name(pub, "pub");
function lines(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "").split("\n").map((x) => x.trim()).filter(Boolean);
}
__name(lines, "lines");
function normalizeProducts(value) {
  if (Array.isArray(value) && value.length) {
    return value.map((p, i) => ({
      id: String(p.id || `product-${i + 1}`),
      title: String(p.title || p.name || `Produkt ${i + 1}`),
      price: String(p.price || ""),
      oldPrice: String(p.oldPrice || ""),
      image: String(p.image || p.imageUrl || ""),
      shortText: String(p.shortText || p.description || ""),
      category: String(p.category || ""),
      badge: String(p.badge || ""),
      detailUrl: String(p.detailUrl || "")
    }));
  }
  return [
    {
      id: "product-1",
      title: "Uk\xE1\u017Ekov\xFD produkt",
      price: "\u20AC999",
      oldPrice: "",
      image: "",
      shortText: "Kr\xE1tky popis produktu.",
      category: "Novinky",
      badge: "TIP",
      detailUrl: ""
    }
  ];
}
__name(normalizeProducts, "normalizeProducts");
function defaultSidebar(body, site) {
  return {
    categories: lines(body.categories).length ? lines(body.categories) : [
      "Hlavn\xE1 kateg\xF3ria",
      "Ak\u010Dn\xFD tovar",
      "Novinky",
      "Najpred\xE1vanej\u0161ie",
      "Doplnky",
      "V\xFDpredaj"
    ],
    contactTitle: String(body.sidebarContactTitle || "Kontakt"),
    contactName: String(body.sidebarContactName || site.companyName || ""),
    contactEmail: String(body.sidebarContactEmail || site.email || site.ownerEmail || ""),
    contactPhone: String(body.sidebarContactPhone || site.phone || ""),
    searchEnabled: body.searchEnabled !== false,
    adviceLinks: Array.isArray(body.adviceLinks) ? body.adviceLinks : [
      { title: "Ako nakupova\u0165", url: "#" },
      { title: "Obchodn\xE9 podmienky", url: "#" },
      { title: "Ochrana osobn\xFDch \xFAdajov", url: "#" }
    ],
    youtube: Array.isArray(body.youtube) ? body.youtube : [
      { title: "YouTube kan\xE1l", url: "#" }
    ],
    customBlocks: Array.isArray(body.sidebarBlocks) ? body.sidebarBlocks : []
  };
}
__name(defaultSidebar, "defaultSidebar");
async function indexAccount(kv18, acc) {
  await putJson8(kv18, "user:" + acc.email, acc);
  await putJson8(kv18, "account:" + acc.id, acc);
  const list2 = await getJson14(kv18, "accounts:index") || [];
  const row = {
    id: acc.id,
    email: acc.email,
    companyName: acc.companyName,
    plan: acc.plan,
    template: acc.template,
    status: acc.status,
    trialUntil: acc.trialUntil,
    paidUntil: acc.paidUntil || null,
    source: acc.source || "lech-web",
    createdAt: acc.createdAt,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    website: acc.website || null
  };
  const next = list2.some((a) => a.id === acc.id) ? list2.map((a) => a.id === acc.id ? row : a) : [row, ...list2];
  await putJson8(kv18, "accounts:index", next.slice(0, 500));
}
__name(indexAccount, "indexAccount");
async function onRequestOptions18() {
  return new Response(null, { status: 204, headers: h12() });
}
__name(onRequestOptions18, "onRequestOptions");
async function onRequestGet12({ env }) {
  const kv18 = store(env);
  let ok = false;
  let err = null;
  if (kv18) {
    try {
      await kv18.put("site-save-eshop-health", (/* @__PURE__ */ new Date()).toISOString());
      ok = true;
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    }
  }
  return j12({
    success: true,
    endpoint: "/api/site/save",
    mode: "eshop-shoptet-style",
    kvBindingFound: Boolean(kv18),
    kvWriteOk: ok,
    kvError: err,
    supports: [
      "top menu",
      "left categories",
      "contact sidebar",
      "search sidebar",
      "advice links",
      "youtube links",
      "product grid",
      "homepage description",
      "footer",
      "products",
      "categories"
    ]
  });
}
__name(onRequestGet12, "onRequestGet");
async function onRequestPost13({ request, env }) {
  try {
    const kv18 = store(env);
    if (!kv18) return j12({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." });
    const body = await request.json().catch(() => null);
    if (!body) return j12({ success: false, error: "Neplatn\xFD JSON." });
    const accountEmail = email(
      body.accountEmail || body.userEmail || body.ownerEmail || body.customerEmail || body.loginEmail || body.email || body.siteEmail || body.publicEmail || body.contactEmail
    );
    if (!accountEmail) return j12({ success: false, error: "Ch\xFDba e-mail \xFA\u010Dtu.", receivedKeys: Object.keys(body) });
    const acc = await getJson14(kv18, "user:" + accountEmail);
    if (!acc) return j12({ success: false, error: "\xDA\u010Det neexistuje.", email: accountEmail });
    if (!active(acc)) return j12({ success: false, error: "Licencia nie je akt\xEDvna.", account: pub(acc) });
    const companyName = String(body.companyName || body.company || body.businessName || body.name || acc.companyName || "").trim();
    let siteSlug = slugify3(body.slug || body.siteSlug || body.urlName || body.url || body.path || companyName || acc.companyName || "web");
    if (!siteSlug) siteSlug = "web-" + Date.now();
    const website = {
      slug: siteSlug,
      ownerEmail: acc.email,
      companyName: companyName || acc.companyName,
      headline: String(body.headline || body.title || companyName || acc.companyName || "").trim(),
      description: String(body.description || body.text || body.copy || "").trim(),
      homepageText: String(body.homepageText || body.longDescription || body.mainDescription || body.description || "").trim(),
      phone: String(body.phone || body.telefon || "").trim(),
      email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
      template: String(body.template || body.templateName || acc.template || "E-shop"),
      theme: {
        accent: String(body.theme?.accent || body.accent || "turquoise"),
        logo: String(body.logo || body.theme?.logo || ""),
        heroImage: String(body.heroImage || body.theme?.heroImage || body.image || "")
      },
      eshop: {
        enabled: true,
        topMenu: Array.isArray(body.topMenu) ? body.topMenu : [
          { title: "Produkty", url: "#produkty" },
          { title: "Akcie", url: "#produkty" },
          { title: "Ako nakupova\u0165", url: "#info" },
          { title: "Kontakt", url: "#kontakt" }
        ],
        benefits: Array.isArray(body.benefits) ? body.benefits : [
          { title: "Dar\u010Dek zdarma", text: "Ku ka\u017Edej objedn\xE1vke." },
          { title: "R\xFDchle dodanie", text: "Pre produkty skladom." },
          { title: "Na spl\xE1tky", text: "R\xFDchlo a bezpe\u010Dne." },
          { title: "Doprava zdarma", text: "Pod\u013Ea podmienok predajcu." }
        ],
        sidebar: defaultSidebar(body, {
          companyName: companyName || acc.companyName,
          email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
          ownerEmail: acc.email,
          phone: String(body.phone || body.telefon || "").trim()
        }),
        products: normalizeProducts(body.products),
        footerLinks: Array.isArray(body.footerLinks) ? body.footerLinks : [
          { title: "Ako nakupova\u0165", url: "#" },
          { title: "Obchodn\xE9 podmienky", url: "#" },
          { title: "Ochrana osobn\xFDch \xFAdajov", url: "#" }
        ]
      },
      source: "lech-web",
      status: "published",
      createdAt: acc.website && acc.website.createdAt ? acc.website.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    acc.website = website;
    await putJson8(kv18, "site:" + siteSlug, website);
    await indexAccount(kv18, acc);
    return j12({
      success: true,
      message: "E-shop web bol ulo\u017Een\xFD.",
      url: "/site/" + siteSlug,
      publicUrl: "https://lech-web.pages.dev/site/" + siteSlug,
      website,
      account: pub(acc)
    });
  } catch (e) {
    return j12({
      success: false,
      error: "Serverov\xE1 chyba pri ukladan\xED webu.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : "")
    });
  }
}
__name(onRequestPost13, "onRequestPost");

// api/email/test.js
function h13() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin"
  };
}
__name(h13, "h");
function j13(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h13() });
}
__name(j13, "j");
function adminOk11(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}
__name(adminOk11, "adminOk");
function fromEmail4(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}
__name(fromEmail4, "fromEmail");
async function sendResend4(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Ch\xFDba RESEND_API_KEY v Cloudflare Variables and Secrets." }
    };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
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
    data
  };
}
__name(sendResend4, "sendResend");
async function onRequestOptions19() {
  return new Response(null, { status: 204, headers: h13() });
}
__name(onRequestOptions19, "onRequestOptions");
async function onRequestGet13({ request, env }) {
  try {
    if (!adminOk11(request, env)) return j13({ success: false, error: "Nespr\xE1vny admin PIN." }, 401);
    const url = new URL(request.url);
    const to = url.searchParams.get("to") || env.CONTACT_TO || "lechstav@gmail.com";
    const result = await sendResend4(env, {
      from: fromEmail4(env),
      to,
      subject: "Lech-Web test email",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Lech-Web test email</h2>
          <p>Resend napojenie funguje.</p>
          <p>\u010Cas: ${(/* @__PURE__ */ new Date()).toISOString()}</p>
        </div>
      `
    });
    return j13({
      success: result.ok,
      endpoint: "/api/email/test",
      resendStatus: result.status,
      from: fromEmail4(env),
      to,
      result: result.data
    }, result.ok ? 200 : 500);
  } catch (e) {
    return j13({
      success: false,
      error: "Test email zlyhal.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestGet13, "onRequestGet");

// api/inquiries/create.js
function h14() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  };
}
__name(h14, "h");
function j14(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h14() });
}
__name(j14, "j");
function kv10(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv10, "kv");
async function getJson15(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson15, "getJson");
async function putJson9(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson9, "putJson");
function clean(v) {
  return String(v || "").trim();
}
__name(clean, "clean");
function fromEmail5(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}
__name(fromEmail5, "fromEmail");
function ownerEmail(site, env) {
  return site.inquiryEmail || site.email || site.siteEmail || site.ownerEmail || env.CONTACT_TO || "lechstav@gmail.com";
}
__name(ownerEmail, "ownerEmail");
function escapeHtml4(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(escapeHtml4, "escapeHtml");
function inquiryNumber() {
  const d = /* @__PURE__ */ new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rnd = Math.floor(1e3 + Math.random() * 9e3);
  return `DP-${y}${m}${day}-${rnd}`;
}
__name(inquiryNumber, "inquiryNumber");
async function sendResend5(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, status: 500, data: { error: "Ch\xFDba RESEND_API_KEY." } };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}
__name(sendResend5, "sendResend");
function emailHtml2(inquiry) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">Nov\xFD dopyt z webu</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml4(inquiry.number)}</p>
        </div>

        <div style="padding:24px">
          <h2 style="margin-top:0">Z\xE1kazn\xEDk</h2>
          <p>
            <b>${escapeHtml4(inquiry.customer.name)}</b><br>
            ${escapeHtml4(inquiry.customer.email)}<br>
            ${escapeHtml4(inquiry.customer.phone)}
          </p>

          <h2>Dopyt</h2>
          <p><b>Predmet:</b> ${escapeHtml4(inquiry.subject)}</p>
          <p><b>Produkt / t\xE9ma:</b> ${escapeHtml4(inquiry.product)}</p>
          <p style="white-space:pre-line">${escapeHtml4(inquiry.message)}</p>

          <p style="margin-top:24px;color:#64748b;font-size:13px">
            Web: ${escapeHtml4(inquiry.siteName)}<br>
            D\xE1tum: ${escapeHtml4(inquiry.createdAt)}
          </p>
        </div>
      </div>
    </div>
  `;
}
__name(emailHtml2, "emailHtml");
async function onRequestOptions20() {
  return new Response(null, { status: 204, headers: h14() });
}
__name(onRequestOptions20, "onRequestOptions");
async function onRequestPost14({ request, env }) {
  try {
    const store3 = kv10(env);
    if (!store3) return j14({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    const body = await request.json().catch(() => null);
    if (!body) return j14({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const siteSlug = clean(body.siteSlug || body.slug);
    if (!siteSlug) return j14({ success: false, error: "Ch\xFDba siteSlug." }, 400);
    const site = await getJson15(store3, "site:" + siteSlug);
    if (!site) return j14({ success: false, error: "Web neexistuje." }, 404);
    const customer = {
      name: clean(body.name || body.customer?.name),
      email: clean(body.email || body.customer?.email).toLowerCase(),
      phone: clean(body.phone || body.customer?.phone)
    };
    if (!customer.name) return j14({ success: false, error: "Ch\xFDba meno." }, 400);
    if (!customer.email && !customer.phone) return j14({ success: false, error: "Zadaj e-mail alebo telef\xF3n." }, 400);
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      adminNote: "",
      email: {
        ownerSent: false,
        ownerResult: null,
        customerSent: false,
        customerResult: null
      }
    };
    await putJson9(store3, "inquiry:" + inquiry.id, inquiry);
    const siteKey = "inquiries:site:" + siteSlug;
    const siteInquiries = await getJson15(store3, siteKey) || [];
    await putJson9(store3, siteKey, [inquiry.id, ...siteInquiries].slice(0, 500));
    const globalInquiries = await getJson15(store3, "inquiries:index") || [];
    await putJson9(store3, "inquiries:index", [inquiry.id, ...globalInquiries].slice(0, 1e3));
    const ownerMail = await sendResend5(env, {
      from: fromEmail5(env),
      to: ownerEmail(site, env),
      subject: `Nov\xFD dopyt ${inquiry.number} - ${inquiry.siteName}`,
      html: emailHtml2(inquiry),
      reply_to: customer.email || void 0
    });
    inquiry.email.ownerSent = ownerMail.ok;
    inquiry.email.ownerResult = { status: ownerMail.status, data: ownerMail.data };
    if (customer.email) {
      const customerMail = await sendResend5(env, {
        from: fromEmail5(env),
        to: customer.email,
        subject: `Potvrdenie dopytu ${inquiry.number}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2>\u010Eakujeme za v\xE1\u0161 dopyt</h2>
            <p>Dobr\xFD de\u0148 ${escapeHtml4(customer.name)},</p>
            <p>v\xE1\u0161 dopyt bol prijat\xFD. Ozveme sa v\xE1m \u010Do najsk\xF4r.</p>
            <p><b>\u010C\xEDslo dopytu:</b> ${escapeHtml4(inquiry.number)}</p>
            <p><b>Predmet:</b> ${escapeHtml4(inquiry.subject)}</p>
          </div>
        `
      });
      inquiry.email.customerSent = customerMail.ok;
      inquiry.email.customerResult = { status: customerMail.status, data: customerMail.data };
    }
    inquiry.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await putJson9(store3, "inquiry:" + inquiry.id, inquiry);
    return j14({
      success: true,
      message: "Dopyt bol odoslan\xFD.",
      inquiry
    });
  } catch (e) {
    return j14({
      success: false,
      error: "Odoslanie dopytu zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost14, "onRequestPost");

// api/license/status.js
async function onRequestOptions21() {
  return getCorsResponse();
}
__name(onRequestOptions21, "onRequestOptions");
async function onRequestPost15({ request, env }) {
  try {
    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    if (!accountId) return json({ success: false, error: "Ch\xFDba accountId." }, 400);
    const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(accountId).first();
    if (!account) return json({ success: false, error: "\xDA\u010Det neexistuje." }, 404);
    return json({
      success: true,
      license: {
        status: account.license_status,
        trialUntil: account.trial_until,
        paidUntil: account.paid_until,
        active: isActiveLicense(account)
      }
    });
  } catch {
    return json({ success: false, error: "Kontrola licencie zlyhala." }, 500);
  }
}
__name(onRequestPost15, "onRequestPost");

// api/orders/create.js
function h15() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  };
}
__name(h15, "h");
function j15(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h15() });
}
__name(j15, "j");
function kv11(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv11, "kv");
async function getJson16(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson16, "getJson");
async function putJson10(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson10, "putJson");
function clean2(v) {
  return String(v || "").trim();
}
__name(clean2, "clean");
function orderNumber() {
  const d = /* @__PURE__ */ new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rnd = Math.floor(1e3 + Math.random() * 9e3);
  return `LW-${y}${m}${day}-${rnd}`;
}
__name(orderNumber, "orderNumber");
function fromEmail6(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}
__name(fromEmail6, "fromEmail");
function ownerEmail2(site, env) {
  return site.orderEmail || site.email || site.siteEmail || site.ownerEmail || env.CONTACT_TO || "lechstav@gmail.com";
}
__name(ownerEmail2, "ownerEmail");
function escapeHtml5(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(escapeHtml5, "escapeHtml");
function orderHtml(order, title) {
  const items = (order.items || []).map((x) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml5(x.title)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${escapeHtml5(x.qty)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${escapeHtml5(x.price)}</td>
      </tr>
    `).join("");
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827">
      <div style="max-width:720px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#020617;color:white;padding:24px">
          <h1 style="margin:0;font-size:24px">${escapeHtml5(title)}</h1>
          <p style="margin:8px 0 0;color:#67e8f9;font-weight:bold">${escapeHtml5(order.number)}</p>
        </div>

        <div style="padding:24px">
          <h2 style="margin-top:0">Z\xE1kazn\xEDk</h2>
          <p>
            <b>${escapeHtml5(order.customer?.name)}</b><br>
            ${escapeHtml5(order.customer?.email)}<br>
            ${escapeHtml5(order.customer?.phone)}<br>
            ${escapeHtml5(order.customer?.address)}
          </p>

          ${order.customer?.note ? `<p><b>Pozn\xE1mka:</b><br>${escapeHtml5(order.customer.note)}</p>` : ""}

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
            Web: ${escapeHtml5(order.siteName)}<br>
            D\xE1tum: ${escapeHtml5(order.createdAt)}
          </p>
        </div>
      </div>
    </div>
  `;
}
__name(orderHtml, "orderHtml");
async function sendResend6(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Ch\xFDba RESEND_API_KEY." }
    };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
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
    data
  };
}
__name(sendResend6, "sendResend");
async function onRequestOptions22() {
  return new Response(null, { status: 204, headers: h15() });
}
__name(onRequestOptions22, "onRequestOptions");
async function onRequestPost16({ request, env }) {
  try {
    const store3 = kv11(env);
    if (!store3) return j15({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    const body = await request.json().catch(() => null);
    if (!body) return j15({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const siteSlug = clean2(body.siteSlug || body.slug);
    if (!siteSlug) return j15({ success: false, error: "Ch\xFDba siteSlug." }, 400);
    const site = await getJson16(store3, "site:" + siteSlug);
    if (!site) return j15({ success: false, error: "Web neexistuje." }, 404);
    const customer = {
      name: clean2(body.customer?.name || body.name),
      email: clean2(body.customer?.email || body.email).toLowerCase(),
      phone: clean2(body.customer?.phone || body.phone),
      address: clean2(body.customer?.address || body.address),
      note: clean2(body.customer?.note || body.note)
    };
    if (!customer.name) return j15({ success: false, error: "Ch\xFDba meno." }, 400);
    if (!customer.email && !customer.phone) return j15({ success: false, error: "Zadaj e-mail alebo telef\xF3n." }, 400);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return j15({ success: false, error: "Ko\u0161\xEDk je pr\xE1zdny." }, 400);
    const normalizedItems = items.map((item, index) => ({
      id: clean2(item.id || "item-" + index),
      title: clean2(item.title || item.name || "Produkt"),
      price: clean2(item.price || ""),
      qty: Number(item.qty || 1) || 1,
      image: clean2(item.image || "")
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      emails: {
        ownerSent: false,
        customerSent: false,
        ownerResult: null,
        customerResult: null
      }
    };
    await putJson10(store3, "order:" + order.id, order);
    const siteOrdersKey = "orders:site:" + siteSlug;
    const siteOrders = await getJson16(store3, siteOrdersKey) || [];
    await putJson10(store3, siteOrdersKey, [order.id, ...siteOrders].slice(0, 500));
    const globalOrders = await getJson16(store3, "orders:index") || [];
    await putJson10(store3, "orders:index", [order.id, ...globalOrders].slice(0, 1e3));
    const toOwner = ownerEmail2(site, env);
    const from = fromEmail6(env);
    const ownerMail = await sendResend6(env, {
      from,
      to: toOwner,
      subject: `Nov\xE1 objedn\xE1vka ${order.number} - ${order.siteName}`,
      html: orderHtml(order, "Nov\xE1 objedn\xE1vka"),
      reply_to: customer.email || void 0
    });
    order.emails.ownerSent = ownerMail.ok;
    order.emails.ownerResult = {
      status: ownerMail.status,
      data: ownerMail.data
    };
    if (customer.email) {
      const customerMail = await sendResend6(env, {
        from,
        to: customer.email,
        subject: `Potvrdenie objedn\xE1vky ${order.number}`,
        html: orderHtml(order, "\u010Eakujeme za objedn\xE1vku")
      });
      order.emails.customerSent = customerMail.ok;
      order.emails.customerResult = {
        status: customerMail.status,
        data: customerMail.data
      };
    }
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await putJson10(store3, "order:" + order.id, order);
    return j15({
      success: true,
      message: "Objedn\xE1vka bola odoslan\xE1.",
      order,
      emails: order.emails
    });
  } catch (e) {
    return j15({
      success: false,
      error: "Vytvorenie objedn\xE1vky zlyhalo.",
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
}
__name(onRequestPost16, "onRequestPost");

// api/site/get.js
async function onRequestOptions23() {
  return getCorsResponse();
}
__name(onRequestOptions23, "onRequestOptions");
async function onRequestPost17({ request, env }) {
  try {
    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    const slug = String(body.slug || "").trim();
    let website;
    if (accountId) {
      website = await env.DB.prepare("SELECT * FROM websites WHERE account_id = ?").bind(accountId).first();
    } else if (slug) {
      website = await env.DB.prepare("SELECT * FROM websites WHERE slug = ?").bind(slug).first();
    }
    if (!website) return json({ success: false, error: "Web neexistuje." }, 404);
    const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(website.account_id).first();
    return json({ success: true, website: mapWebsite(website), licenseActive: isActiveLicense(account) });
  } catch {
    return json({ success: false, error: "Na\u010D\xEDtanie webu zlyhalo." }, 500);
  }
}
__name(onRequestPost17, "onRequestPost");
function mapWebsite(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    slug: row.slug,
    template: row.template,
    title: row.title,
    headline: row.headline,
    subheadline: row.subheadline,
    phone: row.phone,
    email: row.email,
    primaryCta: row.primary_cta,
    services: safeJson(row.services_json),
    published: Boolean(row.published)
  };
}
__name(mapWebsite, "mapWebsite");
function safeJson(value) {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}
__name(safeJson, "safeJson");

// api/site/save.js
function h16() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  };
}
__name(h16, "h");
function j16(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h16() });
}
__name(j16, "j");
function kv12(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv12, "kv");
async function getJson17(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson17, "getJson");
async function putJson11(store3, key, value) {
  await store3.put(key, JSON.stringify(value));
}
__name(putJson11, "putJson");
function slugify4(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify4, "slugify");
function normalizeProduct2(p, index) {
  return {
    id: String(p.id || "p" + (index + 1)),
    title: String(p.title || p.name || "Produkt " + (index + 1)),
    code: String(p.code || ""),
    price: String(p.price || ""),
    oldPrice: String(p.oldPrice || ""),
    image: String(p.image || ""),
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    shortText: String(p.shortText || p.description || ""),
    longText: String(p.longText || ""),
    badge: String(p.badge || ""),
    category: String(p.category || ""),
    availability: String(p.availability || "Skladom"),
    visibility: String(p.visibility || "visible"),
    stock: String(p.stock || ""),
    vat: String(p.vat || ""),
    detailUrl: String(p.detailUrl || "#"),
    seoTitle: String(p.seoTitle || ""),
    seoDescription: String(p.seoDescription || ""),
    relatedProducts: String(p.relatedProducts || ""),
    youtube: String(p.youtube || ""),
    ...p
  };
}
__name(normalizeProduct2, "normalizeProduct");
function normalizeWebsite2(input, account) {
  const w = input && typeof input === "object" ? input : {};
  const companyName = String(w.companyName || account.companyName || "");
  const slug = slugify4(w.slug || companyName || account.email || account.id);
  const existingProducts = Array.isArray(w.eshop?.products) ? w.eshop.products : Array.isArray(w.products) ? w.products : [];
  const products = existingProducts.map(normalizeProduct2);
  return {
    ...w,
    slug,
    companyName,
    headline: String(w.headline || companyName || ""),
    description: String(w.description || ""),
    homepageText: String(w.homepageText || ""),
    phone: String(w.phone || ""),
    email: String(w.email || w.siteEmail || account.email || ""),
    siteEmail: String(w.siteEmail || w.email || account.email || ""),
    ownerEmail: account.email,
    template: String(w.template || account.template || "E-shop"),
    theme: {
      accent: "lechweb",
      logo: "",
      heroImage: "",
      ...w.theme || {}
    },
    modules: {
      ...w.modules || {}
    },
    eshop: {
      enabled: true,
      ...w.eshop || {},
      products,
      sidebar: {
        ...w.eshop?.sidebar || {}
      }
    },
    products,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(normalizeWebsite2, "normalizeWebsite");
async function onRequestOptions24() {
  return new Response(null, { status: 204, headers: h16() });
}
__name(onRequestOptions24, "onRequestOptions");
async function onRequestGet14({ env }) {
  const store3 = kv12(env);
  let kvOk = false;
  let error = null;
  if (store3) {
    try {
      await store3.put("_health/site-save.txt", "ok " + (/* @__PURE__ */ new Date()).toISOString());
      kvOk = true;
    } catch (e) {
      error = String(e && e.message ? e.message : e);
    }
  }
  return j16({
    success: true,
    endpoint: "/api/site/save",
    mode: "robust-customer-product-saving",
    kvBindingFound: Boolean(store3),
    kvWriteOk: kvOk,
    kvError: error,
    saves: [
      "website",
      "website.eshop.products",
      "website.products",
      "website.modules",
      "website.theme"
    ]
  });
}
__name(onRequestGet14, "onRequestGet");
async function onRequestPost18({ request, env }) {
  try {
    const store3 = kv12(env);
    if (!store3) return j16({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." }, 500);
    const body = await request.json().catch(() => null);
    if (!body) return j16({ success: false, error: "Neplatn\xFD JSON." }, 400);
    const email3 = String(body.email || body.accountEmail || body.ownerEmail || "").trim().toLowerCase();
    if (!email3) return j16({ success: false, error: "Ch\xFDba email \xFA\u010Dtu." }, 400);
    const account = await getJson17(store3, "user:" + email3);
    if (!account) return j16({ success: false, error: "\xDA\u010Det neexistuje: " + email3 }, 404);
    const website = normalizeWebsite2(body.website || body.site || body, account);
    account.website = website;
    account.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await putJson11(store3, "user:" + account.email, account);
    if (account.id) await putJson11(store3, "account:" + account.id, account);
    await putJson11(store3, "site:" + website.slug, website);
    const siteIndex = await getJson17(store3, "sites:index") || [];
    const nextIndex = [website.slug, ...siteIndex.filter((x) => x !== website.slug)].slice(0, 1e3);
    await putJson11(store3, "sites:index", nextIndex);
    return j16({
      success: true,
      message: "Web bol ulo\u017Een\xFD.",
      mode: "robust-customer-product-saving",
      account,
      website,
      publicUrl: new URL(request.url).origin + "/site/" + website.slug,
      savedProducts: website.eshop?.products?.length || 0
    });
  } catch (e) {
    return j16({
      success: false,
      error: "Ulo\u017Eenie webu zlyhalo.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : "")
    }, 500);
  }
}
__name(onRequestPost18, "onRequestPost");

// api/sites/create.js
async function onRequestPost19({ request, env }) {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) return json2({ success: false, error: "Najprv sa prihl\xE1s." }, 401);
    if (!isLicenseActive(user)) return json2({ success: false, error: "Trial alebo licencia vypr\u0161ala. Pred pokra\u010Dovan\xEDm treba aktivova\u0165 predplatn\xE9." }, 402);
    const body = await request.json();
    const businessName = String(body.businessName || "").trim();
    const template = String(body.template || "").trim();
    const phone = String(body.phone || "").trim();
    const description = String(body.description || "").trim();
    if (!businessName || !template || !description) return json2({ success: false, error: "Vypl\u0148 n\xE1zov firmy, \u0161abl\xF3nu a popis webu." }, 400);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const siteId = randomId("site");
    await env.DB.prepare(`INSERT INTO sites (id,user_id,business_name,template,phone,description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`).bind(siteId, user.id, businessName, template, phone, description, "requested", now, now).run();
    return json2({ success: true, siteId });
  } catch {
    return json2({ success: false, error: "Po\u017Eiadavku na web sa nepodarilo ulo\u017Ei\u0165." }, 500);
  }
}
__name(onRequestPost19, "onRequestPost");

// site/[slug]/admin-dopyty.js
function h17(contentType = "text/html; charset=utf-8") {
  return { "content-type": contentType };
}
__name(h17, "h");
function kv13(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv13, "kv");
async function getJson18(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson18, "getJson");
function esc(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(esc, "esc");
function isActive3(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(isActive3, "isActive");
function accent(site) {
  const a = String(site.theme?.accent || "lechweb").toLowerCase();
  if (a === "fuchsia") return "#e879f9";
  if (a === "violet") return "#a78bfa";
  if (a === "emerald") return "#34d399";
  if (a === "orange") return "#fb923c";
  return "#67e8f9";
}
__name(accent, "accent");
function statusText2(s) {
  return {
    new: "Nov\xFD",
    contacted: "Kontaktovan\xFD",
    closed: "Vyrie\u0161en\xFD",
    spam: "Spam"
  }[s] || s || "Nov\xFD";
}
__name(statusText2, "statusText");
async function onRequestGet15({ params, env, request }) {
  const store3 = kv13(env);
  if (!store3) return new Response("KV nie je nastaven\xE9.", { status: 500 });
  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson18(store3, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });
  const acc = await getJson18(store3, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!isActive3(acc)) return new Response("Web je pozastaven\xFD. Licencia nie je akt\xEDvna.", { status: 402 });
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
<button>Otvori\u0165</button>
</form>
</body>
</html>`;
    return new Response(loginHtml, { headers: h17() });
  }
  const index = await getJson18(store3, "inquiries:site:" + slug) || [];
  const inquiries = [];
  for (const id of index.slice(0, 100)) {
    const inquiry = await getJson18(store3, "inquiry:" + id);
    if (inquiry) inquiries.push(inquiry);
  }
  const a = accent(site);
  const rows = inquiries.map((x) => `
    <tr onclick="openDetail('${esc(x.id)}')" data-id="${esc(x.id)}">
      <td><b>${esc(x.number)}</b></td>
      <td>${esc(x.customer?.name)}</td>
      <td>${esc(x.customer?.email || x.customer?.phone)}</td>
      <td>${esc(x.subject)}</td>
      <td><span class="pill">${esc(statusText2(x.status))}</span></td>
      <td>${esc((x.createdAt || "").slice(0, 10))}</td>
    </tr>
  `).join("");
  const details = inquiries.map((x) => `
    <section class="detail" id="detail-${esc(x.id)}">
      <h2>${esc(x.number)}</h2>
      <div class="box">
        <b>${esc(x.customer?.name)}</b><br>
        ${esc(x.customer?.email)}<br>
        ${esc(x.customer?.phone)}
      </div>

      <div class="box">
        <b>Predmet:</b> ${esc(x.subject)}<br>
        <b>Produkt / t\xE9ma:</b> ${esc(x.product)}<br><br>
        <div class="message">${esc(x.message)}</div>
      </div>

      <label>Stav</label>
      <select id="status-${esc(x.id)}">
        <option value="new" ${x.status === "new" ? "selected" : ""}>Nov\xFD</option>
        <option value="contacted" ${x.status === "contacted" ? "selected" : ""}>Kontaktovan\xFD</option>
        <option value="closed" ${x.status === "closed" ? "selected" : ""}>Vyrie\u0161en\xFD</option>
        <option value="spam" ${x.status === "spam" ? "selected" : ""}>Spam</option>
      </select>

      <label>Intern\xE1 pozn\xE1mka</label>
      <textarea id="note-${esc(x.id)}">${esc(x.adminNote || "")}</textarea>

      <button onclick="saveInquiry('${esc(x.id)}')">Ulo\u017Ei\u0165 dopyt</button>
      <div class="msg" id="msg-${esc(x.id)}"></div>
    </section>
  `).join("");
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
.page{width:min(1400px,calc(100% - 32px));margin:24px auto;display:grid;grid-template-columns:1fr 420px;gap:20px}
.card{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:22px}
h1,h2{margin-top:0}
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
@media(max-width:900px){.page{grid-template-columns:1fr}.nav{display:none}}
</style>
</head>
<body>
<header class="top">
  <a class="logo" href="/site/${esc(slug)}">${esc(site.companyName)} \u2014 Dopyty</a>
  <nav class="nav">
    <a href="/site/${esc(slug)}">Verejn\xFD web</a>
    <a href="/site/${esc(slug)}/kontakt">Kontakt formul\xE1r</a>
  </nav>
</header>

<main class="page">
  <section class="card">
    <h1>Dopyty z webu</h1>
    ${inquiries.length ? `
      <table>
        <thead>
          <tr>
            <th>\u010C\xEDslo</th>
            <th>Meno</th>
            <th>Kontakt</th>
            <th>Predmet</th>
            <th>Stav</th>
            <th>D\xE1tum</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    ` : `<div class="empty">Zatia\u013E nie s\xFA \u017Eiadne dopyty.</div>`}
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
  msg.textContent = "Uklad\xE1m...";

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
    if (!data.success) throw new Error(data.error || "Ulo\u017Eenie zlyhalo.");

    msg.textContent = "Ulo\u017Een\xE9.";
  } catch (err) {
    msg.textContent = err.message;
  }
}

const first = document.querySelector(".detail");
if (first) first.classList.add("open");
<\/script>
</body>
</html>`;
  return new Response(html, { headers: h17() });
}
__name(onRequestGet15, "onRequestGet");

// site/[slug]/admin-zakaznici.js
function h18(contentType = "text/html; charset=utf-8") {
  return { "content-type": contentType };
}
__name(h18, "h");
function kv14(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv14, "kv");
async function getJson19(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson19, "getJson");
function esc2(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(esc2, "esc");
function isActive4(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(isActive4, "isActive");
function accent2(site) {
  const a = String(site.theme?.accent || "lechweb").toLowerCase();
  if (a === "fuchsia") return "#e879f9";
  if (a === "violet") return "#a78bfa";
  if (a === "emerald") return "#34d399";
  if (a === "orange") return "#fb923c";
  return "#67e8f9";
}
__name(accent2, "accent");
async function onRequestGet16({ params, env, request }) {
  const store3 = kv14(env);
  if (!store3) return new Response("KV nie je nastaven\xE9.", { status: 500 });
  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson19(store3, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });
  const acc = await getJson19(store3, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!isActive4(acc)) return new Response("Web je pozastaven\xFD. Licencia nie je akt\xEDvna.", { status: 402 });
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  const url = new URL(request.url);
  const suppliedPin = url.searchParams.get("pin") || "";
  const pinOk = !pin || suppliedPin === pin;
  if (!pinOk) {
    const loginHtml = `<!doctype html>
<html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Z\xE1kazn\xEDci | ${esc2(site.companyName)}</title>
<style>body{margin:0;font-family:Arial,sans-serif;background:#020617;color:white;display:grid;place-items:center;min-height:100vh}.card{width:min(420px,calc(100% - 32px));border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#0f172a;padding:28px}input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.15);background:#020617;color:white;border-radius:14px;padding:14px;margin:12px 0}button{width:100%;border:0;background:#67e8f9;color:#020617;border-radius:14px;padding:14px;font-weight:900}</style></head>
<body><form class="card" onsubmit="event.preventDefault(); location.search='?pin='+encodeURIComponent(document.getElementById('pin').value)"><h1>Admin z\xE1kazn\xEDci</h1><p>Zadaj ADMIN_PIN.</p><input id="pin" placeholder="ADMIN_PIN" type="password"><button>Otvori\u0165</button></form></body></html>`;
    return new Response(loginHtml, { headers: h18() });
  }
  const a = accent2(site);
  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Z\xE1kazn\xEDci | ${esc2(site.companyName)}</title>
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
  <a class="logo" href="/site/${esc2(slug)}">${esc2(site.companyName)} \u2014 Z\xE1kazn\xEDci</a>
  <nav class="nav">
    <a href="/site/${esc2(slug)}">Verejn\xFD web</a>
    <a href="/site/${esc2(slug)}/admin-dopyty?pin=${esc2(suppliedPin)}">Dopyty</a>
  </nav>
</header>

<main class="page">
  <section class="cards">
    <div class="stat">V\u0161etci <b id="sTotal">0</b></div>
    <div class="stat">VIP <b id="sVip">0</b></div>
    <div class="stat">Ve\u013Ekoobchod <b id="sWholesale">0</b></div>
    <div class="stat">S emailom <b id="sEmail">0</b></div>
  </section>

  <section class="card">
    <h1>Preh\u013Ead z\xE1kazn\xEDkov</h1>
    <div class="filters">
      <input id="q" placeholder="Meno, email, telef\xF3n">
      <select id="type">
        <option value="">V\u0161etci</option>
        <option value="vip">VIP</option>
        <option value="velkoobchod">Ve\u013Ekoobchod</option>
        <option value="bez-objednavky">Bez objedn\xE1vky</option>
      </select>
      <select id="mailTarget">
        <option value="all">V\u0161etk\xFDm z filtra</option>
        <option value="vip">Len VIP</option>
        <option value="email">Len s emailom</option>
      </select>
      <button onclick="loadCustomers()">Filtrova\u0165</button>
    </div>

    <div id="table"></div>
  </section>

  <section class="card">
    <h2>Hromadn\xFD info mail</h2>
    <div class="mail">
      <input id="subject" placeholder="Predmet emailu" value="Novinky a akcie">
      <textarea id="message">Dobr\xFD de\u0148,

pripravili sme pre V\xE1s nov\xE9 inform\xE1cie, akcie a novinky z na\u0161ej ponuky.

V pr\xEDpade z\xE1ujmu n\xE1s nev\xE1hajte kontaktova\u0165.

S pozdravom
${esc2(site.companyName)}</textarea>
      <button onclick="sendMail()">Odosla\u0165 info mail</button>
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
    document.getElementById("table").innerHTML = "<p>\u017Diadni z\xE1kazn\xEDci.</p>";
    return;
  }

  document.getElementById("table").innerHTML = '<table><thead><tr><th>Z\xE1kazn\xEDk</th><th>Kontakt</th><th>Typ</th><th>Objedn\xE1vky</th><th>Dopyty</th><th>Posledn\xE1 aktivita</th></tr></thead><tbody>' +
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
    msg.textContent = "Nie s\xFA vybran\xED \u017Eiadni pr\xEDjemcovia.";
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

    msg.textContent = "Odoslan\xE9: " + data.sent + ", chyba: " + data.failed;
  } catch (err) {
    msg.textContent = err.message;
  }
}

loadCustomers();
<\/script>
</body>
</html>`;
  return new Response(html, { headers: h18() });
}
__name(onRequestGet16, "onRequestGet");

// site/[slug]/kontakt.js
function kv15(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv15, "kv");
async function getJson20(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson20, "getJson");
function esc3(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(esc3, "esc");
function isActive5(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(isActive5, "isActive");
function getTheme(theme) {
  const id = String(theme?.accent || theme || "lechweb").toLowerCase();
  const themes = {
    lechweb: ["#67e8f9", "#e879f9", "#03040a", "#0f172a", "rgba(103,232,249,.65)", false],
    cyan: ["#67e8f9", "#22d3ee", "#03040a", "#0f172a", "rgba(34,211,238,.65)", false],
    fuchsia: ["#e879f9", "#67e8f9", "#05030a", "#14091f", "rgba(232,121,249,.65)", false],
    violet: ["#a78bfa", "#e879f9", "#070512", "#141026", "rgba(167,139,250,.65)", false],
    emerald: ["#34d399", "#67e8f9", "#03110c", "#082018", "rgba(52,211,153,.65)", false],
    orange: ["#fb923c", "#facc15", "#130902", "#211006", "rgba(251,146,60,.65)", false],
    kawasaki: ["#39ff14", "#b6ff00", "#020800", "#061a03", "rgba(57,255,20,.78)", false],
    acidyellow: ["#fff200", "#39ff14", "#0b0b00", "#1a1800", "rgba(255,242,0,.76)", false],
    sharpered: ["#ff073a", "#ff7a00", "#110004", "#210008", "rgba(255,7,58,.72)", false],
    rgbglow: ["#00f5ff", "#ff00f5", "#02020a", "#09091a", "rgba(0,245,255,.74)", true]
  };
  const t = themes[id] || themes.lechweb;
  return { accent: t[0], accent2: t[1], dark: t[2], panel: t[3], glow: t[4], rgb: t[5] };
}
__name(getTheme, "getTheme");
function accent3(site) {
  return getTheme(site.theme).accent;
}
__name(accent3, "accent");
async function onRequestGet17({ params, env }) {
  const store3 = kv15(env);
  if (!store3) return new Response("KV nie je nastaven\xE9.", { status: 500 });
  const slug = String(params.slug || "").trim().toLowerCase();
  const site = await getJson20(store3, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });
  const acc = await getJson20(store3, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!isActive5(acc)) return new Response("Web je pozastaven\xFD. Licencia nie je akt\xEDvna.", { status: 402 });
  const a = accent3(site);
  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kontakt | ${esc3(site.companyName)}</title>
<meta name="description" content="Kontaktujte ${esc3(site.companyName)}. Po\u0161lite dopyt k produktu, dodaniu alebo slu\u017Ebe.">
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
    <a class="logo" href="/site/${esc3(slug)}">${esc3(site.companyName)}</a>
    <nav class="nav">
      <a href="/site/${esc3(slug)}">Domov</a>
      <a href="/site/${esc3(slug)}#produkty">Produkty</a>
      <a href="/site/${esc3(slug)}/kontakt">Kontakt</a>
    </nav>
  </div>
</header>

<main class="container">
  <section class="hero">
    <h1>Kontaktujte n\xE1s</h1>
    <p>Po\u0161lite dopyt k produktu, v\xFDbave, dodaniu alebo slu\u017Ebe. Odpovieme v\xE1m \u010Do najsk\xF4r.</p>
  </section>

  <section class="grid">
    <div class="card">
      <form class="form" onsubmit="sendInquiry(event)">
        <input id="name" placeholder="Meno a priezvisko" required>
        <input id="email" placeholder="E-mail">
        <input id="phone" placeholder="Telef\xF3n">
        <input id="product" placeholder="Produkt alebo t\xE9ma">
        <select id="subject">
          <option>Dopyt k produktu</option>
          <option>Doprava a dodanie</option>
          <option>Servis</option>
          <option>Cenov\xE1 ponuka</option>
          <option>In\xE9</option>
        </select>
        <textarea id="message" placeholder="Nap\xED\u0161te spr\xE1vu"></textarea>
        <button type="submit">Odosla\u0165 dopyt</button>
        <div class="msg" id="msg"></div>
      </form>
    </div>

    <aside class="card info">
      <div class="info-row">
        <strong>Firma</strong>
        <span>${esc3(site.companyName)}</span>
      </div>
      <div class="info-row">
        <strong>E-mail</strong>
        <a href="mailto:${esc3(site.email || site.siteEmail || site.ownerEmail || "")}">${esc3(site.email || site.siteEmail || site.ownerEmail || "")}</a>
      </div>
      <div class="info-row">
        <strong>Telef\xF3n</strong>
        <a href="tel:${esc3(site.phone || "")}">${esc3(site.phone || "")}</a>
      </div>
      <div class="info-row">
        <strong>Web</strong>
        <a href="/site/${esc3(slug)}">Sp\xE4\u0165 na web</a>
      </div>
    </aside>
  </section>
</main>

<footer class="footer">
  <div class="container">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${esc3(site.companyName)} \u2022 Vytvoren\xE9 cez Lech-Web</div>
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

    msg.textContent = "Dopyt bol odoslan\xFD. \u010C\xEDslo: " + data.inquiry.number;
    event.target.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
}
<\/script>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
__name(onRequestGet17, "onRequestGet");

// site/[slug]/[page].js
function kv16(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv16, "kv");
async function getJson21(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson21, "getJson");
function active2(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(active2, "active");
function esc4(v) {
  return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
__name(esc4, "esc");
function accent4(theme) {
  const a = String(theme?.accent || "cyan").toLowerCase();
  if (a === "pink") return ["#e879f9", "#67e8f9"];
  if (a === "orange") return ["#fb923c", "#facc15"];
  if (a === "violet") return ["#a78bfa", "#67e8f9"];
  if (a === "lime") return ["#bef264", "#67e8f9"];
  return ["#67e8f9", "#e879f9"];
}
__name(accent4, "accent");
function findPage(site, pageSlug) {
  const pages = Array.isArray(site.pages) && site.pages.length ? site.pages : [{
    id: "home",
    title: "Domov",
    slug: "",
    headline: site.headline || site.companyName,
    description: site.description || "",
    heroImage: site.theme?.heroImage || "",
    sections: [
      { type: "services", title: "Slu\u017Eby", items: [] },
      { type: "contact", title: "Kontakt" }
    ]
  }];
  const clean3 = String(pageSlug || "").replace(/^\/+|\/+$/g, "");
  return pages.find((p) => String(p.slug || "") === clean3) || pages[0];
}
__name(findPage, "findPage");
function nav(site) {
  const pages = Array.isArray(site.pages) ? site.pages : [];
  return pages.map((p, i) => {
    const href = i === 0 || !p.slug ? `/site/${site.slug}` : `/site/${site.slug}/${p.slug}`;
    return `<a href="${href}">${esc4(p.title || "Str\xE1nka")}</a>`;
  }).join("");
}
__name(nav, "nav");
function renderSection(section, site) {
  const type = String(section.type || "text").toLowerCase();
  if (type === "services") {
    const items = Array.isArray(section.items) && section.items.length ? section.items : ["Slu\u017Eba 1", "Slu\u017Eba 2", "Slu\u017Eba 3"];
    return `<section class="section"><div class="wrap">
      <div class="section-head"><div><div class="kicker">Slu\u017Eby</div><h2>${esc4(section.title || "Slu\u017Eby")}</h2></div><p>${esc4(section.text || "Preh\u013Eadn\xE9 slu\u017Eby, ktor\xE9 si z\xE1kazn\xEDk vie upravi\u0165 vo vlastnom editore.")}</p></div>
      <div class="service-grid">${items.map((x, i) => `<div class="service-card"><span>${String(i + 1).padStart(2, "0")}</span><strong>${esc4(x)}</strong><p>Jasne pop\xEDsan\xE1 ponuka pripraven\xE1 pre dopyt z\xE1kazn\xEDka.</p></div>`).join("")}</div>
    </div></section>`;
  }
  if (type === "gallery") {
    const imgs = Array.isArray(section.images) ? section.images : [];
    if (!imgs.length) return "";
    return `<section class="section"><div class="wrap">
      <div class="section-head"><div><div class="kicker">Gal\xE9ria</div><h2>${esc4(section.title || "Gal\xE9ria")}</h2></div><p>${esc4(section.text || "Obr\xE1zky a realiz\xE1cie, ktor\xE9 si z\xE1kazn\xEDk nastav\xED s\xE1m.")}</p></div>
      <div class="gallery">${imgs.map((img) => `<figure><img src="${esc4(img.url || img)}" alt="${esc4(img.title || "")}" loading="lazy"/><figcaption>${esc4(img.title || "")}</figcaption></figure>`).join("")}</div>
    </div></section>`;
  }
  if (type === "contact") {
    return `<section class="contact" id="kontakt"><div class="wrap"><div class="contact-panel">
      <div><div class="kicker">Kontakt</div><h2>${esc4(section.title || "Kontaktujte n\xE1s")}</h2><p class="lead">${esc4(section.text || "Nap\xED\u0161te n\xE1m a ozveme sa sp\xE4\u0165.")}</p><a class="btn btn-primary" href="mailto:${esc4(site.email || site.ownerEmail)}">Posla\u0165 dopyt \u2192</a></div>
      <div class="contact-list"><div class="contact-item"><strong>Firma</strong>${esc4(site.companyName)}</div>${site.phone ? `<div class="contact-item"><strong>Telef\xF3n</strong>${esc4(site.phone)}</div>` : ""}<div class="contact-item"><strong>E-mail</strong>${esc4(site.email || site.ownerEmail)}</div></div>
    </div></div></section>`;
  }
  return `<section class="section"><div class="wrap">
    <div class="text-block"><div class="kicker">${esc4(section.type || "Sekcia")}</div><h2>${esc4(section.title || "Sekcia")}</h2><p>${esc4(section.text || "")}</p></div>
  </div></section>`;
}
__name(renderSection, "renderSection");
async function onRequestGet18({ params, env }) {
  const store3 = kv16(env);
  if (!store3) return new Response("KV nie je nastaven\xE9.", { status: 500 });
  const slug = String(params.slug || "").trim().toLowerCase();
  const pagePath = String(params.page || "").trim().toLowerCase();
  const site = await getJson21(store3, "site:" + slug);
  if (!site) return new Response("Web neexistuje.", { status: 404 });
  const acc = await getJson21(store3, "user:" + String(site.ownerEmail || "").toLowerCase());
  if (!active2(acc)) return new Response("Web je pozastaven\xFD. Licencia nie je akt\xEDvna.", { status: 402 });
  const page = findPage(site, pagePath);
  const [a1, a2] = accent4(site.theme);
  const heroImage = page.heroImage || site.theme?.heroImage || "";
  const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc4(page.title || site.companyName)} | ${esc4(site.companyName)}</title>
<meta name="description" content="${esc4(page.description || site.description || "")}"/>
<style>
:root{--a:${a1};--b:${a2};--bg:#03040a;--text:#fff;--muted:#cbd5e1;--soft:#94a3b8}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--a) 24%,transparent),transparent 32%),radial-gradient(circle at 88% 18%,color-mix(in srgb,var(--b) 24%,transparent),transparent 34%),#03040a;color:white;font-family:Inter,Arial,sans-serif}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.8),rgba(0,0,0,.2))}
.wrap{width:min(1180px,calc(100% - 36px));margin:0 auto}
.nav{position:sticky;top:0;z-index:20;backdrop-filter:blur(18px);background:rgba(3,4,10,.76);border-bottom:1px solid rgba(255,255,255,.08)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
.logo{display:flex;align-items:center;gap:12px;font-weight:950;letter-spacing:-.04em}
.logo img{width:42px;height:42px;object-fit:cover;border-radius:14px;box-shadow:0 0 25px var(--a)}
.logo-mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 0 30px var(--a)}
.nav-links{display:flex;gap:18px;align-items:center;color:var(--muted);font-weight:800}
.nav-links a{text-decoration:none;color:inherit}
.nav-cta{padding:12px 16px;border-radius:999px;background:var(--a);color:#020617!important;text-decoration:none;font-weight:950;box-shadow:0 0 28px var(--a)}
.hero{padding:90px 0 76px}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:32px;align-items:center}
.badge{display:inline-flex;padding:11px 16px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid color-mix(in srgb,var(--a) 50%,transparent);color:var(--a);font-weight:950;text-transform:uppercase;font-size:12px;letter-spacing:.18em}
h1{font-size:clamp(48px,8vw,108px);line-height:.88;letter-spacing:-.08em;margin:25px 0 24px}
.lead{font-size:clamp(18px,2.2vw,24px);line-height:1.65;color:var(--muted);max-width:760px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;padding:16px 22px;text-decoration:none;font-weight:950;border:1px solid rgba(255,255,255,.14)}
.btn-primary{background:var(--a);color:#020617;box-shadow:0 0 36px var(--a)}
.hero-media{min-height:380px;border:1px solid rgba(255,255,255,.14);border-radius:36px;background:${heroImage ? `url("${esc4(heroImage)}") center/cover` : "linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.035))"};box-shadow:0 0 70px rgba(0,0,0,.35);position:relative;overflow:hidden}
.hero-media:after{content:"";position:absolute;inset:0;background:linear-gradient(145deg,transparent,rgba(0,0,0,.35)),radial-gradient(circle at 30% 30%,color-mix(in srgb,var(--a) 40%,transparent),transparent 35%)}
.section{padding:58px 0}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:24px}
.kicker{color:var(--a);font-weight:950;text-transform:uppercase;letter-spacing:.24em;font-size:12px}
h2{font-size:clamp(34px,5vw,66px);line-height:.95;letter-spacing:-.06em;margin:10px 0 0}
.section-head p{max-width:540px;color:var(--muted);line-height:1.7}
.service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.service-card,.contact-panel,.text-block{border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));padding:24px}
.service-card span{display:inline-flex;width:42px;height:42px;border-radius:15px;align-items:center;justify-content:center;background:var(--a);color:#020617;font-weight:950;margin-bottom:18px}
.service-card strong{font-size:22px;display:block;margin-bottom:12px}
.service-card p,.text-block p{color:var(--muted);line-height:1.65}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.gallery figure{margin:0;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.gallery img{width:100%;height:260px;object-fit:cover;display:block}
.gallery figcaption{padding:14px;color:var(--muted)}
.contact{padding:70px 0 90px}
.contact-panel{display:grid;grid-template-columns:1fr .85fr;gap:24px;align-items:center;background:radial-gradient(circle at 15% 20%,color-mix(in srgb,var(--a) 20%,transparent),transparent 30%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))}
.contact-list{display:grid;gap:14px}
.contact-item{padding:18px;border-radius:20px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.1);color:var(--muted)}
.contact-item strong{display:block;color:white;margin-bottom:6px}
.footer{border-top:1px solid rgba(255,255,255,.08);padding:24px 0;color:var(--soft);font-size:14px}
@media(max-width:900px){.hero-grid,.contact-panel{grid-template-columns:1fr}.service-grid,.gallery{grid-template-columns:1fr}.nav-links{display:none}.hero{padding-top:54px}}
</style>
</head>
<body>
<nav class="nav"><div class="wrap nav-inner">
  <div class="logo">${site.theme?.logo ? `<img src="${esc4(site.theme.logo)}" alt="${esc4(site.companyName)}"/>` : `<span class="logo-mark"></span>`}<span>${esc4(site.companyName)}</span></div>
  <div class="nav-links">${nav(site)}<a class="nav-cta" href="#kontakt">Kontakt</a></div>
</div></nav>

<header class="hero"><div class="wrap hero-grid">
  <div><div class="badge">${esc4(site.template || "Lech-Web")}</div><h1>${esc4(page.headline || site.headline || site.companyName)}</h1><p class="lead">${esc4(page.description || site.description || "Modern\xFD web vytvoren\xFD cez Lech-Web.")}</p><a class="btn btn-primary" href="#kontakt">Kontaktova\u0165 \u2192</a></div>
  <div class="hero-media"></div>
</div></header>

${(page.sections || []).map((s) => renderSection(s, site)).join("")}

<footer class="footer"><div class="wrap">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${esc4(site.companyName)} \u2022 Web vytvoren\xFD cez Lech-Web</div></footer>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
__name(onRequestGet18, "onRequestGet");

// api/builder.js
function h19() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin"
  };
}
__name(h19, "h");
function j17(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h19() });
}
__name(j17, "j");
function store2(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(store2, "store");
async function getJson22(kv18, key) {
  const raw = await kv18.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson22, "getJson");
async function putJson12(kv18, key, value) {
  await kv18.put(key, JSON.stringify(value));
}
__name(putJson12, "putJson");
function email2(v) {
  return String(v || "").trim().toLowerCase();
}
__name(email2, "email");
function slugify5(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify5, "slugify");
function active3(acc) {
  if (!acc) return false;
  if (acc.status === "blocked" || acc.status === "suspended") return false;
  if (acc.status === "active") return true;
  const now = Date.now();
  const trial = acc.trialUntil ? Date.parse(acc.trialUntil) : 0;
  const paid = acc.paidUntil ? Date.parse(acc.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(active3, "active");
function pub2(acc) {
  const x = { ...acc };
  delete x.password;
  return x;
}
__name(pub2, "pub");
function lines2(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "").split("\n").map((x) => x.trim()).filter(Boolean);
}
__name(lines2, "lines");
function normalizeProducts2(value) {
  if (Array.isArray(value) && value.length) {
    return value.map((p, i) => ({
      id: String(p.id || `product-${i + 1}`),
      title: String(p.title || p.name || `Produkt ${i + 1}`),
      price: String(p.price || ""),
      oldPrice: String(p.oldPrice || ""),
      image: String(p.image || p.imageUrl || ""),
      shortText: String(p.shortText || p.description || ""),
      category: String(p.category || ""),
      badge: String(p.badge || ""),
      detailUrl: String(p.detailUrl || "")
    }));
  }
  return [
    {
      id: "product-1",
      title: "Uk\xE1\u017Ekov\xFD produkt",
      price: "\u20AC999",
      oldPrice: "",
      image: "",
      shortText: "Kr\xE1tky popis produktu.",
      category: "Novinky",
      badge: "TIP",
      detailUrl: ""
    }
  ];
}
__name(normalizeProducts2, "normalizeProducts");
function defaultSidebar2(body, site) {
  return {
    categories: lines2(body.categories).length ? lines2(body.categories) : [
      "Hlavn\xE1 kateg\xF3ria",
      "Ak\u010Dn\xFD tovar",
      "Novinky",
      "Najpred\xE1vanej\u0161ie",
      "Doplnky",
      "V\xFDpredaj"
    ],
    contactTitle: String(body.sidebarContactTitle || "Kontakt"),
    contactName: String(body.sidebarContactName || site.companyName || ""),
    contactEmail: String(body.sidebarContactEmail || site.email || site.ownerEmail || ""),
    contactPhone: String(body.sidebarContactPhone || site.phone || ""),
    searchEnabled: body.searchEnabled !== false,
    adviceLinks: Array.isArray(body.adviceLinks) ? body.adviceLinks : [
      { title: "Ako nakupova\u0165", url: "#" },
      { title: "Obchodn\xE9 podmienky", url: "#" },
      { title: "Ochrana osobn\xFDch \xFAdajov", url: "#" }
    ],
    youtube: Array.isArray(body.youtube) ? body.youtube : [
      { title: "YouTube kan\xE1l", url: "#" }
    ],
    customBlocks: Array.isArray(body.sidebarBlocks) ? body.sidebarBlocks : []
  };
}
__name(defaultSidebar2, "defaultSidebar");
async function indexAccount2(kv18, acc) {
  await putJson12(kv18, "user:" + acc.email, acc);
  await putJson12(kv18, "account:" + acc.id, acc);
  const list2 = await getJson22(kv18, "accounts:index") || [];
  const row = {
    id: acc.id,
    email: acc.email,
    companyName: acc.companyName,
    plan: acc.plan,
    template: acc.template,
    status: acc.status,
    trialUntil: acc.trialUntil,
    paidUntil: acc.paidUntil || null,
    source: acc.source || "lech-web",
    createdAt: acc.createdAt,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    website: acc.website || null
  };
  const next = list2.some((a) => a.id === acc.id) ? list2.map((a) => a.id === acc.id ? row : a) : [row, ...list2];
  await putJson12(kv18, "accounts:index", next.slice(0, 500));
}
__name(indexAccount2, "indexAccount");
async function onRequestOptions25() {
  return new Response(null, { status: 204, headers: h19() });
}
__name(onRequestOptions25, "onRequestOptions");
async function onRequestGet19({ env }) {
  const kv18 = store2(env);
  let ok = false;
  let err = null;
  if (kv18) {
    try {
      await kv18.put("site-save-eshop-health", (/* @__PURE__ */ new Date()).toISOString());
      ok = true;
    } catch (e) {
      err = String(e && e.message ? e.message : e);
    }
  }
  return j17({
    success: true,
    endpoint: "/api/site/save",
    mode: "eshop-shoptet-style",
    kvBindingFound: Boolean(kv18),
    kvWriteOk: ok,
    kvError: err,
    supports: [
      "top menu",
      "left categories",
      "contact sidebar",
      "search sidebar",
      "advice links",
      "youtube links",
      "product grid",
      "homepage description",
      "footer",
      "products",
      "categories"
    ]
  });
}
__name(onRequestGet19, "onRequestGet");
async function onRequestPost20({ request, env }) {
  try {
    const kv18 = store2(env);
    if (!kv18) return j17({ success: false, error: "Ch\xFDba KV binding LECHWEB_KV." });
    const body = await request.json().catch(() => null);
    if (!body) return j17({ success: false, error: "Neplatn\xFD JSON." });
    const accountEmail = email2(
      body.accountEmail || body.userEmail || body.ownerEmail || body.customerEmail || body.loginEmail || body.email || body.siteEmail || body.publicEmail || body.contactEmail
    );
    if (!accountEmail) return j17({ success: false, error: "Ch\xFDba e-mail \xFA\u010Dtu.", receivedKeys: Object.keys(body) });
    const acc = await getJson22(kv18, "user:" + accountEmail);
    if (!acc) return j17({ success: false, error: "\xDA\u010Det neexistuje.", email: accountEmail });
    if (!active3(acc)) return j17({ success: false, error: "Licencia nie je akt\xEDvna.", account: pub2(acc) });
    const companyName = String(body.companyName || body.company || body.businessName || body.name || acc.companyName || "").trim();
    let siteSlug = slugify5(body.slug || body.siteSlug || body.urlName || body.url || body.path || companyName || acc.companyName || "web");
    if (!siteSlug) siteSlug = "web-" + Date.now();
    const website = {
      slug: siteSlug,
      ownerEmail: acc.email,
      companyName: companyName || acc.companyName,
      headline: String(body.headline || body.title || companyName || acc.companyName || "").trim(),
      description: String(body.description || body.text || body.copy || "").trim(),
      homepageText: String(body.homepageText || body.longDescription || body.mainDescription || body.description || "").trim(),
      phone: String(body.phone || body.telefon || "").trim(),
      email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
      template: String(body.template || body.templateName || acc.template || "E-shop"),
      theme: {
        accent: String(body.theme?.accent || body.accent || "turquoise"),
        logo: String(body.logo || body.theme?.logo || ""),
        heroImage: String(body.heroImage || body.theme?.heroImage || body.image || "")
      },
      eshop: {
        enabled: true,
        topMenu: Array.isArray(body.topMenu) ? body.topMenu : [
          { title: "Produkty", url: "#produkty" },
          { title: "Akcie", url: "#produkty" },
          { title: "Ako nakupova\u0165", url: "#info" },
          { title: "Kontakt", url: "#kontakt" }
        ],
        benefits: Array.isArray(body.benefits) ? body.benefits : [
          { title: "Dar\u010Dek zdarma", text: "Ku ka\u017Edej objedn\xE1vke." },
          { title: "R\xFDchle dodanie", text: "Pre produkty skladom." },
          { title: "Na spl\xE1tky", text: "R\xFDchlo a bezpe\u010Dne." },
          { title: "Doprava zdarma", text: "Pod\u013Ea podmienok predajcu." }
        ],
        sidebar: defaultSidebar2(body, {
          companyName: companyName || acc.companyName,
          email: String(body.siteEmail || body.publicEmail || body.contactEmail || acc.email).trim(),
          ownerEmail: acc.email,
          phone: String(body.phone || body.telefon || "").trim()
        }),
        products: normalizeProducts2(body.products),
        footerLinks: Array.isArray(body.footerLinks) ? body.footerLinks : [
          { title: "Ako nakupova\u0165", url: "#" },
          { title: "Obchodn\xE9 podmienky", url: "#" },
          { title: "Ochrana osobn\xFDch \xFAdajov", url: "#" }
        ]
      },
      source: "lech-web",
      status: "published",
      createdAt: acc.website && acc.website.createdAt ? acc.website.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    acc.website = website;
    await putJson12(kv18, "site:" + siteSlug, website);
    await indexAccount2(kv18, acc);
    return j17({
      success: true,
      message: "E-shop web bol ulo\u017Een\xFD.",
      url: "/site/" + siteSlug,
      publicUrl: "https://lech-web.pages.dev/site/" + siteSlug,
      website,
      account: pub2(acc)
    });
  } catch (e) {
    return j17({
      success: false,
      error: "Serverov\xE1 chyba pri ukladan\xED webu.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : "")
    });
  }
}
__name(onRequestPost20, "onRequestPost");

// api/contact.js
async function onRequestOptions26() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders2()
  });
}
__name(onRequestOptions26, "onRequestOptions");
async function onRequestPost21({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const type = String(body.type || "").trim();
    const message = String(body.message || "").trim();
    if (!name || !contact || !message) {
      return jsonResponse(
        { success: false, error: "Vypl\u0148te meno, kontakt a spr\xE1vu." },
        400
      );
    }
    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.RESEND_FROM) {
      return jsonResponse(
        { success: false, error: "Ch\xFDba nastavenie e-mailu na serveri." },
        500
      );
    }
    const emailHtml3 = `
      <div style="font-family: Arial, sans-serif; background:#03040a; color:#ffffff; padding:24px; border-radius:16px;">
        <h1 style="color:#22d3ee; margin-top:0;">Nov\xFD dopyt z Lech-Web</h1>
        <div style="background:#0f172a; padding:18px; border-radius:14px; border:1px solid rgba(34,211,238,0.35);">
          <p><strong>Meno / firma:</strong> ${escapeHtml6(name)}</p>
          <p><strong>Kontakt:</strong> ${escapeHtml6(contact)}</p>
          <p><strong>Typ webu:</strong> ${escapeHtml6(type)}</p>
          <p><strong>Spr\xE1va:</strong></p>
          <p style="white-space:pre-line;">${escapeHtml6(message)}</p>
        </div>
      </div>
    `;
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [env.CONTACT_TO],
        subject: `Nov\xFD dopyt Lech-Web: ${name}`,
        html: emailHtml3,
        reply_to: contact.includes("@") ? contact : void 0
      })
    });
    const resendData = await resendResponse.json();
    if (!resendResponse.ok) {
      return jsonResponse(
        {
          success: false,
          error: "E-mail sa nepodarilo odosla\u0165.",
          detail: resendData
        },
        500
      );
    }
    return jsonResponse({
      success: true,
      message: "Dopyt bol \xFAspe\u0161ne odoslan\xFD."
    });
  } catch {
    return jsonResponse(
      {
        success: false,
        error: "Serverov\xE1 chyba pri odosielan\xED formul\xE1ra."
      },
      500
    );
  }
}
__name(onRequestPost21, "onRequestPost");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders2()
    }
  });
}
__name(jsonResponse, "jsonResponse");
function corsHeaders2() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
__name(corsHeaders2, "corsHeaders");
function escapeHtml6(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
__name(escapeHtml6, "escapeHtml");

// api/health.js
function json7(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json7, "json");
async function onRequestGet20({ env }) {
  const store3 = env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
  let kvWriteOk = false;
  let kvError = null;
  if (store3) {
    try {
      await store3.put("health:last", (/* @__PURE__ */ new Date()).toISOString());
      kvWriteOk = true;
    } catch (e) {
      kvError = String(e && e.message ? e.message : e);
    }
  }
  return json7({
    success: true,
    kvBindingFound: Boolean(store3),
    kvWriteOk,
    kvError,
    requiredBinding: "LECHWEB_KV",
    trialDays: env.TRIAL_DAYS || "14",
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
}
__name(onRequestGet20, "onRequestGet");

// api/upload.js
function h20(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin",
    ...extra
  };
}
__name(h20, "h");
function j18(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h20() });
}
__name(j18, "j");
function bucket(env) {
  return env.LECHWEB_UPLOADS || env.R2_UPLOADS || env.UPLOADS || null;
}
__name(bucket, "bucket");
function extFromName(name, type) {
  const lower = String(name || "").toLowerCase();
  const found = lower.match(/\.([a-z0-9]{2,8})$/);
  if (found) return found[1];
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  return "bin";
}
__name(extFromName, "extFromName");
function safeName(name) {
  return String(name || "upload").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "upload";
}
__name(safeName, "safeName");
function rand() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}
__name(rand, "rand");
function keyFor(file, folder) {
  const now = /* @__PURE__ */ new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = extFromName(file.name, file.type);
  const clean3 = safeName(file.name).replace(/\.[a-z0-9]{2,8}$/i, "");
  const prefix = safeName(folder || "images");
  return `${prefix}/${yyyy}/${mm}/${Date.now()}-${rand()}-${clean3}.${ext}`;
}
__name(keyFor, "keyFor");
async function onRequestOptions27() {
  return new Response(null, { status: 204, headers: h20() });
}
__name(onRequestOptions27, "onRequestOptions");
async function onRequestGet21({ env }) {
  const r2 = bucket(env);
  let writeOk = false;
  let error = null;
  if (r2) {
    try {
      await r2.put("_health/upload.txt", "ok " + (/* @__PURE__ */ new Date()).toISOString(), {
        httpMetadata: { contentType: "text/plain; charset=utf-8" }
      });
      writeOk = true;
    } catch (e) {
      error = String(e && e.message ? e.message : e);
    }
  }
  return j18({
    success: true,
    endpoint: "/api/upload",
    mode: "r2-upload",
    r2BindingFound: Boolean(r2),
    r2WriteOk: writeOk,
    r2Error: error,
    requiredBinding: "LECHWEB_UPLOADS",
    uploadField: "file",
    publicPath: "/uploads/<key>"
  });
}
__name(onRequestGet21, "onRequestGet");
async function onRequestPost22({ request, env }) {
  try {
    const r2 = bucket(env);
    if (!r2) {
      return j18({ success: false, error: "Ch\xFDba R2 binding LECHWEB_UPLOADS." }, 500);
    }
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return j18({ success: false, error: "Pou\u017Ei multipart/form-data s po\u013Eom file." }, 400);
    }
    const form = await request.formData();
    const file = form.get("file");
    const folder = form.get("folder") || "images";
    if (!file || typeof file === "string") {
      return j18({ success: false, error: "Ch\xFDba s\xFAbor v poli file." }, 400);
    }
    const allowed = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
    if (!allowed.has(file.type)) {
      return j18({
        success: false,
        error: "Povolen\xE9 s\xFA iba obr\xE1zky JPG, PNG, WEBP, GIF, SVG.",
        receivedType: file.type
      }, 400);
    }
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return j18({
        success: false,
        error: "S\xFAbor je pr\xEDli\u0161 ve\u013Ek\xFD. Maximum je 8 MB.",
        size: file.size
      }, 400);
    }
    const key = keyFor(file, folder);
    const buffer = await file.arrayBuffer();
    await r2.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable"
      },
      customMetadata: {
        originalName: file.name || "",
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    const url = new URL(request.url);
    const publicPath = `/uploads/${key}`;
    const publicUrl = `${url.origin}${publicPath}`;
    return j18({
      success: true,
      key,
      filename: file.name,
      size: file.size,
      type: file.type,
      publicPath,
      publicUrl,
      message: "Obr\xE1zok bol nahrat\xFD."
    });
  } catch (e) {
    return j18({
      success: false,
      error: "Upload zlyhal.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : "")
    }, 500);
  }
}
__name(onRequestPost22, "onRequestPost");

// site/[slug].js
function htmlResponse(html, status = 200) {
  return new Response(new TextEncoder().encode(html), {
    status,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
__name(htmlResponse, "htmlResponse");
function kv17(env) {
  return env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
}
__name(kv17, "kv");
async function getJson23(store3, key) {
  const raw = await store3.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(getJson23, "getJson");
function esc5(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
__name(esc5, "esc");
function isActive6(account) {
  if (!account) return true;
  if (["blocked", "suspended"].includes(account.status)) return false;
  if (account.status === "active") return true;
  const now = Date.now();
  const trial = account.trialUntil ? Date.parse(account.trialUntil) : 0;
  const paid = account.paidUntil ? Date.parse(account.paidUntil) : 0;
  return trial > now || paid > now;
}
__name(isActive6, "isActive");
function getTheme2(theme) {
  const raw = typeof theme === "string" ? theme : theme?.accent || "lechweb";
  const id = String(raw || "lechweb").trim().toLowerCase();
  const themes = {
    lechweb: { accent: "#67e8f9", accent2: "#e879f9", dark: "#03040a", panel: "#0f172a", glow: "rgba(103,232,249,.42)", rgb: false },
    cyan: { accent: "#67e8f9", accent2: "#22d3ee", dark: "#03040a", panel: "#0f172a", glow: "rgba(34,211,238,.42)", rgb: false },
    fuchsia: { accent: "#e879f9", accent2: "#67e8f9", dark: "#05030a", panel: "#14091f", glow: "rgba(232,121,249,.42)", rgb: false },
    violet: { accent: "#a78bfa", accent2: "#e879f9", dark: "#070512", panel: "#141026", glow: "rgba(167,139,250,.42)", rgb: false },
    emerald: { accent: "#34d399", accent2: "#67e8f9", dark: "#03110c", panel: "#082018", glow: "rgba(52,211,153,.42)", rgb: false },
    orange: { accent: "#fb923c", accent2: "#facc15", dark: "#130902", panel: "#211006", glow: "rgba(251,146,60,.42)", rgb: false },
    kawasaki: { accent: "#39ff14", accent2: "#b6ff00", dark: "#020800", panel: "#061a03", glow: "rgba(57,255,20,.50)", rgb: false },
    acidyellow: { accent: "#fff200", accent2: "#39ff14", dark: "#0b0b00", panel: "#1a1800", glow: "rgba(255,242,0,.48)", rgb: false },
    "acid-yellow": { accent: "#fff200", accent2: "#39ff14", dark: "#0b0b00", panel: "#1a1800", glow: "rgba(255,242,0,.96)", rgb: false },
    sharpred: { accent: "#ff073a", accent2: "#ff7a00", dark: "#110004", panel: "#210008", glow: "rgba(255,7,58,.50)", rgb: false },
    "sharp-red": { accent: "#ff073a", accent2: "#ff7a00", dark: "#110004", panel: "#210008", glow: "rgba(255,7,58,.96)", rgb: false },
    rgbglow: { accent: "#00f5ff", accent2: "#ff00f5", dark: "#02020a", panel: "#09091a", glow: "rgba(0,245,255,.45)", rgb: true },
    "rgb-glow": { accent: "#00f5ff", accent2: "#ff00f5", dark: "#02020a", panel: "#09091a", glow: "rgba(0,245,255,.92)", rgb: true }
  };
  return themes[id] || themes.lechweb;
}
__name(getTheme2, "getTheme");
function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}
__name(list, "list");
function visible(items) {
  return list(items).filter((item) => item.visible !== false && item.visibility !== "hidden");
}
__name(visible, "visible");
function normalizeSite(site) {
  const modules = site.modules || {};
  const eshop = site.eshop || {};
  const sidebar = eshop.sidebar || {};
  const menu = visible(modules.menuSettings?.items).length ? visible(modules.menuSettings.items) : visible(eshop.topMenu).length ? visible(eshop.topMenu) : [
    { title: "Produkty", url: "#produkty" },
    { title: "Akcie", url: "#produkty" },
    { title: "Ako nakupova\u0139\u0104", url: "#info" },
    { title: "Kontakt", url: "#kontakt" }
  ];
  const benefits = visible(modules.banners?.advantages).length ? visible(modules.banners.advantages) : [
    { title: "Dar\xC4\u0164ek zdarma", text: "Ku ka\u0139\u013Edej objedn\u0102\u02C7vke.", icon: "*" },
    { title: "R\u0102\u02DDchle dodanie", text: "Pre produkty skladom.", icon: "R" },
    { title: "Na spl\u0102\u02C7tky", text: "R\u0102\u02DDchlo a bezpe\xC4\u0164ne.", icon: "OK" },
    { title: "Doprava zdarma", text: "Pod\xC4\u013Ea podmienok predajcu.", icon: "DOM" }
  ];
  const categoryObjects = visible(modules.categoriesAdvanced?.items);
  const categories = categoryObjects.length ? categoryObjects.map((x) => x.title).filter(Boolean) : list(sidebar.categories).length ? list(sidebar.categories) : ["Hlavn\u0102\u02C7 kateg\u0102\u0142ria", "Ak\u010Dn\xFD tovar", "Novinky"];
  const products = list(eshop.products).length ? list(eshop.products) : list(site.products).length ? list(site.products) : [
    { id: "p1", title: "Uk\u0102\u02C7\u0139\u013Ekov\u0102\u02DD produkt", price: "\xE2\u201A\xAC999", shortText: "Produkt uprav\u0102\xADte v admine z\u0102\u02C7kazn\u0102\xADka.", badge: "TIP", availability: "Skladom", visibility: "visible" }
  ];
  return { modules, eshop, menu, benefits, categories, products };
}
__name(normalizeSite, "normalizeSite");
function renderLogo(site) {
  if (site.theme?.logo) return `<img class="logo-img" src="${esc5(site.theme.logo)}" alt="${esc5(site.companyName)}">`;
  return `<div class="logo-mark">LW</div><div class="logo-text">${esc5(site.companyName || "Lech-Web")}</div>`;
}
__name(renderLogo, "renderLogo");
function renderMenu(items) {
  return items.map((item) => `<a href="${esc5(item.url || "#")}"${item.newWindow ? ' target="_blank" rel="noopener"' : ""}>${esc5(item.title)}</a>`).join("");
}
__name(renderMenu, "renderMenu");
function renderBenefits(items) {
  return items.map((item) => `
    <div class="benefit">
      <div class="benefit-icon">${esc5(item.icon || "*")}</div>
      <div><b>${esc5(item.title)}</b><span>${esc5(item.text)}</span></div>
    </div>
  `).join("");
}
__name(renderBenefits, "renderBenefits");
function renderSidebar(site, data, slug) {
  const email3 = site.email || site.siteEmail || site.ownerEmail || "";
  const phone = site.phone || "";
  const links = visible(data.modules.links?.items).length ? visible(data.modules.links.items) : [{ title: "Ako nakupova\u0139\u0104", url: "#info" }];
  const youtube = list(data.eshop.sidebar?.youtube).length ? list(data.eshop.sidebar.youtube) : [];
  return `
    <aside class="sidebar">
      <section class="side-box"><h2>Kateg\u0102\u0142rie</h2><ul>${data.categories.map((c) => `<li><a href="#produkty">${esc5(c)}</a></li>`).join("")}</ul></section>
      <section class="side-box" id="kontakt"><h2>Kontakt</h2><b>${esc5(site.companyName || "")}</b>${email3 ? `<a href="mailto:${esc5(email3)}">Email: ${esc5(email3)}</a>` : ""}${phone ? `<a href="tel:${esc5(phone)}">Tel: ${esc5(phone)}</a>` : ""}<a class="side-button" href="/site/${esc5(slug)}/kontakt">Kontaktn\u0102\u02DD formul\u0102\u02C7r</a></section>
      <section class="side-box"><h2>Vyh\xC4\u013Ead\u0102\u02C7vanie</h2><div class="search"><input id="productSearch" placeholder="N\u0102\u02C7zov tovaru..." oninput="filterProducts()"><button type="button" onclick="filterProducts()">H\xC4\u013Eada\u0139\u0104</button></div></section>
      <section class="side-box"><h2>Typy a rady</h2><ul>${links.map((x) => `<li><a href="${esc5(x.url || "#")}">${esc5(x.title)}</a></li>`).join("")}</ul></section>
      ${youtube.length ? `<section class="side-box"><h2>Vide\u0102\u02C7 YouTube</h2><ul>${youtube.map((x) => `<li><a href="${esc5(x.url || "#")}">${esc5(x.title)}</a></li>`).join("")}</ul></section>` : ""}
    </aside>
  `;
}
__name(renderSidebar, "renderSidebar");
function productBadges(product) {
  const badges = [];
  if (product.badge) badges.push(product.badge);
  if (product.oldPrice || product.akcia || product.flagAkcia) badges.push("AKCIA");
  if (product.novinka || product.flagNovinka) badges.push("NOVINKA");
  if (product.tip || product.flagTip) badges.push("TIP");
  return [...new Set(badges)].map((x) => `<span>${esc5(x)}</span>`).join("");
}
__name(productBadges, "productBadges");
function renderProducts(products) {
  return products.filter((p) => p && p.visible !== false && p.visibility !== "hidden").map((p, index) => `
      <article class="product" data-title="${esc5(String(p.title || "").toLowerCase())}" data-category="${esc5(String(p.category || "").toLowerCase())}">
        <div class="badges">${productBadges(p)}</div>
        <div class="pimg">${p.image ? `<img src="${esc5(p.image)}" alt="${esc5(p.title)}" loading="lazy">` : `<div>Produkt</div>`}</div>
        <h3>${esc5(p.title)}</h3>
        <div class="price">${p.oldPrice ? `<del>${esc5(p.oldPrice)}</del>` : ""}<strong>${esc5(p.price)}</strong></div>
        ${p.availability ? `<div class="availability">${esc5(p.availability)}</div>` : ""}
        <div class="product-actions"><button class="detail" type="button" onclick="addToCart(${index})">DO KO\u0160\xCDKA</button>${p.detailUrl && p.detailUrl !== "#" ? `<a class="ghost-link" href="${esc5(p.detailUrl)}">Detail</a>` : ""}</div>
        <p>${esc5(p.shortText || p.description || "")}</p>
      </article>
    `).join("");
}
__name(renderProducts, "renderProducts");
function renderFooter(site, data) {
  const links = visible(data.modules.links?.items).filter((x) => x.footer !== false);
  return `
    <footer class="footer">
      <div class="footer-grid">
        <div><h3>${esc5(site.companyName)}</h3><p>${esc5(site.description || "")}</p></div>
        <div><h3>Inform\u0102\u02C7cie</h3><ul>${links.map((l) => `<li><a href="${esc5(l.url || "#")}">${esc5(l.title)}</a></li>`).join("")}</ul></div>
        <div><h3>Kontakt</h3><p>${esc5(site.phone || "")}<br>${esc5(site.email || site.siteEmail || "")}</p></div>
      </div>
      <div class="copy">\xC2\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${esc5(site.companyName)}. Vytvoren\u0102\xA9 cez Lech-Web.</div>
    </footer>
  `;
}
__name(renderFooter, "renderFooter");
function renderCookie(mod) {
  if (!mod?.enabled) return "";
  return `
    <div class="cookie" id="cookieBox">
      <div>${esc5(mod.bannerText || "Pou\u0139\u013E\u0102\xADvame cookies, aby sme v\u0102\u02C7m zabezpe\xC4\u0164ili \xC4\u0164o najlep\u0139\u02C7\u0102\xAD z\u0102\u02C7\u0139\u013Eitok na webe.")}</div>
      <div class="cookie-actions"><button onclick="rejectCookies()">Odmietnu\u0139\u0104</button><button class="accept" onclick="acceptCookies()">${esc5(mod.acceptText || "S\u0102\u015Fhlas\u0102\xADm")}</button></div>
    </div>
  `;
}
__name(renderCookie, "renderCookie");
async function onRequestGet22({ params, env }) {
  try {
    const store3 = kv17(env);
    if (!store3) return new Response("KV nie je nastaven\u0102\xA9.", { status: 500, headers: { "content-type": "text/plain; charset=UTF-8" } });
    const slug = String(params.slug || "").trim().toLowerCase();
    const site = await getJson23(store3, "site:" + slug);
    if (!site) return new Response("Web neexistuje: " + slug, { status: 404, headers: { "content-type": "text/plain; charset=UTF-8" } });
    const account = site.ownerEmail ? await getJson23(store3, "user:" + String(site.ownerEmail).toLowerCase()) : null;
    if (!isActive6(account)) return new Response("Web je pozastaven\u0102\u02DD. Licencia nie je akt\u0102\xADvna.", { status: 402, headers: { "content-type": "text/plain; charset=UTF-8" } });
    const data = normalizeSite(site);
    const theme = getTheme2(site.theme);
    const titlePage = data.modules.titlePage || {};
    const heroTitle = titlePage.heroTitle || site.headline || site.companyName || "Lech-Web";
    const heroSubtitle = titlePage.heroSubtitle || site.description || "Modern\u0102\u02DD web vytvoren\u0102\u02DD cez Lech-Web.";
    const heroImage = titlePage.heroImage || site.theme?.heroImage || "";
    const productsJson = JSON.stringify(data.products || []);
    const slugJson = JSON.stringify(slug);
    const rgbCss = theme.rgb ? `
body{animation:rgbpulse 8s linear infinite}
.logo-mark,.benefit-icon,.detail,.submit,.search button,.cart-btn{animation:rgbpulseBtn 4s linear infinite}
@keyframes rgbpulse{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes rgbpulseBtn{0%{box-shadow:0 0 24px #00f5ff,0 0 70px #00f5ff}33%{box-shadow:0 0 24px #ff00f5,0 0 70px #ff00f5}66%{box-shadow:0 0 24px #39ff14,0 0 70px #39ff14}100%{box-shadow:0 0 24px #00f5ff,0 0 70px #00f5ff}}
` : "";
    const html = `<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc5(titlePage.seoTitle || site.companyName || "Lech-Web")}</title>
<meta name="description" content="${esc5(site.description || "")}">
<style>
:root{--a:${theme.accent};--a2:${theme.accent2};--dark:${theme.dark};--panel:${theme.panel};--glow:${theme.glow};--line:rgba(255,255,255,.14);--text:#f8fafc;--muted:#cbd5e1}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--text);font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at 14% 8%,color-mix(in srgb,var(--a) 24%,transparent),transparent 30%),radial-gradient(circle at 86% 6%,color-mix(in srgb,var(--a2) 20%,transparent),transparent 31%),linear-gradient(180deg,var(--dark),#02040a)}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.9),rgba(0,0,0,.2))}
a{text-decoration:none;color:inherit}button,input,textarea{font:inherit}.page{position:relative;width:min(1440px,calc(100% - 40px));margin:0 auto;min-height:100vh;background:rgba(3,4,10,.84);border-left:1px solid var(--line);border-right:1px solid var(--line)}
.top{height:88px;background:rgba(15,23,42,.90);display:grid;grid-template-columns:280px 1fr auto;align-items:center;border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}.logo{height:100%;display:flex;align-items:center;gap:14px;padding:0 26px;background:linear-gradient(135deg,color-mix(in srgb,var(--a) 20%,transparent),rgba(255,255,255,.03))}.logo-img{max-width:210px;max-height:70px;object-fit:contain}.logo-mark{width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;display:grid;place-items:center;font-weight:950}.logo-text{font-size:25px;font-weight:950}.menu{display:flex;gap:34px;font-weight:900}.menu a{color:#f8fafc}.icons{display:flex;height:100%}.icons div,.cart-btn{position:relative;width:72px;display:grid;place-items:center;border:0;border-left:1px solid var(--line);background:transparent;color:var(--a);font-size:15px;font-weight:950;cursor:pointer}.cart-count{position:absolute;right:10px;top:15px;min-width:22px;height:22px;border-radius:999px;display:grid;place-items:center;background:var(--a2);color:#020617;font-size:12px;font-weight:950}
.benefits{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;padding:30px 36px}.benefit{display:flex;gap:14px;align-items:center;border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.045);padding:18px}.benefit-icon{width:50px;height:50px;border-radius:15px;background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;display:grid;place-items:center;font-weight:950}.benefit span{display:block;color:var(--muted);margin-top:3px}
.main{display:grid;grid-template-columns:320px 1fr;gap:32px;padding:0 36px 42px}.sidebar{border-right:1px solid var(--line);padding-right:28px}.side-box{border-bottom:1px solid var(--line);padding:24px 0}.side-box h2{font-size:24px;margin:0 0 16px}.side-box ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}.side-box a{display:block;color:var(--a);margin-top:9px}.side-button{border:1px solid var(--a);border-radius:12px;padding:10px 12px;text-align:center;font-weight:900}.search{display:grid;grid-template-columns:1fr 82px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.search input{border:0;background:white;color:#111;padding:14px}.search button{border:0;background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;font-size:13px;font-weight:950;cursor:pointer}
.hero{min-height:330px;border:1px solid var(--line);border-radius:26px;background:${heroImage ? `linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.22)),url("${esc5(heroImage)}") center/cover` : "linear-gradient(135deg,color-mix(in srgb,var(--a) 16%,transparent),color-mix(in srgb,var(--a2) 13%,transparent))"};display:flex;align-items:end;padding:36px;margin-bottom:30px}.hero h1{font-size:54px;line-height:1.02;margin:0 0 12px;letter-spacing:-.04em}.hero p{font-size:18px;color:var(--muted);max-width:760px;line-height:1.6}.hero-buttons{display:flex;gap:12px;margin-top:18px}.hero-buttons a{display:inline-flex;border:1px solid var(--line);border-radius:14px;padding:13px 18px;font-weight:950}.hero-buttons .primary{background:linear-gradient(135deg,var(--a),var(--a2));color:#020617}
.tabs{display:flex;justify-content:center;border-bottom:1px solid var(--line);margin-bottom:28px}.tabs span{border:1px solid var(--line);border-bottom:0;padding:14px 28px;font-weight:900}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.product{position:relative;text-align:center;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:0 18px 24px;min-height:540px}.badges{position:absolute;left:0;top:0;z-index:2;display:grid;gap:4px}.badges span{background:var(--a);color:#020617;padding:7px 13px;font-size:12px;font-weight:950}.pimg{height:240px;display:grid;place-items:center;margin-top:16px}.pimg img{max-width:100%;max-height:225px;object-fit:contain}.pimg div{width:100%;height:210px;border-radius:20px;background:rgba(255,255,255,.08);display:grid;place-items:center;color:var(--a);font-size:25px;font-weight:950}.product h3{font-size:17px;line-height:1.35;min-height:50px}.price{display:grid;gap:4px;margin:14px 0}.price strong{font-size:19px}.price del{color:#94a3b8}.availability{font-size:13px;color:#86efac;margin-bottom:10px}.product-actions{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap}.detail{border:2px solid var(--a);background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;padding:12px 28px;border-radius:12px;font-weight:950;cursor:pointer}.ghost-link{border:1px solid var(--line);padding:12px 20px;border-radius:12px;color:var(--muted);font-weight:900}.product p{color:var(--muted);line-height:1.5}
.home,.action-block{max-width:850px;margin:55px auto 20px;font-size:18px;line-height:1.65;color:#dbeafe}.home h2,.action-block h2{font-size:38px;line-height:1.1;color:white}.action-block{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.045);padding:28px}.footer{border-top:1px solid var(--line);background:rgba(15,23,42,.76);padding:34px}.footer-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:25px}.footer ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}.footer a{color:var(--a)}.copy{margin-top:22px;color:#94a3b8}
.modal{display:none;position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.72);align-items:center;justify-content:center;padding:20px}.modal.open{display:flex}.modal-card{width:min(760px,100%);max-height:92vh;overflow:auto;border:1px solid var(--line);border-radius:26px;background:#0f172a;padding:24px}.modal-head{display:flex;justify-content:space-between;gap:15px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:15px}.close{background:transparent;color:white;border:1px solid var(--line);border-radius:12px;padding:10px 14px;cursor:pointer}.cart-lines{display:grid;gap:10px;margin:18px 0}.cart-line{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:16px;padding:12px}.qty{display:flex;gap:6px;align-items:center}.qty button{border:0;background:var(--a);color:#020617;border-radius:8px;padding:6px 10px;font-weight:950;cursor:pointer}.form{display:grid;gap:12px;margin-top:18px}.form input,.form textarea{width:100%;border:1px solid var(--line);background:#020617;color:white;border-radius:12px;padding:13px}.submit{background:linear-gradient(135deg,var(--a),var(--a2));color:#020617;border:0;border-radius:14px;padding:15px;font-weight:950;cursor:pointer}.msg{margin-top:12px;color:var(--a);font-weight:900}.cookie{position:fixed;left:20px;right:20px;bottom:20px;z-index:110;background:#020617;color:white;border:1px solid var(--line);border-radius:18px;padding:16px;display:none;gap:14px;align-items:center;justify-content:space-between;box-shadow:0 20px 80px rgba(0,0,0,.45)}.cookie-actions{display:flex;gap:10px}.cookie button{border:1px solid var(--line);background:transparent;color:white;border-radius:12px;padding:10px 14px;cursor:pointer}.cookie .accept{background:var(--a);color:#020617}
.top,.sidebar,.hero,.product,.side-box,.benefit,.modal-card,.footer,.search,input,textarea,select,.tabs span{border-color:color-mix(in srgb,var(--a) 66%,rgba(255,255,255,.12))!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--a) 42%,transparent),0 0 26px color-mix(in srgb,var(--a) 30%,transparent),inset 0 0 22px rgba(255,255,255,.03)!important}.product:hover,.benefit:hover,.hero:hover,.side-box:hover,.tabs span:hover{border-color:var(--a)!important;box-shadow:0 0 0 1px var(--a),0 0 34px var(--glow),0 0 95px color-mix(in srgb,var(--a2) 34%,transparent),inset 0 0 32px color-mix(in srgb,var(--a) 12%,transparent)!important}.logo-mark,.benefit-icon,.detail,.submit,.search button,.cart-btn,.icons div{box-shadow:0 0 18px var(--glow),0 0 54px color-mix(in srgb,var(--a) 62%,transparent)!important}.menu a:hover,.sidebar a:hover,.footer a:hover,.price strong,.availability,.logo-text,.side-box h2,.hero h1{color:var(--a)!important;text-shadow:0 0 12px color-mix(in srgb,var(--a) 70%,transparent),0 0 26px var(--glow)!important}.pimg div{border:1px solid color-mix(in srgb,var(--a) 60%,transparent)!important;box-shadow:inset 0 0 55px color-mix(in srgb,var(--a) 18%,transparent),0 0 24px color-mix(in srgb,var(--a) 20%,transparent)!important}
${rgbCss}
@media(max-width:1050px){.page{width:100%}.top{grid-template-columns:1fr}.menu{overflow:auto;padding:15px 24px}.icons{display:none}.benefits{grid-template-columns:1fr 1fr}.main{grid-template-columns:1fr}.sidebar{border-right:0;padding-right:0;order:2}.grid{grid-template-columns:1fr 1fr}.footer-grid{grid-template-columns:1fr}}@media(max-width:650px){.benefits,.grid{grid-template-columns:1fr}.main{padding:0 18px 35px}.hero h1{font-size:34px}.cookie{display:block}}
/* LECH-WEB STRONG NEON EFFECTS */
.top,
.sidebar,
.hero,
.product,
.side-box,
.benefit,
.modal-card,
.footer,
.search,
input,
textarea,
select,
.tabs span {
  border-color: color-mix(in srgb, var(--a) 42%, rgba(255,255,255,.16)) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 18%, transparent),
    0 0 10px color-mix(in srgb, var(--a) 12%, transparent),
    inset 0 0 10px rgba(255,255,255,.018) !important;
}

.product:hover,
.benefit:hover,
.hero:hover,
.side-box:hover,
.tabs span:hover {
  border-color: color-mix(in srgb, var(--a) 70%, white) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 36%, transparent),
    0 0 18px color-mix(in srgb, var(--a) 28%, transparent),
    0 0 36px color-mix(in srgb, var(--a2) 16%, transparent),
    inset 0 0 14px color-mix(in srgb, var(--a) 5%, transparent) !important;
}

.logo-mark,
.benefit-icon,
.detail,
.submit,
.search button,
.cart-btn,
.icons div {
  background: linear-gradient(135deg, var(--a), var(--a2)) !important;
  color: #020617 !important;
  box-shadow:
    0 0 9px color-mix(in srgb, var(--a) 38%, transparent),
    0 0 20px color-mix(in srgb, var(--a) 22%, transparent) !important;
}

.menu a:hover,
.sidebar a:hover,
.footer a:hover,
.price strong,
.availability,
.logo-text,
.side-box h2,
.hero h1 {
  color: var(--a) !important;
  text-shadow:
    0 0 5px color-mix(in srgb, var(--a) 32%, transparent),
    0 0 12px color-mix(in srgb, var(--a) 18%, transparent) !important;
}

.badges span {
  background: var(--a) !important;
  color: #020617 !important;
  box-shadow: 0 0 10px color-mix(in srgb, var(--a) 26%, transparent) !important;
}

.pimg div {
  border: 1px solid color-mix(in srgb, var(--a) 38%, transparent) !important;
  box-shadow:
    inset 0 0 22px color-mix(in srgb, var(--a) 8%, transparent),
    0 0 8px color-mix(in srgb, var(--a) 10%, transparent) !important;
}
</style>
</head>
<body>
<div class="page">
  <header class="top"><a class="logo" href="/site/${esc5(slug)}">${renderLogo(site)}</a><nav class="menu">${renderMenu(data.menu)}</nav><div class="icons"><div>H\u013DADA\u0164</div><div>\xDA\u010CET</div><button class="cart-btn" type="button" onclick="openCart()">KO\u0160\xCDK<span class="cart-count" id="cartCount">0</span></button></div></header>
  <section class="benefits">${renderBenefits(data.benefits)}</section>
  <main class="main">
    ${renderSidebar(site, data, slug)}
    <section>
      <div class="hero"><div><h1>${esc5(heroTitle)}</h1><p>${esc5(heroSubtitle)}</p><div class="hero-buttons"><a class="primary" href="#produkty">Pozrie\u0165 produkty</a><a href="#kontakt">Kontakt</a></div></div></div>
      <div class="tabs"><span>Ak\u010Dn\xFD tovar</span><span>Novinky</span></div>
      <div id="produkty" class="grid">${renderProducts(data.products)}</div>
      <article id="info" class="home"><h2>${esc5(titlePage.seoTitle || site.headline || site.companyName)}</h2><p>${esc5(titlePage.seoText || site.homepageText || site.description || "Sem z\u0102\u02C7kazn\u0102\xADk dopln\u0102\xAD dlh\u0102\u02DD SEO text pod produktami.")}</p></article>
      ${titlePage.actionBlock?.enabled ? `<section class="action-block"><h2>${esc5(titlePage.actionBlock.title)}</h2><p>${esc5(titlePage.actionBlock.text)}</p><a class="detail" href="${esc5(titlePage.actionBlock.buttonUrl || "#produkty")}">${esc5(titlePage.actionBlock.buttonText || "Zobrazi\u0139\u0104")}</a></section>` : ""}
    </section>
  </main>
  ${renderFooter(site, data)}
</div>

<div class="modal" id="cartModal"><div class="modal-card"><div class="modal-head"><h2>Objedn\u0102\u02C7vka</h2><button class="close" type="button" onclick="closeCart()">Zavrie\u0139\u0104</button></div><div class="cart-lines" id="cartLines"></div><form class="form" onsubmit="sendOrder(event)"><input id="cName" placeholder="Meno a priezvisko" required><input id="cEmail" placeholder="E-mail"><input id="cPhone" placeholder="Telef\u0102\u0142n"><input id="cAddress" placeholder="Adresa / mesto"><textarea id="cNote" placeholder="Pozn\u0102\u02C7mka"></textarea><button class="submit" type="submit">Odosla\u0139\u0104 objedn\u0102\u02C7vku</button><div class="msg" id="cartMsg"></div></form></div></div>
${renderCookie(data.modules.cookies)}
<script>
const SITE_SLUG=${slugJson};
const PRODUCTS=${productsJson};
let cart=[];
function safeText(value){return String(value||"").replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];});}
function updateCart(){const count=cart.reduce((sum,item)=>sum+item.qty,0);const countEl=document.getElementById("cartCount");if(countEl)countEl.textContent=count;renderCart();}
function addToCart(index){const product=PRODUCTS[index];if(!product)return;const id=String(product.id||index);const found=cart.find((item)=>item.id===id);if(found){found.qty+=1;}else{cart.push({id,title:product.title||"Produkt",price:product.price||"",image:product.image||"",qty:1});}updateCart();openCart();}
function changeQty(id,delta){const item=cart.find((x)=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter((x)=>x.id!==id);updateCart();}
function openCart(){document.getElementById("cartModal").classList.add("open");renderCart();}
function closeCart(){document.getElementById("cartModal").classList.remove("open");}
function renderCart(){const el=document.getElementById("cartLines");if(!el)return;if(!cart.length){el.innerHTML="<p>Ko\u0139\u02C7\u0102\xADk je pr\u0102\u02C7zdny.</p>";return;}el.innerHTML=cart.map((item)=>'<div class="cart-line"><strong>'+safeText(item.title)+'</strong><span>'+safeText(item.price)+'</span><span class="qty"><button type="button" onclick="changeQty('+JSON.stringify(item.id)+',-1)">-</button>'+item.qty+'<button type="button" onclick="changeQty('+JSON.stringify(item.id)+',1)">+</button></span></div>').join("");}
function filterProducts(){const q=(document.getElementById("productSearch")?.value||"").trim().toLowerCase();document.querySelectorAll(".product").forEach((card)=>{const title=card.dataset.title||"";const cat=card.dataset.category||"";card.style.display=(title.includes(q)||cat.includes(q))?"":"none";});}
async function sendOrder(event){event.preventDefault();const msg=document.getElementById("cartMsg");if(!cart.length){msg.textContent="Ko\u0139\u02C7\u0102\xADk je pr\u0102\u02C7zdny.";return;}msg.textContent="Odosielam...";const payload={siteSlug:SITE_SLUG,items:cart,customer:{name:document.getElementById("cName").value,email:document.getElementById("cEmail").value,phone:document.getElementById("cPhone").value,address:document.getElementById("cAddress").value,note:document.getElementById("cNote").value}};try{const res=await fetch("/api/orders/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();if(!data.success)throw new Error(data.error||"Objedn\u0102\u02C7vka zlyhala.");cart=[];updateCart();msg.textContent="Objedn\u0102\u02C7vka odoslan\u0102\u02C7. \xC4\u015A\u0102\xADslo: "+data.order.number;}catch(err){msg.textContent=err.message;}}
function acceptCookies(){localStorage.setItem("lechweb_cookie","yes");document.getElementById("cookieBox").style.display="none";}
function rejectCookies(){localStorage.setItem("lechweb_cookie","no");document.getElementById("cookieBox").style.display="none";}
if(document.getElementById("cookieBox") && !localStorage.getItem("lechweb_cookie")) document.getElementById("cookieBox").style.display="flex";
updateCart();
<\/script>
</body></html>`;
    return htmlResponse(html);
  } catch (err) {
    return new Response("Chyba renderovania verejn\u0102\xA9ho webu: " + String(err?.message || err), { status: 500, headers: { "content-type": "text/plain; charset=UTF-8" } });
  }
}
__name(onRequestGet22, "onRequestGet");

// uploads/[[path]].js
function bucket2(env) {
  return env.LECHWEB_UPLOADS || env.R2_UPLOADS || env.UPLOADS || null;
}
__name(bucket2, "bucket");
function keyFromParams(params) {
  const value = params.path;
  if (Array.isArray(value)) return value.join("/");
  return String(value || "");
}
__name(keyFromParams, "keyFromParams");
async function onRequestGet23({ params, env }) {
  const r2 = bucket2(env);
  if (!r2) return new Response("R2 binding LECHWEB_UPLOADS nie je nastaven\xFD.", { status: 500 });
  const key = keyFromParams(params);
  if (!key || key.includes("..")) return new Response("Neplatn\xFD s\xFAbor.", { status: 400 });
  const object = await r2.get(key);
  if (!object) return new Response("S\xFAbor neexistuje.", { status: 404 });
  const headers4 = new Headers();
  object.writeHttpMetadata(headers4);
  headers4.set("etag", object.httpEtag);
  headers4.set("cache-control", headers4.get("cache-control") || "public, max-age=31536000, immutable");
  return new Response(object.body, { headers: headers4 });
}
__name(onRequestGet23, "onRequestGet");
async function onRequestHead({ params, env }) {
  const r2 = bucket2(env);
  if (!r2) return new Response(null, { status: 500 });
  const key = keyFromParams(params);
  if (!key || key.includes("..")) return new Response(null, { status: 400 });
  const object = await r2.head(key);
  if (!object) return new Response(null, { status: 404 });
  const headers4 = new Headers();
  object.writeHttpMetadata(headers4);
  headers4.set("etag", object.httpEtag);
  return new Response(null, { headers: headers4 });
}
__name(onRequestHead, "onRequestHead");

// ../.wrangler/tmp/pages-QsAdxV/functionsRoutes-0.5765395913850561.mjs
var routes = [
  {
    routePath: "/api/admin/customers/mail",
    mountPath: "/api/admin/customers",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/admin/customers/mail",
    mountPath: "/api/admin/customers",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/inquiries/reply",
    mountPath: "/api/admin/inquiries",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/admin/inquiries/reply",
    mountPath: "/api/admin/inquiries",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/admin/inquiries/update",
    mountPath: "/api/admin/inquiries",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/admin/inquiries/update",
    mountPath: "/api/admin/inquiries",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/admin/modules/defaults",
    mountPath: "/api/admin/modules",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/admin/modules/defaults",
    mountPath: "/api/admin/modules",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/admin/modules/save",
    mountPath: "/api/admin/modules",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions5]
  },
  {
    routePath: "/api/admin/modules/save",
    mountPath: "/api/admin/modules",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/admin/orders/update",
    mountPath: "/api/admin/orders",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions6]
  },
  {
    routePath: "/api/admin/orders/update",
    mountPath: "/api/admin/orders",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/admin/accounts",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/admin/accounts",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions7]
  },
  {
    routePath: "/api/admin/activate-license",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/admin/customers",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/admin/customers",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions8]
  },
  {
    routePath: "/api/admin/inquiries",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/admin/inquiries",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions9]
  },
  {
    routePath: "/api/admin/license",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions10]
  },
  {
    routePath: "/api/admin/license",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/admin/licenses",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/admin/licenses",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions11]
  },
  {
    routePath: "/api/admin/licenses",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/admin/orders",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/admin/orders",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions12]
  },
  {
    routePath: "/api/admin/site-save",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/admin/site-save",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions13]
  },
  {
    routePath: "/api/admin/site-save",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/admin/sites",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/admin/sites",
    mountPath: "/api/admin",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions14]
  },
  {
    routePath: "/api/admin/users",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions15]
  },
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/auth/logout",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost11]
  },
  {
    routePath: "/api/auth/me",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/auth/me",
    mountPath: "/api/auth",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions16]
  },
  {
    routePath: "/api/auth/register",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/auth/register",
    mountPath: "/api/auth",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions17]
  },
  {
    routePath: "/api/auth/register",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost12]
  },
  {
    routePath: "/api/builder/save",
    mountPath: "/api/builder",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/builder/save",
    mountPath: "/api/builder",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions18]
  },
  {
    routePath: "/api/builder/save",
    mountPath: "/api/builder",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost13]
  },
  {
    routePath: "/api/email/test",
    mountPath: "/api/email",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/email/test",
    mountPath: "/api/email",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions19]
  },
  {
    routePath: "/api/inquiries/create",
    mountPath: "/api/inquiries",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions20]
  },
  {
    routePath: "/api/inquiries/create",
    mountPath: "/api/inquiries",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost14]
  },
  {
    routePath: "/api/license/status",
    mountPath: "/api/license",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions21]
  },
  {
    routePath: "/api/license/status",
    mountPath: "/api/license",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost15]
  },
  {
    routePath: "/api/orders/create",
    mountPath: "/api/orders",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions22]
  },
  {
    routePath: "/api/orders/create",
    mountPath: "/api/orders",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost16]
  },
  {
    routePath: "/api/site/get",
    mountPath: "/api/site",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions23]
  },
  {
    routePath: "/api/site/get",
    mountPath: "/api/site",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost17]
  },
  {
    routePath: "/api/site/save",
    mountPath: "/api/site",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/site/save",
    mountPath: "/api/site",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions24]
  },
  {
    routePath: "/api/site/save",
    mountPath: "/api/site",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost18]
  },
  {
    routePath: "/api/sites/create",
    mountPath: "/api/sites",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost19]
  },
  {
    routePath: "/site/:slug/admin-dopyty",
    mountPath: "/site/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/site/:slug/admin-zakaznici",
    mountPath: "/site/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/site/:slug/kontakt",
    mountPath: "/site/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/site/:slug/:page",
    mountPath: "/site/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet18]
  },
  {
    routePath: "/api/builder",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/api/builder",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions25]
  },
  {
    routePath: "/api/builder",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost20]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions26]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost21]
  },
  {
    routePath: "/api/health",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet21]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions27]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost22]
  },
  {
    routePath: "/site/:slug",
    mountPath: "/site",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet22]
  },
  {
    routePath: "/uploads/:path*",
    mountPath: "/uploads",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet23]
  },
  {
    routePath: "/uploads/:path*",
    mountPath: "/uploads",
    method: "HEAD",
    middlewares: [],
    modules: [onRequestHead]
  }
];

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j19 = i + 1;
      while (j19 < str.length) {
        var code = str.charCodeAt(j19);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j19++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j19;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j19 = i + 1;
      if (str[j19] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j19));
      }
      while (j19 < str.length) {
        if (str[j19] === "\\") {
          pattern += str[j19++] + str[j19++];
          continue;
        }
        if (str[j19] === ")") {
          count--;
          if (count === 0) {
            j19++;
            break;
          }
        } else if (str[j19] === "(") {
          count++;
          if (str[j19 + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j19));
          }
        }
        pattern += str[j19++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j19;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
