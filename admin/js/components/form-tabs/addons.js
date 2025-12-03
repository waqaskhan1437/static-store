/**
 * Tab 3: Add-ons Management
 * Dynamic rows handle karta hai (Add/Remove addons).
 */

export function renderAddons(data = {}) {
    const addons = data.addons || [];
    
    // Pehle se majood addons ki rows generate karein
    const rowsHtml = addons.map((addon, index) => generateAddonRow(addon, index)).join('');

    return `
        <div class="form-group">
            <label>Manage Add-ons</label>
            <p class="helper-text">Add extra services users can buy.</p>
            
            <div id="addons-list-container">
                ${rowsHtml}
            </div>

            <button type="button" id="btn-add-addon" class="btn-add-more">
                <i class="fas fa-plus"></i> Add Another Service
            </button>
        </div>
    `;
}

/**
 * Single Row HTML generator helper
 */
function generateAddonRow(addon = {name: '', price: ''}, index = Date.now()) {
    return `
        <div class="addon-row" data-id="${index}">
            <input type="text" name="addon_name[]" class="form-control" 
                   placeholder="Service Name (e.g. Gift Wrap)" value="${addon.name}" required>
            
            <input type="number" name="addon_price[]" class="form-control" 
                   placeholder="Price" value="${addon.price}" style="width: 150px;" required>
            
            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

/**
 * Events: Add Button click par nayi row lagana
 */
export function setupAddonsEvents() {
    const addBtn = document.getElementById('btn-add-addon');
    const container = document.getElementById('addons-list-container');

    if (addBtn && container) {
        addBtn.addEventListener('click', () => {
            // Nayi row container mein append karein
            const newRow = generateAddonRow();
            container.insertAdjacentHTML('beforeend', newRow);
        });
    }
}
