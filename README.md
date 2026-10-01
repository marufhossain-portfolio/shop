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

## Order setup (Google Sheet + Email)

1. [Google Sheets](https://sheets.new) e ekta sheet banao → **Extensions → Apps Script**
2. `code.gs` er content paste koro
3. `SHEET_ID` update koro (Sheet URL er `/d/<ID>/` part)
4. `NOTIFY_EMAIL` update koro (order alert jabe jekhane)
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Pawa **Web app URL** ta `app.js` → `CONFIG.appsScriptUrl`-e bosao

Ekhon customer order dile: order Google Sheet-e save hobe + tumake email jabe.

## GitHub Pages host

1. GitHub-e ekta repo banao (e.g. `shop`)
2. Files push koro
3. Repo **Settings → Pages → Source: main branch / root**
4. URL pabe: `https://<username>.github.io/shop/`
