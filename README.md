# FishAnneChips

The standalone site for **FishAnneChips** — women's golf and fly fishing (new,
vintage, and affiliate). A consumer-facing brand under Balconé Holdings, with its
own domain `fishannechips.com`. Plain HTML/CSS/JS, no build step, deployed free to
Cloudflare.

## Files

| File | What it is |
|------|------------|
| `index.html` | The whole site: hero, featured listings, recommended (affiliate) gear, about |
| `styles.css` | All styling. Re-theme by editing the colors in `:root` |
| `main.js` | Footer year + placeholder-link handling |
| `wrangler.jsonc` | Cloudflare static-deploy config |

## How to preview locally

Double-click `index.html` — it opens in your browser. No server needed.

## What to fill in

Anything marked `data-placeholder` (links) or `data-placeholder-img` (photos):

- **Listing links** → replace `href="#"` with your eBay / Facebook listing URLs.
- **"Shop my eBay / Facebook"** → your store URLs.
- **Affiliate links** → keep `rel="sponsored noopener"` + `target="_blank"`.
- **Product photos** → swap the `Photo` placeholder boxes for `<img>` tags.

## Relationship to the other sites

- `balconeholdings.com` — the parent hub; its "FishAnneChips" box links here.
- `fishannechips.com` — this site (its own brand + domain).
