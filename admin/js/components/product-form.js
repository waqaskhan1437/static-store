import { renderBasicInfo, setupBasicInfoEvents } from './form-tabs/basic-info.js';
import { renderMedia, setupMediaEvents } from './form-tabs/media.js';
import { renderDelivery, setupDeliveryEvents } from './form-tabs/delivery.js';
import { renderCustomFields, setupCustomFieldsEvents } from './form-tabs/custom-fields.js';
import { saveData } from '../api.js';
import { showToast } from '../utils.js';

export function renderProductForm(product = {}) {
    // Use slug as the ID if id is missing
    const productId = product.slug || product.id || '';

    const tabsHtml = `
        <div class="tabs-header">
            <button class="tab-btn active" data-tab="tab-basic">Basic Info</button>
            <button class="tab-btn" data-tab="tab-media">Media</button>
            <button class="tab-btn" data-tab="tab-delivery">Delivery & Stock</button>
            <button class="tab-btn" data-tab="tab-custom">Form Builder & Addons</button>
        </div>
    `;

    // Pass the corrected ID (slug) to basic info
    const productWithId = { ...product, id: productId };

    const contentHtml = `
        <div id="tab-basic" class="tab-content active">${renderBasicInfo(productWithId)}</div>
        <div id="tab-media" class="tab-content">${renderMedia(product)}</div>
        <div id="tab-delivery" class="tab-content">${renderDelivery(product)}</div>
        <div id="tab-custom" class="tab-content">${renderCustomFields(product)}</div>
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
                <!-- Important: Store the Slug as existing_id -->
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

    // --- DEMO DATA LOADER LOGIC ---
    const demoBtn = document.getElementById('btn-demo');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            if(!confirm('Load heavy demo data? This will overwrite current fields.')) return;

            const demoData = {
                title: "Ultimate Custom Gift 2025 (Demo)",
                price: 5500,
                old_price: 7000,
                description: "This is a comprehensive demo to showcase the Advanced Form Builder 2025.\n\nIt features:\n- Cloudinary Integration (Video + Images)\n- Conditional Logic (File/Text requirements)\n- Complex Add-ons & Pricing\n- Long Text Areas",
                seoDescription: "A perfect demo for testing admin panel capabilities.",
                images: [
                    "https://res.cloudinary.com/demo/image/upload/v1590483864/fashion_product.jpg",
                    "https://res.cloudinary.com/demo/image/upload/v1590483329/sample.jpg",
                    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
                ],
                video_url: "https://res.cloudinary.com/demo/video/upload/v1590484059/dog.mp4",
                delivery_instant: false,
                delivery_physical: true,
                stock_status: "in_stock",
                tags: ["demo", "2025", "test"],
                customForm: [
                    { _type: 'header', label: 'Step 1: Personalization' },
                    { _type: 'text', label: 'Recipient Full Name', required: true },
                    { _type: 'email', label: 'Contact Email', required: true },
                    
                    { _type: 'header', label: 'Step 2: Customization Options' },
                    { 
                        _type: 'select', 
                        label: 'Choose Material Type', 
                        required: true, 
                        options_list: [
                            { label: 'Standard Wood', price: 0 },
                            { label: 'Premium Metal (+Logo File)', price: 500, file_qty: 1 },
                            { label: 'Gold Plated (+Engraving)', price: 1500, text_label: 'Name to Engrave', text_placeholder: 'Type name here...' }
                        ]
                    },
                    { 
                        _type: 'radio', 
                        label: 'Packaging Preference', 
                        options_list: [
                            { label: 'Eco-Friendly Pouch', price: 0 },
                            { label: 'Velvet Gift Box', price: 300 },
                            { label: 'Luxury Wooden Crate', price: 800 }
                        ]
                    },
                    
                    { _type: 'header', label: 'Step 3: Final Touches' },
                    { 
                        _type: 'textarea', 
                        label: 'Gift Message Card', 
                        rows: 5,
                        placeholder: 'Write your heartfelt message here...'
                    },
                    { 
                        _type: 'checkbox_group', 
                        label: 'Premium Add-ons', 
                        options_list: [
                            { label: 'Urgent Delivery (24 Hours)', price: 1000 },
                            { label: 'Remove Price Tag', price: 50 },
                            { label: 'Extended Warranty (1 Year)', price: 500 }
                        ]
                    },
                    { _type: 'file', label: 'Reference Image (Optional)' }
                ]
            };

            // Re-render the form with demo data
            const container = document.getElementById('app-container');
            container.innerHTML = renderProductForm(demoData);
            setupFormEvents(); // Re-attach events
            
            // Switch to Form Builder tab to show off features
            const customTabBtn = document.querySelector('[data-tab="tab-custom"]');
            if(customTabBtn) customTabBtn.click();
            
            showToast('Demo Data Loaded Successfully!');
        });
    }
    // -----------------------------

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = 'Saving...';

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

            // Construct Final Object
            let finalSlug = raw.existing_id;
            if (!finalSlug) {
                finalSlug = raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            }

            const finalProduct = {
                slug: finalSlug, 
                id: finalSlug,   
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
