import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const presets = [
  ["original", "Original tyrkysová ako virivkyonline"],
  ["turquoise", "Čistá tyrkysová"],
  ["neon", "Neón cyan/fuchsia"],
  ["pink", "Pink luxury"],
  ["violet", "Violet premium"],
  ["orange", "Orange energy"],
  ["lime", "Lime fresh"],
];

const defaultProducts = [
  { title: "Ukážkový produkt", price: "€999", oldPrice: "", image: "", shortText: "Krátky popis produktu.", badge: "TIP" },
];

function slugify(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function lines(v) {
  return String(v || "").split("\n").map(x => x.trim()).filter(Boolean);
}
function joinLines(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}
function inputClass() {
  return "w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-cyan-300";
}
function boxClass() {
  return "rounded-[28px] border border-white/10 bg-white/[0.06] p-5";
}

export default function App() {
  const [mode, setMode] = useState("customer");
  const [authMode, setAuthMode] = useState("register");
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("");
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
    theme: { accent: "original", logo: "", heroImage: "" },
    categoriesText: "Vírivky\nDoplnky\nAkčný tovar\nNovinky\nNajpredávanejšie",
    adviceText: "Ako nakupovať|#\nObchodné podmienky|#\nOchrana osobných údajov|#",
    youtubeText: "YouTube kanál|#",
    benefitsText: "Darček zdarma|Ku každej objednávke.\nRýchle dodanie|Pre produkty skladom.\nNa splátky|Rýchlo a bezpečne.\nDoprava zdarma|Podľa podmienok predajcu.",
    products: defaultProducts,
  });

  const publicUrl = site.slug ? `https://lech-web.pages.dev/site/${slugify(site.slug)}` : "";

  function patchSite(patch) {
    setSite(prev => ({ ...prev, ...patch }));
  }
  function patchTheme(patch) {
    setSite(prev => ({ ...prev, theme: { ...prev.theme, ...patch } }));
  }
  function parsePairs(text) {
    return lines(text).map(row => {
      const [title, ...rest] = row.split("|");
      return { title: title || "", url: rest.join("|") || "#" };
    });
  }
  function parseBenefits(text) {
    return lines(text).map(row => {
      const [title, ...rest] = row.split("|");
      return { title: title || "", text: rest.join("|") || "" };
    });
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
    setSite(prev => ({
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
      adviceText: (w.eshop?.sidebar?.adviceLinks || []).map(x => `${x.title}|${x.url || "#"}`).join("\n") || prev.adviceText,
      youtubeText: (w.eshop?.sidebar?.youtube || []).map(x => `${x.title}|${x.url || "#"}`).join("\n") || prev.youtubeText,
      benefitsText: (w.eshop?.benefits || []).map(x => `${x.title}|${x.text}`).join("\n") || prev.benefitsText,
      products: w.eshop?.products?.length ? w.eshop.products : prev.products,
    }));
  }

  async function loginOrRegister(e) {
    e.preventDefault();
    setStatus("Pracujem...");
    try {
      const url = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = authMode === "register" ? auth : { email: auth.email, password: auth.password };
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
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
      const res = await fetch("/api/site/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(buildPayload()) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie zlyhalo.");
      setAccount(data.account);
      loadWebsite(data.website);
      setStatus("Web uložený: " + (data.publicUrl || ""));
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function loadAdmin() {
    setStatus("Načítavam admin...");
    try {
      const res = await fetch("/api/admin/sites", { headers: { "x-admin-pin": adminPin } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Admin chyba.");
      setAdminAccounts(data.accounts || []);
      setStatus("Admin načítaný.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveAdmin(licenseAction = "") {
    const selected = adminAccounts.find(a => a.email === selectedEmail);
    if (!selected) return setStatus("Vyber zákazníka.");
    setStatus("Admin ukladá...");
    try {
      const res = await fetch("/api/admin/site-save", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ email: selected.email, website: buildPayload(), licenseAction }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Admin uloženie zlyhalo.");
      setStatus("Admin uložené: " + (data.publicUrl || ""));
      await loadAdmin();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function selectAdminEmail(email) {
    setSelectedEmail(email);
    const acc = adminAccounts.find(a => a.email === email);
    if (acc) {
      setAccount(acc);
      setAuth(prev => ({ ...prev, email: acc.email }));
      loadWebsite(acc.website);
      patchSite({
        slug: acc.website?.slug || slugify(acc.companyName),
        companyName: acc.website?.companyName || acc.companyName,
        headline: acc.website?.headline || acc.companyName,
        siteEmail: acc.website?.email || acc.email,
        template: acc.website?.template || acc.template || "E-shop oblečenie",
      });
    }
  }

  function updateProduct(index, patch) {
    setSite(prev => {
      const products = [...prev.products];
      products[index] = { ...products[index], ...patch };
      return { ...prev, products };
    });
  }

  return (
    <main className="min-h-screen bg-[#03040a] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,.25),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(217,70,239,.20),transparent_32%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/[0.06] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Lech-Web Admin + E-shop Builder</h1>
            <p className="text-slate-300">Zákazník si upravuje web, ty vieš všetko nastaviť v admine.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode("customer")} className={`rounded-2xl px-5 py-3 font-black ${mode === "customer" ? "bg-cyan-300 text-black" : "bg-white/10"}`}>Zákazník</button>
            <button onClick={() => setMode("admin")} className={`rounded-2xl px-5 py-3 font-black ${mode === "admin" ? "bg-fuchsia-400 text-black" : "bg-white/10"}`}>Admin</button>
          </div>
        </header>

        {status && <div className="mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 font-bold text-cyan-100">{status}</div>}

        {mode === "customer" ? (
          <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className={boxClass()}>
              <div className="mb-4 flex rounded-2xl bg-black/40 p-1">
                <button onClick={() => setAuthMode("register")} className={`flex-1 rounded-xl py-3 font-black ${authMode === "register" ? "bg-cyan-300 text-black" : ""}`}>Registrácia</button>
                <button onClick={() => setAuthMode("login")} className={`flex-1 rounded-xl py-3 font-black ${authMode === "login" ? "bg-cyan-300 text-black" : ""}`}>Prihlásenie</button>
              </div>
              <form onSubmit={loginOrRegister} className="grid gap-3">
                {authMode === "register" && <>
                  <input className={inputClass()} placeholder="Názov firmy" value={auth.companyName} onChange={e => setAuth({...auth, companyName:e.target.value})}/>
                  <select className={inputClass()} value={auth.plan} onChange={e => setAuth({...auth, plan:e.target.value})}><option>Start Web</option><option>Business Web</option><option>Mini E-shop</option></select>
                  <select className={inputClass()} value={auth.template} onChange={e => setAuth({...auth, template:e.target.value})}><option>E-shop oblečenie</option><option>Stavebná firma</option><option>Autoservis</option><option>Beauty salón</option></select>
                </>}
                <input className={inputClass()} placeholder="E-mail" value={auth.email} onChange={e => setAuth({...auth, email:e.target.value})}/>
                <input className={inputClass()} type="password" placeholder="Heslo" value={auth.password} onChange={e => setAuth({...auth, password:e.target.value})}/>
                <button className="rounded-2xl bg-cyan-300 px-5 py-4 font-black text-black">{authMode === "register" ? "Vytvoriť účet" : "Prihlásiť sa"}</button>
              </form>
              {account && <div className="mt-5 rounded-2xl bg-lime-300/10 p-4 text-lime-100">Licencia: <b>{account.status}</b><br/>Trial do: {account.trialUntil?.slice(0,10)}<br/>Paid do: {account.paidUntil?.slice(0,10) || "—"}</div>}
            </div>
            <Editor site={site} setSite={setSite} patchSite={patchSite} patchTheme={patchTheme} updateProduct={updateProduct} saveSite={saveSite} publicUrl={publicUrl}/>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className={boxClass()}>
              <h2 className="mb-3 text-2xl font-black">Admin panel</h2>
              <input className={inputClass()} placeholder="ADMIN_PIN" value={adminPin} onChange={e => setAdminPin(e.target.value)}/>
              <button onClick={loadAdmin} className="mt-3 w-full rounded-2xl bg-fuchsia-400 px-5 py-4 font-black text-black">Načítať zákazníkov</button>
              <select className={`${inputClass()} mt-3`} value={selectedEmail} onChange={e => selectAdminEmail(e.target.value)}>
                <option value="">Vyber zákazníka</option>
                {adminAccounts.map(a => <option key={a.email} value={a.email}>{a.companyName} - {a.email} - {a.status}</option>)}
              </select>
              {selectedEmail && <div className="mt-4 grid gap-2">
                <button onClick={() => saveAdmin("activate_month")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">Aktivovať 1 mesiac</button>
                <button onClick={() => saveAdmin("activate_year")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">Aktivovať 1 rok</button>
                <button onClick={() => saveAdmin("activate_2years")} className="rounded-xl bg-lime-300 px-4 py-3 font-black text-black">Aktivovať 2 roky</button>
                <button onClick={() => saveAdmin("suspend")} className="rounded-xl bg-red-400 px-4 py-3 font-black text-black">Pozastaviť web</button>
                <button onClick={() => saveAdmin("")} className="rounded-xl bg-cyan-300 px-4 py-3 font-black text-black">Uložiť nastavenia webu</button>
              </div>}
            </div>
            <Editor site={site} setSite={setSite} patchSite={patchSite} patchTheme={patchTheme} updateProduct={updateProduct} saveSite={() => saveAdmin("")} publicUrl={publicUrl}/>
          </section>
        )}
      </div>
    </main>
  );
}

function Editor({ site, setSite, patchSite, patchTheme, updateProduct, saveSite, publicUrl }) {
  function addProduct() {
    setSite(prev => ({ ...prev, products: [...prev.products, { title:"Nový produkt", price:"€0", oldPrice:"", image:"", shortText:"", badge:"" }] }));
  }
  function removeProduct(i) {
    setSite(prev => ({ ...prev, products: prev.products.filter((_, idx) => idx !== i) }));
  }
  return <div className={boxClass()}>
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div><h2 className="text-3xl font-black">Editor e-shop šablóny</h2><p className="text-slate-300">Horné menu, ľavý sidebar, produkty, popis, footer.</p></div>
      <div className="flex gap-2">{publicUrl && <a className="rounded-2xl bg-white/10 px-4 py-3 font-black" href={publicUrl} target="_blank">Otvoriť web</a>}<button onClick={saveSite} className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-black">Uložiť</button></div>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <input className={inputClass()} placeholder="URL slug" value={site.slug} onChange={e => patchSite({slug: slugify(e.target.value)})}/>
      <input className={inputClass()} placeholder="Názov firmy" value={site.companyName} onChange={e => patchSite({companyName:e.target.value})}/>
      <input className={inputClass()} placeholder="Hlavný nadpis" value={site.headline} onChange={e => patchSite({headline:e.target.value})}/>
      <input className={inputClass()} placeholder="E-mail" value={site.siteEmail} onChange={e => patchSite({siteEmail:e.target.value})}/>
      <input className={inputClass()} placeholder="Telefón" value={site.phone} onChange={e => patchSite({phone:e.target.value})}/>
      <select className={inputClass()} value={site.theme.accent} onChange={e => patchTheme({accent:e.target.value})}>{presets.map(p => <option key={p[0]} value={p[0]}>{p[1]}</option>)}</select>
      <input className={inputClass()} placeholder="Logo URL" value={site.theme.logo} onChange={e => patchTheme({logo:e.target.value})}/>
      <input className={inputClass()} placeholder="Hero obrázok URL" value={site.theme.heroImage} onChange={e => patchTheme({heroImage:e.target.value})}/>
    </div>

    <textarea className={`${inputClass()} mt-4 min-h-24`} placeholder="Krátky popis" value={site.description} onChange={e => patchSite({description:e.target.value})}/>
    <textarea className={`${inputClass()} mt-4 min-h-32`} placeholder="Dlhý popis pod produktami / SEO text" value={site.homepageText} onChange={e => patchSite({homepageText:e.target.value})}/>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label><b>Kategórie vľavo</b><textarea className={`${inputClass()} mt-2 min-h-40`} value={site.categoriesText} onChange={e => patchSite({categoriesText:e.target.value})}/></label>
      <label><b>Výhody hore: Nadpis|Text</b><textarea className={`${inputClass()} mt-2 min-h-40`} value={site.benefitsText} onChange={e => patchSite({benefitsText:e.target.value})}/></label>
      <label><b>Typy a rady: Názov|URL</b><textarea className={`${inputClass()} mt-2 min-h-40`} value={site.adviceText} onChange={e => patchSite({adviceText:e.target.value})}/></label>
      <label><b>YouTube: Názov|URL</b><textarea className={`${inputClass()} mt-2 min-h-40`} value={site.youtubeText} onChange={e => patchSite({youtubeText:e.target.value})}/></label>
    </div>

    <div className="mt-8 flex items-center justify-between">
      <h3 className="text-2xl font-black">Produkty</h3>
      <button onClick={addProduct} className="rounded-2xl bg-fuchsia-400 px-4 py-3 font-black text-black">Pridať produkt</button>
    </div>
    <div className="mt-4 grid gap-4">
      {site.products.map((p, i) => <div key={i} className="rounded-3xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex justify-between"><b>Produkt {i+1}</b><button onClick={() => removeProduct(i)} className="rounded-xl bg-red-400/20 px-3 py-1 text-red-200">Zmazať</button></div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={inputClass()} placeholder="Názov" value={p.title} onChange={e => updateProduct(i,{title:e.target.value})}/>
          <input className={inputClass()} placeholder="Cena" value={p.price} onChange={e => updateProduct(i,{price:e.target.value})}/>
          <input className={inputClass()} placeholder="Stará cena" value={p.oldPrice} onChange={e => updateProduct(i,{oldPrice:e.target.value})}/>
          <input className={inputClass()} placeholder="Badge TIP/AKCIA" value={p.badge} onChange={e => updateProduct(i,{badge:e.target.value})}/>
          <input className={`${inputClass()} md:col-span-2`} placeholder="Obrázok URL" value={p.image} onChange={e => updateProduct(i,{image:e.target.value})}/>
          <textarea className={`${inputClass()} md:col-span-2 min-h-20`} placeholder="Krátky popis" value={p.shortText} onChange={e => updateProduct(i,{shortText:e.target.value})}/>
        </div>
      </div>)}
    </div>
  </div>
}
