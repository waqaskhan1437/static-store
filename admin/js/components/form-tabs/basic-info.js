import { generateSlug } from '../../utils.js';

/**
 * Tab 1: Basic Information
 * Handles HTML Template and Events.
 * FIXED: Slug is now Editable for SEO
 */

export function renderBasicInfo(data = {}) {
    return `
        <div class="form-group">
            <label>Product Title *</label>
            <input type="text" id="inp_title" name="title" class="form-control" 
                   value="${data.title || ''}" required placeholder="e.g. Summer T-Shirt">
        </div>

        <div class="form-group">
            <label>URL Slug (Permalink) *</label>
            <div style="display:flex; gap:10px;">
                <span style="padding:10px; background:#eee; border:1px solid #ddd; border-right:0; border-radius:4px 0 0 4px;">/products/</span>
                <input type="text" id="inp_slug" name="slug" class="form-control" 
                       value="${data.slug || data.id || ''}" 
                       placeholder="custom-product-url"
                       style="border-radius:0 4px 4px 0;">
            </div>
            <p class="helper-text">Edit this to optimize your URL for SEO (e.g. 'best-custom-gift-2025').</p>
        </div>

        <div class="row" style="display: flex; gap: 20px;">
            <div class="form-group" style="flex: 1;">
                <label>Price (USD) *</label>
                <input type="number" name="price" class="form-control" 
                       value="${data.price || ''}" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Old Price (Optional)</label>
                <input type="number" name="old_price" class="form-control" 
                       value="${data.old_price || ''}">
            </div>
        </div>

        <div class="form-group">
            <label>Category</label>
            <select name="category" class="form-control">
                <option value="general" ${data.category === 'general' ? 'selected' : ''}>General</option>
                <option value="clothing" ${data.category === 'clothing' ? 'selected' : ''}>Clothing</option>
                <option value="accessories" ${data.category === 'accessories' ? 'selected' : ''}>Accessories</option>
                <option value="digital" ${data.category === 'digital' ? 'selected' : ''}>Digital Product</option>
            </select>
        </div>

        <div class="form-group">
            <label>Tags (Comma separated)</label>
            <input type="text" name="tags" class="form-control" 
                   value="${data.tags ? data.tags.join(', ') : ''}" placeholder="new, sale, summer">
        </div>
    `;
}

/**
 * Attach Events (Title change -> Slug update ONLY if slug is empty)
 */
export function setupBasicInfoEvents() {
    const titleInput = document.getElementById('inp_title');
    const slugInput = document.getElementById('inp_slug');

    if (titleInput && slugInput) {
        titleInput.addEventListener('input', (e) => {
            // Sirf tab auto-fill karein agar slug khali hai, warn user ka likha hua overwrite na ho
            if (!slugInput.value) {
                const newSlug = generateSlug(e.target.value);
                slugInput.value = newSlug;
            }
        });
        
        // Slug ko clean rakhne ke liye (spaces ko dash mein badalna)
        slugInput.addEventListener('blur', (e) => {
            slugInput.value = generateSlug(e.target.value);
        });
    }
}
