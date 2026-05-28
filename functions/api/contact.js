export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const type = String(body.type || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !contact || !message) {
      return jsonResponse(
        { success: false, error: "Vyplňte meno, kontakt a správu." },
        400
      );
    }

    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.RESEND_FROM) {
      return jsonResponse(
        { success: false, error: "Chýba nastavenie e-mailu na serveri." },
        500
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background:#03040a; color:#ffffff; padding:24px; border-radius:16px;">
        <h1 style="color:#22d3ee; margin-top:0;">Nový dopyt z Lech-Web</h1>
        <div style="background:#0f172a; padding:18px; border-radius:14px; border:1px solid rgba(34,211,238,0.35);">
          <p><strong>Meno / firma:</strong> ${escapeHtml(name)}</p>
          <p><strong>Kontakt:</strong> ${escapeHtml(contact)}</p>
          <p><strong>Typ webu:</strong> ${escapeHtml(type)}</p>
          <p><strong>Správa:</strong></p>
          <p style="white-space:pre-line;">${escapeHtml(message)}</p>
        </div>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [env.CONTACT_TO],
        subject: `Nový dopyt Lech-Web: ${name}`,
        html: emailHtml,
        reply_to: contact.includes("@") ? contact : undefined,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return jsonResponse(
        {
          success: false,
          error: "E-mail sa nepodarilo odoslať.",
          detail: resendData,
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: "Dopyt bol úspešne odoslaný.",
    });
  } catch {
    return jsonResponse(
      {
        success: false,
        error: "Serverová chyba pri odosielaní formulára.",
      },
      500
    );
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
