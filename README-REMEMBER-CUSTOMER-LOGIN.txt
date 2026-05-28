LECH-WEB REMEMBER CUSTOMER LOGIN

Toto pridáva checkbox:
- Zapamätať email a heslo v tomto prehliadači

Fungovanie:
- po prihlásení zákazníka uloží email + heslo do localStorage
- po ďalšom otvorení adminu ich automaticky predvyplní
- keď checkbox vypneš, uložené údaje sa vymažú

Súbor:
- patch-remember-customer-login.cjs

Použitie:
cd $env:USERPROFILE\Desktop\lech-web
node patch-remember-customer-login.cjs
npm run build
git add .
git commit -m "Remember customer login"
git push

Po deployi:
1. otvor https://lech-web.pages.dev
2. Ctrl + F5
3. Admin zákazníka
4. zaškrtni Zapamätať email a heslo
5. prihlás sa
6. zatvor / obnov stránku
7. údaje majú zostať vyplnené
