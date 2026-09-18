# Julia Vorozhko — Design Portfolio

A single-page portfolio website for Julia Vorozhko, a multidisciplinary designer (web, app, brand identity, illustration). Built as a plain **HTML / CSS / JavaScript** site — no framework, no build step, no dependencies to install.

## Running it locally

The site is static, so any local web server works (opening `index.html` directly via `file://` will break the image grid and scroll effects due to browser security restrictions on local files).

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`. A ready-made config for this is already in [`.claude/launch.json`](.claude/launch.json), so it also runs via Claude Code's built-in preview.

## Project structure

```
index.html            all page markup (single page, anchor-linked sections)
css/style.css          all styling — design tokens, layout, animations
js/script.js            all interactivity — no external libraries
assets/work/           optimized JPGs actually served on the site (…-grid.jpg / …-full.jpg pairs)
res/                    source images dropped in by hand; never referenced directly by the site
.claude/launch.json     dev-server config for the Claude Code / browser preview
```

## Sections & features

- **Hero** — kicker + animated headline where the service word (*Web Design / App Design / Brand Identity / Social Content*) flips on a timer with a blur + slide-up transition, inside a frosted-glass pill.
- **Background Boxes** — a skewed, radially-masked grid behind the hero text; each box lights up a random color on hover (built from scratch in `script.js`, no canvas).
- **Portfolio (parallax gallery)** — three rows of work screenshots that tilt in 3D and straighten out as you scroll, each row drifting sideways. Rows are duplicated three times behind the scenes so they loop seamlessly without ever showing a gap, and the loop's seam lands exactly when the section un-pins. Hovering a card lifts it and glides a shared glow highlight to it.
- **About** — bio blurb, skill tags, and a glass-styled email button.
- **Selected Projects** — a static 3-column grid of the same body of work with always-visible titles/categories and the same gliding hover highlight as the parallax gallery.
- **Lightbox** — clicking any project image (in either gallery) opens an enlarged view with title and category.
- Fully responsive down to mobile, with a slide-down nav menu on small screens.

## Image pipeline

Source photos/screenshots live in `res/` at full camera/export resolution (often several MB each). Nothing there is linked from the site directly. Instead, a small Pillow (Python) script resizes each one into two JPEGs — a small one for the grid thumbnails and a larger one for the lightbox — and writes them into `assets/work/`. Re-run the same kind of script whenever an image in `res/` is added or replaced.

---

## How this was prototyped in Claude Code

This project was built entirely through conversation with Claude Code, iterating live against a browser preview rather than hand-writing everything upfront.

**1. Starting point.** The brief began with real React/TypeScript component code copied from [Aceternity UI](https://ui.aceternity.com) — `HeroParallax`, `LayoutTextFlip`, `BackgroundRippleEffect`, `Boxes`, and `HoverEffect`. Since this project has no React, Tailwind, or build tooling (and wasn't going to get any, by choice — confirmed explicitly when a shadcn/Tailwind setup was offered as an alternative), each component's *behavior* was ported to vanilla CSS transitions/keyframes and small, dependency-free JavaScript modules rather than copying the code as-is.

**2. Iterating section by section.** Work went in small, testable steps: build or tweak a piece, spin up the local server, drive the browser preview to scroll/hover/click it, and inspect the DOM/computed styles directly (`getBoundingClientRect`, `getComputedStyle`, dispatched events) to verify the effect was mathematically correct — not just eyeballed. That caught several real bugs along the way:
   - the scroll-driven 3D tilt was pinning the gallery for far longer than the animation actually took;
   - looping gallery rows left a blank gap once the loop caught up with itself, fixed by tripling the row content instead of doubling it;
   - a hover "lift" transform and a hover glow element drifted apart because only one of them accounted for the lift offset.
   
   Several rounds of this were pure back-and-forth refinement — "make the cards bigger," "the tilt should be more dramatic," "the button needs to feel brighter" — adjusted directly against what was rendering.

- **3. Content passes.** Once the interactions were solid, the same loop was used for content: swapping in real project photography (processed from `res/` into optimized `assets/work/` pairs), rewriting the bio copy to hit specific talking points, retitling navigation, and re-pointing every CTA to the right section as the page's structure evolved.

- **4. Keeping scope tight.** Each change was scoped to exactly what was asked — additions were undone on request without hesitation, and unrelated code was left alone rather than "improved" along the way.
