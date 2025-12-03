/**
 * API.js
 * Zimmedari: Data fetch karna aur Cloudflare Worker par save karna.
 */

// --- UPDATED WORKER URL ---
// Aapka naya Cloudflare Worker Link (Trailing slash removed for safety)
const WORKER_BASE_URL = 'https://old-mountain-402astore-api.waqaskhan1437.workers.dev'; 

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
    // Check if URL is placeholder
    if (WORKER_BASE_URL.includes('YAHAN-APNA')) {
        alert('API URL set nahi hai! admin/js/api.js check karein.');
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
            const errText = await response.text();
            throw new Error(errText || "Save failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Save Error:", error);
        throw error;
    }
}
