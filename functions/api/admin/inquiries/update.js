
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
    if (!id) return j({ success: false, error: "Chýba ID dopytu." }, 400);

    const inquiry = await getJson(store, "inquiry:" + id);
    if (!inquiry) return j({ success: false, error: "Dopyt neexistuje." }, 404);

    const allowed = new Set(["new", "contacted", "closed", "spam"]);
    if (body.status && allowed.has(String(body.status))) inquiry.status = String(body.status);
    if ("adminNote" in body) inquiry.adminNote = String(body.adminNote || "");

    inquiry.updatedAt = new Date().toISOString();

    const history = Array.isArray(inquiry.history) ? inquiry.history : [];
    history.unshift({
      at: inquiry.updatedAt,
      status: inquiry.status,
      note: inquiry.adminNote,
      source: "admin",
    });
    inquiry.history = history.slice(0, 50);

    await putJson(store, "inquiry:" + id, inquiry);

    return j({
      success: true,
      message: "Dopyt bol aktualizovaný.",
      inquiry,
    });
  } catch (e) {
    return j({
      success: false,
      error: "Aktualizácia dopytu zlyhala.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
