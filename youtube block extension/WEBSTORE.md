# Chrome Web Store prep

## 1) Package the extension

From this folder, run:

`powershell -ExecutionPolicy Bypass -File .\package-extension.ps1`

This creates:

`youtube-home-blocker-v1.0.0.zip`

Upload that ZIP in the Chrome Web Store developer dashboard.

## 2) Create your listing

Prepare these before submitting:

- Extension name: `YouTube Home Blocker`
- Short description (up to 132 chars)
- Full description (what it does, how 60-second hold works)
- At least 1 screenshot (1280x800 or 640x400)
- Store icon (128x128 PNG)

## 3) Privacy answers for this extension

For the store privacy questionnaire, this extension:

- Uses `chrome.storage.local` only (stores block on/off state)
- Runs only on `https://www.youtube.com/*`
- Does not collect personal data
- Does not send data to external servers
- Does not use analytics or ads

## 4) Publish flow

- Go to Chrome Web Store Developer Dashboard
- Pay one-time developer registration fee (if first time)
- Create new item and upload ZIP
- Fill listing + privacy form
- Submit for review

## 5) Updating later

When you change code:

- Increase `version` in `manifest.json`
- Re-run `package-extension.ps1`
- Upload new ZIP as an update
