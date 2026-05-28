LECH-WEB FINAL ADMIN PLATFORM

Toto je konsolidovaný final základ.

Obsah ZIP:
- src/App.jsx
- functions/api/admin/sites.js
- functions/api/admin/site-save.js
- functions/site/[slug].js
- README-FINAL-ADMIN-PLATFORM.txt

Čo tento balík rieši:
1. Admin layout ako vlastný Lech-Web systém
   - horná lišta
   - ľavé hlavné menu
   - Dashboard
   - Objednávky
   - Produkty
   - Kategórie
   - Zákazníci
   - Vzhľad a obsah
   - Marketing / SEO
   - Nastavenia
   - Licencie

2. Neobsahuje zbytočnosti typu:
   - Shoptet Pay
   - Shoptet Capital
   - Shoptet Balíky
   - ich marketplace
   - ich interné moduly

3. Admin API:
   - /api/admin/sites
   - /api/admin/site-save

4. Verejný /site/slug renderer:
   - e-shop rozloženie
   - horné menu
   - výhody hore
   - ľavý sidebar
   - kategórie
   - kontakt
   - vyhľadávanie
   - typy a rady
   - YouTube
   - produkty v strede
   - dlhý SEO text pod produktami
   - footer

5. Farby:
   - default Lech-Web tmavý neon
   - cyan/fuchsia/čierne pozadie
   - nie vírivkyonline

Postup:
1. Rozbaľ ZIP.
2. Skopíruj priečinky src a functions do:
   C:\Users\admin\Desktop\lech-web
3. Povoľ prepísanie.
4. PowerShell:
   cd $env:USERPROFILE\Desktop\lech-web
   npm run build
   git add .
   git commit -m "Add final Lech-Web admin platform"
   git push

Kontrola po deploy:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/admin/sites" -Method GET

Ak používaš ADMIN_PIN:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/admin/sites?pin=TVOJ_PIN" -Method GET
