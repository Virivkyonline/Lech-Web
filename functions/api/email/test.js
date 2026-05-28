
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin",
  };
}

function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h() });
}

function adminOk(request, env) {
  const pin = env.ADMIN_PIN || env.ADMIN_PASSWORD || "";
  if (!pin) return true;

  const url = new URL(request.url);
  return (request.headers.get("x-admin-pin") || "") === pin || (url.searchParams.get("pin") || "") === pin;
}

function fromEmail(env) {
  return env.RESEND_FROM || "Lech-Web <lech-web@send.e-bazarik.sk>";
}

async function sendResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 500,
      data: { error: "Chýba RESEND_API_KEY v Cloudflare Variables and Secrets." },
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet({ request, env }) {
  try {
    if (!adminOk(request, env)) return j({ success: false, error: "Nesprávny admin PIN." }, 401);

    const url = new URL(request.url);
    const to = url.searchParams.get("to") || env.CONTACT_TO || "lechstav@gmail.com";

    const result = await sendResend(env, {
      from: fromEmail(env),
      to,
      subject: "Lech-Web test email",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Lech-Web test email</h2>
          <p>Resend napojenie funguje.</p>
          <p>Čas: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return j({
      success: result.ok,
      endpoint: "/api/email/test",
      resendStatus: result.status,
      from: fromEmail(env),
      to,
      result: result.data,
    }, result.ok ? 200 : 500);
  } catch (e) {
    return j({
      success: false,
      error: "Test email zlyhal.",
      detail: String(e && e.message ? e.message : e),
    }, 500);
  }
}
