
function bucket(env) {
  return env.LECHWEB_UPLOADS || env.R2_UPLOADS || env.UPLOADS || null;
}

function keyFromParams(params) {
  const value = params.path;
  if (Array.isArray(value)) return value.join("/");
  return String(value || "");
}

export async function onRequestGet({ params, env }) {
  const r2 = bucket(env);
  if (!r2) return new Response("R2 binding LECHWEB_UPLOADS nie je nastavený.", { status: 500 });

  const key = keyFromParams(params);
  if (!key || key.includes("..")) return new Response("Neplatný súbor.", { status: 400 });

  const object = await r2.get(key);
  if (!object) return new Response("Súbor neexistuje.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", headers.get("cache-control") || "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}

export async function onRequestHead({ params, env }) {
  const r2 = bucket(env);
  if (!r2) return new Response(null, { status: 500 });

  const key = keyFromParams(params);
  if (!key || key.includes("..")) return new Response(null, { status: 400 });

  const object = await r2.head(key);
  if (!object) return new Response(null, { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(null, { headers });
}
