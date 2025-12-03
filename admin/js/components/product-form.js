import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
// Addons file removed, replaced by custom-fields
import { renderCustomFields, setupCustomFieldsEvents } from './form-tabs/custom-fields.js';
import { saveData } from '../api.js';
import { showToast } from '../utils.js';

export function renderProductForm(product = {}) {
    // Note: Removed "Add-ons" tab
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
    const form = document.getElementById('product-form');
    if (!form) return;

    setupBasicInfoEvents();
    setupMediaEvents();
    setupDeliveryEvents();
    setupCustomFieldsEvents();

    // Tab Switching
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

    // Save Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = 'Saving...';

        try {
            const formData = new FormData(form);
            const raw = Object.fromEntries(formData.entries());

            // Build Custom Form Array
            const builderRows = document.querySelectorAll('.builder-row');
            const customForm = Array.from(builderRows).map(row => ({
                _type: row.querySelector('[name="field_type[]"]').value,
                label: row.querySelector('[name="field_label[]"]').value,
                placeholder: row.querySelector('[name="field_placeholder[]"]').value,
                options: row.querySelector('[name="field_options[]"]').value, // Contains "Red:500" logic
                required: row.querySelector('[name="field_required[]"]').checked
            })).filter(f => f.label);

            const finalProduct = {
                id: raw.existing_id || raw.title.toLowerCase().replace(/\s+/g, '-'),
                title: raw.title,
                price: parseFloat(raw.price) || 0,
                old_price: parseFloat(raw.old_price) || 0,
                description: raw.description,
                images: raw.images ? raw.images.split('\n').map(s => s.trim()).filter(s => s) : [],
                delivery_instant: !!raw.delivery_instant,
                customForm: customForm, // Ab addons bhi isi array mein hain as 'checkbox_group'
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
