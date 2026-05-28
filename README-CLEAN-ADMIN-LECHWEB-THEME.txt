LECH-WEB CLEAN ADMIN + LECHWEB THEME

Oprava podľa požiadavky:
- admin je prehľadnejší ako Shoptet
- ľavé admin menu
- horná admin lišta
- samostatné sekcie:
  Základný prehľad
  Zákazníci
  Licencie
  Vzhľad a farby
  Bočný panel
  Produkty
  Texty a SEO

Dôležité:
- farba 'original' už NIE JE virivkyonline
- nový default je 'lechweb' = tmavý Lech-Web neon originál
- verejný e-shop renderer má čierny/cyan/fuchsia Lech-Web vzhľad

Súbory:
src/App.jsx
functions/site/[slug].js

Po nahratí:
npm run build
git add .
git commit -m "Clean admin and restore Lech-Web theme"
git push
