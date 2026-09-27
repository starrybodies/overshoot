"""Publish small attributed facts from reviewed primary-source research. No route inference."""
import json
from pathlib import Path
root=Path(__file__).parent
raw=json.loads((root/'research/journey-records.json').read_text())
meta={
'saltDepot':('Salt Spring Recycling Depot','Salt Spring Community Services','Local collection entry; Salt Spring Island',None),
'saltMaterials':('Accepted depot materials','Salt Spring Community Services','Local acceptance guidance; not shipment destinations',None),
'rbcReport2025':('Recycle BC Annual Report 2025','Recycle BC','Province-wide program; 2025 end markets and management quantities',2025),
'rbcReport2024':('Recycle BC Annual Report 2024','Recycle BC','Province-wide program; 2024 end markets',2024),
'rbcPost':('What happens after collection','Recycle BC','BC packaging and paper process; program network, not individual shipments',None),
'rbcTransition':('Post-collection transition and infrastructure investments','Recycle BC','April 2026 announcement: transition from June 2026; future facilities are plans',2026),
'rbcPlastic':('Plastic recycling','Recycle BC','BC packaging plastics process and program end markets',None),
'rbcPaper':('Paper','Recycle BC','Program acceptance and possible uses of recovered paper',None),
'rbcContainers':('Containers','Recycle BC','Program container processing and possible material uses',None),
'rbcGlass':('Glass','Recycle BC','Non-deposit packaging glass; not all beverage-container programs',None),
'organics':('Organics','Capital Regional District','CRD organics guidance; no Salt Spring composter assignment',None),
'hartland':('Hartland landfill','Capital Regional District','Named regional disposal facility; does not identify each hauler’s route',None),
'hartlandProcess':('How landfills work at Hartland','Capital Regional District','Hartland gas and leachate controls; current operator guidance',None),
'hartlandDepot':('Hartland public drop-off depot','Capital Regional District','Accepted items and documented destinations, including non-packaging rigid plastics',None),
'epraFAQ':('Electronics recycling FAQs','EPRA / Recycle My Electronics','General electronics dismantling and downstream material processing',None),
'epra2025':('EPRA British Columbia Report to Director 2025','Electronic Products Recycling Association','Approved processors, collection network and indicative primary-processor outputs',2025)
}
sources=[]
for s in raw['sources']:
 title,publisher,coverage,year=meta[s['id']]
 sources.append(dict(id=s['id'],title=title,publisher=publisher,url=s['url'],retrievedAt=s['retrieved_at'],license='No open redistribution licence established. Attributed factual paraphrases; full source not republished.',coverage=coverage,year=year,method='Source facts transcribed or paraphrased. Annual end-market tables visually checked at p.29; 2025 management table at p.47. Missing values remain missing. Program membership does not establish a shipment link.' if s['id'].startswith('rbcReport') else 'Qualitative published guidance or operator reporting; no household-level or missing downstream route inferred.',sha256=s['sha256']))
