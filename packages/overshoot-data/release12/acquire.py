"""Acquire the dated World Bank What a Waste 3.0 country and city workbooks."""
import concurrent.futures, hashlib, json, pathlib, urllib.request
from datetime import datetime, timezone
root=pathlib.Path(__file__).parent
urls={
 'waw3-countries.xlsx':'https://datacatalogfiles.worldbank.org/ddh-published/0039597/DR0095901/What_a_Waste_3.0_COUNTRY_Dataset_%26_Codebook.xlsx',
 'waw3-cities.xlsx':'https://datacatalogfiles.worldbank.org/ddh-published/0039597/DR0095900/What_a_Waste_3.0_CITY_Dataset_%26_Codebook.xlsx',
}
def fetch(item):
 name,url=item
 with urllib.request.urlopen(url,timeout=60) as response: data=response.read()
 assert data[:2]==b'PK', 'Expected an Excel workbook'
 (root/'raw'/name).write_bytes(data)
 return {'file':name,'url':url,'retrievedAt':datetime.now(timezone.utc).isoformat(),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: records=list(pool.map(fetch,urls.items()))
(root/'manifest.json').write_text(json.dumps({'publisher':'World Bank','dataset':'What a Waste 3.0','catalog':'https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database','license':'CC BY 4.0','files':records},indent=2)+'\n')
print(json.dumps(records,indent=2))
