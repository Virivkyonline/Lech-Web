LECH-WEB SITE SAVE HARD FIX

Konzola ukazuje, ze frontend vola:
POST /api/site/save

Tento ZIP pridava presne tento endpoint:
functions/api/site/save.js

Endpoint nikdy nevracia tvrdu 500 chybu, ale JSON s detailom.

Po nahrati a deployi otvor:
https://lech-web.pages.dev/api/site/save

Ak vidis JSON:
endpoint: /api/site/save
kvBindingFound: true
kvWriteOk: true

tak endpoint je nasadeny a ukladanie ma ist.

Subory:
functions/api/site/save.js
functions/api/builder/save.js
functions/api/builder.js
functions/site/[slug].js
