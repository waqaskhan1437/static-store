/**
 * admin/js/utils.js
 * Common helper functions jo poore admin panel mein use honge.
 */

/**
 * Text se URL-friendly Slug banaye.
 * Example: "New T-Shirt 2024" -> "new-t-shirt-2024"
 */
export function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[\s\W-]+/g, '-')      // Replace spaces, non-word chars and dashes with a single dash (-)
        .replace(/^-+|-+$/g, '');       // Remove leading/trailing dashes
}

/**
 * Price format karein (PKR currency style)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Date format karein
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

/**
 * Form Data ko Object mein convert karein
 * @param {HTMLFormElement} formElement 
 */
export function getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        // Agar key pehle se hai (multiple checkboxes), to array bana do
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    return data;
}

/**
 * Simple Toast Notification dikhaye
 */
export function showToast(message, type = 'success') {
    // Check agar pehle se toast container hai
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white; padding: 12px 24px; margin-top: 10px;
        border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s, fadeOut 0.3s 2.7s forwards;
    `;

    container.appendChild(toast);

    // 3 seconds baad remove karein
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// CSS keyframes for Toast (Dynamically inject)
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);
