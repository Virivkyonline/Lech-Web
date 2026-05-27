import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Eye,
  Palette,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Search,
  Code2,
  BarChart3,
  Globe2,
  Mail,
  Phone,
  MapPin,
  Flame,
  Crown,
  Brain,
  Hammer,
  Scissors,
  Car,
  Shirt,
  Utensils,
  Bed,
  Home,
  Dumbbell,
  Cpu,
  Megaphone,
} from "lucide-react";

const templates = [
  {
    name: "Stavebná firma",
    tag: "Najlepšie pre remeslá",
    icon: Hammer,
    accent: "cyan",
    text: "Pre stavebné firmy, kontajnery, garáže, montáže, strechy, ploty a technické služby.",
    forWho: "Stavebníci, montážnici, predajcovia kontajnerov",
    includes: ["Služby", "Realizácie", "Dopytový formulár"],
  },
  {
    name: "E-shop oblečenie",
    tag: "Móda a kolekcie",
    icon: Shirt,
    accent: "fuchsia",
    text: "Luxusný predajný vzhľad pre oblečenie, doplnky, kolekcie, butik alebo prémiovú značku.",
    forWho: "Butiky, módne značky, predajcovia oblečenia",
    includes: ["Kolekcie", "Produkty", "Lookbook"],
  },
  {
    name: "Autoservis",
    tag: "Rýchle dopyty",
    icon: Car,
    accent: "cyan",
    text: "Silný web pre autoservis, pneuservis, detailing, požičovňu alebo predaj áut.",
    forWho: "Autoservisy, pneuservisy, detailing centrá",
    includes: ["Služby", "Cenník", "Objednávka termínu"],
  },
  {
    name: "Beauty salón",
    tag: "Luxusný vzhľad",
    icon: Scissors,
    accent: "fuchsia",
    text: "Moderný neónový web pre kozmetiku, nechty, kaderníctvo, masáže a estetické služby.",
    forWho: "Salóny krásy, kozmetika, wellness",
    includes: ["Služby", "Cenník", "Rezervácia"],
  },
  {
    name: "Reštaurácia",
    tag: "Chuť predáva",
    icon: Utensils,
    accent: "lime",
    text: "Predajný web pre reštaurácie, kaviarne, bistrá, donášku a denné menu.",
    forWho: "Gastro prevádzky, kaviarne, donáška",
    includes: ["Menu", "Rezervácia", "Otváracie hodiny"],
  },
  {
    name: "Ubytovanie",
    tag: "Rezervácie",
    icon: Bed,
    accent: "cyan",
    text: "Atmosférický web pre apartmány, penzióny, chaty, hotely a krátkodobé ubytovanie.",
    forWho: "Apartmány, penzióny, chaty, hotely",
    includes: ["Izby", "Galéria", "Rezervácia"],
  },
  {
    name: "Reality",
    tag: "Prémiový predaj",
    icon: Home,
    accent: "fuchsia",
    text: "Web pre realitných maklérov, developerov, prenájmy a predaj nehnuteľností.",
    forWho: "Makléri, developeri, realitné kancelárie",
    includes: ["Ponuky", "Detail nehnuteľnosti", "Kontakt"],
  },
  {
    name: "Fitness",
    tag: "Energia a výkon",
    icon: Dumbbell,
    accent: "lime",
    text: "Web pre trénerov, výživových poradcov, wellness, fyzio a športové programy.",
    forWho: "Tréneri, fyzio, wellness, fitness centrá",
    includes: ["Programy", "Cenník", "Konzultácia"],
  },
  {
    name: "Technika",
    tag: "Čistý predaj",
    icon: Cpu,
    accent: "cyan",
    text: "Moderný web alebo e-shop pre elektroniku, náradie, príslušenstvo a technické produkty.",
    forWho: "Technické obchody, predajcovia náradia",
    includes: ["Produkty", "Parametre", "Dopyt"],
  },
  {
    name: "Landing page",
    tag: "Na reklamu",
    icon: Megaphone,
    accent: "fuchsia",
    text: "Jedna silná predajná stránka pre Facebook, Google reklamu, kampaň alebo špeciálnu ponuku.",
    forWho: "Reklamy, kampane, rýchly predaj",
    includes: ["Hero", "Výhody", "Formulár"],
  },
];

