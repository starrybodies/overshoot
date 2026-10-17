# Things That Took More Water Than Building This Site

A picture book at [thingsthattookmorewaterthanbuildingthis.site](https://thingsthattookmorewaterthanbuildingthis.site). Glub, a small fluffy wild thing who keeps track of water, works up from a toilet flush to a golf course. Every thing in the book used more water than building this website with an AI coding assistant, which took one bucket (10 liters) at the very most.

## The site

The whole site is `index.html`: no build step and no dependencies. The illustrations are drawn in the browser by a small seeded "pen" (wobbly ink lines, cross-hatching, rippling dream skies), so they come out the same on every visit. Fonts come from Google Fonts and fall back to system serifs.

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

The page's own "Notes for grown-ups" section gives every figure with its source and the method behind the one-bucket ceiling for building the site (2 kWh × 5 L/kWh, deliberately high). Each page's big "×" number and the table at the back are computed from the liters in the `PAGES` array in `index.html`. The playful line under each number ("Seven hundred and fifty websites.") is written by hand, so update it if you change a figure.
