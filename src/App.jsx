import React, { useState } from "react";
import "./App.css";

const colorPresets = [
  ["lechweb", "Lech-Web neon originál"],
  ["cyan", "Cyan business"],
  ["fuchsia", "Fuchsia premium"],
  ["violet", "Violet luxury"],
  ["emerald", "Emerald fresh"],
  ["orange", "Orange action"],
];

const defaultProducts = [
  {
    title: "Ukážkový produkt",
    price: "€999",
    oldPrice: "",
    image: "",
    shortText: "Krátky popis produktu.",
    badge: "TIP",
  },
];

function slugify(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function lines(v) {
  return String(v || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinLines(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function parsePairs(text) {
  return lines(text).map((row) => {
    const [title, ...rest] = row.split("|");
    return { title: title || "", url: rest.join("|") || "#" };
  });
}

function parseBenefits(text) {
  return lines(text).map((row) => {
    const [title, ...rest] = row.split("|");
    return { title: title || "", text: rest.join("|") || "" };
  });
}

function input() {
  return "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300";
}

function area() {
  return input() + " min-h-32";
}

function Panel({ title, desc, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="mb-5 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white">{title}</h2>
        {desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Status({ text }) {
  if (!text) return null;
  return (
    <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100">
      {text}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("customer");
  const [adminSection, setAdminSection] = useState("overview");
  const [authMode, setAuthMode] = useState("register");
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState(null);
  const [adminPin, setAdminPin] = useState("");
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  const [auth, setAuth] = useState({
    companyName: "",
    email: "",
    password: "",
    plan: "Mini E-shop",
    template: "E-shop oblečenie",
  });

  const [site, setSite] = useState({
    slug: "",
    companyName: "",
    headline: "",
    description: "",
    homepageText: "",
    phone: "",
    siteEmail: "",
    template: "E-shop oblečenie",
    theme: {
      accent: "lechweb",
      logo: "",
      heroImage: "",
    },
    categoriesText: "Hlavná kategória\nAkčný tovar\nNovinky\nNajpredávanejšie\nDoplnky\nVýpredaj",
    adviceText: "Ako nakupovať|#\nObchodné podmienky|#\nOchrana osobných údajov|#",
    youtubeText: "YouTube kanál|#",
    benefitsText:
      "Darček zdarma|Ku každej objednávke.\nRýchle dodanie|Pre produkty skladom.\nNa splátky|Rýchlo a bezpečne.\nDoprava zdarma|Podľa podmienok predajcu.",
    products: defaultProducts,
  });

  const publicUrl = site.slug ? `https://lech-web.pages.dev/site/${slugify(site.slug)}` : "";

  function patchSite(patch) {
    setSite((prev) => ({ ...prev, ...patch }));
  }

  function patchTheme(patch) {
    setSite((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));
  }

  function buildPayload() {
    return {
      email: account?.email || auth.email,
      accountEmail: account?.email || auth.email,
      slug: slugify(site.slug || site.companyName),
      companyName: site.companyName,
      headline: site.headline,
      description: site.description,
      homepageText: site.homepageText,
      phone: site.phone,
      siteEmail: site.siteEmail,
      template: site.template,
      theme: site.theme,
      categories: site.categoriesText,
      adviceLinks: parsePairs(site.adviceText),
      youtube: parsePairs(site.youtubeText),
      benefits: parseBenefits(site.benefitsText),
      products: site.products,
      topMenu: [
        { title: "Produkty", url: "#produkty" },
        { title: "Akcie", url: "#produkty" },
        { title: "Ako nakupovať", url: "#info" },
        { title: "Kontakt", url: "#kontakt" },
      ],
      footerLinks: parsePairs(site.adviceText),
    };
  }

  function loadWebsite(w) {
    if (!w) return;
    setSite((prev) => ({
      ...prev,
      slug: w.slug || prev.slug,
      companyName: w.companyName || prev.companyName,
      headline: w.headline || prev.headline,
      description: w.description || prev.description,
      homepageText: w.homepageText || prev.homepageText,
      phone: w.phone || prev.phone,
      siteEmail: w.email || prev.siteEmail,
      template: w.template || prev.template,
      theme: w.theme || prev.theme,
      categoriesText: joinLines(w.eshop?.sidebar?.categories) || prev.categoriesText,
      adviceText:
        (w.eshop?.sidebar?.adviceLinks || [])
          .map((x) => `${x.title}|${x.url || "#"}`)
          .join("\n") || prev.adviceText,
      youtubeText:
        (w.eshop?.sidebar?.youtube || [])
          .map((x) => `${x.title}|${x.url || "#"}`)
          .join("\n") || prev.youtubeText,
      benefitsText:
        (w.eshop?.benefits || []).map((x) => `${x.title}|${x.text}`).join("\n") ||
        prev.benefitsText,
      products: w.eshop?.products?.length ? w.eshop.products : prev.products,
    }));
  }

  async function loginOrRegister(e) {
    e.preventDefault();
    setStatus("Pracujem...");
    try {
      const url = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body =
        authMode === "register"
          ? auth
          : { email: auth.email, password: auth.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Chyba účtu.");

      setAccount(data.account);
      setStatus(authMode === "register" ? "Účet vytvorený." : "Prihlásenie OK.");

      const acc = data.account;
      patchSite({
        slug: acc.website?.slug || slugify(acc.companyName || auth.companyName),
        companyName: acc.website?.companyName || acc.companyName || auth.companyName,
        headline: acc.website?.headline || acc.companyName || auth.companyName,
        siteEmail: acc.website?.email || acc.email,
        template: acc.website?.template || auth.template,
      });
      loadWebsite(acc.website);
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveSite() {
    setStatus("Ukladám web...");
    try {
      const res = await fetch("/api/site/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie zlyhalo.");

      setAccount(data.account);
      loadWebsite(data.website);
      setStatus("Web uložený.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function loadAdmin() {
    setStatus("Načítavam admin...");
    try {
      const res = await fetch("/api/admin/sites", {
        headers: { "x-admin-pin": adminPin },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Admin chyba.");

      setAdminAccounts(data.accounts || []);
      setStatus("Admin načítaný.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveAdmin(licenseAction = "") {
    const selected = adminAccounts.find((a) => a.email === selectedEmail);
    if (!selected) return setStatus("Vyber zákazníka.");

    setStatus("Admin ukladá...");
    try {
      const res = await fetch("/api/admin/site-save", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({
          email: selected.email,
          website: buildPayload(),
          licenseAction,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Admin uloženie zlyhalo.");

      setStatus("Admin uložené.");
      await loadAdmin();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function selectAdminEmail(email) {
    setSelectedEmail(email);
    const acc = adminAccounts.find((a) => a.email === email);
    if (!acc) return;

    setAccount(acc);
    setAuth((prev) => ({ ...prev, email: acc.email }));
    loadWebsite(acc.website);
    patchSite({
      slug: acc.website?.slug || slugify(acc.companyName),
      companyName: acc.website?.companyName || acc.companyName,
      headline: acc.website?.headline || acc.companyName,
      siteEmail: acc.website?.email || acc.email,
      template: acc.website?.template || acc.template || "E-shop oblečenie",
    });
  }

  function updateProduct(index, patch) {
    setSite((prev) => {
      const products = [...prev.products];
      products[index] = { ...products[index], ...patch };
      return { ...prev, products };
    });
  }

  function addProduct() {
    setSite((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          title: "Nový produkt",
          price: "€0",
          oldPrice: "",
          image: "",
          shortText: "",
          badge: "",
        },
      ],
    }));
  }

  function removeProduct(index) {
    setSite((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  }

  return (
    <main className="min-h-screen bg-[#05060d] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,.22),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(217,70,239,.18),transparent_34%)]" />

      <div className="relative z-10">
        <TopBar mode={mode} setMode={setMode} publicUrl={publicUrl} />

        {mode === "customer" ? (
          <CustomerView
            auth={auth}
            setAuth={setAuth}
            authMode={authMode}
            setAuthMode={setAuthMode}
            loginOrRegister={loginOrRegister}
            account={account}
            status={status}
            site={site}
            patchSite={patchSite}
            patchTheme={patchTheme}
            updateProduct={updateProduct}
            addProduct={addProduct}
            removeProduct={removeProduct}
            saveSite={saveSite}
            publicUrl={publicUrl}
          />
        ) : (
          <AdminView
            adminPin={adminPin}
            setAdminPin={setAdminPin}
            adminAccounts={adminAccounts}
            selectedEmail={selectedEmail}
            selectAdminEmail={selectAdminEmail}
            loadAdmin={loadAdmin}
            saveAdmin={saveAdmin}
            status={status}
            adminSection={adminSection}
            setAdminSection={setAdminSection}
            site={site}
            patchSite={patchSite}
            patchTheme={patchTheme}
            updateProduct={updateProduct}
            addProduct={addProduct}
            removeProduct={removeProduct}
            publicUrl={publicUrl}
            account={account}
          />
        )}
      </div>
    </main>
  );
}

function TopBar({ mode, setMode, publicUrl }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 font-black text-black shadow-[0_0_30px_rgba(34,211,238,.55)]">
            LW
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">Lech-Web</div>
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
              admin builder
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 md:block"
            >
              Otvoriť web
            </a>
          )}
          <button
            onClick={() => setMode("customer")}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              mode === "customer" ? "bg-cyan-300 text-black" : "bg-slate-800"
            }`}
          >
            Zákazník
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              mode === "admin" ? "bg-fuchsia-400 text-black" : "bg-slate-800"
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}

function CustomerView(props) {
  return (
    <div className="mx-auto grid max-w-[1600px] gap-5 px-5 py-5 xl:grid-cols-[360px_1fr]">
      <Panel title="Účet zákazníka" desc="Registrácia alebo prihlásenie zákazníka.">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1">
          <button
            onClick={() => props.setAuthMode("register")}
            className={`rounded-lg py-2 font-black ${
              props.authMode === "register" ? "bg-cyan-300 text-black" : "text-slate-300"
            }`}
          >
            Registrácia
          </button>
          <button
            onClick={() => props.setAuthMode("login")}
            className={`rounded-lg py-2 font-black ${
              props.authMode === "login" ? "bg-cyan-300 text-black" : "text-slate-300"
            }`}
          >
            Prihlásenie
          </button>
        </div>

        <form onSubmit={props.loginOrRegister} className="grid gap-3">
          {props.authMode === "register" && (
            <>
              <Field label="Názov firmy">
                <input className={input()} value={props.auth.companyName} onChange={(e) => props.setAuth({ ...props.auth, companyName: e.target.value })} />
              </Field>
              <Field label="Balík">
                <select className={input()} value={props.auth.plan} onChange={(e) => props.setAuth({ ...props.auth, plan: e.target.value })}>
                  <option>Start Web</option>
                  <option>Business Web</option>
                  <option>Mini E-shop</option>
                </select>
              </Field>
            </>
          )}

          <Field label="E-mail">
            <input className={input()} value={props.auth.email} onChange={(e) => props.setAuth({ ...props.auth, email: e.target.value })} />
          </Field>

          <Field label="Heslo">
            <input className={input()} type="password" value={props.auth.password} onChange={(e) => props.setAuth({ ...props.auth, password: e.target.value })} />
          </Field>

          <button className="rounded-xl bg-cyan-300 px-5 py-3 font-black text-black">
            {props.authMode === "register" ? "Vytvoriť účet" : "Prihlásiť sa"}
          </button>
        </form>

        <div className="mt-4">
          <Status text={props.status} />
        </div>

        {props.account && (
          <div className="mt-4 rounded-xl border border-lime-300/30 bg-lime-300/10 p-4 text-sm text-lime-100">
            <b>Licencia:</b> {props.account.status}<br />
            <b>Trial do:</b> {props.account.trialUntil?.slice(0, 10) || "—"}<br />
            <b>Paid do:</b> {props.account.paidUntil?.slice(0, 10) || "—"}
          </div>
        )}
      </Panel>

      <EditorPanel {...props} onSave={props.saveSite} />
    </div>
  );
}

function AdminView(props) {
  const menu = [
    ["overview", "Základný prehľad"],
    ["customers", "Zákazníci"],
    ["license", "Licencie"],
    ["appearance", "Vzhľad a farby"],
    ["sidebar", "Bočný panel"],
    ["products", "Produkty"],
    ["content", "Texty a SEO"],
  ];

  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-[280px_1fr] gap-0 px-5 py-5">
      <aside className="min-h-[calc(100vh-110px)] rounded-l-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-3">
          <div className="text-sm font-black text-white">Admin prístup</div>
          <input
            className={`${input()} mt-3`}
            placeholder="ADMIN_PIN"
            value={props.adminPin}
            onChange={(e) => props.setAdminPin(e.target.value)}
          />
          <button
            onClick={props.loadAdmin}
            className="mt-3 w-full rounded-xl bg-cyan-300 px-4 py-3 font-black text-black"
          >
            Načítať zákazníkov
          </button>
        </div>

        <nav className="grid gap-1">
          {menu.map(([id, title]) => (
            <button
              key={id}
              onClick={() => props.setAdminSection(id)}
              className={`rounded-xl px-4 py-3 text-left text-sm font-bold ${
                props.adminSection === id
                  ? "bg-cyan-300 text-black"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              {title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="rounded-r-2xl border-y border-r border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-5 grid gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h1 className="text-3xl font-black">Admin panel</h1>
            <p className="text-slate-400">
              Prehľad ako Shoptet: zákazníci, licencia, vzhľad, sidebar, produkty a texty samostatne.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => props.saveAdmin("activate_month")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">+ 1 mesiac</button>
            <button onClick={() => props.saveAdmin("activate_year")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">+ 1 rok</button>
            <button onClick={() => props.saveAdmin("activate_2years")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">+ 2 roky</button>
            <button onClick={() => props.saveAdmin("suspend")} className="rounded-xl bg-red-400 px-4 py-3 font-black text-black">Vypnúť</button>
            <button onClick={() => props.saveAdmin("")} className="rounded-xl bg-cyan-300 px-4 py-3 font-black text-black">Uložiť</button>
          </div>
        </div>

        <Status text={props.status} />

        <div className="mt-5">
          {props.adminSection === "overview" && <AdminOverview {...props} />}
          {props.adminSection === "customers" && <AdminCustomers {...props} />}
          {props.adminSection === "license" && <AdminLicense {...props} />}
          {props.adminSection === "appearance" && <AppearanceEditor {...props} />}
          {props.adminSection === "sidebar" && <SidebarEditor {...props} />}
          {props.adminSection === "products" && <ProductsEditor {...props} />}
          {props.adminSection === "content" && <ContentEditor {...props} />}
        </div>
      </main>
    </div>
  );
}

function AdminOverview({ adminAccounts, selectedEmail, selectAdminEmail, account, publicUrl }) {
  return (
    <div className="grid gap-5 lg:grid-cols-4">
      <div className="rounded-2xl bg-cyan-300 p-5 text-black">
        <div className="text-sm font-black">Zákazníci</div>
        <div className="mt-2 text-4xl font-black">{adminAccounts.length}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="text-sm text-slate-400">Vybraný</div>
        <div className="mt-2 font-black">{account?.companyName || "—"}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="text-sm text-slate-400">Stav</div>
        <div className="mt-2 font-black">{account?.status || "—"}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="text-sm text-slate-400">Verejný web</div>
        {publicUrl ? <a className="mt-2 block font-black text-cyan-300" href={publicUrl} target="_blank">Otvoriť</a> : <div className="mt-2">—</div>}
      </div>

      <div className="lg:col-span-4">
        <Panel title="Rýchly výber zákazníka">
          <select className={input()} value={selectedEmail} onChange={(e) => selectAdminEmail(e.target.value)}>
            <option value="">Vyber zákazníka</option>
            {adminAccounts.map((a) => (
              <option key={a.email} value={a.email}>
                {a.companyName} - {a.email} - {a.status}
              </option>
            ))}
          </select>
        </Panel>
      </div>
    </div>
  );
}

function AdminCustomers({ adminAccounts, selectedEmail, selectAdminEmail }) {
  return (
    <Panel title="Zákazníci" desc="Zoznam účtov z KV databázy.">
      <div className="overflow-auto">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="p-3">Firma</th>
              <th className="p-3">Email</th>
              <th className="p-3">Balík</th>
              <th className="p-3">Stav</th>
              <th className="p-3">Trial</th>
              <th className="p-3">Paid</th>
            </tr>
          </thead>
          <tbody>
            {adminAccounts.map((a) => (
              <tr
                key={a.email}
                onClick={() => selectAdminEmail(a.email)}
                className={`cursor-pointer border-b border-slate-800 ${
                  selectedEmail === a.email ? "bg-cyan-300/10" : "hover:bg-slate-800"
                }`}
              >
                <td className="p-3 font-bold">{a.companyName}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">{a.plan}</td>
                <td className="p-3">{a.status}</td>
                <td className="p-3">{a.trialUntil?.slice(0, 10) || "—"}</td>
                <td className="p-3">{a.paidUntil?.slice(0, 10) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AdminLicense({ account, saveAdmin }) {
  return (
    <Panel title="Licencie" desc="Ručné predlžovanie alebo pozastavenie zákazníka.">
      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="font-black">{account?.companyName || "Nie je vybraný zákazník"}</div>
        <div className="mt-2 text-sm text-slate-400">
          Stav: {account?.status || "—"} | Trial: {account?.trialUntil?.slice(0, 10) || "—"} | Paid: {account?.paidUntil?.slice(0, 10) || "—"}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <button onClick={() => saveAdmin("activate_month")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">Aktivovať 1 mesiac</button>
        <button onClick={() => saveAdmin("activate_year")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">Aktivovať 1 rok</button>
        <button onClick={() => saveAdmin("activate_2years")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">Aktivovať 2 roky</button>
        <button onClick={() => saveAdmin("suspend")} className="rounded-xl bg-red-400 px-4 py-3 font-black text-black">Pozastaviť</button>
      </div>
    </Panel>
  );
}

function EditorPanel(props) {
  return (
    <div className="grid gap-5">
      <AppearanceEditor {...props} />
      <SidebarEditor {...props} />
      <ProductsEditor {...props} />
      <ContentEditor {...props} />
      <button onClick={props.onSave} className="rounded-2xl bg-cyan-300 px-5 py-4 font-black text-black">
        Uložiť web
      </button>
    </div>
  );
}

function AppearanceEditor({ site, patchSite, patchTheme, publicUrl }) {
  return (
    <Panel title="Vzhľad a hlavička" desc="Farby sú teraz podľa Lech-Web originálu, nie podľa vírivkyonline.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="URL názov">
          <input className={input()} value={site.slug} onChange={(e) => patchSite({ slug: slugify(e.target.value) })} />
        </Field>
        <Field label="Názov firmy">
          <input className={input()} value={site.companyName} onChange={(e) => patchSite({ companyName: e.target.value })} />
        </Field>
        <Field label="Farba šablóny">
          <select className={input()} value={site.theme.accent} onChange={(e) => patchTheme({ accent: e.target.value })}>
            {colorPresets.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        </Field>
        <Field label="Logo URL">
          <input className={input()} value={site.theme.logo} onChange={(e) => patchTheme({ logo: e.target.value })} />
        </Field>
        <Field label="Hero obrázok URL">
          <input className={input()} value={site.theme.heroImage} onChange={(e) => patchTheme({ heroImage: e.target.value })} />
        </Field>
        <Field label="Verejný web">
          <input className={input()} readOnly value={publicUrl || ""} />
        </Field>
      </div>
    </Panel>
  );
}

function SidebarEditor({ site, patchSite }) {
  return (
    <Panel title="Bočný panel e-shopu" desc="Kategórie, rady, YouTube a ľavé bloky.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Kategórie vľavo">
          <textarea className={area()} value={site.categoriesText} onChange={(e) => patchSite({ categoriesText: e.target.value })} />
        </Field>
        <Field label="Výhody hore: Nadpis|Text">
          <textarea className={area()} value={site.benefitsText} onChange={(e) => patchSite({ benefitsText: e.target.value })} />
        </Field>
        <Field label="Typy a rady: Názov|URL">
          <textarea className={area()} value={site.adviceText} onChange={(e) => patchSite({ adviceText: e.target.value })} />
        </Field>
        <Field label="YouTube odkazy: Názov|URL">
          <textarea className={area()} value={site.youtubeText} onChange={(e) => patchSite({ youtubeText: e.target.value })} />
        </Field>
      </div>
    </Panel>
  );
}

function ProductsEditor({ site, updateProduct, addProduct, removeProduct }) {
  return (
    <Panel title="Produkty" desc="Produkty v strede stránky.">
      <div className="mb-4 flex justify-end">
        <button onClick={addProduct} className="rounded-xl bg-fuchsia-400 px-4 py-3 font-black text-black">
          Pridať produkt
        </button>
      </div>

      <div className="grid gap-4">
        {site.products.map((p, i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <b>Produkt {i + 1}</b>
              <button onClick={() => removeProduct(i)} className="rounded-lg bg-red-400/20 px-3 py-1 text-red-200">
                Zmazať
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className={input()} placeholder="Názov" value={p.title} onChange={(e) => updateProduct(i, { title: e.target.value })} />
              <input className={input()} placeholder="Cena" value={p.price} onChange={(e) => updateProduct(i, { price: e.target.value })} />
              <input className={input()} placeholder="Stará cena" value={p.oldPrice} onChange={(e) => updateProduct(i, { oldPrice: e.target.value })} />
              <input className={input()} placeholder="Badge TIP/AKCIA" value={p.badge} onChange={(e) => updateProduct(i, { badge: e.target.value })} />
              <input className={`${input()} md:col-span-2`} placeholder="Obrázok URL" value={p.image} onChange={(e) => updateProduct(i, { image: e.target.value })} />
              <textarea className={`${area()} md:col-span-2`} placeholder="Krátky popis" value={p.shortText} onChange={(e) => updateProduct(i, { shortText: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ContentEditor({ site, patchSite }) {
  return (
    <Panel title="Texty a SEO" desc="Hlavný nadpis, krátky popis a text pod produktami.">
      <div className="grid gap-4">
        <Field label="Hlavný nadpis">
          <input className={input()} value={site.headline} onChange={(e) => patchSite({ headline: e.target.value })} />
        </Field>
        <Field label="Krátky popis">
          <textarea className={area()} value={site.description} onChange={(e) => patchSite({ description: e.target.value })} />
        </Field>
        <Field label="Dlhý text pod produktami">
          <textarea className={`${area()} min-h-52`} value={site.homepageText} onChange={(e) => patchSite({ homepageText: e.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Telefón">
            <input className={input()} value={site.phone} onChange={(e) => patchSite({ phone: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <input className={input()} value={site.siteEmail} onChange={(e) => patchSite({ siteEmail: e.target.value })} />
          </Field>
        </div>
      </div>
    </Panel>
  );
}
