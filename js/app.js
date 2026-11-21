'use strict';
/* ===== App: Navigation, Lektions-Player, Ansichten ===== */
const view = () => $('#view');
let TAB = 'today', SUB = null, RUN = null;

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
function pct(x) { return Math.round(x * 100); }

/* ---------- Fortschritts-Hilfen ---------- */
const lessonDone = id => !!(S.lessons[id] && S.lessons[id].done);
const isSkipped = id => !!(S.placement && (S.placement.skipped || []).includes(id));
const nextLesson = () => { for (const u of UNITS) for (const id of u.lessons) if (!lessonDone(id) && !isSkipped(id)) return LESSON_BY_ID[id]; return null; };
const totalSec = () => Object.values(S.days).reduce((a, d) => a + (d.sec || 0), 0);
const fmtTime = sec => { const m = Math.round(sec / 60); return m < 60 ? `${m} Min` : `${Math.floor(m / 60)} Std ${m % 60} Min`; };
const totalPoints = () => Object.values(S.lessons).filter(x => x.done).length;
function deckStats(filter) {
  const ids = Object.keys(Items).filter(id => filter(Items[id]));
  let seen = 0, mast = 0, due = 0;
  ids.forEach(id => { if (S.items[id]) seen++; if (S.items[id] && S.items[id].mastered) mast++; if (isDue(id)) due++; });
  return { total: ids.length, seen, mast, due, ids };
}
function stats() {
  const all = Object.values(Items).filter(x => x.kind !== 'kana' || true);
  const w = deckStats(i => i.kind === 'word'), k = deckStats(i => i.kind === 'kanji'), ka = deckStats(i => i.kind === 'kana');
  return { w, k, ka, due: dueList().length };
}

/* ---------- Player ---------- */
function playerShell(title) {
  view().innerHTML = `<div class="player">
    <div class="ptop"><button class="x" aria-label="Beenden">✕</button><div class="pbar"><i></i></div><span class="pcount"></span></div>
    <div class="ptitle"></div><div class="qhost"></div><div class="pfoot"></div></div>`;
  $('#nav').style.display = 'none';
}
function leavePlayer() { $('#nav').style.display = ''; Voice.stopListening(); try { speechSynthesis.cancel(); } catch (e) { /* ignorieren */ } }

/* Führt eine Liste Fragen nacheinander aus. cb(stats) am Ende. */
function runQuestions(qs, opt, cb) {
  let i = 0; const host = $('.qhost'), foot = $('.pfoot');
  const nextQ = () => {
    foot.innerHTML = ''; host.dataset.done = ''; host.scrollTop = 0; window.scrollTo(0, 0);
    if (i >= qs.length) return cb();
    const q = qs[i]; let t0 = NOW(); let answered = false;
    $('.ptitle').innerHTML = `<span>${esc(opt.label || '')}</span><small>${esc(q.title || '')}${qs.length > 1 ? ` · ${i + 1}/${qs.length}` : ''}</small>`;
    host.innerHTML = '';
    const showNext = () => { foot.innerHTML += `<button class="btn primary big next">${i === qs.length - 1 ? 'Weiter' : 'Weiter'}</button>`; const n = $('.next', foot); n.onclick = () => { i++; nextQ(); }; try { n.focus(); } catch (e) { /* ignorieren */ } };
    const api = {
      result(ok, o = {}) {
        if (answered) return; answered = true;
        const dt = Math.min(40, (NOW() - t0) / 1000); touchDay({ sec: dt });
        opt.onResult && opt.onResult(ok, o);
        const bar = document.createElement('div'); bar.className = 'fb ' + (ok ? 'ok' : 'bad');
        bar.innerHTML = `<b>${ok ? ['Richtig!', 'Genau!', 'Sehr gut!', 'Stimmt!'][rnd(4)] : 'Nicht ganz.'}</b> <span class="fbm">${o.msg || ''}</span>`;
        foot.innerHTML = ''; foot.appendChild(bar); bindSay(foot); showNext();
      },
      proceed(label) { foot.innerHTML = ''; showNext(); if (label) $('.next', foot).textContent = label; },
      finish() { i++; nextQ(); },
    };
    try { q.render(host, api); } catch (e) { console.error(e); host.innerHTML = `<div class="card">Fehler in dieser Übung (${esc(e.message)}). Sie wird übersprungen.</div>`; api.proceed('Weiter'); }
  };
  nextQ();
}
function bindX(onQuit) { $('.x').onclick = () => { if (confirm('Beenden? Dein Fortschritt dieser Sitzung wird gespeichert.')) { leavePlayer(); onQuit(); } }; }

/* Aufgezeichnete Ergebnisse (Lektion/Sitzung) */
function recorder(ctx) {
  const r = { total: 0, ok: 0 };
  r.onResult = (ok, o) => {
    r.total++; if (ok) r.ok++;
    if (o.multi) o.multi.forEach(id => { const bad = (o.bad || []).includes(id); review(id, !bad, 'mc', 'vocab'); if (bad && ctx) ctx.missed.push(id); });
    else if (o.id) { review(o.id, ok, o.mode || 'mc', o.err); if (!ok && ctx) ctx.missed.push(o.id); if (!ok && o.wrongId && S.items[o.wrongId] === undefined && Items[o.wrongId]) { /* Verwechslung merken */ const s2 = st(o.wrongId); s2.due = Math.min(s2.due || NOW(), NOW() + 5 * MIN); } }
    else if (!ok) { const e = o.err || 'general'; S.errors[e] = (S.errors[e] || 0) + 1; Store.save(); }
    Store.save();
  };
  return r;
}

