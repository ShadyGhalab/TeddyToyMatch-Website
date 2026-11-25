// Public invitation UI. Progress is self-reported, never sent to a server.
(() => {
  const page = document.documentElement;
  const app = document.body.dataset.betaApp;
  if (!app) return;
  const progressKey = 'beta.progress.v1:' + app;
  const languageKey = 'beta.language.v1:' + app;
  function read(key) { try { return localStorage.getItem(key); } catch { return undefined; } }
  function write(key,value) { try { localStorage.setItem(key,value); } catch {} }
  const links = [...document.querySelectorAll('a[data-locale]')];
  const available = new Map(links.map(a => [a.hreflang.toLowerCase(),a.href]));
  const anchors = new Set(['#enroll','#main-content','#steps-title','#commit-title','#faq-title','#share-title']);
  function withAnchor(href) {
    const destination = new URL(href);
    if (anchors.has(location.hash)) destination.hash = location.hash;
    return destination.href;
  }
  function match(tag) {
    const lower = tag.toLowerCase();
    if (available.has(lower)) return lower;
    const language = lower.split('-')[0];
    if (language === 'zh') {
      const preferred = /hant|tw|hk|mo/.test(lower) ? 'zh-hant' : 'zh-hans';
      return available.has(preferred) ? preferred : null;
    }
    if (available.has(language)) return language;
    return [...available.keys()].find(key => key.split('-')[0] === language) || null;
  }
  for (const link of links) {
    link.addEventListener('click', () => {
      write(languageKey, link.hreflang.toLowerCase());
      link.href = withAnchor(available.get(link.hreflang.toLowerCase()));
    });
  }
  if (page.dataset.autoLocale === 'true') {
    const stored = read(languageKey);
    let selected = available.has(stored) ? stored : null;
    if (!selected) {
      for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
        selected = match(tag || '');
        if (selected) break;
      }
    }
    if (selected && selected !== 'en') { location.replace(withAnchor(available.get(selected))); return; }
  }
  const checks = [...document.querySelectorAll('[data-step]')];
  const panel = document.querySelector('[data-checklist]');
  const count = document.querySelector('[data-count]');
  const meter = document.querySelector('[data-progress]');
  const reset = document.querySelector('[data-reset]');
  if (checks.length === 3 && panel && count && meter && reset) {
    const allowed = new Set(['group','test','install']);
    const parse = value => {
      try { const result = JSON.parse(value || '[]'); return Array.isArray(result) ? new Set(result.filter(x=>allowed.has(x))) : new Set(); }
      catch { return new Set(); }
    };
    let completed = parse(read(progressKey));
    let number = n => String(n);
    try { const format = new Intl.NumberFormat(page.lang); number = n => format.format(n); } catch {}
    function render() {
      for (const check of checks) {
        check.checked = completed.has(check.dataset.step);
        const label = check.closest('label');
        if(label) label.hidden = false;
        const card = check.closest('li');
        if(card) card.classList.toggle('step-complete', check.checked);
      }
      count.textContent = number(completed.size) + ' / ' + number(3);
      meter.value = completed.size;
      reset.disabled = completed.size === 0;
      panel.hidden = false;
    }
    function save() { write(progressKey, JSON.stringify([...completed])); render(); }
    for (const check of checks) check.addEventListener('change',()=>{
      if (!allowed.has(check.dataset.step)) return;
      if (check.checked) completed.add(check.dataset.step); else completed.delete(check.dataset.step);
      save();
    });
    reset.addEventListener('click',()=>{completed.clear();save();});
    function refresh() { const value=read(progressKey); if(value!==undefined){completed=parse(value);render();} }
    window.addEventListener('pageshow', event=>{if(event.persisted)refresh();});
    window.addEventListener('storage', event=>{if(event.key===progressKey||event.key===null)refresh();});
    render();
  }
  const copy = document.querySelector('[data-copy]');
  const share = document.querySelector('[data-native-share]');
  const url = document.querySelector('[data-share]');
  const status = document.querySelector('[data-status]');
  if(copy && url && status && navigator.clipboard?.writeText){
    copy.hidden=false;
    copy.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(url.href);status.textContent=copy.dataset.copied;}
      catch{status.textContent=copy.dataset.failure;}
    });
  }
  if(share && copy && url && status && navigator.share){
    share.hidden=false;
    share.addEventListener('click',async()=>{
      try{await navigator.share({title:document.title,url:url.href});status.textContent='';}
      catch(error){if(error?.name!=='AbortError')status.textContent=copy.dataset.failure;}
    });
  }
})();
