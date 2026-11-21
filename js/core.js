'use strict';
/* ===== Hilfsfunktionen ===== */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const NOW = () => Date.now();
const RT = { place: false };

/* ===== Text-Parser für Sätze: 日本人[にほんじん] | Tokens mit | ===== */
const RE_FURI = /([㐀-鿿々〆]+)\[([^\]]+)\]/g;
const P = {
  tokens: s => s.split('|'),
  surface: s => s.replace(RE_FURI, '$1').replace(/\|/g, ''),
  reading: s => s.replace(RE_FURI, '$2').replace(/\|/g, ''),
  html: (s, furi = true) => esc(s.replace(/\|/g, ''))
    .replace(/([㐀-鿿々〆]+)\[([^\]]+)\]/g, (m, k, r) => furi ? `<ruby>${k}<rt>${r}</rt></ruby>` : k),
  tokHtml: (t, furi = true) => P.html(t, furi),
};

/* ===== Romaji → Hiragana (für Tipp-Eingaben auf jedem Gerät) ===== */
const R2K = {};
(function () {
  const rows = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
    ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と', na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ', ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    ya: 'や', yu: 'ゆ', yo: 'よ', ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', wa: 'わ', wo: 'を',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご', za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    da: 'だ', de: 'で', do: 'ど', ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ', pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', sha: 'しゃ', shu: 'しゅ', sho: 'しょ', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
    nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ', hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ', mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
    rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
    bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
    /* Alternativen */
    si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ', zi: 'じ', di: 'ぢ', du: 'づ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
    tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ', cya: 'ちゃ', cyu: 'ちゅ', cyo: 'ちょ', zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
    jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', la: 'ら', li: 'り', lu: 'る', le: 'れ', lo: 'ろ',
    wi: 'うぃ', we: 'うぇ', fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', she: 'しぇ', che: 'ちぇ', je: 'じぇ', ti_: 'てぃ', di_: 'でぃ',
    xtu: 'っ', ltu: 'っ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', '-': 'ー',
  };
  Object.assign(R2K, rows);
})();
function romajiToKana(inp) {
  let s = inp.toLowerCase().replace(/[\s　]+/g, '');
  let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    /* ひらがな/カタカナ/漢字: unverändert */
    if (/[^a-z\-']/.test(c)) { out += c; i++; continue; }
    /* kleines っ: Doppelkonsonant */
    if (i + 1 < s.length && c === s[i + 1] && /[kstpcgbdzhfjrmwy]/.test(c)) { out += 'っ'; i++; continue; }
    if (c === 'n') {
      const nx = s[i + 1];
      if (nx === "'" ) { out += 'ん'; i += 2; continue; }
      if (nx === 'n' && !(s[i + 2] && /[aiueoy]/.test(s[i + 2]))) { out += 'ん'; i += 2; continue; }
      if (!nx || !/[aiueoy]/.test(nx)) { out += 'ん'; i++; continue; }
    }
    let hit = false;
    for (const L of [3, 2, 1]) {
      const sub = s.substr(i, L);
      if (R2K[sub] && sub !== 'ti_' && sub !== 'di_') { out += R2K[sub]; i += L; hit = true; break; }
    }
    if (!hit) { out += c; i++; }
  }
  return out;
}
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const VOW = { あ: 'あ', い: 'い', う: 'う', え: 'え', お: 'お' };
function vowelOf(ch) {
  const rows = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' };
  const k = KANA[ch] || KANA[ch.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))];
  if (k && k.ro && k.ro !== 'n') return rows[k.ro.slice(-1)] || '';
  const sm = { ゃ: 'あ', ゅ: 'う', ょ: 'お', ぁ: 'あ', ぃ: 'い', ぅ: 'う', ぇ: 'え', ぉ: 'お' };
  return sm[ch] || '';
}
/* Vergleichsform: Hiragana, ー wird zum Vokal, ohne Satzzeichen */
function norm(s) {
  s = toHira(romajiToKana(String(s))).replace(/[\s　、。，．,.!?！？「」『』～~・：:（）()]/g, '');
  let out = '';
  for (const ch of s) {
    if (ch === 'ー') out += vowelOf(out.slice(-1)); else out += ch;
  }
  return out.replace(/を/g, 'お');
}
const eqKana = (a, b) => norm(a) === norm(b);
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const sim = (a, b) => { a = norm(a); b = norm(b); const L = Math.max(a.length, b.length); return L ? 1 - lev(a, b) / L : 1; };

