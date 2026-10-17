# Things That Took More Water Than Building This Site

A picture book at [thingsthattookmorewaterthanbuildingthis.site](https://thingsthattookmorewaterthanbuildingthis.site). Glub, a small fluffy wild thing who keeps track of water, works up from a toilet flush to a golf course. Every thing in the book used more water than building this website with an AI coding assistant, which took one bucket (10 liters) at the very most.

## The site

The whole site is `index.html`: no build step and no dependencies. The illustrations are drawn in the browser by a small seeded "pen" (wobbly ink lines, cross-hatching, rippling dream skies), so they come out the same on every visit. Fonts come from Google Fonts and fall back to system serifs.

To preview it, open `index.html` in a browser, or run:

```sh
python3 -m http.server -d sites/more-water 8080
```

## Deploying (GitHub Pages)

`.github/workflows/more-water-pages.yml` publishes this folder to GitHub Pages whenever it changes on `main`. It can also be run by hand from the Actions tab.

**1. Turn on Pages.** In the repo's Settings → Pages, set Source to **GitHub Actions**. Under Custom domain, enter `thingsthattookmorewaterthanbuildingthis.site` and save. Tick **Enforce HTTPS** once GitHub has issued the certificate.

**2. Add DNS records at the registrar (Spaceship).** Make sure the domain uses Spaceship's own nameservers, then in Advanced DNS remove any parking records for `@` and `www` and add:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `starrybodies.github.io` |

GitHub checks the records and issues the HTTPS certificate, usually within an hour. `CNAME` in this folder carries the same domain for anyone publishing the folder another way.

## The numbers

The page's own "Notes for grown-ups" section gives every figure with its source and the method behind the one-bucket ceiling for building the site (2 kWh × 5 L/kWh, deliberately high). Each page's big "×" number and the table at the back are computed from the liters in the `PAGES` array in `index.html`. The playful line under each number ("Seven hundred and fifty websites.") is written by hand, so update it if you change a figure.
