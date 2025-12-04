/**
 * admin/js/components/form-tabs/delivery.js
 * FIXED: Strictly English Text
 */

export function renderDelivery(product) {
    const isInstant = product.is_instant ? 'checked' : '';
    
    return `
        <div class="form-group">
            <label style="font-size:1.1rem; font-weight:bold; margin-bottom:15px; display:block;">
                <i class="fas fa-truck"></i> Delivery Settings
            </label>
            
            <div style="background:#e8f5e9; padding:15px; border-radius:8px; border:1px solid #c8e6c9; margin-bottom:15px;">
                <label style="display:flex; align-items:center; cursor:pointer; gap:10px; font-weight:bold; color:#2e7d32;">
                    <input type="checkbox" name="is_instant" ${isInstant} style="transform:scale(1.5);">
                    Enable Instant Delivery (60 Minutes)
                </label>
                <p style="margin:5px 0 0 25px; font-size:0.85rem; color:#666;">
                    Select this option if the product is delivered immediately via Email or WhatsApp.
                </p>
            </div>

            <div id="manual-delivery-input">
                <label style="font-weight:600; margin-bottom:5px; display:block;">Standard Delivery Time (Days):</label>
                <input type="text" name="delivery_time" class="form-control" 
                       value="${product.delivery_time || ''}" 
                       placeholder="e.g. 1 or 2" 
                       style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                <p style="font-size:0.8rem; color:#888; margin-top:5px;">
                    Enter <b>"1"</b> for 24 Hours Express, <b>"2"</b> for 2 Days Delivery.
                </p>
            </div>
        </div>
    `;
}

export function setupDeliveryEvents() {
    // Logic: Dim the manual input if Instant is checked
    const chk = document.querySelector('input[name="is_instant"]');
    const inputDiv = document.getElementById('manual-delivery-input');
    
    if(chk && inputDiv) {
        chk.addEventListener('change', () => {
            if(chk.checked) inputDiv.style.opacity = '0.5';
            else inputDiv.style.opacity = '1';
        });
        // Initial state check
        if(chk.checked) inputDiv.style.opacity = '0.5';
    }
}
