
const fs = require("fs");

const path = "functions/site/[slug].js";
if (!fs.existsSync(path)) {
  console.error("CHYBA: neexistuje " + path);
  process.exit(1);
}

let s = fs.readFileSync(path, "utf8");

function replaceThemeGlow(id, value) {
  const re = new RegExp(`(${id}: \\{[^}]*glow: ")[^"]+(")`, "g");
  s = s.replace(re, `$1${value}$2`);
}

replaceThemeGlow("lechweb", "rgba(103,232,249,.42)");
replaceThemeGlow("cyan", "rgba(34,211,238,.42)");
replaceThemeGlow("fuchsia", "rgba(232,121,249,.42)");
replaceThemeGlow("violet", "rgba(167,139,250,.42)");
replaceThemeGlow("emerald", "rgba(52,211,153,.42)");
replaceThemeGlow("orange", "rgba(251,146,60,.42)");
replaceThemeGlow("kawasaki", "rgba(57,255,20,.50)");
replaceThemeGlow("acidyellow", "rgba(255,242,0,.48)");
replaceThemeGlow("sharpered", "rgba(255,7,58,.50)");
replaceThemeGlow("rgbglow", "rgba(0,245,255,.45)");

const softerCss = `/* LECH-WEB STRONG NEON EFFECTS */
.top,
.sidebar,
.hero,
.product,
.side-box,
.benefit,
.modal-card,
.footer,
.search,
input,
textarea,
select,
.tabs span {
  border-color: color-mix(in srgb, var(--a) 42%, rgba(255,255,255,.16)) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 18%, transparent),
    0 0 10px color-mix(in srgb, var(--a) 12%, transparent),
    inset 0 0 10px rgba(255,255,255,.018) !important;
}

.product:hover,
.benefit:hover,
.hero:hover,
.side-box:hover,
.tabs span:hover {
  border-color: color-mix(in srgb, var(--a) 70%, white) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 36%, transparent),
    0 0 18px color-mix(in srgb, var(--a) 28%, transparent),
    0 0 36px color-mix(in srgb, var(--a2) 16%, transparent),
    inset 0 0 14px color-mix(in srgb, var(--a) 5%, transparent) !important;
}

.logo-mark,
.benefit-icon,
.detail,
.submit,
.search button,
.cart-btn,
.icons div {
  background: linear-gradient(135deg, var(--a), var(--a2)) !important;
  color: #020617 !important;
  box-shadow:
    0 0 9px color-mix(in srgb, var(--a) 38%, transparent),
    0 0 20px color-mix(in srgb, var(--a) 22%, transparent) !important;
}

.menu a:hover,
.sidebar a:hover,
.footer a:hover,
.price strong,
.availability,
.logo-text,
.side-box h2,
.hero h1 {
  color: var(--a) !important;
  text-shadow:
    0 0 5px color-mix(in srgb, var(--a) 32%, transparent),
    0 0 12px color-mix(in srgb, var(--a) 18%, transparent) !important;
}

.badges span {
  background: var(--a) !important;
  color: #020617 !important;
  box-shadow: 0 0 10px color-mix(in srgb, var(--a) 26%, transparent) !important;
}

.pimg div {
  border: 1px solid color-mix(in srgb, var(--a) 38%, transparent) !important;
  box-shadow:
    inset 0 0 22px color-mix(in srgb, var(--a) 8%, transparent),
    0 0 8px color-mix(in srgb, var(--a) 10%, transparent) !important;
}`;

// Replace existing strong neon block up to next @media or </style>
if (s.includes("/* LECH-WEB STRONG NEON EFFECTS */")) {
  s = s.replace(/\/\* LECH-WEB STRONG NEON EFFECTS \*\/[\s\S]*?(?=\n@media|\n<\/style>)/, softerCss);
} else {
  s = s.replace(/<\/style>/, softerCss + "\n</style>");
}

fs.writeFileSync(path, s, "utf8");

console.log("OK: neon efekt je zjemnený.");
console.log("Teraz:");
console.log("npm run build");
console.log("git add functions/site/[slug].js");
console.log('git commit -m "Soften neon glow"');
console.log("git push");
console.log("npx wrangler pages deploy dist --project-name=lech-web --branch=main");
