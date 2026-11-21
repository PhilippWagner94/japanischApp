'use strict';
/* ===== Frage-Oberflächen. Jede Frage: { title, render(host, api) } ===== */
const playBtn = (txt, cls = '') => `<button class="icon-btn play ${cls}" data-say="${esc(txt)}" aria-label="Anhören">🔊</button>`;
const slowBtn = txt => `<button class="icon-btn play slow" data-say="${esc(txt)}" data-rate="0.55" aria-label="Langsam anhören">🐢</button>`;
function bindSay(host) {
  $$('[data-say]', host).forEach(b => b.onclick = e => { e.stopPropagation(); Voice.speak(b.dataset.say, b.dataset.rate ? +b.dataset.rate : undefined); });
}
const wordHtml = (it, big) => {
  const f = S.settings.furigana;
  const main = it.kanji ? (f ? `<ruby>${esc(it.kanji)}<rt>${esc(it.kana)}</rt></ruby>` : esc(it.kanji)) : esc(it.kana);
  return `<span class="jp ${big ? 'big' : ''}">${main}</span>`;
};
const romaOf = s => { let o = ''; for (let i = 0; i < s.length; i++) { const two = s.substr(i, 2); if (KANA[two]) { o += KANA[two].ro; i++; } else if (KANA[s[i]]) o += KANA[s[i]].ro; else o += s[i]; } return o; };

/* Auswahl-Frage */
function choiceQ(o) {
  return {
    title: o.title, id: o.id, mode: o.mode,
    render(host, api) {
      const opts = shuffle(o.options); if (RT.place) opts.push({ h: 'Weiß ich nicht', ok: false, idk: true });
      host.innerHTML = `
        <div class="prompt">${o.prompt || ''}</div>
        ${o.audio ? `<div class="center">${playBtn(o.audio, 'lg')} ${o.slow ? slowBtn(o.audio) : ''}</div>` : ''}
        <div class="opts ${o.grid ? 'grid' : ''} ${o.bigOpt ? 'bigopt' : ''}">${opts.map((x, i) => `<button class="opt ${x.idk ? 'idk' : ''}" data-i="${i}">${x.h}</button>`).join('')}</div>`;
      bindSay(host);
      if (o.audio && o.autoplay !== false) setTimeout(() => Voice.speak(o.audio), 250);
      $$('.opt', host).forEach(b => b.onclick = () => {
        if (host.dataset.done) return; host.dataset.done = 1;
        const x = opts[+b.dataset.i];
        $$('.opt', host).forEach((bb, j) => { bb.disabled = true; if (opts[j].ok) bb.classList.add('right'); });
        if (!x.ok) b.classList.add('wrong');
        const right = opts.find(z => z.ok);
        api.result(!!x.ok, { id: o.id, mode: o.mode, err: o.err, msg: x.ok ? (o.explain || '') : `Richtig: <b>${right.h}</b>${o.explain ? '<br>' + o.explain : ''}`, wrongId: x.id });
      });
    },
  };
}

/* Kana-Auswahl (Pad): alle Hiragana/Katakana zum Antippen */
function padRows(script) {
  const groups = ALL_GROUPS.filter(g => g.script === script && !/-c\d$|-x$/.test(g.id));
  const col = { a: 0, i: 1, u: 2, e: 3, o: 4, n: 2 };
  const rows = groups.map(g => { const r = ['', '', '', '', '']; g.chars.forEach(c => { r[col[c.ro.slice(-1)] || 0] = c.ch; }); return r; });
  rows.push(script === 'h' ? ['ゃ', 'ゅ', 'ょ', 'っ', 'ー'] : ['ャ', 'ュ', 'ョ', 'ッ', 'ー']);
  return rows;
}
const padHtml = sc => `<div class="seg small"><button data-sc="h" class="${sc === 'h' ? 'on' : ''}">ひらがな</button><button data-sc="k" class="${sc === 'k' ? 'on' : ''}">カタカナ</button><button class="del" aria-label="Löschen">⌫</button></div>
  <div class="pad">${padRows(sc).map(r => r.map(c => c ? `<button class="pk jp" data-c="${c}">${c}</button>` : '<span></span>').join('')).join('')}</div>`;

