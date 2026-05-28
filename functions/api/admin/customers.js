
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
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

function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;
  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

function customerKey(c) {
  const email = String(c.email || "").trim().toLowerCase();
  const phone = String(c.phone || "").trim();
  return email || phone || c.name || crypto.randomUUID();
}

function upsertCustomer(map, data) {
  const key = customerKey(data);
  const old = map.get(key) || {
    id: key,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    type: "Bežný",
    ordersCount: 0,
    inquiriesCount: 0,
    totalValueText: "",
    lastOrderAt: "",
    lastInquiryAt: "",
    source: [],
    notes: "",
  };

  const merged = {
    ...old,
    name: old.name || data.name || "",
    email: old.email || data.email || "",
    phone: old.phone || data.phone || "",
  };

  if (data.source && !merged.source.includes(data.source)) merged.source.push(data.source);

  if (data.orderAt && (!merged.lastOrderAt || data.orderAt > merged.lastOrderAt)) merged.lastOrderAt = data.orderAt;
  if (data.inquiryAt && (!merged.lastInquiryAt || data.inquiryAt > merged.lastInquiryAt)) merged.lastInquiryAt = data.inquiryAt;

  if (merged.ordersCount >= 3) merged.type = "VIP";
  if (merged.ordersCount >= 6) merged.type = "Veľkoobchod";

  map.set(key, merged);
  return merged;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 500);
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const url = new URL(request.url);
    const siteSlug = String(url.searchParams.get("siteSlug") || "").trim();

    const customers = new Map();

    const orderIds = (await getJson(store, siteSlug ? "orders:site:" + siteSlug : "orders:index")) || [];
    for (const id of orderIds.slice(0, 500)) {
      const order = await getJson(store, "order:" + id);
      if (!order || !order.customer) continue;

      const c = upsertCustomer(customers, {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        source: "order",
        orderAt: order.createdAt,
      });

      c.ordersCount += 1;
      c.totalValueText = "podľa objednávok";
      if (order.customer.address && !c.address) c.address = order.customer.address;
    }

    const inquiryIds = (await getJson(store, siteSlug ? "inquiries:site:" + siteSlug : "inquiries:index")) || [];
    for (const id of inquiryIds.slice(0, 500)) {
      const inquiry = await getJson(store, "inquiry:" + id);
      if (!inquiry || !inquiry.customer) continue;

      const c = upsertCustomer(customers, {
        name: inquiry.customer.name,
        email: inquiry.customer.email,
        phone: inquiry.customer.phone,
        source: "inquiry",
        inquiryAt: inquiry.createdAt,
      });

      c.inquiriesCount += 1;
      if (inquiry.message && !c.lastInquiryMessage) c.lastInquiryMessage = inquiry.message;
    }

    let list = Array.from(customers.values());

    const type = String(url.searchParams.get("type") || "").trim();
    const q = String(url.searchParams.get("q") || "").trim().toLowerCase();

    if (type) {
      if (type === "vip") list = list.filter((c) => c.type === "VIP");
      if (type === "velkoobchod") list = list.filter((c) => c.type === "Veľkoobchod");
      if (type === "bez-objednavky") list = list.filter((c) => !c.ordersCount);
    }

    if (q) {
      list = list.filter((c) =>
        String(c.name || "").toLowerCase().includes(q) ||
        String(c.email || "").toLowerCase().includes(q) ||
        String(c.phone || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => String(b.lastOrderAt || b.lastInquiryAt || "").localeCompare(String(a.lastOrderAt || a.lastInquiryAt || "")));

    const summary = {
      total: list.length,
      vip: list.filter((c) => c.type === "VIP").length,
      wholesale: list.filter((c) => c.type === "Veľkoobchod").length,
      withoutOrder: list.filter((c) => !c.ordersCount).length,
      withEmail: list.filter((c) => c.email).length,
    };

    return j({
      success: true,
      endpoint: "/api/admin/customers",
      mode: "customer-crm-from-orders-inquiries",
      siteSlug: siteSlug || null,
      summary,
      count: list.length,
      customers: list,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Načítanie zákazníkov zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
