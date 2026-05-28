
function h() {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-pin",
  };
}

function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: h() });
}

export function webMainDefaults() {
  return {
    source: "Web-main.zip",
    version: "lech-web-webmain-modules-foundation-v1",

    titlePage: {
      enabled: true,
      heroTitle: "",
      heroSubtitle: "",
      button1Text: "Pozrieť produkty",
      button1Url: "#produkty",
      button2Text: "Kontakt",
      button2Url: "#kontakt",
      heroImage: "",
      featuredCategories: [],
      topProducts: [],
      seoTitle: "",
      seoText: "",
      actionBlock: {
        enabled: true,
        title: "Akciová ponuka",
        text: "Vybrané produkty máme pripravené skladom alebo s rýchlym dodaním.",
        buttonText: "Zobraziť akcie",
        buttonUrl: "#produkty",
      },
      contactBlock: {
        enabled: true,
        title: "Potrebujete poradiť?",
        phone: "",
        email: "",
      },
    },

    banners: {
      enabled: true,
      main: [],
      carousel: [],
      advantages: [
        { title: "Darček zdarma", text: "Ku každej objednávke.", icon: "✦", visible: true },
        { title: "Rýchle dodanie", text: "Pre produkty skladom.", icon: "↻", visible: true },
        { title: "Na splátky", text: "Rýchlo a bezpečne.", icon: "✓", visible: true },
        { title: "Doprava zdarma", text: "Podľa podmienok predajcu.", icon: "⌂", visible: true },
      ],
    },

    menuSettings: {
      enabled: true,
      items: [
        { title: "Produkty", url: "#produkty", type: "internal", visible: true, mobile: true, submenu: [] },
        { title: "Akcie", url: "#produkty", type: "internal", visible: true, mobile: true, submenu: [] },
        { title: "Ako nakupovať", url: "#info", type: "internal", visible: true, mobile: true, submenu: [] },
        { title: "Kontakt", url: "#kontakt", type: "internal", visible: true, mobile: true, submenu: [] },
      ],
    },

    links: {
      enabled: true,
      items: [
        { title: "Ako nakupovať", url: "#info", type: "internal", visible: true, footer: true, menu: false, newWindow: false },
        { title: "Obchodné podmienky", url: "#", type: "document", visible: true, footer: true, menu: false, newWindow: false },
        { title: "Ochrana osobných údajov", url: "#", type: "document", visible: true, footer: true, menu: false, newWindow: false },
      ],
      quickLinks: [],
    },

    icons: {
      enabled: true,
      items: [
        { title: "Servis", code: "service", type: "svg", url: "", visible: true, usage: ["advantages"], description: "Ikona pre servis a podporu." },
        { title: "Doprava", code: "delivery", type: "svg", url: "", visible: true, usage: ["advantages"], description: "Ikona pre dopravu." },
      ],
    },

    cookies: {
      enabled: true,
      mode: "basic",
      acceptText: "Súhlasím",
      settingsText: "Nastavenia",
      bannerText: "Používame cookies, aby sme vám zabezpečili čo najlepší zážitok na webe.",
      position: "bottom",
      backgroundColor: "#020617",
      textColor: "#ffffff",
      buttonColor: "#67e8f9",
      privacyUrl: "#",
      cookiesUrl: "#",
      consentDays: 180,
      allowRejectAnalytics: true,
      allowRejectMarketing: true,
      showFooterSettingsLink: true,
    },

    categoriesAdvanced: {
      enabled: true,
      items: [
        { title: "Hlavná kategória", url: "#produkty", type: "normal", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
        { title: "Akčný tovar", url: "#produkty", type: "normal", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
        { title: "Novinky", url: "#produkty", type: "normal", customerVisible: true, menuVisible: true, googleIndex: true, productsEnabled: true },
      ],
    },

    productsAdvanced: {
      enabled: true,
      filters: {
        code: true,
        category: true,
        visibility: true,
        flags: true,
        availability: true,
      },
      flags: ["Akcia", "Novinka", "Tip", "Viac farieb skladom", "Výpredaj"],
      availability: ["Skladom", "Na objednávku", "Vypredané"],
      vatRates: ["0", "10", "20", "23"],
      galleryEnabled: true,
      relatedProductsEnabled: true,
      youtubeVideoEnabled: true,
    },

    customerFields: {
      enabled: true,
      billing: {
        name: "required",
        street: "optional",
        houseNumber: "optional",
        city: "optional",
        district: "hidden",
        zip: "optional",
        country: "optional",
      },
      company: {
        companyEnabled: "optional",
        companyName: "optional",
        ico: "optional",
        icDph: "optional",
        dic: "optional",
      },
      contact: {
        phone: "required",
        email: "required",
        birthDate: "hidden",
        marketingConsent: "optional",
      },
      delivery: {
        enabled: "optional",
        name: "optional",
        street: "optional",
        houseNumber: "optional",
        city: "optional",
        zip: "optional",
        country: "optional",
      },
    },

    documents: {
      enabled: true,
      orders: {
        prefix: "OBJ",
        numberLength: 10,
        startFrom: 1,
        syncWithOrder: true,
      },
      proformaInvoices: {
        prefix: "ZF",
        numberLength: 10,
        startFrom: 1,
        depositPercent: 50,
        syncVsWithOrder: true,
      },
      invoices: {
        prefix: "FA",
        numberLength: 10,
        startFrom: 1,
        showWarranty: true,
        showQrCode: true,
      },
      creditNotes: {
        prefix: "DBP",
        numberLength: 10,
        startFrom: 1,
        autoRestockItems: false,
      },
      deliveryNotes: {
        prefix: "DL",
        numberLength: 10,
        startFrom: 1,
        printBarcodes: false,
      },
      export: {
        isdoc: false,
        moneyS3: false,
      },
      visual: {
        logo: "",
        stamp: "",
      },
    },

    adminDashboard: {
      enabled: true,
      cards: ["Dnešné predaje", "Dnešné objednávky", "Týždeň", "Mesiac", "Rok"],
      recentOrders: true,
      charts: true,
    },
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: h() });
}

export async function onRequestGet() {
  return j({
    success: true,
    mode: "webmain-default-modules",
    modules: webMainDefaults(),
  });
}
