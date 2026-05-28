import React, { useMemo, useState } from "react";
import "./App.css";

const nav = [
  { id: "dashboard", title: "Základný prehľad", icon: "▦" },
  { id: "orders", title: "Objednávky", icon: "▣" },
  { id: "products", title: "Produkty", icon: "◆" },
  { id: "categories", title: "Kategórie", icon: "◇" },
  { id: "customers", title: "Zákazníci", icon: "◎" },
  { id: "appearance", title: "Vzhľad a obsah", icon: "▤" },
  { id: "marketing", title: "Marketing / SEO", icon: "◌" },
  { id: "settings", title: "Nastavenia", icon: "⚙" },
  { id: "license", title: "Licencie", icon: "●" },
];

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
    id: "p1",
    title: "Ukážkový produkt",
    price: "€999",
    oldPrice: "",
    image: "",
    shortText: "Krátky popis produktu.",
    badge: "TIP",
    category: "Novinky",
    detailUrl: "#",
  },
];

const defaultSite = {
  slug: "",
  companyName: "",
  headline: "",
  description: "",
  homepageText: "",
  phone: "",
  siteEmail: "",
  template: "E-shop",
  theme: {
    accent: "lechweb",
    logo: "",
    heroImage: "",
  },
  topMenuText: "Produkty|#produkty\nAkcie|#produkty\nAko nakupovať|#info\nKontakt|#kontakt",
  categoriesText: "Hlavná kategória\nAkčný tovar\nNovinky\nNajpredávanejšie\nDoplnky\nVýpredaj",
  adviceText: "Ako nakupovať|#\nObchodné podmienky|#\nOchrana osobných údajov|#",
  youtubeText: "YouTube kanál|#",
  benefitsText:
    "Darček zdarma|Ku každej objednávke.\nRýchle dodanie|Pre produkty skladom.\nNa splátky|Rýchlo a bezpečne.\nDoprava zdarma|Podľa podmienok predajcu.",
  footerText: "Ako nakupovať|#\nObchodné podmienky|#\nOchrana osobných údajov|#",
  products: defaultProducts,
};

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

function rows(v) {
  return String(v || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinRows(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function parsePairs(text) {
  return rows(text).map((row) => {
    const [title, ...rest] = row.split("|");
    return { title: title || "", url: rest.join("|") || "#" };
  });
}

function parseBenefits(text) {
  return rows(text).map((row) => {
    const [title, ...rest] = row.split("|");
    return { title: title || "", text: rest.join("|") || "" };
  });
}

function cn(...items) {
  return items.filter(Boolean).join(" ");
}

function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300",
        props.className
      )}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300",
        props.className
      )}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300",
        props.className
      )}
    />
  );
}

