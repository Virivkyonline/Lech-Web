LECH-WEB E-SHOP TEMPLATE SHOPTET STYLE

Toto je e-shop šablóna podľa návrhu:
- horné menu
- ľavý sidebar
- kategórie produktov
- kontakt
- vyhľadávanie
- typy a rady
- YouTube odkazy
- vlastné bloky vľavo
- produkty v strede
- akčný tovar / novinky
- dlhý popis pod produktami
- pätička / footer

Súbory:
functions/api/site/save.js
functions/api/builder/save.js
functions/api/builder.js
functions/site/[slug].js

Po nahratí:
git add .
git commit -m "Add shoptet style eshop template"
git push

PowerShell kontrola:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/site/save" -Method GET

Ak vráti JSON mode: eshop-shoptet-style, endpoint je nasadený.

Dôležité:
Toto pripravuje backend a verejné renderovanie. Editor produktov vo fronte treba doplniť ako ďalší krok.
