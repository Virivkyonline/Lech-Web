import { addDays, json, getCorsResponse, randomId, sha256 } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const companyName = String(body.companyName || "").trim();
    const plan = String(body.plan || "Start Web").trim();
    const template = String(body.template || "Stavebná firma").trim();

    if (!email || !password || password.length < 8) {
      return json({ success: false, error: "Zadajte e-mail a heslo minimálne 8 znakov." }, 400);
    }

    const exists = await env.DB.prepare("SELECT id FROM accounts WHERE email = ?").bind(email).first();
    if (exists) return json({ success: false, error: "Účet s týmto e-mailom už existuje." }, 409);

    const id = randomId("acc");
    const now = new Date().toISOString();
    const trialUntil = addDays(14);
    const passwordHash = await sha256(`${email}:${password}:${env.AUTH_SECRET || "lech-web"}`);

    await env.DB.prepare(`
      INSERT INTO accounts (id, email, password_hash, company_name, plan, template, license_status, trial_until, paid_until, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'trial', ?, NULL, ?, ?)
    `).bind(id, email, passwordHash, companyName, plan, template, trialUntil, now, now).run();

    return json({
      success: true,
      account: { id, email, companyName, plan, template, licenseStatus: "trial", trialUntil, paidUntil: null },
    });
  } catch (error) {
    return json({ success: false, error: "Registrácia zlyhala." }, 500);
  }
}
