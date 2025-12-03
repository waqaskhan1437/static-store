/**
 * admin/js/generator.js
 * Zimmedari: Product data se final HTML file ka content banana.
 * Note: Is file mein UI logic nahi hogi, sirf String generation hogi.
 */

/**
 * Product Object se mukammal HTML page generate karein.
 * @param {Object} product - Product ka data (title, price, images, addons etc)
 * @returns {string} Full HTML string
 */
export function generateProductHTML(product) {
    if (!product) return '';

    // 1. Basic Meta & Header
    const headSection = generateHead(product.title, product.seoDescription);
    
    // 2. Main Content (Images + Info)
    const contentSection = `
        <div class="product-container">
            ${generateGallery(product.images)}
            <div class="product-details">
                <h1>${product.title}</h1>
                <p class="price">${product.price} PKR</p>
                <div class="description">${product.description}</div>
                ${generateAddonsList(product.addons)}
                <button class="btn-buy" onclick="addToCart('${product.id}')">Order Now</button>
            </div>
        </div>
    `;

    // 3. Footer & Scripts
    const footerSection = `<footer>&copy; 2024 My Store</footer>`;

    // Full HTML Combine karein
    return `
        <!DOCTYPE html>
        <html lang="en">
        ${headSection}
        <body>
            <nav>My Store Navbar</nav>
            <main>${contentSection}</main>
            ${footerSection}
            <script src="../script.js"></script>
        </body>
        </html>
    `;
}

/**
 * Helper: Head Section banaye
 */
function generateHead(title, description) {
    return `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - My Store</title>
        <meta name="description" content="${description || title}">
        <link rel="stylesheet" href="../style.css">
        <link rel="stylesheet" href="../product.css">
    </head>`;
}

/**
 * Helper: Image Gallery HTML banaye
 */
function generateGallery(images) {
    if (!images || images.length === 0) return '';
    
    // Pehli image main hogi, baqi thumbnails
    const mainImage = `<img src="${images[0]}" class="main-img" alt="Product Image">`;
    const thumbs = images.map(img => `<img src="${img}" class="thumb">`).join('');

    return `
        <div class="gallery">
            <div class="main-view">${mainImage}</div>
            <div class="thumbnails">${thumbs}</div>
        </div>
    `;
}

/**
 * Helper: Add-ons Section HTML banaye
 */
function generateAddonsList(addons) {
    if (!addons || addons.length === 0) return '';

    const listItems = addons.map(addon => `
        <label class="addon-item">
            <input type="checkbox" name="addon" value="${addon.name}" data-price="${addon.price}">
            <span>${addon.name} (+${addon.price})</span>
        </label>
    `).join('');

    return `<div class="addons-section"><h3>Extras:</h3>${listItems}</div>`;
}
