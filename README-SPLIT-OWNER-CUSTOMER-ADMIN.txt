LECH-WEB SPLIT OWNER CUSTOMER ADMIN

Tento balík opravuje logiku podľa tvojej poznámky.

Rozdelenie:
1. MÔJ ADMIN
   - tvoj admin
   - zákazníci
   - licencie
   - balíky
   - zapnúť/vypnúť zákazníka
   - predĺžiť licenciu

2. ADMIN ZÁKAZNÍKA
   - zákazníkov admin jeho webu
   - produkty
   - detail produktu
   - objednávky
   - kategórie
   - titulná strana
   - bannery
   - menu webu
   - odkazy
   - cookies
   - doklady
   - povinné polia
   - nastavenia jeho webu

Zo starého Web-main.zip sú použité hlavne tieto admin časti:
- Admin/products.html
- Admin/product-detail.html
- Admin/orders.html
- Admin/categories.html
- Admin/title-page.html
- Admin/banners.html
- Admin/menu-settings.html
- Admin/links.html
- Admin/cookies.html
- Admin/documents.html
- Admin/customer-fields.html

Súbor:
- src/App.jsx

Predpoklad:
Už máš nasadené endpointy:
- /api/admin/sites
- /api/admin/site-save
- /api/admin/orders
- /api/admin/orders/update
- /api/upload

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Split owner and customer admin"
git push

Po deploy:
1. otvor https://lech-web.pages.dev
2. Môj admin = tvoj licenčný admin
3. Admin zákazníka = admin jeho webu
