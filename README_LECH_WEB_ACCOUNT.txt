Lech-Web account/licencia update

Obsah ZIPu:
- src/App.jsx: doplnená sekcia Účet a licencia
- functions/api/auth/register.js: registrácia zákazníka so 14-dňovou trial licenciou
- functions/api/auth/login.js: jednoduché prihlásenie
- functions/api/license/status.js: kontrola platnosti licencie
- functions/api/admin/license.js: admin aktivácia/pozastavenie licencie
- database/schema.sql: návrh Cloudflare D1 tabuľky

Cloudflare premenné neskôr:
- AUTH_SECRET
- ADMIN_API_KEY
- DB binding pre D1 databázu s názvom DB
