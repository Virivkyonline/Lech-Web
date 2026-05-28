LECH-WEB SOFTEN NEON GLOW

Toto zjemní neónové efekty na verejnom webe:
- menej silné žiarenie
- jemnejšie obrysy
- menej agresívny text shadow
- stále ostane moderný neon vzhľad

Použitie:

cd $env:USERPROFILE\Desktop\lech-web
node soften-neon-glow.cjs
npm run build
git add functions/site/[slug].js
git commit -m "Soften neon glow"
git push
npx wrangler pages deploy dist --project-name=lech-web --branch=main

Potom otvor:
https://lech-web.pages.dev/site/virivkyonlinesk?x=555
Ctrl + F5
