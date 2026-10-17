# Things That Took More Water Than Building This Site

A picture book at [thingsthattookmorewaterthanbuildingthis.site](https://thingsthattookmorewaterthanbuildingthis.site). Glub, a small fluffy wild thing who keeps track of water, travels through the night from a slice of bread to a golf course. Every thing in the book used more water than making this website with an AI coding assistant: about one big 5-gallon bucket, counting a fair share of the AI's training.

## The site

The whole site is `index.html`: no build step and no dependencies. Every word is plain HTML, so search engines, AI answer engines and screen readers see the whole book; JavaScript only draws the pictures into each `figure[data-draw]` and makes the words pop. The illustrations are drawn in the browser by a small seeded "pen" (wobbly ink lines, cross-hatching, rippling dream skies), so they come out the same on every visit. `og.png` is the link-preview image, a screenshot of the cover. Fonts come from Google Fonts and fall back to system serifs.

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

## Finding it

`robots.txt` welcomes all crawlers, `sitemap.xml` lists the pages, `llms.txt` gives AI tools a plain-text summary with sources, and the page head carries Book and FAQPage structured data.

## The numbers

The page's own "Notes for grown-ups" section gives every figure with its source and the method behind the one-bucket estimate for making the site (2.4 kWh × 4 L/kWh × 5/3 for training, about 16 liters; under 40 liters at the most pessimistic). The figures appear in several places: each page's small print and big "×" number (liters ÷ 19), the table and FAQ in the notes, the JSON-LD block in the page head, and `llms.txt`. Change all of them together.
