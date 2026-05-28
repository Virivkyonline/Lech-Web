LECH-WEB R2 UPLOAD STEP

Tento ZIP pridáva upload obrázkov do Cloudflare R2.

Súbory:
- functions/api/upload.js
- functions/uploads/[[path]].js

Čo to robí:
1. /api/upload
   - POST multipart/form-data
   - pole: file
   - voliteľné pole: folder
   - uloží obrázok do R2 bucketu LECHWEB_UPLOADS
   - vráti publicUrl napr. https://lech-web.pages.dev/uploads/images/2026/05/...

2. /uploads/...
   - číta obrázky z R2
   - obrázky sú použiteľné v produktoch, logu, hero obrázku atď.

Po nahratí ZIPu:
cd $env:USERPROFILE\Desktop\lech-web
npm run build
git add .
git commit -m "Add R2 image upload"
git push

Po deployi test:
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/upload" -Method GET

Správne má vrátiť:
r2BindingFound : True
r2WriteOk      : True

Test uploadu cez PowerShell:
$form = @{
  folder = "test"
  file = Get-Item "C:\Users\admin\Desktop\test.jpg"
}
Invoke-RestMethod -Uri "https://lech-web.pages.dev/api/upload" -Method POST -Form $form

Dôležité:
Najprv musí byť v Cloudflare Pages Bindings:
R2 bucket
Variable name: LECHWEB_UPLOADS
Value: lech-web-uploads
