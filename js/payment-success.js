// payment-success.js — renders the confirmation from the order snapshot saved at checkout
(function () {
  const money = (n) => "$" + Number(n || 0).toFixed(2);
  const fmtDate = (ts) =>
    new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const order = LS.get("lastOrder");

  if (!order) {
    document.getElementById("orderItemsList").innerHTML =
      '<p class="text-muted small mb-0">No recent order found. This page is shown automatically after you complete checkout.</p>';
    return;
  }

  document.getElementById("orderNumber").textContent = "#" + order.number;

  document.getElementById("orderItemsList").innerHTML = order.items
    .map(
      (it) => `
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-light rounded p-2 d-flex align-items-center justify-content-center" style="width:60px;height:60px">
            <img src="${it.image}" alt="${it.name}" class="rounded w-100 h-100" style="object-fit:cover">
          </div>
          <div>
            <h6 class="fw-bold mb-1 small">${it.name}</h6>
            <p class="text-muted extra-small mb-0">Qty: ${it.qty}</p>
          </div>
        </div>
        <span class="fw-bold small">${money(it.price * it.qty)}</span>
      </div>`
    )
    .join("");

  const t = order.totals || {};
  document.getElementById("psSubtotal").textContent = money(t.subtotal);
  document.getElementById("psShipping").textContent = t.shipping
    ? money(t.shipping)
    : "Free";
  document.getElementById("psTax").textContent = money(t.tax);
  document.getElementById("psTotal").textContent = money(t.total);

  const s = order.ship || {};
  document.getElementById("psShipName").textContent = s.name || "—";
  document.getElementById("psShipStreet").textContent = s.street || "—";
  document.getElementById("psShipCityLine").textContent =
    [s.city, s.state, s.zip].filter(Boolean).join(", ") || "—";
  document.getElementById("psShipCountry").textContent = s.country || "—";

  document.getElementById("psPayment").textContent =
    "Demo checkout — no real charge";

  document.getElementById("psOrderDate").textContent = fmtDate(order.placedAt);
  document.getElementById("psDelivery").textContent = fmtDate(
    order.placedAt + 5 * 86400000
  );

  document.getElementById("psCustName").textContent = s.name || "—";
  document.getElementById("psCustEmail").textContent = s.email || "—";

  const demo = (id, msg) =>
    document.getElementById(id).addEventListener("click", (e) => {
      e.preventDefault();
      showToast(msg);
    });
  demo("trackOrder", "Order tracking is not available in this demo.");
  demo("orderHistory", "Order history is not available in this demo.");
})();