/* ---------- Lektion starten ---------- */
function startLesson(id, resumeSlot) {
  const l = LESSON_BY_ID[id]; const slots = buildSlots(l); const ctx = slots.ctx;
  const rec = recorder(ctx);
  const resume = S.resume && S.resume.id === id ? S.resume : null;
  let si = resumeSlot != null ? resumeSlot : (resume ? resume.slot : 0);
  if (resume && resumeSlot == null) { rec.total = resume.total; rec.ok = resume.ok; }
  playerShell(l.title);
  bindX(() => { S.resume = { id, slot: si, total: rec.total, ok: rec.ok }; Store.save(); go('path'); });
  const runSlot = () => {
    if (si >= slots.length) return finishLesson(l, rec);
    const s = slots[si];
    $('.pbar i').style.width = pct(si / slots.length) + '%'; $('.pcount').textContent = `${si + 1}/${slots.length}`;
    let qs; try { qs = s.build().filter(Boolean); } catch (e) { console.error(e); qs = []; }
    if (!qs.length) { si++; return runSlot(); }
    runQuestions(qs, { label: `${s.icon} ${s.name}`, onResult: rec.onResult }, () => { si++; S.resume = { id, slot: si, total: rec.total, ok: rec.ok }; Store.save(); runSlot(); });
  };
  runSlot();
}
function finishLesson(l, rec) {
  leavePlayer(); S.resume = null;
  const acc = rec.total ? rec.ok / rec.total : 1; const passed = acc * 100 >= S.settings.minAcc;
  const prev = S.lessons[l.id] || {}; const firstTime = passed && !prev.done;
  S.lessons[l.id] = { done: prev.done || passed, acc: Math.max(prev.acc || 0, acc), last: acc, tries: (prev.tries || 0) + 1, date: dayKey() };
  touchDay({ lessons: passed ? 1 : 0 }); Store.save();
  const nl = nextLesson();
  view().innerHTML = `<div class="done">
    <div class="trophy">${passed ? (firstTime ? '🏆' : '✅') : '💪'}</div>
    <h2>${passed ? 'Lektion geschafft!' : 'Fast geschafft'}</h2>
    <p class="big">${rec.ok} von ${rec.total} richtig (${pct(acc)} %)</p>
    ${passed ? `<p>${firstTime ? '<b>+1 Punkt</b> · ' : ''}Gesamt: <b>${totalPoints()}</b> Punkte</p>` : `<p>Für den Punkt brauchst du mindestens ${S.settings.minAcc} %. Die schwierigen Wörter kommen bald zur Wiederholung. Versuche die Lektion nochmal.</p>`}
    <div class="stack"><button class="btn primary big" data-a="home">Zum Lernpfad</button>
    ${passed && nl ? `<button class="btn big" data-a="next">Nächste Lektion: ${esc(nl.title)}</button>` : ''}
    ${!passed ? `<button class="btn big" data-a="again">Nochmal versuchen</button>` : ''}</div></div>`;
  $('[data-a=home]').onclick = () => go('path');
  const n = $('[data-a=next]'); if (n) n.onclick = () => startLesson(nl.id);
  const a = $('[data-a=again]'); if (a) a.onclick = () => startLesson(l.id, 0);
}

/* ---------- Freie Übungs-Sitzungen ---------- */
function startSession(title, ids, o = {}) {
  ids = ids.filter(id => Items[id]);
  if (!ids.length) { toast('Gerade nichts zu üben.'); return; }
  const rec = recorder({ missed: [] });
  const qs = ids.slice(0, o.max || 12).map(id => itemQ(id, o.mode && MODES_BY_KIND[Items[id].kind].includes(o.mode) ? o.mode : undefined));
  playerShell(title); $('.pbar').style.display = 'none';
  bindX(() => go(TAB));
  runQuestions(qs, { label: title, onResult: rec.onResult }, () => {
    leavePlayer();
    view().innerHTML = `<div class="done"><div class="trophy">🎉</div><h2>${esc(title)} fertig</h2><p class="big">${rec.ok} von ${rec.total} richtig</p>
      <div class="stack"><button class="btn primary big" data-a="more">${ids.length > (o.max || 12) ? 'Weiter üben' : 'Fertig'}</button></div></div>`;
    $('[data-a=more]').onclick = () => { if (o.again && ids.length > (o.max || 12)) startSession(title, o.again(), o); else go(TAB); };
  });
}
function reviewSession() { const ids = shuffle(dueList()); startSession('Wiederholung', ids, { max: 12, again: () => shuffle(dueList()) }); }
function weakSession() { startSession('Schwächen üben', weakList().slice(0, 40), { max: 10 }); }
function deckSession(filter, title) {
  const ids = Object.keys(Items).filter(id => filter(Items[id]));
  const rank = id => { const s = S.items[id]; return !s ? 0.5 : (isDue(id) ? 0 : (s.mastered ? 3 : 1)); };
  const sorted = shuffle(ids).sort((a, b) => rank(a) - rank(b)).filter(id => !S.items[id] || !S.items[id].mastered || isDue(id));
  startSession(title, sorted.length ? sorted : shuffle(ids), { max: 12 });
}