/* ===== Gegenstandsverzeichnis (Items) ===== */
const Items = {};
const DECKS = [];
function buildItems() {
  ALL_GROUPS.forEach(g => g.chars.forEach(c => {
    Items['ka:' + c.ch] = { id: 'ka:' + c.ch, kind: 'kana', ch: c.ch, ro: c.ro, script: c.script, group: g.id, deck: g.script === 'h' ? 'Hiragana' : 'Katakana' };
  }));
  LESSONS.filter(l => l.type === 'content').forEach(l => {
    if (!DECKS.find(d => d.name === l.deck)) DECKS.push({ name: l.deck, lesson: l.id, icon: l.icon });
    l.words.forEach(w => {
      const id = 'w:' + w[0];
      if (Items[id]) return;
      Items[id] = { id, kind: 'word', kana: w[0], kanji: w[1] || '', de: w[2], emoji: w[3] || '', deck: l.deck, lesson: l.id };
    });
  });
  Object.values(KANJI).forEach(k => {
    const lesson = LESSONS.find(l => l.kanji && l.kanji.includes(k.c));
    Items['kj:' + k.c] = { id: 'kj:' + k.c, kind: 'kanji', c: k.c, de: k.de, on: k.on, kun: k.kun, words: k.words, hint: k.hint, deck: 'Kanji', lesson: lesson ? lesson.id : null };
  });
}
/* ===== Speicher ===== */
const KEY = 'jp-lern-app-v1';
const defaults = () => ({
  v: 1, created: NOW(),
  settings: { mastery: 5, minAcc: 70, furigana: true, rate: 0.85, dailyGoal: 15, romajiHelp: true, padInput: true },
  items: {}, lessons: {}, points: 0, streak: 0, best: 0, lastDay: '', days: {}, errors: {}, onboarded: false, placement: null,
});
let S = defaults();
const Store = {
  load() {
    try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(defaults(), JSON.parse(raw)); S.settings = Object.assign(defaults().settings, S.settings); } catch (e) { S = defaults(); }
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* Speicher voll oder gesperrt */ } },
  export() { return JSON.stringify(S, null, 1); },
  import(txt) { const o = JSON.parse(txt); if (!o || o.v !== 1 || !o.items) throw new Error('Ungültige Datei'); S = Object.assign(defaults(), o); Store.save(); },
  reset() { S = defaults(); Store.save(); },
};

