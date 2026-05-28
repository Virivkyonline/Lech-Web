LECH-WEB CUSTOMER ADMIN INQUIRIES UI

Toto pridáva UI pre Dopyty zo starého Web/kontakt.html.

Súbor:
- functions/site/[slug]/admin-dopyty.js

Čo pribudne:
- zákaznícka stránka pre správu dopytov:
  /site/<slug>/admin-dopyty

Na stránke:
- zoznam dopytov
- detail dopytu
- stav dopytu
- interná poznámka
- uloženie cez /api/admin/inquiries/update

Používa existujúce API z predchádzajúceho ZIPu:
- /api/admin/inquiries
- /api/admin/inquiries/update
- /api/inquiries/create

Prístup:
- ak máš ADMIN_PIN, stránka si ho vypýta
- potom sa otvorí s ?pin=TVOJ_PIN

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add customer inquiries admin UI"
git push

Po deployi test:
https://lech-web.pages.dev/site/SKUSKA/admin-dopyty

Ďalší krok:
- pridať odkaz na Dopyty priamo do hlavnej React administrácie zákazníka
- doplniť odpoveď zákazníkovi cez Resend
