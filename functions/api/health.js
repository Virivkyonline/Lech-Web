
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function onRequestGet({ env }) {
  const store = env.LECHWEB_KV || env.LICENSE_KV || env.KV || env.USERS || null;
  let kvWriteOk = false;
  let kvError = null;

  if (store) {
    try {
      await store.put("health:last", new Date().toISOString());
      kvWriteOk = true;
    } catch (e) {
      kvError = String(e && e.message ? e.message : e);
    }
  }

  return json({
    success: true,
    kvBindingFound: Boolean(store),
    kvWriteOk,
    kvError,
    requiredBinding: "LECHWEB_KV",
    trialDays: env.TRIAL_DAYS || "14",
    time: new Date().toISOString(),
  });
}
