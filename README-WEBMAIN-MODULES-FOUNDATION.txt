LECH-WEB WEBMAIN MODULES FOUNDATION

Tento ZIP berie použiteľné veci zo starého Web-main.zip a dáva ich do Lech-Web ako modulárny základ.

Pridané moduly podľa starého webu:
- Titulná strana
- Bannery
- Carousel základ
- Konkurenčné výhody
- Menu webu
- Odkazy
- Ikony
- Cookies
- Rozšírené kategórie
- Rozšírený produktový model
- Povinné polia zákazníka
- Doklady
- Admin dashboard nastavenia

Súbory:
- functions/api/admin/modules/defaults.js
- functions/api/admin/modules/save.js
- functions/site/[slug].js
- README-WEBMAIN-MODULES-FOUNDATION.txt

Čo funguje hneď po nasadení:
1. /api/admin/modules/defaults
   vráti default štruktúru modulov zo starého Web-main.

2. /api/admin/modules/save
   uloží moduly do konkrétneho webu.

3. Verejný /site/slug renderer vie používať:
   - menuSettings.items
   - banners.advantages
   - categoriesAdvanced.items
   - links.items v pätičke
   - cookies
   - titlePage hero/SEO/action block
   - produktové príznaky a dostupnosť
   - DO KOŠÍKA a objednávky

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add Web-main reusable modules foundation"
git push

Test default modulov:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/admin/modules/defaults" -Method GET

Ďalší krok:
Doplníme do admin UI nové sekcie:
- Bannery
- Titulná strana
- Menu webu
- Odkazy
- Ikony
- Cookies
- Doklady
- Povinné polia
- Rozšírený produkt detail
