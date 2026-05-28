LECH-WEB FIX MISSING ADMIN ORDERS ENDPOINT

Toto opravuje chybu:
https://lech-web.pages.dev/api/admin/orders vracia HTML

Dôvod:
V projekte chýbal súbor:
functions/api/admin/orders.js

Existoval iba priečinok:
functions/api/admin/orders/update.js

Cloudflare preto route /api/admin/orders nepoznal.

Súbor v ZIP:
functions/api/admin/orders.js

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Fix missing admin orders endpoint"
git push

Po deployi test:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/admin/orders" -Method GET

Správne má vrátiť:
success : True
endpoint : /api/admin/orders
count : 0 alebo viac
