'use strict';
/* ===== Fragengeneratoren ===== */
const PARTICLES = ['は', 'が', 'を', 'に', 'で', 'の', 'も', 'か', 'と'];
const uniq = a => [...new Set(a)];
const roLabel = c => (KANA[c] ? KANA[c].ro : romaOf(c));

function taker(list) {
  let q = shuffle(list), i = 0;
  return n => { const out = []; while (out.length < n && list.length) { if (i >= q.length) { q = shuffle(list); i = 0; } const x = q[i++]; if (!out.includes(x) || list.length < n) out.push(x); } return out; };
}

/* --- Distraktoren --- */
function wordDists(it, n = 3) {
  const all = Object.values(Items).filter(x => x.kind === 'word' && x.id !== it.id && x.de !== it.de && x.kana !== it.kana && x.kana.length > 1);
  const seen = x => S.items[x.id] || x.lesson === it.lesson;
  const pools = [shuffle(all.filter(x => x.lesson === it.lesson)), shuffle(all.filter(x => x.deck === it.deck && seen(x))), shuffle(all.filter(x => seen(x))), shuffle(all)];
  const out = []; const seenDe = new Set([it.de]);
  for (const p of pools) for (const x of p) { if (out.length >= n) break; if (!seenDe.has(x.de) && !out.includes(x)) { out.push(x); seenDe.add(x.de); } }
  return out;
}
function kanaPoolDefault(it) {
  let p = Object.values(Items).filter(x => x.kind === 'kana' && x.script === it.script && (S.items[x.id] || x.group === it.group));
  if (p.length < 8) p = Object.values(Items).filter(x => x.kind === 'kana' && x.script === it.script && x.group.replace(/\D/g, '') === '' && !/^(h|k)-c/.test(x.group));
  return p.map(x => x.ch);
}
function kanaDists(ch, n = 3, pool) {
  const it = Items['ka:' + ch];
  pool = (pool || kanaPoolDefault(it)).filter(c => c !== ch && Items['ka:' + c]);
  const simG = (KANA_SIM.find(g => g.includes(ch)) || []).filter(c => pool.includes(c));
  const same = shuffle(pool.filter(c => Items['ka:' + c].group === it.group && !simG.includes(c)));
  const rest = shuffle(pool.filter(c => !simG.includes(c) && !same.includes(c)));
  const out = [];
  const roS = new Set([it.ro]);
  for (const c of [...shuffle(simG), ...same, ...rest]) { if (out.length >= n) break; const r = Items['ka:' + c].ro; if (!roS.has(r)) { out.push(c); roS.add(r); } }
  return out;
}

