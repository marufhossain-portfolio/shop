/* ============================================================
   Shop frontend — dynamic (config comes from Google Sheet via Apps Script)
   ============================================================ */
const APPS_URL = "https://script.google.com/macros/s/AKfycbzEFnaTlhRC6r1Y5yXD86TeeAgzTy2luk-ykrkcsUgVMcsjR0vaGC2E_X_EXPIfLNNGmA/exec";

// fallback defaults (Apps Script na geleo page kaj korbe)
const CONFIG = {
  productName: "খামারি স্মার্ট নিরানি",
  price: 950,
  deliveryCharge: 150,
  phone: "01577800857",
  email: "marufhossain2707@gmail.com",
  description: "",
  heroImage: "",
  galleryImages: ""
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
const $$ = (s) => document.querySelectorAll(s);
let qty = 1;

const fmtPrice = (n) => Number(n || 0).toLocaleString("en-US");
function fmtPhone(p) {
  p = String(p || "").replace(/[\s-]/g, "");
  if (/^01\d{9}$/.test(p)) return p.slice(0, 5) + "-" + p.slice(5);
  return p;
}

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
  $("#sum_sub").textContent = "৳ " + fmtPrice(sub);
  $("#sum_del").textContent = "৳ " + fmtPrice(CONFIG.deliveryCharge);
  $("#sum_total").textContent = "৳ " + fmtPrice(total);
}
$("#q_plus").addEventListener("click", () => { qty = Math.min(99, qty + 1); updateTotal(); });
$("#q_minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); updateTotal(); });

/* ---------- render config ---------- */
function renderConfig() {
  document.title = CONFIG.productName + " | Shop";
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set("#dynName", CONFIG.productName);
  set("#dynName2", CONFIG.productName);
  set("#dynCrumb", CONFIG.productName);
  $("#dynPrice").textContent = fmtPrice(CONFIG.price);
  $("#dynPrice2").textContent = "৳ " + fmtPrice(CONFIG.price);
  if (CONFIG.description) $("#dynDesc").textContent = CONFIG.description;

  // phone
  $$('a[href^="tel:"]').forEach((a) => (a.href = "tel:" + CONFIG.phone.replace(/[\s-]/g, "")));
  $$(".js-phone").forEach((el) => (el.textContent = fmtPhone(CONFIG.phone)));

  // email
  if (CONFIG.email) {
    const em = $("#dynEmail"); if (em) { em.textContent = CONFIG.email; em.href = "mailto:" + CONFIG.email; }
  }

  // hero image
  const heroImg = $("#dynHero"), heroPh = $("#dynHeroPh");
  if (CONFIG.heroImage) { heroImg.src = CONFIG.heroImage; heroImg.hidden = false; heroPh.hidden = true; }
  else { heroImg.hidden = true; heroPh.hidden = false; }

  // thumbnail in order summary
  const thumb = $("#dynThumb"), thumbPh = $("#dynThumbPh");
  if (CONFIG.heroImage) { thumb.src = CONFIG.heroImage; thumb.hidden = false; thumbPh.hidden = true; }
  else { thumb.hidden = true; thumbPh.hidden = false; }

  // gallery
  const g = (CONFIG.galleryImages || "").split("|").map((s) => s.trim()).filter(Boolean);
  const gHost = $("#dynGallery");
  if (g.length) {
    $("#gallery").hidden = false;
    gHost.innerHTML = g.map((u) => `<img src="${u}" alt="gallery" loading="lazy" />`).join("");
  } else {
    $("#gallery").hidden = true;
  }

  updateTotal();
}

/* ---------- load config from Apps Script ---------- */
async function loadConfig() {
  try {
    const r = await fetch(APPS_URL + "?action=getConfig", { redirect: "follow" });
    const j = await r.json();
    if (j && j.ok && j.config) {
      const c = j.config;
      if (c.productName) CONFIG.productName = c.productName;
      if (c.price && Number(c.price)) CONFIG.price = Number(c.price);
      if (c.deliveryCharge) CONFIG.deliveryCharge = Number(c.deliveryCharge);
      if (c.phone) CONFIG.phone = c.phone;
      if (c.email) CONFIG.email = c.email;
      if (c.description) CONFIG.description = c.description;
      if (c.heroImage) CONFIG.heroImage = c.heroImage;
      if (c.galleryImages) CONFIG.galleryImages = c.galleryImages;
    }
  } catch (_) {}
  renderConfig();
}

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
    action: "order",
    name, phone: phone.replace(/[\s-]/g, ""), address, district, upazila, note,
    product: CONFIG.productName, qty,
    price: CONFIG.price, delivery: CONFIG.deliveryCharge,
    total: CONFIG.price * qty + CONFIG.deliveryCharge,
    timestamp: new Date().toISOString()
  };

  const btn = e.target.querySelector("button[type=submit]");
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = "অর্ডার পাঠানো হচ্ছে…";

  try {
    const r = await fetch(APPS_URL, {
      method: "POST", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(order)
    });
    const j = await r.json();
    if (!(j && j.ok)) throw new Error((j && j.error) || "server error");

    $("#orderWrap").hidden = true;
    $("#orderSuccess").hidden = false;
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    e.target.reset(); qty = 1; updateTotal();
  } catch (err) {
    toast("অর্ডার পাঠানো যায়নি। দয়া করে কল করুন: " + fmtPhone(CONFIG.phone), "bad");
    console.error(err);
  } finally {
    btn.disabled = false; btn.textContent = old;
  }
});

$("#backHome").addEventListener("click", () => {
  $("#orderSuccess").hidden = true;
  $("#orderWrap").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- boot ---------- */
renderConfig();
loadConfig();
