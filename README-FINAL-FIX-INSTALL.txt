LECH-WEB FINAL FIX

Opravené súbory:
- src/App.jsx
- functions/site/[slug].js

Opravy:
1. Admin zákazníka: Farba obsahuje nové možnosti:
   - Kawasaki neon zelená
   - Ostrá neon žltá
   - Ostrá neon červená
   - RGB svietiaca

2. Admin zákazníka: Prihlásenie má checkbox:
   - Zapamätať email a heslo
   Ukladá sa iba lokálne v prehliadači cez localStorage.

3. Verejný web /site/<slug>:
   - odstránené rozbité UTF-8 texty
   - pevný header text/html; charset=UTF-8
   - getTheme je priamo v rendereri
   - silné neónové obrysy a glow efekty pre všetky nové farby
   - košík a odoslanie objednávky ostáva funkčné

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web

# nahraď súbory z tohto ZIPu
npm run build

# kontrola, že build obsahuje zmeny
Select-String -Path "dist\assets\*.js" -Pattern "Kawasaki|rgbGlow|Zapamätať"

# commit + deploy
git add src/App.jsx functions/site/[slug].js README-FINAL-FIX-INSTALL.txt
git commit -m "Final fix admin login colors and public renderer"
git push
npx wrangler pages deploy dist --project-name=lech-web --branch=main

Po deployi:
1. https://lech-web.pages.dev?x=999  -> Ctrl+F5
2. Admin zákazníka -> Prihlásenie: musí byť checkbox
3. Admin zákazníka -> Nastavenia webu -> Farba: musia byť nové farby
4. https://lech-web.pages.dev/site/virivkyonlinesk?x=999 -> Ctrl+F5

Ak bude 1101:
npx wrangler pages deployment tail --project-name=lech-web
