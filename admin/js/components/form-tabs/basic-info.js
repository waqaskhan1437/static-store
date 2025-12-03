import { generateSlug } from '../../utils.js';

/**
 * Tab 1: Basic Information
 * HTML Template aur Events handle karta hai.
 */

export function renderBasicInfo(data = {}) {
    return `
        <div class="form-group">
            <label>Product Title *</label>
            <input type="text" id="inp_title" name="title" class="form-control" 
                   value="${data.title || ''}" required placeholder="e.g. Summer T-Shirt">
        </div>

        <div class="form-group">
            <label>URL Slug (Auto-generated)</label>
            <input type="text" id="inp_slug" name="id" class="form-control" 
                   value="${data.id || ''}" readonly style="background: #eee;">
            <p class="helper-text">Unique ID used in URL.</p>
        </div>

        <div class="row" style="display: flex; gap: 20px;">
            <div class="form-group" style="flex: 1;">
                <label>Price (PKR) *</label>
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
 * Events attach karein (Title change -> Slug update)
 */
export function setupBasicInfoEvents() {
    const titleInput = document.getElementById('inp_title');
    const slugInput = document.getElementById('inp_slug');

    if (titleInput && slugInput) {
        titleInput.addEventListener('input', (e) => {
            // Sirf tab slug update karein agar naya product ho (slug khali ho) 
            // ya user ne abhi edit shuru kiya ho.
            // (Filhal hum hamesha update kar rahe hain simplicity ke liye)
            const newSlug = generateSlug(e.target.value);
            slugInput.value = newSlug;
        });
    }
}
