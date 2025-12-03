import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
import { renderCustomFields, setupCustomFieldsEvents } from './form-tabs/custom-fields.js';
import { saveData } from '../api.js';
import { showToast } from '../utils.js';
// HTML Generator import karein
import { generateProductHTML } from '../generator.js';

export function renderProductForm(product = {}) {
    const productId = product.slug || product.id || '';

    const tabsHtml = `
        <div class="tabs-header">
            <button class="tab-btn active" data-tab="tab-basic">Basic Info</button>
            <button class="tab-btn" data-tab="tab-media">Media</button>
            <button class="tab-btn" data-tab="tab-delivery">Delivery & Stock</button>
            <button class="tab-btn" data-tab="tab-custom">Form Builder & Addons</button>
        </div>
    `;

    const productWithId = { ...product, id: productId };

    const contentHtml = `
        <div id="tab-basic" class="tab-content active">${renderBasicInfo(productWithId)}</div>
        <div id="tab-media" class="tab-content">${renderMedia(product)}</div>
        <div id="tab-delivery" class="tab-content">${renderDelivery(product)}</div>
        <div id="tab-custom" class="tab-content">${renderCustomFields(product)}</div>
    `;

    // Demo Button
    const demoBtn = !productId ? 
        `<button type="button" id="btn-demo" class="btn" style="background:#8e44ad; color:white; font-weight:bold;">
            <i class="fas fa-magic"></i> Load Demo Data
         </button>` : '';

    return `
        <div class="form-container">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0;">${productId ? 'Edit Product' : 'New Product'}</h2>
                ${demoBtn}
            </div>
            
            <form id="product-form">
                <input type="hidden" name="existing_id" value="${productId}">
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

    // Demo Loader
    const demoBtn = document.getElementById('btn-demo');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            if(!confirm('Load demo data? This will clear current fields.')) return;
            // Short demo data for quick test
            const demoData = {
                title: "Custom Photo Frame",
                price: 1500,
                description: "High quality wooden frame.",
                images: ["https://placehold.co/600x400"],
                stock_status: "in_stock",
                customForm: [
                    { _type: 'text', label: 'Engraving Name', required: true },
                    { _type: 'checkbox_group', label: 'Extras', options_list: [{label:'Gift Wrap', price:200}] }
                ]
            };
            const container = document.getElementById('app-container');
            container.innerHTML = renderProductForm(demoData);
            setupFormEvents();
            showToast('Demo Data Loaded');
        });
    }

    // --- SAVE LOGIC (UPDATED FOR WORKER) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = 'Publishing...';

        try {
            const formData = new FormData(form);
            const raw = Object.fromEntries(formData.entries());

            // 1. Process Custom Fields
            const cardElements = document.querySelectorAll('.field-card');
            const customForm = Array.from(cardElements).map(card => {
                const type = card.dataset.type;
                const label = card.querySelector('[name="f_label"]').value;
                const required = card.querySelector('[name="f_req"]')?.checked || false;
                const rows = card.querySelector('[name="f_rows"]')?.value || 3;

                let options_list = [];
                if (card.querySelector('.opts-container')) {
                    const optRows = card.querySelectorAll('.opt-row');
                    options_list = Array.from(optRows).map(row => ({
                        label: row.querySelector('[name="opt_label"]').value,
                        price: parseFloat(row.querySelector('[name="opt_price"]').value) || 0,
                        file_qty: parseInt(row.querySelector('[name="opt_file_qty"]')?.value) || 0,
                        text_label: row.querySelector('[name="opt_text_label"]')?.value || '',
                        text_placeholder: row.querySelector('[name="opt_text_ph"]')?.value || ''
                    })).filter(o => o.label);
                }
                return { _type: type, label, required, rows: parseInt(rows), options_list };
            }).filter(f => f.label);

            // 2. Prepare Final Object
            let finalSlug = raw.existing_id;
            if (!finalSlug) {
                finalSlug = raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            }

            const finalProduct = {
                slug: finalSlug,
                id: finalSlug, // Keeping both for compatibility
                title: raw.title,
                price: parseFloat(raw.price) || 0,
                old_price: parseFloat(raw.old_price) || 0,
                description: raw.description,
                seoDescription: raw.seoDescription,
                images: raw.images ? raw.images.split('\n').map(s => s.trim()).filter(s => s) : [],
                video_url: raw.video_url,
                delivery_instant: !!raw.delivery_instant,
                delivery_physical: !!raw.delivery_physical,
                stock_status: raw.stock_status,
                min_photos: parseInt(raw.min_photos) || 0,
                customForm: customForm,
                photoOptions: raw.photoOptions ? raw.photoOptions.split(',').map(s => s.trim()) : [],
                tags: raw.tags ? raw.tags.split(',').map(s => s.trim()) : []
            };

            // 3. Generate HTML Content
            const htmlContent = generateProductHTML(finalProduct);

            // 4. Send to Worker (Format matches worker.js)
            await saveData({
                type: 'product',
                slug: finalSlug,
                data: finalProduct,
                html: htmlContent
            }, 'admin123');

            showToast('Product Published Successfully!');
            setTimeout(() => { window.location.hash = '#products'; }, 1500);

        } catch (error) {
            console.error(error);
            showToast('Error: ' + error.message, 'error');
            btn.disabled = false; btn.innerText = 'Save Product';
        }
    });
}
