import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
import { renderCustomFields, setupCustomFieldsEvents } from './form-tabs/custom-fields.js';
import { saveData } from '../api.js';
import { showToast } from '../utils.js';
import { generateProductHTML } from '../generator.js';

/**
 * Helper: Converts Old Data Types to New Form Builder Format
 * Yeh function purane "textField" wagera ko naye "text" format mein badal deta hai.
 */
function normalizeLegacyData(customForm) {
    if (!Array.isArray(customForm)) return [];

    return customForm.map(field => {
        // Agar pehle se naya format hai to wapis bhej do
        if (['header', 'text', 'textarea', 'email', 'select', 'radio', 'checkbox_group', 'file'].includes(field._type)) {
            return field;
        }

        // Old Types Mapping
        let newType = 'text';
        let newOptions = [];

        switch (field._type) {
            case 'textField': newType = 'text'; break;
            case 'textAreaField': newType = 'textarea'; break;
            case 'selectField': newType = 'select'; break;
            case 'radioField': newType = 'radio'; break;
            case 'checkboxField': newType = 'checkbox_group'; break;
            case 'fileUploadField': newType = 'file'; break;
            default: newType = 'text';
        }

        // Convert Old Options String ("A, B, C") to Object Array
        if (field.options && typeof field.options === 'string') {
            newOptions = field.options.split(',').map(s => ({
                label: s.trim(),
                price: 0,
                file_qty: 0,
                text_label: ''
            })).filter(o => o.label);
        } else if (field.options_list) {
            newOptions = field.options_list;
        }

        // Special Fix for Old Single Checkbox (e.g. Terms)
        if (field._type === 'checkboxField' && newOptions.length === 0) {
            newOptions = [{ label: field.label || 'Yes', price: 0 }];
        }

        return {
            _type: newType,
            label: field.label,
            required: !!field.required,
            placeholder: field.placeholder || '',
            rows: field.rows || 3,
            options_list: newOptions
        };
    });
}

/**
 * Main Product Form Component
 * Handles rendering, events, demo data, and saving logic.
 * FIXED: Date persistence, English Comments, Updated Delivery Logic, Legacy Data Normalization
 */

export function renderProductForm(product = {}) {
    const productId = product.slug || product.id || '';
    const createdDate = product.date || ''; // Preserve original date

    // 🔥 FIX: Normalize Data before rendering
    // Yeh line purane data ko naye format mein convert karti hai taake form builder tootay na
    const normalizedForm = normalizeLegacyData(product.customForm || []);
    const productWithId = { ...product, id: productId, customForm: normalizedForm };

    const tabsHtml = `
        <div class="tabs-header">
            <button class="tab-btn active" data-tab="tab-basic">Basic Info</button>
            <button class="tab-btn" data-tab="tab-media">Media</button>
            <button class="tab-btn" data-tab="tab-delivery">Delivery</button>
            <button class="tab-btn" data-tab="tab-custom">Form Builder</button>
        </div>
    `;

    const contentHtml = `
        <div id="tab-basic" class="tab-content active">${renderBasicInfo(productWithId)}</div>
        <div id="tab-media" class="tab-content">${renderMedia(product)}</div>
        <div id="tab-delivery" class="tab-content">${renderDelivery(product)}</div>
        <div id="tab-custom" class="tab-content">${renderCustomFields(productWithId)}</div>
    `;

    // Demo Button only for New Products
    const demoBtn = !productId ? 
        `<button type="button" id="btn-demo" class="btn" style="background:#8e44ad; color:white; font-weight:bold;">
            <i class="fas fa-magic"></i> Load Demo Data
         </button>` 
        : '';

    return `
        <div class="form-container">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0;">${productId ? 'Edit Product' : 'New Product'}</h2>
                ${demoBtn}
            </div>
            
            <form id="product-form">
                <input type="hidden" name="existing_id" value="${productId}">
                <input type="hidden" name="existing_date" value="${createdDate}">
                
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

    // Demo Loader Logic
    const demoBtn = document.getElementById('btn-demo');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            if(!confirm('Load demo data? This will overwrite current fields.')) return;
            
            const demoData = {
                title: "Ultimate Custom Gift 2025 (Demo)",
                price: 55,
                old_price: 70,
                description: "This is a comprehensive demo to showcase the Advanced Form Builder.\n\nIt features:\n- Cloudinary Integration\n- Conditional Logic\n- Complex Add-ons\n- Long Text Areas",
                seoDescription: "A perfect demo for testing capabilities.",
                images: [
                    "https://placehold.co/600x600?text=Main+Image",
                    "https://placehold.co/600x600?text=Side+View"
                ],
                video_url: "",
                is_instant: false,
                delivery_time: "2 Days",
                stock_status: "in_stock",
                tags: ["demo", "2025"],
                customForm: [
                    { _type: 'header', label: 'Step 1: Personalization' },
                    { _type: 'text', label: 'Recipient Name', required: true },
                    { 
                        _type: 'select', 
                        label: 'Material', 
                        required: true, 
                        options_list: [
                            { label: 'Standard Wood', price: 0 },
                            { label: 'Premium Metal', price: 10, file_qty: 1 },
                            { label: 'Gold Plated', price: 25, text_label: 'Engraving Name' }
                        ]
                    }
                ]
            };

            const container = document.getElementById('app-container');
            container.innerHTML = renderProductForm(demoData);
            setupFormEvents();
            
            const customTabBtn = document.querySelector('[data-tab="tab-custom"]');
            if(customTabBtn) customTabBtn.click();

            showToast('Demo Data Loaded Successfully!');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = 'Publishing...';

        try {
            const formData = new FormData(form);
            const raw = Object.fromEntries(formData.entries());

            // Process Custom Fields
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

            let finalSlug = raw.existing_id;
            if (!finalSlug) {
                finalSlug = raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            }

            const publishDate = raw.existing_date || new Date().toISOString();

            // Final Product Object
            const finalProduct = {
                slug: finalSlug, 
                id: finalSlug,
                date: publishDate,
                title: raw.title,
                price: parseFloat(raw.price) || 0,
                old_price: parseFloat(raw.old_price) || 0,
                description: raw.description,
                seoDescription: raw.seoDescription,
                images: raw.images ? raw.images.split('\n').map(s => s.trim()).filter(s => s) : [],
                video_url: raw.video_url,
                
                // Delivery Logic Update
                is_instant: !!raw.is_instant,
                delivery_time: raw.delivery_time || 'Standard',
                
                stock_status: raw.stock_status,
                customForm: customForm,
                tags: raw.tags ? raw.tags.split(',').map(s => s.trim()) : []
            };

            const htmlContent = generateProductHTML(finalProduct);

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
