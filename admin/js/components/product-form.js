import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderAddons, setupAddonsEvents } from './form-tabs/addons.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
import { renderCustomFields, setupCustomFieldsEvents } from './form-tabs/custom-fields.js'; // New Import
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
            <button class="tab-btn" data-tab="tab-custom">Form Builder</button> <!-- New Tab -->
        </div>
    `;

    // 2. Tab Contents HTML
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
        <div id="tab-custom" class="tab-content">
            ${renderCustomFields(product)} <!-- New Content -->
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

    // 1. Setup Child Events
    setupBasicInfoEvents();
    setupMediaEvents();
    setupAddonsEvents();
    setupDeliveryEvents();
    setupCustomFieldsEvents(); // New Events

    // 2. Tab Switching Logic
    const tabBtns = form.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabBtns.forEach(b => b.classList.remove('active'));
            form.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Form Submit Logic (Complex Mapping)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving...';

        try {
            // Raw form data
            const formData = new FormData(form);
            const rawData = Object.fromEntries(formData.entries());

            // --- Manual Mapping for Arrays (Addons & Custom Fields) ---
            
            // 1. Map Addons
            const addonNames = formData.getAll('addon_name[]');
            const addonPrices = formData.getAll('addon_price[]');
            const addons = addonNames.map((name, i) => ({
                name: name,
                price: parseFloat(addonPrices[i]) || 0
            })).filter(a => a.name);

            // 2. Map Custom Fields (Builder)
            const fieldTypes = formData.getAll('field_type[]');
            const fieldLabels = formData.getAll('field_label[]');
            const fieldPlaceholders = formData.getAll('field_placeholder[]');
            const fieldOptions = formData.getAll('field_options[]');
            // Checkboxes are tricky in FormData, so we might need a workaround or assume order matches if all fields are present
            // Simplified approach: Iterate over DOM elements to ensure order
            const builderRows = document.querySelectorAll('.builder-row');
            const customForm = Array.from(builderRows).map(row => {
                return {
                    _type: row.querySelector('[name="field_type[]"]').value,
                    label: row.querySelector('[name="field_label[]"]').value,
                    placeholder: row.querySelector('[name="field_placeholder[]"]').value,
                    options: row.querySelector('[name="field_options[]"]').value,
                    required: row.querySelector('[name="field_required[]"]').checked
                };
            }).filter(f => f.label);

            // 3. Map Photo Options
            const photoOpts = rawData.photoOptions ? rawData.photoOptions.split(',').map(s => s.trim()) : [];

            // 4. Map Images (Split by newline)
            const images = rawData.images ? rawData.images.split('\n').map(s => s.trim()).filter(s => s) : [];

            // Final Object Construction
            const finalProduct = {
                id: rawData.id || rawData.title.toLowerCase().replace(/\s+/g, '-'),
                title: rawData.title,
                price: parseFloat(rawData.price) || 0,
                old_price: parseFloat(rawData.old_price) || 0,
                description: rawData.description,
                seoDescription: rawData.seoDescription,
                images: images,
                video_url: rawData.video_url,
                
                // Delivery
                delivery_instant: !!rawData.delivery_instant,
                delivery_physical: !!rawData.delivery_physical,
                stock_status: rawData.stock_status,
                min_photos: parseInt(rawData.min_photos) || 0,

                // Arrays
                addons: addons,
                customForm: customForm,
                photoOptions: photoOpts,
                
                tags: rawData.tags ? rawData.tags.split(',').map(s => s.trim()) : []
            };

            console.log("Saving Final Data:", finalProduct);

            await saveData({
                action: 'save_product',
                product: finalProduct
            }, 'admin123');

            showToast('Product saved successfully!');
            setTimeout(() => { window.location.hash = '#products'; }, 1000);

        } catch (error) {
            console.error(error);
            showToast('Error: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save Product';
        }
    });
}