/* ---------- Einstufungstest ---------- */
function startPlacement() {
  RT.place = true;
  const pick2 = (arr, n) => pick(arr, n);
  const hira = pick2(Object.values(Items).filter(i => i.kind === 'kana' && i.script === 'h' && !/c\d/.test(i.group)), 10).map(i => i.id);
  const kata = pick2(Object.values(Items).filter(i => i.kind === 'kana' && i.script === 'k' && !/c\d|-x/.test(i.group)), 8).map(i => i.id);
  const words = []; ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].forEach(c => words.push(...pick2(Object.values(Items).filter(i => i.kind === 'word' && i.lesson === c && i.kana.length > 1), 2).map(i => i.id)));
  const kanji = pick2(Object.values(Items).filter(i => i.kind === 'kanji'), 4).map(i => i.id);
  const ids = [...hira, ...kata, ...words, ...kanji];
  const rec = { right: [], wrong: [] }; const qs = ids.map(id => { const k = Items[id].kind; return itemQ(id, k === 'kana' ? 'read' : k === 'word' ? 'mc' : 'read'); });
  playerShell('Einstufungstest'); $('.pbar').style.display = 'none';
  bindX(() => { RT.place = false; go('today'); });
  runQuestions(qs, { label: 'Einstufungstest', onResult: (ok, o) => { (ok ? rec.right : rec.wrong).push(o.id); } }, () => {
    RT.place = false; leavePlayer();
    rec.right.forEach(id => { const s = st(id); s.ok[MODES_BY_KIND[Items[id].kind][0]] = 2; s.reps = 2; s.ivl = 4; s.step = 2; s.due = NOW() + 4 * DAY; s.seen = 1; });
    rec.wrong.forEach(id => { const s = st(id); s.due = NOW(); s.lapses = 1; s.seen = 1; });
    S.placement = { date: dayKey(), hira: rec.right.filter(i => /^ka:[ぁ-ゖ]/.test(i)).length + '/' + hira.length, kata: rec.right.filter(i => /^ka:[ァ-ヶ]/.test(i)).length + '/' + kata.length, words: rec.right.filter(i => i.startsWith('w:')).length + '/' + words.length, kanji: rec.right.filter(i => i.startsWith('kj:')).length + '/' + kanji.length };
    S.onboarded = true;
    /* Empfehlung: erste Lektion im Pfad, die noch nicht sicher sitzt */
    const okSet = new Set(rec.right);
    const hiraOk = rec.right.filter(i => /^ka:[ぁ-ゖ]/.test(i)).length / hira.length, kataOk = rec.right.filter(i => /^ka:[ァ-ヶ]/.test(i)).length / kata.length;
    const known = id => { const l = LESSON_BY_ID[id]; if (l.type === 'kana') return (l.groups[0].startsWith('h-') ? hiraOk : kataOk) >= 0.8; const t = words.filter(w => Items[w].lesson === id); return t.length > 0 && t.every(w => okSet.has(w)); };
    const order = UNITS.flatMap(u => u.lessons); let first = order.find(id => !known(id)) || order[order.length - 1];
    const skipIds = order.slice(0, order.indexOf(first));
    S.placement.rec = first; S.placement.skipCandidates = skipIds; S.placement.skipped = []; Store.save();
    const p = S.placement, fl = LESSON_BY_ID[first];
    const hints = [];
    if (hiraOk < 0.8) hints.push('Hiragana sitzt noch nicht sicher: Die Kana-Lektionen helfen dir am meisten.');
    if (kataOk < 0.8) hints.push('Katakana braucht noch Übung.');
    if (p.kanji.startsWith('0/') || p.kanji.startsWith('1/')) hints.push('Kanji sind für dich noch neu, das ist völlig normal.');
    view().innerHTML = `<div class="done"><div class="trophy">📊</div><h2>Einstufung abgeschlossen</h2>
      <div class="card"><div class="kv"><span>Hiragana</span><b>${p.hira}</b></div><div class="kv"><span>Katakana</span><b>${p.kata}</b></div><div class="kv"><span>Wörter</span><b>${p.words}</b></div><div class="kv"><span>Kanji</span><b>${p.kanji}</b></div></div>
      <div class="card"><h3>Empfehlung</h3>${skipIds.length ? `<p>Starte bei <b>${esc(fl.title)}</b>. Die ${skipIds.length} Lektion(en) davor hast du im Test überwiegend richtig beantwortet.</p>` : `<p>Starte ganz vorne bei <b>${esc(fl.title)}</b>.`}</p>${hints.map(h => `<p class="muted">${esc(h)}</p>`).join('')}
      <p class="muted small">Der Test prüft nur wenige Elemente und ist deshalb vorsichtig gewertet. Übersprungene Lektionen bleiben jederzeit startbar, und ihre Wörter kommen in den nächsten Tagen zur Wiederholung, damit sich Lücken zeigen.</p></div>
      <div class="stack">${skipIds.length ? `<button class="btn primary big" data-a="apply">Empfehlung übernehmen</button><button class="btn big" data-a="go">Trotzdem ganz vorne anfangen</button>` : `<button class="btn primary big" data-a="go">Los geht's</button>`}</div></div>`;
    const apply = $('[data-a=apply]');
    if (apply) apply.onclick = () => {
      S.placement.skipped = skipIds.slice();
      skipIds.forEach(id => lessonItems(LESSON_BY_ID[id]).forEach(iid => { if (!S.items[iid]) { const x = st(iid); x.step = 1; x.due = NOW() + (1 + rnd(5)) * DAY; } }));
      Store.save(); go('today');
    };
    $('[data-a=go]').onclick = () => go('today');
  });
}

