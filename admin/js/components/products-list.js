import { fetchProducts, saveData } from '../api.js';
import { formatCurrency, showToast } from '../utils.js';

/**
 * Products List Component (Fixed for Slug)
 */

export async function renderProductsList() {
    setTimeout(loadDataIntoTable, 0);

    return `
        <div class="table-container">
            <div style="padding: 15px; display:flex; justify-content:space-between; align-items:center;">
                <h3>All Products</h3>
                <input type="text" id="search-products" placeholder="Search..." style="padding:5px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <table class="data-table" id="products-table">
                <thead>
                    <tr>
                        <th width="80">Image</th>
                        <th>Product Name / Slug</th>
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

async function loadDataIntoTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    try {
        const products = await fetchProducts();

        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No products found. Add new!</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(product => {
            // Use Slug as ID if ID is missing
            const productId = product.slug || product.id; 
            const img = (product.images && product.images.length) ? product.images[0] : 'https://placehold.co/40';

            return `
            <tr>
                <td>
                    <img src="${img}" class="thumb" alt="img" style="width:40px;height:40px;object-fit:cover;">
                </td>
                <td>
                    <strong>${product.title}</strong><br>
                    <small style="color:#888; font-family:monospace;">${productId}</small>
                </td>
                <td>${formatCurrency(product.price)}</td>
                <td>
                    <span class="badge ${product.stock_status || 'in_stock'}">
                        ${(product.stock_status || 'in stock').replace('_', ' ')}
                    </span>
                </td>
                <td>
                    <button class="action-btn" onclick="location.hash='#products/edit/${productId}'" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="window.deleteProduct('${productId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');

        window.deleteProduct = handleDelete;

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`;
    }
}

async function handleDelete(slug) {
    if (!confirm('Are you sure? This will remove it from the list (files remain).')) return;
    try {
        await saveData({ action: 'delete_product', id: slug }, 'admin123');
        showToast('Product removed from list');
        loadDataIntoTable();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
