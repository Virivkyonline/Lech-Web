LECH-WEB RESEND ORDER EMAILS

Tento ZIP používa už existujúci Resend v Cloudflare.

Súbory:
- functions/api/email/test.js
- functions/api/orders/create.js

Používa Cloudflare premenné:
- RESEND_API_KEY
- RESEND_FROM
- CONTACT_TO voliteľne ako fallback

RESEND_FROM môže byť napríklad:
Lech-Web <lech-web@send.e-bazarik.sk>

Čo pribudne:
1. /api/email/test
   - pošle testovací email cez Resend

2. /api/orders/create
   - uloží objednávku do KV
   - pošle email majiteľovi e-shopu
   - pošle potvrdenie zákazníkovi, ak zadal email
   - výsledok emailov uloží do objednávky

Po nahratí:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add Resend order emails"
git push

Po deployi test:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/email/test" -Method GET

Ak máš ADMIN_PIN:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/email/test?pin=TVOJ_PIN" -Method GET

Správny výsledok:
success : True
resendStatus : 200
