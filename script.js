const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "pranjalPlotsDemo_v1";
const ADMIN_USERS = {
  "pranjal9151110": { password: "pranjal9151110", name: "Admin 1" },
  "nikhil9151110": { password: "nikhil9151110", name: "Admin 2" }
};
const DEFAULT_DATA = {
  plots: [],
  site: {
    brand: "Pranjal Plots",
    whatsapp: "919616220684",
    phone: "9616220684",
    email: "nikhil915110219@gmail.com",
    about: "",
    developer: {
      name: "Nikhil Yadav",
      role: "Website Developer",
      phone: "9616220684",
      email: "nikhil915110219@gmail.com",
      photo: ""
    }
  }
};
let data = loadData();
let signedInAdmin = null;
let toastTimeout;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.plots) && saved.site) {
      return { ...DEFAULT_DATA, ...saved, site: { ...DEFAULT_DATA.site, ...saved.site,
        developer: { ...DEFAULT_DATA.site.developer, ...(saved.site.developer || {}) } } };
    }
  } catch (error) { console.warn("Saved website data could not be read.", error); }
  return structuredClone(DEFAULT_DATA);
}
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    showToast("Browser storage is full. Try a smaller photo.");
    return false;
  }
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function cleanPhone(value = "") { return String(value).replace(/\D/g, ""); }
function whatsappUrl(message = "") {
  const number = cleanPhone(data.site.whatsapp || "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function mapsUrl(plot) {
  if (plot.map && /^https?:\/\//i.test(plot.map)) return plot.map;
  const query = plot.address || plot.name || "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openModal(id) {
  $(id).classList.add("open");
  $(id).setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  $(id).classList.remove("open");
  $(id).setAttribute("aria-hidden", "true");
  if (!document.querySelector(".modal-backdrop.open")) document.body.style.overflow = "";
}
function imageMarkup(src, alt, className = "") {
  if (src) return `<img class="${className}" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy">`;
  return `<div class="photo-placeholder ${className}" aria-label="No photo added">⌂</div>`;
}
function renderSite() {
  document.title = `${data.site.brand || "Pranjal Plots"} | Find Your Perfect Plot`;
  document.querySelectorAll(".brand:not(.footer-brand) span:last-child, .footer-brand span:last-child").forEach(el => {
    el.innerHTML = escapeHTML(data.site.brand || "Pranjal Plots").replace(" ", " <b>");
    if (el.innerHTML.includes("<b>")) el.innerHTML += "</b>";
  });
  $("plotCount").textContent = data.plots.filter(p => p.visible).length;
  $("whatsappFloat").href = whatsappUrl("Hello, I am interested in the plots.");
  $("emptyWhatsapp").href = whatsappUrl("Hello, I would like to know which plots are available.");
  $("year").textContent = new Date().getFullYear();
  renderPlots();
  renderDevelopers();
}
function renderPlots() {
  const search = ($("plotSearch").value || "").trim().toLowerCase();
  const filter = $("statusFilter").value;
  const plots = data.plots.filter(p => p.visible && (!search || [p.name,p.code,p.address,p.size,p.price].some(v => String(v || "").toLowerCase().includes(search))) && (filter !== "featured" || p.featured));
  $("plotGrid").innerHTML = plots.map(plot => `
    <article class="plot-card">
      <div class="plot-photo">${imageMarkup(plot.image, plot.name)}${plot.featured ? '<span class="plot-badge">FEATURED</span>' : ''}<span class="plot-code">${escapeHTML(plot.code || "PLOT")}</span></div>
      <div class="plot-info">
        <div class="plot-title-row"><h3>${escapeHTML(plot.name)}</h3><span class="plot-price">${escapeHTML(plot.price || "Price on enquiry")}</span></div>
        <p class="plot-location">⌖ ${escapeHTML(plot.address || "Location details available on enquiry")}</p>
        <div class="plot-meta"><span>▦ ${escapeHTML(plot.size || "Size on enquiry")}</span><span>◉ ${escapeHTML(plot.code || "Plot listing")}</span></div>
        <div class="map-preview"><iframe title="Map for ${escapeHTML(plot.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(plot.address || plot.name)}&output=embed"></iframe></div>
        <div class="plot-actions"><a class="btn btn-green" href="${escapeHTML(whatsappUrl(`Hello, I am interested in ${plot.name}${plot.code ? ` (${plot.code})` : ""}. Please share more details.`))}" target="_blank" rel="noopener">Enquire ↗</a><a class="btn btn-outline" href="${escapeHTML(mapsUrl(plot))}" target="_blank" rel="noopener">Open Google Maps ↗</a></div>
      </div>
    </article>`).join("");
  $("emptyState").style.display = plots.length ? "none" : "block";
  $("plotGrid").style.display = plots.length ? "grid" : "none";
  $("plotCount").textContent = data.plots.filter(p => p.visible).length;
}
function renderDevelopers() {
  const d = data.site.developer || {};
  const about = data.site.about ? `<div class="about-line">${escapeHTML(data.site.about)}</div>` : "";
  const card = (name, role, phone, email, photo) => {
    if (![name, role, phone, email, photo].some(Boolean)) return "";
    const initial = escapeHTML((name || "P").trim().charAt(0).toUpperCase());
    return `<article class="developer-card"><div class="developer-avatar">${photo ? `<img src="${escapeHTML(photo)}" alt="${escapeHTML(name || "Developer")}">` : initial}</div><div><h3>${escapeHTML(name || "Website Developer")}</h3><p>${escapeHTML(role || "Developer")}</p><div class="developer-links">${phone ? `<a href="tel:${escapeHTML(cleanPhone(phone))}">☎ Call</a>` : ""}${email ? `<a href="mailto:${escapeHTML(email)}">✉ Email</a>` : ""}</div></div></article>`;
  };
  $("developerCards").innerHTML = card(d.name, d.role, d.phone, d.email, d.photo) + about;
}
function renderAdminPlots() {
  $("adminPlotList").innerHTML = data.plots.length ? data.plots.map(plot => `
    <div class="admin-plot-row">
      ${plot.image ? `<img class="admin-thumb" src="${escapeHTML(plot.image)}" alt="">` : `<div class="admin-thumb">⌂</div>`}
      <div class="admin-plot-details"><strong>${escapeHTML(plot.name)}</strong><small>${escapeHTML(plot.code || "No code")} · ${escapeHTML(plot.price || "Price not set")} · ${escapeHTML(plot.address || "No location")}</small></div>
      <span class="admin-status ${plot.visible ? "" : "off"}">${plot.visible ? "Visible" : "Hidden"}</span>
      <div class="row-actions"><button class="mini-btn" data-edit="${escapeHTML(plot.id)}">Edit</button><button class="mini-btn" data-toggle="${escapeHTML(plot.id)}">${plot.visible ? "Hide" : "Show"}</button><button class="mini-btn danger" data-delete="${escapeHTML(plot.id)}">Delete</button></div>
    </div>`).join("") : `<p class="muted">No plots yet. Choose “Add plot” to create your first listing.</p>`;
}
function resetPlotForm() {
  $("plotForm").reset();
  $("editPlotId").value = "";
  $("plotFormTitle").textContent = "Add a plot";
  $("plotForm").classList.add("hidden");
}
function fillSiteForm() {
  const s = data.site, d = s.developer || {};
  $("siteWhatsapp").value = s.whatsapp || "";
  $("sitePhone").value = s.phone || "";
  $("siteEmail").value = s.email || "";
  $("siteBrand").value = s.brand || "";
  $("siteAbout").value = s.about || "";
  $("devName").value = d.name || "";
  $("devRole").value = d.role || "";
  $("devPhone").value = d.phone || "";
  $("devEmail").value = d.email || "";
  $("devPhotoUrl").value = "";
}
function editPlot(id) {
  const plot = data.plots.find(p => p.id === id);
  if (!plot) return;
  $("plotForm").classList.remove("hidden");
  $("plotFormTitle").textContent = "Edit plot";
  $("editPlotId").value = plot.id;
  $("editPlotName").value = plot.name || "";
  $("editPlotCode").value = plot.code || "";
  $("editPlotPrice").value = plot.price || "";
  $("editPlotSize").value = plot.size || "";
  $("editPlotAddress").value = plot.address || "";
  $("editPlotMap").value = plot.map || "";
  $("editPlotImage").value = "";
  $("editPlotImageUrl").value = "";
  $("editPlotFeatured").checked = !!plot.featured;
  $("editPlotVisible").checked = !!plot.visible;
  $("plotForm").scrollIntoView({ behavior: "smooth", block: "start" });
}
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) return reject(new Error("Please select an image file."));
    if (file.size > 2.5 * 1024 * 1024) return reject(new Error("Please use an image smaller than 2.5 MB for this browser demo."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

document.querySelectorAll(".admin-open").forEach(button => button.addEventListener("click", () => {
  $("loginError").textContent = "";
  $("loginForm").reset();
  openModal("loginModal");
}));
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => {
  if (e.target === backdrop) closeModal(backdrop.id);
}));
document.addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".modal-backdrop.open").forEach(m => closeModal(m.id)); });
$("menuToggle").addEventListener("click", () => $("desktopNav").classList.toggle("show"));
$("desktopNav").querySelectorAll("a").forEach(a => a.addEventListener("click", () => $("desktopNav").classList.remove("show")));
$("plotSearch").addEventListener("input", renderPlots);
$("statusFilter").addEventListener("change", renderPlots);

