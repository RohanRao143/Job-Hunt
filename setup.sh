#!/usr/bin/env bash
set -euo pipefail
npm install
npm run prepare-extension
echo "Ready. Load this folder as an unpacked extension from chrome://extensions."
