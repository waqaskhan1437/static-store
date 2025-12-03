/**
 * API.js
 * Zimmedari: Data fetch karna aur save karna (Backend/Worker communication).
 * Is file mein koi HTML/DOM manipulation code nahi hona chahiye.
 */

// Products aur Orders fetch karne ke liye base URLs
const PORODUCTS_URL = '../json/products.json?v=' + Date.now(); // Cache avoid karne ke liye timestamp
const ORDERS_URL = '../json/orders.json?v=' + Date.now();
const API_ENDPOINT = '/api/admin'; // Worker.js ka endpoint (Example)

/**
 * Products list load karein
 * @returns {Promise<Array>} List of products
 */
export async function fetchProducts() {
    try {
        const response = await fetch(PORODUCTS_URL);
        if (!response.ok) throw new Error("Products file nahi mili.");
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("API Error (Products):", error);
        alert("Products load karne mein masla aa raha hai via API.");
        return [];
    }
}

/**
 * Orders list load karein
 * @returns {Promise<Array>} List of orders
 */
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

/**
 * Data Save karein (Worker.js ya Backend par)
 * @param {Object} payload - Jo data bhejna hai (action, products, etc)
 * @param {string} password - Admin password authentication ke liye
 */
export async function saveData(payload, password) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Pass': password // Simple Auth Header
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
        throw error; // Error ko upar pass karein taakay UI dikha sake
    }
}
