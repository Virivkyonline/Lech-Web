LECH-WEB CUSTOMER ADMIN LOGIN

Tento krok dopĺňa správne oddelenie prístupov:

1. MÔJ ADMIN
- používa ADMIN_PIN
- načítava všetkých zákazníkov
- rieši licencie, balíky, vypnutie/zapnutie webu

2. ADMIN ZÁKAZNÍKA
- zákazník sa prihlási svojím emailom a heslom
- po prihlásení vidí svoj web
- upravuje svoje produkty, objednávky, bannery, titulnú stranu, menu, cookies, doklady
- ukladá svoj web bez ADMIN_PIN

Súbor:
- src/App.jsx

Predpoklad:
- /api/auth/login už funguje
- /api/site/save už funguje
- /api/upload už funguje
- /api/orders/create a /api/admin/orders už fungujú

Nasadenie:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add customer admin login"
git push

Po deploy:
1. otvor https://lech-web.pages.dev
2. klikni Admin zákazníka
3. zadaj email a heslo zákazníka
4. uprav jeho web
5. klikni Uložiť

Dôležité:
Tvoj admin a zákazníkov admin sú už vizuálne aj logicky oddelené.
