
const fs = require("fs");

const path = "src/App.jsx";

if (!fs.existsSync(path)) {
  console.error("CHYBA: src/App.jsx neexistuje.");
  process.exit(1);
}

let s = fs.readFileSync(path, "utf8");

if (s.includes("lechweb_remember_customer_login")) {
  console.log("OK: Zapamätať prihlásenie už je v App.jsx.");
  process.exit(0);
}

function replaceOrFail(name, find, replace) {
  if (!find.test(s)) {
    console.error("CHYBA: nenašiel som časť:", name);
    process.exit(1);
  }
  s = s.replace(find, replace);
  console.log("PATCH:", name);
}

/*
  Patch je robený opatrne:
  - ak nájde customer login state, doplní remember checkbox
  - doplní načítanie z localStorage
  - doplní uloženie pri úspešnom prihlásení
*/

// 1) import useEffect
s = s.replace(
  /import React, \{ ([^}]*?) \} from "react";/,
  (m, inside) => {
    if (inside.includes("useEffect")) return m;
    return `import React, { ${inside.trim()}, useEffect } from "react";`;
  }
);

// 2) pridaj remember state za customer password state
if (/const \[customerPassword,\s*setCustomerPassword\]\s*=\s*useState\([^)]*\);/.test(s)) {
  s = s.replace(
    /(const \[customerPassword,\s*setCustomerPassword\]\s*=\s*useState\([^)]*\);)/,
    `$1
  const [rememberCustomerLogin, setRememberCustomerLogin] = useState(false);`
  );
} else if (/const \[customerLoginPassword,\s*setCustomerLoginPassword\]\s*=\s*useState\([^)]*\);/.test(s)) {
  s = s.replace(
    /(const \[customerLoginPassword,\s*setCustomerLoginPassword\]\s*=\s*useState\([^)]*\);)/,
    `$1
  const [rememberCustomerLogin, setRememberCustomerLogin] = useState(false);`
  );
} else {
  console.error("CHYBA: nenašiel som customerPassword state.");
  console.error('Pošli výpis: Select-String -Path "src\\App.jsx" -Pattern "customer.*Password|password" -Context 2,4');
  process.exit(1);
}

// 3) doplň useEffect po state remember
s = s.replace(
  /(const \[rememberCustomerLogin,\s*setRememberCustomerLogin\]\s*=\s*useState\(false\);)/,
  `$1

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lechweb_remember_customer_login");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.email) {
        if (typeof setCustomerEmail === "function") setCustomerEmail(parsed.email);
        if (typeof setCustomerLoginEmail === "function") setCustomerLoginEmail(parsed.email);
      }
      if (parsed?.password) {
        if (typeof setCustomerPassword === "function") setCustomerPassword(parsed.password);
        if (typeof setCustomerLoginPassword === "function") setCustomerLoginPassword(parsed.password);
      }
      setRememberCustomerLogin(true);
    } catch {}
  }, []);`
);

// 4) pri úspešnom logine ulož hodnoty - hľadáme setCustomerLoggedIn(true) alebo status "Prihlásený"
if (s.includes("setCustomerLoggedIn(true)")) {
  s = s.replace(
    /setCustomerLoggedIn\(true\);/,
    `setCustomerLoggedIn(true);
      try {
        const emailToSave = typeof customerEmail !== "undefined" ? customerEmail : customerLoginEmail;
        const passwordToSave = typeof customerPassword !== "undefined" ? customerPassword : customerLoginPassword;
        if (rememberCustomerLogin) {
          localStorage.setItem("lechweb_remember_customer_login", JSON.stringify({ email: emailToSave, password: passwordToSave }));
        } else {
          localStorage.removeItem("lechweb_remember_customer_login");
        }
      } catch {};`
  );
} else if (s.includes("Prihlásený:")) {
  // fallback: vlož do login funkcie po výskyte statusu
  s = s.replace(
    /(setStatus\(`?Prihlásený:[\s\S]*?\);)/,
    `$1
      try {
        const emailToSave = typeof customerEmail !== "undefined" ? customerEmail : customerLoginEmail;
        const passwordToSave = typeof customerPassword !== "undefined" ? customerPassword : customerLoginPassword;
        if (rememberCustomerLogin) {
          localStorage.setItem("lechweb_remember_customer_login", JSON.stringify({ email: emailToSave, password: passwordToSave }));
        } else {
          localStorage.removeItem("lechweb_remember_customer_login");
        }
      } catch {};`
  );
} else {
  console.log("WARN: nenašiel som presné miesto úspešného loginu. Checkbox bude doplnený, ale uloženie možno bude treba ručne.");
}

// 5) vlož checkbox za password input v zákazníckom login paneli
const checkboxJsx = `
              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberCustomerLogin}
                  onChange={(e) => {
                    setRememberCustomerLogin(e.target.checked);
                    if (!e.target.checked) localStorage.removeItem("lechweb_remember_customer_login");
                  }}
                  className="h-4 w-4"
                />
                Zapamätať email a heslo v tomto prehliadači
              </label>`;

// Pokus 1: za input type password
if (/<Input[^>]*type="password"[\s\S]*?\/>/.test(s)) {
  s = s.replace(/(<Input[^>]*type="password"[\s\S]*?\/>)/, `$1${checkboxJsx}`);
} else if (/<input[^>]*type="password"[\s\S]*?>/.test(s)) {
  s = s.replace(/(<input[^>]*type="password"[\s\S]*?>)/, `$1${checkboxJsx}`);
} else {
  console.error("CHYBA: nenašiel som password input.");
  console.error('Pošli výpis: Select-String -Path "src\\App.jsx" -Pattern "type=.\\"password\\"|password" -Context 2,6');
  process.exit(1);
}

fs.writeFileSync(path, s, "utf8");

console.log("HOTOVO: Pridané Zapamätať email a heslo.");
console.log("Teraz spusti:");
console.log("npm run build");
console.log("git add .");
console.log('git commit -m "Remember customer login"');
console.log("git push");
