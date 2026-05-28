
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
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;

  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

function publicAccount(acc) {
  if (!acc) return null;
  const clean = { ...acc };
  delete clean.password;
  delete clean.passwordHash;
  return clean;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet({ request, env }) {
  try {
    const store = kv(env);
    if (!store) return j({ success: false, error: "Chýba KV binding LECHWEB_KV." }, 500);
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const index = (await getJson(store, "accounts:index")) || [];
    const accounts = [];

    for (const row of index) {
      const full = row.email ? await getJson(store, "user:" + String(row.email).toLowerCase()) : null;
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
      }).length,
    };

    return j({
      success: true,
      summary,
      count: accounts.length,
      accounts,
      mode: "lech-web-final-admin-platform",
      sections: [
        "Dashboard",
        "Objednávky",
        "Produkty",
        "Kategórie",
        "Zákazníci",
        "Vzhľad a obsah",
        "Marketing / SEO",
        "Nastavenia",
        "Licencie",
      ],
    });
  } catch (e) {
    return j({
      success: false,
      error: "Admin zoznam zlyhal.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
