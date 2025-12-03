import { fetchProducts, saveData } from '../api.js';
import { formatCurrency, showToast, formatDate } from '../utils.js';

/**
 * Products List Component
 * Zimmedari: Products fetch karna aur Table show karna (With Date & Slug support).
 */

export async function renderProductsList() {
    // Non-blocking fetch trigger
    setTimeout(loadDataIntoTable, 0);

    return `
        <div class="table-container">
            <div style="padding: 15px; display:flex; justify-content:space-between; align-items:center;">
                <h3>All Products</h3>
                <input type="text" id="search-products" placeholder="Search..." style="padding:8px; border:1px solid #ddd; border-radius:4px; width: 250px;">
            </div>
            <table class="data-table" id="products-table">
                <thead>
                    <tr>
                        <th width="60">Img</th>
                        <th>Product Info</th>
                        <th>Published</th> <!-- New Date Column -->
                        <th>Price</th>
                        <th>Status</th>
                        <th width="120">Actions</th>
                    </tr>
                </thead>
                <tbody id="products-table-body">
                    <tr><td colspan="6" style="text-align:center; padding: 20px; color: #666;">Loading products...</td></tr>
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

    try {
        const products = await fetchProducts();

        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No products found. Click "Add New" to start!</td></tr>`;
            return;
        }

        // Sort by date (Newest first)
        // Agar date nahi hai to 0 maan kar end mein bhej denge
        products.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        tbody.innerHTML = products.map(product => {
            // Use Slug as ID if ID is missing or confusing
            const productId = product.slug || product.id; 
            
            // Image handling (Fallback if missing)
            const img = (product.images && product.images.length > 0) ? product.images[0] : 'https://placehold.co/40?text=No+Img';
            
            // Format Date (agar date save hui thi)
            const dateStr = product.date ? formatDate(product.date) : '<span style="color:#ccc;">-</span>';

            return `
            <tr>
                <td>
                    <img src="${img}" class="thumb" alt="${product.title}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #eee;">
                </td>
                <td>
                    <strong>${product.title}</strong><br>
                    <small style="color:#888; font-family:monospace; background:#f5f5f5; padding:2px 4px; border-radius:3px;">${productId}</small>
                </td>
                <td style="font-size: 0.9em; color: #555;">${dateStr}</td> <!-- Date Cell -->
                <td>${formatCurrency(product.price)}</td>
                <td>
                    <span class="badge ${product.stock_status || 'in_stock'}">
                        ${(product.stock_status || 'in stock').replace('_', ' ')}
                    </span>
                </td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="action-btn" onclick="location.hash='#products/edit/${productId}'" title="Edit Product">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="window.deleteProduct('${productId}')" title="Delete Product" style="color:#e74c3c; border-color:#e74c3c;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        // Delete function ko global scope mein daalna zaroori hai onclick ke liye
        window.deleteProduct = handleDelete;

        // Search functionality (Simple Filter)
        setupSearch(products);

    } catch (error) {
        console.error("Load Error:", error);
        tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center; padding:20px;">Error loading data: ${error.message}</td></tr>`;
    }
}

/**
 * Delete Handler
 */
async function handleDelete(slug) {
    if (!confirm('Are you sure you want to delete this product? This will remove it from the list.')) return;
    
    // UI Feedback (Optional: Row ko fade out kar sakte hain, par reload asaan hai)
    try {
        await saveData({ 
            action: 'delete_product', 
            id: slug 
        }, 'admin123'); // Password hardcoded for now

        showToast('Product removed successfully');
        loadDataIntoTable(); // Refresh table
    } catch (error) {
        showToast('Error deleting: ' + error.message, 'error');
    }
}

/**
 * Client-side Search Helper
 */
function setupSearch(allProducts) {
    const searchInput = document.getElementById('search-products');
    if(!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#products-table-body tr');
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}