/* --- Frage zu einem einzelnen Item in einem bestimmten Modus --- */
function nextMode(id) {
  const it = Items[id], modes = MODES_BY_KIND[it.kind].filter(m => !(m === 'speak' && false));
  const s = S.items[id] || { ok: {} };
  const avail = modes.filter(m => (it.kind !== 'word' || m !== 'mc') || true);
  let best = null, bc = 1e9;
  shuffle(avail).forEach(m => { const c = (s.ok && s.ok[m]) || 0; if (c < bc) { bc = c; best = m; } });
  return best;
}
function itemQ(id, mode, pool) {
  const it = Items[id]; mode = mode || nextMode(id);
  if (it.kind === 'kana') {
    const ds = kanaDists(it.ch, 3, pool);
    if (mode === 'read') return choiceQ({ id, mode, err: 'kana', title: 'Lesen', prompt: `<div class="big-jp">${esc(it.ch)}</div><div class="muted center">Wie liest man dieses Zeichen?</div>`, audio: it.ch, autoplay: false,
      options: [it, ...ds.map(c => Items['ka:' + c])].map(x => ({ h: esc(x.ro), ok: x === it, id: x.id })), explain: `${esc(it.ch)} = ${esc(it.ro)}` });
    if (mode === 'hear') return choiceQ({ id, mode, err: 'hear', title: 'Hören und wählen', prompt: 'Welches Zeichen hörst du?', audio: it.ch, grid: true, bigOpt: true,
      options: [it, ...ds.map(c => Items['ka:' + c])].map(x => ({ h: `<span class="jp big">${esc(x.ch)}</span>`, ok: x === it, id: x.id })), explain: `${esc(it.ch)} = ${esc(it.ro)}` });
    return typeQ({ id, mode: 'type', err: 'kana', title: 'Eintippen', prompt: `<div class="big-jp">${esc(it.ch)}</div><div class="muted center">Tippe die Lesung (Romaji).</div>`, placeholder: 'Romaji',
      answers: [it.ro, ...(RO_ALT[it.ro] || [])].map(r => romajiToKana(r)).concat([it.ch]), show: it.ro, accept: v => v.toLowerCase() === it.ro || (RO_ALT[it.ro] || []).includes(v.toLowerCase()) });
  }
  if (it.kind === 'word') {
    const ds = wordDists(it);
    const jp = x => `<span class="jp">${wordHtml(x)}</span>`;
    const ans = [it.kana, ...(it.kanji ? [it.kanji] : [])];
    if (mode === 'mc') return choiceQ({ id, mode, err: 'vocab', title: 'Was heißt das?', prompt: `<div class="big-jp">${wordHtml(it)}</div>`, audio: it.kana, options: [it, ...ds].map(x => ({ h: esc(x.de), ok: x === it, id: x.id })) });
    if (mode === 'mcr') return choiceQ({ id, mode: 'mc', err: 'vocab', title: 'Wie sagt man das?', prompt: `<div class="big-de">${esc(it.de)}</div>`, options: [it, ...ds].map(x => ({ h: jp(x), ok: x === it, id: x.id })), explain: `${romaOf(it.kana)}` });
    if (mode === 'hear') return choiceQ({ id, mode, err: 'hear', title: 'Hören und wählen', prompt: 'Welches Wort hörst du?', audio: it.kana, slow: true, options: [it, ...ds].map(x => ({ h: jp(x) + `<small class="sub">${esc(x.de)}</small>`, ok: x === it, id: x.id })) });
    if (mode === 'type') return typeQ({ id, mode, err: 'vocab', title: 'Auf Japanisch schreiben', prompt: `<div class="big-de">${esc(it.de)}</div><div class="muted center">Tippe das Wort auf Japanisch.</div>`, answers: ans, show: it.kana + (it.kanji ? ` (${it.kanji})` : '') });
    return speakQ({ id, html: wordHtml(it, true), say: it.kana, de: it.de });
  }
  /* Kanji */
  const k = it;
  if (mode === 'mc' && k.words.length) {
    const w = k.words[rnd(k.words.length)];
    const others = shuffle(Object.values(KANJI).flatMap(x => x.words).filter(x => x[1] !== w[1])).filter((x, i, a) => a.findIndex(y => y[1] === x[1]) === i).slice(0, 3);
    return choiceQ({ id, mode: 'mc', err: 'kanji', title: 'Kanji-Wort lesen', prompt: `<div class="big-jp">${esc(w[0])}</div><div class="muted center">Wie liest man dieses Wort? (${esc(w[2])})</div>`, audio: w[1], autoplay: false,
      options: [w, ...others].map(x => ({ h: `<span class="jp">${esc(x[1])}</span>`, ok: x === w })), explain: `${esc(w[0])} = ${esc(w[1])}: ${esc(w[2])}` });
  }
  const ds = shuffle(Object.values(KANJI).filter(x => x.c !== k.c && x.de !== k.de)).slice(0, 3);
  return choiceQ({ id, mode: 'read', err: 'kanji', title: 'Kanji erkennen', prompt: `<div class="big-jp">${esc(k.c)}</div><div class="muted center">Was bedeutet dieses Kanji?</div>`,
    options: [k, ...ds].map(x => ({ h: esc(x.de), ok: x === k, id: 'kj:' + x.c })), explain: `${esc(k.c)}: ${esc(k.de)} (${esc(k.on)}${k.kun ? ' / ' + esc(k.kun) : ''})` });
}

