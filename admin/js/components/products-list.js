import { fetchProducts, saveData } from '../api.js';
import { formatCurrency, showToast } from '../utils.js';

/**
 * Products List Component
 * Zimmedari: Products fetch karna aur Table show karna.
 */

export async function renderProductsList() {
    // 1. Loading State
    const loadingHtml = `<div style="text-align:center; padding:50px;">Loading Products...</div>`;
    
    // NOTE: Kyunke yeh async hai, humein promise return karna hoga ya
    // container mein baad mein content inject karna hoga. 
    // Is example mein hum HTML structure return karte hain aur data fetch 
    // karke fill karte hain "afterRender" logic ke zariye (Main controller mein).
    
    // Lekin simple rakhne ke liye, hum yahan aik container dete hain
    // aur khud hi fetch call karte hain.
    
    setTimeout(loadDataIntoTable, 0); // Non-blocking fetch call

    return `
        <div class="table-container">
            <table class="data-table" id="products-table">
                <thead>
                    <tr>
                        <th width="80">Image</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th width="150">Actions</th>
                    </tr>
                </thead>
                <tbody id="products-table-body">
                    <tr><td colspan="5" style="text-align:center;">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

/**
 * API se data le kar table fill karna
 */
async function loadDataIntoTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    const products = await fetchProducts();

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No products found. Add new!</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.images && product.images[0] ? product.images[0] : 'https://placehold.co/40'}" 
                     class="thumb" alt="img">
            </td>
            <td>
                <strong>${product.title}</strong><br>
                <small style="color:#888;">ID: ${product.id}</small>
            </td>
            <td>${formatCurrency(product.price)}</td>
            <td>
                <span class="badge ${product.stock_status || 'in_stock'}">
                    ${(product.stock_status || 'in stock').replace('_', ' ')}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="location.hash='#products/edit/${product.id}'" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="window.deleteProduct('${product.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Delete Function ko global scope mein daalna padega taakay HTML onclick kaam kare
    // (Ya phir hum event listeners attach karein, jo behtar hai, lekin filhal simple rakhte hain)
    window.deleteProduct = handleDelete;
}

/**
 * Delete Handler
 */
async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await saveData({
            action: 'delete_product',
            id: id
        }, 'admin123'); // Password hardcoded for now

        showToast('Product deleted successfully');
        loadDataIntoTable(); // Table refresh karein
    } catch (error) {
        showToast('Error deleting: ' + error.message, 'error');
    }
}
