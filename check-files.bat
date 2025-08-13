@echo off
echo 🌲 AutoList Canada - Basic File Verification
echo =========================================
echo.

echo 📂 Checking required pages...
set MISSING_FILES=0

for %%f in (index.html dashboard.html listings.html templates.html import.html analytics.html ai-tools.html how-it-works.html faq.html settings.html terms.html privacy.html) do (
  if not exist %%f (
    echo   ❌ Missing: %%f
    set /a MISSING_FILES+=1
  ) else (
    echo   ✅ Found: %%f
  )
)

echo.
echo 🌐 Checking i18n files...
if not exist i18n\en.json (
  echo   ❌ Missing: i18n\en.json
  set /a MISSING_FILES+=1
) else (
  echo   ✅ Found: i18n\en.json
)

if not exist i18n\fr.json (
  echo   ❌ Missing: i18n\fr.json
  set /a MISSING_FILES+=1
) else (
  echo   ✅ Found: i18n\fr.json
)

echo.
echo 🧩 Checking extension files...
for %%f in (extension\manifest.json extension\popup.html extension\popup.js extension\content.js extension\background.js) do (
  if not exist %%f (
    echo   ❌ Missing: %%f
    set /a MISSING_FILES+=1
  ) else (
    echo   ✅ Found: %%f
  )
)

echo.
echo 🔄 Checking service layer...
for %%f in (scripts\services\marketplace-service.js scripts\services\services-loader.js scripts\services\ebay-service.js scripts\services\amazon-service.js scripts\services\etsy-service.js) do (
  if not exist %%f (
    echo   ❌ Missing: %%f
    set /a MISSING_FILES+=1
  ) else (
    echo   ✅ Found: %%f
  )
)

echo.
echo 🚀 Checking deployment configs...
for %%f in (vercel.json netlify.toml) do (
  if not exist %%f (
    echo   ❌ Missing: %%f
    set /a MISSING_FILES+=1
  ) else (
    echo   ✅ Found: %%f
  )
)

echo.
echo 📊 Audit Summary
echo =============
if %MISSING_FILES% EQU 0 (
  echo ✅ All required files are present!
  echo.
  echo 🎉 The project appears ready for deployment and PR creation.
  echo    Next steps:
  echo    1. Commit your changes
  echo    2. Deploy to Vercel
  echo    3. Create a pull request from revamp/full-replication-autolist to main
) else (
  echo ❌ Missing %MISSING_FILES% required files. Fix issues before creating PR.
)

echo.
echo Press any key to exit...
pause > nul
