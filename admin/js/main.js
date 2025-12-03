import { renderProductsList } from './components/products-list.js';
import { renderProductForm, setupFormEvents } from './components/product-form.js';
import { renderOrdersList } from './components/orders.js';
import { fetchProducts } from './api.js';

/**
 * MAIN.JS
 * Application ka Brain. Yeh URL Hash change hone par content badalta hai.
 */

const appContainer = document.getElementById('app-container');
const pageTitle = document.getElementById('page-title');

// App start hone par listener lagayen
window.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('hashchange', handleRouting);

function initApp() {
    // Sidebar navigation active state manage karein
    setupSidebar();
    
    // Pehli baar route check karein
    handleRouting();
}

/**
 * Routing Logic
 * Hash (#products, #orders) ke hisab se component load karta hai.
 */
async function handleRouting() {
    const hash = window.location.hash || '#dashboard';
    
    // Default Title
    let title = 'Dashboard';
    
    // 1. PRODUCTS LIST
    if (hash === '#products') {
        title = 'Product Management';
        // HTML Inject karein
        appContainer.innerHTML = await renderProductsList();
        // Add Button dikhayein
        toggleAddButton(true);
    } 
    
    // 2. NEW PRODUCT FORM
    else if (hash === '#products/new') {
        title = 'Add New Product';
        appContainer.innerHTML = renderProductForm({}); // Empty form
        setupFormEvents(); // Events attach karein (Save, Tabs)
        toggleAddButton(false);
    } 
    
    // 3. EDIT PRODUCT FORM (#products/edit/123)
    else if (hash.startsWith('#products/edit/')) {
        title = 'Edit Product';
        const id = hash.split('/')[2];
        
        appContainer.innerHTML = '<div class="loading-spinner">Loading Product Data...</div>';
        
        // Product data layein taakay form fill kar sakein
        const products = await fetchProducts();
        const product = products.find(p => p.id == id);
        
        if (product) {
            appContainer.innerHTML = renderProductForm(product);
            setupFormEvents();
        } else {
            appContainer.innerHTML = '<div style="color:red; text-align:center;">Product not found!</div>';
        }
        toggleAddButton(false);
    }
    
    // 4. ORDERS LIST
    else if (hash === '#orders') {
        title = 'Customer Orders';
        appContainer.innerHTML = await renderOrdersList();
        toggleAddButton(false);
    }
    
    // 5. DASHBOARD (Default)
    else {
        title = 'Dashboard';
        appContainer.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h1>Welcome to Admin Panel</h1>
                <p>Select an option from the sidebar to manage your store.</p>
                <div style="margin-top:20px; display:flex; justify-content:center; gap:20px;">
                    <div style="background:white; padding:20px; width:200px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <h3>Products</h3>
                        <p style="color:#3498db; font-size:1.5rem;">Manage</p>
                    </div>
                    <div style="background:white; padding:20px; width:200px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <h3>Orders</h3>
                        <p style="color:#2ecc71; font-size:1.5rem;">View</p>
                    </div>
                </div>
            </div>
        `;
        toggleAddButton(false);
    }

    // Page Title Update
    if (pageTitle) pageTitle.innerText = title;
    
    // Sidebar Active State Update
    updateSidebarActiveState(hash);
}

/**
 * Sidebar Logic
 */
function setupSidebar() {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('Logout?')) window.location.href = '../index.html';
        });
    }
}

function updateSidebarActiveState(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        }
        // Sub-routes (e.g., #products/new) ke liye bhi parent active rahe
        if (hash.startsWith('#products') && link.getAttribute('href') === '#products') {
            link.classList.add('active');
        }
    });
}

/**
 * Helper: Add New Button Visibility
 */
function toggleAddButton(show) {
    const btn = document.getElementById('add-new-btn');
    if (!btn) return;
    
    if (show) {
        btn.style.display = 'inline-flex';
        btn.onclick = () => window.location.hash = '#products/new';
    } else {
        btn.style.display = 'none';
    }
}
