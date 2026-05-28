import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, Image, KeyRound, LayoutDashboard, Lock, Palette, Plus, Save, Trash2, UserPlus, Zap } from "lucide-react";

const templates = [
  "Stavebná firma", "Beauty salón / Wellness", "Autoservis", "E-shop oblečenie", "Reštaurácia", "Ubytovanie", "Reality", "Fitness", "Technika", "Landing page"
];

const plans = [
  { name: "Start Web", price: "39 €", items: ["14 dní zdarma", "Vlastný editor", "Viac stránok", "Základné SEO"] },
  { name: "Business Web", price: "69 €", items: ["Všetko zo Start", "Galéria", "Viac sekcií", "Prioritná úprava"], popular: true },
  { name: "Mini E-shop", price: "119 €", items: ["Produkty", "Kategórie", "Dopyty", "Mesačná starostlivosť"] },
];

const defaultPages = [
  {
    id: "home",
    title: "Domov",
    slug: "",
    headline: "Moderný web, ktorý predáva od prvého pohľadu",
    description: "Luxusný neónový web pre firmy, ktoré chcú vyzerať profesionálne a získať viac dopytov.",
    heroImage: "",
    sections: [
      { type: "services", title: "Služby", text: "Upravte si služby podľa svojej firmy.", items: ["Služba 1", "Služba 2", "Služba 3"], images: [] },
      { type: "gallery", title: "Galéria", text: "Pridajte obrázky cez URL. Upload z počítača doplníme cez R2.", items: [], images: [] },
      { type: "contact", title: "Kontakt", text: "Napíšte nám a ozveme sa späť.", items: [], images: [] },
    ],
  },
  {
    id: "onas",
    title: "O nás",
    slug: "o-nas",
    headline: "O našej firme",
    description: "Tu si zákazník doplní príbeh, skúsenosti a výhody firmy.",
    heroImage: "",
    sections: [{ type: "text", title: "Kto sme", text: "Sme firma, ktorá stavia na kvalite, dôvere a jasnej komunikácii.", items: [], images: [] }],
  },
];

