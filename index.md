---
layout: default
title: Vitrine
---

# Vitrine

Shoppable image-tag plugin: tag products on any page image, embed a safe
overlay script on the host site. Everything runs statically &mdash; no
backend required.

> **Status:** pre-release. Public API and configuration format are still
> moving. Not yet recommended for production sites.

## Try it now

Open one of the demo host pages below. The discovery panel will appear in
the top-right corner; click **Open in Vitrine** to load the admin with
that page&rsquo;s images preloaded.

- [Clothes store &mdash; Atelier]({{ site.baseurl }}/demos/clothes/)
- [Market &mdash; Greenleaf Market]({{ site.baseurl }}/demos/market/)
- [Gift shop &mdash; Folio &amp; Twine]({{ site.baseurl }}/demos/gifts/)
- [Social feed &mdash; Looksy]({{ site.baseurl }}/demos/social/)
- [Blog &mdash; Slow Routes]({{ site.baseurl }}/demos/blog/)

You can also open the admin directly: [Vitrine Admin]({{ site.baseurl }}/admin/).

## What it is

Two pieces joined by one configuration artifact:

1. **Runtime** &mdash; a small `<script>` tag the host site embeds once.
   When no config is present, it scans every `<img>` on the page and
   offers to open the admin with that data. When config is present, it
   mounts clickable overlay regions on each configured image.
2. **Admin** &mdash; a static page. Receives the scanned images via a URL
   hash, lets you draw rectangle regions and attach a URL to each, then
   produces a copy-paste snippet that turns those regions into clickable
   areas on the host page.

The host only adds one snippet. Everything runs in the browser; nothing
talks to a backend.

## Embed snippet

```html
<script src="https://helmedeiros.github.io/vitrine/runtime.js"></script>
```

That single line enables discovery mode. The admin gives you the matching
`<script>window.VITRINE_CONFIG = {...};</script>` blob to add above it
when you&rsquo;re ready to switch into runtime overlay mode.

## Supported environments

- **Runtime:** IE9, Firefox 31+, Chrome 38+, Safari 7+, iOS 7+,
  Android 4.1+ (system browser).
- **Admin:** Chrome 38+, Firefox 31+ (editors only).

## Source

[github.com/helmedeiros/vitrine](https://github.com/helmedeiros/vitrine)
&mdash; MIT licensed.
