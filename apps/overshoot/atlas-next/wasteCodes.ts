// Short classification labels, not reporter-supplied descriptions.
// Basel Convention Annexes I, II and VIII; retained source PDF and page
// references in packages/overshoot-data/release10/README.md.
export const wasteCodeLabels:Record<string,string>={
 A1020:'Waste containing specified metals, excluding massive metal waste',
 A1030:'Waste containing arsenic, mercury or thallium',
 A1050:'Sludge from galvanic processes',
 A1060:'Spent metal-pickling liquids',
 A1090:'Ash from burning insulated copper wire',
 A1100:'Copper-smelter gas-cleaning dust and residues',
 A1110:'Spent copper electrorefining or electrowinning electrolyte',
 A1130:'Copper-bearing spent etching solutions',
 A1160:'Discarded lead-acid batteries',
 A1170:'Unsorted or hazardous battery waste',
 A1180:'Hazardous electrical or electronic assemblies and scrap (historical code)',
 A2010:'Cathode-ray-tube and other activated glass waste',
 A2030:'Spent catalysts outside list B',
 A2050:'Discarded asbestos dust or fibres',
 A3020:'Mineral oils no longer fit for their original use',
 A4060:'Waste oil–water or hydrocarbon–water mixtures',
 A4090:'Spent acid or base solutions outside list B',
 A4100:'Industrial gas-cleaning residues outside list B',
 Y20:'Beryllium or its compounds',Y21:'Hexavalent chromium compounds',
 Y22:'Compounds of copper',Y23:'Compounds of zinc',
 Y24:'Arsenic or its compounds',Y25:'Selenium or its compounds',
 Y26:'Cadmium or its compounds',Y27:'Antimony or its compounds',
 Y28:'Tellurium or its compounds',Y29:'Mercury or its compounds',
 Y30:'Thallium or its compounds',Y31:'Lead or its compounds',
 Y34:'Acids or acidic solutions',Y35:'Bases or basic solutions',
 Y36:'Asbestos dust or fibres',Y46:'Collected household waste',
 Y47:'Household-waste incineration residues'
};
export function classificationLabels(value:string|null){return [...new Set(value?.match(/\b(?:[AB]\d{4}|Y\d{1,2})\b/g)||[])].flatMap(code=>wasteCodeLabels[code]?[{code,label:wasteCodeLabels[code]}]:[])}
export function wasteTitle(row:{waste_description:string|null;basel_code:string|null;y_code:string|null}){
 return row.waste_description?.trim()||classificationLabels(row.basel_code).map(v=>v.label).join('; ')||(row.basel_code?'Waste coded '+row.basel_code:'Waste type not described');
}