pack=['plastic','paper','glass','metal']
config={
 'ssi-packaging-collection':(pack,'collection','salt-spring','Salt Spring Recycling Depot · 349 Rainbow Road','public-guidance'),
 'rbc-sorting-network':(pack,'sorting','bc','2025 Recycle BC network · GFL Richmond / Urban Impact New Westminster','program-report'),
 'rbc-network-2026':(pack,'sorting','bc','2026 Recycle BC post-collection network','program-report'),
 'packaging-plastics':(['plastic'],'processing','bc','Recycle BC · Merlin Plastics','program-report'),
 'packaging-paper':(['paper'],'processing','bc','Recycle BC · receiving paper mills not individually identified','program-report'),
 'packaging-metal':(['metal'],'processing','bc','Recycle BC · metal end markets','program-report'),
 'packaging-glass':(['glass'],'processing','bc','Recycle BC · glass cleaning and BC end markets','program-report'),
 'crd-organics':(['food'],'processing','bc','Capital Regional District · organics program','public-guidance'),
 'hartland-residual':(['garbage'],'processing','bc','Hartland landfill · Capital Regional District','operator-report'),
 'hartland-gas':(['garbage'],'after','bc','Hartland landfill → Waga Energy upgrading → FortisBC gas network','operator-report'),
 'hartland-leachate':(['garbage'],'after','bc','Hartland landfill → collection lagoons → sanitary sewer','operator-report'),
 'ssi-electronics-entry':(['electronics'],'collection','salt-spring','Salt Spring Recycling Depot · 349 Rainbow Road','program-report'),
 'electronics-processing':(['electronics'],'processing','bc','EPRA BC · eCycle Chilliwack / FCM Delta / HiTech Edmonton','program-report'),
 'hartland-bulky-plastic':(['rigid-plastic'],'after','bc','Hartland public drop-off depot → landfill cover','operator-report'),
 'rbc-residue':(pack,'after','bc','Recycle BC · all program materials combined','program-report')
}
evidence=[]
for r in raw['records']:
 mats,stage,place,entity,kind=config[r['id']]
 e=dict(id=r['id'],materials=mats,stage=stage,place=place,title=r['title'],plain=r['child_text'],technical=r['paraphrase'],source_ids=r['source_refs'],year=r['data_year'],entity=entity,kind=kind,gap=' '.join(r['downstream_gaps']),source_locators=r.get('source_locators',[]))
 # Do not turn output estimates, forecasts, or non-comparable quantities into observed household rates.
 if r['id']=='rbc-residue':
  e['plain']='Some sorting leftovers are sent for disposal. This total covers the whole provincial packaging and paper program, not one material or your bin.'
  e['quantity']=dict(value=11816,unit='tonnes',label='2025 disposal · all Recycle BC program materials combined')
  e['technical']='Recycle BC reports 206,756 tonnes managed by recycling and 11,816 tonnes by disposal in 2025. Shipment timing and scope prevent treating these as a household recycling rate. No disposal-facility assignment was obtained.'
 if r['id']=='hartland-gas':
  e['technical']='The operator describes collection wells, gas upgrading by Waga Energy and delivery to the FortisBC network. The published annual energy figure is a forecast, not an acquired measurement, so it is not plotted here.'
 if r['id']=='electronics-processing':
  e['technical']+=' Primary-processor outputs are reported as indicative; further processing is not proof of final recycling. The report flags a mass-balance variance for review.'
 e['supportedStages']={
  'packaging-glass':['sorting','processing'],
  'crd-organics':['collection','processing','after'],
  'hartland-residual':['collection','processing'],
  'hartland-bulky-plastic':['collection','processing','after']
 }.get(r['id'],[stage])
 e['plainGap']={
  'ssi-packaging-collection':'We know the depot accepts these items. We do not have the record naming the next facility for a particular load.',
  'rbc-sorting-network':'This lists the network. It does not tell us which factory handled your household’s material.',
  'rbc-network-2026':'This is a dated network announcement. It does not track an individual load or prove a planned factory is open.',
  'packaging-plastics':'We cannot trace your item to a particular new product.',
  'packaging-paper':'We do not know the exact mill or new product for a particular household’s paper.',
  'packaging-metal':'We do not have the mill and final product for each shipment.',
  'packaging-glass':'The report gives a region, but not the final glass factory for each load.',
  'crd-organics':'We do not have a record naming the composter that took a particular Salt Spring load.',
  'hartland-residual':'Hartland receives waste. That does not tell us where every garbage truck from Salt Spring goes.',
  'hartland-gas':'Some gas is collected. We do not have a measured capture rate or a link to your bin.',
  'hartland-leachate':'The record reaches the sewer. We have not verified the next treatment plant in this chain.',
  'ssi-electronics-entry':'The depot is documented. We do not know which approved recycler received a particular device.',
  'electronics-processing':'These are approved processors, not a tracked route for your device. Further processing is not the same as a finished recycled product.',
  'hartland-bulky-plastic':'This is Hartland’s stated use. It does not prove that your item went there.',
  'rbc-residue':'The total does not name the disposal facility or tell us what happened to your bin.'
 }[r['id']]
 evidence.append(e)
for mat,label in [('plastic','Plastics'),('paper','Paper'),('metal','Metal'),('glass','Glass')]:
 a=raw['annual_2025_end_markets']['by_material'][label];b=raw['annual_2024_end_markets']['by_material'][label]
 destinations=[dict(label={'BC':'British Columbia','Canada':'Elsewhere in Canada','USA':'United States','Export':'Other export markets'}[k],percent=None if a[k]=='-' else a[k],previousPercent=None if b[k]=='-' else b[k]) for k in a]
 evidence.append(dict(id='end-markets-'+mat,materials=[mat],stage='after',place='bc',title='Where the program reported end markets',plain='These are the reported locations of buyers or processors for the program’s recovered material. They do not tell us where a particular household’s items went.',technical='Material-specific end-market geography, Recycle BC annual reports p.29. The original “Canada” column is separate from “BC”; “Export” is separate from “USA”. A dash remains unavailable, not zero. These are not capture rates or final product yields.',source_ids=['rbcReport2025','rbcReport2024'],year=2025,entity='Recycle BC · province-wide program',kind='program-report',gap='No shipment linkage to Salt Spring Island, named final buyer for every flow, or product-level final fate is established.',plainGap='These destinations describe the whole BC program. They do not trace a Salt Spring load or your item.',destinations=destinations,comparisonYear=2024))
(root/'local-evidence.json').write_text(json.dumps(dict(sources=sources,evidence=evidence),ensure_ascii=False,indent=2)+'\n')
print(f'Published {len(evidence)} evidence records and {len(sources)} local primary sources')
