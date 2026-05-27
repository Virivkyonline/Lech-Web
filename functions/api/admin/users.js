import { json } from "../../_utils/auth.js";

export async function onRequestGet({ request, env }) {
  const secret = request.headers.get("X-Admin-Secret") || "";
  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) return json({ success: false, error: "Neoprávnený prístup." }, 401);
  const users = await env.DB.prepare("SELECT id,email,license_status,trial_ends_at,license_ends_at,created_at FROM users ORDER BY created_at DESC LIMIT 100").all();
  return json({ success: true, users: users.results || [] });
}
