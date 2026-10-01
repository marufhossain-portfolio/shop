/**
 * ============================================================
 *  অর্ডার রিসিভার — Google Apps Script
 *  Website order → Google Sheet + Email alert
 * ============================================================
 *  SETUP (ekbar):
 *   1) Google Sheets-e ekta new sheet banao (e.g. "Shop Orders")
 *   2) Sheet khule → Extensions → Apps Script
 *   3) Ei code paste koro (nicher SHEET_ID update koro)
 *   4) Deploy → New deployment → Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5) Pawa Web app URL ta website-er app.js → CONFIG.appsScriptUrl-e bosao
 */

const SHEET_ID = "1zvSKSXUKET8jwcBc3DLZHoexwt-gzloOkYEHW60-j08";
const SHEET_NAME = "Orders";
const NOTIFY_EMAIL = "marufhossain2707@gmail.com";

function doGet(e) {
  return out({ ok: true, msg: "Order receiver active" });
}

function doPost(e) {
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); }
    catch (_) { data = parseParams(e.postData.contents); }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(["Timestamp", "Name", "Phone", "Address", "District", "Upazila", "Note", "Product", "Qty", "Unit Price", "Delivery", "Total"]);
      sh.setFrozenRows(1);
      sh.getRange("A1:L1").setFontWeight("bold");
    }

    sh.appendRow([
      new Date(),
      data.name || "", data.phone || "", data.address || "",
      data.district || "", data.upazila || "", data.note || "",
      data.product || "", data.qty || 1, data.price || 0,
      data.delivery || 0, data.total || 0
    ]);

    // email alert
    const subject = "🛒 নতুন অর্ডার: " + (data.name || "-") + " (" + (data.phone || "-") + ")";
    const body = [
      "নতুন অর্ডার এসেছে:",
      "",
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

    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parseParams(body) {
  const o = {};
  try { (body || "").split("&").forEach((kv) => { const [k, v] = kv.split("="); if (k) o[decodeURIComponent(k)] = decodeURIComponent(v || ""); }); } catch (_) {}
  return o;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
