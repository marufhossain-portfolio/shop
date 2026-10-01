/* ============================================================
   CONFIG — ei ek jayga change korlei sob hoye jabe
   ============================================================ */
const CONFIG = {
  productName: "খামারি স্মার্ট নিরানি",
  price: 950,            // একক মূল্য (৳)
  deliveryCharge: 150,   // ডেলিভারি চার্জ (৳)
  phone: "01577800857",
  email: "hello@khamariagro.com",
  // Google Apps Script Web App URL (deploy korar por niche bosao)
  appsScriptUrl: "",
};

const DISTRICTS = [
  "বাগেরহাট","বান্দরবান","বরগুনা","বরিশাল","ভোলা","বগুড়া","ব্রাহ্মণবাড়িয়া","চাঁদপুর",
  "চাঁপাইনবাবগঞ্জ","চট্টগ্রাম","চুয়াডাঙ্গা","কুমিল্লা","কক্সবাজার","ঢাকা","দিনাজপুর","ফরিদপুর",
  "ফেনী","গাইবান্ধা","গাজীপুর","গোপালগঞ্জ","হবিগঞ্জ","জামালপুর","যশোর","ঝালকাঠি",
  "ঝিনাইদহ","জয়পুরহাট","খাগড়াছড়ি","খুলনা","কিশোরগঞ্জ","কুড়িগ্রাম","কুষ্টিয়া","লক্ষ্মীপুর",
  "লালমনিরহাট","মাদারীপুর","মাগুরা","মানিকগঞ্জ","মেহেরপুর","মৌলভীবাজার","মুন্সীগঞ্জ","ময়মনসিংহ",
  "নওগাঁ","নড়াইল","নারায়ণগঞ্জ","নরসিংদী","নাটোর","নেত্রকোণা","নীলফামারী","নোয়াখালী",
  "পাবনা","পঞ্চগড়","পটুয়াখালী","পিরোজপুর","রাজবাড়ী","রাজশাহী","রাঙ্গামাটি","রংপুর",
  "সাতক্ষীরা","শরীয়তপুর","শেরপুর","সিরাজগঞ্জ","সুনামগঞ্জ","সিলেট","টাঙ্গাইল","ঠাকুরগাঁও"
];

const $ = (s) => document.querySelector(s);
let qty = 1;

/* ---------- district select ---------- */
const dsel = $("#f_district");
DISTRICTS.forEach((d) => {
  const o = document.createElement("option");
  o.value = d; o.textContent = d;
  dsel.appendChild(o);
});

/* ---------- quantity + total ---------- */
function updateTotal() {
  const sub = CONFIG.price * qty;
  const total = sub + CONFIG.deliveryCharge;
  $("#q_val").textContent = qty;
  $("#sum_qty").textContent = qty;
  $("#sum_sub").textContent = "৳ " + sub.toLocaleString("bn-BD");
  $("#sum_del").textContent = "৳ " + CONFIG.deliveryCharge.toLocaleString("bn-BD");
  $("#sum_total").textContent = "৳ " + total.toLocaleString("bn-BD");
}
$("#q_plus").addEventListener("click", () => { qty = Math.min(99, qty + 1); updateTotal(); });
$("#q_minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); updateTotal(); });
updateTotal();

/* ---------- toast ---------- */
let tTimer;
function toast(msg, kind) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast " + (kind || ""); t.hidden = false;
  clearTimeout(tTimer); tTimer = setTimeout(() => (t.hidden = true), 5000);
}

/* ---------- submit ---------- */
$("#orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#f_name").value.trim();
  const phone = $("#f_phone").value.trim();
  const address = $("#f_address").value.trim();
  const district = $("#f_district").value;
  const upazila = $("#f_upazila").value.trim();
  const note = $("#f_note").value.trim();

  if (!name) return toast("আপনার নাম লিখুন", "bad");
  if (!/^01\d{9}$/.test(phone.replace(/[\s-]/g, ""))) return toast("সঠিক মোবাইল নম্বর লিখুন (01XXXXXXXXX)", "bad");
  if (!address) return toast("সম্পূর্ণ ঠিকানা লিখুন", "bad");
  if (!district) return toast("জেলা নির্বাচন করুন", "bad");
  if (!upazila) return toast("উপজেলা লিখুন", "bad");

  const order = {
    name, phone: phone.replace(/[\s-]/g, ""), address, district, upazila, note,
    product: CONFIG.productName, qty,
    price: CONFIG.price, delivery: CONFIG.deliveryCharge,
    total: CONFIG.price * qty + CONFIG.deliveryCharge,
    timestamp: new Date().toISOString()
  };

  const btn = e.target.querySelector("button[type=submit]");
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = "অর্ডার পাঠানো হচ্ছে…";

  // fallback: Apps Script deploy na korleo direct call/WhatsApp option
  if (!CONFIG.appsScriptUrl) {
    const wa = "https://wa.me/" + CONFIG.phone.replace(/\D/g, "") + "?text=" + encodeURIComponent(
      `নতুন অর্ডার:\nনাম: ${name}\nমোবাইল: ${phone}\nঠিকানা: ${address}, ${upazila}, ${district}\nপরিমাণ: ${qty}\nমোট: ৳ ${order.total}`
    );
    toast("Apps Script URL set kora nei — WhatsApp e order pathano hocche", "");
    window.open(wa, "_blank");
    btn.disabled = false; btn.textContent = old;
    return;
  }

  try {
    const r = await fetch(CONFIG.appsScriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(order)
    });
    const j = await r.json();
    if (j && j.ok) {
      toast("ধন্যবাদ! আপনার অর্ডার সফলভাবে পেয়েছি। শীঘ্রই কল করে কনফার্ম করা হবে।", "ok");
      e.target.reset(); qty = 1; updateTotal();
    } else {
      throw new Error((j && j.error) || "unknown");
    }
  } catch (err) {
    toast("অর্ডার পাঠানো যায়নি। দয়া করে কল করুন: " + CONFIG.phone, "bad");
    console.error(err);
  } finally {
    btn.disabled = false; btn.textContent = old;
  }
});
