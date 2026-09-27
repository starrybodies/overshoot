# OVERSHOOT launch film: shot list

About 72 s of picture plus an 8 s end card. There are two kinds of material:

- **G shots** are generated. Each prompt below is pasted *after* [`PROMPT.md`](PROMPT.md), with the named first-frame and last-frame images attached. Generate each one separately; 3–6 s is the reliable range for most models. Generate 4–8 takes per shot and pick in the edit.
- **P plates** are real OVERSHOOT screen recordings made by [`capture/capture.mjs`](capture/capture.mjs). They are never generated or retouched, only composited: moved in 3D space, masked, scaled, graded to sit in the cut, and pushed through.

The deliberate trick is **frame handoff**. A G shot's last frame is often a P plate's first still (`plates/stills/<id>--first.png`), and the next G shot's first frame is that plate's last still. The generated world therefore begins and ends *on* the real interface, and the edit dissolves through it. Generated footage becomes the world surrounding the product, so the product is never hallucinated.

Timecodes line up with [`VO-SCRIPT.md`](VO-SCRIPT.md).

---

## The killer sequence (0:07–0:44)

```
P04 copper node ─► G03 into the mine ─► G04 ore → concentrate ─► G05 smelt → cathode → wire
   ─► P05 journey ─► G06 wire trace → sea lane → ship ─► P08 trade map ─► G07 ship → planet
   ─► G08 port → factory → product ─► G09 hand → city ─► G10 discard → pathways → recovery
```

If these ~37 seconds land as one continuous conceptual journey, the film works. Everything else supports it. The journey is a metaphor for how material moves. It is **not** a tracked chain of custody, and nothing on screen claims one (see *Evidence discipline* in `PROMPT.md`).

---

## OPEN · 0:00–0:07

### G01 · Mineral vein macro · 0:00–0:03.5
- **First frame:** black.
- **Last frame:** extreme macro of chalcopyrite / bornite in dark host rock, one copper-bronze grain catching light.
- **Prompt:** From total black, a single raking light slowly reveals an extreme macro landscape of a copper-bearing mineral vein in black rock. The camera drifts impossibly close over crystalline chalcopyrite and iridescent bornite; one grain catches a warm copper glint. Shallow depth of field, real geological texture, dust motes, no text. Slow, almost still.
- **Sound:** near silence → a single tiny metallic tick → stone creak.
- **VO 1:** "Everything around you came from somewhere."

### G02 · The pull-back · 0:03.5–0:07
- **First frame:** G01 last frame.
- **Last frame:** Earth from orbit, night side edge. Faint hair-thin copper-coloured trajectories begin to appear across the continents.
- **Prompt:** A continuous, accelerating pull-back: the mineral grain becomes rock, rock becomes a mountain face, the mountain becomes an arid range, the range becomes a continent, the continent becomes the whole Earth. As Earth resolves, thousands of almost invisible thin trajectories fade in across land and sea, like fine particles, not neon lines. Photoreal satellite imagery, deep black space.
- **Title (edit):** WHERE DID IT COME FROM? Set it in the homepage's own display type; lift it from plate **P01** (`P01-hero--hero.png`) rather than re-typesetting.

## EXTRACTION · 0:07–0:15

### G03 · Dive into the mine · 0:07–0:11
- **First frame:** Earth (G02 last frame).
- **Last frame:** open-pit benches filling frame. One ore fragment in mid-fall, sharp against blurred dust.
- **Prompt:** A violent, continuous dive from orbit down through atmosphere toward a high desert mountain range, into an enormous terraced open-pit copper mine. Haul trucks and excavators are microscopic against the benches. A bench blast erupts; rock fractures and falls in slow motion. The camera locks onto ONE falling ore fragment. Photoreal, immense scale, no signage, no logos.
- **Sound:** wind → subterranean rumble → blast thump.
- **VO 2:** "We move more of the Earth every year than most of us can comprehend."

### P04 · Escondida to the coast · intercut 0:11–0:12.5
- The mine as a real, sourced record on the atlas. Push in on the mapped mine point. The circular pit in G03 and the point on the map should read as two views of the same *kind* of thing.
- Dissolve *out of* the plate by scaling the mine marker up until it becomes the ore fragment in G04.

### G04 · Ore to concentrate · 0:12.5–0:15
- **First frame:** single ore fragment (from G03 last frame).
- **Last frame:** a dark, glittering stream of copper concentrate pouring like fine sand.
- **Prompt:** One impossible, continuous macro transformation. A rock fragment enters a gyratory crusher and shatters; the fragments are ground to fine mineral particles; the particles rise through the froth of a flotation cell, clinging to bubbles; the froth collapses into dark, glittering copper concentrate pouring like sand. Macro photography, wet mineral texture, industrial light. Every stage flows into the next without a cut.
- **Sound:** crusher impacts establish the first beat.

