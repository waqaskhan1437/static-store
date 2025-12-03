export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/publish') {
      try {
        const payload = await request.json();
        const { type, slug, data, html } = payload;
        const owner = env.GITHUB_OWNER;
        const repo = env.GITHUB_REPO;
        const branch = env.GITHUB_BRANCH || 'main';
        if (!env.GITHUB_TOKEN || !owner || !repo) {
          return new Response('Missing GitHub configuration', { status: 500 });
        }
        // Helper to fetch file info from GitHub
        async function getFile(path) {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
            headers: {
              Authorization: `Bearer ${env.GITHUB_TOKEN}`,
              'User-Agent': 'cloudflare-worker'
            }
          });
          if (res.status === 200) {
            return await res.json();
          }
          return null;
        }
        // Get current SHA of a file if it exists
        async function getFileSha(path) {
          const file = await getFile(path);
          return file ? file.sha : undefined;
        }
        // Decode base64 content into string
        function decodeContent(content) {
          const decoded = atob(content.replace(/\n/g, ''));
          return decoded;
        }
        // Get JSON content of a file or return empty array
        async function getJson(path) {
          const file = await getFile(path);
          if (!file) return [];
          const content = decodeContent(file.content);
          try {
            return JSON.parse(content);
          } catch (err) {
            return [];
          }
        }
        // Update or create a file in GitHub
        async function updateFile(path, content, message) {
          const sha = await getFileSha(path);
          const body = JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            branch,
            ...(sha ? { sha } : {})
          });
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${env.GITHUB_TOKEN}`,
              'User-Agent': 'cloudflare-worker',
              'Content-Type': 'application/json'
            },
            body
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub update failed: ${response.status} ${errorText}`);
          }
        }
        let message = '';
        if (type === 'product') {
          // Update products.json
          const products = await getJson('json/products.json');
          const index = products.findIndex(p => p.slug === slug);
          if (index >= 0) {
            products[index] = data;
          } else {
            products.push(data);
          }
          await updateFile('json/products.json', JSON.stringify(products, null, 2), `Update: ${slug} product data by Admin Panel`);
          await updateFile(`products/${slug}.html`, html, `Update: ${slug}.html by Admin Panel`);
          message = 'Product updated';
        } else if (type === 'landing') {
          await updateFile(`landing/${slug}.html`, html, `Update: landing/${slug}.html by Admin Panel`);
          message = 'Landing page updated';
        } else if (type === 'order') {
          const orders = await getJson('json/orders.json');
          const idx = orders.findIndex(o => o.order_id === data.order_id);
          if (idx >= 0) {
            orders[idx] = data;
          } else {
            orders.push(data);
          }
          await updateFile('json/orders.json', JSON.stringify(orders, null, 2), `Update: order ${data.order_id} by Admin Panel`);
          message = 'Order updated';
        } else {
          return new Response('Invalid type', { status: 400 });
        }
        return new Response(JSON.stringify({ status: 'ok', message }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(err.message || 'Error', { status: 500 });
      }
    }
    return new Response('Not Found', { status: 404 });
  }
};