from acquire import fetch,ROOT
import concurrent.futures,json
SERIES=['EN_EWT_GENV','EN_EWT_GENPCAP','EN_EWT_RCYV','EN_EWT_RCYR','EN_MWT_GENV','EN_MWT_RCYR','EN_MWT_RCYV','EN_HAZ_GENV','EN_HAZ_TREATV','AG_FOOD_WST','AG_FOOD_WST_PC','AG_FLS_PCT']
if __name__=='__main__':
 pairs=[(f'sdg-{s}.json',f'https://unstats.un.org/SDGAPI/v1/sdg/Series/Data?seriesCode={s}&pageSize=50000') for s in SERIES]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:r=list(ex.map(fetch,pairs))
 (ROOT/'snapshots-sdg.json').write_text(json.dumps(r,indent=2))
