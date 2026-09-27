"""Transcribe the 2025 estimate columns in USGS MCS 2026 tables.

Values below are in the printed table units. The published artifact converts to
metric tonnes; it does not interpolate, allocate 'other countries', or infer links.
Compare every country and world row with the cited PDF before editing this table.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/data/v39/usgs-minerals-2025.json'
PDF='https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-{}.pdf'
SOURCES={
 'copper':('copper','c4971f7edfa38feefc51952c5f24889c46f468d936c6620d388233313ae8ae85'),
 'aluminium':('aluminum','2995b3e9e412eed53a9b565743dd8696a7fc0ae10e7f2d95266511a10b1fee30'),
 'lithium':('lithium','53f92ea45c367c36f05919151f7784feda5776095afaf3a25aec795a27be106f'),
 'steel':('iron-steel','99875e4897c8f39150fdd46961277be6806b22bef9e8facef78296c0e005657e'),
}
# Country names have been matched to the atlas ISO-3 register. Other countries
# and withheld US lithium output are excluded from the country observations.
TABLES={
 'copper-mine':('copper','Mine production · copper content',1000,23_000_000,{'USA':1000,'AUS':730,'CAN':500,'CHL':5300,'CHN':1800,'COD':3200,'IND':23,'IDN':710,'KAZ':710,'MEX':690,'PER':2700,'POL':410,'RUS':1300,'ZMB':940}),
 'copper-refinery':('copper','Refinery production · copper content',1000,29_000_000,{'USA':850,'AUS':460,'CAN':320,'CHL':1700,'CHN':14000,'COD':2800,'DEU':610,'IND':620,'IDN':400,'JPN':1400,'KAZ':500,'KOR':610,'MEX':480,'PER':340,'POL':560,'RUS':950,'ZMB':270}),
 'aluminium-smelter':('aluminium','Primary aluminium smelter production',1000,74_000_000,{'USA':660,'AUS':1500,'BHR':1600,'BRA':1200,'CAN':3300,'CHN':45000,'ISL':750,'IND':4200,'MYS':1100,'NOR':1300,'RUS':3900,'ARE':2700}),
 'lithium-mine':('lithium','Mine production · lithium content',1,290_000,{'ARG':23000,'AUS':92000,'BRA':12000,'CAN':5600,'CHL':56000,'CHN':62000,'MLI':9400,'PRT':380,'ZWE':28000}),
 'steel-raw':('steel','Raw steel production',1_000_000,1_900_000_000,{'USA':82,'BRA':35,'CHN':980,'DEU':38,'IND':160,'IRN':32,'JPN':81,'KOR':60,'RUS':65,'TUR':37,'VNM':23}),
}

def main():
 countries={r['id'] for r in json.loads((ROOT/'public/data/v11/countries.json').read_text())}
 series=[]
 for id,(material,measure,factor,world,entries) in TABLES.items():
  assert set(entries)<=countries,(id,set(entries)-countries)
  assert all(isinstance(v,(float,int)) and v>=0 for v in entries.values())
  assert sum(entries.values())*factor<=world*1.03,(id,'unexpected country sum')
  slug,sha=SOURCES[material]
  series.append({'id':id,'material':material,'measure':measure,'year':2025,'basis':'USGS 2025 estimate','unit':'metric tonnes','source':PDF.format(slug),'sourcePdfSha256':sha,'worldTotal':world,'rows':[{'country':k,'value':v*factor} for k,v in entries.items()]})
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps({'edition':'USGS Mineral Commodity Summaries 2026','reviewedAt':'2026-09-27','method':'Country figures transcribed from the 2025 estimated production columns in four USGS commodity PDF tables and converted to metric tonnes. World totals are the separately rounded publisher totals; country rows exclude Other countries and withheld data. No missing values are estimated, and no supplier or transport link is inferred. Source PDFs were acquired from a public mirror of the USGS PDFs; the official PDF URLs and SHA-256 fingerprints are retained.','series':series},separators=(',',':'))+'\n')
 print('series',len(series),'numeric country observations',sum(len(s['rows']) for s in series))
if __name__=='__main__':main()
