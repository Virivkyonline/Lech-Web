
export const LECH_WEB_THEMES = {
  lechweb: {
    name: "Lech-Web neon originál",
    accent: "#67e8f9",
    accent2: "#e879f9",
    glow: "rgba(103,232,249,.65)",
    dark: "#03040a",
    panel: "#0f172a",
  },

  cyan: {
    name: "Cyan business",
    accent: "#67e8f9",
    accent2: "#22d3ee",
    glow: "rgba(34,211,238,.65)",
    dark: "#03040a",
    panel: "#0f172a",
  },

  fuchsia: {
    name: "Fuchsia premium",
    accent: "#e879f9",
    accent2: "#67e8f9",
    glow: "rgba(232,121,249,.65)",
    dark: "#05030a",
    panel: "#14091f",
  },

  violet: {
    name: "Violet luxury",
    accent: "#a78bfa",
    accent2: "#e879f9",
    glow: "rgba(167,139,250,.65)",
    dark: "#070512",
    panel: "#141026",
  },

  emerald: {
    name: "Emerald fresh",
    accent: "#34d399",
    accent2: "#67e8f9",
    glow: "rgba(52,211,153,.65)",
    dark: "#03110c",
    panel: "#082018",
  },

  orange: {
    name: "Orange action",
    accent: "#fb923c",
    accent2: "#facc15",
    glow: "rgba(251,146,60,.65)",
    dark: "#130902",
    panel: "#211006",
  },

  kawasaki: {
    name: "Kawasaki neon zelená",
    accent: "#39ff14",
    accent2: "#b6ff00",
    glow: "rgba(57,255,20,.78)",
    dark: "#020800",
    panel: "#061a03",
  },

  acidYellow: {
    name: "Ostrá neon žltá",
    accent: "#fff200",
    accent2: "#39ff14",
    glow: "rgba(255,242,0,.76)",
    dark: "#0b0b00",
    panel: "#1a1800",
  },

  sharpRed: {
    name: "Ostrá neon červená",
    accent: "#ff073a",
    accent2: "#ff7a00",
    glow: "rgba(255,7,58,.72)",
    dark: "#110004",
    panel: "#210008",
  },

  rgbGlow: {
    name: "RGB svietiaca",
    accent: "#00f5ff",
    accent2: "#ff00f5",
    accent3: "#39ff14",
    glow: "rgba(0,245,255,.74)",
    dark: "#02020a",
    panel: "#09091a",
    rgb: true,
  },
};

export function getLechTheme(themeId) {
  return LECH_WEB_THEMES[themeId] || LECH_WEB_THEMES.lechweb;
}

export function themeOptions() {
  return Object.entries(LECH_WEB_THEMES).map(([id, t]) => [id, t.name]);
}