const demoTemplates = [
  {
    brand: "STAVEX PRO",
    category: "stavebné práce / kontajnery / montáže",
    badge: "Moderná stavebná firma bez nudného webu",
    title: "Kontajnery, montáže a stavebné riešenia, ktoré pôsobia profesionálne na prvý pohľad.",
    desc: "Prémiová šablóna pre firmy, ktoré potrebujú ukázať služby, realizácie, dôveryhodnosť a získať dopyt čo najrýchlejšie.",
    services: ["Predaj kontajnerov", "Montážne práce", "Stavebné úpravy", "Garáže a prístrešky"],
    stats: [{ number: "120+", label: "realizácií" }, { number: "48h", label: "rýchly dopyt" }, { number: "EU", label: "pôsobnosť" }],
    glow: "from-cyan-300 via-fuchsia-500 to-violet-500",
  },
  {
    brand: "AURORA BEAUTY",
    category: "beauty / wellness / spa",
    badge: "Prémiový salón, ktorý vyzerá draho",
    title: "Kozmetika, masáže a wellness prezentované ako luxusná značka.",
    desc: "Šablóna pre salóny, ktoré chcú viac rezervácií, krajší prvý dojem a vyššiu dôveru pri prémiových službách.",
    services: ["Kozmetika", "Masáže", "Nechty", "Spa balíky"],
    stats: [{ number: "4.9★", label: "hodnotenia" }, { number: "24/7", label: "rezervácie" }, { number: "VIP", label: "balíky" }],
    glow: "from-fuchsia-300 via-violet-500 to-cyan-400",
  },
  {
    brand: "AUTO NEON SERVIS",
    category: "autoservis / pneuservis / detailing",
    badge: "Technický web, ktorý zbiera termíny",
    title: "Servis, pneumatiky a detailing s jasným CTA na objednanie termínu.",
    desc: "Šablóna pre autoservisy, ktoré chcú pôsobiť moderne, rýchlo vysvetliť služby a dostať zákazníka do formulára.",
    services: ["Diagnostika", "Pneuservis", "Detailing", "STK príprava"],
    stats: [{ number: "30 min", label: "rýchly kontakt" }, { number: "8+", label: "služieb" }, { number: "TOP", label: "dôvera" }],
    glow: "from-cyan-300 via-blue-500 to-fuchsia-400",
  },
  {
    brand: "E.V. COLLECTION",
    category: "móda / kolekcie / butik",
    badge: "E-shop, ktorý predáva vizuálom",
    title: "Módna značka s lookbookom, kolekciami a luxusným produktovým dojmom.",
    desc: "Pre butiky a módne značky, kde musí stránka vyzerať prémiovo ešte pred kliknutím na produkt.",
    services: ["Kolekcie", "Lookbook", "Produkty", "Zľavy"],
    stats: [{ number: "NEW", label: "kolekcie" }, { number: "VIP", label: "štýl" }, { number: "SHOP", label: "predaj" }],
    glow: "from-fuchsia-300 via-pink-500 to-cyan-400",
  },
  {
    brand: "NIGHT BISTRO",
    category: "reštaurácia / kaviareň / donáška",
    badge: "Gastro web, ktorý robí chuť",
    title: "Menu, denné ponuky a rezervácie v modernom neónovom gastro štýle.",
    desc: "Šablóna pre podniky, ktoré chcú na mobile okamžite ukázať menu, otváracie hodiny a rezerváciu.",
    services: ["Menu", "Denné menu", "Rezervácie", "Donáška"],
    stats: [{ number: "12:00", label: "denné menu" }, { number: "MAP", label: "lokalita" }, { number: "BOOK", label: "stôl" }],
    glow: "from-lime-300 via-cyan-400 to-fuchsia-400",
  },
  {
    brand: "LUX APARTMENTS",
    category: "apartmány / penzión / chata",
    badge: "Rezervačný web s atmosférou",
    title: "Ubytovanie, ktoré vyzerá dôveryhodne a prémiovo na prvý pohľad.",
    desc: "Pre apartmány, chaty a penzióny, kde zákazník potrebuje vidieť izby, galériu, okolie a rýchly kontakt.",
    services: ["Izby", "Galéria", "Okolie", "Rezervácia"],
    stats: [{ number: "4.8★", label: "hostia" }, { number: "360°", label: "galéria" }, { number: "BOOK", label: "pobyt" }],
    glow: "from-cyan-300 via-teal-400 to-fuchsia-400",
  },
  {
    brand: "REALITY PRIME",
    category: "maklér / developer / prenájom",
    badge: "Prémiový predaj nehnuteľností",
    title: "Realitná prezentácia, ktorá buduje dôveru a predáva hodnotu.",
    desc: "Šablóna pre maklérov a developerov s ponukami, detailom nehnuteľnosti a formulárom pre predaj alebo kúpu.",
    services: ["Ponuky", "Detail", "Hypotéka", "Kontakt"],
    stats: [{ number: "50+", label: "ponúk" }, { number: "VIP", label: "predaj" }, { number: "LEAD", label: "dopyty" }],
    glow: "from-fuchsia-300 via-cyan-500 to-blue-500",
  },
  {
    brand: "POWER BODY",
    category: "fitness / tréner / výživa",
    badge: "Energia, výkon a jasný program",
    title: "Tréningové programy a konzultácie v dizajne, ktorý motivuje.",
    desc: "Pre trénerov, fyzio a wellness služby, kde treba ukázať výsledky, balíky a rýchlu konzultáciu.",
    services: ["Tréningy", "Výživa", "Fyzio", "Programy"],
    stats: [{ number: "12W", label: "program" }, { number: "1:1", label: "koučing" }, { number: "GO", label: "akcia" }],
    glow: "from-lime-300 via-fuchsia-400 to-cyan-400",
  },
  {
    brand: "TECH STORE",
    category: "technika / náradie / elektronika",
    badge: "Čistý technický predaj",
    title: "Produkty, parametre a dopyty pre technický sortiment bez chaosu.",
    desc: "Pre predajcov techniky a náradia, ktorí potrebujú jasný katalóg, parametre a rýchly dopyt.",
    services: ["Produkty", "Parametre", "Kategórie", "Dopyt"],
    stats: [{ number: "SKU", label: "produkty" }, { number: "FAST", label: "rýchlosť" }, { number: "B2B", label: "predaj" }],
    glow: "from-cyan-300 via-blue-500 to-lime-300",
  },
  {
    brand: "AD BLAST",
    category: "landing page / reklama / kampaň",
    badge: "Jedna stránka, jeden cieľ",
    title: "Landing page pre reklamu, ktorá tlačí zákazníka na jednu akciu.",
    desc: "Pre Facebook, Google alebo lokálnu kampaň. Žiadne blúdenie, len problém, riešenie, dôkaz a formulár.",
    services: ["Hero", "Výhody", "Dôkazy", "Formulár"],
    stats: [{ number: "1", label: "cieľ" }, { number: "CTA", label: "klik" }, { number: "ADS", label: "reklama" }],
    glow: "from-fuchsia-300 via-violet-500 to-lime-300",
  },
];

