# খামারি এগ্রো — E-commerce Landing Page (Bangla)

Khamari Agro er moto **same-to-same** single-product e-commerce landing page.
Mobile-first, GitHub Pages-e host kora jay, order Google Sheet + Email-e jay.

## Structure

- `index.html` — puro landing page (hero, details, crops, features, reviews, gallery, order form, FAQ, footer)
- `style.css` — green agro theme
- `app.js` — order logic + **CONFIG** (product, price, delivery, phone, Apps Script URL)
- `code.gs` — Google Apps Script (order → Google Sheet + email alert)

## Product/business change korte chaile

`app.js` er upore `CONFIG` object ta change koro:

```js
const CONFIG = {
  productName: "খামারি স্মার্ট নিরানি",
  price: 950,
  deliveryCharge: 150,
  phone: "01577800857",
  email: "hello@khamariagro.com",
  appsScriptUrl: "PASTE_WEB_APP_URL",
};
```

Tarpor `index.html` e product name/price/description text gula nijer moto edit koro.

## Images

Placeholder (`<div class="ph">`) use kora hoyeche. Real image dit e `.ph` div er jaygay `<img>` bosao, ba `.ph` e CSS background diye image set koro.

## Order setup (Email notification)

Customer order dile **tomake email-e** order jabe (`marufhossain2707@gmail.com`).

### Option 1 — FormSubmit (default, sabcheye sohoj)

Kono deploy lagbe na. Eta ekhon thekei kaj kore:

1. Site-e ekbar test order dao
2. FormSubmit theke tomake ekta **activation email** ashbe → ekbar click koro ("Confirm form")
3. Bas! Er por prottek order tomake email-e ashbe

> `app.js` → `CONFIG.email` = `marufhossain2707@gmail.com` (set kora ache)

### Option 2 — Google Apps Script (Google Sheet record + email)

Sheet-e order save + email chaile:

1. [Google Sheets](https://sheets.new) → **Extensions → Apps Script**
2. `code.gs` paste koro → `SHEET_ID` + `NOTIFY_EMAIL` update
3. **Deploy → Web app** (Execute as: Me, Access: Anyone)
4. Pawa URL ta `app.js` → `CONFIG.appsScriptUrl`-e bosao

`appsScriptUrl` set korle Apps Script use hobe; na korle FormSubmit-e fallback hoy.

## GitHub Pages host

1. GitHub-e ekta repo banao (e.g. `shop`)
2. Files push koro
3. Repo **Settings → Pages → Source: main branch / root**
4. URL pabe: `https://<username>.github.io/shop/`