/* --- Satz-Hilfen --- */
const sentTokens = s => P.tokens(s.s);
const sentReading = s => P.reading(s.s);
function sentVariants(s) {
  const base = sentReading(s);
  const toks = sentTokens(s).map(t => P.reading(t));
  const alt = toks.map(t => t === 'は' ? 'わ' : t === 'へ' ? 'え' : t).join('');
  return uniq([base, alt, P.surface(s.s)]);
}
function partQuestions(sents, n) {
  const out = [];
  for (const s of shuffle(sents)) {
    const toks = sentTokens(s);
    const idx = toks.map((t, i) => PARTICLES.includes(t) ? i : -1).filter(i => i >= 0);
    if (!idx.length) continue;
    const i = idx[rnd(idx.length)]; const right = toks[i];
    const shown = toks.map((t, j) => j === i ? '<span class="blank">＿</span>' : P.tokHtml(t, S.settings.furigana)).join(' ');
    out.push(choiceQ({ err: 'particle', title: 'Partikel einsetzen', prompt: `<div class="big-jp">${shown}</div><div class="muted center">${esc(s.de)}</div>`, audio: sentReading(s), autoplay: false,
      options: [right, ...shuffle(PARTICLES.filter(p => p !== right)).slice(0, 3)].map(p => ({ h: `<span class="jp big">${p}</span>`, ok: p === right })), grid: true,
      explain: `<span class="jp">${P.html(s.s, S.settings.furigana)}</span>` }));
    if (out.length >= n) break;
  }
  return out;
}
function allSents() { return LESSONS.filter(l => l.sents).flatMap(l => l.sents); }

/* --- Kana-Lektionen: Hilfsdaten --- */
function kanaCtx(l) {
  const kl = LESSONS.filter(x => x.type === 'kana'); const idx = kl.indexOf(l);
  const gIds = kl.slice(0, idx + 1).flatMap(x => x.groups);
  const groups = gIds.map(g => ALL_GROUPS.find(x => x.id === g)).filter(Boolean);
  const learned = new Set(); groups.forEach(g => g.chars.forEach(c => { for (const ch of c.ch) learned.add(ch); }));
  const hasSmall = gIds.some(g => /^[hk]-c1$/.test(g)) || idx >= 2;
  if (hasSmall) 'っゃゅょ'.split('').forEach(c => learned.add(c));
  if (gIds.some(g => g.startsWith('k-'))) 'ーッャュョ'.split('').forEach(c => learned.add(c));
  const cur = l.groups.map(g => ALL_GROUPS.find(x => x.id === g)).flatMap(g => g.chars);
  const curChars = new Set(); cur.forEach(c => { for (const ch of c.ch) curChars.add(ch); });
  const words = KWORDS.filter(w => [...w.k].every(c => learned.has(c)));
  const wcur = words.filter(w => [...w.k].some(c => curChars.has(c)));
  return { idx, groups, learned, cur, pool: groups.flatMap(g => g.chars.map(c => c.ch)), words: wcur.length >= 5 ? wcur : words, allWords: words };
}
const splitKana = w => w.match(/[^ゃゅょャュョぁぃぅぇぉ][ゃゅょャュョぁぃぅぇぉ]?/g) || [w];
const kwHtml = w => `<span class="jp big">${esc(w.k)}</span>`;

/* ===== Die 19 Übungen einer Lektion ===== */
function buildSlots(l) {
  return l.type === 'kana' ? kanaSlots(l) : contentSlots(l);
}
function warmupQs(l, ctx) {
  const ids = dueList().filter(id => !ctx.lessonIds.has(id));
  let list = shuffle(ids).slice(0, 5);
  if (list.length < 3) list = list.concat(weakList().filter(id => !list.includes(id) && !ctx.lessonIds.has(id)).slice(0, 5 - list.length));
  const qs = list.map(id => itemQ(id));
  if (!qs.length) return [infoQ({ title: 'Aufwärmen', html: `<div class="card"><h3>Willkommen zur Lektion „${esc(l.title)}“</h3><p>Hier siehst du normalerweise Wiederholungen von früheren Lektionen. Da du noch nichts Fälliges hast, geht es gleich los.</p><p class="muted">Tipp: Sprich alles laut mit. Aktives Sprechen verankert Wörter deutlich besser als Mitlesen.</p></div>` })];
  return qs;
}
function missedQs(ctx, fallback) {
  const ids = uniq(ctx.missed).slice(0, 6);
  if (ids.length) return [infoQ({ title: 'Fehler-Wiederholung', html: `<div class="card"><h3>Noch einmal die schwierigen</h3><p>Du hast ${ids.length} Element(e) verpasst. Wir üben sie jetzt gezielt in einer anderen Form.</p></div>` }), ...ids.map(id => { const it = Items[id]; const modes = MODES_BY_KIND[it.kind]; const last = (S.items[id] && S.items[id].ko) ? Object.keys(S.items[id].ko).pop() : ''; return itemQ(id, modes.find(m => m !== last && m !== 'speak') || modes[0]); })];
  return fallback();
}
const sentInfo = (s, extra = '') => `<span class="jp">${P.html(s.s, S.settings.furigana)}</span>${playBtn(sentReading(s))}<div class="muted">${esc(s.de)}</div>${extra}`;