/* ---------- Schnelltest pro Lektion ---------- */
function startTestOut(id) {
  const l = LESSON_BY_ID[id];
  if (!confirm(`Schnelltest „${l.title}“: etwa 16 gemischte Fragen. Ab 85 % gilt die Lektion als geschafft (+1 Punkt). Starten?`)) return;
  const ids = pick(lessonItems(l), 16);
  const modes = { kana: ['read', 'hear', 'type'], word: ['mc', 'mcr', 'hear', 'type'], kanji: ['read', 'mc'] };
  const rec = recorder({ missed: [] });
  const qs = ids.map((iid, i) => { const k = Items[iid].kind; const list = modes[k]; return itemQ(iid, list[i % list.length]); });
  playerShell('Schnelltest'); $('.pbar').style.display = 'none';
  bindX(() => go('path'));
  runQuestions(qs, { label: `⏩ Schnelltest · ${l.title}`, onResult: rec.onResult }, () => {
    leavePlayer(); const acc = rec.total ? rec.ok / rec.total : 0, passed = acc >= 0.85;
    const prev = S.lessons[id] || {}, first = passed && !prev.done;
    if (passed) { S.lessons[id] = { done: true, acc: Math.max(prev.acc || 0, acc), last: acc, tries: (prev.tries || 0) + 1, date: dayKey(), quick: true }; touchDay({ lessons: 1 }); }
    Store.save();
    view().innerHTML = `<div class="done"><div class="trophy">${passed ? '⏩' : '💪'}</div><h2>${passed ? 'Lektion übersprungen und geschafft' : 'Noch nicht ganz'}</h2><p class="big">${rec.ok} von ${rec.total} richtig (${pct(acc)} %)</p>
      <p>${passed ? (first ? '<b>+1 Punkt</b>. Die Wörter kommen weiter in der Wiederholung vor.' : 'Die Lektion war schon geschafft.') : 'Für den Schnelltest braucht es 85 %. Mach am besten die ganze Lektion, dann sitzt es sicher.'}</p>
      <div class="stack"><button class="btn primary big" data-a="home">Zum Lernpfad</button>${passed ? '' : `<button class="btn big" data-a="les">Lektion starten</button>`}</div></div>`;
    $('[data-a=home]').onclick = () => go('path'); const b = $('[data-a=les]'); if (b) b.onclick = () => startLesson(id, 0);
  });
}

/* ---------- Ansichten ---------- */
function ring(frac, label, sub) {
  const r = 42, c = 2 * Math.PI * r, f = Math.min(1, frac);
  return `<div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" class="bg"/><circle cx="50" cy="50" r="${r}" class="fg" style="stroke-dasharray:${c};stroke-dashoffset:${c * (1 - f)}"/></svg><div class="rl"><b>${label}</b><small>${sub}</small></div></div>`;
}
function viewToday() {
  touchDay(); const d = S.days[dayKey()]; const st_ = stats(); const nl = nextLesson();
  const mins = Math.round((d.sec || 0) / 60);
  const goal = S.settings.dailyGoal;
  const weakTypes = Object.entries(S.errors).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const resume = S.resume && LESSON_BY_ID[S.resume.id];
  view().innerHTML = `
    <div class="hello"><div><h1>${new Date().getHours() < 11 ? 'おはよう' : new Date().getHours() < 18 ? 'こんにちは' : 'こんばんは'}</h1><p class="muted">Heute ${mins} von ${goal} Minuten · Gesamt ${fmtTime(totalSec())}</p></div>
      <div class="chips-top"><span class="pill">🔥 ${S.streak}</span><span class="pill">⭐ ${totalPoints()}</span></div></div>
    ${ring(mins / goal, `${mins}′`, 'Tagesziel')}
    <div class="stack">
      ${resume ? `<button class="card action" data-a="resume"><span class="ico">▶️</span><div><b>Lektion fortsetzen</b><small>${esc(resume.title)} · Übung ${S.resume.slot + 1}/19</small></div></button>` : ''}
      <button class="card action ${st_.due ? 'hot' : ''}" data-a="review"><span class="ico">🔁</span><div><b>Wiederholen</b><small>${st_.due ? st_.due + ' fällig' : 'Nichts fällig, gut gemacht'}</small></div></button>
      ${nl ? `<button class="card action" data-a="lesson"><span class="ico">${nl.icon}</span><div><b>Nächste Lektion</b><small>${esc(nl.title)}</small></div></button>` : `<div class="card">🎉 Alle Lektionen dieser Version geschafft. Weitere folgen.</div>`}
      <button class="card action" data-a="weak"><span class="ico">🎯</span><div><b>Schwächen üben</b><small>${weakList().length} Elemente brauchen Aufmerksamkeit</small></div></button>
      ${S.onboarded ? '' : `<button class="card action" data-a="place"><span class="ico">📊</span><div><b>Einstufungstest</b><small>2 Minuten, damit die App dein Niveau kennt</small></div></button>`}
    </div>
    <h3>Dein Stand</h3>
    <div class="grid3"><div class="stat"><b>${st_.w.mast}</b><small>Wörter gemeistert</small></div><div class="stat"><b>${st_.ka.mast}</b><small>Kana gemeistert</small></div><div class="stat"><b>${st_.k.mast}</b><small>Kanji gemeistert</small></div></div>
    ${weakTypes.length ? `<h3>Häufigste Fehler</h3><div class="card">${weakTypes.map(([k, v]) => `<div class="kv"><span>${esc(ERR_LABEL[k] || k)}</span><b>${v}</b></div>`).join('')}</div>` : ''}
    <p class="muted center small">Die erste Lektion dauert etwa 12–15 Minuten. Kurze Sitzungen jeden Tag bringen mehr als lange am Wochenende.</p>`;
  $$('[data-a]').forEach(b => b.onclick = () => ({ review: reviewSession, weak: weakSession, place: startPlacement, lesson: () => startLesson(nl.id), resume: () => startLesson(S.resume.id) })[b.dataset.a]());
}

