import { fetchOrders } from '../api.js';
import { formatDate, formatCurrency } from '../utils.js';

/**
 * Orders List Component
 * Zimmedari: Orders data fetch karna aur Table show karna.
 */

export async function renderOrdersList() {
    // Non-blocking fetch trigger
    setTimeout(loadOrdersData, 0);

    return `
        <div class="table-container">
            <h3 style="margin-bottom:15px; padding:15px;">Recent Orders</h3>
            <table class="data-table" id="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="orders-table-body">
                    <tr><td colspan="6" style="text-align:center;">Loading orders...</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

async function loadOrdersData() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    const orders = await fetchOrders();

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No orders found yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><span style="font-family:monospace;">#${order.id}</span></td>
            <td>${formatDate(order.date)}</td>
            <td>
                <strong>${order.customer_name}</strong><br>
                <small>${order.customer_email || ''}</small>
            </td>
            <td>${order.items ? order.items.length : 0} items</td>
            <td>${formatCurrency(order.total_price)}</td>
            <td>
                <span class="badge ${order.status === 'completed' ? 'in_stock' : 'pre_order'}">
                    ${order.status}
                </span>
            </td>
        </tr>
    `).join('');
}
