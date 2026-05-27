import { json, getCorsResponse, isActiveLicense, randomId } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    const slug = normalizeSlug(body.slug || "");
    const title = String(body.title || "").trim();
    const headline = String(body.headline || "").trim();
    const subheadline = String(body.subheadline || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const primaryCta = String(body.primaryCta || "Nezáväzný dopyt").trim();
    const template = String(body.template || "Stavebná firma").trim();
    const services = String(body.servicesText || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (!accountId || !slug || !title || !headline) {
      return json({ success: false, error: "Vyplňte accountId, URL názov, názov firmy a hlavný nadpis." }, 400);
    }

    const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(accountId).first();
    if (!account) return json({ success: false, error: "Účet neexistuje." }, 404);
    if (!isActiveLicense(account)) {
      return json({ success: false, error: "Licencia nie je aktívna. Web nie je možné uložiť ani publikovať." }, 403);
    }

    const existingSlug = await env.DB.prepare("SELECT account_id FROM websites WHERE slug = ? AND account_id != ?")
      .bind(slug, accountId)
      .first();
    if (existingSlug) return json({ success: false, error: "Tento URL názov už používa iný zákazník." }, 409);

    const now = new Date().toISOString();
    const existing = await env.DB.prepare("SELECT id FROM websites WHERE account_id = ?").bind(accountId).first();

    if (existing) {
      await env.DB.prepare(`
        UPDATE websites
        SET slug = ?, template = ?, title = ?, headline = ?, subheadline = ?, phone = ?, email = ?, primary_cta = ?, services_json = ?, published = 1, updated_at = ?
        WHERE account_id = ?
      `).bind(slug, template, title, headline, subheadline, phone, email, primaryCta, JSON.stringify(services), now, accountId).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO websites (id, account_id, slug, template, title, headline, subheadline, phone, email, primary_cta, services_json, published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(randomId("web"), accountId, slug, template, title, headline, subheadline, phone, email, primaryCta, JSON.stringify(services), now, now).run();
    }

    return json({ success: true, slug, publicUrl: `/site/${slug}` });
  } catch (error) {
    return json({ success: false, error: "Uloženie webu zlyhalo." }, 500);
  }
}

function normalizeSlug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
