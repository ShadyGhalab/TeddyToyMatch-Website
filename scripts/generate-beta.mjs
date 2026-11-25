import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, keys, config } from './beta-content.mjs';
import { invitationLabels } from './beta-invitation.mjs';
import { funnelLabels, art, renderPage } from './beta-funnel.mjs';

import { communityLabels, communityActivities, enhanceCommunity } from './beta-community.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export function outputs() {
  const render = (locale,auto) => enhanceCommunity(renderPage(config,catalog,keys,invitationLabels,funnelLabels,art,locale,auto),config,catalog,keys,locale,communityLabels,communityActivities);
  const result = {[config.prefix+'/index.html']:render('en',true)};
  for(const locale of config.locales) result[config.prefix+'/'+locale+'/index.html']=render(locale,false);
  return result;
}
if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]){
  const check=process.argv.includes('--check');
  for(const [path,content] of Object.entries(outputs())){
    const file=join(root,path);
    if(check){if(readFileSync(file,'utf8')!==content)throw Error('Stale beta page: '+path);}
    else{mkdirSync(dirname(file),{recursive:true});writeFileSync(file,content);}
  }
  console.log((check?'Verified ':'Generated ')+(config.locales.length+1)+' beta pages');
}
