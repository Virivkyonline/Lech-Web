import { json, getCorsResponse } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestGet({ request, env }) {
  try {
    const adminKey = request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    if (!env.ADMIN_API_KEY || adminKey !== env.ADMIN_API_KEY) {
      return json({ success: false, error: "Neoprávnený prístup." }, 401);
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
    return json({ success: false, error: "Načítanie zákazníkov zlyhalo." }, 500);
  }
}
