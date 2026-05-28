
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin",
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
function pub(acc) {
  if (!acc) return null;
  const x = { ...acc };
  delete x.password;
  return x;
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}
export async function onRequestGet({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." });
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const index = (await getJson(store, "accounts:index")) || [];
    const accounts = [];
    for (const row of index) {
      const acc = await getJson(store, "user:" + row.email);
      accounts.push(pub(acc || row));
    }

    return j({
      success: true,
      count: accounts.length,
      accounts,
      themePresets: ["original", "turquoise", "neon", "pink", "violet", "orange", "lime"],
    });
  } catch (e) {
    return j({ success: false, error: "Admin zoznam zlyhal.", detail: String(e && e.message ? e.message : e) });
  }
}
