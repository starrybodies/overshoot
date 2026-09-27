import {assetReader} from '@/packages/material-world/assets';
import {querySchemas,runQuery,type QueryName} from '@/packages/material-world/query';

export async function GET(request:Request){
  const url=new URL(request.url),name=(url.searchParams.get('query')||'coverage') as QueryName;
  if(!Object.hasOwn(querySchemas,name))return Response.json({error:'Unknown query',available:Object.keys(querySchemas)},{status:400});
  try{
    const input=JSON.parse(url.searchParams.get('input')||'{}');
    const result=await runQuery(name,input,assetReader(request));
    return Response.json(result,{headers:{'Cache-Control':name==='local_context'?'no-store':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
  }catch(error){return Response.json({error:error instanceof Error?error.message:'Query failed'},{status:400})}
}
