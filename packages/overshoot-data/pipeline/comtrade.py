"""Strict UN Comtrade adapter. No synthetic bilateral snapshot is bundled.
Supply acquired JSON to normalize_response and keep its file/hash as lineage.
"""
from typing import TypedDict
class Flow(TypedDict):
    origin:str
    destination:str
    commodity:str
    year:int
    tonnes:float
    original_value:float
    original_unit:str
    hs_revision:str
    reporter:str
    reported_flow:str
    source_id:str

def normalize_response(payload:dict)->list[Flow]:
    result=[]
    for r in payload.get('data',[]):
        weight=r.get('netWgt')
        if weight is None or r.get('isNetWgtEstimated') is True:continue
        if not isinstance(weight,(float,int)) or weight<0:raise ValueError('Invalid reported net weight')
        flow=r.get('flowCode')
        if flow not in ('M','X'):continue
        reporter,partner=r.get('reporterISO'),r.get('partnerISO')
        if not reporter or not partner or partner in ('W00','WLD','WORLD'):continue
        # Imports point partner -> reporter; exports reporter -> partner.
        origin,destination=(partner,reporter) if flow=='M' else (reporter,partner)
        result.append(Flow(origin=origin,destination=destination,commodity=str(r['cmdCode']),year=int(r['refYear']),tonnes=float(weight)/1000,original_value=float(weight),original_unit='kg',hs_revision=str(r['classificationCode']),reporter=reporter,reported_flow=flow,source_id='comtrade'))
    return result
