import {assetReader} from '@/packages/material-world/assets';
import {querySchemas,runQuery,type QueryName} from '@/packages/material-world/query';

export async function GET(request:Request){
  const url=new URL(request.url),name=(url.searchParams.get('query')||'coverage') as QueryName;
  if(!Object.hasOwn(querySchemas,name))return Response.json({error:'Unknown query',available:Object.keys(querySchemas)},{status:400});
  try{
    const raw=url.searchParams.get('input')||'{}';
    if(raw.length>2048)return Response.json({error:'Input too large'},{status:413});
    const input=JSON.parse(raw);
    const result=await runQuery(name,input,assetReader(request));
    return Response.json(result,{headers:{'Cache-Control':name==='local_context'?'no-store':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
  }catch{return Response.json({error:'Invalid query input'},{status:400})}
}
