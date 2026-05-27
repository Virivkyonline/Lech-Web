import { json, getCurrentUser, isLicenseActive, randomId } from "../../_utils/auth.js";

export async function onRequestPost({ request, env }) {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) return json({ success: false, error: "Najprv sa prihlás." }, 401);
    if (!isLicenseActive(user)) return json({ success: false, error: "Trial alebo licencia vypršala. Pred pokračovaním treba aktivovať predplatné." }, 402);

    const body = await request.json();
    const businessName = String(body.businessName || "").trim();
    const template = String(body.template || "").trim();
    const phone = String(body.phone || "").trim();
    const description = String(body.description || "").trim();
    if (!businessName || !template || !description) return json({ success: false, error: "Vyplň názov firmy, šablónu a popis webu." }, 400);

    const now = new Date().toISOString();
    const siteId = randomId("site");
    await env.DB.prepare(`INSERT INTO sites (id,user_id,business_name,template,phone,description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(siteId, user.id, businessName, template, phone, description, "requested", now, now)
      .run();
    return json({ success: true, siteId });
  } catch (error) {
    return json({ success: false, error: "Požiadavku na web sa nepodarilo uložiť." }, 500);
  }
}
