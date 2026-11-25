import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, catalog, keys } from '../scripts/beta-content.mjs';
import { outputs } from '../scripts/generate-beta.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));
test('all localized pages are complete and reproducible',()=>{
  assert.equal(config.locales.length, 8);
  for(const [path,expected] of Object.entries(outputs())){
    const actual=readFileSync(join(root,path),'utf8');
    assert.equal(actual,expected,path);
    assert.ok(actual.includes('https://groups.google.com/g/alpha-android-testers'));
    assert.ok(actual.includes('https://play.google.com/apps/testing/'+config.pkg));
    assert.ok(actual.includes('https://play.google.com/store/apps/details?id='+config.pkg));
    assert.ok(actual.includes('mailto:'+config.email));
    assert.ok(actual.includes('id="main-content"'));
    assert.doesNotMatch(actual,/<form\b|<input[^>]*type="email"/i);
    assert.doesNotMatch(actual,/Invisible Ink|com\.tendonlife\.invisibleink|blinddraw\.ink/i);
  }
  for(const locale of config.locales){
    assert.equal(catalog[locale].length,keys.length);
    assert.ok(catalog[locale].every(s=>typeof s==='string' && s.trim()));
    const html=readFileSync(join(root,config.prefix,locale,'index.html'),'utf8');
    assert.ok(html.includes('lang="'+locale+'" dir="'+(locale==='ar'?'rtl':'ltr')+'"'));
    assert.ok(html.includes('data-auto-locale="false"'));
    for(const l of config.locales) assert.ok(html.includes('href="/beta/'+l+'/"'));
  }
});
test('all local artwork and assets exist; homepage links to beta',()=>{
  const publicRoot = root;
  for(const path of [config.icon,config.art,'/beta/beta.css','/beta/locale.js']){
    assert.ok(existsSync(join(publicRoot,path)),path);
  }
  const homepage = readFileSync(join(root,'index.html'),'utf8');
  assert.ok(homepage.includes('beta/'));
});