function Button({ children, variant = "cyan", className = "", ...props }) {
  const styles = {
    cyan: "bg-cyan-300 text-black hover:bg-white",
    pink: "bg-fuchsia-400 text-black hover:bg-white",
    lime: "bg-lime-300 text-black hover:bg-white",
    red: "bg-red-400 text-black hover:bg-white",
    dark: "bg-slate-800 text-white hover:bg-slate-700",
    ghost: "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800",
  };

  return (
    <button
      {...props}
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-black transition disabled:opacity-50",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function Panel({ title, desc, children, right }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          {desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}
        </div>
        {right}
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
  const [mode, setMode] = useState("admin");
  const [active, setActive] = useState("dashboard");
  const [status, setStatus] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [account, setAccount] = useState(null);

  const [authMode, setAuthMode] = useState("register");
  const [auth, setAuth] = useState({
    companyName: "",
    email: "",
    password: "",
    plan: "Mini E-shop",
    template: "E-shop",
  });

  const [site, setSite] = useState(defaultSite);

  const publicUrl = useMemo(() => {
    return site.slug ? `https://lech-web.pages.dev/site/${slugify(site.slug)}` : "";
  }, [site.slug]);

  function patchSite(patch) {
    setSite((prev) => ({ ...prev, ...patch }));
  }

  function patchTheme(patch) {
    setSite((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));
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
          id: "p" + Date.now(),
          title: "Nový produkt",
          price: "€0",
          oldPrice: "",
          image: "",
          shortText: "",
          badge: "",
          category: "",
          detailUrl: "#",
        },
      ],
    }));
  }

  function removeProduct(index) {
    setSite((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  }

  function buildWebsite() {
    return {
      slug: slugify(site.slug || site.companyName),
      companyName: site.companyName,
      headline: site.headline,
      description: site.description,
      homepageText: site.homepageText,
      phone: site.phone,
      email: site.siteEmail,
      siteEmail: site.siteEmail,
      template: site.template,
      theme: site.theme,
      eshop: {
        enabled: true,
        topMenu: parsePairs(site.topMenuText),
        benefits: parseBenefits(site.benefitsText),
        sidebar: {
          categories: rows(site.categoriesText),
          contactTitle: "Kontakt",
          contactName: site.companyName,
          contactEmail: site.siteEmail,
          contactPhone: site.phone,
          searchEnabled: true,
          adviceLinks: parsePairs(site.adviceText),
          youtube: parsePairs(site.youtubeText),
          customBlocks: [],
        },
        products: site.products,
        footerLinks: parsePairs(site.footerText),
      },
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
      siteEmail: w.email || w.siteEmail || prev.siteEmail,
      template: w.template || prev.template,
      theme: w.theme || prev.theme,
      topMenuText:
        (w.eshop?.topMenu || []).map((x) => `${x.title}|${x.url || "#"}`).join("\n") ||
        prev.topMenuText,
      categoriesText: joinRows(w.eshop?.sidebar?.categories) || prev.categoriesText,
      adviceText:
        (w.eshop?.sidebar?.adviceLinks || []).map((x) => `${x.title}|${x.url || "#"}`).join("\n") ||
        prev.adviceText,
      youtubeText:
        (w.eshop?.sidebar?.youtube || []).map((x) => `${x.title}|${x.url || "#"}`).join("\n") ||
        prev.youtubeText,
      benefitsText:
        (w.eshop?.benefits || []).map((x) => `${x.title}|${x.text || ""}`).join("\n") ||
        prev.benefitsText,
      footerText:
        (w.eshop?.footerLinks || []).map((x) => `${x.title}|${x.url || "#"}`).join("\n") ||
        prev.footerText,
      products: w.eshop?.products?.length ? w.eshop.products : prev.products,
    }));
  }

  async function loadAdmin() {
    setStatus("Načítavam admin...");
    try {
      const res = await fetch("/api/admin/sites", {
        headers: { "x-admin-pin": adminPin },
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Admin načítanie zlyhalo.");

      setAccounts(data.accounts || []);
      setSummary(data.summary || null);
      setStatus("Admin načítaný.");
    } catch (e) {
      setStatus(e.message);
    }
  }

  function selectAccount(email) {
    setSelectedEmail(email);
    const acc = accounts.find((a) => a.email === email);
    if (!acc) return;

    setAccount(acc);
    loadWebsite(acc.website);

    setSite((prev) => ({
      ...prev,
      slug: acc.website?.slug || slugify(acc.companyName || acc.email),
      companyName: acc.website?.companyName || acc.companyName || "",
      headline: acc.website?.headline || acc.companyName || "",
      siteEmail: acc.website?.email || acc.email || "",
      template: acc.website?.template || acc.template || "E-shop",
    }));

    setStatus("Vybraný zákazník: " + (acc.companyName || acc.email));
  }

  async function saveAdmin(licenseAction = "") {
    if (!selectedEmail) {
      setStatus("Najprv vyber zákazníka.");
      return;
    }

    setStatus("Ukladám...");
    try {
      const res = await fetch("/api/admin/site-save", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({
          email: selectedEmail,
          website: buildWebsite(),
          licenseAction,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie zlyhalo.");

      setAccount(data.account);
      loadWebsite(data.account?.website);
      setStatus("Uložené. " + (data.publicUrl || ""));
      await loadAdmin();
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function customerAuth(e) {
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
      if (!data.success) throw new Error(data.error || "Akcia zlyhala.");

      setAccount(data.account);
      setSelectedEmail(data.account.email);
      loadWebsite(data.account.website);

      setSite((prev) => ({
        ...prev,
        slug: data.account.website?.slug || slugify(data.account.companyName || auth.companyName),
        companyName: data.account.website?.companyName || data.account.companyName || auth.companyName,
        headline: data.account.website?.headline || data.account.companyName || auth.companyName,
        siteEmail: data.account.website?.email || data.account.email,
        template: data.account.website?.template || auth.template,
      }));

      setStatus(authMode === "register" ? "Účet vytvorený." : "Prihlásenie OK.");
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function saveCustomer() {
    if (!account?.email && !auth.email) {
      setStatus("Najprv sa prihlás alebo vytvor účet.");
      return;
    }

    setStatus("Ukladám web...");
    try {
      const payload = {
        ...buildWebsite(),
        email: account?.email || auth.email,
        accountEmail: account?.email || auth.email,
      };

      const res = await fetch("/api/site/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie zlyhalo.");

      setAccount(data.account);
      loadWebsite(data.website);
      setStatus("Web uložený. " + (data.publicUrl || ""));
    } catch (e) {
      setStatus(e.message);
    }
  }

  const actions = (
    <div className="flex flex-wrap gap-2">
      {publicUrl && (
        <a
          className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-black text-slate-200 hover:bg-slate-800"
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
        >
          Zobraziť web
        </a>
      )}
      {mode === "admin" ? (
        <>
          <Button variant="lime" onClick={() => saveAdmin("activate_month")}>+ 1 mesiac</Button>
          <Button variant="lime" onClick={() => saveAdmin("activate_year")}>+ 1 rok</Button>
          <Button variant="red" onClick={() => saveAdmin("suspend")}>Vypnúť</Button>
          <Button onClick={() => saveAdmin("")}>Uložiť</Button>
        </>
      ) : (
        <Button onClick={saveCustomer}>Uložiť web</Button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#05060d] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,.22),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(217,70,239,.18),transparent_34%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 font-black text-black shadow-[0_0_30px_rgba(34,211,238,.55)]">
                LW
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">Lech-Web</div>
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">admin platform</div>
              </div>
            </div>

            <div className="hidden max-w-xl flex-1 px-8 lg:block">
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                placeholder="Hľadať zákazníkov, produkty, objednávky..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant={mode === "customer" ? "cyan" : "dark"} onClick={() => setMode("customer")}>
                Zákazník
              </Button>
              <Button variant={mode === "admin" ? "pink" : "dark"} onClick={() => setMode("admin")}>
                Admin
              </Button>
            </div>
          </div>
        </header>

        {mode === "admin" ? (
          <div className="grid min-h-[calc(100vh-64px)] grid-cols-[290px_1fr]">
            <aside className="border-r border-slate-800 bg-slate-950/90 p-4">
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-black">Admin prístup</div>
                <Input
                  placeholder="ADMIN_PIN"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                />
                <Button className="mt-3 w-full" onClick={loadAdmin}>
                  Načítať admin
                </Button>
              </div>

              <nav className="grid gap-1">
                {nav.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition",
                      active === item.id ? "bg-cyan-300 text-black" : "text-slate-300 hover:bg-slate-900"
                    )}
                  >
                    <span className="w-6 text-center">{item.icon}</span>
                    {item.title}
                  </button>
                ))}
              </nav>
            </aside>

            <section className="p-5">
              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h1 className="text-3xl font-black">{nav.find((x) => x.id === active)?.title}</h1>
                  <p className="text-slate-400">Čistý Lech-Web admin základ bez Shoptet Pay a zbytočností.</p>
                </div>
                {actions}
              </div>

              <div className="mb-5">
                <Status text={status} />
              </div>

              <AdminContent
                active={active}
                summary={summary}
                accounts={accounts}
                selectedEmail={selectedEmail}
                selectAccount={selectAccount}
                account={account}
                site={site}
                patchSite={patchSite}
                patchTheme={patchTheme}
                updateProduct={updateProduct}
                addProduct={addProduct}
                removeProduct={removeProduct}
                saveAdmin={saveAdmin}
                publicUrl={publicUrl}
              />
            </section>
          </div>
        ) : (
          <CustomerLayout
            auth={auth}
            setAuth={setAuth}
            authMode={authMode}
            setAuthMode={setAuthMode}
            customerAuth={customerAuth}
            account={account}
            site={site}
            patchSite={patchSite}
            patchTheme={patchTheme}
            updateProduct={updateProduct}
            addProduct={addProduct}
            removeProduct={removeProduct}
            saveCustomer={saveCustomer}
            publicUrl={publicUrl}
            status={status}
          />
        )}
      </div>
    </main>
  );
}

function CustomerLayout(props) {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 p-5 xl:grid-cols-[380px_1fr]">
      <Panel title="Účet zákazníka" desc="Jednoduché prihlásenie pre zákazníka.">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1">
          <button
            onClick={() => props.setAuthMode("register")}
            className={cn("rounded-lg py-2 font-black", props.authMode === "register" ? "bg-cyan-300 text-black" : "text-slate-300")}
          >
            Registrácia
          </button>
          <button
            onClick={() => props.setAuthMode("login")}
            className={cn("rounded-lg py-2 font-black", props.authMode === "login" ? "bg-cyan-300 text-black" : "text-slate-300")}
          >
            Prihlásenie
          </button>
        </div>

        <form onSubmit={props.customerAuth} className="grid gap-3">
          {props.authMode === "register" && (
            <>
              <Field label="Názov firmy">
                <Input value={props.auth.companyName} onChange={(e) => props.setAuth({ ...props.auth, companyName: e.target.value })} />
              </Field>
              <Field label="Balík">
                <Select value={props.auth.plan} onChange={(e) => props.setAuth({ ...props.auth, plan: e.target.value })}>
                  <option>Start Web</option>
                  <option>Business Web</option>
                  <option>Mini E-shop</option>
                </Select>
              </Field>
            </>
          )}

          <Field label="E-mail">
            <Input value={props.auth.email} onChange={(e) => props.setAuth({ ...props.auth, email: e.target.value })} />
          </Field>

          <Field label="Heslo">
            <Input type="password" value={props.auth.password} onChange={(e) => props.setAuth({ ...props.auth, password: e.target.value })} />
          </Field>

          <Button>{props.authMode === "register" ? "Vytvoriť účet" : "Prihlásiť sa"}</Button>
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

      <div className="grid gap-5">
        <Appearance site={props.site} patchSite={props.patchSite} patchTheme={props.patchTheme} publicUrl={props.publicUrl} />
        <Content site={props.site} patchSite={props.patchSite} />
        <Products site={props.site} updateProduct={props.updateProduct} addProduct={props.addProduct} removeProduct={props.removeProduct} />
        <Button className="w-full py-4" onClick={props.saveCustomer}>Uložiť web</Button>
      </div>
    </div>
  );
}

function AdminContent(props) {
  if (props.active === "dashboard") return <Dashboard {...props} />;
  if (props.active === "orders") return <Orders />;
  if (props.active === "products") return <Products {...props} />;
  if (props.active === "categories") return <Categories {...props} />;
  if (props.active === "customers") return <Customers {...props} />;
  if (props.active === "appearance") return <Appearance {...props} />;
  if (props.active === "marketing") return <Marketing {...props} />;
  if (props.active === "settings") return <Settings {...props} />;
  if (props.active === "license") return <License {...props} />;
  return null;
}

function Dashboard({ summary, accounts, selectedEmail, selectAccount, account, publicUrl }) {
  const cards = [
    ["Zákazníci", summary?.total ?? accounts.length],
    ["Aktívne", summary?.active ?? "—"],
    ["Trial", summary?.trial ?? "—"],
    ["Pozastavené", summary?.suspended ?? "—"],
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value], i) => (
          <div key={label} className={cn("rounded-2xl p-5", i === 0 ? "bg-cyan-300 text-black" : "border border-slate-800 bg-slate-900")}>
            <div className="text-sm font-black opacity-80">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
          </div>
        ))}
      </div>

      <Panel title="Rýchly výber zákazníka" desc="Vyber zákazníka a potom upravuj jeho produkty, vzhľad, licenciu alebo SEO.">
        <Select value={selectedEmail} onChange={(e) => selectAccount(e.target.value)}>
          <option value="">Vyber zákazníka</option>
          {accounts.map((a) => (
            <option key={a.email} value={a.email}>
              {a.companyName} - {a.email} - {a.status}
            </option>
          ))}
        </Select>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Vybraný</div>
            <div className="mt-1 font-black">{account?.companyName || "—"}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Stav</div>
            <div className="mt-1 font-black">{account?.status || "—"}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Web</div>
            {publicUrl ? <a className="mt-1 block font-black text-cyan-300" target="_blank" href={publicUrl}>Otvoriť</a> : <div className="mt-1">—</div>}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Customers({ accounts, selectedEmail, selectAccount }) {
  return (
    <Panel title="Zákazníci" desc="Zoznam zákazníkov z KV databázy.">
      <div className="overflow-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="p-3">Firma</th>
              <th className="p-3">Email</th>
              <th className="p-3">Balík</th>
              <th className="p-3">Šablóna</th>
              <th className="p-3">Stav</th>
              <th className="p-3">Trial</th>
              <th className="p-3">Paid</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr
                key={a.email}
                onClick={() => selectAccount(a.email)}
                className={cn(
                  "cursor-pointer border-b border-slate-800",
                  selectedEmail === a.email ? "bg-cyan-300/10" : "hover:bg-slate-800"
                )}
              >
                <td className="p-3 font-bold">{a.companyName}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">{a.plan}</td>
                <td className="p-3">{a.template}</td>
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

function License({ account, saveAdmin }) {
  return (
    <Panel title="Licencie" desc="Ručné riadenie prístupu zákazníka.">
      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="text-xl font-black">{account?.companyName || "Nie je vybraný zákazník"}</div>
        <div className="mt-2 text-sm text-slate-400">
          Stav: {account?.status || "—"} | Trial: {account?.trialUntil?.slice(0, 10) || "—"} | Paid: {account?.paidUntil?.slice(0, 10) || "—"}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <Button variant="lime" onClick={() => saveAdmin("trial14")}>Trial 14 dní</Button>
        <Button variant="lime" onClick={() => saveAdmin("activate_month")}>+ 1 mesiac</Button>
        <Button variant="lime" onClick={() => saveAdmin("activate_year")}>+ 1 rok</Button>
        <Button variant="lime" onClick={() => saveAdmin("activate_2years")}>+ 2 roky</Button>
        <Button variant="red" onClick={() => saveAdmin("suspend")}>Pozastaviť</Button>
      </div>
    </Panel>
  );
}

function Appearance({ site, patchSite, patchTheme, publicUrl }) {
  return (
    <Panel title="Vzhľad a obsah" desc="Logo, farba, hlavička, URL a základný vzhľad webu.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="URL názov">
          <Input value={site.slug} onChange={(e) => patchSite({ slug: slugify(e.target.value) })} />
        </Field>
        <Field label="Názov firmy">
          <Input value={site.companyName} onChange={(e) => patchSite({ companyName: e.target.value })} />
        </Field>
        <Field label="Farba šablóny">
          <Select value={site.theme.accent} onChange={(e) => patchTheme({ accent: e.target.value })}>
            {colorPresets.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </Select>
        </Field>
        <Field label="Logo URL">
          <Input value={site.theme.logo} onChange={(e) => patchTheme({ logo: e.target.value })} />
        </Field>
        <Field label="Hero obrázok URL">
          <Input value={site.theme.heroImage} onChange={(e) => patchTheme({ heroImage: e.target.value })} />
        </Field>
        <Field label="Verejný web">
          <Input readOnly value={publicUrl || ""} />
        </Field>
      </div>
    </Panel>
  );
}

function Products({ site, updateProduct, addProduct, removeProduct }) {
  return (
    <Panel title="Produkty" desc="Základ produktového katalógu." right={<Button variant="pink" onClick={addProduct}>Pridať produkt</Button>}>
      <div className="grid gap-4">
        {site.products.map((p, i) => (
          <div key={p.id || i} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <b>Produkt {i + 1}</b>
              <Button variant="red" onClick={() => removeProduct(i)}>Zmazať</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Názov" value={p.title || ""} onChange={(e) => updateProduct(i, { title: e.target.value })} />
              <Input placeholder="Cena" value={p.price || ""} onChange={(e) => updateProduct(i, { price: e.target.value })} />
              <Input placeholder="Stará cena" value={p.oldPrice || ""} onChange={(e) => updateProduct(i, { oldPrice: e.target.value })} />
              <Input placeholder="Kategória" value={p.category || ""} onChange={(e) => updateProduct(i, { category: e.target.value })} />
              <Input placeholder="Badge TIP / AKCIA" value={p.badge || ""} onChange={(e) => updateProduct(i, { badge: e.target.value })} />
              <Input placeholder="Detail URL" value={p.detailUrl || ""} onChange={(e) => updateProduct(i, { detailUrl: e.target.value })} />
              <Input className="md:col-span-2" placeholder="Obrázok URL" value={p.image || ""} onChange={(e) => updateProduct(i, { image: e.target.value })} />
              <TextArea className="md:col-span-2" placeholder="Krátky popis" value={p.shortText || ""} onChange={(e) => updateProduct(i, { shortText: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Categories({ site, patchSite }) {
  return (
    <Panel title="Kategórie" desc="Kategórie zobrazené v ľavom paneli e-shopu.">
      <Field label="Každá kategória na nový riadok">
        <TextArea value={site.categoriesText} onChange={(e) => patchSite({ categoriesText: e.target.value })} />
      </Field>
    </Panel>
  );
}

function Content({ site, patchSite }) {
  return (
    <Panel title="Texty a SEO" desc="Hlavný nadpis, popis a dlhý text pod produktami.">
      <div className="grid gap-4">
        <Field label="Hlavný nadpis">
          <Input value={site.headline} onChange={(e) => patchSite({ headline: e.target.value })} />
        </Field>
        <Field label="Krátky popis">
          <TextArea value={site.description} onChange={(e) => patchSite({ description: e.target.value })} />
        </Field>
        <Field label="Dlhý text pod produktami">
          <TextArea className="min-h-56" value={site.homepageText} onChange={(e) => patchSite({ homepageText: e.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Telefón">
            <Input value={site.phone} onChange={(e) => patchSite({ phone: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <Input value={site.siteEmail} onChange={(e) => patchSite({ siteEmail: e.target.value })} />
          </Field>
        </div>
      </div>
    </Panel>
  );
}

function Marketing({ site, patchSite }) {
  return (
    <div className="grid gap-5">
      <Panel title="Marketing / SEO" desc="Základné texty, linky a prvky na hlavnej stránke.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Horné menu: Názov|URL">
            <TextArea value={site.topMenuText} onChange={(e) => patchSite({ topMenuText: e.target.value })} />
          </Field>
          <Field label="Výhody hore: Nadpis|Text">
            <TextArea value={site.benefitsText} onChange={(e) => patchSite({ benefitsText: e.target.value })} />
          </Field>
          <Field label="Typy a rady: Názov|URL">
            <TextArea value={site.adviceText} onChange={(e) => patchSite({ adviceText: e.target.value })} />
          </Field>
          <Field label="YouTube odkazy: Názov|URL">
            <TextArea value={site.youtubeText} onChange={(e) => patchSite({ youtubeText: e.target.value })} />
          </Field>
          <Field label="Footer odkazy: Názov|URL">
            <TextArea value={site.footerText} onChange={(e) => patchSite({ footerText: e.target.value })} />
          </Field>
        </div>
      </Panel>
      <Content site={site} patchSite={patchSite} />
    </div>
  );
}

function Settings({ site, patchSite }) {
  return (
    <Panel title="Nastavenia" desc="Základné nastavenia obchodu.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Názov firmy">
          <Input value={site.companyName} onChange={(e) => patchSite({ companyName: e.target.value })} />
        </Field>
        <Field label="Šablóna">
          <Select value={site.template} onChange={(e) => patchSite({ template: e.target.value })}>
            <option>E-shop</option>
            <option>Firemný web</option>
            <option>Landing page</option>
            <option>Služby</option>
          </Select>
        </Field>
        <Field label="Telefón">
          <Input value={site.phone} onChange={(e) => patchSite({ phone: e.target.value })} />
        </Field>
        <Field label="E-mail">
          <Input value={site.siteEmail} onChange={(e) => patchSite({ siteEmail: e.target.value })} />
        </Field>
      </div>
    </Panel>
  );
}

function Orders() {
  return (
    <Panel title="Objednávky" desc="Pripravené miesto pre objednávky. Teraz je to kostra modulu.">
      <div className="grid gap-4 md:grid-cols-4">
        {["Dnes", "Týždeň", "Mesiac", "Rok"].map((x) => (
          <div key={x} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="text-sm text-slate-400">{x}</div>
            <div className="mt-2 text-3xl font-black">€0</div>
            <div className="text-sm text-slate-500">0 objednávok</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
        Modul objednávok doplníme po tom, keď pridáme reálny košík a objednávkový formulár.
      </div>
    </Panel>
  );
}
