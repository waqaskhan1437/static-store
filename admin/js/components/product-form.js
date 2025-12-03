// ... (imports same as before) ...
import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
import { renderCustomFields, setupCustomFieldsEvents } from './form-tabs/custom-fields.js';
import { saveData } from '../api.js';
import { showToast } from '../utils.js';

export function renderProductForm(product = {}) {
    // ... (same as before) ...
    const tabsHtml = `
        <div class="tabs-header">
            <button class="tab-btn active" data-tab="tab-basic">Basic Info</button>
            <button class="tab-btn" data-tab="tab-media">Media</button>
            <button class="tab-btn" data-tab="tab-delivery">Delivery & Stock</button>
            <button class="tab-btn" data-tab="tab-custom">Form Builder & Addons</button>
        </div>
    `;

    const contentHtml = `
        <div id="tab-basic" class="tab-content active">${renderBasicInfo(product)}</div>
        <div id="tab-media" class="tab-content">${renderMedia(product)}</div>
        <div id="tab-delivery" class="tab-content">${renderDelivery(product)}</div>
        <div id="tab-custom" class="tab-content">${renderCustomFields(product)}</div>
    `;
    
    // ... (return logic same as before) ...
    return `
        <div class="form-container">
            <h2 style="margin-bottom:20px;">${product.id ? 'Edit Product' : 'New Product'}</h2>
            <form id="product-form">
                <input type="hidden" name="existing_id" value="${product.id || ''}">
                ${tabsHtml}
                ${contentHtml}
                <div class="form-actions">
                    <button type="button" class="btn" onclick="location.hash='#products'">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Product</button>
                </div>
            </form>
        </div>
    `;
}

export function setupFormEvents() {
    // ... (event setups same as before) ...
    const form = document.getElementById('product-form');
    if (!form) return;

    setupBasicInfoEvents();
    setupMediaEvents();
    setupDeliveryEvents();
    setupCustomFieldsEvents();

    const tabBtns = form.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabBtns.forEach(b => b.classList.remove('active'));
            form.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Save Logic (UPDATED)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = 'Saving...';

        try {
            const formData = new FormData(form);
            const raw = Object.fromEntries(formData.entries());

            // --- Updated Builder Map Logic ---
            const cardElements = document.querySelectorAll('.field-card');
            const customForm = Array.from(cardElements).map(card => {
                const type = card.dataset.type;
                const label = card.querySelector('[name="f_label"]').value;
                const required = card.querySelector('[name="f_req"]')?.checked || false;

                let options_list = [];
                if (card.querySelector('.opts-container')) {
                    const optRows = card.querySelectorAll('.opt-row');
                    options_list = Array.from(optRows).map(row => ({
                        label: row.querySelector('[name="opt_label"]').value,
                        price: parseFloat(row.querySelector('[name="opt_price"]').value) || 0,
                        
                        // New Fields Captured Here
                        file_qty: parseInt(row.querySelector('[name="opt_file_qty"]')?.value) || 0,
                        text_label: row.querySelector('[name="opt_text_label"]')?.value || '',
                        text_placeholder: row.querySelector('[name="opt_text_ph"]')?.value || ''
                        
                    })).filter(o => o.label);
                }

                return {
                    _type: type,
                    label: label,
                    required: required,
                    options_list: options_list
                };
            }).filter(f => f.label);
            // --------------------------------

            const finalProduct = {
                id: raw.existing_id || raw.title.toLowerCase().replace(/\s+/g, '-'),
                title: raw.title,
                price: parseFloat(raw.price) || 0,
                old_price: parseFloat(raw.old_price) || 0,
                description: raw.description,
                images: raw.images ? raw.images.split('\n').map(s => s.trim()).filter(s => s) : [],
                delivery_instant: !!raw.delivery_instant,
                customForm: customForm,
                stock_status: raw.stock_status,
                tags: raw.tags ? raw.tags.split(',') : []
            };

            await saveData({ action: 'save_product', product: finalProduct }, 'admin123');
            showToast('Product Saved!');
            setTimeout(() => { window.location.hash = '#products'; }, 1000);
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
            btn.disabled = false; btn.innerText = 'Save Product';
        }
    });
}
