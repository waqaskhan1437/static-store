import { renderProductsList } from './components/products-list.js';
import { renderProductForm, setupFormEvents } from './components/product-form.js';
import { renderOrdersList } from './components/orders.js';
import { fetchProducts } from './api.js';

const appContainer = document.getElementById('app-container');
const pageTitle = document.getElementById('page-title');

window.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('hashchange', handleRouting);

function initApp() {
    setupSidebar();
    handleRouting();
}

async function handleRouting() {
    const hash = window.location.hash || '#dashboard';
    let title = 'Dashboard';
    
    // 1. PRODUCTS LIST
    if (hash === '#products') {
        title = 'Product Management';
        appContainer.innerHTML = await renderProductsList();
        toggleAddButton(true);
    } 
    
    // 2. NEW PRODUCT
    else if (hash === '#products/new') {
        title = 'Add New Product';
        appContainer.innerHTML = renderProductForm({});
        setupFormEvents();
        toggleAddButton(false);
    } 
    
    // 3. EDIT PRODUCT (Fix: Find by Slug)
    else if (hash.startsWith('#products/edit/')) {
        title = 'Edit Product';
        const slug = hash.split('/')[2]; // Get slug from URL
        
        appContainer.innerHTML = '<div class="loading-spinner">Loading Product Data...</div>';
        
        try {
            const products = await fetchProducts();
            // Check both slug and id properties
            const product = products.find(p => (p.slug === slug) || (p.id === slug));
            
            if (product) {
                appContainer.innerHTML = renderProductForm(product);
                setupFormEvents();
            } else {
                appContainer.innerHTML = `<div style="color:red; text-align:center; padding:20px;">
                    <h3>Product Not Found!</h3>
                    <p>Could not find product with slug: <b>${slug}</b></p>
                    <button class="btn" onclick="location.hash='#products'">Go Back</button>
                </div>`;
            }
        } catch (e) {
            appContainer.innerHTML = 'Error loading data.';
        }
        toggleAddButton(false);
    }
    
    // 4. ORDERS
    else if (hash === '#orders') {
        title = 'Customer Orders';
        appContainer.innerHTML = await renderOrdersList();
        toggleAddButton(false);
    }
    
    // 5. DASHBOARD
    else {
        title = 'Dashboard';
        appContainer.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h1>Welcome to Admin Panel</h1>
                <p>Select an option from the sidebar to manage your store.</p>
            </div>
        `;
        toggleAddButton(false);
    }

    if (pageTitle) pageTitle.innerText = title;
    updateSidebarActiveState(hash);
}

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
        const href = link.getAttribute('href');
        if (href === hash || (hash.startsWith(href) && href !== '#dashboard')) {
            link.classList.add('active');
        }
    });
}

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
