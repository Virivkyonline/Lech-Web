import { useMemo, useRef, useState } from "react";
import "./App.css";

const ownerNav = [
  { id: "owner-dashboard", title: "Prehľad", icon: "▦" },
  { id: "owner-customers", title: "Zákazníci", icon: "◎" },
  { id: "owner-licenses", title: "Licencie", icon: "●" },
  { id: "owner-plans", title: "Balíky", icon: "◈" },
];

const customerNav = [
  { id: "cust-dashboard", title: "Prehľad webu", icon: "▦" },
  { id: "cust-orders", title: "Objednávky", icon: "▣" },
  { id: "cust-products", title: "Produkty", icon: "◆" },
  { id: "cust-product-detail", title: "Detail produktu", icon: "◇" },
  { id: "cust-categories", title: "Kategórie", icon: "▤" },
  { id: "cust-title-page", title: "Titulná strana", icon: "◉" },
  { id: "cust-banners", title: "Bannery", icon: "▧" },
  { id: "cust-menu", title: "Menu webu", icon: "☰" },
  { id: "cust-links", title: "Odkazy", icon: "↗" },
  { id: "cust-cookies", title: "Cookies", icon: "◌" },
  { id: "cust-documents", title: "Doklady", icon: "▥" },
  { id: "cust-fields", title: "Povinné polia", icon: "▨" },
  { id: "cust-settings", title: "Nastavenia webu", icon: "⚙" },
];

const colorPresets = [
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
];

const defaultProducts = [
  {
    id: "spa-sun",
    title: "Vírivka SUN 200x160x90",
    code: "SUN-200",
    price: "€5 800",
    oldPrice: "",
    image: "",
    gallery: [],
    shortText: "3-miestna kompaktná vírivka pre menšie priestory, terasu alebo záhradu.",
    longText: "Kompaktná vírivka SUN spája moderný vzhľad, komfort a efektívnu hydromasáž. Vhodná pre zákazníkov, ktorí chcú kvalitný relax bez nárokov na veľký priestor.",
    badge: "TIP",
    category: "Kompaktné vírivky",
    availability: "Skladom / rýchle dodanie",
    visibility: "visible",
    stock: "999",
    vat: "23",
    detailUrl: "#",
    seoTitle: "Vírivka SUN 200x160x90 cm – 3-miestna kompaktná vírivka",
    seoDescription: "Kompaktná 3-miestna vírivka SUN 200x160x90 cm – ideálna voľba pre menšie priestory, luxusný relax a efektívnu hydromasáž.",
    relatedProducts: "Schodíky Standard, Tepelné čerpadlo ZEALUX",
    youtube: "",
  },
  {
    id: "spa-maximus",
    title: "Vírivka New Maximus",
    code: "MAXIMUS",
    price: "€7 999",
    oldPrice: "",
    image: "",
    gallery: [],
    shortText: "Luxusnejší model s moderným dizajnom, väčším priestorom a prémiovým dojmom.",
    longText: "New Maximus je voľba pre zákazníkov, ktorí chcú výrazný dizajn, pohodlie pre viac osôb a reprezentatívnu vírivku do exteriéru.",
    badge: "AKCIA",
    category: "Prémiové vírivky",
    availability: "Na dopyt",
    visibility: "visible",
    stock: "507",
    vat: "23",
    detailUrl: "#",
    seoTitle: "Vírivka New Maximus – luxusný relax a moderný dizajn",
    seoDescription: "Prémiová vírivka New Maximus pre náročnejších zákazníkov, ktorí hľadajú komfort, dizajn a spoľahlivý servis.",
    relatedProducts: "Tepelné čerpadlo ZEALUX, Schodíky Standard",
    youtube: "",
  },
  {
    id: "spa-split",
    title: "Vírivka SPLIT Extratherm",
    code: "SPLIT-EXTRA",
    price: "€6 499",
    oldPrice: "",
    image: "",
    gallery: [],
    shortText: "Energeticky efektívny model pre zákazníkov, ktorí riešia komfort aj prevádzkové náklady.",
    longText: "SPLIT Extratherm je praktická voľba pre záhradu alebo terasu s dôrazom na moderné prevedenie a rozumnú prevádzku.",
    badge: "NOVINKA",
    category: "Energetické modely",
    availability: "Na objednávku",
    visibility: "visible",
    stock: "999",
    vat: "23",
    detailUrl: "#",
    seoTitle: "Vírivka SPLIT Extratherm – energeticky efektívny model",
    seoDescription: "Vírivka SPLIT Extratherm pre moderný relax s dôrazom na efektívnu prevádzku a elegantný dizajn.",
    relatedProducts: "Tepelné čerpadlo ZEALUX",
    youtube: "",
  },
  {
    id: "zealux",
    title: "Tepelné čerpadlo ZEALUX",
    code: "ZEALUX",
    price: "od €2 465",
    oldPrice: "",
    image: "",
    gallery: [],
    shortText: "Doplnok k vírivke pre efektívnejší ohrev vody so zárukou 7 rokov.",
    longText: "Tepelné čerpadlo ZEALUX pomáha optimalizovať prevádzku vírivky a zvyšuje komfort používania počas sezóny.",
    badge: "DOPLNOK",
    category: "Príslušenstvo",
    availability: "Skladom / na dopyt",
    visibility: "visible",
    stock: "802",
    vat: "23",
    detailUrl: "#",
    seoTitle: "Tepelné čerpadlo ZEALUX k vírivke",
    seoDescription: "Tepelné čerpadlo ZEALUX ako praktické príslušenstvo k vírivke.",
    relatedProducts: "Vírivka SUN, Vírivka New Maximus",
    youtube: "",
  },
  {
    id: "steps-standard",
    title: "Schodíky Standard",
    code: "STEP-STANDARD",
    price: "€180",
    oldPrice: "",
    image: "",
    gallery: [],
    shortText: "Praktický a elegantný doplnok pre pohodlný vstup do vírivky.",
    longText: "Schodíky Standard dopĺňajú vírivku a zlepšujú komfort každodenného používania.",
    badge: "",
    category: "Príslušenstvo",
    availability: "Skladom",
    visibility: "visible",
    stock: "999",
    vat: "23",
    detailUrl: "#",
    seoTitle: "Schodíky Standard k vírivke",
    seoDescription: "Praktický doplnok k vírivke pre pohodlný a bezpečnejší vstup.",
    relatedProducts: "Vírivka SUN, Vírivka SPLIT Extratherm",
    youtube: "",
  },
];

