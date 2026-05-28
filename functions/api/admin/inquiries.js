
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

    const key = siteSlug ? "inquiries:site:" + siteSlug : "inquiries:index";
    const ids = (await getJson(store, key)) || [];

    const inquiries = [];
    for (const id of ids.slice(0, 100)) {
      const inquiry = await getJson(store, "inquiry:" + id);
      if (inquiry) inquiries.push(inquiry);
    }

    return j({
      success: true,
      endpoint: "/api/admin/inquiries",
      count: inquiries.length,
      siteSlug: siteSlug || null,
      inquiries,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Načítanie dopytov zlyhalo.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
