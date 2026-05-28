LECH-WEB CONTACT INQUIRIES STEP

Toto využíva ďalšiu časť zo starého Web-main.zip:
- Web/kontakt.html

Pridáva:
1. Verejná kontaktná stránka:
   /site/<slug>/kontakt

2. API:
   /api/inquiries/create
   - uloží dopyt do KV
   - pošle e-mail majiteľovi webu cez Resend
   - pošle potvrdenie zákazníkovi

3. Admin API:
   /api/admin/inquiries
   - zoznam dopytov

4. Admin update API:
   /api/admin/inquiries/update
   - zmena stavu dopytu
   - interná poznámka

Súbory:
- functions/site/[slug]/kontakt.js
- functions/api/inquiries/create.js
- functions/api/admin/inquiries.js
- functions/api/admin/inquiries/update.js
- README-CONTACT-INQUIRIES.txt

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add contact inquiries from old web"
git push

Po deployi test:
1. Otvor:
https://lech-web.pages.dev/site/SKUSKA/kontakt

2. Odošli formulár.

3. Test admin API:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/admin/inquiries" -Method GET

Ďalší krok:
- pridať sekciu Dopyty do zákazníckeho adminu
- prepojiť kontakt tlačidlo z verejného webu na /kontakt
