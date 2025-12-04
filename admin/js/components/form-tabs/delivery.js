export function renderDelivery(product) {
    return `
        <div class="form-group">
            <label style="font-size:1.1rem; font-weight:bold; margin-bottom:10px; display:block;">
                <i class="fas fa-truck"></i> Delivery Time
            </label>
            
            <p style="color:#666; font-size:0.9rem; margin-bottom:10px;">
                Enter the estimated delivery time (e.g. "1 Day", "Instant", "2-3 Working Days").
            </p>

            <input type="text" name="delivery_time" class="form-control" 
                   value="${product.delivery_time || ''}" 
                   placeholder="e.g. 1 Day" 
                   style="width:100%; padding:10px; font-size:1rem; border:1px solid #ccc; border-radius:5px;">
        </div>
    `;
}

export function setupDeliveryEvents() {
    // Ab yahan kisi event listener ki zaroorat nahi hai kyunke simple text field hai.
}