function contentSlots(l) {
  const wordItems = l.words.map(w => Items['w:' + w[0]]).filter(Boolean);
  const ctx = { lessonIds: new Set(lessonItems(l)), missed: [] };
  const T = taker(wordItems.map(w => w.id));
  const sents = l.sents || [];
  const kanjiIds = (l.kanji || []).map(k => 'kj:' + k);
  const slots = [];
  const add = (name, icon, build) => slots.push({ name, icon, build });

  add('Aufwärmen', '🔥', () => warmupQs(l, ctx));
  add('Neue Wörter', '🆕', () => [carouselQ({ title: 'Neue Wörter', cards: wordItems.map(it => ({ say: it.kana, html: `<div class="card wcard"><div class="emoji">${it.emoji}</div>${wordHtml(it, true)}<div class="roma">${esc(romaOf(it.kana))}</div><div class="de">${esc(it.de)}</div>${playBtn(it.kana, 'lg')} ${slowBtn(it.kana)}</div>` })) })]);
  add('Zuordnen', '🔗', () => [matchQ({ prompt: 'Ordne die Wörter ihrer Bedeutung zu.', pairs: T(5).map(id => { const it = Items[id]; return { a: `<span class="jp">${wordHtml(it)}</span>`, b: esc(it.de), id, say: it.kana }; }) })]);
  add('Japanisch → Deutsch', '🇩🇪', () => T(4).map(id => itemQ(id, 'mc')));
  add('Deutsch → Japanisch', '🇯🇵', () => T(4).map(id => itemQ(id, 'mcr')));
  add('Hören und wählen', '👂', () => T(4).map(id => itemQ(id, 'hear')));
  add('Hören und tippen', '⌨️', () => T(3).map(id => { const it = Items[id]; return typeQ({ id, mode: 'type', err: 'hear', title: 'Diktat', prompt: 'Höre zu und tippe, was du hörst.', audio: it.kana, answers: [it.kana, ...(it.kanji ? [it.kanji] : [])], show: it.kana + (it.kanji ? ` (${it.kanji})` : ''), explain: esc(it.de) }); }));
  add('Lesen üben', '📖', () => T(4).map(id => {
    const it = Items[id]; const ds = wordDists(it);
    const withRo = S.settings.romajiHelp;
    return choiceQ({ id, mode: 'mc', err: 'read', title: 'Lesen', prompt: `<div class="big-jp">${wordHtml(it, true).replace(/<rt>.*?<\/rt>/g, '')}</div><div class="muted center">${withRo ? 'Wie liest man das?' : 'Was bedeutet das?'}</div>`,
      options: [it, ...ds].map(x => ({ h: esc(withRo ? romaOf(x.kana) : x.de), ok: x === it, id: x.id })), explain: `${esc(it.kana)} = ${esc(it.de)}` });
  }));
  add('Kanji-Bausteine', '漢', () => {
    let ids = kanjiIds.length ? kanjiIds : [];
    const qs = [];
    if (ids.length) {
      qs.push(infoQ({ title: 'Kanji dieser Lektion', html: `<div class="card"><h3>Neue Kanji</h3><div class="kanji-list">${ids.map(id => { const k = Items[id]; return `<div class="kj"><div class="kj-c">${esc(k.c)}</div><div><b>${esc(k.de)}</b><div class="muted">On: ${esc(k.on)}${k.kun ? ' · Kun: ' + esc(k.kun) : ''}</div>${k.hint ? `<div class="muted">💡 ${esc(k.hint)}</div>` : ''}<div class="muted">${k.words.map(w => `<span class="jp">${esc(w[0])}</span> (${esc(w[1])}) ${esc(w[2])}`).join(' · ')}</div></div></div>`; }).join('')}</div></div>` }));
      const tk = taker(ids);
      tk(2).forEach(id => qs.push(itemQ(id, 'read')));
      /* Komposita-Bedeutung aus den Teilen */
      const comps = ids.flatMap(id => Items[id].words).filter(w => [...w[0]].length >= 2 && [...w[0]].every(c => KANJI[c] || /[ぁ-ん]/.test(c)) && [...w[0]].some(c => KANJI[c]));
      const wc = shuffle(comps).slice(0, 1)[0];
      if (wc) qs.push(choiceQ({ err: 'kanji', title: 'Zusammengesetztes Kanji-Wort', prompt: `<div class="big-jp">${esc(wc[0])}</div><div class="muted center">${[...wc[0]].filter(c => KANJI[c]).map(c => `${esc(c)} = ${esc(KANJI[c].de)}`).join(' + ')}<br>Wie liest man es?</div>`, audio: wc[1], autoplay: false,
        options: [wc, ...shuffle(Object.values(KANJI).flatMap(x => x.words).filter(x => x[1] !== wc[1])).slice(0, 3)].map(x => ({ h: `<span class="jp">${esc(x[1])}</span>`, ok: x === wc })), explain: `${esc(wc[0])} = ${esc(wc[1])}: ${esc(wc[2])}` }));
      tk(1).forEach(id => qs.push(itemQ(id, 'mc')));
    } else {
      const known = Object.values(Items).filter(x => x.kind === 'kanji').sort((a, b) => (S.items[a.id] ? 1 : 0) - (S.items[b.id] ? 1 : 0)).slice(0, 2);
      qs.push(infoQ({ title: 'Kanji-Vorschau', html: `<div class="card"><h3>Kanji-Vorschau</h3><p>Kanji (漢字) stehen für Wörter und Bedeutungen, Hiragana für Endungen und kleine Wörter. Jedes Zeichen hat meist zwei Lesungen: <b>On</b> (aus dem Chinesischen, in Komposita) und <b>Kun</b> (japanisch, allein stehend).</p><p>Ein kleiner Blick auf zwei Zeichen, die später vorkommen:</p>${known.map(k => `<div class="kj"><div class="kj-c">${esc(k.c)}</div><div><b>${esc(k.de)}</b><div class="muted">On: ${esc(k.on)}${k.kun ? ' · Kun: ' + esc(k.kun) : ''}</div>${k.hint ? `<div class="muted">💡 ${esc(k.hint)}</div>` : ''}</div></div>`).join('')}</div>` }));
      known.forEach(k => qs.push(itemQ(k.id, 'read')));
    }
    return qs;
  });
  add('Lückentext: Partikel', '🧩', () => {
    let qs = partQuestions(sents, 3), pre = [];
    if (qs.length < 2) { qs = partQuestions(allSents(), 3); pre = [infoQ({ title: 'Partikel-Vorschau', html: `<div class="card"><h3>Partikel</h3><p>Kleine Wörter wie <b class="jp">は が を に で の も か と</b> zeigen die Rolle eines Worts im Satz. Sie stehen hinter dem Wort, das sie markieren. Hier schon einmal ein Vorgeschmack, ganz ohne Druck.</p></div>` })]; }
    return [...pre, ...qs];
  });
  add('Satz ordnen', '🔀', () => {
    const pool = sents.filter(s => sentTokens(s).length >= 2);
    return taker(pool)(3).map(s => orderQ({ prompt: `Bilde den Satz: <b>${esc(s.de)}</b>`, tokens: sentTokens(s), answer: s.s }));
  });
  add('Grammatik', '📘', () => {
    const g = l.grammar;
    return [infoQ({ title: g.title, html: `<div class="card"><h3>${esc(g.title)}</h3>${g.body.map(b => `<p>${esc(b)}</p>`).join('')}<div class="examples">${g.ex.map(e => `<div class="ex"><span class="jp">${P.html(e[0], S.settings.furigana)}</span>${playBtn(P.reading(e[0]))}<div class="muted">${esc(e[1])}</div></div>`).join('')}</div></div>` }),
      choiceQ({ err: 'general', title: 'Kurz überprüft', prompt: esc(g.check.q), options: g.check.o.map((x, i) => ({ h: /[ぁ-ん一-龥]/.test(x) && x.length < 12 ? `<span class="jp">${esc(x)}</span>` : esc(x), ok: i === g.check.a })) })];
  });
  add('Übersetzen', '✍️', () => taker(sents)(2).map(s => typeQ({ err: 'translate', title: 'Übersetzen', prompt: `<div class="big-de">${esc(s.de)}</div><div class="muted center">Schreibe den Satz auf Japanisch (Romaji oder Kana). Partikel wie は kannst du „wa“ oder „ha“ schreiben.</div>`, answers: sentVariants(s), show: P.reading(s.s), placeholder: 'Satz tippen', explain: `<span class="jp">${P.html(s.s, S.settings.furigana)}</span>` })));
  add('Nachsprechen', '🎤', () => {
    const w = T(2).map(id => itemQ(id, 'speak'));
    const s = taker(sents)(1).map(s => speakQ({ title: 'Satz nachsprechen', html: `<span class="jp">${P.html(s.s, S.settings.furigana)}</span>`, say: sentReading(s), alt: [P.surface(s.s)], de: s.de, strict: 0.75 }));
    return [...w, ...s];
  });
  add('Ähnliche Laute', '🎧', () => minimalPairQs(3, l));
  add('Lesetext', '📰', () => {
    const r = l.reading;
    return [infoQ({ title: 'Lesetext', html: `<div class="card"><h3>Lies den Text</h3><div class="readtext">${r.lines.map(x => `<div class="jp">${P.html(x, S.settings.furigana)}</div>`).join('')}</div>${playBtn(r.lines.map(P.reading).join('。'))}<details><summary>Übersetzung zeigen</summary><p>${esc(r.de)}</p></details></div>` }),
      ...r.q.map(q => choiceQ({ err: 'read', title: 'Verständnis', prompt: esc(q.q), options: q.o.map((x, i) => ({ h: esc(x), ok: i === q.a })) }))];
  });
  add('Hörtext', '🔊', () => l.listen.q.map(q => choiceQ({ err: 'hear', title: 'Hörverständnis', prompt: `Höre den Text und beantworte die Frage:<br><b>${esc(q.q)}</b>`, audio: l.listen.text, slow: true, options: q.o.map((x, i) => ({ h: esc(x), ok: i === q.a })), explain: `<span class="jp">${P.html(l.listen.text, S.settings.furigana)}</span><br><span class="muted">${esc(l.listen.de)}</span>` })));
  add('Rollenspiel', '💬', () => [dialogQ(l.dialog)]);
  add('Fehler wiederholen', '🎯', () => missedQs(ctx, () => T(3).map(id => itemQ(id, nextMode(id) === 'speak' ? 'type' : nextMode(id)))));
  slots.ctx = ctx;
  return slots;
}

