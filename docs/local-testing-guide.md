# Local Testing Guide

This guide explains how to run the static store and admin panel locally.

## Prerequisites

- A modern web browser.
- Internet connection to fetch remote dependencies (if any).
- For API testing, a deployed Cloudflare Worker endpoint with secrets set up.

## Running the Front‑End

1. Clone or download this repository to your machine.
2. Open `index.html` in your browser. This page loads `json/products.json` and shows a simple product list.

## Running the Admin Panel

1. Open `admin/admin.html` directly in your browser. You should see the admin panel with tabs for products, landing pages and orders.
2. Before saving any data, open the `admin.js` file and set `WORKER_URL` to point to your deployed Cloudflare Worker endpoint (e.g., `https://my-worker.example.workers.dev/api/publish`).
3. Use the forms to create or update products, landing pages or orders. After submission, the panel will call your Worker API.

## Testing Without a Worker

If you do not yet have a Worker deployed, you can still test the front‑end by manually editing the JSON files inside the `json` folder and creating your own HTML files in `products/` and `landing/`.

## Viewing Generated Pages

After committing changes and pushing to GitHub, Cloudflare Pages will build and deploy automatically. You can preview your changes by visiting the new URLs in your Pages site:

- Products: `/products/{slug}.html`
- Landing pages: `/landing/{slug}.html`