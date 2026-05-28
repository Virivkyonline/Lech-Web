import { json, addDays } from "../../_utils/auth.js";

export async function onRequestPost({ request, env }) {
  try {
    const secret = request.headers.get("X-Admin-Secret") || "";
    if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) return json({ success: false, error: "Neoprávnený prístup." }, 401);
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const months = Math.max(1, Number(body.months || 1));
    const status = body.status === "blocked" ? "blocked" : "active";
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (!user) return json({ success: false, error: "Používateľ neexistuje." }, 404);
    const now = new Date().toISOString();
    const endBase = user.license_ends_at && Date.parse(user.license_ends_at) > Date.now() ? user.license_ends_at : now;
    const licenseEndsAt = status === "blocked" ? user.license_ends_at : addDays(endBase, months * 31);
    await env.DB.prepare("UPDATE users SET license_status = ?, license_ends_at = ?, updated_at = ? WHERE email = ?")
      .bind(status, licenseEndsAt, now, email)
      .run();
    return json({ success: true, email, status, licenseEndsAt });
  } catch {
    return json({ success: false, error: "Aktivácia licencie zlyhala." }, 500);
  }
}