function minimalPairQs(n, l) {
  const start = rnd(PAIRS.length);
  const pairs = []; for (let i = 0; i < n; i++) pairs.push(PAIRS[(start + i) % PAIRS.length]);
  return pairs.map(p => {
    const first = Math.random() < 0.5; const w = first ? p[0] : p[2];
    return choiceQ({ err: 'hear', title: 'Welches Wort hörst du?', prompt: 'Ähnliche Laute: Welches Wort hörst du?', audio: w, slow: true,
      options: [{ h: `<span class="jp">${esc(p[0])}</span><small class="sub">${esc(p[1])}</small>`, ok: first }, { h: `<span class="jp">${esc(p[2])}</span><small class="sub">${esc(p[3])}</small>`, ok: !first }],
      explain: `${esc(p[0])} (${esc(p[1])}) ≠ ${esc(p[2])} (${esc(p[3])}). Achte auf Länge der Vokale und das kleine っ.` });
  });
}

function kanaSlots(l) {
  const K = kanaCtx(l);
  const ctx = { lessonIds: new Set(lessonItems(l)), missed: [] };
  const curIds = K.cur.map(c => 'ka:' + c.ch);
  const T = taker(curIds);
  const slots = []; const add = (name, icon, build) => slots.push({ name, icon, build });
  const wordsT = taker(K.words.length ? K.words : [{ k: 'あい', de: 'Liebe' }]);
  const kPool = K.pool;
  add('Aufwärmen', '🔥', () => warmupQs(l, ctx));
  add('Zeichen kennenlernen', '🆕', () => [infoQ({ title: 'Zeichen kennenlernen', html: `<div class="card"><h3>${esc(l.title)}</h3><p class="muted">Tippe auf ein Zeichen, um es zu hören.</p>${l.groups.map(g => { const G_ = ALL_GROUPS.find(x => x.id === g); return `<h4>${esc(G_.name)}</h4><div class="kgrid">${G_.chars.map(c => `<button class="kcell" data-say="${esc(c.ch)}"><span class="jp big">${esc(c.ch)}</span><small>${esc(c.ro)}</small></button>`).join('')}</div>`; }).join('')}</div>` })]);
  add('Zuordnen', '🔗', () => [matchQ({ prompt: 'Ordne Zeichen und Lesung zu.', pairs: T(5).map(id => { const it = Items[id]; return { a: `<span class="jp big">${esc(it.ch)}</span>`, b: esc(it.ro), id, say: it.ch }; }) })]);
  add('Zeichen lesen', '👁️', () => T(5).map(id => itemQ(id, 'read', kPool)));
  add('Lesung → Zeichen', '🔤', () => T(4).map(id => { const it = Items[id]; const ds = kanaDists(it.ch, 3, kPool); return choiceQ({ id, mode: 'read', err: 'kana', title: 'Welches Zeichen?', prompt: `Welches Zeichen ist <b>${esc(it.ro)}</b>?`, grid: true, bigOpt: true, audio: it.ch, autoplay: false, options: [it, ...ds.map(c => Items['ka:' + c])].map(x => ({ h: `<span class="jp big">${esc(x.ch)}</span>`, ok: x === it, id: x.id })) }); }));
  add('Hören und wählen', '👂', () => T(5).map(id => itemQ(id, 'hear', kPool)));
  add('Hören und tippen', '⌨️', () => T(4).map(id => { const it = Items[id]; return typeQ({ id, mode: 'type', err: 'hear', title: 'Diktat', prompt: 'Höre zu und tippe die Lesung.', audio: it.ch, placeholder: 'Romaji', answers: [it.ro, ...(RO_ALT[it.ro] || [])].map(romajiToKana).concat([it.ch]), show: it.ro, explain: `${esc(it.ch)} = ${esc(it.ro)}`, accept: v => v.toLowerCase() === it.ro || (RO_ALT[it.ro] || []).includes(v.toLowerCase()) }); }));
  add('Wörter lesen', '📖', () => { const ws = K.words.length >= 3 ? wordsT(4) : []; if (!ws.length) return T(4).map(id => itemQ(id, 'read', kPool)); return ws.map(w => { const ds = shuffle(KWORDS.filter(x => x.de !== w.de)).slice(0, 3); return choiceQ({ err: 'read', title: 'Wort lesen', prompt: `<div class="big-jp">${esc(w.k)}</div><div class="muted center">Was bedeutet das Wort?</div>`, audio: w.k, autoplay: false, options: [w, ...ds].map(x => ({ h: esc(x.de), ok: x === w })), explain: `${esc(w.k)} (${esc(romaOf(w.k))}) = ${esc(w.de)}` }); }); });
  add('Verwechslungen', '⚠️', () => {
    const groups = KANA_SIM.map(g => g.filter(c => Items['ka:' + c] && kPool.includes(c))).filter(g => g.length >= 2);
    const inCur = groups.filter(g => g.some(c => K.cur.some(x => x.ch === c)));
    const pool = inCur.length ? inCur : groups;
    if (!pool.length) return T(4).map(id => itemQ(id, 'hear', kPool));
    return Array.from({ length: 4 }, (_, i) => { const g = pool[i % pool.length]; const c = g[rnd(g.length)]; const it = Items['ka:' + c];
      return choiceQ({ id: it.id, mode: 'read', err: 'kana', title: 'Ähnliche Zeichen', prompt: `Welches Zeichen ist <b>${esc(it.ro)}</b>? Pass auf, sie sehen ähnlich aus!`, grid: true, bigOpt: true, audio: it.ch, autoplay: false, options: g.map(x => ({ h: `<span class="jp big">${esc(x)}</span>`, ok: x === c })), explain: `${esc(c)} = ${esc(it.ro)}` }); });
  });
  add('Eintippen', '✏️', () => T(4).map(id => itemQ(id, 'type', kPool)));
  add('Wort bauen', '🧱', () => { const ws = K.words.filter(w => splitKana(w.k).length >= 3 && splitKana(w.k).length <= 5); if (ws.length < 2) return T(3).map(id => itemQ(id, 'hear', kPool)); return taker(ws)(3).map(w => orderQ({ prompt: `Baue das Wort aus den Zeichen: <b>${esc(w.de)}</b>`, tokens: splitKana(w.k), answer: w.k })); });
  add('Merkhilfen', '💡', () => [infoQ({ title: 'Merkhilfen', html: `<div class="card"><h3>Worauf du achten solltest</h3>${l.tips.map(t => `<p>${esc(t)}</p>`).join('')}</div>` }), ...T(1).map(id => itemQ(id, 'read', kPool))]);
  add('Lesung → Eintippen', '⌨️', () => T(4).map(id => { const it = Items[id]; return typeQ({ id, mode: 'type', err: 'kana', title: 'Zeichen schreiben', prompt: `Tippe das Zeichen für <b>${esc(it.ro)}</b>`, audio: it.ch, autoplay: false, placeholder: 'Romaji eintippen', answers: [it.ch], show: it.ch, explain: `${esc(it.ch)} = ${esc(it.ro)}` }); }));
  add('Nachsprechen', '🎤', () => { const ws = K.words.length ? wordsT(2) : []; const cs = T(2).map(id => { const it = Items[id]; return speakQ({ id, html: `<span class="jp big">${esc(it.ch)}</span>`, say: it.ch, de: it.ro }); }); return [...cs, ...ws.map(w => speakQ({ title: 'Wort nachsprechen', html: `<span class="jp big">${esc(w.k)}</span>`, say: w.k, de: w.de }))]; });
  add('Ähnliche Laute', '🎧', () => {
    const okP = PAIRS.filter(p => [...(p[0] + p[2])].every(c => K.learned.has(c)));
    if (okP.length >= 2) return taker(okP)(3).map(p => { const first = Math.random() < 0.5; const w = first ? p[0] : p[2]; return choiceQ({ err: 'hear', title: 'Welches Wort hörst du?', prompt: 'Ähnliche Laute: Welches Wort hörst du?', audio: w, slow: true, options: [{ h: `<span class="jp">${esc(p[0])}</span><small class="sub">${esc(p[1])}</small>`, ok: first }, { h: `<span class="jp">${esc(p[2])}</span><small class="sub">${esc(p[3])}</small>`, ok: !first }], explain: `${esc(p[0])} (${esc(p[1])}) ≠ ${esc(p[2])} (${esc(p[3])})` }); });
    return T(4).map(id => itemQ(id, 'hear', kPool));
  });
  add('Wörter zuordnen', '🧩', () => { const ws = taker(K.words)(5); if (ws.length < 3) return T(3).map(id => itemQ(id, 'read', kPool)); return [matchQ({ prompt: 'Ordne die Wörter ihrer Bedeutung zu.', pairs: ws.map(w => ({ a: `<span class="jp">${esc(w.k)}</span>`, b: esc(w.de), say: w.k })) })]; });
  add('Hörwörter', '🔊', () => { const ws = K.words.length >= 3 ? wordsT(3) : []; if (!ws.length) return T(3).map(id => itemQ(id, 'hear', kPool)); return ws.map(w => { const ds = shuffle(KWORDS.filter(x => x.de !== w.de && x.k !== w.k)).slice(0, 3); return choiceQ({ err: 'hear', title: 'Hörverständnis', prompt: 'Was bedeutet das Wort, das du hörst?', audio: w.k, slow: true, options: [w, ...ds].map(x => ({ h: esc(x.de), ok: x === w })), explain: `${esc(w.k)} = ${esc(w.de)}` }); }); });
  add('Schnellrunde', '⚡', () => T(6).map((id, i) => itemQ(id, ['read', 'hear', 'type'][i % 3], kPool)));
  add('Fehler wiederholen', '🎯', () => missedQs(ctx, () => T(3).map(id => itemQ(id, 'hear', kPool))));
  slots.ctx = ctx;
  return slots;
}
