
const fs = require("fs");

const path = "src/App.jsx";

if (!fs.existsSync(path)) {
  console.error("CHYBA: src/App.jsx neexistuje.");
  process.exit(1);
}

let s = fs.readFileSync(path, "utf8");

const newBlock = `const colorPresets = [
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
];`;

if (s.includes("Kawasaki neon zelená") && s.includes("RGB svietiaca")) {
  console.log("OK: nové farby už v src/App.jsx sú.");
  process.exit(0);
}

const re = /const colorPresets = \[[\s\S]*?\];/;

if (!re.test(s)) {
  console.error("CHYBA: nenašiel som const colorPresets v src/App.jsx");
  console.error("Pošli výpis:");
  console.error('Select-String -Path "src\\App.jsx" -Pattern "colorPresets" -Context 0,20');
  process.exit(1);
}

s = s.replace(re, newBlock);
fs.writeFileSync(path, s, "utf8");

console.log("HOTOVO: doplnené farby do Admin zákazníka → Nastavenia webu.");
console.log("- Kawasaki neon zelená");
console.log("- Ostrá neon žltá");
console.log("- Ostrá neon červená");
console.log("- RGB svietiaca");
