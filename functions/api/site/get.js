import { json, getCorsResponse, isActiveLicense } from "../_utils.js";

export async function onRequestOptions() {
  return getCorsResponse();
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const accountId = String(body.accountId || "").trim();
    const slug = String(body.slug || "").trim();

    let website;
    if (accountId) {
      website = await env.DB.prepare("SELECT * FROM websites WHERE account_id = ?").bind(accountId).first();
    } else if (slug) {
      website = await env.DB.prepare("SELECT * FROM websites WHERE slug = ?").bind(slug).first();
    }

    if (!website) return json({ success: false, error: "Web neexistuje." }, 404);

    const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(website.account_id).first();
    return json({ success: true, website: mapWebsite(website), licenseActive: isActiveLicense(account) });
  } catch (error) {
    return json({ success: false, error: "Načítanie webu zlyhalo." }, 500);
  }
}

function mapWebsite(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    slug: row.slug,
    template: row.template,
    title: row.title,
    headline: row.headline,
    subheadline: row.subheadline,
    phone: row.phone,
    email: row.email,
    primaryCta: row.primary_cta,
    services: safeJson(row.services_json),
    published: Boolean(row.published),
  };
}

function safeJson(value) {
  try { return JSON.parse(value || "[]"); } catch { return []; }
}
