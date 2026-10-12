# PinPoint — Design Doc

> Status: **Research / pre-implementation.** Nothing is built yet. This doc is a living record: proposals are marked **[Proposed]**, open questions **[Open]**, and settled choices get moved to the Decision Log at the bottom.

---

## 1. Pitch

A daily hidden-target puzzle. Somewhere on the board is a hidden **blue circle**. You click to probe. Every click shows a colored marker telling you how close you are, unless a wall blocks the view, in which case it's **grey**. Find the circle in as few clicks as possible. Everyone gets the same board each day, like Wordle.

Core fantasy: *sonar / echolocation / hot-and-cold*, plus some geometric deduction.

---

## 2. Core Loop (baseline from the original idea)

1. Load today's board: walls and barriers are visible, and the target is hidden.
2. Player clicks anywhere that isn't inside a wall.
3. The click resolves to one of:
   - **Hit**: the click is inside the blue circle, so the game is won and the circle is revealed.
   - **Colored (green → yellow → red)**: the click has line of sight (LOS) to the target, and the color encodes distance.
   - **Grey**: there's no LOS to the target. Distance info is withheld.
4. Markers stay on the board so the player can reason over all of them.
5. Score = total clicks, including the winning click.

### Why this is already a good puzzle
- **Colored clicks** constrain the target to a **ring (annulus)** around the click, intersected with the click's visible region.
- **Grey clicks** constrain the target to the click's **shadow**, meaning everywhere *not* visible from that point. This is negative information, and it's what makes walls more than decoration. A grey click can be very informative ("it's behind *that* wall").
- So the walls turn a pure trilateration puzzle into one where you have to think about where you're standing when you probe.

---

## 3. Key Design Problems & Recommendations

### 3.1 Continuous vs. discrete distance feedback  — **[Proposed: discrete bands]**
If color is a smooth gradient of exact distance, the game breaks:
- 3 non-collinear colored clicks are enough to trilaterate the exact point, which makes every day a 4-click solve.
- Players can read pixel colors with an eyedropper tool to recover exact distances.

**Recommendation:** Use a small number of **discrete bands**, so each click only says "the target is somewhere in this ring":

| Band | Color | Distance from target center (logical units, board = 1000×1000) |
|---|---|---|
| Hot | Green | ≤ 60 |
| Warm | Yellow-green | 60–150 |
| Mild | Yellow | 150–300 |
| Cool | Orange | 300–500 |
| Cold | Red | > 500 |

- The bands are **non-linear** (narrow near the target, wide far away). Early clicks give coarse info, and the endgame needs precision.
- The band count and widths are the **#1 tuning knob** for difficulty. They need playtesting.
- **Decided: 5 bands** (2026-10-12). Colors still read as a green→red scale. Widths above are starting values for playtesting.

### 3.2 Line-of-sight definition — **[Proposed]**
- LOS = the straight segment from the **click point to the target center** doesn't intersect any wall.
- Using the target *center* (not "any part of the circle") keeps the shadow edges crisp and deducible.
- **Decided: walls are straight lines with a thickness** (2026-10-12), not general polygons. A wall is `{ a, b, thickness }` with **round end caps** (a "capsule"). Connected walls form seamless corners, and the math is just "distance from a point/segment to the wall's center line ≤ thickness/2". The editor draws walls as lines, and curves are approximated by chains of short walls.
- **Grazing counts as blocked:** if the sight line touches a wall (including its rounded end), there's no LOS.
- Clicks inside or on the edge of a wall are rejected and **don't count**. Clicks outside the board (in the letterbox margin) are ignored.
- A click exactly on a band boundary gets the **closer** band.
- The target may not overlap any wall or extend past the board edge (enforced by course validation).
- Board edges count as walls. Since the board is a convex square, they never actually block a sight line between two in-board points.

### 3.3 Is the target visible? — **[Proposed: hidden]**
The target stays hidden until it's hit. (Reading the original idea literally, a *visible* circle would make the game trivial, so hidden is assumed.)

### 3.4 Luck vs. skill
The first click is mostly luck, and a lucky hole-in-one on click 1 makes daily results noisy.
- Make the **target small enough** that a random first-click hit is rare (~0.5–1% of open area).
- ~~Free opening probe~~: **Decided: no** (2026-10-12). The first click is a real, scored click. Some opening luck is an accepted part of the game.
- Golf framing: compute a daily **par** (see §5) and score relative to it, which smooths out "hard day vs. easy day."

