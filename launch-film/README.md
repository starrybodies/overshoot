# OVERSHOOT launch film

Production kit for a ~72 s cinematic launch film (plus an 8 s end card). The film starts with the planetary scale of material reality, then reveals OVERSHOOT as the instrument that makes it legible.

One copper journey runs through it: vein → ore → concentrate → cathode → wire → product → use → discard → recovery. The camera keeps crossing between the physical world and the **real** Overshoot interface.

| File | What it is |
|------|------------|
| [`PROMPT.md`](PROMPT.md) | Master prompt / style bible. Paste it ahead of every generated shot. |
| [`SHOT-LIST.md`](SHOT-LIST.md) | 12 generated shots (G01–G12) interleaved with 15 real screen plates (P01–P15), each with first/last frames, prompt, timing, sound and VO. |
| [`VO-SCRIPT.md`](VO-SCRIPT.md) | Voiceover with timecodes and direction, a clean read and a 30 s cut-down. |
| [`capture/captures.mjs`](capture/captures.mjs) | The plate list: URL plus scripted camera moves through the atlas. |
| [`capture/capture.mjs`](capture/capture.mjs) | Records the plates as 4K PNG keyframes and 1080p WebM moves. |

## Workflow

1. **Capture the plates.** They come from the real site, not from imagination.

   ```sh
   npm install --no-save playwright   # once, if Playwright is not already available
   node launch-film/capture/capture.mjs                       # live site, dark theme, stills + video
   node launch-film/capture/capture.mjs --base http://localhost:5173 --only P04-escondida,P05-journey
   node launch-film/capture/capture.mjs --mode stills --theme light
   ```

   The output goes to `launch-film/plates/` (git-ignored):
   - `stills/<plate>--first.png`, `--last.png` and named keyframes at 3840×2160. These are the first/last-frame anchors for the generated shots.
   - `video/<plate>.webm` at 1920×1080. Use these for timing and the animatic.
   - `manifest.json` records the URL, theme and time of each plate. Keep it with the edit so every product shot traces back to a shareable view.

   The script dismisses the newsletter invitation and sets the theme via `localStorage`. It pins the browser locale to `en-US`, because some container defaults such as `en-US@posix` are rejected by `Intl.DisplayNames`. Dark theme is the default because the film lives in deep blacks.

   **Final 4K/60 masters:** Playwright's recorder is VP8 at a variable frame rate. It is fine for the animatic but not for the master. For finals, open each plate's URL from `manifest.json` in a real browser on a GPU machine at 3840×2160 (or 1920×1080 at 200%) and record with OBS or ScreenFlow at 60 fps, following the same move. The WebM is the reference for that move.

2. **Generate the G shots** one at a time: `PROMPT.md` plus that shot's prompt from `SHOT-LIST.md` plus its first/last frames. Several shots begin or end on a plate still, so the generated world hands off directly into the real interface. Generate 4–8 takes per shot.

3. **Record the VO** from `VO-SCRIPT.md` separately. Never let the video model speak or typeset lines.

4. **Assemble** around the plates. Composite the interface in 3D space; never regenerate it. Set the two titles by lifting them from the homepage hero (plate P01), which already reads *Where did it come from? / Where did it go?* The end card uses `public/overshoot-mark.svg` and `public/overshoot-lockup.png`.

## Still to supply (not in this repo)

- Gaia AI logo and wordmark (transparent SVG/PNG) for the end card.
- Optional real reference footage or images for the generator: an open-pit copper mine, crushing/flotation, a smelter, cathodes, bulk carriers, container ports, electronics assembly, e-waste, recovery.
- Rights-cleared music, or a composer brief built from the *Sound* sections.

## Evidence discipline

The atlas separates measured connections from assumptions and says where the evidence ends. The film must not undo that. The copper journey is a metaphor, map curves are not ship tracks, generated places carry no real names or logos, and not everything is recycled. See the *Evidence discipline* section of `PROMPT.md`, and do a final check of every frame for invented text, numbers or UI before release.
