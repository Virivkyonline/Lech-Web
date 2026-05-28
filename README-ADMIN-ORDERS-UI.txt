LECH-WEB ADMIN ORDERS UI STEP

Tento ZIP pridáva ďalší Shoptet-like základ:
- reálne objednávky v admin UI
- načítanie objednávok cez /api/admin/orders
- detail objednávky
- zmena stavu objednávky
- interná poznámka objednávky

Súbory:
- src/App.jsx
- functions/api/admin/orders/update.js

Predpoklad:
Predošlý krok s objednávkami už pridal:
- /api/orders/create
- /api/admin/orders

Po nahratí:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add admin orders UI"
git push

Po deploy:
1. otvor https://lech-web.pages.dev
2. Admin
3. Načítať admin
4. vyber zákazníka
5. klikni Objednávky
6. Načítať objednávky

Ďalší krok:
- email notifikácia o objednávke majiteľovi e-shopu
- export objednávok
- jednoduché stavy a filtre
