LECH-WEB UPDATE: klientsky účet + jednoduchý builder webu

Obsah ZIP:
- src/App.jsx
- database/schema.sql
- functions/api/auth/register.js
- functions/api/auth/login.js
- functions/api/license/status.js
- functions/api/admin/license.js
- functions/api/admin/accounts.js
- functions/api/site/save.js
- functions/api/site/get.js
- functions/site/[slug].js
- functions/api/_utils.js

Čo pribudlo:
1. Zákazník sa vie registrovať alebo prihlásiť priamo na webe.
2. Po registrácii dostane 14-dňový trial.
3. Zákazník si vie vyplniť základné údaje a vytvoriť prvý verejný web.
4. Verejný web je dostupný na /site/URL-NAZOV.
5. Ak licencia nie je aktívna alebo vyprší, verejný web sa automaticky vypne.
6. Admin vie cez API predĺžiť alebo pozastaviť licenciu.

Cloudflare premenné:
- DB binding: DB
- AUTH_SECRET
- ADMIN_API_KEY
