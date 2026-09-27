"""Retain public GEM country summary tables without turning capacity into production.

Run from any directory: python packages/overshoot-data/release35/import_gem.py
The four downloaded CSVs and their hashes are retained under raw/.
"""
from pathlib import Path
import csv, hashlib, json

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
OUT=ROOT/'public/data/v35'
OUT.mkdir(parents=True,exist_ok=True)
DIRECTORY={c['name'].casefold():c['id'] for c in json.loads((ROOT/'public/data/v11/countries.json').read_text())}
ALIASES={'Brunei':'BRN',"Côte d'Ivoire":'CIV','Eswatini':'SWZ','Fiji':'FJI','Macao':'MAC','Republic of the Congo':'COG','Réunion':'REU','Russia':'RUS','Türkiye':'TUR','United States':'USA','Vietnam':'VNM'}
SHEETS={
 'cement-capacity':'https://docs.google.com/spreadsheets/d/1nWBp_7eGuUO8S1Xs1tkyJlxSScVGyDImMdrYFvNRd7A/edit',
 'cement-plants':'https://docs.google.com/spreadsheets/d/1WXRhfTZ40QpiKIxEKP0btssOAETfU1udl3X79o2A0C8/edit',
 'steel-capacity':'https://docs.google.com/spreadsheets/d/1mOWPPmjCQtoAWUCY0pAChgWskobG0odjdNUHV041_a8/edit',
 'steel-plants':'https://docs.google.com/spreadsheets/d/19yYYZNKoL_N9Nioi7v6HHQpUoAHYq7Jd7krDuTE_lOk/edit',
}
FILES={'cement-capacity':'operating-capacity.csv','cement-plants':'operating-plants.csv','steel-capacity':'steel-operating-capacity.csv','steel-plants':'steel-operating-plants.csv'}

def source(name):
    data=(BASE/'raw'/FILES[name]).read_bytes()
    rows=list(csv.reader(data.decode('utf-8-sig').splitlines()))
    start=next(i+1 for i,r in enumerate(rows) if r and r[0] in ('Country','Country/Area'))
    result={}
    for r in rows[start:]:
        try:float(r[1].replace(',',''))
        except (ValueError,IndexError):break
        if r[0] in result:raise ValueError('duplicate country '+r[0])
        result[r[0]]=r
    return result,{'url':SHEETS[name],'sha256':hashlib.sha256(data).hexdigest(),'rows':len(result)}

def code(name):
    if name=='World':return 'WORLD'
    result=ALIASES.get(name) or DIRECTORY.get(name.casefold())
    if not result:raise ValueError('Country not mapped: '+name)
    return result

def amount(value):return float(value.replace(',',''))

cc,cm=source('cement-capacity');cp,pm=source('cement-plants')
assert cc.keys()==cp.keys() and len(cc)==172
cement=[]
for name,r in cc.items():
    p=cp[name]
    cement.append(dict(country=code(name),sourceCountry=name,cementMtpa=amount(r[1]),clinkerMtpa=amount(r[2]),plants=int(p[1]),integrated=int(p[2]),grinding=int(p[3]),clinkerOnly=int(p[4]),unknownType=int(p[5])))
assert len({r['country'] for r in cement})==172
assert next(r for r in cement if r['country']=='WORLD')['plants']==3455

sc,sm=source('steel-capacity');sp,spm=source('steel-plants')
assert len(sc)==80 and len(sp)==85 and set(sc).issubset(sp)
steel=[]
for name,p in sp.items():
    r=sc.get(name)
    # Source is thousand tonnes/year. Divide by 1000 to display million tonnes/year.
    steel.append(dict(country=code(name),sourceCountry=name,capacityMtpa=amount(r[1])/1000 if r else None,bofMtpa=amount(r[2])/1000 if r else None,eafMtpa=amount(r[3])/1000 if r else None,otherMtpa=(amount(r[4])+amount(r[5]))/1000 if r else None,plants=int(p[1])))
assert len({r['country'] for r in steel})==85
assert next(r for r in steel if r['country']=='WORLD')['plants']==970

meta={'reviewedAt':'2026-09-25','publisher':'Global Energy Monitor','license':'CC BY 4.0','licenseUrl':'https://globalenergymonitor.org/creative-commons-license','sourceTables':dict([('cementCapacity',cm),('cementPlants',pm),('steelCapacity',sm),('steelPlants',spm)])}
artifacts=[
 ('cement-country.json',{**meta,'material':'concrete','edition':'Global Cement and Concrete Tracker, July 2026','source':'https://globalenergymonitor.org/projects/global-cement-concrete-tracker','unit':'million metric tonnes per year','scope':'Operating and operating pre-retirement plants only. Country totals are rated cement and clinker production capacities; they are not actual output or shipments. GEM country aggregates do not locate the individual plants on this map.','world':next(r for r in cement if r['country']=='WORLD'),'rows':[r for r in cement if r['country']!='WORLD']}),
 ('steel-country.json',{**meta,'material':'steel','edition':'Global Iron and Steel Tracker, June 2026 (V1)','source':'https://globalenergymonitor.org/projects/global-iron-steel-tracker','unit':'million metric tonnes per year','scope':'Operating crude steelmaking capacity at tracked plants, generally 500,000 tonnes/year or larger. Capacity is not actual output, trade or a traced supplier link. Five countries have plant counts but no numeric steel-capacity row in the public summary. BOF, EAF and other are production-method capacities; EAF input can include scrap, iron or both.','world':next(r for r in steel if r['country']=='WORLD'),'rows':[r for r in steel if r['country']!='WORLD']}),
]
for name,data in artifacts:
    (OUT/name).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
    print(name,len(data['rows']),'countries/areas',data['world'])
