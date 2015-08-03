# Vitrine

Shoppable image-tag plugin: tag products on any page image, embed a safe
overlay script on the host site.

> Status: pre-release. Public API, configuration format, and runtime
> behaviour are all subject to change without notice. Not yet recommended
> for production sites.

## What it is

Vitrine is two pieces joined by one signed configuration artifact:

1. **Configurator** — an admin web app. Paste a URL, see every image on
   the page, draw regions on those images, attach products to each region
   (manual link or catalog pick), then publish.
2. **Runtime** — a small, sandboxed `<script>` tag the host site embeds
   once. It finds the configured images on the live page, mounts hotspots
   over the regions, and shows product tooltips on hover/tap.

The host only adds one snippet. All editorial work happens outside the
host's CMS.

## Project layout

```
core/           shared domain model (pure CommonJS, no I/O)
runtime/        embeddable browser script (IE9 baseline)
configurator/   admin web app + Node.js backend
adapters/       brand catalog adapters (REST, affiliate feeds, ...)
```

## Supported environments

- **Runtime:** IE9, Firefox 31+, Chrome 38+, Safari 7+, iOS 7+, Android
  4.1+ (system browser). IE8 degrades to inline underlined links.
- **Configurator UI:** Chrome 38+, Firefox 31+ (editors only).
- **Configurator backend:** Node.js 0.12 / io.js 2+.

## Documentation

See [helmedeiros.github.io/vitrine](https://helmedeiros.github.io/vitrine/).

## License

MIT — see `LICENSE`.