function viewPath() {
  const nl = nextLesson();
  view().innerHTML = `<h1>Lernpfad</h1><p class="muted">⭐ ${totalPoints()} von ${LESSONS.length} Lektionen · jede Lektion = 19 Übungen · ⏩ = Schnelltest zum Überspringen</p>` + UNITS.map(u => `
    <div class="unit"><h3>${esc(u.title)}</h3><p class="muted small">${esc(u.desc)}</p>
      <div class="lessons">${u.lessons.map(id => { const l = LESSON_BY_ID[id]; const d = S.lessons[id]; const cur = nl && nl.id === id;
        const sk = isSkipped(id) && !(d && d.done);
        return `<div class="lesson-wrap"><button class="lesson ${d && d.done ? 'done' : ''} ${cur ? 'current' : ''} ${sk ? 'skipped' : ''}" data-l="${id}"><span class="li">${esc(l.icon)}</span><div><b>${esc(l.title)}</b><small>${l.type === 'kana' ? esc(l.sub) : l.words.length + ' Wörter' + (l.kanji ? ' · ' + l.kanji.length + ' Kanji' : '')}</small></div><span class="st">${d && d.done ? '⭐ ' + pct(d.acc) + '%' : sk ? '⏭ übersprungen' : cur ? '▶' : ''}</span></button>${d && d.done ? '' : `<button class="quick" data-q="${id}" aria-label="Schnelltest" title="Schnelltest: Lektion überspringen">⏩</button>`}</div>`; }).join('')}</div></div>`).join('')
    + `<p class="muted center small">Weitere Einheiten (Verben, Wünsche, Gründe, längere Gespräche) folgen in den nächsten Ausbaustufen.</p>`;
  $$('[data-q]').forEach(b => b.onclick = () => startTestOut(b.dataset.q));
  $$('[data-l]').forEach(b => b.onclick = () => { const id = b.dataset.l; if (S.resume && S.resume.id === id && confirm('Fortsetzen, wo du aufgehört hast?\n(OK = fortsetzen, Abbrechen = neu starten)')) startLesson(id); else { if (S.resume && S.resume.id === id) S.resume = null; startLesson(id, 0); } });
}

function bar(f) { return `<div class="mbar"><i style="width:${pct(f)}%"></i></div>`; }
function viewCards() {
  if (SUB && SUB.deck) return viewDeck(SUB.deck);
  const decks = [
    { name: 'Hiragana', icon: 'あ', f: i => i.kind === 'kana' && i.script === 'h' },
    { name: 'Katakana', icon: 'ア', f: i => i.kind === 'kana' && i.script === 'k' },
    ...DECKS.map(d => ({ name: d.name, icon: d.icon, f: i => i.kind === 'word' && i.deck === d.name })),
  ];
  const all = deckStats(i => i.kind === 'word');
  view().innerHTML = `<h1>Karteikarten</h1><p class="muted">${all.mast} von ${all.total} Wörtern gemeistert · ${all.due} fällig</p>
    <div class="stack"><button class="btn primary big" data-a="due">Fällige Karten üben (${dueList().length})</button></div>
    ${decks.map((d, i) => { const s = deckStats(d.f); const m = s.total ? s.ids.reduce((a, id) => a + mastery(id), 0) / s.total : 0; return `<button class="card action deck" data-d="${i}"><span class="ico">${esc(d.icon)}</span><div><b>${esc(d.name)}</b><small>${s.seen}/${s.total} gesehen · ${s.mast} gemeistert${s.due ? ' · ' + s.due + ' fällig' : ''}</small>${bar(m)}</div></button>`; }).join('')}
    <p class="muted small">Ein Wort gilt als gemeistert, wenn es ${S.settings.mastery}× richtig war, in mindestens drei verschiedenen Formen (Erkennen, Hören, Tippen, Sprechen). Die Zahl stellst du unter „Mehr → Einstellungen“ ein.</p>`;
  $('[data-a=due]').onclick = reviewSession;
  $$('[data-d]').forEach(b => b.onclick = () => { SUB = { deck: decks[+b.dataset.d] }; viewCards(); });
}
function viewDeck(d) {
  const ids = Object.keys(Items).filter(id => d.f(Items[id]));
  view().innerHTML = `<div class="back"><button class="btn ghost" data-a="back">‹ Zurück</button></div><h1>${esc(d.icon)} ${esc(d.name)}</h1>
    <div class="stack"><button class="btn primary big" data-a="train">Dieses Deck üben</button></div>
    <div class="list">${ids.map(id => { const it = Items[id]; const m = mastery(id); const s = S.items[id];
      const head = it.kind === 'kana' ? `<span class="jp big">${esc(it.ch)}</span>` : `<span class="jp">${wordHtml(it)}</span>`;
      const sub = it.kind === 'kana' ? esc(it.ro) : esc(it.de);
      return `<div class="row-item" data-say="${esc(it.kind === 'kana' ? it.ch : it.kana)}"><div class="rh">${head}</div><div class="rs"><b>${sub}</b>${it.kind === 'word' ? `<small>${esc(romaOf(it.kana))}</small>` : ''}${bar(m)}</div><div class="rm ${s && s.mastered ? 'ok' : ''}">${s && s.mastered ? '✔' : pct(m) + '%'}</div></div>`; }).join('')}</div>`;
  bindSay(view());
  $('[data-a=back]').onclick = () => { SUB = null; viewCards(); };
  $('[data-a=train]').onclick = () => deckSession(d.f, d.name);
}

