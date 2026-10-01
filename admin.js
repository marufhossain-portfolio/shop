/* Shop Admin — config edit + image upload */
const APPS_URL = "https://script.google.com/macros/s/AKfycbzEFnaTlhRC6r1Y5yXD86TeeAgzTy2luk-ykrkcsUgVMcsjR0vaGC2E_X_EXPIfLNNGmA/exec";
const $ = (s) => document.querySelector(s);
let password = localStorage.getItem("shop_admin_pw") || "";
let galleryUrls = []; // array of URLs (max 6)

const CONFIG_IDS = ["productName", "price", "deliveryCharge", "phone", "email", "description"];

/* ---------- toast ---------- */
let tTimer;
function toast(msg, kind) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast " + (kind || ""); t.hidden = false;
  clearTimeout(tTimer); tTimer = setTimeout(() => (t.hidden = true), 5000);
}

/* ---------- API helpers ---------- */
async function apiPost(action, extra) {
  const r = await fetch(APPS_URL, {
    method: "POST", redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, password, ...(extra || {}) })
  });
  return r.json();
}

/* ---------- login ---------- */
async function tryLogin() {
  const p = $("#pw").value.trim();
  if (!p) return ($("#loginMsg").textContent = "Password likhen");
  $("#loginMsg").textContent = "Checking…";
  try {
    const r = await fetch(APPS_URL + "?action=checkPassword&p=" + encodeURIComponent(p), { redirect: "follow" });
    const j = await r.json();
    if (j.ok) {
      password = p;
      localStorage.setItem("shop_admin_pw", p);
      showPanel();
    } else {
      $("#loginMsg").textContent = "❌ Wrong password";
    }
  } catch (e) { $("#loginMsg").textContent = "Connection error"; }
}
$("#loginBtn").addEventListener("click", tryLogin);
$("#pw").addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });

$("#logout").addEventListener("click", () => {
  localStorage.removeItem("shop_admin_pw");
  location.reload();
});

/* ---------- panel ---------- */
async function showPanel() {
  $("#login").hidden = true;
  $("#panel").hidden = false;
  buildGallerySlots();
  await loadConfig();
}

/* ---------- gallery slots (6) ---------- */
function buildGallerySlots() {
  const host = $("#gallerySlots");
  host.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const d = document.createElement("div");
    d.className = "img-slot";
    d.innerHTML = `
      <img id="gpre_${i}" alt="" />
      <div class="imeta">
        <label style="margin-bottom:4px;font-size:12.5px;font-weight:700">Gallery ${i + 1}</label>
        <input type="file" accept="image/*" data-img="gallery" data-i="${i}" />
        <input id="g_url_${i}" placeholder="image URL (optional)" style="margin-top:6px" data-i="${i}" />
        <button class="ghost" style="margin-top:6px;min-height:30px;padding:4px 10px;font-size:12px" data-clear="${i}">✕ Remove</button>
      </div>`;
    host.appendChild(d);
  }
}

/* ---------- image upload (file → Drive) ---------- */
document.addEventListener("change", async (e) => {
  const inp = e.target;
  if (inp.type !== "file" || !inp.dataset.img) return;
  const f = inp.files && inp.files[0];
  if (!f) return;
  if (f.size > 3 * 1024 * 1024) return toast("Image 3MB er niche din", "bad");
  toast("Uploading " + f.name + "…");
  try {
    const base64 = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1]);
      fr.onerror = rej;
      fr.readAsDataURL(f);
    });
    const r = await apiPost("uploadImage", { name: f.name, mime: f.type, data: base64 });
    if (!r.ok) throw new Error(r.error);
    const url = r.url;
    if (inp.dataset.img === "hero") {
      $("#c_heroImage").value = url;
      $("#pre_hero").src = url;
    } else {
      const i = +inp.dataset.i;
      $("#g_url_" + i).value = url;
      $("#gpre_" + i).src = url;
    }
    toast("Image uploaded ✅", "ok");
  } catch (err) {
    toast("Upload failed: " + (err.message || err), "bad");
  }
});

/* clear gallery */
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-clear]");
  if (!c) return;
  const i = +c.dataset.clear;
  $("#g_url_" + i).value = "";
  $("#gpre_" + i).removeAttribute("src");
});

/* ---------- load config ---------- */
async function loadConfig() {
  try {
    const r = await fetch(APPS_URL + "?action=getConfig", { redirect: "follow" });
    const j = await r.json();
    const c = (j && j.config) || {};
    CONFIG_IDS.forEach((k) => { if ($("#c_" + k)) $("#c_" + k).value = c[k] || ""; });
    if (c.heroImage) { $("#c_heroImage").value = c.heroImage; $("#pre_hero").src = c.heroImage; }
    const g = (c.galleryImages || "").split("|").filter(Boolean);
    g.forEach((url, i) => { if (i < 6) { $("#g_url_" + i).value = url; $("#gpre_" + i).src = url; } });
    toast("Config loaded", "ok");
  } catch (e) { toast("Config load failed: " + e.message, "bad"); }
}

/* ---------- save ---------- */
$("#saveBtn").addEventListener("click", async () => {
  const btn = $("#saveBtn");
  btn.disabled = true; btn.textContent = "Saving…";
  try {
    const config = {};
    CONFIG_IDS.forEach((k) => (config[k] = $("#c_" + k).value));
    config.heroImage = $("#c_heroImage").value.trim();
    const g = [];
    for (let i = 0; i < 6; i++) { const u = $("#g_url_" + i).value.trim(); if (u) g.push(u); }
    config.galleryImages = g.join("|");

    const r = await apiPost("saveConfig", { config });
    if (!r.ok) throw new Error(r.error);
    toast("Saved ✅ — site live update hoyeche", "ok");
  } catch (e) { toast("Save failed: " + (e.message || e), "bad"); }
  finally { btn.disabled = false; btn.textContent = "💾 Save Changes"; }
});

/* ---------- boot ---------- */
if (password) {
  // verify saved password quietly
  fetch(APPS_URL + "?action=checkPassword&p=" + encodeURIComponent(password), { redirect: "follow" })
    .then((r) => r.json())
    .then((j) => { if (j.ok) showPanel(); else { localStorage.removeItem("shop_admin_pw"); $("#login").hidden = false; } })
    .catch(() => ($("#login").hidden = false));
} else {
  $("#login").hidden = false;
}
