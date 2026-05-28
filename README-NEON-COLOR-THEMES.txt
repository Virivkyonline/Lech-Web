LECH-WEB ADD NEON COLOR THEMES

Toto dopĺňa témy vzhľadu webu:

- Kawasaki neon zelená
- Ostrá neon žltá
- Ostrá neon červená
- RGB svietiaca

Súbory:
- src/theme-options.js
- patch-neon-themes.cjs
- README-NEON-COLOR-THEMES.txt

Ako použiť:
1. Rozbaľ ZIP do koreňa projektu lech-web.
2. Spusti patch:

node patch-neon-themes.cjs

3. Potom:

npm run build
git add .
git commit -m "Add neon color themes"
git push

Čo patch spraví:
- doplní nové možnosti do colorPresets v src/App.jsx
- doplní getTheme() do functions/site/[slug].js
- pridá CSS premenné:
  --a hlavná farba
  --a2 druhá farba
  --dark tmavé pozadie
  --panel panely
  --glow svietenie
- RGB téma pridá animovaný hue efekt

Po nasadení:
1. Otvor Lech-Web admin.
2. Admin zákazníka.
3. Nastavenia webu.
4. Farba.
5. Vyber:
   - Kawasaki neon zelená
   - Ostrá neon žltá
   - Ostrá neon červená
   - RGB svietiaca
6. Uložiť.
7. Otvor verejný web.

Ak patch povie WARN pattern not found:
Pošli mi výpis, upravím patch podľa aktuálneho App.jsx / rendereru.
