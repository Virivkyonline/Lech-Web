# Lech-Web účet, licencia a časové obmedzenie

Tento ZIP pridáva:

- registráciu zákazníka,
- prihlásenie,
- 14 dní trial zdarma,
- uloženie požiadavky na vytvorenie webu,
- kontrolu aktívnej licencie,
- admin API na aktiváciu alebo blokovanie licencie.

## Súbory

- `src/App.jsx` – upravený web s novou sekciou Klientsky účet.
- `functions/api/auth/register.js` – registrácia.
- `functions/api/auth/login.js` – prihlásenie.
- `functions/api/auth/me.js` – kontrola prihlásenia.
- `functions/api/auth/logout.js` – odhlásenie.
- `functions/api/sites/create.js` – zákazník uloží požiadavku na web.
- `functions/api/admin/activate-license.js` – manuálna aktivácia/blokovanie licencie.
- `functions/api/admin/users.js` – zoznam používateľov pre admina.
- `functions/_utils/auth.js` – spoločné funkcie pre heslá, cookies a tokeny.
- `schema.sql` – D1 databázová schéma.

## Cloudflare premenné

V Cloudflare Pages nastav:

- `JWT_SECRET` – dlhý náhodný tajný text.
- `ADMIN_SECRET` – dlhý náhodný admin kľúč.
- `DB` – D1 database binding.

## Aktivácia licencie

Admin aktivácia sa robí POST requestom na:

`/api/admin/activate-license`

Header:

`X-Admin-Secret: tvoj_ADMIN_SECRET`

Body:

```json
{
  "email": "zakaznik@email.sk",
  "months": 1,
  "status": "active"
}
```

Blokovanie pri nezaplatení:

```json
{
  "email": "zakaznik@email.sk",
  "status": "blocked"
}
```

Poznámka: aby to bežalo, musíš vytvoriť Cloudflare D1 databázu a nahrať `schema.sql`.
