const box = document.getElementById("cartItems");
const money = (n) => "$ " + n.toFixed(2);

function render() {
  const items = Cart.detailed();
  if (!items.length) {
    box.innerHTML = '<p class="py-5">Your cart is empty. <a href="listing.html">Continue shopping</a></p>';
    document.getElementById("goCheckout").style.display = "none";
  } else {
    box.innerHTML = items.map((p) => `
      <div class="d-flex align-items-center gap-3 border-bottom py-3">
        <img src="${p.image}" alt="${p.name}" width="80" height="80" style="object-fit:cover;border-radius:8px">
        <div class="flex-grow-1">
          <h6 class="mb-1">${p.name}</h6>
          <span>${money(p.price)}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-dark btn-sm qty" data-id="${p.id}" data-d="-1">-</button>
          <span>${p.qty}</span>
          <button class="btn btn-outline-dark btn-sm qty" data-id="${p.id}" data-d="1">+</button>
        </div>
        <strong style="min-width:80px;text-align:right">${money(p.price * p.qty)}</strong>
        <button class="btn btn-link text-danger remove" data-id="${p.id}">Remove</button>
      </div>`).join("");
    document.getElementById("goCheckout").style.display = "block";
  }
  const t = Cart.totals();
  document.getElementById("sumSubtotal").textContent = money(t.subtotal);
  document.getElementById("sumTax").textContent = money(t.tax);
  document.getElementById("sumTotal").textContent = money(t.total);
}

box.addEventListener("click", (e) => {
  const q = e.target.closest(".qty");
  const r = e.target.closest(".remove");
  if (q) {
    const id = Number(q.dataset.id);
    const cur = Cart.get().find((i) => i.id === id);
    Cart.setQty(id, cur.qty + Number(q.dataset.d));
  }
  if (r) Cart.remove(Number(r.dataset.id));
  render();
});

document.getElementById("goCheckout").addEventListener("click", (e) => {
  if (!Auth.current()) {
    e.preventDefault();
    location.href = "signin.html?redirect=" + encodeURIComponent("checkout.html");
  }
});

render();