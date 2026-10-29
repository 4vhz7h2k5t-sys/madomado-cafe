# Mascot welcome opening — implementation and verification

## Adopted direction

A short, quiet welcome through an arched blue window, followed by a dissolve into the existing Hero window. Duration is about 4.65 seconds after the artwork loads. No audio, external media services, new packages or real 3D model are involved. The three approved raster illustrations are used in a WebGL 2.5D performance.

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
- Hidden tab, resizing, preference change or GPU context loss also remove it.
- Shader/image failures show the normal site. Image-loading deadline: 1.6 seconds; independent cleanup watchdog: 6.2 seconds.
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
