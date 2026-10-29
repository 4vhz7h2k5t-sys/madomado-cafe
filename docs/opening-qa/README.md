# Mascot welcome opening — implementation and verification

## Adopted direction

A short welcome through a centered blue window with a shallow arch, accompanied only by WELCOME!, followed by a dissolve into the existing Hero window. Current timing is 1.72 seconds of greeting plus a 0.54-second handoff (2.26 seconds after cached artwork setup); modest loading latency is absorbed to target about 2.35 seconds from overlay mounting. Prior revisions are recorded below. No audio, external media services, new packages or real 3D model are involved. The three approved raster illustrations are used in a WebGL 2.5D performance.

The base portrait remains fixed at the pixel/material level. Only soft masks around the eyes sample the blink/wink photographs. A shader produces small anatomically localized deformations for breathing, ears, paws, head tilt and pointer-responsive gaze. During a blink, the open-eye texture compresses before the closed-eye texture appears; clothing is never swapped between the three source images.

The blue arch echoes the Hero. On departure, its bounds animate to the real, read-only bounding box of `.hero-window`; the overlay dissolves to the unmodified original site.

## Scope and restoration

- Baseline: `4173b85`, local tag `before-3d-opening-20261029`.
- Existing `index.html`, `src/style.css`, existing public assets, package files and Worker configuration are unchanged.
- Existing `src/main.js` has only an import and a call to `mountOpening()` added. Removing those additions returns the file byte-for-byte to the baseline.
- Opening code/styles: `src/opening.js`, `src/opening.css`.
- Runtime artwork: `public/opening/` (3 WebP files, total 901,310 bytes).
- Original approved PNG artwork and provenance: `assets-source/mascot-v2/`.
- The old Blender study is excluded from this production branch.
- To roll back the opening: revert the opening commit or restore the baseline; do not reset unrelated user work.

## UX and fail-safe behavior

- Runs once per tab session. `?opening=preview` allows a review replay.
- `?opening=off`, existing hash/deep links, nonzero page scroll, `?motion=reduce` and the system reduced-motion preference bypass the introduction.
- Visible Skip button, Escape, Enter, Space, scrolling/navigation keys, wheel or touch scrolling can dismiss it.
- Existing elements are temporarily inert; their previous states are restored on all termination paths. Focus remains in the welcome while it is active.
- Hidden tab, layout-width change, preference change or GPU context loss also remove it. Height-only changes keep the opening active so mobile browser chrome does not dismiss it.
- Shader/image failures show the normal site. Image-loading deadline: 0.6 seconds; independent cleanup watchdog: 2.5 seconds. Immediate dismissal can also interrupt an in-progress handoff.
- Pixel ratio capped at 1.5; requestAnimationFrame and GPU resources are released on removal.
- All assets are served locally and comply with the existing CSP/noindex.

## Actual browser verification

Chromium through the desktop app, 2026-10-29 (Asia/Tokyo):

- Desktop 1280×720 and 1440×1000: watched entrance, blink, wink, head/body motion and the complete handoff. No visible seams in the final framing; no jacket replacement/flicker.
- Mobile 390×844 and 320×667: watched the same sequence with the mobile composition. Eyes closed fully without floating highlights; wink remains localized to the right eye.
- No horizontal overflow in tested sizes; original Hero visible after completion; main content no longer inert.
- Skip and Escape dismiss correctly. Navigation keys dismiss and restore main content.
- Return visit in the same tab bypasses the opening.
- Reduced-motion route bypasses it. The system media query is implemented but OS preference itself was not changed.
- Direct link to `#menu` bypasses it; switching to the sweets panel still works.
- Browser console: no errors/warnings in checked scenarios.
- Actual production build served through `vite preview`, not only the dev server.
- Pixel comparison at 320×667: `hero-after.png` vs `hero-off.png`, mean absolute RGB difference **0.0**, max **0**.
- Source comparison: existing markup, CSS and section logic unchanged as described above.
- `node --check src/opening.js`, `npm run check`, `npm run build` passed.

Screenshots include actual animation frames, the smallest checked viewport, and both Hero comparison frames. These were viewport emulations, not physical iOS/Android hardware tests. Network-failure and WebGL-unavailable paths were reviewed in source, not induced in the browser. No claim of full 3D rotation or skeletal character animation is made.

