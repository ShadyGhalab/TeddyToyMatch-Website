// Only user-confirmed checklist state changes the recommended next action.
// Calendar export is local, optional, and never reports enrollment to a server.
function betaNextStep(completed) {
  return ['group','test','install'].find(key=>!completed.includes(key)) || 'feedback';
}
function betaReminderDate(input) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input))return null;
  const date=new Date(input+'T00:00:00Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==input)return null;
  date.setUTCDate(date.getUTCDate()+14);
  return date.toISOString().slice(0,10).replace(/-/g,'');
}
function betaEscapeCalendar(value) {
  return String(value).replace(/\\/g,'\\\\').replace(/\r?\n|\r/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
}
function betaFoldLine(line) {
  const encoder=new TextEncoder();let result='',bytes=0;
  for(const character of line) {
    const n=encoder.encode(character).length;
    if(bytes+n>75){result+='\r\n ';bytes=1;}
    result+=character;bytes+=n;
  }
  return result;
}
function betaCalendar(input,title,note,uid,now=new Date()) {
  const day=betaReminderDate(input);if(!day)return null;
  const next=new Date(day.slice(0,4)+'-'+day.slice(4,6)+'-'+day.slice(6,8)+'T00:00:00Z');
  next.setUTCDate(next.getUTCDate()+1);
  const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ShadyGhalabs//Android Beta//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+betaEscapeCalendar(uid),'DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+day,'DTEND;VALUE=DATE:'+next.toISOString().slice(0,10).replace(/-/g,''),'SUMMARY:'+betaEscapeCalendar(title),'DESCRIPTION:'+betaEscapeCalendar(note),'TRANSP:TRANSPARENT','END:VEVENT','END:VCALENDAR'].map(betaFoldLine).join('\r\n')+'\r\n';
}
if(typeof document!=='undefined'){
  (()=>{
    const hero=document.querySelector('[data-next-action]');
    const checks=[...document.querySelectorAll('[data-step]')];
    const reset=document.querySelector('[data-reset]');
    function update(){
      if(!hero)return;
      const key=betaNextStep(checks.filter(c=>c.checked).map(c=>c.dataset.step));
      const destination=key==='feedback'?document.querySelector('[data-feedback-link]'):document.querySelector('[data-next-target="'+key+'"]');
      if(!destination)return;
      hero.href=destination.href;hero.textContent=destination.textContent.trim();
      if(key==='feedback'){hero.removeAttribute('target');hero.removeAttribute('rel');}
      else{hero.target='_blank';hero.rel='noopener noreferrer';}
    }
    for(const check of checks)check.addEventListener('change',update);
    reset?.addEventListener('click',update);
    // locale.js registered its own refresh handlers first.
    window.addEventListener('pageshow',update);window.addEventListener('storage',update);
    update();
    const panel=document.querySelector('[data-reminder]'),input=document.querySelector('[data-opt-date]'),button=document.querySelector('[data-reminder-download]');
    if(!panel||!input||!button||!window.URL?.createObjectURL||typeof Blob==='undefined')return;
    const now=new Date();const today=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    input.max=today;
    const validate=()=>{button.disabled=!betaReminderDate(input.value)||input.value>today;};
    input.addEventListener('input',validate);input.addEventListener('change',validate);validate();panel.hidden=false;
    button.addEventListener('click',()=>{
      validate();if(button.disabled)return;
      const app=document.body.dataset.betaApp||'android-beta';
      const event=betaCalendar(input.value,button.dataset.eventTitle,button.dataset.eventNote,app+'-beta-'+input.value+'@shadyghalabs');
      if(!event)return;
      const url=window.URL.createObjectURL(new Blob([event],{type:'text/calendar;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='android-beta-reminder.ics';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>window.URL.revokeObjectURL(url),60000);
    });
  })();
}
