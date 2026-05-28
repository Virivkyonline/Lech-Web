LECH-WEB RESTORE ESHOP RENDERER KEEP ADMIN

Toto opravuje krok späť.

Zmenené:
- functions/site/[slug].js

Verejný web /site/slug sa znova renderuje ako e-shop šablóna:
- horné menu
- výhody hore
- ľavý sidebar
- kategórie
- kontakt
- vyhľadávanie
- typy a rady
- YouTube
- produkty v strede
- dlhý popis pod produktami
- footer

Farby sú Lech-Web tmavý neon:
- čierne pozadie
- cyan
- fuchsia
- tmavé karty

Dôležité:
Renderer je robustný. Aj keď starší uložený web ešte nemá site.eshop objekt, automaticky doplní default e-shop štruktúru, aby sa nezobrazila späť obyčajná prezentačná stránka.

Po nahratí:
npm run build
git add .
git commit -m "Restore eshop renderer with Lech-Web theme"
git push
