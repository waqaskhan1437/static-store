# Whop Test Webhook Simulation Guide

This repository does not include a server to handle external webhooks; however you can simulate posting data to the Cloudflare Worker as follows.

## Using cURL

You can test your Worker endpoint by sending a POST request with JSON:

```bash
curl -X POST https://your-worker-url/api/publish \
  -H "Content-Type: application/json" \
  -d '{
        "type": "product",
        "slug": "test-product",
        "data": {
          "slug": "test-product",
          "title": "Test Product",
          "price": 10,
          "images": ["https://example.com/img.jpg"],
          "videos": [],
          "description": "A test product",
          "tags": ["test"]
        },
        "html": "<!DOCTYPE html><html><head><title>Test Product</title></head><body><h1>Test Product</h1></body></html>"
      }'
```

Replace `https://your-worker-url/api/publish` with your real Worker URL. The Worker will update `json/products.json` and create `products/test-product.html` in your repository.

## Automating with Postman

Alternatively, use Postman or any API client to configure the request:

- **Method:** POST
- **URL:** `https://your-worker-url/api/publish`
- **Headers:** `Content-Type: application/json`
- **Body:** Raw JSON with fields `type`, `slug`, `data` and `html` as shown above.

When the request succeeds, GitHub will commit the changes and Cloudflare Pages will redeploy automatically.