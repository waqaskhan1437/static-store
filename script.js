async function loadProducts() {
  const embedded = document.getElementById('products-json');
  if (embedded && embedded.textContent && embedded.textContent.trim().length > 0) {
    try {
      const products = JSON.parse(embedded.textContent.trim());
      const container = document.getElementById('products');
      container.innerHTML = '';
      products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
        <img src="${p.images && p.images.length > 0 ? p.images[0] : ''}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <p>Price: $${p.price}</p>
        <a href="/products/${p.slug}.html">View Product</a>
        `;
        container.appendChild(card);
      });
      return;
    } catch (e) {
      console.error(e);
    }
  }
  try {
    const res = await fetch('/json/products.json');
    if (!res.ok) throw new Error('Failed to load products');
    const products = await res.json();
    const container = document.getElementById('products');
    container.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.images && p.images.length > 0 ? p.images[0] : ''}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <p>Price: $${p.price}</p>
        <a href="/products/${p.slug}.html">View Product</a>
        `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
