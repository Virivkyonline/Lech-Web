LECH-WEB CUSTOMER DASHBOARD EDITOR

Tento ZIP mení hlavný React web:
src/App.jsx

Pridáva:
- registráciu zákazníka
- prihlásenie
- zobrazenie licencie/trialu
- editor webu
- editáciu stránok
- pridanie/zmazanie stránok
- editáciu sekcií
- sekcie typu text, services, gallery, contact
- obrázky cez URL
- logo URL
- farbu témy
- uloženie na /api/site/save
- otvorenie verejného webu /site/slug

Postup:
1. Nahraď src/App.jsx
2. npm run build
3. git add .
4. git commit -m "Add customer dashboard editor"
5. git push

Ďalší krok:
Cloudflare R2 upload obrázkov z počítača.
