import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { config } from '../scripts/beta-content.mjs';
const source=readFileSync(new URL('../'+config.prefix+'/locale.js',import.meta.url),'utf8');
function harness({language='en', auto=false, saved={}, blocked=false, hash='', shareFails=false, clipboardFails=false}={}){
  const events={};const windowEvents={};const state=new Map(Object.entries(saved));const redirects=[];const shared=[];const copied=[];
  const node=(dataset={})=>({dataset,hidden:true,textContent:'',checked:false,disabled:false,value:0,href:config.domain+'/beta/en/',listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},closest(name){return name==='label'?{hidden:true}:{classList:{toggle(){}}};}});
  const links=config.locales.map(l=>({...node(),hreflang:l,href:config.domain+'/beta/'+l+'/'}));
  const checks=['group','test','install'].map(step=>node({step}));
  const panel=node(),count=node(),meter=node(),reset=node(),copy=node({copied:'copied',failure:'manual'}),share=node(),url=node(),status=node();
  const selectors={'[data-checklist]':panel,'[data-count]':count,'[data-progress]':meter,'[data-reset]':reset,'[data-copy]':copy,'[data-native-share]':share,'[data-share]':url,'[data-status]':status};
  const document={title:config.name,documentElement:{dataset:{autoLocale:String(auto)},lang:'en'},body:{dataset:{betaApp:config.pkg}},querySelectorAll(s){return s==='a[data-locale]'?links:checks;},querySelector(s){return selectors[s];}};
  const storage={getItem(k){if(blocked)throw Error('blocked');return state.get(k)??null;},setItem(k,v){if(blocked)throw Error('blocked');state.set(k,v);}};
  vm.runInNewContext(source,{document,navigator:{languages:[language],language,clipboard:{writeText:async v=>{if(clipboardFails)throw Error('blocked');copied.push(v);}},share:async v=>{if(shareFails)throw Error('blocked');shared.push(v);}},localStorage:storage,location:{hash,replace:u=>redirects.push(u)},window:{addEventListener:(n,f)=>windowEvents[n]=f},URL,Intl,Map,Set});
  return {checks,panel,count,meter,reset,copy,share,url,status,links,state,redirects,shared,copied,windowEvents};
}
const progressKey='beta.progress.v1:'+config.pkg;
const languageKey='beta.language.v1:'+config.pkg;
test('checklist is opt-in, persists only explicitly checked steps, restores, and resets',()=>{
  const a=harness();assert.equal(a.count.textContent,'0 / 3');assert.equal(a.state.size,0);
  a.checks[0].checked=true;a.checks[0].listeners.change();
  a.checks[1].checked=true;a.checks[1].listeners.change();
  assert.equal(a.meter.value,2);assert.equal(a.state.get(progressKey),'["group","test"]');
  const b=harness({saved:Object.fromEntries(a.state)});
  assert.equal(b.checks[0].checked,true);assert.equal(b.checks[1].checked,true);assert.equal(b.checks[2].checked,false);
  b.reset.listeners.click();assert.equal(b.meter.value,0);assert.equal(b.state.get(progressKey),'[]');
});
test('bad or unavailable storage does not break the enrollment page',()=>{
  for(const a of [harness({saved:{[progressKey]:'{"wrong":true}'}}),harness({blocked:true})]){
    assert.equal(a.meter.value,0);a.checks[2].checked=true;a.checks[2].listeners.change();assert.equal(a.meter.value,1);
  }
});
test('locale preference is explicit, root detection preserves enrollment anchor, localized route is stable',()=>{
  const a=harness({auto:true,language:'de-DE',hash:'#enroll'});
  assert.deepEqual(a.redirects,[config.domain+'/beta/de/#enroll']);
  const b=harness({auto:true,language:'de-DE',saved:{[languageKey]:'en'}});
  assert.equal(b.redirects.length,0);
  const c=harness({language:'de-DE',hash:'#enroll'});
  const link=c.links.find(l=>l.hreflang==='ar');link.listeners.click();
  assert.equal(c.state.get(languageKey),'ar');assert.equal(link.href,config.domain+'/beta/ar/#enroll');assert.equal(c.redirects.length,0);
  assert.deepEqual(harness({auto:true,language:'zh-TW'}).redirects,config.locales.includes('zh-Hant')?[config.domain+'/beta/zh-Hant/']:[]);
});
test('copy and native share are user-triggered and use the public localized invitation',async()=>{
  const a=harness();assert.equal(a.copied.length,0);assert.equal(a.shared.length,0);
  await a.copy.listeners.click();assert.deepEqual(a.copied,[a.url.href]);assert.equal(a.status.textContent,'copied');
  await a.share.listeners.click();assert.equal(a.shared[0].url,a.url.href);
  const b=harness({shareFails:true,clipboardFails:true});await b.copy.listeners.click();assert.equal(b.status.textContent,'manual');
  await b.share.listeners.click();assert.equal(b.status.textContent,'manual');
});
test('returning from another tab refreshes explicitly saved progress',()=>{
  const a=harness();a.state.set(progressKey,'["group","test","bogus","test"]');a.windowEvents.pageshow({persisted:true});assert.equal(a.meter.value,2);
});
