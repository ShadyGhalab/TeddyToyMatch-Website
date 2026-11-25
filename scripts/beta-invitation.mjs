export const invitationLabels = {
  "en": [
    "Your enrollment checklist",
    "Your checklist stays on this device. It does not verify enrollment with Google Play.",
    "I joined the Google Group",
    "I accepted the testing invitation",
    "I installed the game",
    "Reset checklist",
    "After each step, return here to continue. External links may open in another tab or app.",
    "Scan on your Android phone"
  ],
  "ar": [
    "قائمة التسجيل الخاصة بك",
    "تبقى قائمة التحقق على هذا الجهاز فقط. ولا تؤكد التسجيل لدى Google Play.",
    "انضممت إلى مجموعة Google",
    "قبلت دعوة الاختبار",
    "ثبّتُ اللعبة",
    "إعادة تعيين القائمة",
    "بعد كل خطوة، عُد إلى هنا للمتابعة. قد تُفتح الروابط الخارجية في علامة تبويب أو تطبيق آخر.",
    "امسح الرمز بهاتف أندرويد"
  ],
  "de": [
    "Deine Anmelde-Checkliste",
    "Deine Checkliste bleibt auf diesem Gerät. Sie bestätigt keine Anmeldung bei Google Play.",
    "Ich bin der Google-Gruppe beigetreten",
    "Ich habe die Testeinladung angenommen",
    "Ich habe das Spiel installiert",
    "Checkliste zurücksetzen",
    "Kehre nach jedem Schritt hierher zurück. Externe Links können in einem anderen Tab oder einer App geöffnet werden.",
    "Mit deinem Android-Handy scannen"
  ],
  "es": [
    "Tu lista de inscripción",
    "Tu lista se guarda solo en este dispositivo. No verifica la inscripción en Google Play.",
    "Me he unido al grupo de Google",
    "He aceptado la invitación de prueba",
    "He instalado el juego",
    "Restablecer lista",
    "Vuelve aquí después de cada paso. Los enlaces externos pueden abrirse en otra pestaña o aplicación.",
    "Escanea con tu teléfono Android"
  ],
  "fr": [
    "Votre liste d'inscription",
    "Votre liste reste sur cet appareil. Elle ne vérifie pas votre inscription auprès de Google Play.",
    "J'ai rejoint le groupe Google",
    "J'ai accepté l'invitation au test",
    "J'ai installé le jeu",
    "Réinitialiser la liste",
    "Revenez ici après chaque étape. Les liens externes peuvent s'ouvrir dans un autre onglet ou une application.",
    "Scannez avec votre téléphone Android"
  ],
  "ja": [
    "登録チェックリスト",
    "チェックリストはこの端末にのみ保存されます。Google Play での登録を確認するものではありません。",
    "Google グループに参加しました",
    "テストへの招待を承諾しました",
    "ゲームをインストールしました",
    "チェックリストをリセット",
    "各ステップの後にここへ戻ってください。外部リンクは別のタブやアプリで開く場合があります。",
    "Android スマートフォンでスキャン"
  ],
  "pt-BR": [
    "Sua lista de inscrição",
    "Sua lista fica apenas neste dispositivo. Ela não verifica a inscrição no Google Play.",
    "Entrei no Grupo do Google",
    "Aceitei o convite de teste",
    "Instalei o jogo",
    "Redefinir lista",
    "Volte aqui após cada etapa. Links externos podem abrir em outra aba ou aplicativo.",
    "Escaneie com seu celular Android"
  ],
  "zh-Hans": [
    "你的报名清单",
    "清单仅保存在此设备上，不代表 Google Play 已确认报名。",
    "我已加入 Google 群组",
    "我已接受测试邀请",
    "我已安装游戏",
    "重置清单",
    "完成每一步后请返回此页面。外部链接可能在其他标签页或应用中打开。",
    "使用 Android 手机扫描"
  ]
};

export function enhancePage(html, config, locale, labels, shareLabel) {
  const e = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  if (!Array.isArray(labels) || labels.length !== 8 || labels.some(x=>typeof x!=="string"||!x.trim())) throw new Error("Incomplete invitation translations: "+locale);
  const [checkTitle,privacy,groupDone,testDone,installDone,reset,returnNote,scan] = labels.map(e);
  const group = 'https://groups.google.com/g/alpha-android-testers';
  const opt = 'https://play.google.com/apps/testing/' + config.pkg;
  const store = 'https://play.google.com/store/apps/details?id=' + config.pkg;
  const external = ' target="_blank" rel="noopener noreferrer"';
  function replace(a,b) { if(!html.includes(a)) throw new Error("Missing invitation markup: "+a.slice(0,90)); html=html.replace(a,b); }
  // Returning group members can go straight to the official test, without scrolling.
  replace('<body class="'+config.kind+'">','<body class="'+config.kind+'" data-beta-app="'+e(config.pkg)+'">');
  replace('class="member" href="#enroll"','class="action member" href="'+opt+'"');
  replace('</div><p class="note">','</div><p class="note" id="return-note">'+returnNote+'</p><p class="note">');
  for (const url of [group,opt,store]) html=html.split('href="'+url+'"').join('href="'+url+'"'+external);
  const checklist = '<div class="check-panel" data-checklist hidden><div class="check-head"><h3 id="check-title">'+checkTitle+'</h3><span data-count role="status" aria-live="polite" dir="ltr">0 / 3</span></div><progress data-progress value="0" max="3" aria-labelledby="check-title"></progress><p>'+privacy+'</p><button class="reset" data-reset type="button">'+reset+'</button></div>';
  replace('<ol class="steps">',checklist+'<ol class="steps" aria-describedby="return-note">');
  for(const [url,key,label] of [[group,"group",groupDone],[opt,"test",testDone],[store,"install",installDone]]) {
    const marker='href="'+url+'"'+external;
    const index=html.indexOf(marker,html.indexOf('<ol class="steps"'));
    if(index<0) throw new Error("Missing enrollment link "+key);
    const end=html.indexOf('</a></li>',index);
    if(end<0)throw new Error("Missing enrollment card "+key);
    html=html.slice(0,end+4)+'<label class="check-step" hidden><input type="checkbox" data-step="'+key+'"><span>'+label+'</span></label>'+html.slice(end+4);
  }
  const shareUrl=html.match(/<a data-share href="([^"]+)"/)?.[1];
  if(!shareUrl)throw new Error("Missing share URL");
  const shareText=e(shareLabel);
  const encoded=encodeURIComponent(shareUrl);
  const shareExtras='<button class="action primary" type="button" data-native-share hidden>'+shareText+'</button><a class="action share-service" href="https://wa.me/?text='+encoded+'"'+external+' aria-label="'+shareText+' · WhatsApp">WhatsApp</a><a class="action share-service" href="https://t.me/share/url?url='+encoded+'"'+external+' aria-label="'+shareText+' · Telegram">Telegram</a>';
  replace('<span data-status class="copy-status"',shareExtras+'<span data-status class="copy-status"');
  replace('</div></section>\n</main>','</div><figure class="invite-qr"><img src="/beta/invite-qr.svg" width="132" height="132" alt="" loading="lazy"><figcaption>'+scan+'</figcaption></figure></section>\n</main>');
  return html;
}
