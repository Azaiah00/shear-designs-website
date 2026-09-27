# Shear Designs Hair & Beauty Co. — spec website

A finished, production-ready spec website for **Shear Designs Hair & Beauty Co.** and its brow sub-brand
**BeautyFULL Brows PMU Artistry** (owner: Shawntae Dupree Woolfolk, Richmond, VA). Built by Couture House Co.
to show the owner first, then launch.

- Static site: plain HTML, one stylesheet, one vanilla JS file. No build step, no frameworks, no tracking.
- Design direction "Gilded Shears": noir / espresso / gilt / champagne / ivory, with petal and fuchsia for the
  brows sub-brand. Bodoni Moda display type with Jost body type (self-hosted in `assets/fonts`, `font-display: swap`, full fallbacks).
- Motion: "the cut" split headlines, gold-foil shimmer, an ombré brow drawn in hair strokes as you scroll,
  an auto-wiping before/after slider, gallery parallax and a scroll-driven clock. All motion is disabled for
  `prefers-reduced-motion`, and all content is visible without JavaScript.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero, two doors (Hair / Brows), featured prices, Pixie Nation gallery, reviews, visit, quick facts, FAQ |
| `hair.html` | Full short-hair menu with durations, new-client package, color, treatments, gallery, house rules, FAQ |
| `brows.html` | BeautyFULL Brows: microshading explained, before/after slider, results, menu, touch-up table, prep, healing timeline, FAQ |
| `academy.html` | One-on-one PMU training: courses, inclusions, who it is for, deposit terms, Netlify inquiry form, FAQ |
| `about.html` | Shawntae's story, the private salon, policies, visit, contact |
| `404.html` | Branded not-found page |

Supporting files: `robots.txt`, `sitemap.xml`, `llms.txt` (fact sheet for AI answer engines), `site.webmanifest`,
`netlify.toml`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `assets/img/og.jpg` (social share image).

## Preview locally

The pages use relative links, so you can double-click `index.html`. For an exact production preview
(the 404 page uses root-relative paths), run a local server from this folder:

```bash
cd shear-designs
python3 -m http.server 8080
# open http://localhost:8080
```

The inquiry form on `academy.html` only submits once deployed on Netlify (see below).

## Deploy on Netlify

1. Log in at https://app.netlify.com and choose **Add new site > Deploy manually**.
2. Drag this whole `shear-designs` folder onto the upload area. No build command is needed; `netlify.toml`
   sets the publish directory to the folder root.
3. Netlify detects the `academy-inquiry` form automatically (it has `data-netlify="true"`). In
   **Site configuration > Forms > Form notifications**, add an email notification to the owner's address
   so every inquiry reaches her inbox.
4. Add the custom domain in **Domain management** and let Netlify provision the free HTTPS certificate.
5. After launch, submit `https://sheardesignsrva.com/sitemap.xml` in Google Search Console and Bing Webmaster
   Tools, and update the Google Business Profile website link.

Alternatively, connect a Git repository containing this folder; Netlify will deploy on every push.

`netlify.toml` adds security headers (a strict Content Security Policy that allows only self-hosted assets and the
one hashed inline script, HSTS, frame and referrer policies), long-lived caching for images, short caching for
CSS/JS/HTML, and the branded 404. If you edit the tiny inline script in the page `<head>`, update its
`sha256-` hash in the CSP.

## Domain

Register **sheardesignsrva.com** (the canonical, Open Graph and sitemap URLs already use it). If you choose a
different domain, find and replace `https://sheardesignsrva.com` across all `.html` files, `sitemap.xml`,
`robots.txt` and `llms.txt`.

## Editing notes

- Prices, hours and policies appear in the page copy, in the JSON-LD structured data in each page's `<head>`,
  and in `llms.txt`. When anything changes, update all three.
- Hours highlighting ("Today") is automatic in the visitor's browser.
- Colors and type are CSS custom properties at the top of `assets/css/site.css`.
