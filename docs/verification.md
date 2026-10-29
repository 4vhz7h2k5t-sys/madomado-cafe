# Verification

Verified 2026-10-29 in the desktop app's Chromium browser.

## Local browser checks

- Desktop: 1280×720 and 1440×1000.
- Mobile: 390×844 and 320×667.
- No horizontal overflow at the checked sizes; all visible images loaded.
- Desktop garden-window expansion reaches the full scene; garden image and arrival copy reach full opacity.
- Mobile native scrolling progresses through the food grid and both food chapters.
- Menu: food/sweets/drinks switching; inactive panels hidden; ArrowRight selects and focuses the next tab.
- Seats: selection changes image, heading, description and associated tab-panel label.
- Mobile navigation: opening, closing and anchor navigation; background inert state is wired in source.
- Address copy succeeds with a live-region confirmation.
- FAQ opens via its semantic summary control.
- Telephone targets consistently resolve to `tel:09056991207`.
- Google Maps destination is the full verified address.
- Reduced-motion route `?motion=reduce`: hero becomes a single viewport with relative positioning; marquee animation is `none`.
- Browser console: no warnings/errors during checked local scenarios.

## Build/static checks

- `node --check src/main.js` passed.
- `npm run check` passed: assets, anchors, unique IDs, ARIA references, Japanese metadata, demo disclosure, noindex and contact destinations.
- `npm run build` passed.
- Dependency installation audit: 0 vulnerabilities.
- Runtime bundle about 49 kB gzip; local font files about 200 kB in total.

Screenshots are retained in `docs/screenshots/`.

## Scope

Responsive checks use emulated viewport sizes in Chromium, not physical iOS/Android devices. No live reservation or phone call was placed. Instagram login-gated dog rules were not guessed; the site links to the official guides and telephone. Actual system-level reduced-motion preference was not toggled; the explicit reduced-motion route exercises the same non-animated layout and the system media query is implemented separately.
