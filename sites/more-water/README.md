# Things That Took More Water Than Building This Site

A picture book at [thingsthattookmorewaterthanbuildingthis.site](https://thingsthattookmorewaterthanbuildingthis.site). Glub, a small fluffy wild thing who keeps track of water, works up from a toilet flush to a golf course. Every thing in the book used more water than building this website with an AI coding assistant, which took one bucket (10 liters) at the very most.

## The site

The whole site is `index.html`: no build step and no dependencies. The illustrations are drawn in the browser by a small seeded "pen" (wobbly ink lines, cross-hatching, rippling dream skies), so they come out the same on every visit. Fonts come from Google Fonts and fall back to system serifs.

To preview it, open `index.html` in a browser, or run:

```sh
python3 -m http.server -d sites/more-water 8080
```

## Deploying (Cloudflare Pages)

**1. Put the domain on Cloudflare.** In the Cloudflare dashboard, add `thingsthattookmorewaterthanbuildingthis.site` as a domain on the Free plan. Cloudflare shows two nameservers. At the registrar, turn off DNSSEC if it's on, then replace the domain's nameservers with those two. The domain shows as Active in Cloudflare once the change has spread, usually within an hour. Cloudflare Pages needs this for a root domain; a plain CNAME at another DNS host won't work.

**2. Create the Pages project.** Go to Workers & Pages → Create → Pages → Connect to Git, choose `starrybodies/overshoot`, and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `sites/more-water` |
| Root directory | leave blank |
| Environment variable | `SKIP_DEPENDENCY_INSTALL` = `1` |
| Build watch paths (include) | `sites/more-water/*` |

The environment variable stops Pages from installing the atlas app's dependencies from the repo root, which this page doesn't need. The watch path means only changes to this folder trigger a deploy.

**3. Attach the domain.** In the Pages project, open Custom domains → Set up a custom domain and enter `thingsthattookmorewaterthanbuildingthis.site`. Cloudflare creates the DNS record and the HTTPS certificate itself. Add `www.thingsthattookmorewaterthanbuildingthis.site` the same way if you want it too.

`CNAME` in this folder is only used by GitHub Pages. Cloudflare ignores it.

## The numbers

The page's own "Notes for grown-ups" section gives every figure with its source and the method behind the one-bucket ceiling for building the site (2 kWh × 5 L/kWh, deliberately high). Each page's big "×" number and the table at the back are computed from the liters in the `PAGES` array in `index.html`. The playful line under each number ("Seven hundred and fifty websites.") is written by hand, so update it if you change a figure.