## TRANSFORMATION · 0:15–0:24

### G05 · Smelt → cathode → wire · 0:15–0:20
- **First frame:** concentrate pour (G04 last frame).
- **Last frame:** bright copper wire drawn at speed, filling the frame with parallel copper lines.
- **Prompt:** The dark concentrate stream falls into the roaring interior of a smelting furnace. Molten copper pours in a blinding arc, cast into anodes. Anodes hang in rows in an electrorefining tank house. Pure cathode sheets are lifted out gleaming. Cathodes become copper rod, then wire drawn through dies at industrial speed, parallel strands of copper filling the frame. Heat shimmer, sparks, real industrial scale, continuous flowing transitions.
- **Sound:** rail joints → furnace roar → wire-drawing whine.
- **VO 3–5:** "Extracted." "Refined." "Processed." (on concentrate, cathode lift, wire)

### P03 → P05 · Choose copper, see the journey · 0:20–0:24
- **P03:** the hand-like selection of *Copper* in the material guides.
- **P05:** the copper journey stages (mine & concentrate → smelt → refine → make & use → recover). Let it play full-frame for at least 2 s so the product registers.
- Exit by pushing the camera *into* one of the journey's stage lines; it becomes the wire trace that opens G06.

## THE PLANETARY MACHINE · 0:24–0:37

### G06 · Wire trace → sea lane → ship · 0:24–0:28
- **First frame:** a single thin copper line on dark ground (echoing the P05 stage line).
- **Last frame:** a laden bulk carrier from high above, at night, its wake a thin bright line on black water.
- **Prompt:** A single copper-coloured line on a dark surface. The camera rises and the line is revealed as a circuit trace, then as a coastline route, then as the wake of a vast bulk carrier crossing black ocean at night. Moonlight on swell, deck lights, the ship tiny against the sea, then enormous as the camera sweeps along its hull. No name, livery or markings on the ship.
- **Sound:** ship horn, low and long. Music begins to build.
- **VO 6:** "Shipped across oceans."
- Material note: concentrate travels in bulk carriers. Save stacked containers for G08.

### P08 / P07 · Trade map · 0:28–0:31
- **P08** copper ore & concentrate exports from Chile, then **P07** refined copper worldwide. Match the ship's heading in G06 to the direction of a line on the map. Fill the frame with the real interface.

### G07 · Ship → planet · 0:31–0:33.5
- **First frame:** the ship at night from above (G06 last frame).
- **Last frame:** the full night Earth wrapped in dense, subtle material streams: sea lanes, rail, ports and cities.
- **Prompt:** A continuous pull-up from a ship at night. The ship becomes a moving point of light; hundreds of other points appear on the sea; shipping lanes ignite as flowing particles; ports glow on the coasts; railways and roads light inland; cities bloom. The pull-back continues until the whole night-side Earth is wrapped in fine, dense flows of moving matter. Particles and density, not neon lines. Photoreal satellite night imagery.
- **Sound:** container locks and rail joints become percussion.

### G08 · The same matter changes identity · 0:33.5–0:37
- **First frame:** a gantry crane over a container stack (container grid).
- **Last frame:** a city grid at dusk seen from above (the container-grid → city-grid match cut).
- **Prompt:** A crane swings a container onto an immense stack; the camera passes into a factory. Copper wire is wound into a motor; copper traces are etched across a circuit board; the board is placed into a phone; heavy copper cable is pulled through a building and strung along grid infrastructure. The SAME copper glint travels from object to object as each changes identity. Rise out through a roof: the rectangular container grid becomes a city grid at dusk. Continuous, rhythmic, not a montage of unrelated stock.
- **VO 7–8:** "Made into things." "Sold into cities."

## USE · 0:37–0:44

### G09 · For a while, we call it ours · 0:37–0:44
- **First frame:** the city grid at dusk (G08 last frame).
- **Last frame:** a single hand holding an ordinary phone, then the pull-back to countless lit windows.
- **Prompt:** Sudden quiet, human scale. Inside a city apartment at dusk, a hand holds an ordinary smartphone; a light switches on. For a moment the hidden material composition of everyday life is revealed as a delicate ghost x-ray: copper veins run through the walls, fine metals glow inside the phone, the steel skeleton of the building, petrochemical fibres in fabric. Then pull slowly backward out of the window: millions of lit windows, traffic moving, the whole city breathing. Natural, intimate cinematography; the x-ray effect is subtle and physical, never a HUD.
- **Sound:** music drops out; room tone, a light switch, distant traffic.
- **VO 9:** "For a while, we call it ours."

