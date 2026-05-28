
const fs = require("fs");

function patchFile(path, patches) {
  if (!fs.existsSync(path)) {
    console.log("SKIP missing", path);
    return;
  }
  let s = fs.readFileSync(path, "utf8");
  for (const p of patches) {
    if (s.includes(p.marker)) {
      console.log("OK already has", p.marker, "in", path);
      continue;
    }
    if (!p.find.test(s)) {
      console.log("WARN pattern not found in", path, p.name);
      continue;
    }
    s = s.replace(p.find, p.replace);
    console.log("PATCH", p.name, "in", path);
  }
  fs.writeFileSync(path, s, "utf8");
}

const themeFunction = `function getTheme(theme) {
  const id = String(theme?.accent || theme || "lechweb").toLowerCase();
  const themes = {
    lechweb: ["#67e8f9", "#e879f9", "#03040a", "#0f172a", "rgba(103,232,249,.65)", false],
    cyan: ["#67e8f9", "#22d3ee", "#03040a", "#0f172a", "rgba(34,211,238,.65)", false],
    fuchsia: ["#e879f9", "#67e8f9", "#05030a", "#14091f", "rgba(232,121,249,.65)", false],
    violet: ["#a78bfa", "#e879f9", "#070512", "#141026", "rgba(167,139,250,.65)", false],
    emerald: ["#34d399", "#67e8f9", "#03110c", "#082018", "rgba(52,211,153,.65)", false],
    orange: ["#fb923c", "#facc15", "#130902", "#211006", "rgba(251,146,60,.65)", false],
    kawasaki: ["#39ff14", "#b6ff00", "#020800", "#061a03", "rgba(57,255,20,.78)", false],
    acidyellow: ["#fff200", "#39ff14", "#0b0b00", "#1a1800", "rgba(255,242,0,.76)", false],
    sharpered: ["#ff073a", "#ff7a00", "#110004", "#210008", "rgba(255,7,58,.72)", false],
    rgbglow: ["#00f5ff", "#ff00f5", "#02020a", "#09091a", "rgba(0,245,255,.74)", true],
  };
  const t = themes[id] || themes.lechweb;
  return { accent: t[0], accent2: t[1], dark: t[2], panel: t[3], glow: t[4], rgb: t[5] };
}
// THEME_PATCH_V1
`;

const colorPresetBlock = `const colorPresets = [
  ["lechweb", "Lech-Web neon originál"],
  ["cyan", "Cyan business"],
  ["fuchsia", "Fuchsia premium"],
  ["violet", "Violet luxury"],
  ["emerald", "Emerald fresh"],
  ["orange", "Orange action"],
  ["kawasaki", "Kawasaki neon zelená"],
  ["acidYellow", "Ostrá neon žltá"],
  ["sharpRed", "Ostrá neon červená"],
  ["rgbGlow", "RGB svietiaca"],
]; // THEME_PATCH_V1`;

patchFile("src/App.jsx", [
  {
    name: "colorPresets",
    marker: "Kawasaki neon zelená",
    find: /const colorPresets = \[[\s\S]*?\];/,
    replace: colorPresetBlock,
  }
]);

patchFile("functions/site/[slug].js", [
  {
    name: "insert getTheme",
    marker: "THEME_PATCH_V1",
    find: /function accent\(site\) \{[\s\S]*?\n\}/,
    replace: themeFunction + `\nfunction accent(site) { return getTheme(site.theme).accent; }`,
  },
  {
    name: "css root theme variables",
    marker: "--a2:",
    find: /:root\{--a:\$\{a\};--line:rgba\(255,255,255,\.12\);/,
    replace: `:root{--a:${'${a}'};--a2:${'${getTheme(site.theme).accent2}'};--dark:${'${getTheme(site.theme).dark}'};--panel:${'${getTheme(site.theme).panel}'};--glow:${'${getTheme(site.theme).glow}'};--line:rgba(255,255,255,.12);`,
  },
  {
    name: "rgb body animation",
    marker: "@keyframes rgbpulse",
    find: /<\/style>/,
    replace: `
body{background:radial-gradient(circle at 14% 8%,color-mix(in srgb,var(--a) 24%,transparent),transparent 30%),radial-gradient(circle at 86% 6%,color-mix(in srgb,var(--a2) 20%,transparent),transparent 31%),linear-gradient(180deg,var(--dark),#02040a)}
.logo-mark,.benefit-icon,.detail,.submit,.search button{box-shadow:0 0 22px var(--glow)}
${'${getTheme(site.theme).rgb ? `body{animation:rgbpulse 8s linear infinite}.logo-mark,.benefit-icon,.detail,.submit{animation:rgbpulseBtn 4s linear infinite}@keyframes rgbpulse{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}@keyframes rgbpulseBtn{0%{box-shadow:0 0 24px #00f5ff}33%{box-shadow:0 0 24px #ff00f5}66%{box-shadow:0 0 24px #39ff14}100%{box-shadow:0 0 24px #00f5ff}}` : ``}'}
</style>`,
  },
]);

patchFile("functions/site/[slug]/kontakt.js", [
  {
    name: "insert getTheme contact",
    marker: "THEME_PATCH_V1",
    find: /function accent\(site\) \{[\s\S]*?\n\}/,
    replace: themeFunction + `\nfunction accent(site) { return getTheme(site.theme).accent; }`,
  },
]);

console.log("DONE theme patch");
