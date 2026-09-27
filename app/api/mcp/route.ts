import {assetReader} from '@/packages/material-world/assets';
import {handleMcpRequest,describeMcp,rejectMcpSession,preflightMcp} from '@/packages/material-world/mcp';

// Keep the public data protocol under /api, alongside the working JSON API.
// Some production frontends reserve top-level /mcp before the Site Worker.
export function POST(request:Request){return handleMcpRequest(request,assetReader(request))}
export const GET=describeMcp;
export const DELETE=rejectMcpSession;
export const OPTIONS=preflightMcp;
