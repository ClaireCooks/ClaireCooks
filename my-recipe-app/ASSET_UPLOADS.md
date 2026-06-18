# Recipe Photo Uploads

The author dashboard can compress iPhone or laptop photos in the browser before sending them to an external image host.

## Flow

```text
Author selects photo
Browser converts to WebP when supported, with JPEG fallback
Browser resizes to 1600px max width
Browser uploads at 80% quality
Cloudflare Worker stores the file in R2
Recipe JSON saves the public image URL
```

## App Configuration

Add these Vite environment variables when photo uploads are ready:

```text
VITE_ASSET_UPLOAD_URL=https://clairecooks-image-upload.tristendanderson.workers.dev
VITE_ASSET_PUBLIC_BASE_URL=https://pub-b219213e36074f04bcc0424ce16a0ffb.r2.dev
```

`VITE_ASSET_PUBLIC_BASE_URL` is optional if the Worker returns a `url`.

## Worker Setup

The starter Worker lives in `cloudflare/image-upload-worker.js`.

1. Copy `cloudflare/wrangler.toml.example` to `cloudflare/wrangler.toml`.
2. Set `PUBLIC_ASSET_BASE_URL` to the public R2/custom-domain URL.
3. Set `ALLOWED_ORIGIN` to the deployed author app origin.
4. Bind the `RECIPE_IMAGES` R2 bucket.
5. Deploy with Wrangler.

The Worker validates the same GitHub token used by the author dashboard against `ClaireCooks/ClaireCooks`, accepts compressed WebP or JPEG uploads, and caps uploads at 2 MB.