/* ===== Wiederholungssystem (SRS) und Mastery ===== */
const MIN = 60000, DAY = 86400000;
function st(id) {
  if (!S.items[id]) S.items[id] = { ease: 2.5, ivl: 0, step: 0, due: 0, reps: 0, lapses: 0, ok: {}, ko: {}, mastered: false, seen: 0, last: 0 };
  return S.items[id];
}
const MODES_BY_KIND = { kana: ['read', 'hear', 'type'], word: ['mc', 'hear', 'type', 'speak'], kanji: ['read', 'mc'] };
function mastery(id) {
  const s = S.items[id]; if (!s) return 0;
  const tot = Object.values(s.ok).reduce((a, b) => a + b, 0);
  const modes = Object.keys(s.ok).filter(k => s.ok[k] > 0).length;
  const needModes = Math.min(3, (MODES_BY_KIND[Items[id] ? Items[id].kind : 'word'] || []).length);
  return Math.min(1, Math.min(tot / S.settings.mastery, 1) * 0.7 + Math.min(modes / needModes, 1) * 0.3);
}
function isMastered(id) {
  const s = S.items[id]; if (!s) return false;
  const tot = Object.values(s.ok).reduce((a, b) => a + b, 0);
  const modes = Object.keys(s.ok).filter(k => s.ok[k] > 0).length;
  const needModes = Math.min(3, (MODES_BY_KIND[Items[id] ? Items[id].kind : 'word'] || []).length);
  return tot >= S.settings.mastery && modes >= needModes && s.lapses <= tot;
}
function touchDay(extra) {
  const k = dayKey();
  if (!S.days[k]) S.days[k] = { reviews: 0, correct: 0, lessons: 0, sec: 0 };
  if (extra) for (const key in extra) S.days[k][key] = (S.days[k][key] || 0) + extra[key];
  if (S.lastDay !== k) {
    const y = dayKey(new Date(Date.now() - DAY));
    S.streak = S.lastDay === y ? S.streak + 1 : 1;
    S.best = Math.max(S.best, S.streak); S.lastDay = k;
  }
}
function review(id, correct, mode, errType) {
  const s = st(id), t = NOW();
  s.seen++; s.last = t;
  touchDay({ reviews: 1, correct: correct ? 1 : 0 });
  if (correct) {
    s.ok[mode] = (s.ok[mode] || 0) + 1; s.reps++;
    if (s.ivl === 0) {
      s.step++;
      if (s.step >= 2) { s.ivl = 1; s.due = t + DAY; } else s.due = t + 10 * MIN;
    } else {
      s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * s.ease)); s.due = t + s.ivl * DAY;
    }
    s.ease = Math.min(3, s.ease + 0.03);
  } else {
    s.ko[mode] = (s.ko[mode] || 0) + 1; s.lapses++;
    s.ease = Math.max(1.3, s.ease - 0.2); s.ivl = 0; s.step = 0; s.due = t + 2 * MIN;
    const e = errType || 'general';
    S.errors[e] = (S.errors[e] || 0) + 1;
  }
  s.mastered = isMastered(id);
  Store.save();
}
const isDue = id => { const s = S.items[id]; return s && !s.pending && s.due <= NOW(); };
const dueList = () => Object.keys(S.items).filter(id => Items[id] && isDue(id));
const weakList = () => Object.keys(S.items).filter(id => Items[id] && S.items[id].lapses > 0 && !S.items[id].mastered && !S.items[id].pending)
  .sort((a, b) => (S.items[b].lapses - S.items[b].reps * 0.3) - (S.items[a].lapses - S.items[a].reps * 0.3));
function lessonItems(l) {
  if (l.type === 'kana') return l.groups.flatMap(g => (ALL_GROUPS.find(x => x.id === g) || { chars: [] }).chars.map(c => 'ka:' + c.ch));
  const ids = l.words.map(w => 'w:' + w[0]);
  (l.kanji || []).forEach(k => ids.push('kj:' + k));
  return ids;
}
const ERR_LABEL = {
  kana: 'Zeichen verwechselt', hear: 'Hörfehler', vocab: 'Vokabel falsch', particle: 'Partikel', order: 'Wortstellung',
  kanji: 'Kanji / Lesung', speak: 'Aussprache', read: 'Lesen', general: 'Sonstiges', translate: 'Übersetzung',
};

