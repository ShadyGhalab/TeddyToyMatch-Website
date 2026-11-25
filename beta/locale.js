// Static locale links and enrollment work even without JavaScript.
const page = document.documentElement;
if (page.dataset.autoLocale === 'true') {
  const links = [...document.querySelectorAll('a[data-locale]')];
  const available = new Map(links.map(a => [a.hreflang.toLowerCase(),a.href]));
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
  for (const tag of navigator.languages || [navigator.language]) {
    const locale = match(tag || '');
    if (locale) {
      if (locale !== 'en') location.replace(available.get(locale));
      break;
    }
  }
}
const button = document.querySelector('[data-copy]');
const url = document.querySelector('[data-share]');
const status = document.querySelector('[data-status]');
if (button && url && status && navigator.clipboard?.writeText) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(url.href); status.textContent = button.dataset.copied; }
    catch { status.textContent = button.dataset.failure; }
  });
}
