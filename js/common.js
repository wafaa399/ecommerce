// common.js — shared by index.html and listing.html (load after products.js)
(() => {
  "use strict";

  const setHref = (sel, href) =>
    document.querySelectorAll(sel).forEach((a) => a.setAttribute("href", href));

  // ---------- Navigation wiring ----------
  setHref(".notification-bar a", "listing.html"); // "Order Now"
  setHref(".navbar-brand, .footer-logo", "index.html"); // logos
  setHref(".fashion-banner a", "listing.html"); // "Start Browsing"
  setHref(".hero-section a.btn-dark-rounded", "listing.html"); // "View Collection"

  const CATEGORY_LINKS = {
    men: "listing.html?gender=men",
    women: "listing.html?gender=women",
    accessories: "listing.html?category=accessories",
  };
  document.querySelectorAll(".navbar .dropdown-menu a").forEach((a) => {
    const target = CATEGORY_LINKS[a.textContent.trim().toLowerCase()];
    if (target) a.setAttribute("href", target);
  });

  const FOOTER_LINKS = { "about us": "about.html", contact: "contact.html" };
  document.querySelectorAll(".footer-links a").forEach((a) => {
    const target = FOOTER_LINKS[a.textContent.trim().toLowerCase()];
    if (target) a.setAttribute("href", target);
  });

  // ---------- Header search ----------
  // On the listing page the live search handles it; elsewhere go to listing.html?q=...
  document.querySelectorAll("form.search-box").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (document.getElementById("productsGrid")) return;
      const q = form.querySelector("input")?.value.trim() || "";
      location.href = q ? `listing.html?q=${encodeURIComponent(q)}` : "listing.html";
    });
  });
})();
// ---------- Storage helpers ----------
const LS = {
  get(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

const TAX_RATE = 0.04;

// ---------- Toast ----------
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText =
    "position:fixed;bottom:24px;right:24px;background:#0e1422;color:#fff;" +
    "padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ---------- Cart ----------
const Cart = {
  get() { return LS.get("cart", []); }, // [{id, qty}]
  save(items) { LS.set("cart", items); updateCartBadge(); },
  add(id, qty = 1) {
    const items = Cart.get();
    const found = items.find((i) => i.id === id);
    if (found) found.qty += qty;
    else items.push({ id, qty });
    Cart.save(items);
  },
  setQty(id, qty) {
    if (qty < 1) return Cart.remove(id);
    const items = Cart.get();
    const found = items.find((i) => i.id === id);
    if (found) found.qty = qty;
    Cart.save(items);
  },
  remove(id) { Cart.save(Cart.get().filter((i) => i.id !== id)); },
  clear() { Cart.save([]); },
  count() { return Cart.get().reduce((n, i) => n + i.qty, 0); },
  detailed() {
    return Cart.get()
      .map((i) => {
        const p = PRODUCTS_DATA.find((p) => p.id === i.id);
        return p ? { ...p, qty: i.qty } : null;
      })
      .filter(Boolean);
  },
  totals() {
    const subtotal = Cart.detailed().reduce((s, p) => s + p.price * p.qty, 0);
    const tax = subtotal * TAX_RATE;
    return { subtotal, shipping: 0, tax, total: subtotal + tax };
  },
};

function updateCartBadge() {
  document.querySelectorAll('.icon-btn[aria-label="Cart"]').forEach((a) => {
    a.href = "cart.html";
    a.style.position = "relative";
    let b = a.querySelector(".cart-badge");
    if (!b) {
      b = document.createElement("span");
      b.className = "cart-badge";
      b.style.cssText =
        "position:absolute;top:-6px;right:-6px;background:#dc2626;color:#fff;" +
        "font-size:11px;min-width:18px;height:18px;line-height:18px;" +
        "border-radius:9px;text-align:center;";
      a.appendChild(b);
    }
    const n = Cart.count();
    b.textContent = n;
    b.style.display = n ? "block" : "none";
  });
}

// ---------- Auth (demo only: localStorage) ----------
async function hashPassword(pw) {
  if (!window.crypto || !crypto.subtle) return pw; // fallback on insecure origins
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const Auth = {
  users() { return LS.get("users", []); },
  current() {
    try {
      return JSON.parse(sessionStorage.getItem("currentUser")) ||
             JSON.parse(localStorage.getItem("currentUser"));
    } catch { return null; }
  },
  login(user, remember) {
    const safe = { firstName: user.firstName, lastName: user.lastName, email: user.email };
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    (remember ? localStorage : sessionStorage).setItem("currentUser", JSON.stringify(safe));
  },
  logout() {
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
  },
  async signup({ firstName, lastName, email, password }) {
    email = email.trim().toLowerCase();
    const users = Auth.users();
    if (users.some((u) => u.email === email))
      return { ok: false, error: "This email is already registered." };
    const user = { firstName, lastName, email, password: await hashPassword(password) };
    users.push(user);
    LS.set("users", users);
    Auth.login(user, true);
    return { ok: true };
  },
  async signin(email, password, remember) {
    email = email.trim().toLowerCase();
    const user = Auth.users().find((u) => u.email === email);
    if (!user || user.password !== (await hashPassword(password)))
      return { ok: false, error: "Wrong email or password." };
    Auth.login(user, remember);
    return { ok: true };
  },
};

function setupAccountIcon() {
  document.querySelectorAll('.icon-btn[aria-label="My Account"]').forEach((a) => {
    const user = Auth.current();
    if (user) {
      a.title = "Hi, " + user.firstName + " (click to sign out)";
      a.href = "#";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Sign out?")) { Auth.logout(); location.href = "index.html"; }
      });
    } else {
      a.href = "signin.html";
    }
  });
}

// Google button placeholder
document.getElementById("googleBtn")?.addEventListener("click", () =>
  alert("Google login needs a Google Client ID and a backend to verify the token.")
);
document.querySelector(".google-btn")?.addEventListener("click", () =>
  alert("Google login needs a Google Client ID and a backend to verify the token.")
);

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  setupAccountIcon();
});