function viewKanji() {
  if (SUB && SUB.kanji) return viewKanjiDetail(SUB.kanji);
  const ks = Object.values(Items).filter(i => i.kind === 'kanji'); const ds = deckStats(i => i.kind === 'kanji');
  view().innerHTML = `<h1>Kanji</h1><p class="muted">${ds.mast} von ${ds.total} gemeistert · Fokus: Lesen und Verstehen. Tippe ein Zeichen für Bedeutung, Lesungen und Wörter.</p>
    <div class="stack"><button class="btn primary big" data-a="train">Kanji üben</button></div>
    <div class="kgrid big">${ks.map(k => `<button class="kcell ${S.items[k.id] && S.items[k.id].mastered ? 'mast' : S.items[k.id] ? 'seen' : ''}" data-k="${esc(k.c)}"><span class="jp big">${esc(k.c)}</span><small>${esc(k.de)}</small></button>`).join('')}</div>
    <div class="card"><h3>So funktionieren Kanji</h3><p>Ein Kanji hat meist zwei Lesungen: <b>On</b> (chinesischer Ursprung, meist in Wörtern aus mehreren Zeichen: 電車 = でんしゃ) und <b>Kun</b> (japanisch, oft allein mit Hiragana-Endung: 食べる = たべる).</p><p>Zusammengesetzte Wörter ergeben sich aus den Teilen: 電 (Strom) + 車 (Wagen) = 電車 (Zug). 東 (Osten) + 京 (Hauptstadt) = 東京 (Tokio).</p></div>`;
  $('[data-a=train]').onclick = () => deckSession(i => i.kind === 'kanji', 'Kanji');
  $$('[data-k]').forEach(b => b.onclick = () => { SUB = { kanji: b.dataset.k }; viewKanji(); });
}
function viewKanjiDetail(c) {
  const k = Items['kj:' + c]; const s = S.items[k.id];
  view().innerHTML = `<div class="back"><button class="btn ghost" data-a="back">‹ Zurück</button></div>
    <div class="card center"><div class="giant jp">${esc(k.c)}</div><h2>${esc(k.de)}</h2><p><b>On:</b> ${esc(k.on)}${k.kun ? ` &nbsp; <b>Kun:</b> ${esc(k.kun)}` : ''}</p>${k.hint ? `<p class="muted">💡 ${esc(k.hint)}</p>` : ''}${bar(mastery(k.id))}</div>
    <h3>Wörter mit diesem Kanji</h3><div class="list">${k.words.map(w => `<div class="row-item" data-say="${esc(w[1])}"><div class="rh"><span class="jp">${esc(w[0])}</span></div><div class="rs"><b>${esc(w[1])}</b><small>${esc(w[2])}</small></div><div class="rm">🔊</div></div>`).join('')}</div>
    <div class="stack"><button class="btn primary big" data-a="t">Dieses Kanji üben</button></div>`;
  bindSay(view()); $('[data-a=back]').onclick = () => { SUB = null; viewKanji(); };
  $('[data-a=t]').onclick = () => startSession('Kanji ' + k.c, [k.id, k.id, k.id], { max: 3 });
}

/* Mehr: Menü */
function viewMore() {
  if (SUB && SUB.more) return ({ stats: viewStats, kana: viewKanaTable, settings: viewSettings, phrases: viewPhrases, backup: viewBackup })[SUB.more]();
  view().innerHTML = `<h1>Mehr</h1><div class="stack">
    <button class="card action" data-m="stats"><span class="ico">📈</span><div><b>Statistik</b><small>Fortschritt, Fehler, Verlauf</small></div></button>
    <button class="card action" data-m="kana"><span class="ico">あ</span><div><b>Kana-Tabelle</b><small>Hiragana und Katakana mit Lernstand</small></div></button>
    <button class="card action" data-m="phrases"><span class="ico">🧳</span><div><b>Reise-Phrasen</b><small>Wichtige Sätze und Notfälle zum Anhören</small></div></button>
    <button class="card action" data-m="settings"><span class="ico">⚙️</span><div><b>Einstellungen</b><small>Tagesziel, Mastery, Furigana, Sprechtempo</small></div></button>
    <button class="card action" data-m="backup"><span class="ico">💾</span><div><b>Backup</b><small>Lerndaten exportieren und importieren</small></div></button>
    <button class="card action" data-m="place"><span class="ico">📊</span><div><b>Einstufungstest</b><small>Niveau neu bestimmen</small></div></button></div>`;
  $$('[data-m]').forEach(b => b.onclick = () => { if (b.dataset.m === 'place') startPlacement(); else { SUB = { more: b.dataset.m }; viewMore(); } });
}
const backBtn = () => `<div class="back"><button class="btn ghost" data-a="back">‹ Zurück</button></div>`;
const bindBack = () => { $('[data-a=back]').onclick = () => { SUB = null; viewMore(); }; };

