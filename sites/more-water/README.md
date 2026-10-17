# Things That Took More Water Than Building This Site

A picture book at [thingsthattookmorewaterthanbuildingthis.site](https://thingsthattookmorewaterthanbuildingthis.site). Glub, a shaggy wild thing who keeps track of water, works up from a sheet of paper to a golf course. Every thing in the book used more water than building this website with an AI coding assistant.

## The site

The whole site is `index.html`: no build step and no dependencies. The illustrations are drawn in the browser by a small seeded "pen" (wobbly ink lines, cross-hatching, watercolor mottling), so they come out the same on every visit. Fonts come from Google Fonts and fall back to system serifs.

To preview it, open `index.html` in a browser, or run:

```sh
python3 -m http.server -d sites/more-water 8080
```

## Deploying

Point any static host at this folder:

- **Cloudflare Pages / Netlify:** build command empty, output directory `sites/more-water`.
- **GitHub Pages:** publish this folder. `CNAME` already holds the custom domain.

Register the domain first. Once it's attached, the host serves `index.html` at the root.

## The numbers

The page's own "Notes for grown-ups" section gives every figure with its source and the method behind the 6-liter estimate for building the site (1.2 kWh × 5 L/kWh, deliberately high). Change a number in the `PAGES` array in `index.html`, and the jug counts, ratios and source table all update from it.
