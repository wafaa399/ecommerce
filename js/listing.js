const PAGE_SIZE = 9; // num of product every display

// ---- preload all product images
PRODUCTS_DATA.forEach(function (p) {
  const img = new Image();
  img.src = p.image;
});

function debounce(fn, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

// filters
let categories = [];
let gender = "all"; // "all" "men" "women"
let colors = []; // ["blue"]
let sizes = []; // ["M", "L"]
let maxPrice = 100;
let search = "";
let sort = "default";

let filtered = [];
let shown = 0;

// elements page
const grid = document.getElementById("productsGrid");
const resultsCount = document.getElementById("resultsCount");
const appliedFilters = document.getElementById("appliedFilters");
const loadMoreBtn = document.getElementById("loadMore");
const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");
const searchInput = document.querySelector(".search-box input");

// filtering and order
function getFilteredProducts() {
  let result = PRODUCTS_DATA.filter(function (p) {
    if (categories.length > 0 && !categories.includes(p.category)) return false;
    if (gender !== "all" && p.gender !== gender && p.gender !== "unisex") return false;
    if (colors.length > 0 && !colors.some((c) => p.colors.includes(c))) return false;
    if (sizes.length > 0 && !sizes.some((s) => p.sizes.includes(s))) return false;
    if (p.price > maxPrice) return false;
    if (search !== "" && !(" " + p.name.toLowerCase()).includes(" " + search.toLowerCase())) return false;
    return true;
  });

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sort === "newest") result.sort((a, b) => b.id - a.id);

  return result;
}

// displaying
function showMore() {
  const next = filtered.slice(shown, shown + PAGE_SIZE);
  const isFirstBatch = shown === 0; // first batch after a filter/refresh loads immediately
  let html = "";

  next.forEach(function (p) {
    const loadingAttrs = isFirstBatch
      ? 'loading="eager" fetchpriority="high"'
      : 'loading="lazy"';

    html += `
      <div class="col-md-4 col-sm-6 product-card mb-4">
        <div class="product-image-placeholder">
          <img src="${p.image}" alt="${p.name}" width="400" height="400" ${loadingAttrs}>
        </div>
        <h6>${p.name}</h6>
        <div class="d-flex align-items-center gap-2">
          <span class="stock-badge">${p.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
          <span class="product-price">$${p.price.toFixed(2)}</span>
        </div>
        <button class="btn btn-dark btn-sm rounded-pill mt-2 add-to-cart"
                data-id="${p.id}" ${p.inStock ? "" : "disabled"}>
          ${p.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>`;
  });

  grid.insertAdjacentHTML("beforeend", html); // adding without removing before
  shown += next.length;

  resultsCount.textContent = `Showing 1-${shown} Of ${filtered.length} Results.`;
  loadMoreBtn.style.display = shown < filtered.length ? "inline-block" : "none";
}

function showAppliedFilters() {
  const list = [...categories, ...colors, ...sizes];
  if (gender !== "all") list.push(gender);
  if (search !== "") list.push(`"${search}"`);
  if (maxPrice < 100) list.push(`up to $${maxPrice}`);

  appliedFilters.textContent = "Applied Filters: " + (list.length ? list.join(", ") : "None");
}

// calling after any change added
function update() {
  filtered = getFilteredProducts();
  grid.innerHTML = "";
  shown = 0;

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-center py-5">No products match your filters. Press Reset Filters to start over.</p>';
    resultsCount.textContent = "Showing 0 Results.";
    loadMoreBtn.style.display = "none";
  } else {
    showMore();
  }
  showAppliedFilters();
}

// adding a new filter and removing it
function toggleItem(array, value) {
  const i = array.indexOf(value);
  if (i === -1) array.push(value);
  else array.splice(i, 1);
}

document.querySelectorAll(".category").forEach(function (box) {
  box.addEventListener("change", function () {
    toggleItem(categories, box.value);
    update();
  });
});

// gender
document.querySelectorAll(".gender-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const same = gender === btn.dataset.gender; // clicked the active one?
    gender = same ? "all" : btn.dataset.gender;
    document.querySelectorAll(".gender-btn").forEach((b) => b.classList.remove("active"));
    if (!same) btn.classList.add("active");
    update();
  });
});

// colors
document.querySelectorAll(".color-swatch").forEach(function (btn) {
  btn.addEventListener("click", function () {
    toggleItem(colors, btn.dataset.color);
    btn.classList.toggle("active");
    update();
  });
});

// sizes
document.querySelectorAll(".size-filter").forEach(function (btn) {
  btn.addEventListener("click", function () {
    toggleItem(sizes, btn.dataset.size);
    btn.classList.toggle("active");
    update();
  });
});

// price (label updates instantly, grid updates after a short pause)
const debouncedUpdate = debounce(update, 200);
priceRange.addEventListener("input", function () {
  maxPrice = Number(priceRange.value);
  priceValue.textContent = "$ " + maxPrice.toFixed(2);
  debouncedUpdate();
});

// search (debounced)
const debouncedSearch = debounce(function () {
  search = searchInput.value.trim();
  update();
}, 250);
searchInput.addEventListener("input", debouncedSearch);

// ordering
document.querySelectorAll("[data-sort]").forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    sort = link.dataset.sort;
    update();
  });
});

// Load More
loadMoreBtn.addEventListener("click", showMore);

// Add to Cart (one listener for all cards, works for products added by Load More too)
grid.addEventListener("click", function (e) {
  const btn = e.target.closest(".add-to-cart");
  if (!btn || btn.disabled) return;
  Cart.add(Number(btn.dataset.id));
  showToast("Added to cart");
});

// Reset Filters
function resetFilters() {
  categories = [];
  gender = "all";
  colors = [];
  sizes = [];
  maxPrice = 100;
  search = "";
  sort = "default";

  document.querySelectorAll(".category").forEach((box) => (box.checked = false));
  document.querySelectorAll(".gender-btn, .color-swatch, .size-filter").forEach((b) => b.classList.remove("active"));
  priceRange.value = 100;
  priceValue.textContent = "$ 100.00";
  searchInput.value = "";

  history.replaceState(null, "", location.pathname);

  update();
}
document.getElementById("resetFilters").addEventListener("click", resetFilters);

const params = new URLSearchParams(location.search);

if (params.get("gender") === "men" || params.get("gender") === "women") {
  gender = params.get("gender");
  const btn = document.querySelector(`.gender-btn[data-gender="${gender}"]`);
  if (btn) btn.classList.add("active");
}
if (params.get("category")) {
  const cat = params.get("category");
  const box = document.querySelector(`.category[value="${cat}"]`);
  if (box) {
    categories.push(cat);
    box.checked = true;
  }
}
if (params.get("q")) {
  search = params.get("q");
  searchInput.value = search;
}
update();