# 183333.com — Residency Day Lab

Free multi-country day tracker, 183-day-rule calculators (US SPT, Schengen 90/180, UK SRT, India status, days-left), a 36-country residency rules database, a 24-programme nomad-visa directory, 10 original guides, and expert-matching lead generation. Monetized with Google AdSense (`ca-pub-6620975821265271`), expert referrals, sponsorships and reader support.

## Structure
- `index.html` home · `tracker.html` · `calculators.html` · `countries.html` · `visas.html`
- `guides/` 10 guides + index · `glossary.html` · `videos.html`
- Revenue: `match.html` (lead gen) · `advisors.html` (B2B) · `support.html` (donations) · `contests.html` · `careers.html` · `advertise.html`
- Legal: `privacy.html` `terms.html` `cookies.html` `disclaimer.html` `trademark.html` · `about.html` `contact.html` `404.html`
- `assets/css/style.css` · `assets/js/main.js` (forms, tools) · `assets/js/data.js` (country + visa data)
- `ads.txt` `robots.txt` `sitemap.xml` `CNAME` `site.webmanifest`

## Forms
All forms post to FormSubmit via AJAX. The inbox address is stored only as an obfuscated array in `main.js` and is never present in HTML. **First submission triggers a one-time FormSubmit activation email — click it once.**

## Hosting (GitHub Pages, free)
Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`. Custom domain `183333.com` (from `CNAME`). DNS: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `www` CNAME → `webworksa1.github.io`. Enable *Enforce HTTPS*.

## Updating rules
Edit `assets/js/data.js` and the `reviewed` date. Guides live as static HTML in `guides/`.

See `BUILD-PROMPTS.md` (phase-wise build prompts) and `RESEARCH.md` (number research, concept, benchmark).