function viewStats() {
  const days = []; for (let i = 13; i >= 0; i--) { const k = dayKey(new Date(Date.now() - i * DAY)); days.push({ k, d: S.days[k] || { reviews: 0, correct: 0, sec: 0 } }); }
  const mx = Math.max(60, ...days.map(x => x.d.sec || 0));
  const e = Object.entries(S.errors).sort((a, b) => b[1] - a[1]); const sum = e.reduce((a, b) => a + b[1], 0) || 1;
  const s = stats(); const totRev = Object.values(S.days).reduce((a, d) => a + (d.reviews || 0), 0), totOk = Object.values(S.days).reduce((a, d) => a + (d.correct || 0), 0);
  const weak = weakList().slice(0, 8);
  view().innerHTML = `${backBtn()}<h1>Statistik</h1>
    <div class="grid3"><div class="stat"><b>${S.streak}</b><small>Tage am Stück</small></div><div class="stat"><b>${S.best}</b><small>Rekord</small></div><div class="stat"><b>${totalPoints()}</b><small>Punkte</small></div></div>
    <h3>Lernzeit der letzten 14 Tage</h3><div class="bars">${days.map(x => `<div class="b"><i style="height:${Math.max(3, ((x.d.sec || 0) / mx) * 100)}%"></i><small>${x.k.slice(8)}</small></div>`).join('')}</div>
    <div class="card"><div class="kv"><span>Gesamte Lernzeit</span><b>${fmtTime(totalSec())}</b></div><div class="kv"><span>Antworten insgesamt</span><b>${totRev}</b></div><div class="kv"><span>Davon richtig</span><b>${totRev ? pct(totOk / totRev) : 0} %</b></div><div class="kv"><span>Wörter gemeistert</span><b>${s.w.mast} / ${s.w.total}</b></div><div class="kv"><span>Kana gemeistert</span><b>${s.ka.mast} / ${s.ka.total}</b></div><div class="kv"><span>Kanji gemeistert</span><b>${s.k.mast} / ${s.k.total}</b></div></div>
    <h3>Fehlerarten</h3><div class="card">${e.length ? e.map(([k, v]) => `<div class="kv"><span>${esc(ERR_LABEL[k] || (k === 'dialog' ? 'Gespräch' : k))}</span><b>${v}</b></div>${bar(v / sum)}`).join('') : '<p class="muted">Noch keine Fehler erfasst.</p>'}</div>
    <h3>Aktuelle Schwächen</h3><div class="card">${weak.length ? weak.map(id => { const it = Items[id]; return `<div class="kv"><span class="jp">${esc(it.kind === 'kana' ? it.ch : it.kind === 'word' ? (it.kanji || it.kana) : it.c)}</span><b>${esc(it.kind === 'kana' ? it.ro : it.de)}</b></div>`; }).join('') : '<p class="muted">Keine auffälligen Schwächen.</p>'}${weak.length ? '<div class="stack"><button class="btn primary" data-a="weak">Jetzt üben</button></div>' : ''}</div>`;
  bindBack(); const w = $('[data-a=weak]'); if (w) w.onclick = weakSession;
}
function viewKanaTable() {
  const sc = (SUB && SUB.sc) || 'h';
  const groups = ALL_GROUPS.filter(g => g.script === sc);
  view().innerHTML = `${backBtn()}<h1>Kana-Tabelle</h1><div class="seg"><button class="${sc === 'h' ? 'on' : ''}" data-s="h">Hiragana</button><button class="${sc === 'k' ? 'on' : ''}" data-s="k">Katakana</button></div>
    ${groups.map(g => `<h4>${esc(g.name)}</h4><div class="kgrid">${g.chars.map(c => { const s = S.items['ka:' + c.ch]; return `<button class="kcell ${s && s.mastered ? 'mast' : s ? 'seen' : ''}" data-say="${esc(c.ch)}"><span class="jp big">${esc(c.ch)}</span><small>${esc(c.ro)}</small></button>`; }).join('')}</div>`).join('')}
    <p class="muted small">Grün = gemeistert, blau = in Übung. Tippe auf ein Zeichen, um es zu hören.</p>`;
  bindSay(view()); bindBack();
  $$('[data-s]').forEach(b => b.onclick = () => { SUB = { more: 'kana', sc: b.dataset.s }; viewMore(); });
}
const PHRASES = [
  ['すみません', 'Entschuldigung / Hallo (um Aufmerksamkeit)'], ['ありがとうございます', 'Vielen Dank'], ['えいごを はなせますか', 'Sprechen Sie Englisch?'],
  ['わかりません', 'Ich verstehe nicht'], ['もういちど おねがいします', 'Noch einmal bitte'], ['ゆっくり おねがいします', 'Bitte langsam'],
  ['これを ください', 'Das hier bitte'], ['いくらですか', 'Wie viel kostet das?'], ['トイレは どこですか', 'Wo ist die Toilette?'],
  ['えきは どこですか', 'Wo ist der Bahnhof?'], ['この でんしゃは ＿＿に いきますか', 'Fährt dieser Zug nach ＿＿?'], ['カードは つかえますか', 'Kann ich mit Karte zahlen?'],
  ['みずを ください', 'Wasser bitte'], ['おかいけいを おねがいします', 'Die Rechnung bitte'], ['アレルギーが あります', 'Ich habe eine Allergie'],
  ['たすけて ください', 'Helfen Sie mir bitte'], ['びょういんは どこですか', 'Wo ist das Krankenhaus?'], ['ぐあいが わるいです', 'Mir geht es schlecht'],
  ['まいごに なりました', 'Ich habe mich verlaufen'], ['パスポートを なくしました', 'Ich habe meinen Pass verloren'], ['けいさつを よんで ください', 'Rufen Sie bitte die Polizei'],
];
function viewPhrases() {
  view().innerHTML = `${backBtn()}<h1>Reise-Phrasen</h1><p class="muted">Tippe auf einen Satz, um ihn zu hören. Sprich ihn ruhig nach.</p><div class="list">${PHRASES.map(p => `<div class="row-item" data-say="${esc(p[0])}"><div class="rs wide"><b class="jp">${esc(p[0])}</b><small>${esc(romaOf(p[0].replace(/ /g, '')))}</small><small>${esc(p[1])}</small></div><div class="rm">🔊</div></div>`).join('')}</div>
    <div class="card"><h3>Knigge</h3><p>Nicht trinkgeld geben, ein leichtes Nicken oder eine kleine Verbeugung reicht. Im Zug leise sprechen und nicht telefonieren. Vor Tempeln und Wohnungen Schuhe ausziehen. Mit beiden Händen Visitenkarten und Geld übergeben. Stäbchen niemals senkrecht in den Reis stecken.</p></div>`;
  bindSay(view()); bindBack();
}
function viewSettings() {
  const s = S.settings;
  view().innerHTML = `${backBtn()}<h1>Einstellungen</h1><div class="card">
    <label class="set">Tagesziel (Minuten)<select id="s-goal">${[10, 15, 20, 30, 45, 60].map(v => `<option ${v === s.dailyGoal ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label class="set">Mastery: richtige Antworten pro Wort<select id="s-mast">${[3, 4, 5, 6, 8, 10].map(v => `<option ${v === s.mastery ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label class="set">Mindest-Quote für den Lektionspunkt (%)<select id="s-acc">${[0, 50, 60, 70, 80, 90].map(v => `<option ${v === s.minAcc ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label class="set">Sprechtempo<select id="s-rate">${[[0.6, 'sehr langsam'], [0.75, 'langsam'], [0.85, 'normal'], [1, 'schnell']].map(v => `<option value="${v[0]}" ${v[0] === s.rate ? 'selected' : ''}>${v[1]}</option>`).join('')}</select></label>
    <label class="set">Furigana (Lesehilfe) anzeigen<input type="checkbox" id="s-furi" ${s.furigana ? 'checked' : ''}></label>
    <label class="set">Romaji-Hilfe bei Lese-Übungen<input type="checkbox" id="s-ro" ${s.romajiHelp ? 'checked' : ''}></label>
    <label class="set">Kana-Auswahl statt Tastatur beim Schreiben<input type="checkbox" id="s-pad" ${s.padInput !== false ? 'checked' : ''}></label></div>
    <div class="card"><h3>Ton-Diagnose</h3><p id="vinfo" class="muted"></p>
      <label class="set">Stimme<select id="s-voice"></select></label>
      <div class="stack"><button class="btn" id="vtest">Testsatz anhören</button><button class="btn" id="vtest2">Mit Systemstimme testen (ohne Auswahl)</button></div>
      <p id="vstat" class="muted small"></p>
      <p class="muted small">Kein Ton? Prüfe: 1) Medienlautstärke (nicht Klingelton) hochdrehen, Stumm-Schalter aus. 2) Android: Einstellungen → Sprache → Text-to-Speech → „Wiedergabe“ testen und japanische Sprachdaten installieren. 3) App/Browser einmal komplett schließen und neu öffnen. 4) Nach der Mikrofon-Nutzung hilft manchmal ein Neustart des Browsers.</p></div>`;
  bindBack();
  const save = () => { s.dailyGoal = +$('#s-goal').value; s.mastery = +$('#s-mast').value; s.minAcc = +$('#s-acc').value; s.rate = +$('#s-rate').value; s.furigana = $('#s-furi').checked; s.romajiHelp = $('#s-ro').checked; s.padInput = $('#s-pad').checked; Store.save(); };
  $$('select,input').forEach(e => e.onchange = save);
  const fillVoices = () => {
    Voice.loadVoices();
    const sel = $('#s-voice'); if (!sel) return;
    sel.innerHTML = `<option value="">Automatisch</option>` + Voice.list.map(v => `<option value="${esc(v.name)}" ${v.name === S.settings.voiceName ? 'selected' : ''}>${esc(v.name)} (${v.localService ? 'lokal' : 'online'})</option>`).join('');
    $('#vinfo').textContent = Voice.list.length ? `${Voice.list.length} japanische Stimme(n) gefunden. Aktiv: ${Voice.voice ? Voice.voice.name : 'Systemstandard'}` : 'Keine japanische Stimme gefunden. Installiere in den Geräteeinstellungen ein japanisches Sprachpaket für Text-to-Speech.';
  };
  fillVoices(); setTimeout(fillVoices, 800);
  $('#s-voice').onchange = e => { S.settings.voiceName = e.target.value; Store.save(); Voice.loadVoices(); };
  const stat = () => { $('#vstat').textContent = Voice.lastError ? `Letzter Fehler: ${Voice.lastError}` : (Voice.lastOk ? 'Letzte Ausgabe war erfolgreich.' : ''); };
  $('#vtest').onclick = async () => { await Voice.speak('こんにちは。はじめまして。'); stat(); };
  $('#vtest2').onclick = () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance('こんにちは'); u.lang = 'ja-JP'; u.onerror = e => { $('#vstat').textContent = 'Systemstimme: Fehler ' + e.error; }; u.onstart = () => { $('#vstat').textContent = 'Systemstimme spricht.'; }; speechSynthesis.speak(u); } catch (e) { $('#vstat').textContent = 'Fehler: ' + e.message; } };
}
function viewBackup() {
  view().innerHTML = `${backBtn()}<h1>Backup</h1><div class="card"><p>Deine Lerndaten liegen nur auf diesem Gerät. Exportiere sie regelmäßig, um nichts zu verlieren, und um zwischen Handy und PC zu wechseln.</p>
    <div class="stack"><button class="btn primary" id="exp">Daten exportieren</button><label class="btn" for="imp">Daten importieren</label><input type="file" id="imp" accept="application/json" hidden>
    <button class="btn danger" id="rst">Alles zurücksetzen</button></div></div>`;
  bindBack();
  $('#exp').onclick = () => { const b = new Blob([Store.export()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `japanisch-backup-${dayKey()}.json`; a.click(); toast('Backup erstellt'); };
  $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { Store.import(r.result); toast('Importiert'); go('today'); } catch (er) { toast('Datei ungültig'); } }; r.readAsText(f); };
  $('#rst').onclick = () => { if (confirm('Wirklich alles löschen?')) { Store.reset(); go('today'); } };
}

/* ---------- Navigation ---------- */
const VIEWS = { today: viewToday, path: viewPath, cards: viewCards, kanji: viewKanji, more: viewMore };
function go(tab) {
  leavePlayer(); if (tab !== TAB) SUB = null; TAB = tab;
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  VIEWS[tab](); window.scrollTo(0, 0);
}
function init() {
  Store.load(); buildItems(); Voice.init();
  $$('#nav button').forEach(b => b.onclick = () => { SUB = null; go(b.dataset.t); });
  go(S.onboarded ? 'today' : 'today');
  if (!S.onboarded && !S.items['ka:あ']) { /* sanfter Hinweis auf Einstufungstest steht auf „Heute“ */ }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
}
document.addEventListener('DOMContentLoaded', init);
