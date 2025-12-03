/**
 * Tab 4: Delivery & Extra Options
 * Delivery styling aur digar settings handle karta hai.
 */

export function renderDelivery(data = {}) {
    return `
        <div class="form-group">
            <label>Delivery Options</label>
            <div class="checkbox-group">
                <label style="display:block; margin: 5px 0;">
                    <input type="checkbox" name="delivery_instant" value="true" 
                           ${data.delivery_instant ? 'checked' : ''}> 
                    Instant Delivery (Email/Download)
                </label>
                
                <label style="display:block; margin: 5px 0;">
                    <input type="checkbox" name="delivery_physical" value="true" 
                           ${data.delivery_physical ? 'checked' : ''}> 
                    Physical Delivery (Courier)
                </label>
            </div>
        </div>

        <div class="row" style="display: flex; gap: 20px; margin-top: 20px;">
            <div class="form-group" style="flex: 1;">
                <label>Min Photos Required</label>
                <input type="number" name="min_photos" class="form-control" 
                       value="${data.min_photos || 0}">
                <p class="helper-text">If user needs to upload photos.</p>
            </div>

            <div class="form-group" style="flex: 1;">
                <label>Stock Status</label>
                <select name="stock_status" class="form-control">
                    <option value="in_stock" ${data.stock_status === 'in_stock' ? 'selected' : ''}>In Stock</option>
                    <option value="out_of_stock" ${data.stock_status === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
                    <option value="pre_order" ${data.stock_status === 'pre_order' ? 'selected' : ''}>Pre-Order</option>
                </select>
            </div>
        </div>
    `;
}

export function setupDeliveryEvents() {
    // Filhal yahan koi complex event nahi hai
}
