import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderAddons, setupAddonsEvents } from './form-tabs/addons.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
import { getFormData, showToast } from '../utils.js';
import { saveData } from '../api.js';

/**
 * Product Form Component
 * Zimmedari: Tabs ko assemble karna aur final Save handle karna.
 */

export function renderProductForm(product = {}) {
    // 1. Tab Headers HTML
    const tabsHtml = `
        <div class="tabs-header">
            <button class="tab-btn active" data-tab="tab-basic">Basic Info</button>
            <button class="tab-btn" data-tab="tab-media">Media</button>
            <button class="tab-btn" data-tab="tab-addons">Add-ons</button>
            <button class="tab-btn" data-tab="tab-delivery">Delivery</button>
        </div>
    `;

    // 2. Tab Contents HTML (har tab alag file se aa raha hai)
    const contentHtml = `
        <div id="tab-basic" class="tab-content active">
            ${renderBasicInfo(product)}
        </div>
        <div id="tab-media" class="tab-content">
            ${renderMedia(product)}
        </div>
        <div id="tab-addons" class="tab-content">
            ${renderAddons(product)}
        </div>
        <div id="tab-delivery" class="tab-content">
            ${renderDelivery(product)}
        </div>
    `;

    // 3. Full Form Container
    return `
        <div class="form-container">
            <h2 style="margin-bottom:20px;">${product.id ? 'Edit Product' : 'New Product'}</h2>
            
            <form id="product-form">
                <!-- Hidden ID for Updates -->
                <input type="hidden" name="existing_id" value="${product.id || ''}">

                ${tabsHtml}
                ${contentHtml}

                <div class="form-actions">
                    <button type="button" class="btn" onclick="location.hash='#products'">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Product
                    </button>
                </div>
            </form>
        </div>
    `;
}

/**
 * Events: Tabs Switching aur Form Submit handle karna
 */
export function setupFormEvents() {
    const form = document.getElementById('product-form');
    if (!form) return;

    // 1. Setup Child Events (Add-on rows add karna, Slug update etc)
    setupBasicInfoEvents();
    setupMediaEvents();
    setupAddonsEvents();
    setupDeliveryEvents();

    // 2. Tab Switching Logic
    const tabBtns = form.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Form submit hone se rokein
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            form.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active to current
            btn.classList.add('active');
            const targetId = btn.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Form Submit Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving...';

        try {
            const formData = getFormData(form);
            
            // Data ko format karein (Arrays handle karein)
            // Note: `utils.js` ka getFormData basic hai, agar complex structure chahiye
            // to yahan manual mapping ki ja sakti hai.
            
            console.log("Saving Data:", formData);

            // API Call (Filhal password hardcoded hai testing ke liye)
            await saveData({
                action: 'save_product',
                product: formData
            }, 'admin123');

            showToast('Product saved successfully!');
            
            // Thora wait kar ke wapis list par jayein
            setTimeout(() => {
                window.location.hash = '#products';
            }, 1000);

        } catch (error) {
            console.error(error);
            showToast('Error saving product: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save Product';
        }
    });
}
