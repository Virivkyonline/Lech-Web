LECH-WEB FIX ADMIN COLOR OPTIONS

Problém:
Verejný web už pozná nové neon farby, ale v Admin zákazníka -> Nastavenia webu ich nevidno v rolete.

Tento ZIP opravuje:
src/App.jsx -> const colorPresets

Pridá:
- Kawasaki neon zelená
- Ostrá neon žltá
- Ostrá neon červená
- RGB svietiaca

Použitie:
cd $env:USERPROFILE\Desktop\lech-web
node patch-admin-color-options.cjs
npm run build
git add .
git commit -m "Add neon colors to admin select"
git push

Po deployi:
1. otvor https://lech-web.pages.dev
2. Ctrl + F5
3. Admin zákazníka
4. Nastavenia webu
5. Farba

Musia tam byť nové 4 farby.
