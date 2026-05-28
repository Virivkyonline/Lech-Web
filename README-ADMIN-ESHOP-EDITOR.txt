LECH-WEB ADMIN + ESHOP EDITOR

Toto dopĺňa:
1. Admin API:
   - functions/api/admin/sites.js
   - functions/api/admin/site-save.js

2. Admin panel a e-shop editor vo fronte:
   - src/App.jsx

3. Upravené farby rendereru:
   - original tyrkysová ako tvoj pôvodný web
   - turquoise
   - neon cyan/fuchsia
   - pink
   - violet
   - orange
   - lime

4. E-shop zákazník/admin vie nastavovať:
   - názov firmy
   - slug
   - logo URL
   - hero obrázok URL
   - farbu témy
   - kategórie vľavo
   - výhody hore
   - typy a rady
   - YouTube odkazy
   - produkty
   - dlhý popis pod produktami

Dôležité:
Ak máš nastavený ADMIN_PIN v Cloudflare, v admine ho musíš zadať.
Ak ADMIN_PIN nemáš, admin endpoint pustí bez PINu.

Po nahratí:
npm run build
git add .
git commit -m "Add admin eshop editor"
git push

Test:
https://lech-web.pages.dev/api/admin/sites?pin=TVOJ_PIN