function slugify(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function emptySection(type = "text") {
  if (type === "services") return { type, title: "Služby", text: "Popis služieb", items: ["Nová služba"], images: [] };
  if (type === "gallery") return { type, title: "Galéria", text: "Ukážky realizácií", items: [], images: [{ url: "", title: "" }] };
  if (type === "contact") return { type, title: "Kontakt", text: "Napíšte nám a ozveme sa späť.", items: [], images: [] };
  return { type: "text", title: "Nová sekcia", text: "Text sekcie", items: [], images: [] };
}

function Field({ label, children }) {
  return <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{label}</span>{children}</label>;
}
function Input(props) { return <input {...props} className={`rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 ${props.className || ""}`} />; }
function Area(props) { return <textarea {...props} className={`min-h-28 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 ${props.className || ""}`} />; }
function Select(props) { return <select {...props} className={`rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-cyan-300 ${props.className || ""}`} />; }
function Status({ status }) {
  if (!status?.success && !status?.error) return null;
  return <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${status.success ? "border-lime-300/40 bg-lime-300/10 text-lime-200" : "border-red-400/40 bg-red-400/10 text-red-200"}`}>{status.success || status.error}</div>;
}

export default function App() {
  const [authMode, setAuthMode] = useState("register");
  const [account, setAccount] = useState(null);
  const [authStatus, setAuthStatus] = useState({ loading: false, success: "", error: "" });
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: "", error: "" });
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [authForm, setAuthForm] = useState({ companyName: "", email: "", password: "", plan: "Start Web", template: "Stavebná firma" });
  const [site, setSite] = useState({
    slug: "", companyName: "", headline: "", description: "", phone: "", siteEmail: "", template: "Stavebná firma",
    theme: { accent: "cyan", logo: "", heroImage: "", dark: true, luxury: true },
    pages: defaultPages,
  });

  const publicUrl = useMemo(() => site.slug ? `https://lech-web.pages.dev/site/${slugify(site.slug)}` : "", [site.slug]);
  const page = site.pages[activePageIndex] || site.pages[0];

  function updateAuth(name, value) { setAuthForm((p) => ({ ...p, [name]: value })); }
  function updateSite(name, value) { setSite((p) => ({ ...p, [name]: value })); }
  function updateTheme(name, value) { setSite((p) => ({ ...p, theme: { ...p.theme, [name]: value } })); }
  function updatePage(i, name, value) {
    setSite((p) => { const pages = [...p.pages]; pages[i] = { ...pages[i], [name]: value }; if (name === "title" && i !== 0) pages[i].slug = slugify(value); return { ...p, pages }; });
  }
  function updateSection(pi, si, patch) {
    setSite((p) => { const pages = [...p.pages]; const sections = [...pages[pi].sections]; sections[si] = { ...sections[si], ...patch }; pages[pi] = { ...pages[pi], sections }; return { ...p, pages }; });
  }
  function addPage() {
    setSite((p) => ({ ...p, pages: [...p.pages, { id: `page-${Date.now()}`, title: "Nová stránka", slug: "nova-stranka", headline: "Nová stránka", description: "Popis novej stránky", heroImage: "", sections: [emptySection("text")] }] }));
    setActivePageIndex(site.pages.length);
  }
  function removePage(i) { if (i === 0) return; setSite((p) => ({ ...p, pages: p.pages.filter((_, x) => x !== i) })); setActivePageIndex(0); }
  function addSection(pi, type) { setSite((p) => { const pages = [...p.pages]; pages[pi] = { ...pages[pi], sections: [...pages[pi].sections, emptySection(type)] }; return { ...p, pages }; }); }
  function removeSection(pi, si) { setSite((p) => { const pages = [...p.pages]; pages[pi] = { ...pages[pi], sections: pages[pi].sections.filter((_, x) => x !== si) }; return { ...p, pages }; }); }

  async function handleAuth(e) {
    e.preventDefault(); setAuthStatus({ loading: true, success: "", error: "" });
    try {
      const url = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = authMode === "register" ? authForm : { email: authForm.email, password: authForm.password };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Akcia zlyhala.");
      const acc = data.account; setAccount(acc);
      setSite((p) => ({
        ...p,
        slug: acc.website?.slug || slugify(acc.companyName || authForm.companyName),
        companyName: acc.website?.companyName || acc.companyName || authForm.companyName,
        headline: acc.website?.headline || acc.companyName || authForm.companyName,
        description: acc.website?.description || "Moderný web vytvorený cez Lech-Web. Text si upravíte vo vlastnom editore.",
        siteEmail: acc.website?.email || acc.email,
        template: acc.website?.template || acc.template || authForm.template,
        theme: acc.website?.theme || p.theme,
        pages: acc.website?.pages?.length ? acc.website.pages : p.pages,
      }));
      setAuthStatus({ loading: false, success: authMode === "register" ? "Účet vytvorený. Trial je aktívny 14 dní." : "Prihlásenie prebehlo úspešne.", error: "" });
    } catch (err) { setAuthStatus({ loading: false, success: "", error: err.message || "Chyba pri účte." }); }
  }

  async function saveWebsite() {
    setSaveStatus({ loading: true, success: "", error: "" });
    try {
      const payload = { ...site, slug: slugify(site.slug || site.companyName), email: account?.email || authForm.email, accountEmail: account?.email || authForm.email };
      const res = await fetch("/api/site/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Web sa nepodarilo uložiť.");
      setSite((p) => ({ ...p, slug: data.website.slug })); setAccount(data.account || account);
      setSaveStatus({ loading: false, success: `Web uložený: ${data.publicUrl || `/site/${data.website.slug}`}`, error: "" });
    } catch (err) { setSaveStatus({ loading: false, success: "", error: err.message || "Chyba pri ukladaní webu." }); }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#03040a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute top-16 right-0 h-[560px] w-[560px] rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.04)_1px,transparent_1px)] [background-size:46px_46px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <a href="#top" className="flex items-center gap-3 text-white no-underline">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-black shadow-[0_0_45px_rgba(34,211,238,0.95)]"><Zap className="h-7 w-7" /></div>
          <div><div className="text-2xl font-black tracking-tight">Lech<span className="text-cyan-300">-</span><span className="text-fuchsia-300">Web</span></div><div className="text-xs uppercase tracking-[0.34em] text-cyan-300">SaaS web builder</div></div>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-300 md:flex"><a href="#editor" className="hover:text-cyan-300">Editor</a><a href="#sablony" className="hover:text-cyan-300">Šablóny</a><a href="#cennik" className="hover:text-cyan-300">Cenník</a></nav>
        <a href="#editor" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(34,211,238,0.65)]">Vytvoriť web</a>
      </header>

      <section id="top" className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 lg:grid-cols-2 lg:pt-20">
        <div><div className="mb-6 inline-flex rounded-full border border-fuchsia-400/50 bg-fuchsia-400/10 px-4 py-2 text-sm font-black text-fuchsia-200">Web builder s licenciou</div><h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">Zákazník si vytvorí <span className="text-cyan-300 drop-shadow-[0_0_30px_rgba(34,211,238,1)]">vlastný web</span>, ty riadiš licenciu.</h1><p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">Účet zákazníka, 14 dní trial, editor stránok, sekcie, obrázky cez URL, verejný web a časové obmedzenie licencie.</p><div className="mt-10 flex gap-4"><a href="#editor" className="inline-flex items-center gap-3 rounded-full bg-cyan-300 px-8 py-4 font-black text-black shadow-[0_0_55px_rgba(34,211,238,0.95)]">Otvoriť editor <ArrowRight className="h-5 w-5" /></a></div></div>
        <div className="relative rounded-[2.8rem] border border-white/15 bg-slate-950/90 p-5 shadow-2xl"><div className="rounded-[2.2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 via-fuchsia-500/25 to-violet-600/20 p-8"><div className="mb-4 inline-block rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black">LIVE EDITOR</div><h2 className="text-4xl font-black leading-tight">Stránky, sekcie, obrázky, logo a farby.</h2><p className="mt-4 text-slate-300">Zákazník si upraví obsah. Ty vlastníš systém a vieš web vypnúť cez licenciu.</p></div></div>
      </section>

      <section id="editor" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10"><div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">Zákaznícky dashboard</div><h2 className="text-4xl font-black sm:text-5xl">Prihlásenie, licencia a editor webu.</h2></div>
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <div className="mb-5 flex rounded-2xl bg-black/40 p-1"><button type="button" onClick={() => setAuthMode("register")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${authMode === "register" ? "bg-cyan-300 text-black" : "text-slate-300"}`}>Registrácia</button><button type="button" onClick={() => setAuthMode("login")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${authMode === "login" ? "bg-cyan-300 text-black" : "text-slate-300"}`}>Prihlásenie</button></div>
            <form onSubmit={handleAuth} className="grid gap-4">
              {authMode === "register" && <><Field label="Názov firmy"><Input value={authForm.companyName} onChange={(e) => updateAuth("companyName", e.target.value)} required /></Field><Field label="Balík"><Select value={authForm.plan} onChange={(e) => updateAuth("plan", e.target.value)}>{plans.map((p) => <option key={p.name}>{p.name}</option>)}</Select></Field><Field label="Šablóna"><Select value={authForm.template} onChange={(e) => updateAuth("template", e.target.value)}>{templates.map((t) => <option key={t}>{t}</option>)}</Select></Field></>}
              <Field label="E-mail"><Input type="email" value={authForm.email} onChange={(e) => updateAuth("email", e.target.value)} required /></Field>
              <Field label="Heslo"><Input type="password" value={authForm.password} onChange={(e) => updateAuth("password", e.target.value)} required /></Field>
              <button type="submit" disabled={authStatus.loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 font-black text-black disabled:opacity-60">{authMode === "register" ? <UserPlus className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}{authStatus.loading ? "Pracujem..." : authMode === "register" ? "Vytvoriť účet" : "Prihlásiť sa"}</button><Status status={authStatus} />
            </form>
            {account && <div className="mt-6 rounded-3xl border border-lime-300/25 bg-lime-300/10 p-5"><strong className="text-lime-300">Licencia aktívna</strong><div className="mt-2 text-sm leading-7 text-slate-300">Firma: {account.companyName}<br />Stav: {account.status}<br />Trial do: {account.trialUntil?.slice(0, 10)}<br />VS: {account.variableSymbol || "—"}</div></div>}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6">
            {!account ? <div className="grid min-h-[500px] place-items-center text-center"><div><Lock className="mx-auto mb-5 h-14 w-14 text-cyan-300" /><h3 className="text-3xl font-black">Najprv sa zaregistruj alebo prihlás.</h3><p className="mx-auto mt-4 max-w-md text-slate-300">Editor sa otvorí až po vytvorení účtu.</p></div></div> : <div className="grid gap-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><div className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-fuchsia-300">Editor webu</div><h3 className="text-3xl font-black">Môj web</h3></div><div className="flex flex-wrap gap-3">{publicUrl && <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black"><Eye className="h-4 w-4" />Otvoriť web</a>}<button type="button" onClick={saveWebsite} disabled={saveStatus.loading} className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-400 px-5 py-3 text-sm font-black text-black disabled:opacity-60"><Save className="h-4 w-4" />{saveStatus.loading ? "Ukladám..." : "Uložiť web"}</button></div></div><Status status={saveStatus} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="URL názov webu"><Input value={site.slug} onChange={(e) => updateSite("slug", slugify(e.target.value))} /></Field><Field label="Názov firmy"><Input value={site.companyName} onChange={(e) => updateSite("companyName", e.target.value)} /></Field><Field label="Telefón"><Input value={site.phone} onChange={(e) => updateSite("phone", e.target.value)} /></Field><Field label="Kontaktný e-mail"><Input value={site.siteEmail} onChange={(e) => updateSite("siteEmail", e.target.value)} /></Field><Field label="Typ šablóny"><Select value={site.template} onChange={(e) => updateSite("template", e.target.value)}>{templates.map((t) => <option key={t}>{t}</option>)}</Select></Field><Field label="Farba témy"><Select value={site.theme.accent} onChange={(e) => updateTheme("accent", e.target.value)}><option value="cyan">Cyan neon</option><option value="pink">Pink luxury</option><option value="violet">Violet premium</option><option value="orange">Orange energy</option><option value="lime">Lime fresh</option></Select></Field><Field label="Logo URL"><Input value={site.theme.logo} onChange={(e) => updateTheme("logo", e.target.value)} placeholder="https://..." /></Field><Field label="Hlavný obrázok URL"><Input value={site.theme.heroImage} onChange={(e) => updateTheme("heroImage", e.target.value)} placeholder="https://..." /></Field></div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Stránky</div><div className="mt-1 text-sm text-slate-400">Domov, O nás, Služby, Kontakt alebo vlastné podstránky.</div></div><button type="button" onClick={addPage} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-black"><Plus className="h-4 w-4" />Pridať stránku</button></div><div className="mb-5 flex flex-wrap gap-2">{site.pages.map((p, i) => <button key={p.id || i} type="button" onClick={() => setActivePageIndex(i)} className={`rounded-full px-4 py-2 text-sm font-black ${activePageIndex === i ? "bg-fuchsia-400 text-black" : "bg-white/10 text-slate-200"}`}>{p.title}</button>)}</div><div className="grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Názov stránky"><Input value={page.title} onChange={(e) => updatePage(activePageIndex, "title", e.target.value)} /></Field><Field label="Slug podstránky"><Input value={page.slug} onChange={(e) => updatePage(activePageIndex, "slug", slugify(e.target.value))} disabled={activePageIndex === 0} /></Field></div><Field label="Nadpis stránky"><Input value={page.headline} onChange={(e) => updatePage(activePageIndex, "headline", e.target.value)} /></Field><Field label="Popis stránky"><Area value={page.description} onChange={(e) => updatePage(activePageIndex, "description", e.target.value)} /></Field><Field label="Hero obrázok URL"><Input value={page.heroImage} onChange={(e) => updatePage(activePageIndex, "heroImage", e.target.value)} placeholder="https://..." /></Field>{activePageIndex !== 0 && <button type="button" onClick={() => removePage(activePageIndex)} className="inline-flex w-fit items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-black text-red-200"><Trash2 className="h-4 w-4" />Zmazať stránku</button>}</div></div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Sekcie stránky</div><div className="mt-1 text-sm text-slate-400">Texty, služby, galéria a kontakt.</div></div><div className="flex flex-wrap gap-2">{["text", "services", "gallery", "contact"].map((type) => <button key={type} type="button" onClick={() => addSection(activePageIndex, type)} className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-black text-slate-200">+ {type}</button>)}</div></div><div className="grid gap-4">{page.sections.map((section, si) => <div key={`${section.type}-${si}`} className="rounded-3xl border border-white/10 bg-black/35 p-5"><div className="mb-4 flex items-center justify-between gap-3"><div className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-300"><LayoutDashboard className="h-4 w-4" />{section.type}</div><button type="button" onClick={() => removeSection(activePageIndex, si)} className="rounded-full bg-red-400/10 p-2 text-red-200"><Trash2 className="h-4 w-4" /></button></div><div className="grid gap-4"><Field label="Názov sekcie"><Input value={section.title} onChange={(e) => updateSection(activePageIndex, si, { title: e.target.value })} /></Field><Field label="Text sekcie"><Area value={section.text || ""} onChange={(e) => updateSection(activePageIndex, si, { text: e.target.value })} /></Field>{section.type === "services" && <Field label="Služby, každá na nový riadok"><Area value={(section.items || []).join("\n")} onChange={(e) => updateSection(activePageIndex, si, { items: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} /></Field>}{section.type === "gallery" && <div className="grid gap-3"><div className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">Galéria obrázkov cez URL</div>{(section.images || []).map((img, ii) => <div key={ii} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:grid-cols-[1fr_1fr_auto]"><Input placeholder="URL obrázka" value={img.url || ""} onChange={(e) => { const images = [...(section.images || [])]; images[ii] = { ...images[ii], url: e.target.value }; updateSection(activePageIndex, si, { images }); }} /><Input placeholder="Popis obrázka" value={img.title || ""} onChange={(e) => { const images = [...(section.images || [])]; images[ii] = { ...images[ii], title: e.target.value }; updateSection(activePageIndex, si, { images }); }} /><button type="button" onClick={() => { const images = [...(section.images || [])].filter((_, x) => x !== ii); updateSection(activePageIndex, si, { images }); }} className="rounded-2xl bg-red-400/10 px-3 py-2 text-red-200"><Trash2 className="h-4 w-4" /></button></div>)}<button type="button" onClick={() => updateSection(activePageIndex, si, { images: [...(section.images || []), { url: "", title: "" }] })} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-fuchsia-400 px-4 py-3 text-sm font-black text-black"><Image className="h-4 w-4" />Pridať obrázok</button></div>}</div></div>)}</div></div>
            </div>}
          </div>
        </div>
      </section>

      <section id="sablony" className="relative z-10 mx-auto max-w-7xl px-5 py-20"><div className="mb-12"><div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">Šablóny</div><h2 className="text-4xl font-black sm:text-5xl">Reálne šablóny pre rôzne odbory.</h2></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{templates.slice(0,6).map((t,i) => <div key={t} className="rounded-[2rem] border border-white/10 bg-black/45 p-6"><div className="mb-5 flex items-center justify-between"><div className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-black">Šablóna</div><div className="text-sm font-black text-fuchsia-300">{String(i+1).padStart(2,"0")}</div></div><h3 className="text-2xl font-black">{t}</h3><p className="mt-4 text-sm leading-7 text-slate-300">Zákazník si vyberie šablónu, upraví obsah a systém vygeneruje verejný web.</p><a href="#editor" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-black">Vytvoriť</a></div>)}</div></section>
      <section id="cennik" className="relative z-10 mx-auto max-w-7xl px-5 py-20"><div className="mb-12 text-center"><div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-lime-300">Cenník</div><h2 className="text-4xl font-black sm:text-5xl">Web bez vstupnej platby.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-300">14 dní skúšobná doba zdarma. Potom mesačné predplatné vopred.</p></div><div className="grid gap-5 lg:grid-cols-3">{plans.map((plan) => <div key={plan.name} className={`relative rounded-[2rem] border p-6 ${plan.popular ? "border-fuchsia-300 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.05]"}`}><h3 className="text-2xl font-black">{plan.name}</h3><div className="mt-4 flex items-end gap-2"><span className="text-5xl font-black text-cyan-300">{plan.price}</span><span className="pb-2 text-slate-400">/ mesiac</span></div><ul className="mt-6 space-y-3 text-sm text-slate-300">{plan.items.map((item) => <li key={item} className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-lime-300" />{item}</li>)}</ul><a href="#editor" className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-300 px-5 py-4 font-black text-black">Vybrať</a></div>)}</div></section>
      <footer className="relative z-10 border-t border-white/10 px-5 py-10"><div className="mx-auto max-w-7xl text-sm text-slate-400">Lech-Web • SaaS web builder s licenciou a zákazníckym editorom.</div></footer>
    </main>
  );
}
