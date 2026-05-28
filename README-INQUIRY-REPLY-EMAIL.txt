LECH-WEB INQUIRY REPLY EMAIL

Toto pridáva odpoveď na dopyt priamo z adminu zákazníka.

Súbory:
- functions/api/admin/inquiries/reply.js
- functions/site/[slug]/admin-dopyty.js

Čo pribudne:
1. V /site/<slug>/admin-dopyty:
   - textarea Odpovedať zákazníkovi
   - tlačidlo Poslať odpoveď emailom
   - história odpovedí

2. API:
   /api/admin/inquiries/reply

3. Po odoslaní:
   - pošle email zákazníkovi cez Resend
   - nastaví stav dopytu na contacted
   - uloží odpoveď do inquiry.replies
   - uloží záznam do inquiry.history

Používa:
- RESEND_API_KEY
- RESEND_FROM

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add inquiry reply email"
git push

Test:
1. vytvor dopyt cez /site/SLUG/kontakt
2. otvor /site/SLUG/admin-dopyty
3. vyber dopyt
4. napíš odpoveď
5. klikni Poslať odpoveď emailom
