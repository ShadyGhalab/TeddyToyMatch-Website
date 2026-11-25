import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, keys, config } from './beta-content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const e = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const group = 'https://groups.google.com/g/alpha-android-testers';
const opt = 'https://play.google.com/apps/testing/' + config.pkg;
const store = 'https://play.google.com/store/apps/details?id=' + config.pkg;
const route = locale => '/beta/' + (locale ? locale + '/' : '');
const absolute = locale => config.domain + route(locale);
function render(locale, auto) {
  const row = catalog[locale];
  if (!row || row.length !== keys.length || row.some(s => !s.trim())) throw Error('Incomplete locale: ' + locale);
  const t = Object.fromEntries(keys.map((key,i)=>[key,e(row[i])]));
  const pageUrl = absolute(auto ? '' : locale);
  const title = e(config.name) + ' — ' + t.beta;
  const description = t.gameDescription;
  const links = config.locales.map(l=>'<a data-locale hreflang="'+e(l)+'" lang="'+e(l)+'" href="'+route(l)+'"'+(l===locale?' aria-current="page"':'')+'>'+e(catalog[l][0])+'</a>');
  const alternate = config.locales.map(l=>'<link rel="alternate" hreflang="'+e(l)+'" href="'+absolute(l)+'">').join('\n');
  return `<!doctype html>
<html lang="${e(locale)}" dir="${locale==='ar'?'rtl':'ltr'}" data-auto-locale="${auto}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="${config.kind==='ink'?'#100c1e':'#1b1026'}"><meta name="referrer" content="no-referrer">
<title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${pageUrl}">
${alternate}
<link rel="alternate" hreflang="x-default" href="${absolute('')}">
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${pageUrl}"><meta property="og:image" content="${config.domain+config.art}">
<link rel="icon" href="${config.icon}"><link rel="stylesheet" href="/beta/beta.css"><script src="/beta/locale.js" defer></script>
</head>
<body class="${config.kind}">
<a class="skip" href="#main-content">${t.skip}</a>
<header><div class="shell header"><a class="brand" href="/"><img src="${config.icon}" alt="" width="44" height="44"><span>${e(config.name)}<small>${t.beta}</small></span></a><div class="head-actions"><a href="/">${t.home}</a><details class="language"><summary>${t.language}: ${t.native}</summary><ul>${links.map(a=>'<li>'+a+'</li>').join('')}</ul></details></div></div></header>
<main class="shell" id="main-content">
<section class="hero" aria-labelledby="hero-title"><div><p class="eyebrow">${t.beta}</p><h1 id="hero-title">${t.headline}<span>${t.subhead}</span></h1><p class="lead">${description}</p><p>${t.intro}</p><div class="hero-actions"><a class="action primary" href="${group}">${t.join}</a><a class="member" href="#enroll">${t.already}</a></div><p class="note">${t.same}</p></div><div class="art"><img src="${config.art}" alt="" width="640" height="640"></div></section>
<section id="enroll" aria-labelledby="steps-title"><h2 id="steps-title">${t.steps}</h2><ol class="steps"><li><span class="number" aria-hidden="true">01</span><h3>${t.step1}</h3><p>${t.detail1}</p><a class="action" href="${group}">${t.join}</a></li><li><span class="number" aria-hidden="true">02</span><h3>${t.step2}</h3><p>${t.detail2}</p><a class="action primary" href="${opt}">${t.step2}</a></li><li><span class="number" aria-hidden="true">03</span><h3>${t.step3}</h3><p>${t.detail3}</p><a class="action" href="${store}">${t.step3}</a></li></ol></section>
<section class="commit" aria-labelledby="commit-title"><span class="calendar" aria-hidden="true">14</span><div><h2 id="commit-title">${t.days}</h2><p>${t.commit}</p><a class="feedback" href="mailto:${config.email}">${t.feedback}</a></div></section>
<section class="faq" aria-labelledby="faq-title"><h2 id="faq-title">${t.help}</h2><details><summary>${t.q1}</summary><p>${t.a1}</p></details><details><summary>${t.q2}</summary><p>${t.a2}</p></details><details><summary>${t.q3}</summary><p>${t.a3} <a class="feedback" href="mailto:${config.email}">${t.feedback}</a></p></details></section>
<section class="share" aria-labelledby="share-title"><h2 id="share-title">${t.share}</h2><div class="share-actions"><a data-share href="${pageUrl}" dir="ltr">${pageUrl}</a><button class="action" type="button" data-copy data-copied="${t.copied}" data-failure="${t.copyFail}" hidden>${t.copy}</button><span data-status class="copy-status" role="status" aria-live="polite"></span></div></section>
</main><footer><div class="shell footer"><a href="${config.privacy}">${t.privacy}</a><a href="${group}">${t.community}</a><span>ShadyGhalabs</span></div></footer>
</body></html>
`;
}
export function outputs() {
  const result = {[config.prefix+'/index.html']:render('en',true)};
  for(const locale of config.locales) result[config.prefix+'/'+locale+'/index.html']=render(locale,false);
  return result;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check=process.argv.includes('--check');
  for(const [path,content] of Object.entries(outputs())){
    const file=join(root,path);
    if(check){if(readFileSync(file,'utf8')!==content)throw Error('Stale beta page: '+path);}
    else{mkdirSync(join(file,'..'),{recursive:true});writeFileSync(file,content);}
  }
  console.log((check?'Verified ':'Generated ')+(config.locales.length+1)+' beta pages');
}
