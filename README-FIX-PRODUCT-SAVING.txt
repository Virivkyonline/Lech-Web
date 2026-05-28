LECH-WEB FIX PRODUCT SAVING

Toto opravuje problém:
- produkt sa v admin UI zmení
- klikneš Uložiť
- po refreshi produkt zmizne alebo ostane starý

Príčina:
Starší save endpointy nemuseli ukladať celé:
- website.eshop.products
- website.products
- website.modules
- website.theme

Súbory:
- functions/api/admin/site-save.js
- functions/api/site/save.js

Čo opravuje:
1. /api/admin/site-save
   - používa tvoj ADMIN_PIN
   - ukladá zákazníkov web
   - ukladá produkty
   - ukladá moduly
   - ukladá theme
   - ukladá site:<slug>
   - ukladá user:<email>

2. /api/site/save
   - zákaznícke uloženie
   - tiež ukladá produkty a moduly kompletne

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Fix product saving"
git push

Test endpointov:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/admin/site-save" -Method GET
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/site/save" -Method GET

Správne má byť:
mode : robust-product-saving
kvWriteOk : True

Po deployi test v UI:
1. Môj admin
2. Načítať
3. vyber zákazníka
4. Admin zákazníka
5. Produkty
6. uprav názov alebo cenu produktu
7. Uložiť
8. Ctrl+F5
9. vyber zákazníka znova
10. produkt musí ostať uložený
