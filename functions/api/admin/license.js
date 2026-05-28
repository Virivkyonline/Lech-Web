import { json, getCorsResponse, addDays } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestPost({ request, env }) {
  try {
    const adminKey = request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    if (!env.ADMIN_API_KEY || adminKey !== env.ADMIN_API_KEY) {
      return json({ success: false, error: "Neoprávnený prístup." }, 401);
    }

    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    const action = String(body.action || "activate").trim();
    const months = Number(body.months || 1);

    if (!accountId) return json({ success: false, error: "Chýba accountId." }, 400);

    let status = "active";
    let paidUntil = addDays(30 * Math.max(1, months));

    if (action === "suspend") {
      status = "suspended";
      paidUntil = null;
    }

    await env.DB.prepare("UPDATE accounts SET license_status = ?, paid_until = ?, updated_at = ? WHERE id = ?")
      .bind(status, paidUntil, new Date().toISOString(), accountId)
      .run();

    return json({ success: true, accountId, licenseStatus: status, paidUntil });
  } catch {
    return json({ success: false, error: "Zmena licencie zlyhala." }, 500);
  }
}
