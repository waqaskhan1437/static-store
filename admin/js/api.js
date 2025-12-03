/**
 * API.js
 * Zimmedari: Data fetch karna aur Cloudflare Worker par save karna.
 */

// --- IMPORTANT CONFIGURATION ---
// Apne Cloudflare Worker ka URL yahan likhein (baghair /api/publish ke)
// Example: 'https://my-store-worker.username.workers.dev'
const WORKER_BASE_URL = 'https://YOUR-WORKER-URL.workers.dev'; 

const API_ENDPOINT = `${WORKER_BASE_URL}/api/publish`;
const PRODUCTS_URL = '../json/products.json?v=' + Date.now();
const ORDERS_URL = '../json/orders.json?v=' + Date.now();

export async function fetchProducts() {
    try {
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) throw new Error("Products file nahi mili.");
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("API Error (Products):", error);
        return [];
    }
}

export async function fetchOrders() {
    try {
        const response = await fetch(ORDERS_URL);
        if (!response.ok) throw new Error("Orders file nahi mili.");
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("API Error (Orders):", error);
        return [];
    }
}

export async function saveData(payload, password) {
    // Check if user forgot to set URL
    if (WORKER_BASE_URL.includes('YOUR-WORKER-URL')) {
        alert('Please update admin/js/api.js with your Cloudflare Worker URL.');
        throw new Error("Worker URL not configured");
    }

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Pass': password
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Agar 405 ab bhi aye to iska matlab URL ghalat hai
            if(response.status === 405) {
                throw new Error("Error 405: Ghalat URL. Make sure aap Cloudflare Worker ka link use kar rahe hain, Github ka nahi.");
            }
            const errText = await response.text();
            throw new Error(errText || "Save failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Save Error:", error);
        throw error;
    }
}
