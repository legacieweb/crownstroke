# SEO optimization TODO (crownstroke.iyonicorp.com)

- [ ] Step 1: Update root `index.html` with meta baseline (description, robots, canonical, theme-color, OpenGraph/Twitter defaults, JSON-LD).
- [ ] Step 2: Add `src/hooks/useSeo.ts` to set `document.title` + meta description + OpenGraph/Twitter tags + canonical + JSON-LD (optional).
- [ ] Step 3: Wire `useSeo` into `Home`, `Shop`, `Designer`, `Pricing` pages with page-specific title/description/url.
- [ ] Step 4: Verify build output + ensure tags update on route changes under HashRouter.

- [ ] Step 5: (Optional next) Add sitemap/robots if `public/` exists (or add it if missing) for static routes.

