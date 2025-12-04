/**
 * admin/js/api.js
 * FIXED: Export names matched & Fetching from JSON directly
 */

// Worker URL sirf SAVE karne (POST) ke liye use hoga
const WORKER_URL = "https://old-mountain-402astore-api.waqaskhan1437.workers.dev";

// Common helper to fetch data
export async function getData(type) {
    try {
        // Worker ki bajaye direct JSON files se data lein
        // admin/admin.html ke relative path se: ../json/products.json
        const endpoint = type === 'orders' ? '../json/orders.json' : '../json/products.json';
        
        // Cache bust karne ke liye timestamp lagaya taake naya data mile
        const res = await fetch(`${endpoint}?v=${Date.now()}`);
        
        if (!res.ok) throw new Error(`Failed to load ${type}`);
        
        return await res.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        return []; // Agar error aaye to empty list return karein
    }
}

// Wrapper Functions (Jo components dhoondh rahe hain)
export async function fetchProducts() {
    return await getData('products');
}

export async function fetchOrders() {
    return await getData('orders');
}

// Save Data (Yeh Worker pe hi jayega)
export async function saveData(payload, password) {
    try {
        const res = await fetch(`${WORKER_URL}/api/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Pass': password
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Update failed");
        }

        return data;
    } catch (error) {
        console.error("Save Error:", error);
        throw error;
    }
}
