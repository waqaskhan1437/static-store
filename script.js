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
    const slug = toSlug(p.slug || p.id); // Support both slug and id
    const href = `./products/${slug}.html`;

    return (
      '<div class="product-card">' +
        `<img src="${img}" alt="${title}">` +
        `<h3>${title}</h3>` +
        `<p>${desc}</p>` +
        `<p>Price: ${price} PKR</p>` +
        `<a href="${href}">View Product</a>` +
      '</div>'
    );
  }

  async function loadProducts() {
    const container = document.getElementById("products");
    if (!container) return;
    container.innerHTML = "<p>Loading products...</p>";

    let products = [];

    // DIRECT FETCH: Hamesha fresh file maangein (Cache avoid karne ke liye timestamp lagaya)
    try {
      const res = await fetch("./json/products.json?v=" + Date.now());
      if (res.ok) {
        products = await res.json();
      } else {
        console.error("Products file fetch failed");
      }
    } catch (e) {
      console.error("Failed to fetch products.json:", e);
    }

    // Agar fetch fail ho jaye, tab hi purana embedded data use karein (Fallback)
    if (!products || products.length === 0) {
      const embedded = document.getElementById("products-json");
      if (embedded && embedded.textContent && embedded.textContent.trim().length > 0) {
        try {
          products = JSON.parse(embedded.textContent.trim());
        } catch (e) {}
      }
    }

    container.innerHTML = ""; // Clear loading message

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    // Newest products first
    products.reverse(); 

    for (const p of products) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildCard(p);
      const node = wrapper.firstElementChild || wrapper;
      container.appendChild(node);
    }
  }

  document.addEventListener("DOMContentLoaded", loadProducts);
})();
