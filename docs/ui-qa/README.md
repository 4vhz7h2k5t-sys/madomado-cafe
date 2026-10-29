# Mobile framing and controls — 2026-10-30

Baseline: `d5c9425`. This revision implements the user's requested opening, tab, photo, footer and menu improvements. Existing untracked Blender research is excluded.

## Opening

- A dedicated clipped viewport contains the WebGL canvas. Explicit clipping, paint containment and a WebKit compositing mask prevent the canvas from escaping rounded window edges. Buffer sizing reads the inner viewport's layout dimensions, without the outer border or entrance transform.
- Replaced CSS ratio division with a simple multiplication for broader mobile CSS compatibility.
- The old transition overlaid a shallow portrait window on the Hero arch, producing two visibly misaligned windows. The portrait now fades to the paper backdrop in 0.22s, followed by the original Hero in 0.32s. The windows do not show through one another. WELCOME!, blink, wink, breathing and the overall short tempo remain.
- The Hero section's HTML is byte-identical to the baseline. Original `src/style.css` and the Hero animation code are unchanged.

## Controls and media

- Menu and seat tabs have bordered button surfaces, blue selected states, hover feedback, selection indicators and visible switch instructions. Existing arrow-key/Home/End tab navigation remains.
- All 22 menu rows use native `details`/`summary` with a visible chevron. Each category's first row is open on initial load. Other rows can open with an unset-photo message; existing karaage photography is reused.
- Only three new images were generated: aji-fry set, dessert plate and coffee. Each is explicitly labelled a generated illustration rather than the cafe's actual plating. See `docs/menu-images.md` for replacement instructions and `docs/sources.md` for provenance.
- Figure/logo HTML height attributes were still fixing their display height despite responsive width rules. The owner/reporter image now explicitly uses `height:auto` and a 1:1 crop. Footer logo uses its natural aspect ratio, 270px width on desktop and approximately 207×62px at 390px mobile width.
- Removed the requested decorative ✳ from the visit heading. Menu names, notes, prices and ordering are unchanged from the baseline.

## Verification

Actual built-preview Chromium browser checks, using viewport emulation:

- Opening at 320×568, 390×844, 1440×1000, 844×390. Canvas bounds remained inside the window at every observed frame. During the Hero reveal, the portrait opacity was already zero. Observed completion: 2439ms, 2418ms, 2332ms, 2327ms respectively (navigation and polling overhead included).
- No horizontal overflow in checked layouts. Mobile 320px menu/seat labels fit their button widths. Selected colors changed on click; arrow-key switching worked for both tab groups.
- All 22 menu dropdowns opened with one active row per category and a photo or the pending-photo region. Checked keyboard Enter close, generated photo loading, each category's initially open first row, and original karaage image reuse.
- Owner/reporter photo measured 343×343px at 390px viewport; footer logo 207×62px mobile and 270×81px desktop. Screenshots visually inspected.
- No browser console warnings/errors in tested scenarios. Physical iOS/Android and Safari testing was not performed; WebKit-specific masking is implemented but not claimed as device-tested. Image-error fallback reviewed in source, not artificially induced.
- `node --check` for changed JS, `npm run check`, `npm run build`, `git diff --check` passed. Asset checks now verify photo-map completeness, configured image existence, and each category's initial open row.
- Source comparison confirms unchanged Hero markup and the exact names, notes, prices and ordering of all 22 menu items. Demo disclosure and noindex remain.

Screenshots in this folder show the final candidate. The older `docs/opening-qa/` records preceding versions.
