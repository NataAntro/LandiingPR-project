# VPS Migration

This landing is prepared for a same-origin renderer setup:

- `https://trezvyeperevozchikivmax.online/` -> static landing
- `https://trezvyeperevozchikivmax.online/render-api/*` -> hotbox renderer

## Changes already applied in the site

- `meta[name="hotbox-renderer-url"]` now points to `/render-api`
- CSP uses same-origin for renderer requests:
  - `connect-src 'self'`
  - `media-src 'self' blob:`
- Frontend resolves renderer asset URLs relative to the meta base URL, so:
  - `/render`
  - `/renders/:id`
  - `/renders/:id/download`
  all continue to work behind `/render-api`

## External cutover checklist

1. Point `trezvyeperevozchikivmax.online` to the VPS in DNS.
2. Point `www` to the same VPS if you want a `www` host.
3. Stop using GitHub Pages as production.
4. Disable the GitHub Pages custom domain or leave it unused after DNS cutover.
5. Serve the static landing from a dedicated container or directory.
6. Reverse proxy `/render-api/*` to the renderer container/process.
7. Keep HTTPS termination in Caddy.

## Suggested Caddy shape

```caddyfile
trezvyeperevozchikivmax.online, www.trezvyeperevozchikivmax.online {
  encode zstd gzip

  handle /render-api/* {
    reverse_proxy hotbox_renderer:3000
  }

  handle {
    root * /srv/landing
    file_server
  }
}
```

If the renderer expects paths without the `/render-api` prefix, strip it before proxying:

```caddyfile
handle_path /render-api/* {
  reverse_proxy hotbox_renderer:3000
}
```

## Notes

- `canonical`, `og:url`, `robots.txt`, and `sitemap.xml` already point to `https://trezvyeperevozchikivmax.online/` and do not need changes if the public domain stays the same.
- The existing frontend fallback remains intact:
  - server render first
  - browser render or image fallback if server render fails
- The `CNAME` file is only relevant for GitHub Pages and is not used by the VPS deployment itself.
