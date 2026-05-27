LECH-WEB CUSTOMER SITE EDITOR BACKEND

Toto je ďalší krok k systému ako Shoptet/Webnode:
- zákazník si nevypĺňa len jednu stránku
- vie mať viac stránok
- vie mať sekcie
- vie mať obrázky cez URL
- vie mať logo
- vie meniť farbu témy
- verejný web renderer to reálne zobrazí

Súbory:
functions/api/site/save.js
functions/api/builder/save.js
functions/api/builder.js
functions/site/[slug].js
functions/site/[slug]/[page].js

Dôležité:
Toto zatiaľ rieši texty, stránky, sekcie a obrázky cez URL.
Reálne nahrávanie obrázkov z počítača bude ďalší krok a potrebuje Cloudflare R2 bucket.

Test POST príklad:
{
  "email": "zakaznik@email.sk",
  "slug": "moja-firma",
  "companyName": "Moja firma",
  "theme": { "accent": "cyan", "logo": "https://..." },
  "pages": [
    {
      "id": "home",
      "title": "Domov",
      "slug": "",
      "headline": "Moderná firma",
      "description": "Predajný popis",
      "heroImage": "https://...",
      "sections": [
        { "type": "services", "title": "Služby", "items": ["Služba 1", "Služba 2"] },
        { "type": "gallery", "title": "Galéria", "images": [{"url":"https://...","title":"Realizácia"}] },
        { "type": "contact", "title": "Kontakt" }
      ]
    },
    {
      "id": "onas",
      "title": "O nás",
      "slug": "o-nas",
      "headline": "O nás",
      "description": "Text o firme",
      "sections": [{ "type": "text", "title": "História", "text": "..." }]
    }
  ]
}
