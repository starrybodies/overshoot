// Edit decision list for the launch film animatic.
//
// Times are seconds from the head of the film and follow SHOT-LIST.md and
// VO-SCRIPT.md. Generated shots (G..) take their title and first/last frame
// notes from SHOT-LIST.md; until a take exists at generated/<id>.<mp4|mov|webm>
// they render as a slate. Plates (P..) come from plates/video/<plate>.webm.
//
// `in` is the source time in the plate recording. When it is left out the
// segment ends one second before the recording does, where every scripted
// move has finished and the frame is holding.
//
// `title` lays one of the two title cards over the segment from `titleAt`.

export const fps=24;
export const size={width:1920,height:1080};

export const timeline=[
 // OPEN
 {id:'G01',start:0,end:3.5},
 {id:'G02',start:3.5,end:7,title:'come-from',titleAt:4.4},
 // EXTRACTION
 {id:'G03',start:7,end:11},
 {id:'P04',plate:'P04-escondida',start:11,end:12.5},
 {id:'G04',start:12.5,end:15},
 // TRANSFORMATION
 {id:'G05',start:15,end:20},
 {id:'P03',plate:'P03-select-copper',start:20,end:21.5,in:13.3},
 {id:'P05',plate:'P05-journey',start:21.5,end:24},
 // THE PLANETARY MACHINE
 {id:'G06',start:24,end:28},
 {id:'P08',plate:'P08-trade-concentrate',start:28,end:29.5},
 {id:'P07',plate:'P07-trade-world',start:29.5,end:31},
 {id:'G07',start:31,end:33.5},
 {id:'G08',start:33.5,end:37},
 // USE
 {id:'G09',start:37,end:44},
 // AFTERLIFE
 {id:'G10',start:44,end:50},
 {id:'P12',plate:'P12-electronics-waste',start:50,end:51.25},
 {id:'P11',plate:'P11-waste',start:51.25,end:52.5},
 {id:'G11',start:52.5,end:55,title:'go',titleAt:53.2},
 // REVELATION: real product only
 {id:'P02',plate:'P02-globe-copper',start:55,end:56.5,in:5},
 {id:'P06',plate:'P06-extraction-sites',start:56.5,end:58},
 {id:'P09',plate:'P09-ports',start:58,end:59.5},
 {id:'P05',plate:'P05-journey',start:59.5,end:61,note:'make & use stage'},
 {id:'P13',plate:'P13-provenance',start:61,end:62.5},
 {id:'P10',plate:'P10-local-search',start:62.5,end:64.5,in:6.6},
 {id:'P14',plate:'P14-mcp',start:64.5,end:65},
 // THE LIVING PLANET
 {id:'G12',start:65,end:72},
 // END
 {id:'END',start:72,end:80},
];
