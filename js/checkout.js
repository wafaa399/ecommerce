// checkout.js — order summary + shipping validation (load after products.js / common.js)
const money = (n) => "$ " + n.toFixed(2);

const orderItems = document.getElementById("orderItems");
const sumSubtotal = document.getElementById("sumSubtotal");
const sumShipping = document.getElementById("sumShipping");
const sumTax = document.getElementById("sumTax");
const sumTotal = document.getElementById("sumTotal");
const placeOrder = document.getElementById("placeOrder");
const shipError = document.getElementById("shipError");

function renderSummary() {
  const items = Cart.detailed();

  if (!items.length) {
    orderItems.innerHTML =
      '<p class="small text-secondary mb-0">Your cart is empty. ' +
      '<a href="listing.html">Continue shopping</a></p>';
    placeOrder.disabled = true;
    placeOrder.style.opacity = "0.5";
  } else {
    orderItems.innerHTML = items
      .map(
        (p) => `
      <div class="order-summary-row small">
        <span>${p.name} &times; ${p.qty}</span>
        <span>${money(p.price * p.qty)}</span>
      </div>`
      )
      .join("");
    placeOrder.disabled = false;
    placeOrder.style.opacity = "1";
  }

  const t = Cart.totals();
  sumSubtotal.textContent = money(t.subtotal);
  sumShipping.textContent = t.shipping === 0 ? "Free" : money(t.shipping);
  sumTax.textContent = money(t.tax);
  sumTotal.textContent = money(t.total);
}

function fieldError() {
  const required = [
    "shipStreet",
    "shipCity",
    "shipState",
    "shipZip",
    "shipCountry",
    "shipEmail",
    "shipName",
  ];
  for (const id of required) {
    const el = document.getElementById(id);
    if (!el.value.trim()) return "Please fill in every shipping field.";
  }
  const email = document.getElementById("shipEmail").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
  return "";
}

placeOrder.addEventListener("click", () => {
  shipError.textContent = "";

  if (!Auth.current()) {
    location.replace("signin.html?redirect=" + encodeURIComponent("checkout.html"));
    return;
  }

  if (!Cart.detailed().length) {
    shipError.textContent = "Your cart is empty.";
    return;
  }

  const err = fieldError();
  if (err) {
    shipError.textContent = err;
    return;
  }

  const order = {
    number:
      "ORD-" +
      new Date().getFullYear() +
      "-" +
      String(Math.floor(100000 + Math.random() * 900000)),
    placedAt: Date.now(),
    items: Cart.detailed().map((p) => ({
      name: p.name,
      qty: p.qty,
      price: p.price,
      image: p.image,
    })),
    totals: Cart.totals(),
    ship: {
      name: document.getElementById("shipName").value.trim(),
      street: document.getElementById("shipStreet").value.trim(),
      city: document.getElementById("shipCity").value.trim(),
      state: document.getElementById("shipState").value.trim(),
      zip: document.getElementById("shipZip").value.trim(),
      country: document.getElementById("shipCountry").value.trim(),
      email: document.getElementById("shipEmail").value.trim(),
    },
  };
  LS.set("lastOrder", order);

  Cart.clear();
  location.href = "payment-success.html";
});

function prefillFromAccount() {
  const user = Auth.current();
  if (!user) return;
  const name = document.getElementById("shipName");
  const email = document.getElementById("shipEmail");
  if (name && !name.value) name.value = (user.firstName + " " + user.lastName).trim();
  if (email && !email.value) email.value = user.email || "";
}

// Checkout is only available to signed-in accounts
if (Auth.current()) {
  prefillFromAccount();
  renderSummary();
} else {
  location.replace("signin.html?redirect=" + encodeURIComponent("checkout.html"));
}