## AFTERLIFE · 0:44–0:55

### G10 · Divergent pathways · 0:44–0:50
- **First frame:** the phone dropped into a bin.
- **Last frame:** molten copper being poured into a new ingot mould.
- **Prompt:** The phone is dropped into a bin. Follow it: a collection truck, a transfer station, a fast sorting line with magnets and eddy currents, a shipping container of scrap, then the path splits. Show several fates in quick succession: a landfill cell being covered, an informal recovery yard with smoke, a mountain of discarded electronics, an industrial recycler shredding boards. Only one strand ends in a furnace where recovered copper is poured into a new ingot. Honest, unsentimental, physical. Not everything is recycled.
- **Sound:** sorting machinery, shredder, the furnace from G05 returning.
- **VO 10:** "Then we throw it away."

### P11 / P12 · Waste plates · 0:50–0:52.5
- **P12** electronics end-of-life, then **P11** waste. Branching downstream flows on the real map.
- **VO 11:** "But away is a place." Land it on the moment the map fills.

### G11 · Away is a place · 0:52.5–0:55
- **First frame:** landfill contours from above.
- **Last frame:** a topographic map-like Earth with many downstream destination points glowing.
- **Prompt:** Top-down over the terraced contours of a landfill; the contours become the contour lines of a topographic map; the camera rises until the whole Earth is visible, dotted with thousands of downstream destinations: landfills, stockpiles, recyclers, ocean accumulation. Quiet, precise, cartographic.
- **Title (edit):** WHERE DID IT GO? Lift it from the P01 hero, as with the first title.

## REVELATION · 0:55–1:05

Real product only: crisp, full-frame, generously held. Cut on the music. The user's path:

| Beat | Plate | VO |
|------|-------|----|
| WORLD | P02 globe with copper selected | 12 "OVERSHOOT makes the material world visible." |
| MATERIAL → SOURCE | P03 → P06 extraction sites | 13 "Follow what we extract." |
| TRADE | P08 → P09 ports and shipping | 14 "Where it travels." |
| USE | P05 (make & use stage) | 15 "What it becomes." |
| WASTE → RECOVERY | P12 → P13 provenance | 16 "And what happens next." |
| LOCAL | P10 type "Vancouver", map arrives, flows emerge | (under music) |
| QUERY | P14 open data & MCP console | (under music) |

## THE LIVING PLANET · 1:05–1:12

### G12 · The map becomes the planet · 1:05–1:12
- **First frame:** `P15-return-global--last.png` (the real atlas at world scale).
- **Last frame:** photoreal Earth with millions of subtle flows pulsing across continents and oceans; the planet seems to breathe.
- **Prompt:** Begin exactly on the supplied interface still and do not alter it. The camera pulls back from the screen; its material lines continue beyond the edges of the interface and become routes across a photoreal Earth. Millions of fine flows pulse between extraction, transformation, circulation, accumulation, discard and return. A living metabolism, not a network diagram: the planet appears to breathe through the movement of matter. Slow, vast, calm.
- **Sound:** everything stripped to one low planetary resonance.
- **VO 17–18:** "Because there is no away." … "There is only the journey."

## END · 1:12–1:20

- Earth fades to black; the pathways linger, then resolve into the **OVERSHOOT mark** (`public/overshoot-mark.svg`). Animate the real vector, and do not generate it.
- Lockup (`public/overshoot-lockup.png`, or re-set from the SVG for 4K): **OVERSHOOT** / *A planetary atlas of material flows*.
- Small: the Gaia AI mark (`brand/gaia-ai-mark.png`) beside **A GAIA AI PRODUCT**. The mark is cream on transparent, so it sits directly on the black end card; keep it smaller than the OVERSHOOT mark.
- *Explore the material world.* **overshoot.gaiaai.xyz**
- Final line, held long enough to read twice: **Try it. Explore it. Tell us what we're missing.**
- End on the mark alone. Sonic signature.
- **VO 19–23.**

---

## Delivery

- Master: 3840×2160, 24 fps for the film (plates recorded at 60 fps and conformed), Rec.709, stereo + 5.1 stems.
- Cut-downs: 30 s (VO cut-down in `VO-SCRIPT.md`), 15 s (G02 → P04 → G07 → P02 → end card), 9:16 vertical re-frame of the Revelation section.
- Before release, check every frame for legible invented text, fake numbers or a generated UI. Any such frame is replaced by a real plate.
