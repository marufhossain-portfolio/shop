/**
 * ============================================================
 *  Shop backend — Orders + Config + Image upload
 * ============================================================
 *  - Orders sheet  → order save (customer order)
 *  - Config sheet  → product + site settings (admin edit)
 *  - Drive folder "ShopImages" → admin uploaded images
 *
 *  RE-DEPLOY korle: Deploy → Manage deployments → Edit → New version → Deploy
 */

const SHEET_ID = "1zvSKSXUKET8jwcBc3DLZHoexwt-gzloOkYEHW60-j08";
const ORDERS_SHEET = "Orders";
const CONFIG_SHEET = "Config";
const NOTIFY_EMAIL = "marufhossain2707@gmail.com";
const ADMIN_PASSWORD = "admin123"; // ← ei password change koro (admin login)

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  if (p.action === "getConfig") return json(getConfig());
  if (p.action === "checkPassword") return json({ ok: p.p === ADMIN_PASSWORD });
  return json({ ok: true, msg: "Shop backend active" });
}

function doPost(e) {
  let data = {};
  try { data = JSON.parse(e.postData.contents); }
  catch (_) { data = parseParams(e.postData.contents); }
  const action = data.action || "";
  try {
    if (action === "order") return json(handleOrder(data));
    if (action === "saveConfig") return json(handleSaveConfig(data));
    if (action === "uploadImage") return json(handleUploadImage(data));
    return json({ ok: false, error: "unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/* ---------------- ORDERS ---------------- */
function handleOrder(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(ORDERS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(ORDERS_SHEET);
    sh.appendRow(["Timestamp", "Name", "Phone", "Address", "District", "Upazila", "Note", "Product", "Qty", "Unit Price", "Delivery", "Total"]);
    sh.setFrozenRows(1);
    sh.getRange("A1:L1").setFontWeight("bold");
  }
  sh.appendRow([
    new Date(), data.name || "", data.phone || "", data.address || "",
    data.district || "", data.upazila || "", data.note || "",
    data.product || "", data.qty || 1, data.price || 0,
    data.delivery || 0, data.total || 0
  ]);
  const subject = "🛒 নতুন অর্ডার: " + (data.name || "-") + " (" + (data.phone || "-") + ")";
  const body = [
    "নতুন অর্ডার এসেছে:", "",
    "নাম: " + (data.name || ""),
    "মোবাইল: " + (data.phone || ""),
    "ঠিকানা: " + (data.address || "") + ", " + (data.upazila || "") + ", " + (data.district || ""),
    "পণ্য: " + (data.product || ""),
    "পরিমাণ: " + (data.qty || 1),
    "মোট: ৳ " + (data.total || 0),
    "",
    "শীট: " + ss.getUrl()
  ].join("\n");
  try { GmailApp.sendEmail(NOTIFY_EMAIL, subject, body); } catch (_) {}
  return { ok: true };
}

/* ---------------- CONFIG ---------------- */
const CONFIG_KEYS = ["productName", "price", "deliveryCharge", "phone", "email", "description", "heroImage", "galleryImages"];

function getConfigSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(CONFIG_SHEET);
  if (!sh) {
    sh = ss.insertSheet(CONFIG_SHEET);
    sh.appendRow(["Key", "Value"]);
    CONFIG_KEYS.forEach((k) => sh.appendRow([k, ""]));
  }
  return sh;
}

function getConfig() {
  const sh = getConfigSheet();
  const vals = sh.getDataRange().getValues();
  const out = {};
  vals.forEach((row) => { if (row[0]) out[String(row[0])] = row[1] == null ? "" : String(row[1]); });
  return { ok: true, config: out };
}

function handleSaveConfig(data) {
  if ((data.password || "") !== ADMIN_PASSWORD) return { ok: false, error: "Wrong password" };
  const sh = getConfigSheet();
  const vals = sh.getDataRange().getValues();
  const map = {};
  vals.forEach((row, i) => { if (row[0]) map[String(row[0])] = i + 1; });
  CONFIG_KEYS.forEach((k) => {
    if (data.config && data.config[k] !== undefined) {
      const val = String(data.config[k] === null ? "" : data.config[k]);
      if (map[k]) sh.getRange(map[k], 2).setValue(val);
      else sh.appendRow([k, val]);
    }
  });
  return { ok: true };
}

/* ---------------- IMAGE UPLOAD ---------------- */
function handleUploadImage(data) {
  if ((data.password || "") !== ADMIN_PASSWORD) return { ok: false, error: "Wrong password" };
  const mime = data.mime || "image/jpeg";
  const name = data.name || "image_" + Date.now() + ".jpg";
  const blob = Utilities.newBlob(Utilities.base64Decode(data.data), mime, name);
  const folder = getOrCreateFolder("ShopImages");
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, url: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600", fileId: file.getId() };
}

function getOrCreateFolder(name) {
  const it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

/* ---------------- helpers ---------------- */
function parseParams(body) {
  const o = {};
  try { (body || "").split("&").forEach((kv) => { const [k, v] = kv.split("="); if (k) o[decodeURIComponent(k)] = decodeURIComponent(v || ""); }); } catch (_) {}
  return o;
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
