$ErrorActionPreference = "Stop"
Write-Host "Installing dependencies..."
npm install
Write-Host "Copying PDF.js into vendor/..."
npm run prepare-extension
Write-Host ""
Write-Host "Ready. Load this folder as an unpacked extension from chrome://extensions."
