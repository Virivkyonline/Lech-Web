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
} from "lucide-react";

const templates = [
  {
    name: "Stavebná firma",
    tag: "Najlepšie pre remeslá",
    text: "Pre stavebné firmy, kontajnery, garáže, montáže, strechy, ploty a technické služby.",
    forWho: "Stavebníci, montážnici, predajcovia kontajnerov",
    includes: ["Služby", "Realizácie", "Dopytový formulár"],
  },
  {
    name: "E-shop oblečenie",
    tag: "Móda a kolekcie",
    text: "Luxusný predajný vzhľad pre oblečenie, doplnky, kolekcie, butik alebo prémiovú značku.",
    forWho: "Butiky, módne značky, predajcovia oblečenia",
    includes: ["Kolekcie", "Produkty", "Lookbook"],
  },
  {
    name: "Autoservis",
    tag: "Rýchle dopyty",
    text: "Silný web pre autoservis, pneuservis, detailing, požičovňu alebo predaj áut.",
    forWho: "Autoservisy, pneuservisy, detailing centrá",
    includes: ["Služby", "Cenník", "Objednávka termínu"],
  },
  {
    name: "Beauty salón",
    tag: "Luxusný vzhľad",
    text: "Moderný neónový web pre kozmetiku, nechty, kaderníctvo, masáže a estetické služby.",
    forWho: "Salóny krásy, kozmetika, wellness",
    includes: ["Služby", "Cenník", "Rezervácia"],
  },
  {
    name: "Reštaurácia",
    tag: "Chuť predáva",
    text: "Predajný web pre reštaurácie, kaviarne, bistrá, donášku a denné menu.",
    forWho: "Gastro prevádzky, kaviarne, donáška",
    includes: ["Menu", "Rezervácia", "Otváracie hodiny"],
  },
  {
    name: "Ubytovanie",
    tag: "Rezervácie",
    text: "Atmosférický web pre apartmány, penzióny, chaty, hotely a krátkodobé ubytovanie.",
    forWho: "Apartmány, penzióny, chaty, hotely",
    includes: ["Izby", "Galéria", "Rezervácia"],
  },
  {
    name: "Reality",
    tag: "Prémiový predaj",
    text: "Web pre realitných maklérov, developerov, prenájmy a predaj nehnuteľností.",
    forWho: "Makléri, developeri, realitné kancelárie",
    includes: ["Ponuky", "Detail nehnuteľnosti", "Kontakt"],
  },
  {
    name: "Fitness",
    tag: "Energia a výkon",
    text: "Web pre trénerov, výživových poradcov, wellness, fyzio a športové programy.",
    forWho: "Tréneri, fyzio, wellness, fitness centrá",
    includes: ["Programy", "Cenník", "Konzultácia"],
  },
  {
    name: "Technika",
    tag: "Čistý predaj",
    text: "Moderný web alebo e-shop pre elektroniku, náradie, príslušenstvo a technické produkty.",
    forWho: "Technické obchody, predajcovia náradia",
    includes: ["Produkty", "Parametre", "Dopyt"],
  },
  {
    name: "Landing page",
    tag: "Na reklamu",
    text: "Jedna silná predajná stránka pre Facebook, Google reklamu, kampaň alebo špeciálnu ponuku.",
    forWho: "Reklamy, kampane, rýchly predaj",
    includes: ["Hero", "Výhody", "Formulár"],
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
            <a href="#cennik" className="inline-flex items-center justify-center rounded-full border border-fuchsia-300/50 bg-fuchsia-500/10 px-8 py-4 font-black text-fuchsia-100 backdrop-blur transition hover:border-fuchsia-300 hover:bg-fuchsia-400 hover:text-black hover:shadow-[0_0_45px_rgba(217,70,239,0.8)]">
              Pozrieť predplatné
            </a>
          </div>

          <div className="mt-11 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-3xl border border-cyan-300/25 bg-white/5 p-4 shadow-[0_0_25px_rgba(34,211,238,0.12)]"><div className="text-3xl font-black text-cyan-300">0 €</div><div className="text-xs text-slate-400">vytvorenie webu</div></div>
            <div className="rounded-3xl border border-fuchsia-300/25 bg-white/5 p-4 shadow-[0_0_25px_rgba(217,70,239,0.12)]"><div className="text-3xl font-black text-fuchsia-300">39 €</div><div className="text-xs text-slate-400">od / mesiac</div></div>
            <div className="rounded-3xl border border-lime-300/25 bg-white/5 p-4 shadow-[0_0_25px_rgba(190,242,100,0.1)]"><div className="text-3xl font-black text-lime-300">WOW</div><div className="text-xs text-slate-400">prvý dojem</div></div>
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

      <section
  id="sablony"
  className="relative z-10 mx-auto max-w-7xl px-5 py-20"
>
  <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
    <div>
      <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">
        Neon šablóny
      </div>

      <h2 className="text-4xl font-black sm:text-5xl">
        10 šablón, ktoré predávajú skôr, než zákazník začne čítať.
      </h2>
    </div>

    <div className="max-w-md">
      <p className="text-slate-300">
        Každá šablóna je pripravená ako predajný systém: prvý dojem,
        dôvera, jasná ponuka a tlačidlo na akciu. Žiadna lacná kópia.
      </p>
      <a
        href="#demo-stavebna"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300 hover:text-black hover:shadow-[0_0_35px_rgba(34,211,238,0.75)]"
      >
        Pozrieť prvú reálnu ukážku
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  </div>

  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {templates.map((item, index) => (
      <div
        key={item.name}
        className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 transition hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-[0_0_45px_rgba(34,211,238,0.25)]"
      >
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/25" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-fuchsia-400/10 blur-3xl transition group-hover:bg-fuchsia-400/25" />

        <div className="relative">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-black shadow-[0_0_25px_rgba(34,211,238,0.65)]">
              {item.tag}
            </div>

            <div className="text-sm font-black text-fuchsia-300">
              {String(index + 1).padStart(2, "0")}
            </div>
          </div>

          <h3 className="text-2xl font-black">{item.name}</h3>

          <p className="mt-4 min-h-20 text-sm leading-7 text-slate-300">
            {item.text}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Pre koho
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {item.forWho}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.includes.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-xs font-bold text-fuchsia-100"
              >
                {feature}
              </span>
            ))}
          </div>

          <a
            href={
              index === 0 ? "#demo-stavebna" :
              index === 1 ? "#demo-moda" :
              index === 2 ? "#demo-autoservis" :
              index === 3 ? "#demo-wellness" :
              index === 4 ? "#demo-gastro" :
              index === 5 ? "#demo-ubytovanie" :
              index === 6 ? "#demo-reality" :
              index === 7 ? "#demo-fitness" :
              index === 8 ? "#demo-technika" :
              index === 9 ? "#demo-landing" :
              "#kontakt"
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.75)]"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(index) ? "Pozrieť ukážku" : "Chcem túto šablónu"}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* DEMO ŠABLÓNA: STAVEBNÁ FIRMA */}
      <section id="demo-stavebna" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
            Demo šablóna
          </div>

          <h2 className="text-4xl font-black sm:text-5xl">
            Ukážka: Stavebná firma, kontajnery a technické služby
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Takto môže vyzerať klientsky web vytvorený v systéme Lech-Web.
            Silný prvý dojem, jasná ponuka a rýchly dopytový formulár.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2.8rem] border border-cyan-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(34,211,238,0.18)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#050816] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="text-2xl font-black">
                  STAVEX<span className="text-cyan-300">PRO</span>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  stavebné práce / kontajnery / montáže
                </div>
              </div>

              <a
                href="#kontakt"
                className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.75)] transition hover:scale-105 hover:bg-white"
              >
                Nezáväzný dopyt
              </a>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-black text-lime-200">
                  Moderná stavebná firma bez nudného webu
                </div>

                <h3 className="text-4xl font-black leading-tight sm:text-5xl">
                  Kontajnery, montáže a stavebné riešenia, ktoré pôsobia
                  profesionálne na prvý pohľad.
                </h3>

                <p className="mt-6 text-lg leading-8 text-slate-300">
                  Prémiová šablóna pre firmy, ktoré potrebujú ukázať služby,
                  realizácie, dôveryhodnosť a získať dopyt od zákazníka čo najrýchlejšie.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#kontakt"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-400 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(217,70,239,0.75)] transition hover:scale-105 hover:bg-white"
                  >
                    Chcem podobný web
                    <ArrowRight className="h-5 w-5" />
                  </a>

                  <a
                    href="#sablony"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-cyan-300 hover:text-cyan-200"
                  >
                    Späť na šablóny
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
                    Hlavné služby
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      "Predaj kontajnerov",
                      "Montážne práce",
                      "Stavebné úpravy",
                      "Garáže a prístrešky",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { number: "120+", label: "realizácií" },
                    { number: "48h", label: "rýchly dopyt" },
                    { number: "EU", label: "pôsobnosť" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"
                    >
                      <div className="text-3xl font-black text-cyan-300">
                        {item.number}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">
                    Čo šablóna obsahuje
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Hero sekcia",
                      "Služby",
                      "Realizácie",
                      "Referencie",
                      "Kontakt",
                      "Dopytový formulár",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* DEMO ŠABLÓNA: WELLNESS / VÍRIVKY */}
      <section id="demo-wellness" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">
            Demo šablóna
          </div>

          <h2 className="text-4xl font-black sm:text-5xl">
            Ukážka: Wellness, vírivky, spa a relax služby
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Druhá ukážka šablóny pre prémiový predaj relaxu, víriviek, wellness pobytov, spa služieb a beauty prevádzok.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2.8rem] border border-fuchsia-300/25 bg-black/50 p-5 shadow-[0_0_80px_rgba(217,70,239,0.2)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#070512] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="text-2xl font-black">
                  LUX<span className="text-fuchsia-300">SPA</span><span className="text-cyan-300">ZONE</span>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  wellness / vírivky / spa / relax
                </div>
              </div>

              <a
                href="#kontakt"
                className="rounded-full bg-fuchsia-400 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(217,70,239,0.8)] transition hover:scale-105 hover:bg-white"
              >
                Chcem wellness web
              </a>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
                  Luxusný relax sa musí predávať obrazom a emóciou
                </div>

                <h3 className="text-4xl font-black leading-tight sm:text-5xl">
                  Prémiový web pre vírivky, spa a wellness služby, ktorý pôsobí draho už pri prvom pohľade.
                </h3>

                <p className="mt-6 text-lg leading-8 text-slate-300">
                  Táto šablóna je postavená pre firmy, ktoré predávajú zážitok: vírivky, relax, krásu, pobyty a služby, kde rozhoduje atmosféra, dôvera a túžba objednať sa.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#kontakt"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.8)] transition hover:scale-105 hover:bg-white"
                  >
                    Chcem podobný web
                    <ArrowRight className="h-5 w-5" />
                  </a>

                  <a
                    href="#sablony"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-fuchsia-300 hover:text-fuchsia-200"
                  >
                    Späť na šablóny
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">
                    Hlavné bloky webu
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      "Predaj víriviek",
                      "Wellness služby",
                      "Galéria atmosféry",
                      "Rezervácia / dopyt",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { number: "WOW", label: "prvý dojem" },
                    { number: "24/7", label: "dopyty" },
                    { number: "AI", label: "texty" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"
                    >
                      <div className="text-3xl font-black text-fuchsia-300">
                        {item.number}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
                    Čo šablóna obsahuje
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Luxusný hero",
                      "Služby",
                      "Cenník",
                      "Galéria",
                      "Recenzie",
                      "Formulár",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="demo-autoservis" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-red-300">
            Demo šablóna
          </div>

          <h2 className="text-4xl font-black sm:text-5xl">
            Ukážka: Autoservis, pneuservis a detailing
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Predajná šablóna pre autoservis, ktorá hneď ukáže služby,
            dôveryhodnosť, rýchly kontakt a objednanie termínu.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2.8rem] border border-red-400/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(248,113,113,0.16)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/18 blur-3xl" />

          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#050816] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="text-2xl font-black">
                  AUTO<span className="text-red-300">MAX</span>
                  <span className="text-cyan-300"> PRO</span>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  autoservis / pneuservis / detailing
                </div>
              </div>

              <a
                href="#kontakt"
                className="rounded-full bg-red-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(248,113,113,0.75)] transition hover:scale-105 hover:bg-white"
              >
                Objednať termín
              </a>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-red-300/30 bg-red-300/10 px-4 py-2 text-sm font-black text-red-200">
                  Servis, ktorý pôsobí rýchlo a profesionálne
                </div>

                <h3 className="text-4xl font-black leading-tight sm:text-5xl">
                  Web pre autoservis, ktorý z návštevníka spraví objednávku.
                </h3>

                <p className="mt-6 text-lg leading-8 text-slate-300">
                  Šablóna postavená na rýchlom kontakte, jasnom cenníku,
                  dôvere a okamžitom objednaní termínu z mobilu.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#kontakt"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-red-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(248,113,113,0.75)] transition hover:scale-105 hover:bg-white"
                  >
                    Chcem autoservis web
                    <ArrowRight className="h-5 w-5" />
                  </a>

                  <a
                    href="#sablony"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-red-300 hover:text-red-200"
                  >
                    Späť na šablóny
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-red-300/20 bg-red-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-red-300">
                    Hlavné služby
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      "Autoservis",
                      "Pneuservis",
                      "Výmena oleja",
                      "Detailing a čistenie",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { number: "24h", label: "rýchly termín" },
                    { number: "4.9★", label: "recenzie" },
                    { number: "SOS", label: "urgent kontakt" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"
                    >
                      <div className="text-3xl font-black text-red-300">
                        {item.number}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
                    Čo šablóna obsahuje
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Rýchly kontakt",
                      "Služby",
                      "Cenník",
                      "Objednávka termínu",
                      "Recenzie",
                      "Mapa",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* DEMO ŠABLÓNA: E-SHOP OBLEČENIE */}
      <section id="demo-moda" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-pink-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Luxusný e-shop s oblečením</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Prémiová módna šablóna pre kolekcie, butik, doplnky a značku, ktorá musí vyzerať draho hneď na prvej obrazovke.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-pink-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(244,114,182,0.18)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-400/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#070611] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div><div className="text-2xl font-black">NOIR<span className="text-pink-300">MODE</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">premium fashion / collections / e-shop</div></div>
              <a href="#kontakt" className="rounded-full bg-pink-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(244,114,182,0.75)] transition hover:scale-105 hover:bg-white">Chcem módny e-shop</a>
            </div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-pink-300/30 bg-pink-300/10 px-4 py-2 text-sm font-black text-pink-200">Nová kolekcia musí vyzerať ako značka</div>
                <h3 className="text-4xl font-black leading-tight sm:text-5xl">E-shop, ktorý predáva štýl, nie iba produkty.</h3>
                <p className="mt-6 text-lg leading-8 text-slate-300">Veľký hero blok, produktové kolekcie, lookbook, zľavová výzva a kontaktné prvky pripravené na okamžitý predaj.</p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(244,114,182,0.75)] transition hover:scale-105 hover:bg-white">Chcem túto šablónu <ArrowRight className="h-5 w-5" /></a>
                  <a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-pink-300 hover:text-pink-200">Späť na šablóny</a>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-pink-300/20 bg-pink-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-pink-300">Sekcie e-shopu</div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {["Hero kolekcia", "Top produkty", "Lookbook", "Zľavový banner"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[{number:"NEW",label:"kolekcia"},{number:"24/7",label:"online predaj"},{number:"VIP",label:"značka"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-pink-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}
                </div>
                <div className="rounded-[2rem] border border-violet-300/20 bg-violet-300/10 p-6">
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-violet-300">Obsahuje</div>
                  <div className="mt-5 flex flex-wrap gap-2">{["Kolekcie", "Produkty", "Veľkosti", "Lookbook", "CTA", "Formulár"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO ŠABLÓNA: GASTRO */}
      <section id="demo-gastro" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-orange-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Reštaurácia, bistro a donáška</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Gastro šablóna, ktorá predáva chuť cez prvý vizuálny dojem, menu, rezervácie a jasnú výzvu na objednávku.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-orange-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(251,146,60,0.16)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-400/22 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-500/16 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#0b0604] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div><div className="text-2xl font-black">FLAME<span className="text-orange-300">BISTRO</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">restaurant / daily menu / delivery</div></div>
              <a href="#kontakt" className="rounded-full bg-orange-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(251,146,60,0.75)] transition hover:scale-105 hover:bg-white">Rezervovať stôl</a>
            </div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-orange-300/30 bg-orange-300/10 px-4 py-2 text-sm font-black text-orange-200">Chuť musí byť vidieť ešte pred menu</div>
                <h3 className="text-4xl font-black leading-tight sm:text-5xl">Web pre gastro, ktorý núti zákazníka objednať.</h3>
                <p className="mt-6 text-lg leading-8 text-slate-300">Denné menu, fotky jedál, rezervácia, donáška, otváracie hodiny a rýchly kontakt v jednom predajnom rozložení.</p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row"><a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(251,146,60,0.75)] transition hover:scale-105 hover:bg-white">Chcem gastro web <ArrowRight className="h-5 w-5" /></a><a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-orange-300 hover:text-orange-200">Späť na šablóny</a></div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-orange-300/20 bg-orange-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-orange-300">Gastro funkcie</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Denné menu", "Rezervácie", "Donáška", "Otváracie hodiny"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}</div></div>
                <div className="grid gap-4 sm:grid-cols-3">{[{number:"MENU",label:"online"},{number:"5★",label:"recenzie"},{number:"FAST",label:"objednávka"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-orange-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}</div>
                <div className="rounded-[2rem] border border-red-300/20 bg-red-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-red-300">Obsahuje</div><div className="mt-5 flex flex-wrap gap-2">{["Jedlá", "Galéria", "Mapa", "Rezervácia", "Donáška", "Kontakt"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO ŠABLÓNA: UBYTOVANIE */}
      <section id="demo-ubytovanie" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-sky-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Apartmán, penzión a chata</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Rezervačná šablóna pre ubytovanie, ktorá buduje dôveru cez atmosféru, vybavenie, galériu a rýchly dopyt.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-sky-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(125,211,252,0.16)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-300/22 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/14 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#041018] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="text-2xl font-black">VILLA<span className="text-sky-300">NOVA</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">apartments / stay / booking</div></div><a href="#kontakt" className="rounded-full bg-sky-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(125,211,252,0.75)] transition hover:scale-105 hover:bg-white">Overiť dostupnosť</a></div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div><div className="mb-5 inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-sm font-black text-sky-200">Atmosféra predáva rezerváciu</div><h3 className="text-4xl font-black leading-tight sm:text-5xl">Ubytovací web, ktorý vytvorí chuť prísť.</h3><p className="mt-6 text-lg leading-8 text-slate-300">Veľký vizuálny úvod, typy izieb, vybavenie, okolie, recenzie a rýchly dopyt na termín pobytu.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(125,211,252,0.75)] transition hover:scale-105 hover:bg-white">Chcem web pre ubytovanie <ArrowRight className="h-5 w-5" /></a><a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-sky-300 hover:text-sky-200">Späť na šablóny</a></div></div>
              <div className="grid gap-4"><div className="rounded-[2rem] border border-sky-300/20 bg-sky-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-sky-300">Rezervačné bloky</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Izby", "Galéria", "Vybavenie", "Dostupnosť"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}</div></div><div className="grid gap-4 sm:grid-cols-3">{[{number:"4.9",label:"hodnotenie"},{number:"24h",label:"odpoveď"},{number:"TOP",label:"lokalita"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-sky-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}</div><div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-emerald-300">Obsahuje</div><div className="mt-5 flex flex-wrap gap-2">{["Hero", "Izby", "Okolie", "Recenzie", "Mapa", "Dopyt"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div></div></div>
            </div>
          </div>
        </div>
      </section>


      {/* DEMO ŠABLÓNA: REALITY */}
      <section id="demo-reality" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-violet-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Reality, maklér a developer</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Prémiová realitná šablóna pre ponuky, predaj, prenájom a zber dopytov od záujemcov.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-violet-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(167,139,250,0.16)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-300/22 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/14 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#09051a] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="text-2xl font-black">ESTATE<span className="text-violet-300">LUX</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">real estate / premium listings</div></div><a href="#kontakt" className="rounded-full bg-violet-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(167,139,250,0.75)] transition hover:scale-105 hover:bg-white">Mám záujem o predaj</a></div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div><div className="mb-5 inline-flex rounded-full border border-violet-300/30 bg-violet-300/10 px-4 py-2 text-sm font-black text-violet-200">Nehnuteľnosť musí vyzerať hodnotne</div><h3 className="text-4xl font-black leading-tight sm:text-5xl">Realitný web, ktorý predáva dôveru, lokalitu a hodnotu.</h3><p className="mt-6 text-lg leading-8 text-slate-300">Ponuky nehnuteľností, detail bytu alebo domu, galéria, maklér, kontakt a formulár pre klienta, ktorý chce predať alebo kúpiť.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(167,139,250,0.75)] transition hover:scale-105 hover:bg-white">Chcem realitný web <ArrowRight className="h-5 w-5" /></a><a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-violet-300 hover:text-violet-200">Späť na šablóny</a></div></div>
              <div className="grid gap-4"><div className="rounded-[2rem] border border-violet-300/20 bg-violet-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-violet-300">Realitné bloky</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Ponuky", "Detail nehnuteľnosti", "Galéria", "Kontakt makléra"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}</div></div><div className="grid gap-4 sm:grid-cols-3">{[{number:"360°",label:"dojem"},{number:"TOP",label:"ponuky"},{number:"LEAD",label:"dopyt"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-violet-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}</div><div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">Obsahuje</div><div className="mt-5 flex flex-wrap gap-2">{["Filter", "Detail", "Mapa", "Galéria", "Maklér", "Dopyt"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO ŠABLÓNA: FITNESS */}
      <section id="demo-fitness" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-lime-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Fitness, tréner a wellness program</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Energetická šablóna pre trénerov, fyzio, výživové programy, wellness a športové služby.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-lime-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(190,242,100,0.14)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-300/18 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/16 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#07120a] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="text-2xl font-black">BODY<span className="text-lime-300">EDGE</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">fitness / coaching / results</div></div><a href="#kontakt" className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(190,242,100,0.75)] transition hover:scale-105 hover:bg-white">Rezervovať konzultáciu</a></div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div><div className="mb-5 inline-flex rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-black text-lime-200">Energia, výsledok, akcia</div><h3 className="text-4xl font-black leading-tight sm:text-5xl">Web pre trénera, ktorý predáva zmenu postavy aj disciplínu.</h3><p className="mt-6 text-lg leading-8 text-slate-300">Programy, balíky, výsledky klientov, konzultácie a jasná cesta od záujmu k objednávke.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(190,242,100,0.75)] transition hover:scale-105 hover:bg-white">Chcem fitness web <ArrowRight className="h-5 w-5" /></a><a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-lime-300 hover:text-lime-200">Späť na šablóny</a></div></div>
              <div className="grid gap-4"><div className="rounded-[2rem] border border-lime-300/20 bg-lime-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-lime-300">Fitness sekcie</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Programy", "Premeny", "Cenník", "Konzultácia"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}</div></div><div className="grid gap-4 sm:grid-cols-3">{[{number:"8t",label:"program"},{number:"1:1",label:"coach"},{number:"GO",label:"akcia"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-lime-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}</div><div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-emerald-300">Obsahuje</div><div className="mt-5 flex flex-wrap gap-2">{["Balíky", "Výsledky", "Recenzie", "Rezervácia", "Blog", "Dopyt"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO ŠABLÓNA: TECHNIKA */}
      <section id="demo-technika" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-cyan-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Technika, náradie a elektronika</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Čistá technická šablóna pre produkty, parametre, kategórie a rýchly dopyt alebo objednávku.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-cyan-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(34,211,238,0.16)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/22 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/16 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#06101f] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="text-2xl font-black">TECH<span className="text-cyan-300">FORCE</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">tools / electronics / pro gear</div></div><a href="#kontakt" className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.75)] transition hover:scale-105 hover:bg-white">Vyžiadať ponuku</a></div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div><div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">Produkty musia byť jasné</div><h3 className="text-4xl font-black leading-tight sm:text-5xl">Technický web, kde zákazník rýchlo pochopí produkt aj výhodu.</h3><p className="mt-6 text-lg leading-8 text-slate-300">Kategórie, technické parametre, skladovosť, výhody, CTA a profesionálny dojem pre technické firmy.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.75)] transition hover:scale-105 hover:bg-white">Chcem technický web <ArrowRight className="h-5 w-5" /></a><a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-cyan-300 hover:text-cyan-200">Späť na šablóny</a></div></div>
              <div className="grid gap-4"><div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">Produktové bloky</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Kategórie", "Parametre", "Výhody", "Dopyt"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}</div></div><div className="grid gap-4 sm:grid-cols-3">{[{number:"PRO",label:"vzhľad"},{number:"SKU",label:"produkty"},{number:"B2B",label:"dopyty"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-cyan-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}</div><div className="rounded-[2rem] border border-blue-300/20 bg-blue-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-blue-300">Obsahuje</div><div className="mt-5 flex flex-wrap gap-2">{["Produkty", "Kategórie", "Parametre", "FAQ", "Dopyt", "Kontakt"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO ŠABLÓNA: LANDING PAGE */}
      <section id="demo-landing" className="relative z-10 mx-auto max-w-7xl px-5 py-20 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-fuchsia-300">Demo šablóna</div>
          <h2 className="text-4xl font-black sm:text-5xl">Ukážka: Predajná landing page pre reklamu</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Jedna ostrá stránka pre kampaň, službu, akciu alebo produkt, ktorá tlačí zákazníka na vyplnenie formulára.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-fuchsia-300/25 bg-black/50 p-5 shadow-[0_0_70px_rgba(217,70,239,0.18)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-300/22 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#13051a] p-6 md:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="text-2xl font-black">CLICK<span className="text-fuchsia-300">BOOST</span></div><div className="text-xs uppercase tracking-[0.3em] text-slate-400">campaign / lead page / conversion</div></div><a href="#kontakt" className="rounded-full bg-fuchsia-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(217,70,239,0.75)] transition hover:scale-105 hover:bg-white">Spustiť kampaň</a></div>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div><div className="mb-5 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm font-black text-fuchsia-200">Jedna stránka, jeden cieľ</div><h3 className="text-4xl font-black leading-tight sm:text-5xl">Landing page, ktorá nenechá zákazníka blúdiť.</h3><p className="mt-6 text-lg leading-8 text-slate-300">Silný nadpis, dôkaz, výhody, cena, FAQ a formulár. Ideálne pre Google Ads, Facebook reklamu a rýchle testovanie ponuky.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><a href="#kontakt" className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-300 px-7 py-4 font-black text-black shadow-[0_0_45px_rgba(217,70,239,0.75)] transition hover:scale-105 hover:bg-white">Chcem landing page <ArrowRight className="h-5 w-5" /></a><a href="#sablony" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white hover:border-fuchsia-300 hover:text-fuchsia-200">Späť na šablóny</a></div></div>
              <div className="grid gap-4"><div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">Konverzné bloky</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Hero", "Výhody", "Dôkaz", "Formulár"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm font-bold">{item}</div>)}</div></div><div className="grid gap-4 sm:grid-cols-3">{[{number:"CTA",label:"akcia"},{number:"ADS",label:"reklama"},{number:"LEAD",label:"formulár"}].map((item) => <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 text-center"><div className="text-3xl font-black text-fuchsia-300">{item.number}</div><div className="mt-1 text-xs text-slate-400">{item.label}</div></div>)}</div><div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6"><div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">Obsahuje</div><div className="mt-5 flex flex-wrap gap-2">{["Nadpis", "CTA", "Recenzie", "Cena", "FAQ", "Formulár"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>)}</div></div></div>
            </div>
          </div>
        </div>
      </section>
      <section id="cennik" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-lime-300">Cenník</div>
          <h2 className="text-4xl font-black sm:text-5xl">Moderný web bez vstupnej platby.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Web vytvoríme bez vstupnej platby a zákazník má 14 dní skúšobnú dobu
zadarmo. Po skúšobnej dobe sa služba fakturuje vždy vopred minimálne
na 1 mesiac. Pri ročnej platbe získate zľavu 10 %, pri dvojročnej
platbe zľavu 20 %. Zdrojový kód, systém a šablóny ostávajú súčasťou
služby Lech-Web.</p>
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
    <div className="text-lg font-black text-lime-300">
      14 dní zadarmo
    </div>
    <p className="mt-3 text-sm leading-7 text-slate-300">
      Zákazník si môže službu vyskúšať 14 dní bez poplatku. Ak službu
      počas skúšobnej doby ukončí, nič neplatí.
    </p>
  </div>

  <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
    <div className="text-lg font-black text-cyan-300">
      Platba vopred
    </div>
    <p className="mt-3 text-sm leading-7 text-slate-300">
      Po skúšobnej dobe sa predplatné fakturuje vždy vopred, minimálne
      na 1 mesiac. Ročná platba má zľavu 10 %, dvojročná platba 20 %.
    </p>
  </div>

  <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
    <div className="text-lg font-black text-fuchsia-300">
      Prenájom služby
    </div>
    <p className="mt-3 text-sm leading-7 text-slate-300">
      Web je poskytovaný ako digitálna služba Lech-Web. Zdrojový kód,
      šablóny, systém a technické riešenie ostávajú vlastníctvom
      poskytovateľa.
    </p>
  </div>
</div>

<div className="mt-5 rounded-3xl border border-white/10 bg-black/40 p-5 text-sm leading-7 text-slate-400">
  Klient vlastní svoj dodaný obsah: texty, fotografie, logo, produkty
  a obchodné údaje. Reklamovať je možné technickú nefunkčnosť služby
  alebo rozpor s objednaným rozsahom. Za reklamáciu sa nepovažuje
  subjektívna zmena názoru po schválení webu, zmena obchodného zámeru
  klienta alebo požiadavka na funkcie mimo dohodnutého balíka.
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

      <footer className="relative z-10 border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-slate-400 md:flex-row md:items-center">
          <div><div className="text-xl font-black text-white">Lech<span className="text-cyan-300">-</span><span className="text-fuchsia-300">Web</span></div><div className="mt-2">Luxusné neon AI weby a e-shopy na mesačné predplatné.</div></div>
          <div className="flex flex-wrap gap-5"><a href="#sablony" className="hover:text-cyan-300">Šablóny</a><a href="#funkcie" className="hover:text-cyan-300">Funkcie</a><a href="#cennik" className="hover:text-cyan-300">Cenník</a><a href="#kontakt" className="hover:text-cyan-300">Kontakt</a></div>
        </div>
      </footer>
    </main>
  );
}