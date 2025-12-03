# Deployment & CI/CD Steps

Follow these steps to deploy the static store and configure automated deployments.

## 1. Create a GitHub Repository

- Create a new repository and push the contents of this project to the `main` branch.

## 2. Configure Cloudflare Pages

- In the Cloudflare dashboard, create a new Pages project and connect it to your GitHub repository.
- Select **no build command** and set the output directory to `/`.
- Deploy the site; Cloudflare will serve all static files.

## 3. Deploy the Cloudflare Worker

- Use the Cloudflare dashboard or Wrangler CLI to create a new Worker and paste the contents of `worker.js`.
- In the Worker’s settings, add the following environment variables:
  - `GITHUB_TOKEN` – a personal access token with `repo` scope.
  - `GITHUB_OWNER` – your GitHub username or organization.
  - `GITHUB_REPO` – the name of your repository.
  - `GITHUB_BRANCH` – (optional) branch to commit to, default is `main`.
- Note the Worker’s endpoint URL (e.g., `https://your-worker-url.workers.dev/api/publish`).

## 4. Update Admin Panel Configuration

- Open `admin/admin.js` and set the `WORKER_URL` constant to your Worker’s endpoint.

## 5. Use the Admin Panel

- Open `admin/admin.html` locally.
- Submit forms to publish data; the Worker will commit changes to the repository and Cloudflare Pages will redeploy.

This continuous deployment flow ensures that any changes made via the admin panel are automatically versioned in GitHub and live on your Pages site.