/* Tipp-Frage: Antworten als Liste möglicher Lösungen (Kana oder Kanji). o.jp = japanische Ausgabe (Kana-Pad) */
function typeQ(o) {
  const q = {
    title: o.title, id: o.id, mode: o.mode,
    render(host, api, keep) {
      const pad = !!o.jp && S.settings.padInput !== false;
      const startSc = /[\u30a0-\u30ff]/.test(String(o.answers[0] || '')) && !/[\u3040-\u309f]/.test(String(o.answers[0] || '')) ? 'k' : 'h';
      host.innerHTML = `
        <div class="prompt">${o.prompt || ''}</div>
        ${o.audio ? `<div class="center">${playBtn(o.audio, 'lg')} ${o.slow ? slowBtn(o.audio) : ''}</div>` : ''}
        <input class="inp" type="text" lang="ja" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${pad ? 'readonly inputmode="none"' : ''} placeholder="${esc(pad ? 'Zeichen unten antippen' : (o.placeholder || 'Romaji oder Kana tippen'))}">
        <div class="preview" aria-live="polite">&nbsp;</div>
        ${pad ? '<div class="padwrap"></div>' : ''}
        <div class="row"><button class="btn ghost skip">Weiß nicht</button><button class="btn primary check">Prüfen</button></div>
        ${o.jp ? `<div class="center"><button class="linkbtn swap">${pad ? 'Stattdessen Tastatur benutzen' : 'Stattdessen Kana-Auswahl benutzen'}</button></div>` : ''}`;
      bindSay(host);
      if (o.audio && o.autoplay !== false && !keep) setTimeout(() => Voice.speak(o.audio), 250);
      const inp = $('.inp', host), prev = $('.preview', host);
      if (keep) inp.value = keep;
      if (pad) {
        let sc = startSc;
        const draw = () => {
          $('.padwrap', host).innerHTML = padHtml(sc);
          $$('[data-sc]', host).forEach(b => b.onclick = () => { sc = b.dataset.sc; draw(); });
          $$('.pk', host).forEach(b => b.onclick = () => { inp.value += b.dataset.c; });
          $('.del', host).onclick = () => { inp.value = [...inp.value].slice(0, -1).join(''); };
        };
        draw();
      } else {
        inp.oninput = () => { const k = romajiToKana(inp.value); prev.textContent = inp.value && /[a-z]/i.test(inp.value) ? k : '\u00a0'; };
        setTimeout(() => { try { inp.focus(); } catch (e) { /* ignorieren */ } }, 100);
      }
      const sw = $('.swap', host); if (sw) sw.onclick = () => { S.settings.padInput = !pad; Store.save(); q.render(host, api, inp.value); };
      const fin = giveUp => {
        if (host.dataset.done) return; host.dataset.done = 1;
        const val = inp.value.trim();
        const ok = !giveUp && val && o.answers.some(a => norm(val) === norm(a) || val === a || (o.accept && o.accept(val)));
        inp.disabled = true; const pw = $('.padwrap', host); if (pw) pw.style.display = 'none'; if (sw) sw.style.display = 'none';
        api.result(!!ok, { id: o.id, mode: o.mode, err: o.err, msg: ok ? (o.explain || '') : `Richtig: <b class="jp">${esc(o.show || o.answers[0])}</b>${o.explain ? '<br>' + o.explain : ''}` });
      };
      $('.check', host).onclick = () => fin(false);
      $('.skip', host).onclick = () => fin(true);
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fin(false); } };
    },
  };
  return q;
}

/* Wörter zu einem Satz ordnen */
function orderQ(o) {
  return {
    title: o.title || 'Satz bilden',
    render(host, api) {
      const toks = o.tokens;
      let pool = shuffle(toks.map((t, i) => ({ t, i })));
      if (pool.every((p, i) => p.t === toks[i]) && toks.length > 1) pool = pool.reverse();
      let chosen = [];
      const draw = () => {
        host.innerHTML = `
          <div class="prompt">${o.prompt}</div>
          <div class="answer-zone">${chosen.map((p, k) => `<button class="chip placed" data-k="${k}">${P.tokHtml(p.t, S.settings.furigana)}</button>`).join('')}</div>
          <div class="chips">${pool.map((p, k) => `<button class="chip" data-p="${k}">${P.tokHtml(p.t, S.settings.furigana)}</button>`).join('')}</div>
          <div class="row"><button class="btn primary check" ${chosen.length ? '' : 'disabled'}>Prüfen</button></div>`;
        $$('.chip.placed', host).forEach(b => b.onclick = () => { pool.push(chosen.splice(+b.dataset.k, 1)[0]); draw(); });
        $$('.chips .chip', host).forEach(b => b.onclick = () => { chosen.push(pool.splice(+b.dataset.p, 1)[0]); draw(); });
        $('.check', host).onclick = () => {
          const ans = chosen.map(p => p.t);
          const ok = ans.length === toks.length && ans.every((t, i) => t === toks[i]);
          $$('button', host).forEach(b => b.disabled = true);
          api.result(ok, { err: 'order', msg: ok ? '' : `Richtig: <b class="jp">${P.html(o.answer, S.settings.furigana)}</b>`, sentence: o.answer });
        };
      };
      draw();
    },
  };
}

