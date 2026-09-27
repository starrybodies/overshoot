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
| [`animatic/build.mjs`](animatic/build.mjs) | Builds the timed cut of the whole film from the plates, generated takes, VO and music. |
| [`animatic/timeline.mjs`](animatic/timeline.mjs) | The edit: every segment's start, end and plate in-point. |
| [`brand/gaia-ai-mark.png`](brand/gaia-ai-mark.png) | Gaia AI mark for the end card (cream, transparent). |

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

4. **Build the animatic, then keep rebuilding it into the film.**

   ```sh
   node launch-film/capture/capture.mjs --mode video   # plates, if not already recorded
   node launch-film/animatic/build.mjs                 # → launch-film/out/overshoot-animatic.mp4
   node launch-film/animatic/build.mjs --clean         # → overshoot-roughcut.mp4, no labels or subtitles
   ```

   The first build is an 80 s cut. The real plates are in place, each generated shot is a slate showing its first/last frame notes, both titles are set in the atlas's own type, the end card uses the real marks, and the VO lines are burned in at their timecodes. The build reads shot names from `SHOT-LIST.md` and cues from `VO-SCRIPT.md`, so edit those files, not the builder.

   Drop each chosen take in `launch-film/generated/` as `G01.mp4` … `G12.mp4` (mov and webm also work). Drop the recorded VO in `launch-film/audio/` as `vo.wav` and the score as `music.wav`. Rebuild, and each take replaces its slate: a take is scaled and cropped to 1920×1080 and trimmed to its slot, or its last frame is held if it runs short. Retime cuts and plate in-points in `animatic/timeline.mjs`. `generated/`, `audio/` and `out/` are git-ignored.

   It needs ffmpeg with libx264: set `FFMPEG`, have `ffmpeg` on `PATH`, or run `pip install imageio-ffmpeg`.

5. **Finish** around the plates. Composite the interface in 3D space; never regenerate it. Set the two titles by lifting them from the homepage hero (plate P01), which already reads *Where did it come from? / Where did it go?* The end card uses `public/overshoot-mark.svg`, `public/overshoot-lockup.png` and `brand/gaia-ai-mark.png`.

## Still to supply (not in this repo)

- Gaia AI wordmark, and a vector (SVG) of the mark for 4K. [`brand/gaia-ai-mark.png`](brand/gaia-ai-mark.png) is the mark alone: 1080×1080, cream on a transparent background, which is enough for the small end-card credit.
- Optional real reference footage or images for the generator: an open-pit copper mine, crushing/flotation, a smelter, cathodes, bulk carriers, container ports, electronics assembly, e-waste, recovery.
- Rights-cleared music, or a composer brief built from the *Sound* sections.

## Evidence discipline

The atlas separates measured connections from assumptions and says where the evidence ends. The film must not undo that. The copper journey is a metaphor, map curves are not ship tracks, generated places carry no real names or logos, and not everything is recycled. See the *Evidence discipline* section of `PROMPT.md`, and do a final check of every frame for invented text, numbers or UI before release.