### 3.5 Click precision & devices
- **Decided: desktop-first, the board fills the screen** (2026-10-12). Mobile is a later concern.
- **Fixed logical board of 1800×1000** (1.8 : 1, roughly a maximized browser window on a monitor). All game logic uses these units.
- The board is scaled uniformly to **cover** the window (SVG `preserveAspectRatio="xMidYMid slice"`). There's no stretching and no letterbox bars. If the window isn't exactly 1.8 : 1, a little of the board's edge is cropped.
- **Safe area** `x 100–1700, y 75–925` is always visible for window shapes from about 1.6 : 1 to 2.1 : 1 (laptops through wide monitors). The **target must be inside the safe area** (enforced by validation). Walls may run past it to the edge.
- Fairness trade-off: players with unusual window shapes see slightly more or less of the empty edges, but every player can see the target's area and the same walls that matter. That's acceptable for a desktop-first launch. Revisit for mobile (portrait phones would crop heavily, so they'll need their own layout).
- Touch: fingers are imprecise, so the target radius must be big enough to hit reliably (≥ ~44 CSS px on a small phone).
- **Decided: no misclick protection.** Every tap counts, with no confirm or undo step (2026-10-12).
- **Decided: no click cap** for now. The game continues until the target is found (2026-10-12). May revisit.

### 3.6 Accessibility (important for green/yellow/red)
About 8% of men have red-green color vision deficiency, and the core mechanic is a red→green scale. Plan for this from day one:
- **Colorblind palette** toggle (e.g. blue→orange scale, or a viridis-like ramp).
- **Redundant encoding**: every marker also shows a number or pip count (1–5) or a ring count, so color is never the only signal.
- Grey "no LOS" markers get a **distinct shape** (hollow / ✕), not just a color.

### 3.7 Screen layout & flow — **Decided: minimal flat**
- The **blank canvas fills the screen** (see the aspect-ratio note in §3.5). No persistent chrome on the board itself; maybe a tiny unobtrusive corner icon for help/settings and the click counter.
- **Start popup**: a small card centered over the canvas with the title, puzzle #, a one-line how-to, and a **Start** button. The board is visible but dimmed/blurred behind it.
- **Win popup**: the same card returns after the hit, showing score vs. par, stats/streak/distribution, the **Share** button, the replay (§4), and a countdown to the next puzzle.
- Returning after already playing today skips straight to the win popup (with today's board and markers shown behind it).
- Visual language: flat colors, no gradients/shadows on the board, one font, lots of whitespace.

---

## 4. Strategy-Deepening Ideas

Ranked roughly by value vs. complexity.

### Tier 1 — strongly recommended for v1
1. **Discrete bands** (§3.1). Without this there isn't much strategy.
2. **Persistent markers.** Every click leaves its colored/grey dot on the board. **Decided: no ring/shadow overlays to start** (2026-10-12). Players picture the rings and shadows themselves. An optional assist overlay could be revisited later (it would then need a share-card marker to keep scores comparable).
3. **Daily par + golf scoring.** "PinPoint" already sounds like golf. Birdie / Eagle / Bogey labels give more satisfying feedback than a raw number.
4. **Post-game replay.** After solving, show how the **feasible region** (where the target could still be) shrank with each click, next to the solver's optimal line. This is the main way players learn strategy, and it's what keeps a daily game interesting past week 2.

### Tier 2 — good variety for later / "special days"
5. **Map archetypes** that reward different strategies:
   - *Rooms & doors*: grey clicks tell you which room the target isn't in.
   - *Pillars field*: many small occluders, so shadows overlap in interesting ways.
   - *Maze corridors*: LOS is short, so most clicks are grey and you probe by elimination.
   - *Open field + one big wall*: almost pure trilateration, which works as an "easy Monday."
6. **Difficulty curve across the week** (like NYT crosswords): Monday open and simple, Sunday dense walls and a smaller target.
7. **Special wall types** (introduce one at a time, never all at once):
   - **Glass**: blocks clicking but *not* sight.
   - **Smoke / fog zones**: you can click there, but clicks inside fog always return grey (or no info).
   - **Mirrors**: LOS can bounce once. Very strategic, but harder to understand and to implement.
8. **One-time "sonar" power-up**: once per game, a click returns the *exact* distance instead of a band. It adds a decision about when to spend it. It can make the game feel less pure, so playtest before committing.

### Tier 3 — probably not
- Moving targets, timers, or multiple targets. These add stress and noise rather than strategy, and they're hard to compare fairly in a daily format.
- Hidden walls / fog of war. It's interesting, but it doubles the unknowns. Could be a hard-mode variant someday.

---

## 5. Puzzle Generation & the Solver

### 5.1 Daily determinism
- Puzzle number = days since launch date. Everyone with the same local date gets the same puzzle (Wordle uses the local calendar date). **Decided: local date** (2026-10-12). Leaderboards then need to be keyed by puzzle # (not by a UTC day), and the server should accept a puzzle only within ±1 day of its date to allow for time zones.
- Puzzles are pure data: `{ id, walls: { a, b, thickness }[], target: { center, radius }, par }`.

### 5.2 Generation approach — **[Proposed: offline generate → validate → curate]**
| Approach | Pros | Cons |
|---|---|---|
| Client-side procedural from date seed | No backend, infinite puzzles | No quality control, and the answer is in the JS |
| Hand-authored list | Highest quality | Doesn't scale, and it's slow |
| **Offline generator + solver validation + light curation** | Quality control plus scale, and par comes from the solver | Needs a solver (which we want anyway) |

Pipeline: generate candidate boards from archetype templates → place the target → run the solver → reject boards that are trivial, too hard, or degenerate (e.g. target fully enclosed) → assign par → ship as a JSON file (or one puzzle per day from an endpoint).

### 5.3 Solver sketch
- Discretize the board into candidate points (e.g. a 200×200 grid, minus walls).
- Each click outcome (band k, or grey) is a **filter** on the candidates. The feasible set is whatever survives every filter so far.
- A greedy optimal click chooses the probe point that **minimizes the expected size of the feasible set** (or maximizes the entropy of the outcome distribution).
- Uses:
  - **Par** = the solver's average clicks over targets in that map's open area, or for the actual target.
  - **Difficulty rating** for scheduling the week.
  - **Post-game replay** ("the optimal player would have clicked here").
  - **Hint system** (optional): highlight the feasible region.
  - **Course editor validation** (§5.5): report par and flag bad designs while you draw.
- LOS with precomputed **visibility polygons** per click keeps this fast (standard computational geometry, which libraries handle).

### 5.4 Target size — **Decided: constant** (2026-10-12)
The target radius is the same every day for now. Difficulty comes from wall layout (and par absorbs it).

### 5.5 Hand-drawn courses / course editor — **Decided: B, in-app editor** (2026-10-12)
Idea: draw courses by hand instead of (or alongside) generating them. **Very feasible.** There are two ways to do it, and they can coexist:

**A. Draw in any paint app → import an image** (fastest way to start authoring)
- Draw on a fixed-size canvas (e.g. 1000×1000) in Paint / Procreate / Figma: **black = wall, white = open**, optionally a **blue dot = target**.
- An import script converts it to course data. Two options:
  - *Bitmap walls*: keep the walls as a pixel grid and check LOS by stepping along the line pixel by pixel. Dead simple, and any shape works (curves, blobs, handwriting).
  - *Traced polygons*: trace wall outlines into polygons (marching squares + simplification). Crisp at any screen size, and it matches the vector geometry everywhere else.
- Recommendation: trace to polygons, so there's **one** wall format in the game. Bitmap is the fallback if tracing gets fiddly.
- This is effectively an internal tool. It's great for seeding the first few dozen dailies with hand-designed courses.

**B. Built-in course editor (in the web app)**
- Tools: draw wall (click-drag a line; set thickness), chain walls (polyline: each click continues from the last endpoint), select/move/delete, place target. Snap to grid and to existing wall endpoints.
- **Live solver feedback** while drawing: par, difficulty, the "first-click hit chance", and warnings (target unreachable/enclosed, map trivially open).
- **Test-play** button.
- Effort: moderate. It's a second app mode on the same geometry and render code, which is a strong portfolio piece.

**What it unlocks**
- **Curated dailies**: hand-made courses go into the daily rotation (with solver-assigned par).
- **Challenge a friend**: encode a custom course into a share link. Unranked: the target is in the link, so it's honor-system, which is fine for friends.
- **Community courses** (much later): a public gallery with moderation, ratings and per-course leaderboards. It needs accounts and moderation, so it isn't v1.

**Decision:** build the **in-app editor (B)**. Image import (A) is shelved and could be added later as an extra "import" button in the editor.

**Build order:** core game engine (geometry, LOS, click resolution, rendering) → **editor**, which doubles as the authoring tool for the first dailies → daily mode → solver/par → friend-challenge links → community courses.
- The editor exports courses in the same JSON puzzle format the daily game consumes, so one data model covers both.
- Hand-authored dailies need the same secrecy as generated ones (§7.3): **saved courses for upcoming days must not be committed** to the public repo.

---

## 6. Social / Retention

- **Share card** (spoiler-free, emoji sequence):
  ```
  PinPoint #42 ⛳ 5 (par 6)
  🟥⬜🟨🟩🔵
  ```
  Uses ⬜ for grey (no LOS), colored squares per band, and 🔵 for the hit. Shows the shape of the solve without giving away the location.
- **Local stats**: games played, streak, average vs. par, distribution histogram (like Wordle's guess distribution).
- **Practice / unlimited mode**: random boards for learning without affecting the daily streak.
- **Archive**: play past dailies (doesn't count for streak).
- [Later] Global stats: "Median score today: 6. You beat 72% of players." This needs a backend.

---

## 7. Technical Architecture

### 7.1 Stack — **Decided** (2026-10-12)
| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Owner's preference; type safety for geometry code |
| Build tool | **Vite** | Instant dev reload, simple production builds, TS out of the box |
| UI | **React** | The editor has heavy UI state; most job-relevant; works naturally with SVG |
| Board rendering | **SVG** (`viewBox="0 0 1000 1000"`) | Matches the fixed logical grid (§3.5), crisp at any size, per-element events for the editor. A Canvas layer can be added for heavy visuals (e.g. replay heatmap) if ever needed |
| Tests | **Vitest** | Vite's test runner. Geometry/LOS correctness is critical |
| Hosting | **Cloudflare Workers** (static assets) | Free, auto-deploys from GitHub. The same Worker can serve the later leaderboard API, with **D1** for storage |

Alternatives considered: Next.js (heavier, easy to leak the answer to the client), Canvas-only rendering (manual scaling and hit-testing), Svelte (less job-relevant), Vercel / GitHub Pages hosting.

**Core rule:** game logic (geometry, LOS, `resolveClick`, scoring) is **plain TypeScript with no React/DOM imports**, so the same code runs in the browser, the editor, the solver and, later, the server.

- Geometry: segment-to-segment distance for LOS against capsule walls. Visibility regions for the solver.
- Stats and streak in `localStorage` (wrapped in try/catch).

### 7.2 Hosting
- **Live at https://pinpoint.sheptrundle.workers.dev/** (2026-10-12).
- Deployed as a **Cloudflare Worker serving static assets** (Cloudflare's dashboard set it up as a Worker rather than a Pages project; Cloudflare now recommends Workers for new projects). Connected to the GitHub repo; builds `npm run build` → `dist/` on push to `main`. Node version is pinned by `.node-version`.
- The leaderboard API and the "today's course" endpoint (§7.3) can later live in this same Worker, with D1 for storage.

### 7.3 Cheating & where the answer lives — **[Open]**
- **Option A (Wordle-style, client-side):** the day's target ships to the browser. Anyone can find it in devtools, but it's simple, free, and works offline. That's fine if there's no competitive leaderboard.
- **Option B (server-validated):** the client sends click coordinates to an API that returns only the band/grey result. The target never leaves the server, and the API is needed for global stats or leaderboards. Small serverless function plus a KV store.
- Suggestion: **ship A first**, design the code so the "resolve click" function sits behind an interface, and switch to B if/when leaderboards are added.
- **Update (2026-10-12):** leaderboards are a confirmed goal, so **B is the end state**. The `resolveClick` interface is required from day one. Before leaderboards launch, the server must also own the daily puzzle and track each player's clicks per day, so scores can't be forged. That means some lightweight identity (anonymous device ID at first, optional accounts later).
- **The repo is public**, so **future puzzle data (target positions) must never be committed**. The generator/solver code can be public. Generated daily puzzles live in a private store (server KV/DB, or a private repo/bucket) and are released only after their day ends. Any seeds or secrets used for generation go in env vars, never in the repo.

### 7.4 Suggested module layout (when we build)
```
src/
  geometry/   # points, segments, distances, intersection
  game/       # puzzle model, click resolution, scoring, state machine
  render/     # SVG board, markers, overlays, animations
  ui/         # header, modals (help, stats, share), settings
  storage/    # localStorage stats/streaks
tools/
  generator/  # offline board generation
  solver/     # feasible-set solver, par calculation
  editor/     # in-app course editor (§5.5)
puzzles/      # generated daily puzzle data
```

---

## 8. Open Questions (to resolve together)

1. ~~3 or 5 bands?~~ **5.** Widths still TBD via playtesting.
2. ~~Free opening probe?~~ **No**, the first click is real.
3. ~~Misclick protection?~~ **None**, every tap counts.
4. ~~Click cap?~~ **None** for now.
5. ~~Overlays?~~ **None** to start.
6. ~~Local or UTC?~~ **Local date.**
7. ~~Leaderboards eventually?~~ **Yes.** Anonymous device ID first, optional accounts later (§7.3).
8. ~~Visual theme?~~ **Minimal flat**, full-screen canvas + popup cards (§3.7).
9. ~~Target size?~~ **Constant** for now.
10. ~~Course editor approach?~~ **B: in-app editor.**

---

## 9. Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-10-12 | Project named **PinPoint**; daily, click-count scoring; green→red distance feedback + grey for no LOS | Original concept |
| 2026-10-12 | Adopt all of §3–§6 recommendations as the working baseline (discrete bands, par/golf scoring, solver, replay, accessibility, share card) | Approved in review; specifics still subject to §8 |
| 2026-10-12 | **Leaderboards + score sharing are goals** → server-validated click resolution (§7.3 option B) is the target architecture | Client-side targets can't support a fair leaderboard |
| 2026-10-12 | GitHub repo **public** for now (portfolio visibility); may go private later | Recruiter visibility. Implies puzzle answers stay out of the repo (§7.3) |
| 2026-10-12 | 5 distance bands | More strategic depth than 3 |
| 2026-10-12 | No misclick protection; every tap counts | Simplicity, and it raises the stakes |
| 2026-10-12 | No click cap (for now) | Revisit after playtesting |
| 2026-10-12 | Daily rollover on the player's local date | Wordle convention; leaderboards keyed by puzzle # |
| 2026-10-12 | Minimal flat UI: full-screen canvas, start/win popup card | Owner's vision |
| 2026-10-12 | Constant target size | Keep scores comparable; difficulty via walls |
| 2026-10-12 | Hand-drawn courses are in scope (§5.5) | Owner's idea; feasible, and good for curation |
| 2026-10-12 | No free opening probe; first click is scored | Opening luck is accepted |
| 2026-10-12 | No ring/shadow overlays to start | Keep the deduction in the player's head |
| 2026-10-12 | Leaderboard identity: anonymous device ID first, optional accounts later | Per §7.3 |
| 2026-10-12 | Course authoring via in-app editor (B); image import shelved | Owner's choice; doubles as the daily authoring tool |
| 2026-10-12 | Stack: Vite + TypeScript + React + SVG, Vitest, Cloudflare Pages (Workers + D1 later) | See §7.1 |
| 2026-10-12 | Walls are thick line segments with round caps, not polygons; grazing blocks LOS | Simpler math and editor; seamless corners |
| 2026-10-12 | Board fills the screen: 1800×1000 logical board, scaled to cover with a safe area; desktop-first | Owner's priority is monitors; no stretching or letterboxing |
| 2026-10-12 | Thinner walls: default 8 units (~8 px on a monitor) | Owner's preference |
| 2026-10-12 | Hosting on a Cloudflare Worker (static assets) instead of Pages | That's what the dashboard set up; Workers can host the API later too |
| | | |
