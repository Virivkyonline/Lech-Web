LECH-WEB REGISTRATION DEBUG FINAL

Tento balík robí 2 veci:
1. endpointy už nevrátia tvrdú 500 chybu, ale čitateľnú JSON správu
2. ak chýba KV binding, presne vypíšu, že chýba LECHWEB_KV

Nahraď súbory:
functions/api/auth/register.js
functions/api/auth/login.js
functions/api/health.js
functions/api/admin/licenses.js

Po deployi otvor:
https://lech-web.pages.dev/api/health

Ak uvidíš:
kvBindingFound: false

tak musíš v Cloudflare nastaviť:
Settings -> Bindings -> Add -> KV namespace
Variable name: LECHWEB_KV

Bez toho licencia a registrácia nemôže fungovať.
