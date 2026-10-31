import {existsSync} from 'node:fs';
// Raw acquired source files are gitignored and omitted from the public mirror (README "Run locally").
// Checks keep their public-data assertions running and skip only the raw-hash block, loudly.
// Set REQUIRE_RAW=1 where the research archive is present to make a missing raw file fail.
export function rawAvailable(file:URL,label:string){
 if(existsSync(file))return true;
 if(process.env.REQUIRE_RAW==='1')throw Error(`${label}: REQUIRE_RAW=1 but ${file.pathname} is absent`);
 console.log(`SKIP: ${label} raw-source hashes (raw files are not in the public mirror; set REQUIRE_RAW=1 to require them).`);
 return false;
}