/* Zuordnen (Paare antippen) */
function matchQ(o) {
  return {
    title: o.title || 'Zuordnen',
    render(host, api) {
      const left = shuffle(o.pairs.map((p, i) => ({ i, h: p.a })));
      const right = shuffle(o.pairs.map((p, i) => ({ i, h: p.b })));
      let selL = null, errors = 0, matched = 0; const bad = new Set();
      host.innerHTML = `<div class="prompt">${o.prompt || 'Ordne die Paare zu.'}</div>
        <div class="match"><div class="col l">${left.map((x, k) => `<button class="opt m" data-l="${k}">${x.h}</button>`).join('')}</div>
        <div class="col r">${right.map((x, k) => `<button class="opt m" data-r="${k}">${x.h}</button>`).join('')}</div></div>`;
      const L = $$('[data-l]', host), R = $$('[data-r]', host);
      L.forEach(b => b.onclick = () => { if (b.classList.contains('right')) return; L.forEach(x => x.classList.remove('sel')); selL = +b.dataset.l; b.classList.add('sel'); if (o.pairs[left[selL].i].say) Voice.speak(o.pairs[left[selL].i].say); });
      R.forEach(b => b.onclick = () => {
        if (selL === null || b.classList.contains('right')) return;
        const lb = L[selL], ok = left[selL].i === right[+b.dataset.r].i;
        if (ok) { lb.classList.remove('sel'); lb.classList.add('right'); b.classList.add('right'); matched++; selL = null;
          if (matched === o.pairs.length) { host.dataset.done = 1; api.result(errors <= 1, { err: 'vocab', msg: errors ? `${errors} Fehlversuch(e)` : '', multi: o.pairs.map(p => p.id).filter(Boolean), bad: [...bad] }); }
        } else { errors++; bad.add(o.pairs[left[selL].i].id); b.classList.add('wrong'); lb.classList.add('wrong'); setTimeout(() => { b.classList.remove('wrong'); lb.classList.remove('wrong'); }, 450); }
      });
    },
  };
}

/* Nachsprechen (tolerant: kurze Ziele großzügig, nach „nicht erkannt“ Selbstkorrektur möglich) */
function speakQ(o) {
  return {
    title: o.title || 'Nachsprechen', id: o.id, mode: 'speak',
    render(host, api) {
      const canMic = Voice.canListen();
      host.innerHTML = `
        <div class="prompt">Sprich nach:</div>
        <div class="big-jp">${o.html}</div>
        <div class="muted center">${esc(o.de || '')}</div>
        <div class="center">${playBtn(o.say, 'lg')} ${slowBtn(o.say)} <span class="muted">Zuerst anhören</span></div>
        <div class="center"><button class="btn mic" ${canMic ? '' : 'disabled'}>🎤 Sprechen</button></div>
        <div class="heard muted center" aria-live="polite">${canMic ? '' : 'Spracherkennung ist in diesem Browser nicht verfügbar. Sprich laut und bewerte dich selbst.'}</div>
        <div class="row self" style="${canMic ? 'display:none' : ''}"><button class="btn ghost bad">Weiter (nicht geschafft)</button><button class="btn primary good">Richtig gesagt</button></div>`;
      bindSay(host);
      let finished = false;
      const fin = (ok, msg) => { if (finished) return; finished = true; host.dataset.done = 1; $$('button', host).forEach(b => b.disabled = true);
        api.result(ok, { id: o.id, mode: 'speak', err: 'speak', msg }); };
      $('.good', host).onclick = () => fin(true, '');
      $('.bad', host).onclick = () => fin(false, 'Hör dir das Vorbild nochmal an und achte auf Länge der Vokale und kleines っ.');
      const mic = $('.mic', host);
      mic.onclick = async () => {
        const hb = $('.heard', host); hb.textContent = 'Ich höre zu …'; mic.classList.add('live');
        try {
          const alts = await Voice.listen(); mic.classList.remove('live');
          const targets = [o.say, ...(o.alt || [])];
          const tn = targets.map(t => norm(P.reading(t))), ts = targets.map(t => norm(P.surface(t)));
          const short = Math.min(...tn.map(x => x.length)) <= 2;
          const hit = alts.some(a => { const n = norm(a); return tn.includes(n) || ts.includes(n) || tn.some(t => t && n.includes(t)) || ts.some(t => t && n.includes(t)); });
          const best = Math.max(...alts.flatMap(a => targets.map(t => Math.max(sim(a, P.reading(t)), sim(a, P.surface(t))))));
          const ok = hit || best >= (o.strict || (short ? 0.5 : 0.7));
          hb.innerHTML = `Erkannt: <b class="jp">${esc(alts[0])}</b>`;
          if (ok) fin(true, '');
          else { hb.innerHTML += `<br>Das passt noch nicht ganz. Versuche es nochmal oder bewerte dich selbst.`; mic.textContent = '🎤 Nochmal'; $('.self', host).style.display = ''; }
        } catch (e) {
          mic.classList.remove('live');
          hb.textContent = e.message === 'not-allowed' ? 'Mikrofon nicht erlaubt. Bewerte dich selbst.' : 'Nichts erkannt. Versuche es erneut oder bewerte dich selbst.';
          mic.textContent = '🎤 Nochmal'; $('.self', host).style.display = '';
        }
      };
    },
  };
}

