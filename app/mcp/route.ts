import {assetReader} from '@/packages/material-world/assets';
import {handleMcpRequest,describeMcp,rejectMcpSession,preflightMcp} from '@/packages/material-world/mcp';
export function POST(request:Request){return handleMcpRequest(request,assetReader(request))}
export const GET=describeMcp;
export const DELETE=rejectMcpSession;
export const OPTIONS=preflightMcp;
