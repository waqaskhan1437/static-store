(function () {
  function toSlug(val) {
    if (!val) return "";
    return String(val).replace(/^\/+/, "").replace(/\.html$/i, "");
  }

  function priceToNumber(p) {
    if (typeof p === "number") return p;
    const n = parseFloat(p);
    return isNaN(n) ? 0 : n;
  }

  function buildCard(p) {
    const img = (p.images && p.images.length > 0) ? p.images[0] : "";
    const title = p.title || "";
    const desc = p.description || "";
    const price = priceToNumber(p.price);
    const slug = toSlug(p.slug);
    const href = `./products/${slug}.html`; // ✅ relative path for GitHub Pages subdirectory

    return (
      '<div class="product-card">' +
        `<img src="${img}" alt="${title}">` +
        `<h3>${title}</h3>` +
        `<p>${desc}</p>` +
        `<p>Price: $${price}</p>` +
        `<a href="${href}">View Product</a>` +
      '</div>'
    );
  }

  async function loadProducts() {
    const container = document.getElementById("products");
    if (!container) return;
    container.innerHTML = "";

    // Prefer embedded JSON (faster + no CORS)
    const embedded = document.getElementById("products-json");
    let products = [];
    if (embedded && embedded.textContent && embedded.textContent.trim().length > 0) {
      try {
        products = JSON.parse(embedded.textContent.trim());
      } catch (e) {
        console.error("Failed to parse embedded products JSON:", e);
      }
    }

    // Fallback: try fetching /json/products.json if not embedded
    if (!products || products.length === 0) {
      try {
        const res = await fetch("./json/products.json", { cache: "no-store" });
        if (res.ok) {
          products = await res.json();
        }
      } catch (e) {
        console.error("Failed to fetch products.json:", e);
      }
    }

    if (!Array.isArray(products)) products = [];

    for (const p of products) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildCard(p);
      const node = wrapper.firstElementChild || wrapper;
      container.appendChild(node);
    }
  }

  document.addEventListener("DOMContentLoaded", loadProducts);
})();