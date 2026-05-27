import { json, getCorsResponse, sha256 } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?").bind(email).first();
    if (!account) return json({ success: false, error: "Nesprávne prihlasovacie údaje." }, 401);

    const passwordHash = await sha256(`${email}:${password}:${env.AUTH_SECRET || "lech-web"}`);
    if (passwordHash !== account.password_hash) return json({ success: false, error: "Nesprávne prihlasovacie údaje." }, 401);

    return json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        companyName: account.company_name,
        plan: account.plan,
        template: account.template,
        licenseStatus: account.license_status,
        trialUntil: account.trial_until,
        paidUntil: account.paid_until,
      },
    });
  } catch (error) {
    return json({ success: false, error: "Prihlásenie zlyhalo." }, 500);
  }
}
