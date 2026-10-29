# madomado cafe — RENTA STUDIO

「窓の向こうに、好きが集まる。」
東広島市豊栄町のmadomado cafeを題材にした、非公式の自主制作デモサイト。
店舗からの依頼・承認を受けたものではありません。

- Website: https://madomado-cafe.ur24-jp.workers.dev/
- Worker: `madomado-cafe`
- Stack: Vite, vanilla JavaScript, GSAP ScrollTrigger, Cloudflare Workers Static Assets

## Development

Node.js 22.12+ / npm

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
npm run deploy
```

`npm run deploy` builds the site and deploys only the Worker named in `wrangler.jsonc`.
No databases, API secrets, analytics or cookies are required. Images and fonts are served locally.

## Design and interaction

- A blue arched window expands into the real garden-facing counter space as the visitor scrolls.
- A sticky food grid opens into two photographic chapters, with a direct link to the menu.
- Menu tabs and seating tabs support click, arrow keys, Home and End.
- Mobile navigation supports Escape, focus containment and background inertness.
- Real telephone reservation and Google Maps directions links; no simulated booking flow.
- Address copy includes an announced success/failure message.
- `prefers-reduced-motion` removes scroll-linked scenes and the marquee. A visible footer link also offers a reduced-motion view at `?motion=reduce`.
- The site remains readable and all essential information is available without JavaScript.

## Non-official status and indexing

Maintain all three layers:

1. HTML `robots` meta: `noindex, nofollow, noarchive`.
2. `public/_headers`: `X-Robots-Tag: noindex, nofollow, noarchive`.
3. `public/robots.txt`: crawl disallow.

The header and footer disclose the unofficial demo status. Do not represent this project as the cafe's official website.

## Information and assets

See [docs/sources.md](docs/sources.md) for verified details, limitations, image provenance and update policy.
The supplied menu board photographs were transcribed and redesigned as accessible text, rather than embedded as a menu image.
Prices are explicitly reference prices, not a claim of a current official menu. Dog policies link to official small/large dog guides; unverified rules are not invented.
All photos, names and provided logo designs belong to their respective rights holders. This repository is a design demonstration; there is no blanket license to reuse the source photography.