$("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const id = $("adminId").value.trim();
  const password = $("adminPassword").value;
  if (ADMIN_USERS[id] && ADMIN_USERS[id].password === password) {
    signedInAdmin = { id, name: ADMIN_USERS[id].name };
    $("signedInAs").textContent = `Welcome, ${signedInAdmin.name} (${id})`;
    closeModal("loginModal");
    renderAdminPlots();
    fillSiteForm();
    resetPlotForm();
    openModal("dashboardModal");
  } else {
    $("loginError").textContent = "Incorrect admin ID or password. Please try again.";
  }
});
$("logoutBtn").addEventListener("click", () => {
  signedInAdmin = null;
  closeModal("dashboardModal");
  showToast("You have been logged out.");
});
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("hidden", panel.id !== tab.dataset.tab));
}));
$("addPlotBtn").addEventListener("click", () => {
  resetPlotForm();
  $("plotForm").classList.remove("hidden");
  $("plotFormTitle").textContent = "Add a plot";
  $("editPlotVisible").checked = true;
  $("plotForm").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("cancelPlotEdit").addEventListener("click", resetPlotForm);
$("cancelPlotEdit2").addEventListener("click", resetPlotForm);

$("adminPlotList").addEventListener("click", e => {
  const edit = e.target.closest("[data-edit]");
  const toggle = e.target.closest("[data-toggle]");
  const del = e.target.closest("[data-delete]");
  if (edit) editPlot(edit.dataset.edit);
  if (toggle) {
    const plot = data.plots.find(p => p.id === toggle.dataset.toggle);
    if (plot) { plot.visible = !plot.visible; saveData(); renderAdminPlots(); renderSite(); showToast(plot.visible ? "Plot is now visible." : "Plot hidden from customers."); }
  }
  if (del) {
    const plot = data.plots.find(p => p.id === del.dataset.delete);
    if (plot && confirm(`Delete "${plot.name}"? This cannot be undone in this browser.`)) {
      data.plots = data.plots.filter(p => p.id !== plot.id);
      saveData(); renderAdminPlots(); renderSite(); showToast("Plot deleted.");
    }
  }
});
$("plotForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const id = $("editPlotId").value || `plot-${Date.now()}-${Math.random().toString(16).slice(2,7)}`;
    const existing = data.plots.find(p => p.id === id) || {};
    const uploaded = await fileToDataURL($("editPlotImage").files[0]);
    const imageUrl = $("editPlotImageUrl").value.trim();
    const plot = {
      id, name: $("editPlotName").value.trim(), code: $("editPlotCode").value.trim(),
      price: $("editPlotPrice").value.trim(), size: $("editPlotSize").value.trim(),
      address: $("editPlotAddress").value.trim(), map: $("editPlotMap").value.trim(),
      image: uploaded || imageUrl || existing.image || "",
      featured: $("editPlotFeatured").checked, visible: $("editPlotVisible").checked
    };
    if (existing.id) data.plots = data.plots.map(p => p.id === id ? plot : p);
    else data.plots.unshift(plot);
    if (!saveData()) return;
    resetPlotForm(); renderAdminPlots(); renderSite(); showToast("Plot saved successfully.");
  } catch (error) { showToast(error.message || "Could not save plot."); }
});

$("siteForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const photo = await fileToDataURL($("devPhoto").files[0]);
    const s = data.site, d = s.developer || {};
    s.whatsapp = cleanPhone($("siteWhatsapp").value);
    s.phone = $("sitePhone").value.trim();
    s.email = $("siteEmail").value.trim();
    s.brand = $("siteBrand").value.trim() || "Pranjal Plots";
    s.about = $("siteAbout").value.trim();
    s.developer = {
      name: $("devName").value.trim(), role: $("devRole").value.trim(),
      phone: $("devPhone").value.trim(), email: $("devEmail").value.trim(),
      photo: photo || $("devPhotoUrl").value.trim() || d.photo || ""
    };
    if (!saveData()) return;
    renderSite(); showToast("Website and developer details saved.");
  } catch (error) { showToast(error.message || "Could not save website details."); }
});

$("enquiryForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("customerName").value.trim();
  const phone = $("customerPhone").value.trim();
  const message = $("customerMessage").value.trim();
  const text = `Hello, I am ${name}.${phone ? ` My phone number is ${phone}.` : ""}\nEnquiry: ${message}`;
  window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
});

renderSite();