## Quality decision

Adopt: the portrait's organic fur, eyes and leather remain intact while the face reacts, the motion is restrained, and entry/exit feel part of the existing window concept. The opening adds the intended welcome without altering the underlying design. Proceed with the user's authorized GitHub push and Cloudflare publication.

## Production verification

- Published 2026-10-29 from opening commit `5bb232d`.
- Cloudflare Worker: `madomado-cafe`; version `576d6ab1-0758-4c77-9e1f-f37c7dd91cfe`.
- Public URL: https://madomado-cafe.ur24-jp.workers.dev/
- Actual public browser replay at desktop 1440×1000 and mobile 390×844 confirmed the animation and return to the original Hero. No horizontal overflow or console warnings/errors. The only remaining inert element is the original closed mobile navigation, as expected.
- HTTP 200 confirmed; HTML robots meta and `X-Robots-Tag` retain `noindex, nofollow, noarchive`; original CSP remains present.
- `production-desktop-*.png` and `production-mobile-*.png` are captures of the deployed site, including the mobile Hero after completion. Millisecond suffixes are capture times relative to navigation returning, not animation timestamps.


## Text-free mobile revision — 2026-10-29

User feedback: remove opening text and correct the mobile composition.

- Removed all visible copy, wordmark and English labels from the opening. The icon-only skip button retains its accessible Japanese name and a 48×48px target.
- Centered the mascot in both axes. Frame sizing preserves the source aspect ratio and fits both viewport dimensions using stable viewport height. Mobile margins are 12px; shallow rounded corners preserve the ears and paws that the former tall arch cropped.
- Safe-area-aware skip placement; compact landscape layout; height-only resize no longer dismisses the welcome.
- Preserved the eye animation, breathing and Hero handoff. Only `src/opening.js` and `src/opening.css` changed; Hero and all other section sources/assets remain byte-identical to `26222c2`.
- Actual Chromium checks with viewport emulation: 320×568, 390×844, 844×390 and 1440×1000. No visible text in the overlay, no horizontal overflow, mascot fully framed, and automatic return to Hero with original inert states restored in all four sizes. No console errors/warnings.
- Height changed from 844 to 760 at fixed width 390 during the opening: it remained active. Icon skip then dismissed it and restored the site.
- `node --check src/opening.js`, `npm run check`, `npm run build`, and `git diff --check` passed.
- `textless-*.png` are actual captures from this revision, including mobile Hero after completion. Physical iOS/Android browser testing was not performed.


## Short welcome revision — 2026-10-29

User request: about 2–2.5 seconds including the Hero handoff, with WELCOME! as the only visible copy.

- Retimed entrance (0.68s), blink (0.43s), head tilt and wink (0.98–1.38s). Greeting settles at 1.58s with a short 0.14s hold before the 0.54s Hero dissolve. Fur, leather, eye textures and localized deformation remain unchanged.
- WELCOME! appears gently beneath the window at 0.14s and fades before the handoff; no other copy or logo was reintroduced. Sized and centered independently to remain within compact landscape viewports.
- Asset loading no longer creates a long introduction: 600ms load deadline, latency-aware welcome timing and 2500ms independent cleanup. Slow/unavailable artwork falls through to the original site.
- Actual built-preview Chromium checks (navigation through full Hero return, measured by DOM polling): 1440×1000 **2432ms**, 390×844 **2417ms**, 320×568 **2330ms**, 844×390 **2382ms**. These are observed upper bounds including navigation/API polling overhead, not frame-accurate profiling. All sizes showed WELCOME! without overflow; blink and wink were observed in the animation.
- Icon skip restored the original inert state; reduced-motion route bypassed the opening; console had no errors or warnings.
- Only `src/opening.js` and `src/opening.css` changed relative to `9827dc7`, besides this verification record/screenshots. `index.html`, `src/main.js`, `src/style.css`, Hero assets and every other section are unchanged.
- `node --check src/opening.js`, `npm run check`, `npm run build`, `git diff --check` passed. `tempo-*.png` are actual final-build frames at the four tested sizes.