const features = [
  { icon: Eye, title: "Zastaví pohľad", text: "Prvá obrazovka musí zákazníka chytiť. Neón, kontrast, veľké nadpisy a jasná akcia." },
  { icon: Brain, title: "Psychológia kliknutia", text: "Web je vedený tak, aby zákazník neblúdil. Vidí problém, riešenie a okamžitú výzvu na akciu." },
  { icon: Sparkles, title: "AI texty a reklamy", text: "Nadpisy, popisy služieb, SEO texty, reklamné vety a predajné formulácie bez trápenia." },
  { icon: Crown, title: "Luxusný dojem", text: "Dizajn musí pôsobiť draho, aj keď je vytvorený zo šablóny. To zvyšuje dôveru." },
  { icon: ShoppingCart, title: "Web aj e-shop", text: "Firemný web, landing page alebo jednoduchý e-shop s produktmi, službami a dopytmi." },
  { icon: Smartphone, title: "Mobil ako priorita", text: "Väčšina zákazníkov príde z mobilu. Preto musí web vyzerať výborne hlavne na telefóne." },
];

const plans = [
  {
    name: "Start Web",
    price: "39 €",
    period: "/ mesiac",
    setup: "0 € vytvorenie",
    commitment: "min. 12 mesiacov",
    desc: "Moderný jednostránkový web pre živnostníkov a malé firmy.",
    items: ["Luxusný neon dizajn", "Kontaktný formulár", "Mobilná verzia", "Hosting a prevádzka", "Základné SEO", "Malé textové úpravy"],
  },
  {
    name: "Business Web",
    price: "69 €",
    period: "/ mesiac",
    setup: "0 € vytvorenie",
    commitment: "min. 12 mesiacov",
    desc: "Silnejší firemný web pre služby, značku, referencie a dopyty.",
    items: ["Viac podstránok", "AI texty pre služby", "Galéria a referencie", "SEO štruktúra", "Mesačná technická starostlivosť", "Rýchle úpravy obsahu"],
    popular: true,
  },
  {
    name: "Mini E-shop",
    price: "119 €",
    period: "/ mesiac",
    setup: "0 € vytvorenie",
    commitment: "min. 24 mesiacov",
    desc: "Jednoduchý e-shop pre produkty, objednávky a predaj online.",
    items: ["Produkty a kategórie", "Objednávky", "Základná administrácia", "E-mailové notifikácie", "Hosting a technická prevádzka", "Mesačná starostlivosť"],
  },
];

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    type: "Chcem firemný web",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormStatus({ loading: true, success: "", error: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Formulár sa nepodarilo odoslať.");
      }

      setFormStatus({ loading: false, success: "Dopyt bol odoslaný. Čoskoro sa ozveme.", error: "" });
      setFormData({ name: "", contact: "", type: "Chcem firemný web", message: "" });
    } catch (error) {
      setFormStatus({ loading: false, success: "", error: error.message || "Chyba pri odosielaní formulára." });
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#03040a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute top-16 right-0 h-[560px] w-[560px] rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-[300px] w-[300px] rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.04)_1px,transparent_1px)] [background-size:46px_46px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,4,10,0.35)_45%,rgba(3,4,10,1)_100%)]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-black shadow-[0_0_45px_rgba(34,211,238,0.95)]">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">Lech<span className="text-cyan-300">-</span><span className="text-fuchsia-300">Web</span></div>
            <div className="text-xs uppercase tracking-[0.34em] text-cyan-300">Neon AI weby</div>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex">
          <a href="#sablony" className="hover:text-cyan-300">Šablóny</a>
          <a href="#ukazky" className="hover:text-cyan-300">Ukážky</a>
          <a href="#funkcie" className="hover:text-cyan-300">Funkcie</a>
          <a href="#cennik" className="hover:text-cyan-300">Cenník</a>
          <a href="#kontakt" className="hover:text-cyan-300">Kontakt</a>
        </nav>

        <a href="#kontakt" className="rounded-full border border-cyan-300/70 bg-cyan-300/10 px-5 py-2 text-sm font-black text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300 hover:text-black hover:shadow-[0_0_50px_rgba(34,211,238,0.95)]">
          Chcem web
        </a>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-28 pt-12 lg:grid-cols-2 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/50 bg-fuchsia-400/10 px-4 py-2 text-sm font-black text-fuchsia-200 shadow-[0_0_35px_rgba(217,70,239,0.35)]">
            <Flame className="h-4 w-4" />
            Tvorba webu bez vstupnej platby
          </div>

          <h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
            Tvoj web má <span className="text-cyan-300 drop-shadow-[0_0_30px_rgba(34,211,238,1)]">3 sekundy</span>. Buď zaujme, alebo ho zákazník zavrie.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
            Lech-Web tvorí luxusné neónové weby a e-shopy pre firmy, ktoré nechcú zapadnúť medzi nudné šablóny. Web vytvoríme bez vstupnej platby — platíte mesačnú prevádzku, servis, hosting a starostlivosť.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#kontakt" className="group inline-flex items-center justify-center gap-3 rounded-full bg-cyan-300 px-8 py-4 font-black text-black shadow-[0_0_55px_rgba(34,211,238,0.95)] transition hover:scale-105 hover:bg-white">
              Chcem dychberúci web
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a href="#ukazky" className="inline-flex items-center justify-center rounded-full border border-fuchsia-300/50 bg-fuchsia-500/10 px-8 py-4 font-black text-fuchsia-100 backdrop-blur transition hover:border-fuchsia-300 hover:bg-fuchsia-400 hover:text-black hover:shadow-[0_0_45px_rgba(217,70,239,0.8)]">
              Pozrieť reálne ukážky
            </a>
          </div>

          <div className="mt-11 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-3xl border border-cyan-300/25 bg-white/5 p-4 shadow-[0_0_25px_rgba(34,211,238,0.12)]"><div className="text-3xl font-black text-cyan-300">0 €</div><div className="text-xs text-slate-400">vytvorenie webu</div></div>
            <div className="rounded-3xl border border-fuchsia-300/25 bg-white/5 p-4 shadow-[0_0_25px_rgba(217,70,239,0.12)]"><div className="text-3xl font-black text-fuchsia-300">39 €</div><div className="text-xs text-slate-400">od / mesiac</div></div>
            <div className="rounded-3xl border border-lime-300/25 bg-white/5 p-4 shadow-[0_0_25px_rgba(190,242,100,0.1)]"><div className="text-3xl font-black text-lime-300">10</div><div className="text-xs text-slate-400">reálnych ukážok</div></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative">
          <div className="absolute -inset-6 rounded-[2.8rem] bg-gradient-to-r from-cyan-300 via-fuchsia-500 to-violet-500 opacity-80 blur-3xl" />
          <div className="relative rounded-[2.8rem] border border-white/15 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[2.2rem] border border-cyan-300/20 bg-black p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" /><span className="h-3 w-3 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]" /><span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" /></div>
                <div className="text-xs font-bold text-cyan-300">lech-web.sk</div>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-400/20 via-fuchsia-500/25 to-violet-600/20 p-6">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-fuchsia-400/30 blur-3xl" />
                <div className="relative">
                  <div className="mb-4 inline-block rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black shadow-[0_0_25px_rgba(190,242,100,0.8)]">0 € VYTVORENIE</div>
                  <h2 className="text-4xl font-black leading-tight">Web, ktorý pôsobí draho ešte pred prvým kliknutím.</h2>
                  <p className="mt-4 text-slate-300">Neón, kontrast, tlak na pozornosť a jasná akcia. Zákazník nesmie rozmýšľať, musí kliknúť.</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {["Luxus", "Neón", "AI obsah", "Predplatné"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-black shadow-[0_0_20px_rgba(255,255,255,0.06)]">{item}</div>)}
                  </div>
                  <button className="mt-6 w-full rounded-2xl bg-fuchsia-400 px-5 py-4 font-black text-black shadow-[0_0_45px_rgba(217,70,239,0.85)] transition hover:scale-[1.02] hover:bg-white">Chcem web od 39 € mesačne</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="funkcie" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 max-w-3xl">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">Psychológia pozornosti</div>
          <h2 className="text-4xl font-black sm:text-5xl">Web nesmie byť tichý. Musí okamžite zaútočiť na zrak.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">Nudný web si nikto nepamätá. Lech-Web je postavený tak, aby prvý pohľad vytvoril emóciu, dôveru a chuť kliknúť.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:shadow-[0_0_40px_rgba(34,211,238,0.28)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-black shadow-[0_0_30px_rgba(34,211,238,0.75)]"><Icon className="h-6 w-6" /></div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { icon: Search, title: "SEO pripravené", text: "Štruktúra pre Google, titulky, popisy a rýchlosť." },
            { icon: Code2, title: "Moderný kód", text: "React, Vite, Tailwind a Cloudflare Pages." },
            { icon: BarChart3, title: "Konverzie", text: "CTA prvky a sekcie vedené na dopyt." },
            { icon: Globe2, title: "Rýchlo online", text: "Nasadenie na Cloudflare a vlastná doména." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-black/40 p-6 transition hover:border-fuchsia-300 hover:shadow-[0_0_35px_rgba(217,70,239,0.22)]">
              <Icon className="mb-4 h-8 w-8 text-fuchsia-300" />
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="sablony" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">Neon šablóny</div>
            <h2 className="text-4xl font-black sm:text-5xl">10 šablón, ktoré predávajú skôr, než zákazník začne čítať.</h2>
          </div>
          <p className="max-w-md text-slate-300">Každá šablóna je pripravená ako predajný systém: prvý dojem, dôvera, jasná ponuka a tlačidlo na akciu. Žiadna lacná kópia.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 transition hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-[0_0_45px_rgba(34,211,238,0.25)]">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/25" />
                <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-fuchsia-400/10 blur-3xl transition group-hover:bg-fuchsia-400/25" />
                <div className="relative">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-black shadow-[0_0_25px_rgba(34,211,238,0.65)]"><Icon className="h-4 w-4" />{item.tag}</div>
                    <div className="text-sm font-black text-fuchsia-300">{String(index + 1).padStart(2, "0")}</div>
                  </div>
                  <h3 className="text-2xl font-black">{item.name}</h3>
                  <p className="mt-4 min-h-20 text-sm leading-7 text-slate-300">{item.text}</p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Pre koho</div>
                    <div className="mt-2 text-sm text-slate-300">{item.forWho}</div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.includes.map((feature) => <span key={feature} className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-xs font-bold text-fuchsia-100">{feature}</span>)}
                  </div>
                  <a href="#kontakt" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.75)]">
                    Chcem túto šablónu <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="ukazky" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">Reálne ukážky</div>
          <h2 className="text-4xl font-black sm:text-5xl">Každá šablóna má vlastnú predajnú atmosféru.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Toto sú živé ukážky štýlov, ktoré vie Lech-Web pripraviť pre rôzne typy klientov. Nie sú to len názvy — každá šablóna má vlastný predajný scenár.
          </p>
        </div>

        <div className="grid gap-8">
          {demoTemplates.map((demo, index) => (
            <section key={demo.brand} className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-black/50 p-5 shadow-[0_0_70px_rgba(34,211,238,0.12)]">
              <div className={`absolute -inset-10 bg-gradient-to-r ${demo.glow} opacity-20 blur-3xl`} />
              <div className="relative rounded-[2.2rem] border border-white/10 bg-[#050816] p-6 md:p-10">
                <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="text-2xl font-black">
                      {demo.brand.split(" ")[0]} <span className="text-cyan-300">{demo.brand.split(" ").slice(1).join(" ")}</span>
                    </div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{demo.category}</div>
                  </div>
                  <div className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.7)]">Ukážka {String(index + 1).padStart(2, "0")}</div>
                </div>

                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                  <div>
                    <div className="mb-5 inline-flex rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-black text-lime-200">{demo.badge}</div>
                    <h3 className="text-4xl font-black leading-tight sm:text-5xl">{demo.title}</h3>
                    <p className="mt-6 text-lg leading-8 text-slate-300">{demo.desc}</p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                      <a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-400 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(217,70,239,0.75)] transition hover:scale-105 hover:bg-white">
                        Chcem podobný web <ArrowRight className="h-5 w-5" />
                      </a>
                      <a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-cyan-300 hover:text-cyan-200">
                        Späť na šablóny
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
                      <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">Hlavné bloky</div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {demo.services.map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {demo.stats.map((item) => (
                        <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center">
                          <div className="text-3xl font-black text-cyan-300">{item.number}</div>
                          <div className="mt-1 text-xs text-slate-400">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-6">
                      <div className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">Čo obsahuje</div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {["Hero", "Služby", "Dôvera", "CTA", "Kontakt", "Formulár"].map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>


      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">Ako to funguje</div>
          <h2 className="text-4xl font-black sm:text-5xl">Od dopytu po ostrý web bez chaosu.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Klient nemusí riešiť hosting, programátora ani technické veci. Vyberie šablónu, dodá podklady a Lech-Web sa postará o spustenie aj mesačnú prevádzku.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "01", title: "Vyberie šablónu", text: "Klient si vyberie odbor alebo ukážku, ktorá najviac sedí jeho firme." },
            { step: "02", title: "Dodá podklady", text: "Logo, kontakt, služby, fotky, cenník a krátky popis firmy." },
            { step: "03", title: "Spustíme demo", text: "Vytvoríme web bez vstupnej platby a klient má 14 dní na skúšku." },
            { step: "04", title: "Mesačná prevádzka", text: "Po skúške web beží ako služba s hostingom, servisom a podporou." },
          ].map((item) => (
            <div key={item.step} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 transition hover:-translate-y-1 hover:border-lime-300/50 hover:shadow-[0_0_35px_rgba(190,242,100,0.18)]">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-lime-300/10 blur-3xl" />
              <div className="relative">
                <div className="mb-6 text-4xl font-black text-lime-300 drop-shadow-[0_0_16px_rgba(190,242,100,0.7)]">{item.step}</div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="rounded-[2.8rem] border border-white/10 bg-white/[0.04] p-6 md:p-10">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">Najčastejšie otázky</div>
            <h2 className="text-4xl font-black sm:text-5xl">Odpovede, ktoré predajú službu ešte pred telefonátom.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { q: "Prečo je vytvorenie webu za 0 €?", a: "Web je poskytovaný ako mesačná digitálna služba. Klient neplatí vysoký štart, ale pravidelnú prevádzku, servis a starostlivosť." },
              { q: "Môže si klient web odniesť inam?", a: "Klient vlastní svoj obsah, ale zdrojový kód, šablóny a systém ostávajú súčasťou služby Lech-Web." },
              { q: "Čo ak sa klientovi web nebude páčiť?", a: "Na začiatku má 14 dní skúšobnú dobu zadarmo. Počas nej sa vie rozhodnúť bez poplatku." },
              { q: "Čo je v mesačnej platbe?", a: "Hosting, technická prevádzka, formulár, základná starostlivosť, malé úpravy a podpora podľa vybraného balíka." },
              { q: "Dá sa platiť ročne?", a: "Áno. Ročná platba má zľavu 10 % a dvojročná platba má zľavu 20 %." },
              { q: "Je to vhodné aj pre e-shop?", a: "Áno. Mini E-shop je určený pre jednoduchý predaj produktov, kategórie, objednávky a e-mailové notifikácie." },
            ].map((item) => (
              <div key={item.q} className="rounded-[1.8rem] border border-white/10 bg-black/45 p-6 transition hover:border-cyan-300/50 hover:bg-cyan-300/5">
                <h3 className="text-lg font-black text-cyan-200">{item.q}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">Prečo Lech-Web</div>
          <h2 className="text-4xl font-black sm:text-5xl">Nie je to len web. Je to mesačne spravovaná predajná služba.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Klient nedostane iba peknú stránku. Dostane technickú prevádzku, formulár, údržbu, malé úpravy, hosting, podporu a systém, ktorý ostáva pod kontrolou Lech-Web.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-red-400/20 bg-red-400/5 p-6">
            <div className="mb-5 inline-flex rounded-full border border-red-300/30 bg-red-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-200">
              Obyčajný jednorazový web
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              {[
                "Klient zaplatí raz a web začne starnúť.",
                "Nikto nerieši rýchlosť, formuláre ani malé zmeny.",
                "Dizajn často vyzerá ako lacná šablóna bez emócie.",
                "Po čase treba znovu platiť za opravy a zásahy.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <span className="mt-2 h-2 w-2 rounded-full bg-red-300 shadow-[0_0_12px_rgba(252,165,165,0.8)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/30 bg-cyan-300/10 p-6 shadow-[0_0_45px_rgba(34,211,238,0.16)]">
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black shadow-[0_0_28px_rgba(34,211,238,0.75)]">
              Lech-Web predplatné
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-200">
              {[
                "0 € vstupná platba a 14 dní skúška zdarma.",
                "Mesačná prevádzka, hosting, technická starostlivosť a podpora.",
                "Luxusný neon dizajn, ktorý okamžite zastaví pohľad.",
                "Zdrojový kód, šablóny a systém ostávajú súčasťou služby.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-cyan-300/15 bg-black/35 p-4">
                  <span className="mt-2 h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.9)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cennik" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-lime-300">Cenník</div>
          <h2 className="text-4xl font-black sm:text-5xl">Moderný web bez vstupnej platby.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Web vytvoríme bez vstupnej platby a zákazník má 14 dní skúšobnú dobu zadarmo. Po skúšobnej dobe sa služba fakturuje vždy vopred minimálne na 1 mesiac. Pri ročnej platbe získate zľavu 10 %, pri dvojročnej platbe zľavu 20 %. Zdrojový kód, systém a šablóny ostávajú súčasťou služby Lech-Web.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-[2rem] border p-6 ${plan.popular ? "border-fuchsia-300 bg-fuchsia-400/10 shadow-[0_0_55px_rgba(217,70,239,0.45)]" : "border-white/10 bg-white/[0.05]"}`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-fuchsia-400 px-4 py-1 text-xs font-black text-black shadow-[0_0_30px_rgba(217,70,239,0.9)]">NAJPREDAJNEJŠÍ</div>}
              <h3 className="text-2xl font-black">{plan.name}</h3>
              <div className="mt-4">
                <div className="inline-flex rounded-full bg-lime-300 px-4 py-1 text-xs font-black text-black shadow-[0_0_25px_rgba(190,242,100,0.8)]">{plan.setup}</div>
                <div className="mt-4 flex items-end gap-2"><span className="text-5xl font-black text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.8)]">{plan.price}</span><span className="pb-2 text-slate-400">{plan.period}</span></div>
                <div className="mt-2 text-sm font-bold text-fuchsia-300">{plan.commitment}</div>
              </div>
              <p className="mt-4 leading-7 text-slate-300">{plan.desc}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {plan.items.map((item) => <li key={item} className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.8)]" />{item}</li>)}
              </ul>
              <button className="mt-8 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-black shadow-[0_0_40px_rgba(34,211,238,0.75)] transition hover:scale-[1.02] hover:bg-white">Vybrať balík</button>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-lime-300/20 bg-lime-300/10 p-5">
            <div className="text-lg font-black text-lime-300">14 dní zadarmo</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">Zákazník si môže službu vyskúšať 14 dní bez poplatku. Ak službu počas skúšobnej doby ukončí, nič neplatí.</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <div className="text-lg font-black text-cyan-300">Platba vopred</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">Po skúšobnej dobe sa predplatné fakturuje vždy vopred, minimálne na 1 mesiac. Ročná platba má zľavu 10 %, dvojročná platba 20 %.</p>
          </div>
          <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
            <div className="text-lg font-black text-fuchsia-300">Prenájom služby</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">Web je poskytovaný ako digitálna služba Lech-Web. Zdrojový kód, šablóny, systém a technické riešenie ostávajú vlastníctvom poskytovateľa.</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/40 p-5 text-sm leading-7 text-slate-400">
          Klient vlastní svoj dodaný obsah: texty, fotografie, logo, produkty a obchodné údaje. Reklamovať je možné technickú nefunkčnosť služby alebo rozpor s objednaným rozsahom. Za reklamáciu sa nepovažuje subjektívna zmena názoru po schválení webu, zmena obchodného zámeru klienta alebo požiadavka na funkcie mimo dohodnutého balíka.
        </div>
      </section>

      <section id="kontakt" className="relative z-10 mx-auto max-w-6xl px-5 py-24">
        <div className="rounded-[2.8rem] border border-cyan-300/30 bg-gradient-to-br from-cyan-400/10 via-white/[0.06] to-fuchsia-500/10 p-6 shadow-[0_0_70px_rgba(34,211,238,0.22)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-400 text-black shadow-[0_0_55px_rgba(217,70,239,0.95)]"><Palette className="h-8 w-8" /></div>
              <h2 className="text-4xl font-black sm:text-5xl">Lech-Web: weby, ktoré svietia medzi nudou.</h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">Nerobíme weby, ktoré len existujú. Robíme weby, ktoré priťahujú zrak, budujú dôveru a tlačia zákazníka ku kliknutiu.</p>
              <div className="mt-8 space-y-4 text-slate-300">
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-cyan-300" /> info@lech-web.sk</div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-cyan-300" /> +421 900 000 000</div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-cyan-300" /> Slovensko / EU</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] border border-white/10 bg-black/35 p-5 backdrop-blur">
              <input name="name" value={formData.name} onChange={handleInputChange} className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300" placeholder="Meno / firma" required />
              <input name="contact" value={formData.contact} onChange={handleInputChange} className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300" placeholder="Telefón / e-mail" required />
              <select name="type" value={formData.type} onChange={handleInputChange} className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none focus:border-cyan-300">
                <option>Chcem firemný web</option>
                <option>Chcem e-shop</option>
                <option>Chcem landing page</option>
                <option>Chcem šablónu na mieru</option>
              </select>
              <textarea name="message" value={formData.message} onChange={handleInputChange} className="min-h-32 rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300" placeholder="Aký web alebo e-shop chceš?" required />
              {formStatus.success && <div className="rounded-2xl border border-lime-300/40 bg-lime-300/10 px-5 py-4 text-sm font-bold text-lime-200">{formStatus.success}</div>}
              {formStatus.error && <div className="rounded-2xl border border-red-400/40 bg-red-400/10 px-5 py-4 text-sm font-bold text-red-200">{formStatus.error}</div>}
              <button type="submit" disabled={formStatus.loading} className="rounded-2xl bg-cyan-300 px-6 py-4 font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.85)] transition hover:scale-[1.02] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                {formStatus.loading ? "Odosielam..." : "Poslať dopyt"}
              </button>
            </form>
          </div>
        </div>
      </section>


      <section id="pravne" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">Právne informácie</div>
          <h2 className="text-4xl font-black sm:text-5xl">Jasné pravidlá prenájmu webu.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Lech-Web je digitálna služba na mesačné predplatné. Web vytvoríme bez vstupnej platby,
            zákazník má 14 dní skúšobnú dobu zdarma a po jej skončení sa služba fakturuje vopred.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Obchodné podmienky</div>
            <h3 className="mt-4 text-2xl font-black">Prenájom digitálnej služby</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>Prevádzkovateľom služby je Stavby1 s.r.o., Kúpeľná 4, 080 01 Prešov, IČO: 52533778, DIČ: 2121057224. Poskytovateľ nie je platiteľom DPH.</p>
              <p>Zdrojový kód, dizajnové šablóny, administračný systém a technické riešenie ostávajú vlastníctvom poskytovateľa.</p>
              <p>Klient počas aktívneho predplatného získava právo používať web vytvorený v systéme Lech-Web.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-6">
            <div className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">Platby a skúška</div>
            <h3 className="mt-4 text-2xl font-black">14 dní zdarma</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>Zákazník môže službu vyskúšať 14 dní bez poplatku. Ak počas skúšobnej doby službu ukončí, nič neplatí.</p>
              <p>Po skúšobnej dobe sa služba fakturuje vždy vopred, minimálne na jeden mesiac.</p>
              <p>Pri ročnej platbe môže byť poskytnutá zľava 10 %, pri dvojročnej platbe zľava 20 %, ak nie je dohodnuté inak.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-lime-300/20 bg-lime-300/10 p-6">
            <div className="text-sm font-black uppercase tracking-[0.25em] text-lime-300">Obsah a reklamácie</div>
            <h3 className="mt-4 text-2xl font-black">Klient vlastní svoj obsah</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>Klient vlastní dodané texty, fotografie, logo, produkty, cenníky a obchodné údaje.</p>
              <p>Reklamovať je možné technickú nefunkčnosť služby alebo rozpor s dohodnutým rozsahom.</p>
              <p>Za reklamáciu sa nepovažuje subjektívna zmena názoru po schválení webu alebo požiadavka na funkcie mimo balíka.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/45 p-6 text-sm leading-7 text-slate-400">
          <strong className="text-white">Ochrana osobných údajov:</strong> osobné údaje z kontaktného formulára sa používajú na vybavenie dopytu, komunikáciu, fakturáciu a plnenie zmluvy. Pri klientoch s e-shopom môže byť potrebné doplniť samostatné GDPR a cookies pravidlá podľa konkrétneho riešenia, analytiky, reklám a platobných/dopravných napojení.
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-slate-400 md:flex-row md:items-center">
          <div><div className="text-xl font-black text-white">Lech<span className="text-cyan-300">-</span><span className="text-fuchsia-300">Web</span></div><div className="mt-2">Luxusné neon AI weby a e-shopy na mesačné predplatné.</div></div>
          <div className="flex flex-wrap gap-5"><a href="#sablony" className="hover:text-cyan-300">Šablóny</a><a href="#ukazky" className="hover:text-cyan-300">Ukážky</a><a href="#funkcie" className="hover:text-cyan-300">Funkcie</a><a href="#cennik" className="hover:text-cyan-300">Cenník</a><a href="#pravne" className="hover:text-cyan-300">Podmienky</a><a href="#kontakt" className="hover:text-cyan-300">Kontakt</a></div>
        </div>
      </footer>
    </main>
  );
}
