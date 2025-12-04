/**
 * admin/js/api.js
 * Connects Admin Panel to Cloudflare Worker
 * FIXED: Uses Live Worker API for instant updates
 */

// ✅ AAPKA LIVE WORKER LINK (Trailing slash removed)
const WORKER_URL = "https://old-mountain-402astore-api.waqaskhan1437.workers.dev";

export async function getData(type) {
    try {
        // Decide endpoint based on type
        const endpoint = type === 'orders' ? '/api/orders' : '/api/products';
        
        // Fetch fresh data from Worker (No caching)
        const res = await fetch(`${WORKER_URL}${endpoint}`, {
            cache: 'no-store'
        });
        
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        
        return await res.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        // Fallback: Agar worker fail ho jaye to local file try karo (Optional)
        return [];
    }
}

export async function saveData(payload, password) {
    try {
        const res = await fetch(`${WORKER_URL}/api/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Pass': password // Optional security header
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
