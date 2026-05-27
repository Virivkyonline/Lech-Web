import { json, getCorsResponse, isActiveLicense } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    if (!accountId) return json({ success: false, error: "Chýba accountId." }, 400);

    const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(accountId).first();
    if (!account) return json({ success: false, error: "Účet neexistuje." }, 404);

    return json({
      success: true,
      license: {
        status: account.license_status,
        trialUntil: account.trial_until,
        paidUntil: account.paid_until,
        active: isActiveLicense(account),
      },
    });
  } catch (error) {
    return json({ success: false, error: "Kontrola licencie zlyhala." }, 500);
  }
}
