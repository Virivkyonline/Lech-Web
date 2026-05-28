LECH-WEB CUSTOMER CRM AND MAIL

Toto využíva ďalšiu časť zo starého Web-main.zip:
- Admin/customers.html

Pridáva:
1. CRM zákazníkov z objednávok a dopytov
2. filtre zákazníkov
3. typ zákazníka:
   - Bežný
   - VIP
   - Veľkoobchod
   - Bez objednávky
4. hromadný info mail cez Resend

Súbory:
- functions/api/admin/customers.js
- functions/api/admin/customers/mail.js
- functions/site/[slug]/admin-zakaznici.js
- README-CUSTOMER-CRM-AND-MAIL.txt

API:
- /api/admin/customers
- /api/admin/customers/mail

Stránka:
- /site/<slug>/admin-zakaznici

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add customer CRM and info mail"
git push

Test:
1. vytvor objednávku alebo dopyt
2. otvor:
   https://lech-web.pages.dev/site/SKUSKA/admin-zakaznici
3. zadaj ADMIN_PIN
4. skús filter
5. skús hromadný info mail na vlastný testovací email

Používa:
- LECHWEB_KV
- RESEND_API_KEY
- RESEND_FROM