/* ===== Sprachausgabe und Spracherkennung ===== */
const Voice = {
  voice: null, ready: false, list: [], lastError: '', lastOk: 0, _errAt: 0,
  loadVoices() {
    if (!('speechSynthesis' in window)) return;
    this.list = speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang) || /japan|日本/i.test(v.name));
    this.voice = this.pickVoice();
    this.ready = this.list.length > 0;
  },
  pickVoice() {
    const sel = S.settings.voiceName && this.list.find(v => v.name === S.settings.voiceName);
    return sel || this.list.find(v => /Kyoko|Otoya|Google|Enhanced|Premium|Neural|Online/i.test(v.name)) || this.list[0] || null;
  },
  /* Kandidaten in Reihenfolge: gewählte Stimme, lokale Stimmen, alle anderen, zuletzt nur die Sprache */
  candidates() {
    const first = this.pickVoice();
    const c = [first, ...this.list.filter(v => v.localService), ...this.list].filter(Boolean);
    const out = []; c.forEach(v => { if (!out.includes(v)) out.push(v); });
    out.push(null); return out;
  },
  init() {
    if (!('speechSynthesis' in window)) { this.lastError = 'Dieser Browser hat keine Sprachausgabe.'; return; }
    this.loadVoices(); speechSynthesis.onvoiceschanged = () => this.loadVoices();
    /* Audio beim ersten Antippen „entsperren“ (nötig auf manchen Android/iOS-Geräten) */
    const unlock = () => { try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'ja-JP'; speechSynthesis.speak(u); } catch (e) { /* ignorieren */ } };
    document.addEventListener('pointerdown', unlock, { once: true });
  },
  fail(msg) {
    this.lastError = msg;
    if (NOW() - this._errAt > 20000) { this._errAt = NOW(); if (typeof toast === 'function') toast('Kein Ton: ' + msg + ' (Mehr → Einstellungen → Ton-Diagnose)'); }
  },
  speak(text, rate) {
    return new Promise(res => {
      if (!('speechSynthesis' in window)) { this.fail('Keine Sprachausgabe im Browser'); return res(false); }
      if (!text) return res(false);
      const synth = speechSynthesis;
      this.stopListening();
      if (!this.list.length) this.loadVoices();
      const t = P.reading(text).replace(/[｜|]/g, '').replace(/～/g, '').replace(/[ＡＢ]：/g, '').trim();
      if (!t) return res(false);
      const cands = this.candidates(); let idx = 0, settled = false;
      const done = v => { if (!settled) { settled = true; res(v); } };
      const attempt = () => {
        const v = cands[idx++]; let started = false, over = false;
        const u = new SpeechSynthesisUtterance(t);
        u.lang = 'ja-JP'; try { if (v) u.voice = v; } catch (e) { /* Stimme nicht setzbar: Systemstimme */ } u.rate = rate || S.settings.rate; u.pitch = 1; u.volume = 1;
        const next = why => {
          if (over) return; over = true; clearTimeout(wd);
          if (idx < cands.length) { try { synth.cancel(); } catch (e) { /* ignorieren */ } setTimeout(attempt, 120); }
          else { this.fail(why || 'Stimme antwortet nicht'); done(false); }
        };
        u.onstart = () => { started = true; this.lastOk = NOW(); this.lastError = ''; };
        u.onend = () => { if (!over) { over = true; clearTimeout(wd); done(true); } };
        u.onerror = e => { if (e.error === 'canceled' || e.error === 'interrupted') { if (!over) { over = true; clearTimeout(wd); done(false); } return; } next(e.error || 'Fehler der Stimme'); };
        const wd = setTimeout(() => { if (!started) next('Keine Reaktion der Stimme'); }, 4000);
        try { synth.speak(u); } catch (e) { next(e.message); }
      };
      try {
        if (synth.speaking || synth.pending || synth.paused) { synth.cancel(); setTimeout(() => { try { synth.resume(); } catch (e) { /* ignorieren */ } attempt(); }, 120); }
        else { try { synth.resume(); } catch (e) { /* ignorieren */ } attempt(); }
      } catch (e) { attempt(); }
      setTimeout(() => done(true), 25000);
    });
  },
  canListen() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
  listen() {
    return new Promise((res, rej) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return rej(new Error('no-support'));
      const r = new SR(); r.lang = 'ja-JP'; r.maxAlternatives = 5; r.interimResults = false; r.continuous = false;
      let done = false;
      r.onresult = e => { done = true; const alts = []; for (const a of e.results[0]) alts.push(a.transcript); res(alts); };
      r.onerror = e => { if (!done) { done = true; rej(new Error(e.error || 'error')); } };
      r.onend = () => { if (!done) { done = true; rej(new Error('no-speech')); } };
      try { r.start(); } catch (e) { rej(e); }
      Voice._rec = r;
    });
  },
  stopListening() { try { if (Voice._rec) Voice._rec.abort(); } catch (e) { /* ignorieren */ } },
};
