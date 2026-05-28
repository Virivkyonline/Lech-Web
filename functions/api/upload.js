
function h(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-admin-pin",
    ...extra,
  };
}

function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h() });
}

function bucket(env) {
  return env.LECHWEB_UPLOADS || env.R2_UPLOADS || env.UPLOADS || null;
}

function extFromName(name, type) {
  const lower = String(name || "").toLowerCase();
  const found = lower.match(/\.([a-z0-9]{2,8})$/);
  if (found) return found[1];

  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";

  return "bin";
}

function safeName(name) {
  return String(name || "upload")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "upload";
}

function rand() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

function keyFor(file, folder) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = extFromName(file.name, file.type);
  const clean = safeName(file.name).replace(/\.[a-z0-9]{2,8}$/i, "");
  const prefix = safeName(folder || "images");
  return `${prefix}/${yyyy}/${mm}/${Date.now()}-${rand()}-${clean}.${ext}`;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet({ env }) {
  const r2 = bucket(env);
  let writeOk = false;
  let error = null;

  if (r2) {
    try {
      await r2.put("_health/upload.txt", "ok " + new Date().toISOString(), {
        httpMetadata: { contentType: "text/plain; charset=utf-8" },
      });
      writeOk = true;
    } catch (e) {
      error = String(e && e.message ? e.message : e);
    }
  }

  return j({
    success: true,
    endpoint: "/api/upload",
    mode: "r2-upload",
    r2BindingFound: Boolean(r2),
    r2WriteOk: writeOk,
    r2Error: error,
    requiredBinding: "LECHWEB_UPLOADS",
    uploadField: "file",
    publicPath: "/uploads/<key>",
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const r2 = bucket(env);
    if (!r2) {
      return j({ success: false, error: "Chýba R2 binding LECHWEB_UPLOADS." }, 500);
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return j({ success: false, error: "Použi multipart/form-data s poľom file." }, 400);
    }

    const form = await request.formData();
    const file = form.get("file");
    const folder = form.get("folder") || "images";

    if (!file || typeof file === "string") {
      return j({ success: false, error: "Chýba súbor v poli file." }, 400);
    }

    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
    if (!allowed.has(file.type)) {
      return j({
        success: false,
        error: "Povolené sú iba obrázky JPG, PNG, WEBP, GIF, SVG.",
        receivedType: file.type,
      }, 400);
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return j({
        success: false,
        error: "Súbor je príliš veľký. Maximum je 8 MB.",
        size: file.size,
      }, 400);
    }

    const key = keyFor(file, folder);
    const buffer = await file.arrayBuffer();

    await r2.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name || "",
        uploadedAt: new Date().toISOString(),
      },
    });

    const url = new URL(request.url);
    const publicPath = `/uploads/${key}`;
    const publicUrl = `${url.origin}${publicPath}`;

    return j({
      success: true,
      key,
      filename: file.name,
      size: file.size,
      type: file.type,
      publicPath,
      publicUrl,
      message: "Obrázok bol nahratý.",
    });
  } catch (e) {
    return j({
      success: false,
      error: "Upload zlyhal.",
      detail: String(e && e.message ? e.message : e),
      stack: String(e && e.stack ? e.stack : ""),
    }, 500);
  }
}