const defaultModules = {
  titlePage: {
    enabled: true,
    heroTitle: "Luxusné vírivky Platinum Lech Spa",
    heroSubtitle: "Objavte kvalitné vírivky s dopravou, montážou a dlhodobým servisom. Vyberáme modely, ktoré zákazníkom prinášajú komfort, spoľahlivosť a moderný dizajn.",
    button1Text: "Zobraziť ponuku",
    button1Url: "#produkty",
    button2Text: "Kontaktujte nás",
    button2Url: "#kontakt",
    heroImage: "",
    seoTitle: "Prečo si vybrať vírivku od Platinum Lech Spa",
    seoText: "Platinum Lech Spa prináša zákazníkom kvalitné vírivky, ktoré spájajú komfort, moderný vzhľad a dlhodobú spoľahlivosť. Pri kúpe vírivky nejde len o cenu. Dôležité je aj to, kto vám poradí s výberom, kto zabezpečí servis a kto pomôže po predaji. Ponúkame modely pre menšie aj väčšie priestory, rôzne farebné varianty akrylu a obloženia a priebežne dopĺňame aj doplnkovú výbavu.",
    actionBlock: {
      enabled: true,
      title: "Akciové modely skladom",
      text: "Vybrané modely víriviek máme pripravené skladom alebo s rýchlym dodaním. V prípade záujmu odporúčame rezerváciu zálohou.",
      buttonText: "Pozrieť akcie",
      buttonUrl: "#produkty",
    },
  },
  banners: {
    enabled: true,
    main: [
      { title: "Luxusné vírivky Platinum Lech Spa", subtitle: "Kvalitné vírivky s dopravou, montážou a servisom.", buttonText: "Zobraziť ponuku", url: "#produkty", visible: true },
      { title: "Modely skladom / rýchle dodanie", subtitle: "Vybrané modely dostupné bez dlhého čakania.", buttonText: "Kontaktovať", url: "#kontakt", visible: true },
    ],
    carousel: [],
    advantages: [
      { title: "Doprava a montáž", text: "V cene podľa logiky produktu.", icon: "↻", visible: true },
      { title: "Záručný aj pozáručný servis", text: "Podpora po predaji je pri vírivke kľúčová.", icon: "✓", visible: true },
      { title: "Overené modely", text: "Modely pre terasu, záhradu aj náročnejších zákazníkov.", icon: "✦", visible: true },
      { title: "Individuálna konfigurácia", text: "Pomôžeme s výberom farieb, výbavy aj doplnkov.", icon: "◇", visible: true },
    ],
  },
  menuSettings: {
    enabled: true,
    items: [
      { title: "Produkty", url: "#produkty", visible: true, mobile: true },
      { title: "Akcie", url: "#produkty", visible: true, mobile: true },
      { title: "Ako vybrať vírivku", url: "#info", visible: true, mobile: true },
      { title: "Kontakt", url: "#kontakt", visible: true, mobile: true },
    ],
  },
  links: {
    enabled: true,
    items: [
      { title: "Ako vybrať vírivku", url: "#info", visible: true, footer: true },
      { title: "Servis a podpora", url: "#kontakt", visible: true, footer: true },
      { title: "Doprava a montáž", url: "#kontakt", visible: true, footer: true },
      { title: "Ochrana osobných údajov", url: "#", visible: true, footer: true },
    ],
  },
  cookies: {
    enabled: true,
    bannerText: "Používame cookies, aby sme vám zabezpečili čo najlepší zážitok na webe.",
    acceptText: "Súhlasím",
    privacyUrl: "#",
  },
  categoriesAdvanced: {
    enabled: true,
    items: [
      { title: "Kompaktné vírivky", url: "#produkty", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
      { title: "Prémiové vírivky", url: "#produkty", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
      { title: "Energetické modely", url: "#produkty", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
      { title: "Príslušenstvo", url: "#produkty", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
      { title: "Akciový tovar", url: "#produkty", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
    ],
  },
  customerFields: {
    enabled: true,
    name: "required",
    email: "required",
    phone: "required",
    address: "optional",
    company: "optional",
    ico: "optional",
    dic: "optional",
    note: "optional",
  },
  documents: {
    enabled: true,
    ordersPrefix: "OBJ",
    invoicePrefix: "FA",
    proformaPrefix: "ZF",
    deliveryNotePrefix: "DL",
    creditNotePrefix: "DBP",
    showQrCode: true,
    showWarranty: true,
  },
};

const defaultSite = {
  slug: "platinum-lech-spa",
  companyName: "Platinum Lech Spa",
  headline: "Luxusné vírivky Platinum Lech Spa",
  description: "Luxusné vírivky, poradenstvo, doprava, montáž a dlhodobý servis pre zákazníkov na Slovensku.",
  homepageText: "Predaj, poradenstvo a servis víriviek s dôrazom na dlhodobú spokojnosť. Pri vírivke je dôležité vedieť, od koho ju kupujete – preto nový web stavia na dôvere, jasnej ponuke produktov a jednoduchom kontakte.",
  phone: "+421 949 444 066",
  siteEmail: "info@virivkyonline.sk",
  template: "Moderný e-shop s vírivkami",
  theme: { accent: "lechweb", logo: "", heroImage: "" },
  products: defaultProducts,
  modules: defaultModules,
};

function slugify(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function cn(...items) { return items.filter(Boolean).join(" "); }
function Input(props) { return <input {...props} className={cn("w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300", props.className)} />; }
function TextArea(props) { return <textarea {...props} className={cn("min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300", props.className)} />; }
function Select(props) { return <select {...props} className={cn("w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300", props.className)} />; }

function Button({ children, variant = "cyan", className = "", ...props }) {
  const styles = {
    cyan: "bg-cyan-300 text-black hover:bg-white",
    pink: "bg-fuchsia-400 text-black hover:bg-white",
    lime: "bg-lime-300 text-black hover:bg-white",
    red: "bg-red-400 text-black hover:bg-white",
    dark: "bg-slate-800 text-white hover:bg-slate-700",
    ghost: "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800",
  };
  return <button {...props} className={cn("rounded-xl px-4 py-3 text-sm font-black transition disabled:opacity-50", styles[variant], className)}>{children}</button>;
}
function Panel({ title, desc, children, right }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl"><div className="mb-5 flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-black text-white">{title}</h2>{desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}</div>{right}</div>{children}</section>;
}
function Field({ label, children }) { return <label className="grid gap-2"><span className="text-sm font-bold text-slate-300">{label}</span>{children}</label>; }
function Status({ text }) { return text ? <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100">{text}</div> : null; }

function UploadButton({ folder = "images", label = "Nahrať", onUploaded, setStatus }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus?.("Nahrávam obrázok...");
    try {
      const form = new FormData();
      form.append("folder", folder);
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload zlyhal.");
      onUploaded(data.publicUrl || data.publicPath);
      setStatus?.("Obrázok nahratý.");
    } catch (err) {
      setStatus?.(err.message);
    } finally {
      setBusy(false);
    }
  }
  return <><input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} /><Button type="button" variant="pink" disabled={busy} onClick={() => ref.current?.click()}>{busy ? "Nahrávam..." : label}</Button></>;
}

function jsonPretty(obj) { try { return JSON.stringify(obj || {}, null, 2); } catch { return "{}"; } }
function parseJson(text, fallback) { try { return JSON.parse(text); } catch { return fallback; } }

function readSavedCustomerLogin() {
  const empty = { login: { email: "", password: "" }, remember: false };
  if (typeof localStorage === "undefined") return empty;
  try {
    const saved = localStorage.getItem("lechweb_customer_login");
    if (!saved) return empty;
    const parsed = JSON.parse(saved);
    return {
      login: { email: parsed.email || "", password: parsed.password || "" },
      remember: true,
    };
  } catch {
    localStorage.removeItem("lechweb_customer_login");
    return empty;
  }
}

export default function App() {
  const [area, setArea] = useState("owner");
  const [active, setActive] = useState("owner-dashboard");
  const [status, setStatus] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [site, setSite] = useState(defaultSite);
  const savedCustomerLogin = readSavedCustomerLogin();
  const [customerLogin, setCustomerLogin] = useState(savedCustomerLogin.login);
  const [customerLogged, setCustomerLogged] = useState(false);
  const [rememberCustomerLogin, setRememberCustomerLogin] = useState(savedCustomerLogin.remember);

  const publicUrl = useMemo(() => site.slug ? `https://lech-web.pages.dev/site/${slugify(site.slug)}` : "", [site.slug]);

  function patchSite(patch) { setSite((prev) => ({ ...prev, ...patch })); }
  function patchTheme(patch) { setSite((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } })); }
  function patchModules(patch) { setSite((prev) => ({ ...prev, modules: { ...(prev.modules || defaultModules), ...patch } })); }
  function patchModule(name, patch) { setSite((prev) => ({ ...prev, modules: { ...(prev.modules || defaultModules), [name]: { ...((prev.modules || defaultModules)[name] || {}), ...patch } } })); }

  function updateProduct(index, patch) {
    setSite((prev) => {
      const products = [...(prev.products || [])];
      products[index] = { ...products[index], ...patch };
      return { ...prev, products };
    });
  }
  function addProduct() {
    setSite((prev) => ({ ...prev, products: [...(prev.products || []), { id: "p" + Date.now(), title: "Nový produkt", code: "", price: "€0", oldPrice: "", image: "", gallery: [], shortText: "", longText: "", badge: "", category: "", availability: "Skladom", visibility: "visible", stock: "0", vat: "23", detailUrl: "#", seoTitle: "", seoDescription: "", relatedProducts: "", youtube: "" }] }));
  }
  function removeProduct(index) { setSite((prev) => ({ ...prev, products: (prev.products || []).filter((_, i) => i !== index) })); }

  function buildWebsite() {
    const modules = site.modules || defaultModules;
    return {
      slug: slugify(site.slug || site.companyName),
      companyName: site.companyName,
      headline: site.headline || modules.titlePage?.heroTitle || site.companyName,
      description: site.description || modules.titlePage?.heroSubtitle || "",
      homepageText: site.homepageText || modules.titlePage?.seoText || "",
      phone: site.phone,
      email: site.siteEmail,
      siteEmail: site.siteEmail,
      template: site.template,
      theme: site.theme,
      modules,
      eshop: {
        enabled: true,
        topMenu: modules.menuSettings?.items || [],
        benefits: modules.banners?.advantages || [],
        sidebar: {
          categories: (modules.categoriesAdvanced?.items || []).map((x) => x.title).filter(Boolean),
          contactTitle: "Kontakt",
          contactName: site.companyName,
          contactEmail: site.siteEmail,
          contactPhone: site.phone,
          searchEnabled: true,
          adviceLinks: (modules.links?.items || []).filter((x) => x.visible !== false),
          youtube: [],
          customBlocks: [],
        },
        products: site.products || [],
        footerLinks: (modules.links?.items || []).filter((x) => x.footer !== false),
      },
    };
  }

  function loadWebsite(w) {
    if (!w) return;
    setSite((prev) => ({
      ...defaultSite,
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
      modules: { ...defaultModules, ...(w.modules || {}) },
      products: w.eshop?.products?.length ? w.eshop.products : (w.products?.length ? w.products : prev.products),
    }));
  }

  async function loadOwner() {
    setStatus("Načítavam tvoj admin...");
    try {
      const res = await fetch("/api/admin/sites", { headers: { "x-admin-pin": adminPin } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Admin načítanie zlyhalo.");
      setAccounts(data.accounts || []);
      setSummary(data.summary || null);
      setStatus("Tvoj admin načítaný.");
    } catch (err) { setStatus(err.message); }
  }

  function selectAccount(email) {
    setSelectedEmail(email);
    const acc = accounts.find((a) => a.email === email);
    if (!acc) return;
    setAccount(acc);
    loadWebsite(acc.website);
    setSite((prev) => ({ ...prev, slug: acc.website?.slug || slugify(acc.companyName || acc.email), companyName: acc.website?.companyName || acc.companyName || "", headline: acc.website?.headline || acc.companyName || "", siteEmail: acc.website?.email || acc.email || "", template: acc.website?.template || acc.template || "E-shop" }));
    setStatus("Vybraný zákazník: " + (acc.companyName || acc.email));
  }

  async function loginCustomerAdmin(e) {
    e.preventDefault();
    setStatus("Prihlasujem zákazníka...");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: customerLogin.email, password: customerLogin.password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Prihlásenie zlyhalo.");

      setAccount(data.account);
      setCustomerLogged(true);
      try {
        if (rememberCustomerLogin) {
          localStorage.setItem("lechweb_customer_login", JSON.stringify(customerLogin));
        } else {
          localStorage.removeItem("lechweb_customer_login");
        }
      } catch {
        setStatus("Prihlásenie prebehlo, ale uloženie prihlasovacích údajov v prehliadači zlyhalo.");
      }
      setSelectedEmail(data.account.email);
      loadWebsite(data.account.website);
      setArea("customer");
      setActive("cust-dashboard");
      setStatus("Zákazník prihlásený do svojho adminu.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveCustomerSite() {
    const email = account?.email || selectedEmail || customerLogin.email;
    if (!email) return setStatus("Najprv sa prihlás ako zákazník alebo vyber zákazníka v mojom admine.");

    setStatus("Ukladám zákazníkov web...");
    try {
      const payload = {
        ...buildWebsite(),
        email,
        accountEmail: email,
      };

      const res = await fetch("/api/site/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie webu zlyhalo.");

      if (data.account) setAccount(data.account);
      if (data.website) loadWebsite(data.website);
      setStatus("Zákazníkov web uložený. " + (data.publicUrl || ""));
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveForCustomer(licenseAction = "") {
    if (!selectedEmail) return setStatus("Najprv vyber zákazníka.");
    setStatus("Ukladám...");
    try {
      const res = await fetch("/api/admin/site-save", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ email: selectedEmail, website: buildWebsite(), licenseAction }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie zlyhalo.");
      setAccount(data.account);
      loadWebsite(data.account?.website);
      setStatus("Uložené. " + (data.publicUrl || ""));
      await loadOwner();
    } catch (err) { setStatus(err.message); }
  }

  async function loadOrders() {
    setStatus("Načítavam objednávky...");
    try {
      const query = site.slug ? `?siteSlug=${encodeURIComponent(site.slug)}` : "";
      const res = await fetch("/api/admin/orders" + query, { headers: { "x-admin-pin": adminPin } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Načítanie objednávok zlyhalo.");
      setOrders(data.orders || []);
      setSelectedOrder((data.orders || [])[0] || null);
      setStatus("Objednávky načítané.");
    } catch (err) { setStatus(err.message); }
  }

  async function updateOrder(order, patch) {
    setStatus("Ukladám objednávku...");
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ id: order.id, ...patch }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Uloženie objednávky zlyhalo.");
      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => o.id === data.order.id ? data.order : o));
      setStatus("Objednávka uložená.");
    } catch (err) { setStatus(err.message); }
  }

  const nav = area === "owner" ? ownerNav : customerNav;

  return (
    <main className="min-h-screen bg-[#05060d] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,.22),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(217,70,239,.18),transparent_34%)]" />
      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 font-black text-black shadow-[0_0_30px_rgba(34,211,238,.55)]">LW</div>
              <div>
                <div className="text-xl font-black tracking-tight">Lech-Web</div>
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">{area === "owner" ? "môj admin" : "admin zákazníka"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {publicUrl && <a className="hidden rounded-xl border border-slate-700 px-4 py-3 text-sm font-black text-slate-200 hover:bg-slate-800 md:block" href={publicUrl} target="_blank" rel="noreferrer">Zobraziť web</a>}
              <Button variant={area === "owner" ? "cyan" : "dark"} onClick={() => { setArea("owner"); setActive("owner-dashboard"); }}>Môj admin</Button>
              <Button variant={area === "customer" ? "pink" : "dark"} onClick={() => { setArea("customer"); setActive("cust-dashboard"); }}>Admin zákazníka</Button>
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-64px)] grid-cols-[300px_1fr]">
          <aside className="border-r border-slate-800 bg-slate-950/90 p-4">
            {area === "owner" ? (
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-black">Tvoj admin prístup</div>
                <Input placeholder="ADMIN_PIN" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
                <Button className="mt-3 w-full" onClick={loadOwner}>Načítať zákazníkov</Button>
              </div>
            ) : (
              <form onSubmit={loginCustomerAdmin} className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-black">Prihlásenie zákazníka</div>
                <div className="grid gap-2">
                  <Input placeholder="E-mail" value={customerLogin.email} onChange={(e) => setCustomerLogin({ ...customerLogin, email: e.target.value })} />
                  <Input placeholder="Heslo" type="password" value={customerLogin.password} onChange={(e) => setCustomerLogin({ ...customerLogin, password: e.target.value })} />
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberCustomerLogin}
                      onChange={(e) => {
                        setRememberCustomerLogin(e.target.checked);
                        if (!e.target.checked) localStorage.removeItem("lechweb_customer_login");
                      }}
                    />
                    Zapamätať email a heslo
                  </label>
                  <Button className="w-full">Prihlásiť do adminu</Button>
                </div>
                {customerLogged && <div className="mt-3 rounded-xl border border-lime-300/30 bg-lime-300/10 p-3 text-xs font-bold text-lime-100">Prihlásený: {account?.email}</div>}
              </form>
            )}

            {area === "owner" && accounts.length > 0 && (
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-black">Aktívny zákazník</div>
                <Select value={selectedEmail} onChange={(e) => selectAccount(e.target.value)}>
                  <option value="">Vyber zákazníka</option>
                  {accounts.map((a) => <option key={a.email} value={a.email}>{a.companyName} - {a.status}</option>)}
                </Select>
              </div>
            )}

            <nav className="grid gap-1">
              {nav.map((item) => (
                <button key={item.id} onClick={() => setActive(item.id)} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition", active === item.id ? "bg-cyan-300 text-black" : "text-slate-300 hover:bg-slate-900")}>
                  <span className="w-6 text-center">{item.icon}</span>{item.title}
                </button>
              ))}
            </nav>
          </aside>

          <section className="p-5">
            <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-black">{nav.find((x) => x.id === active)?.title}</h1>
                <p className="text-slate-400">{area === "owner" ? "Toto je iba tvoj admin: licencie, zákazníci, balíky." : "Toto je admin zákazníka: jeho web, produkty, bannery, objednávky a nastavenia."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {area === "owner" && <><Button variant="lime" onClick={() => saveForCustomer("activate_month")}>+ 1 mesiac</Button><Button variant="lime" onClick={() => saveForCustomer("activate_year")}>+ 1 rok</Button><Button variant="red" onClick={() => saveForCustomer("suspend")}>Vypnúť</Button></>}
                <Button onClick={() => area === "owner" ? saveForCustomer("") : saveCustomerSite()}>Uložiť</Button>
              </div>
            </div>

            <div className="mb-5"><Status text={status} /></div>

            {area === "owner" ? (
              <OwnerContent active={active} summary={summary} accounts={accounts} selectedEmail={selectedEmail} selectAccount={selectAccount} account={account} saveForCustomer={saveForCustomer} />
            ) : (
              <CustomerAdminContent active={active} site={site} patchSite={patchSite} patchTheme={patchTheme} patchModules={patchModules} patchModule={patchModule} updateProduct={updateProduct} addProduct={addProduct} removeProduct={removeProduct} publicUrl={publicUrl} setStatus={setStatus} orders={orders} loadOrders={loadOrders} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} updateOrder={updateOrder} saveForCustomer={saveForCustomer} saveCustomerSite={saveCustomerSite} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function OwnerContent(props) {
  if (props.active === "owner-dashboard") return <OwnerDashboard {...props} />;
  if (props.active === "owner-customers") return <OwnerCustomers {...props} />;
  if (props.active === "owner-licenses") return <OwnerLicenses {...props} />;
  if (props.active === "owner-plans") return <OwnerPlans />;
  return null;
}

function OwnerDashboard({ summary, accounts, account }) {
  const cards = [
    ["Zákazníci", summary?.total ?? accounts.length],
    ["Aktívne", summary?.active ?? "—"],
    ["Trial", summary?.trial ?? "—"],
    ["Pozastavené", summary?.suspended ?? "—"],
  ];
  return <div className="grid gap-5"><div className="grid gap-4 md:grid-cols-4">{cards.map(([label, value], i) => <div key={label} className={cn("rounded-2xl p-5", i === 0 ? "bg-cyan-300 text-black" : "border border-slate-800 bg-slate-900")}><div className="text-sm font-black opacity-80">{label}</div><div className="mt-2 text-4xl font-black">{value}</div></div>)}</div><Panel title="Vybraný zákazník"><div className="text-xl font-black">{account?.companyName || "Nie je vybraný"}</div><div className="text-slate-400">{account?.email}</div></Panel></div>;
}

function OwnerCustomers({ accounts, selectedEmail, selectAccount }) {
  return <Panel title="Tvoji zákazníci" desc="Toto je tvoj admin. Tu riešiš účty a licencie, nie produkty zákazníka."><div className="overflow-auto"><table className="w-full min-w-[900px] border-collapse text-sm"><thead><tr className="border-b border-slate-800 text-left text-slate-400"><th className="p-3">Firma</th><th className="p-3">Email</th><th className="p-3">Balík</th><th className="p-3">Šablóna</th><th className="p-3">Stav</th><th className="p-3">Trial</th><th className="p-3">Paid</th></tr></thead><tbody>{accounts.map((a) => <tr key={a.email} onClick={() => selectAccount(a.email)} className={cn("cursor-pointer border-b border-slate-800", selectedEmail === a.email ? "bg-cyan-300/10" : "hover:bg-slate-800")}><td className="p-3 font-bold">{a.companyName}</td><td className="p-3">{a.email}</td><td className="p-3">{a.plan}</td><td className="p-3">{a.template}</td><td className="p-3">{a.status}</td><td className="p-3">{a.trialUntil?.slice(0, 10) || "—"}</td><td className="p-3">{a.paidUntil?.slice(0, 10) || "—"}</td></tr>)}</tbody></table></div></Panel>;
}

function OwnerLicenses({ account, saveForCustomer }) {
  return <Panel title="Licencie" desc="Tu riadiš, či zákazník môže používať web."><div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="text-xl font-black">{account?.companyName || "Nie je vybraný zákazník"}</div><div className="mt-2 text-sm text-slate-400">Stav: {account?.status || "—"} | Trial: {account?.trialUntil?.slice(0, 10) || "—"} | Paid: {account?.paidUntil?.slice(0, 10) || "—"}</div></div><div className="grid gap-3 md:grid-cols-5"><Button variant="lime" onClick={() => saveForCustomer("trial14")}>Trial 14 dní</Button><Button variant="lime" onClick={() => saveForCustomer("activate_month")}>+ 1 mesiac</Button><Button variant="lime" onClick={() => saveForCustomer("activate_year")}>+ 1 rok</Button><Button variant="lime" onClick={() => saveForCustomer("activate_2years")}>+ 2 roky</Button><Button variant="red" onClick={() => saveForCustomer("suspend")}>Pozastaviť</Button></div></Panel>;
}

function OwnerPlans() {
  return <Panel title="Balíky" desc="Základ balíkov pre budúce obmedzenia funkcií."><div className="grid gap-4 md:grid-cols-3">{["Start Web", "Business Web", "Mini E-shop"].map((p) => <div key={p} className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><h3 className="text-xl font-black">{p}</h3><p className="text-slate-400">Tu neskôr nastavíme limity: počet produktov, objednávky, uploady, domény.</p></div>)}</div></Panel>;
}

function CustomerAdminContent(props) {
  const a = props.active;
  if (a === "cust-dashboard") return <CustDashboard {...props} />;
  if (a === "cust-orders") return <CustOrders {...props} />;
  if (a === "cust-products") return <CustProducts {...props} />;
  if (a === "cust-product-detail") return <CustProductDetail {...props} />;
  if (a === "cust-categories") return <CustCategories {...props} />;
  if (a === "cust-title-page") return <CustTitlePage {...props} />;
  if (a === "cust-banners") return <CustBanners {...props} />;
  if (a === "cust-menu") return <JsonModule title="Menu webu" moduleName="menuSettings" {...props} />;
  if (a === "cust-links") return <JsonModule title="Odkazy" moduleName="links" {...props} />;
  if (a === "cust-cookies") return <CustCookies {...props} />;
  if (a === "cust-documents") return <CustDocuments {...props} />;
  if (a === "cust-fields") return <JsonModule title="Povinné polia" moduleName="customerFields" {...props} />;
  if (a === "cust-settings") return <CustSettings {...props} />;
  return null;
}

function CustDashboard({ site, publicUrl, orders, loadOrders }) {
  return <div className="grid gap-5"><div className="grid gap-4 md:grid-cols-4"><div className="rounded-2xl bg-cyan-300 p-5 text-black"><div className="text-sm font-black">Produkty</div><div className="mt-2 text-4xl font-black">{site.products?.length || 0}</div></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="text-sm text-slate-400">Objednávky</div><div className="mt-2 text-4xl font-black">{orders.length || "—"}</div></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="text-sm text-slate-400">Web</div>{publicUrl ? <a className="mt-2 block font-black text-cyan-300" href={publicUrl} target="_blank">Otvoriť</a> : "—"}</div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="text-sm text-slate-400">Šablóna</div><div className="mt-2 font-black">{site.template}</div></div></div><Panel title="Rýchle akcie" right={<Button onClick={loadOrders}>Načítať objednávky</Button>}><p className="text-slate-400">Toto je admin zákazníka. Tu bude spravovať svoj e-shop.</p></Panel></div>;
}

function CustOrders({ orders, loadOrders, selectedOrder, setSelectedOrder, updateOrder }) {
  const [note, setNote] = useState("");
  function choose(o) { setSelectedOrder(o); setNote(o.adminNote || ""); }
  return <div className="grid gap-5 xl:grid-cols-[1fr_420px]"><Panel title="Objednávky zákazníka" desc="Objednávky jeho e-shopu." right={<Button onClick={loadOrders}>Načítať objednávky</Button>}><div className="overflow-auto"><table className="w-full min-w-[850px] border-collapse text-sm"><thead><tr className="border-b border-slate-800 text-left text-slate-400"><th className="p-3">Číslo</th><th className="p-3">Zákazník</th><th className="p-3">Kontakt</th><th className="p-3">Položky</th><th className="p-3">Stav</th><th className="p-3">Dátum</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id} onClick={() => choose(o)} className={cn("cursor-pointer border-b border-slate-800 hover:bg-slate-800", selectedOrder?.id === o.id && "bg-cyan-300/10")}><td className="p-3 font-black text-cyan-300">{o.number}</td><td className="p-3">{o.customer?.name}</td><td className="p-3">{o.customer?.email || o.customer?.phone}</td><td className="p-3">{o.items?.length || 0}</td><td className="p-3">{o.status}</td><td className="p-3">{o.createdAt?.slice(0, 10)}</td></tr>)}</tbody></table>{!orders.length && <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-400">Zatiaľ nie sú načítané objednávky.</div>}</div></Panel><Panel title="Detail objednávky">{!selectedOrder ? <div className="text-slate-400">Vyber objednávku.</div> : <div className="grid gap-4"><div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="text-sm text-slate-400">Číslo</div><div className="text-xl font-black text-cyan-300">{selectedOrder.number}</div></div><div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><b>{selectedOrder.customer?.name}</b><div>{selectedOrder.customer?.email}</div><div>{selectedOrder.customer?.phone}</div><div>{selectedOrder.customer?.address}</div></div><div className="grid gap-2">{(selectedOrder.items || []).map((it, idx) => <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3"><b>{it.title}</b><div className="text-sm text-slate-400">{it.qty} ks • {it.price}</div></div>)}</div><Field label="Stav"><Select value={selectedOrder.status || "new"} onChange={(e) => updateOrder(selectedOrder, { status: e.target.value, adminNote: note })}><option value="new">Nová</option><option value="processing">Vybavuje sa</option><option value="done">Vybavená</option><option value="canceled">Zrušená</option></Select></Field><Field label="Interná poznámka"><TextArea value={note} onChange={(e) => setNote(e.target.value)} /></Field><Button onClick={() => updateOrder(selectedOrder, { status: selectedOrder.status || "new", adminNote: note })}>Uložiť objednávku</Button></div>}</Panel></div>;
}

function CustProducts({ site, updateProduct, addProduct, removeProduct, setStatus }) {
  return <Panel title="Produkty" desc="Prehľad produktov ako základ zo starého adminu." right={<Button variant="pink" onClick={addProduct}>Pridať produkt</Button>}><div className="grid gap-4">{site.products.map((p, i) => <div key={p.id || i} className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><div className="mb-3 flex items-center justify-between"><b>{p.title || "Produkt " + (i + 1)}</b><Button variant="red" onClick={() => removeProduct(i)}>Zmazať</Button></div><div className="grid gap-3 md:grid-cols-3"><Input placeholder="Kód" value={p.code || ""} onChange={(e) => updateProduct(i, { code: e.target.value })} /><Input placeholder="Názov" value={p.title || ""} onChange={(e) => updateProduct(i, { title: e.target.value })} /><Input placeholder="Kategória" value={p.category || ""} onChange={(e) => updateProduct(i, { category: e.target.value })} /><Input placeholder="Cena" value={p.price || ""} onChange={(e) => updateProduct(i, { price: e.target.value })} /><Input placeholder="Sklad" value={p.stock || ""} onChange={(e) => updateProduct(i, { stock: e.target.value })} /><Select value={p.availability || "Skladom"} onChange={(e) => updateProduct(i, { availability: e.target.value })}><option>Skladom</option><option>Na objednávku</option><option>Vypredané</option></Select><Select value={p.visibility || "visible"} onChange={(e) => updateProduct(i, { visibility: e.target.value })}><option value="visible">Viditeľný</option><option value="hidden">Skrytý</option></Select><Input placeholder="Príznak" value={p.badge || ""} onChange={(e) => updateProduct(i, { badge: e.target.value })} /><Input placeholder="DPH" value={p.vat || ""} onChange={(e) => updateProduct(i, { vat: e.target.value })} /><div className="md:col-span-3"><div className="grid gap-2 md:grid-cols-[1fr_auto]"><Input placeholder="Obrázok URL" value={p.image || ""} onChange={(e) => updateProduct(i, { image: e.target.value })} /><UploadButton folder="products" label="Nahrať produkt" setStatus={setStatus} onUploaded={(url) => updateProduct(i, { image: url })} /></div>{p.image && <img className="mt-2 h-32 rounded-xl border border-slate-700 bg-white/5 object-contain p-2" src={p.image} />}</div><TextArea className="md:col-span-3" placeholder="Krátky popis" value={p.shortText || ""} onChange={(e) => updateProduct(i, { shortText: e.target.value })} /></div></div>)}</div></Panel>;
}

function CustProductDetail({ site, updateProduct }) {
  const [idx, setIdx] = useState(0);
  const p = site.products[idx] || {};
  return <Panel title="Detail produktu" desc="SEO, dlhý popis, videá, súvisiace produkty." right={<Select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>{site.products.map((x, i) => <option key={i} value={i}>{x.title || "Produkt " + (i + 1)}</option>)}</Select>}><div className="grid gap-4"><Field label="Dlhý popis"><TextArea className="min-h-52" value={p.longText || ""} onChange={(e) => updateProduct(idx, { longText: e.target.value })} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="SEO title"><Input value={p.seoTitle || ""} onChange={(e) => updateProduct(idx, { seoTitle: e.target.value })} /></Field><Field label="SEO description"><Input value={p.seoDescription || ""} onChange={(e) => updateProduct(idx, { seoDescription: e.target.value })} /></Field><Field label="YouTube video"><Input value={p.youtube || ""} onChange={(e) => updateProduct(idx, { youtube: e.target.value })} /></Field><Field label="Súvisiace produkty"><Input value={p.relatedProducts || ""} onChange={(e) => updateProduct(idx, { relatedProducts: e.target.value })} /></Field></div></div></Panel>;
}

function CustCategories({ site, patchModule }) {
  const [text, setText] = useState(jsonPretty(site.modules?.categoriesAdvanced || defaultModules.categoriesAdvanced));
  return <Panel title="Kategórie" desc="Použité zo starého categories.html: viditeľnosť, menu, index/noindex, produkty."><TextArea className="min-h-[420px] font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} /><Button className="mt-3" onClick={() => patchModule("categoriesAdvanced", parseJson(text, defaultModules.categoriesAdvanced))}>Použiť kategórie</Button></Panel>;
}

function CustTitlePage({ site, patchModule, patchTheme, setStatus }) {
  const t = site.modules?.titlePage || defaultModules.titlePage;
  return <Panel title="Titulná strana" desc="Základ zo starého title-page.html."><div className="grid gap-4"><Field label="Hero nadpis"><Input value={t.heroTitle || ""} onChange={(e) => patchModule("titlePage", { heroTitle: e.target.value })} /></Field><Field label="Hero podnadpis"><TextArea value={t.heroSubtitle || ""} onChange={(e) => patchModule("titlePage", { heroSubtitle: e.target.value })} /></Field><Field label="Hero obrázok"><div className="grid gap-2 md:grid-cols-[1fr_auto]"><Input value={t.heroImage || ""} onChange={(e) => { patchModule("titlePage", { heroImage: e.target.value }); patchTheme({ heroImage: e.target.value }); }} /><UploadButton folder="hero" label="Nahrať hero" setStatus={setStatus} onUploaded={(url) => { patchModule("titlePage", { heroImage: url }); patchTheme({ heroImage: url }); }} /></div></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Tlačidlo 1 text"><Input value={t.button1Text || ""} onChange={(e) => patchModule("titlePage", { button1Text: e.target.value })} /></Field><Field label="Tlačidlo 1 URL"><Input value={t.button1Url || ""} onChange={(e) => patchModule("titlePage", { button1Url: e.target.value })} /></Field><Field label="SEO nadpis"><Input value={t.seoTitle || ""} onChange={(e) => patchModule("titlePage", { seoTitle: e.target.value })} /></Field><Field label="SEO text"><Input value={t.seoText || ""} onChange={(e) => patchModule("titlePage", { seoText: e.target.value })} /></Field></div></div></Panel>;
}

function CustBanners({ site, patchModule }) {
  const [text, setText] = useState(jsonPretty(site.modules?.banners || defaultModules.banners));
  return <Panel title="Bannery a výhody" desc="Použité zo starého banners.html."><TextArea className="min-h-[420px] font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} /><Button className="mt-3" onClick={() => patchModule("banners", parseJson(text, defaultModules.banners))}>Použiť bannery</Button></Panel>;
}

function JsonModule({ title, moduleName, site, patchModule }) {
  const [text, setText] = useState(jsonPretty(site.modules?.[moduleName] || defaultModules[moduleName]));
  return <Panel title={title} desc="Modul zo starého Web-main adminu."><TextArea className="min-h-[520px] font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} /><Button className="mt-3" onClick={() => patchModule(moduleName, parseJson(text, defaultModules[moduleName]))}>Použiť nastavenie</Button></Panel>;
}

function CustCookies({ site, patchModule }) {
  const c = site.modules?.cookies || defaultModules.cookies;
  return <Panel title="Cookies" desc="Použité zo starého cookies.html."><div className="grid gap-4"><Field label="Zapnuté"><Select value={c.enabled ? "yes" : "no"} onChange={(e) => patchModule("cookies", { enabled: e.target.value === "yes" })}><option value="yes">Zapnuté</option><option value="no">Vypnuté</option></Select></Field><Field label="Text lišty"><TextArea value={c.bannerText || ""} onChange={(e) => patchModule("cookies", { bannerText: e.target.value })} /></Field><Field label="Text tlačidla"><Input value={c.acceptText || ""} onChange={(e) => patchModule("cookies", { acceptText: e.target.value })} /></Field><Field label="Privacy URL"><Input value={c.privacyUrl || ""} onChange={(e) => patchModule("cookies", { privacyUrl: e.target.value })} /></Field></div></Panel>;
}

function CustDocuments({ site, patchModule }) {
  const d = site.modules?.documents || defaultModules.documents;
  return <Panel title="Doklady" desc="Použité zo starého documents.html: predpony dokladov a budúce faktúry."><div className="grid gap-4 md:grid-cols-2"><Field label="Objednávky prefix"><Input value={d.ordersPrefix || ""} onChange={(e) => patchModule("documents", { ordersPrefix: e.target.value })} /></Field><Field label="Faktúry prefix"><Input value={d.invoicePrefix || ""} onChange={(e) => patchModule("documents", { invoicePrefix: e.target.value })} /></Field><Field label="Zálohové faktúry prefix"><Input value={d.proformaPrefix || ""} onChange={(e) => patchModule("documents", { proformaPrefix: e.target.value })} /></Field><Field label="Dodacie listy prefix"><Input value={d.deliveryNotePrefix || ""} onChange={(e) => patchModule("documents", { deliveryNotePrefix: e.target.value })} /></Field></div></Panel>;
}

function CustSettings({ site, patchSite, patchTheme, publicUrl, setStatus }) {
  return <Panel title="Nastavenia webu" desc="Zákazníkove nastavenia jeho webu."><div className="grid gap-4 md:grid-cols-2"><Field label="URL názov"><Input value={site.slug} onChange={(e) => patchSite({ slug: slugify(e.target.value) })} /></Field><Field label="Názov firmy"><Input value={site.companyName} onChange={(e) => patchSite({ companyName: e.target.value })} /></Field><Field label="Farba"><Select value={site.theme.accent} onChange={(e) => patchTheme({ accent: e.target.value })}>{colorPresets.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</Select></Field><Field label="Logo"><div className="grid gap-2 md:grid-cols-[1fr_auto]"><Input value={site.theme.logo} onChange={(e) => patchTheme({ logo: e.target.value })} /><UploadButton folder="logos" label="Nahrať logo" setStatus={setStatus} onUploaded={(url) => patchTheme({ logo: url })} /></div></Field><Field label="Telefón"><Input value={site.phone} onChange={(e) => patchSite({ phone: e.target.value })} /></Field><Field label="Email"><Input value={site.siteEmail} onChange={(e) => patchSite({ siteEmail: e.target.value })} /></Field><Field label="Verejný web"><Input readOnly value={publicUrl || ""} /></Field></div></Panel>;
}
