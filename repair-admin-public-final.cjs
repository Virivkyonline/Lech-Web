
const fs = require("fs");

function read(path) {
  if (!fs.existsSync(path)) {
    console.error("CHYBA: neexistuje " + path);
    process.exit(1);
  }
  return fs.readFileSync(path, "utf8");
}

function write(path, data) {
  fs.writeFileSync(path, data, "utf8");
}

function mustPatch(name, ok) {
  if (ok) console.log("OK:", name);
  else {
    console.error("CHYBA:", name);
    process.exit(1);
  }
}

function patchApp() {
  const path = "src/App.jsx";
  let s = read(path);

  // 1. React import: useEffect
  s = s.replace(/import React, \{([^}]+)\} from ["']react["'];/, (m, inside) => {
    const parts = inside.split(",").map(x => x.trim()).filter(Boolean);
    if (!parts.includes("useEffect")) parts.push("useEffect");
    return `import React, { ${parts.join(", ")} } from "react";`;
  });

  // 2. colorPresets
  const colorBlock = `const colorPresets = [
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
];`;

  if (/const colorPresets = \[[\s\S]*?\];/.test(s)) {
    s = s.replace(/const colorPresets = \[[\s\S]*?\];/, colorBlock);
  } else {
    console.error("CHYBA: Nenašiel som const colorPresets v src/App.jsx");
    process.exit(1);
  }

  // 3. remember login state + useEffect
  if (!s.includes("rememberCustomerLogin")) {
    const stateRegex = /(const\s+\[customerLogin,\s*setCustomerLogin\]\s*=\s*useState\(\{\s*email:\s*["']["'],\s*password:\s*["']["']\s*\}\);\s*const\s+\[customerLoggedIn,\s*setCustomerLoggedIn\]\s*=\s*useState\(false\);)/;
    if (!stateRegex.test(s)) {
      console.error("CHYBA: Nenašiel som customerLogin/customerLoggedIn state v src/App.jsx.");
      console.error('Pošli výpis: Select-String -Path "src\\App.jsx" -Pattern "customerLogin|customerLoggedIn" -Context 3,8');
      process.exit(1);
    }

    s = s.replace(stateRegex, `$1
  const [rememberCustomerLogin, setRememberCustomerLogin] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lechweb_customer_login");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setCustomerLogin({
        email: parsed.email || "",
        password: parsed.password || "",
      });
      setRememberCustomerLogin(true);
    } catch {}
  }, []);`);
  }

  // 4. save remember on successful login
  if (!s.includes("lechweb_customer_login") || !s.includes("localStorage.setItem(\"lechweb_customer_login\"")) {
    s = s.replace(/setCustomerLoggedIn\(true\);/, `setCustomerLoggedIn(true);
      try {
        if (rememberCustomerLogin) {
          localStorage.setItem("lechweb_customer_login", JSON.stringify(customerLogin));
        } else {
          localStorage.removeItem("lechweb_customer_login");
        }
      } catch {}`);
  } else if (!s.includes("localStorage.setItem(\"lechweb_customer_login\"")) {
    s = s.replace(/setCustomerLoggedIn\(true\);/, `setCustomerLoggedIn(true);
      try {
        if (rememberCustomerLogin) {
          localStorage.setItem("lechweb_customer_login", JSON.stringify(customerLogin));
        } else {
          localStorage.removeItem("lechweb_customer_login");
        }
      } catch {}`);
  }

  // 5. insert checkbox under password input
  if (!s.includes("Zapamätať email a heslo")) {
    const checkbox = `
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberCustomerLogin}
                  onChange={(e) => {
                    setRememberCustomerLogin(e.target.checked);
                    if (!e.target.checked) localStorage.removeItem("lechweb_customer_login");
                  }}
                  className="h-4 w-4"
                />
                Zapamätať email a heslo
              </label>`;

    // Exact-ish password input in customer login form
    const passInputRegex = /(<Input\s+placeholder=["']Heslo["']\s+type=["']password["'][\s\S]*?\/>)/;
    if (passInputRegex.test(s)) {
      s = s.replace(passInputRegex, `$1${checkbox}`);
    } else {
      // Alternate order
      const passInputRegex2 = /(<Input[\s\S]*?type=["']password["'][\s\S]*?value=\{customerLogin\.password\}[\s\S]*?\/>)/;
      if (passInputRegex2.test(s)) {
        s = s.replace(passInputRegex2, `$1${checkbox}`);
      } else {
        console.error("CHYBA: Nenašiel som password input zákazníka.");
        console.error('Pošli výpis: Select-String -Path "src\\App.jsx" -Pattern "placeholder=.Heslo|type=.password" -Context 2,8');
        process.exit(1);
      }
    }
  }

  write(path, s);

  mustPatch("src/App.jsx obsahuje Kawasaki", s.includes("Kawasaki neon zelená"));
  mustPatch("src/App.jsx obsahuje RGB", s.includes("RGB svietiaca"));
  mustPatch("src/App.jsx obsahuje checkbox", s.includes("Zapamätať email a heslo"));
  mustPatch("src/App.jsx obsahuje rememberCustomerLogin", s.includes("rememberCustomerLogin"));
}

function patchPublicRenderer() {
  const path = "functions/site/[slug].js";
  let s = read(path);

  const themeFn = `function getTheme(theme) {
  const raw = typeof theme === "string" ? theme : (theme?.accent || "lechweb");
  const id = String(raw || "lechweb").trim().toLowerCase();

  const themes = {
    lechweb: { accent: "#67e8f9", accent2: "#e879f9", dark: "#03040a", panel: "#0f172a", glow: "rgba(103,232,249,.78)", rgb: false },
    cyan: { accent: "#67e8f9", accent2: "#22d3ee", dark: "#03040a", panel: "#0f172a", glow: "rgba(34,211,238,.78)", rgb: false },
    fuchsia: { accent: "#e879f9", accent2: "#67e8f9", dark: "#05030a", panel: "#14091f", glow: "rgba(232,121,249,.78)", rgb: false },
    violet: { accent: "#a78bfa", accent2: "#e879f9", dark: "#070512", panel: "#141026", glow: "rgba(167,139,250,.78)", rgb: false },
    emerald: { accent: "#34d399", accent2: "#67e8f9", dark: "#03110c", panel: "#082018", glow: "rgba(52,211,153,.78)", rgb: false },
    orange: { accent: "#fb923c", accent2: "#facc15", dark: "#130902", panel: "#211006", glow: "rgba(251,146,60,.78)", rgb: false },

    kawasaki: { accent: "#39ff14", accent2: "#b6ff00", dark: "#020800", panel: "#061a03", glow: "rgba(57,255,20,.95)", rgb: false },
    acidyellow: { accent: "#fff200", accent2: "#39ff14", dark: "#0b0b00", panel: "#1a1800", glow: "rgba(255,242,0,.95)", rgb: false },
    "acid-yellow": { accent: "#fff200", accent2: "#39ff14", dark: "#0b0b00", panel: "#1a1800", glow: "rgba(255,242,0,.95)", rgb: false },
    sharpered: { accent: "#ff073a", accent2: "#ff7a00", dark: "#110004", panel: "#210008", glow: "rgba(255,7,58,.95)", rgb: false },
    "sharp-red": { accent: "#ff073a", accent2: "#ff7a00", dark: "#110004", panel: "#210008", glow: "rgba(255,7,58,.95)", rgb: false },
    rgbglow: { accent: "#00f5ff", accent2: "#ff00f5", dark: "#02020a", panel: "#09091a", glow: "rgba(0,245,255,.90)", rgb: true },
    "rgb-glow": { accent: "#00f5ff", accent2: "#ff00f5", dark: "#02020a", panel: "#09091a", glow: "rgba(0,245,255,.90)", rgb: true }
  };

  return themes[id] || themes.lechweb;
}

`;

  if (/function\s+getTheme\s*\(/.test(s)) {
    s = s.replace(/function\s+getTheme\s*\([^)]*\)\s*\{[\s\S]*?return\s+themes\[id\]\s*\|\|\s*themes\.lechweb;\s*\}\s*/m, themeFn);
  } else {
    s = themeFn + s;
  }

  // headers utf8
  s = s.replace(/["']content-type["']\s*:\s*["']text\/html(?:;\s*charset=[^"']+)?["']/gi, `"content-type": "text/html; charset=UTF-8"`);
  s = s.replace(/["']content-type["']\s*:\s*["']text\/plain(?:;\s*charset=[^"']+)?["']/gi, `"content-type": "text/plain; charset=UTF-8"`);

  // meta charset
  if (!s.includes('<meta charset="utf-8">') && !s.includes("<meta charset='utf-8'>")) {
    s = s.replace(/<head>/, '<head>\\n<meta charset="utf-8">');
  }

  const neonCss = `
/* LECH-WEB STRONG NEON EFFECTS */
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
  border-color: color-mix(in srgb, var(--a) 66%, rgba(255,255,255,.12)) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--a) 42%, transparent),
    0 0 26px color-mix(in srgb, var(--a) 30%, transparent),
    inset 0 0 22px rgba(255,255,255,.03) !important;
}

.product:hover,
.benefit:hover,
.hero:hover,
.side-box:hover,
.tabs span:hover {
  border-color: var(--a) !important;
  box-shadow:
    0 0 0 1px var(--a),
    0 0 34px var(--glow),
    0 0 95px color-mix(in srgb, var(--a2) 34%, transparent),
    inset 0 0 32px color-mix(in srgb, var(--a) 12%, transparent) !important;
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
    0 0 18px var(--glow),
    0 0 54px color-mix(in srgb, var(--a) 62%, transparent) !important;
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
    0 0 12px color-mix(in srgb, var(--a) 70%, transparent),
    0 0 26px var(--glow) !important;
}

.badges span {
  background: var(--a) !important;
  color: #020617 !important;
  box-shadow: 0 0 22px var(--glow) !important;
}

.pimg div {
  border: 1px solid color-mix(in srgb, var(--a) 60%, transparent) !important;
  box-shadow:
    inset 0 0 55px color-mix(in srgb, var(--a) 18%, transparent),
    0 0 24px color-mix(in srgb, var(--a) 20%, transparent) !important;
}
`;

  if (!s.includes("LECH-WEB STRONG NEON EFFECTS")) {
    if (s.includes("@media")) {
      s = s.replace(/@media/, neonCss + "\n@media");
    } else {
      s = s.replace(/<\/style>/, neonCss + "\n</style>");
    }
  }

  // safer symbols to avoid broken font/encoding weirdness
  s = s
    .replaceAll("✦", "*")
    .replaceAll("↻", "R")
    .replaceAll("✓", "OK")
    .replaceAll("⌂", "DOM")
    .replaceAll("⌕", "H")
    .replaceAll("♙", "U")
    .replaceAll("🛒", "Kosik")
    .replaceAll("✉", "Email")
    .replaceAll("☎", "Tel");

  write(path, s);

  mustPatch("functions/site/[slug].js obsahuje getTheme", s.includes("function getTheme"));
  mustPatch("functions/site/[slug].js obsahuje neon CSS", s.includes("LECH-WEB STRONG NEON EFFECTS"));
  mustPatch("functions/site/[slug].js má UTF-8 header", s.includes("text/html; charset=UTF-8") || s.includes("text/html; charset=utf-8"));
}

patchApp();
patchPublicRenderer();

console.log("");
console.log("HOTOVO: repair patch prebehol.");
console.log("Teraz spusti:");
console.log("npm run build");
console.log('Select-String -Path "dist\\\\assets\\\\*.js" -Pattern "Kawasaki|rgbGlow|Zapamätať"');
console.log("git add .");
console.log('git commit -m "Repair admin login colors and public neon theme"');
console.log("git push");
console.log("npx wrangler pages deploy dist --project-name=lech-web --branch=main");
