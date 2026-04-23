# Landing + VPS Render Deployment

This landing is now prepared for a split setup:

- `https://trezvyeperevozchikivmax.online/` -> static landing on GitHub Pages
- `https://www.trezvyeperevozchikivmax.online/` -> GitHub Pages alias
- `https://render.trezvyeperevozchikivmax.online/` -> hotbox renderer on the VPS

The landing no longer expects same-origin `/render-api`.

## What is already wired in the landing

- `meta[name="hotbox-renderer-url"]` points to:
  - `https://render.trezvyeperevozchikivmax.online`
- CSP allows renderer requests and video playback from:
  - `https://render.trezvyeperevozchikivmax.online`
- Frontend resolves renderer endpoints from that base URL:
  - `POST /render`
  - `GET /renders/:id`
  - `GET /renders/:id/download`

## DNS

### GitHub Pages

For the apex domain:

```text
@      A      185.199.108.153
@      A      185.199.109.153
@      A      185.199.110.153
@      A      185.199.111.153
@      AAAA   2606:50c0:8000::153
@      AAAA   2606:50c0:8001::153
@      AAAA   2606:50c0:8002::153
@      AAAA   2606:50c0:8003::153
```

For `www`:

```text
www    CNAME  NataAntro.github.io.
```

### VPS renderer

Add a dedicated renderer host pointing to the VPS:

```text
render A 89.111.141.149
```

Do not put the landing itself on the VPS if the goal is GitHub Pages delivery.

## GitHub Pages

In the GitHub repository that serves this landing:

1. Enable Pages.
2. Set the custom domain to:
   - `trezvyeperevozchikivmax.online`
3. Keep `.nojekyll`.
4. Wait until GitHub marks the custom domain and certificate as ready.

If you test on `NataAntro.github.io` before the custom domain is live, remember to allow that origin on the renderer too.

## VPS renderer settings

On the VPS, in `.env.production`, set:

```env
HOTBOX_RENDERER_DOMAIN=render.trezvyeperevozchikivmax.online
HOTBOX_RENDERER_CORS_ORIGIN=https://trezvyeperevozchikivmax.online
HOTBOX_RENDERER_CORS_ORIGINS=https://trezvyeperevozchikivmax.online,https://www.trezvyeperevozchikivmax.online
```

If you want temporary GitHub Pages origin access before DNS cutover:

```env
HOTBOX_RENDERER_CORS_ORIGINS=https://trezvyeperevozchikivmax.online,https://www.trezvyeperevozchikivmax.online,https://NataAntro.github.io
```

Then redeploy the public entrypoint and renderer:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d caddy hotbox_renderer
```

## Verification

### Renderer health

```bash
curl -s https://render.trezvyeperevozchikivmax.online/health
```

### Renderer smoke test

```bash
curl -X POST https://render.trezvyeperevozchikivmax.online/render \
  -H "Content-Type: application/json" \
  -H "Origin: https://trezvyeperevozchikivmax.online" \
  -d '{"label":"КОНТЕНТ 2020–2024 (НЕ КАНТОВАТЬ)"}'
```

The response should contain:

- `id`
- `streamUrl`
- `downloadUrl`

Then verify the generated asset:

```bash
curl -I https://render.trezvyeperevozchikivmax.online/renders/<id>
curl -I https://render.trezvyeperevozchikivmax.online/renders/<id>/download
```

### Landing checks

Open:

- `https://trezvyeperevozchikivmax.online/`
- `https://www.trezvyeperevozchikivmax.online/`

And confirm:

- the page loads from GitHub Pages,
- render requests go to `render.trezvyeperevozchikivmax.online`,
- generated video plays and downloads,
- CORS is not blocked in the browser console.

## Notes

- `canonical`, `og:url`, `robots.txt`, and `sitemap.xml` can stay on `trezvyeperevozchikivmax.online`.
- The renderer remains on the VPS because it needs backend compute.
- The landing is now decoupled from the old same-origin `/render-api` path.
