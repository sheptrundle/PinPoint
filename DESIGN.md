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
- Walls are polygons (mostly thick line segments/rectangles). Clicks inside walls are rejected and **don't count**.
- Board edges count as walls.

### 3.3 Is the target visible? — **[Proposed: hidden]**
The target stays hidden until it's hit. (Reading the original idea literally, a *visible* circle would make the game trivial, so hidden is assumed.)

### 3.4 Luck vs. skill
The first click is mostly luck, and a lucky hole-in-one on click 1 makes daily results noisy.
- Make the **target small enough** that a random first-click hit is rare (~0.5–1% of open area).
- ~~Free opening probe~~: **Decided: no** (2026-10-12). The first click is a real, scored click. Some opening luck is an accepted part of the game.
- Golf framing: compute a daily **par** (see §5) and score relative to it, which smooths out "hard day vs. easy day."

### 3.5 Click precision & devices
- Use a **fixed logical coordinate system** (e.g. 1000×1000), scaled to the screen, so phone and desktop play the same board.
- Fixed aspect ratio (square, or 4:5 for phones). No reflow of the board.
- **Full-screen look vs. fairness:** the UI vision (§3.7) is a canvas that fills the screen, but screens come in different shapes, and a board that stretched to fit would differ per device. Resolution: the **play area keeps a fixed aspect ratio**, scaled as large as fits. The leftover margin uses the same blank background with no border, so it still *looks* full-screen. Clicks in the margin are ignored. **[Proposed]**
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
- Puzzles are pure data: `{ id, walls: Polygon[], target: {x, y, r}, bands, par }`.

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
- Tools: rectangle wall, thick line wall, polygon/freehand wall, eraser, place target. Snap to grid optional.
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

## 7. Technical Architecture (initial thoughts)

### 7.1 Front end — **[Proposed]**
- **Vite + TypeScript**, no heavy framework needed for the board. A small amount of UI (modals, stats) can be plain TS or Preact/React.
- Render the board with **SVG** (crisp at any scale, easy hit-testing, simple to animate markers) or **Canvas** (if overlays get heavy). SVG to start.
- Geometry: segment–polygon intersection for LOS. Visibility polygons for overlays and the solver.
- Stats and streak in `localStorage` (wrapped in try/catch).

### 7.2 Hosting
- Static hosting: Cloudflare Pages / Vercel / Netlify / GitHub Pages. Free tier is fine.

### 7.3 Cheating & where the answer lives — **[Open]**
- **Option A (Wordle-style, client-side):** the day's target ships to the browser. Anyone can find it in devtools, but it's simple, free, and works offline. That's fine if there's no competitive leaderboard.
- **Option B (server-validated):** the client sends click coordinates to an API that returns only the band/grey result. The target never leaves the server, and the API is needed for global stats or leaderboards. Small serverless function plus a KV store.
- Suggestion: **ship A first**, design the code so the "resolve click" function sits behind an interface, and switch to B if/when leaderboards are added.
- **Update (2026-10-12):** leaderboards are a confirmed goal, so **B is the end state**. The `resolveClick` interface is required from day one. Before leaderboards launch, the server must also own the daily puzzle and track each player's clicks per day, so scores can't be forged. That means some lightweight identity (anonymous device ID at first, optional accounts later).
- **The repo is public**, so **future puzzle data (target positions) must never be committed**. The generator/solver code can be public. Generated daily puzzles live in a private store (server KV/DB, or a private repo/bucket) and are released only after their day ends. Any seeds or secrets used for generation go in env vars, never in the repo.

### 7.4 Suggested module layout (when we build)
```
src/
  geometry/   # points, segments, polygons, LOS, visibility polygons
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
| | | |