/* Informationsseite (nicht bewertet) */
function infoQ(o) {
  return { title: o.title, noScore: true, render(host, api) { host.innerHTML = o.html; bindSay(host); if (o.onrender) o.onrender(host, api); api.proceed(o.btn || 'Weiter'); } };
}

/* Karussell zum Kennenlernen */
function carouselQ(o) {
  return {
    title: o.title, noScore: true,
    render(host, api) {
      let i = 0; const n = o.cards.length;
      const draw = () => {
        host.innerHTML = `<div class="muted center">${i + 1} / ${n}</div>${o.cards[i].html}
          <div class="row"><button class="btn ghost prev" ${i ? '' : 'disabled'}>Zurück</button><button class="btn primary nxt">${i === n - 1 ? 'Weiter' : 'Nächste'}</button></div>`;
        bindSay(host);
        if (o.cards[i].say) setTimeout(() => Voice.speak(o.cards[i].say), 200);
        if (o.cards[i].onrender) o.cards[i].onrender(host);
        $('.prev', host).onclick = () => { i--; draw(); };
        $('.nxt', host).onclick = () => { if (i === n - 1) api.finish(); else { i++; draw(); } };
      };
      draw();
    },
  };
}

/* Geführter Dialog */
function dialogQ(o) {
  return {
    title: o.title || 'Gespräch',
    render(host, api) {
      let t = 0, errors = 0; const log = [];
      const step = () => {
        const turn = o.turns[t];
        const opts = shuffle(turn.o.map((h, i) => ({ h, ok: i === 0 })));
        host.innerHTML = `<div class="prompt">Rollenspiel: ${esc(o.title)}</div>
          <div class="chat">${log.join('')}<div class="bubble them"><span class="jp">${P.html(turn.a, S.settings.furigana)}</span>${playBtn(turn.a)}</div></div>
          <div class="muted">${esc(turn.hint)}</div>
          <div class="opts">${opts.map((x, i) => `<button class="opt" data-i="${i}"><span class="jp">${P.html(x.h, S.settings.furigana)}</span></button>`).join('')}</div>`;
        bindSay(host); setTimeout(() => Voice.speak(turn.a), 200);
        $$('.opt', host).forEach(b => b.onclick = () => {
          const x = opts[+b.dataset.i];
          if (x.ok) {
            log.push(`<div class="bubble them"><span class="jp">${P.html(turn.a, S.settings.furigana)}</span></div><div class="bubble me"><span class="jp">${P.html(x.h, S.settings.furigana)}</span></div>`);
            t++; if (t >= o.turns.length) {
              host.innerHTML = `<div class="chat">${log.join('')}</div>`;
              api.result(errors <= 1, { err: 'general', msg: errors ? `${errors} Fehler im Gespräch` : 'Das Gespräch lief gut.' });
            } else step();
          } else { errors++; b.classList.add('wrong'); b.disabled = true; S.errors.dialog = (S.errors.dialog || 0) + 1; }
        });
      };
      step();
    },
  };
}
