LECH-WEB FINAL REPAIR PATCH

Tento balík opravuje naraz:
1. nové farby v admin rolete
2. výrazné neónové obrysy na verejnom webe
3. getTheme is not defined
4. UTF-8 / rozbité slovenské znaky
5. checkbox Zapamätať email a heslo
6. kontrolu, či sú zmeny v dist builde

Použitie:

cd $env:USERPROFILE\Desktop\lech-web

node repair-admin-public-final.cjs

npm run build

Select-String -Path "dist\assets\*.js" -Pattern "Kawasaki|rgbGlow|Zapamätať"

git add .
git commit -m "Repair admin login colors and public neon theme"
git push

npx wrangler pages deploy dist --project-name=lech-web --branch=main

Potom:
1. otvor https://lech-web.pages.dev?x=999
2. Ctrl + F5
3. skontroluj Admin zákazníka -> Nastavenia webu -> Farba
4. otvor https://lech-web.pages.dev/site/virivkyonlinesk?x=999
5. Ctrl + F5

Ak patch vypíše CHYBA, neposielaj ďalšie náhodné zmeny, pošli presný výpis.
