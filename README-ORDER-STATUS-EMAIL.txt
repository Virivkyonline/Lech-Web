LECH-WEB ORDER STATUS EMAIL

Tento ZIP pridáva email zákazníkovi pri zmene stavu objednávky.

Súbor:
- functions/api/admin/orders/update.js

Čo robí:
- keď admin zmení stav objednávky
- a zákazník má email
- a stav sa reálne zmenil
- pošle zákazníkovi email cez Resend

Stavy:
- new
- processing
- done
- canceled

Používa existujúce Cloudflare premenné:
- RESEND_API_KEY
- RESEND_FROM

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add order status email"
git push

Test:
1. vytvor objednávku na verejnom webe
2. Admin zákazníka → Objednávky
3. vyber objednávku
4. zmeň stav na Vybavuje sa / Vybavená / Zrušená
5. zákazníkovi príde email

Poznámka:
Endpoint podporuje notifyCustomer:false, ak neskôr pridáme checkbox neposielať email.
