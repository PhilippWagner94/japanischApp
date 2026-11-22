# PROJEKT-BACKUP: 日本語 Lern-App (Stand: Version 1.2, 21.11.2026)

Zweck: Dieses Dokument reicht, um die App zu verstehen, weiterzubauen oder nachzubauen. Es ist für Claude geschrieben, nicht für den Nutzer.

## 1. Nutzer und Ziel
- Deutschsprachiger Nutzer (Philipp), lernt Japanisch, bis August 2027 verständigungsfähig in Japan (2 Wochen Reise: Tokio, Kyoto, Umland, evtl. Osaka). Ziel realistisch ca. JLPT N5 bis Teile N4, Überlebens-/Reisejapanisch.
- Vorwissen: Hiragana/Katakana holprig, einzelne Kanji (Zahlen), Grundgrammatik, Duolingo-Score 21, ca. 100-200 Wörter sicher + 200-300 unsicher. Vorher JA-EN gelernt, seit ca. 1 Monat JA-DE.
- Zeit: 10-20 Min sicher täglich, bis 30 Min möglich. Handy (Android, Chrome) bevorzugt, auch PC-Browser.
- Anforderungen: kostenlos und lokal, Erklärungen immer auf Deutsch, Lesen deutlich wichtiger als Schreiben, KI-Gespräche zuletzt (Stufe 2 über eigenes Modell im WLAN, z. B. Ollama auf dem PC).
- Wunsch-Struktur: Lernpfad mit vielen kleinen Rubriken, Wiederholung und adaptive Fehleranalyse; Rubriken Leseverständnis, Kana, Kanji (Komposita, Bedeutung der Teile), Hören, Karteikarten mit Mastery-Zahl (richtig gesagt und verstanden), Sprechen, KI-Gespräche; abwechselnd (Interleaving); Lektion = 19 Übungen; 1 Punkt pro fertiger Lektion.
- Feedback des Nutzers bisher: sehr positiv, Lektion dauert ca. 5 Min (fühlt sich leicht an, weil bekannt), Länge passt, abwechslungsreich; Wortlisten fehlerfrei befunden. Korrekturwünsche (umgesetzt): Kana-Auswahl statt Tastatur, さようなら selten (jetzt またね), Spracherkennung zu streng, Lernzeit sichtbar, Einstufungstest mit Empfehlung. Offen: Ton fiel zeitweise komplett aus (v1.2 Fix, Rückmeldung steht aus).

## 2. Technik und Auslieferung
- Reine statische Web-App (HTML/CSS/JS, keine Build-Tools, keine Bibliotheken, klassische Skripte im globalen Scope, `'use strict'`), PWA (manifest.json, sw.js, Icons). Daten in `localStorage` (Key `jp-lern-app-v1`), JSON, Export/Import als Datei.
- Gehostet vom Nutzer über GitHub Pages (Repo `PhilippWagner94/japanischApp`, URL `https://philippwagner94.github.io/japanischApp/`). Private Repos brauchen für Pages einen bezahlten Tarif; Alternative Netlify Drop. Update = Dateien neu hochladen. SW ist network-first mit Cache-Fallback, `VERSION` in sw.js bei Änderungen erhöhen (aktuell `jp-app-v3`).
- Dateien: `index.html` (Nav + Skripte in Reihenfolge), `style.css`, `manifest.json`, `sw.js`, `icons/` (icon.svg, 192, 512, maskable), `ANLEITUNG.md`, `js/data-kana.js`, `data-kanji.js`, `data-lessons1.js`, `data-lessons2.js`, `core.js`, `ui-q.js`, `slots.js`, `app.js`. Ladereihenfolge der Skripte exakt so.
- Ausgabe: deutsches UI, mobil-first, Hell/Dunkel per `prefers-color-scheme`, untere Navigation (Heute, Pfad, Karten, Kanji, Mehr).
- Nutzer arbeitet am PC mit entpacktem ZIP; Claude liefert immer ein komplettes ZIP (`/home/claude/japanisch-app.zip`) via SendUserFile.

## 3. Daten
### data-kana.js
- `KANA_DEF` (Zeilen a k s t n h m y r w g z d b p c1 c2 c3) → `HIRA_GROUPS` (ids `h-a`, `h-k`, …, `h-c1..c3`), `KATA_GROUPS` (ids `k-…`, plus `k-x` Fremdlaute). `ALL_GROUPS`, `KANA[ch] = {ch, ro, script, group}`. Romaji: shi, chi, tsu, fu, ji, zu, wo, n.
- `RO_ALT` (alternative Romaji), `KANA_SIM` (optisch ähnliche Zeichen: さ/ち/き, ぬ/め/ね, わ/れ/ね, シ/ツ/ン/ソ, ク/ケ/タ, ウ/ワ/フ …), `KWORDS` (ca. 98 reine Kana-Wörter {k, de}), `PAIRS` (Minimalpaare [A, deA, B, deB], 13 Stück, z. B. おばさん/おばあさん, きて/きって, ゆき/ゆうき).
### data-kanji.js
- `KANJI_DATA`: [Zeichen, Bedeutung, On, Kun, [[Wort, Lesung, Bedeutung]…], Merkhilfe], 50 Kanji: 一二三四五六七八九十百千万円人日本学生何水大小駅口出入右左時分今半食飲行来見電車北南東西京都阪上下中. `KANJI[c] = {c, de, on, kun, words, hint}`.
### data-lessons1/2.js
- `LESSONS[]` (Typen `kana` und `content`), `UNITS[]`, `LESSON_BY_ID`.
- Kana-Lektion: `{id, type:'kana', title, sub, icon, groups:[ids], tips:[…]}`.
- Content-Lektion: `{id, type:'content', title, icon, deck, words:[[kana, kanji|'', de, emoji]], kanji?:[Zeichen], sents:[{s, de}], grammar:{title, body:[…], ex:[[satz, de]], check:{q, o:[…], a:index}}, reading:{lines:[…], de, q:[{q,o,a}]}, listen:{text, de, q:[…]}, dialog:{title, turns:[{a, hint, o:[richtig, falsch, falsch]}]}}`.
- Satzformat: Tokens mit `|` getrennt, Kanji MIT Lesung `日本人[にほんじん]`. Jedes Kanji in Sätzen/Dialogen muss eine `[Lesung]` haben (TTS liest Lesung; Validierung prüft das). `P.reading/P.surface/P.html` verarbeiten das. Lesetext-Zeilen dürfen `Ａ：`/`Ｂ：` enthalten.
- Einheiten und Reihenfolge:
  - u1 Erste Schritte: k1 Hiragana 1 (a k s t n), c1 Begrüßungen, k2 Hiragana 2 (h m y r w n), k3 Hiragana 3 (Dakuten, Kombinationen, っ, Langvokale), c2 Sich vorstellen
  - u2 Katakana und Fragen: k4 Katakana 1, k5 Katakana 2, c3 Fragen und Verneinung, k6 Katakana 3 (Dakuten), c4 Zahlen 1-10
  - u3 Alltag: c5 Uhrzeit und Tage, c6 Essen und Bestellen, c7 Einkaufen und Preise
  - u4 Unterwegs: c8 Wege und Orte, c9 Verben ます-Form, c10 Zug und Reisen
- Inhalte: 141 Wörter (c1 14 inkl. またね, しつれいします, さようなら als „selten“), 50 Sätze, je Lektion Grammatik-Erklärung (は/です, か, Verneinung, これ/それ/あれ, Zahlen, Uhrzeit mit Lautwechseln, を/ください/Zählwörter ひとつ…, 百千万, どこ/に/が, ます-Formen, から/まで/行き/まい), Lesetext, Hörtext, Dialog.
- Bekannte Fallstricke/Korrekturen: 2 Fahrkarten = 二[に]まい (nicht ふたまい); 4 Uhr = よじ; 300 = さんびゃく; Minimalpaar かど/かっど entfernt.

## 4. Zustand (core.js)
- `S = {v:1, settings:{mastery:5, minAcc:70, furigana:true, rate:0.85, dailyGoal:15, romajiHelp:true, padInput:true, voiceName?}, items:{id:state}, lessons:{id:{done,acc,last,tries,date,quick?}}, points, streak, best, lastDay, days:{'YYYY-MM-DD':{reviews,correct,lessons,sec}}, errors:{typ:count}, onboarded, placement:{date,hira,kata,words,kanji,rec,skipCandidates,skipped}, resume:{id,slot,total,ok}}`.
- Item-IDs: `ka:あ`, `w:<kana>`, `kj:<zeichen>`. `Items{}` wird in `buildItems()` aus Kana, Content-Wörtern (Duplikate nach kana ignoriert) und Kanji gebaut; `DECKS[]` pro Lektionsdeck.
- Item-Zustand: `{ease:2.5, ivl, step, due, reps, lapses, ok:{modus:n}, ko:{modus:n}, mastered, seen, last}`.
- SRS (`review(id, correct, mode, errType)`): richtig → ok[mode]++; Lernschritte: ivl 0 → step++ (step 1: fällig in 10 Min, ab step 2: 1 Tag), danach ivl = max(ivl+1, round(ivl*ease)) Tage, ease +0.03 (max 3). Falsch → lapses++, ease −0.2 (min 1.3), ivl 0, step 0, fällig in 2 Min, `S.errors[errType]++`.
- Mastery: `isMastered` = Summe ok ≥ settings.mastery UND Zahl verschiedener Modi ≥ min(3, Modi der Art) UND lapses ≤ Summe. Modi: kana `read, hear, type`; word `mc, hear, type, speak`; kanji `read, mc`. `mastery(id)` = 0..1 Fortschrittsbalken. `nextMode(id)` wählt den Modus mit den wenigsten richtigen Antworten.
- `touchDay` zählt Streak und Tageswerte (Lernzeit `sec` = Zeit pro Antwort, max. 40 s). `dueList`, `weakList` (lapses>0 und nicht gemeistert). Fehlerarten (ERR_LABEL): kana, hear, vocab, particle, order, kanji, speak, read, translate, general, dialog.
- Helfer: `norm()` (Romaji→Hiragana, Katakana→Hiragana, ー→Vokal, を→お, Satzzeichen weg), `romajiToKana`, `sim` (Levenshtein), `P` (Satzparser), `shuffle/pick/rnd/esc/$/$$`, `RT.place` (Einstufungsmodus: zusätzliche Option „Weiß ich nicht“).
- Voice: `speak(text, rate)` mit Kandidatenliste (gewählte Stimme, Qualitätsstimmen, lokale, alle ja-Stimmen, zuletzt nur lang ja-JP), 4-s-Watchdog, Fallback, Fehlermeldung per Toast, Spracherkennung vorher beendet, Audio-Unlock beim ersten Tipp; `listen()` via (webkit)SpeechRecognition `ja-JP`, 5 Alternativen; `canListen()`.

## 5. Fragetypen (ui-q.js) – Schnittstelle
Jede Frage `{title, id?, mode?, render(host, api)}`; `api.result(ok, {id, mode, err, msg, multi, bad, wrongId})` speichert, zeigt Feedback (unten fixiert) + „Weiter“; `api.proceed(label)` nur Weiter; `api.finish()`.
- `choiceQ` (Auswahl; Optionen `{h, ok, id}`; `audio`, `slow`, `grid`, `bigOpt`), `typeQ` (Tippen; `answers` Liste, `jp:true` → Kana-Pad mit Hiragana/Katakana-Tabs, ⌫ und Umschalter auf Systemtastatur, sonst Romaji-Vorschau), `orderQ` (Wortchips), `matchQ` (Paare), `speakQ` (Nachsprechen: tolerant, kurze Ziele ≤2 Zeichen Schwelle 0,5, sonst 0,7, „enthält Ziel“ zählt; bei Misserfolg Wiederholen oder Selbstbewertung; ohne Erkennung nur Selbstbewertung), `infoQ`, `carouselQ`, `dialogQ` (Chat mit 3 Optionen pro Zug, richtig = `o[0]`).

## 6. Übungsgeneratoren (slots.js)
- `itemQ(id, mode)`: erzeugt Frage je Item/Modus (Wort: mc JA→DE, mcr DE→JA, hear, type [Japanisch, jp-Pad], speak; Kana: read, hear, type [Romaji]; Kanji: read [Bedeutung], mc [Komposita-Lesung]). Distraktoren: `wordDists` (gleiche Lektion → Deck → gesehen → alle), `kanaDists` (optisch ähnliche zuerst, gleiche Lesung ausgeschlossen).
- `taker(list)` verteilt Items rundlaufend. `partQuestions` (Partikel-Lücken aus Sätzen, Partikel は が を に で の も か と). `sentVariants` (は→わ, へ→え, Kanji-Form akzeptiert).
- `buildSlots(lesson)` → 19 Slots, Fragen werden beim Start des Slots gebaut (`build()`), `ctx.missed` sammelt Fehler für Slot 19.
- Content-Lektion: 1 Aufwärmen (fällige/schwache Items früherer Lektionen), 2 Neue Wörter (Karussell), 3 Zuordnen, 4 JA→DE, 5 DE→JA, 6 Hören und wählen, 7 Hören und tippen (jp-Pad), 8 Lesen üben (Romaji oder Bedeutung), 9 Kanji-Bausteine (Übersicht + Bedeutung + Komposita-Zerlegung; ohne Kanji: Vorschau), 10 Lückentext Partikel, 11 Satz ordnen, 12 Grammatik (Erklärung + Check), 13 Übersetzen DE→JA (jp-Pad), 14 Nachsprechen, 15 Ähnliche Laute (Minimalpaare), 16 Lesetext + Fragen, 17 Hörtext + Fragen (Tempo-Buttons), 18 Rollenspiel-Dialog, 19 Fehler wiederholen (andere Modi).
- Kana-Lektion: 1 Aufwärmen, 2 Zeichen kennenlernen (Grid, antippen = hören), 3 Zuordnen, 4 Zeichen lesen, 5 Lesung→Zeichen, 6 Hören und wählen, 7 Hören und tippen (Romaji), 8 Wörter lesen (KWORDS aus gelernten Zeichen), 9 Verwechslungen, 10 Eintippen, 11 Wort bauen (Chips), 12 Merkhilfen, 13 Lesung→Zeichen wählen (jp-Pad), 14 Nachsprechen (Wörter), 15 Ähnliche Laute, 16 Wörter zuordnen, 17 Hörwörter, 18 Schnellrunde, 19 Fehler wiederholen.
- Ergebnis: ca. 63-80 Fragen pro Lektion; Quote ≥ `minAcc` (70 %) → Lektion `done`, +1 Punkt (Punkte = Zahl erledigter Lektionen).

## 7. App-Ansichten (app.js)
- Player: Kopfzeile (✕, Fortschritt x/19), Titel, `runQuestions` sequenziell; ✕ speichert `S.resume` (Slot-Ebene). `recorder` verbucht Ergebnisse (review pro Item, Fehlerarten).
- Heute: Gruß, Streak, Punkte, Tagesziel-Ring (Minuten) + Gesamtlernzeit, Karten: Lektion fortsetzen, Wiederholen (fällige), Nächste Lektion, Schwächen üben, Einstufungstest (solange nicht onboarded), Stand (gemeistert W/K/Kanji), häufigste Fehler.
- Pfad: Einheiten/Lektionen mit Status (⭐ %, ▶ aktuell, ⏭ übersprungen) und ⏩-Schnelltest-Button.
- Schnelltest (`startTestOut`): 16 gemischte Fragen aus den Lektions-Items, ≥85 % → Lektion done + Punkt.
- Einstufungstest (`startPlacement`): 10 Hiragana + 8 Katakana + 2 Wörter je Lektion c1-c10 + 4 Kanji, Auswahl mit „Weiß ich nicht“. Richtige Items → SRS als bekannt (ok=2, ivl 4 d), falsche → fällig. Empfehlung: erste Lektion im Pfad, die nicht „bekannt“ ist (Kana-Lektion bekannt bei ≥80 % des jeweiligen Scripts; Content bekannt bei allen getesteten Wörtern richtig). Button „Empfehlung übernehmen“ markiert Lektionen davor als `skipped` (kein Punkt, `nextLesson` überspringt, deren Items werden mit Fälligkeit in 1-5 Tagen in SRS gelegt).
- Karten: Decks (Hiragana, Katakana, je Lektions-Deck) mit Fortschritt; Deck-Ansicht mit Wortliste + Mastery; „Deck üben“/„Fällige üben“ (Sitzung bis 12 Fragen, `startSession`).
- Kanji: Raster (Status-Farben), Detailseite (Bedeutung, On/Kun, Merkhilfe, Wörter, Üben), Erklärkarte On/Kun und Komposita.
- Mehr: Statistik (Streak, 14-Tage-Lernzeit-Balken, Gesamtlernzeit, Antworten/Quote, Fehlerarten, Schwächen), Kana-Tabelle, Reise-Phrasen (21 Sätze + Knigge, antippen = hören), Einstellungen (Tagesziel, Mastery 3-10, Mindestquote, Sprechtempo, Furigana, Romaji-Hilfe, Kana-Auswahl, Ton-Diagnose mit Stimmenwahl/Tests), Backup (Export/Import JSON, Reset), Einstufungstest.

## 8. Tests (Vorgehen)
- Lokal `python3 -m http.server`, Playwright/Chromium (vorinstalliert, `require('playwright')`). Bot-Läufe: alle 16 Lektionen automatisch durchspielen (Optionen, Tippen-Skip, Chips, Match, Karussell, Speak-„good“); Validierungsskript für Inhalte (Kanji ohne Lesung, Kanji-Referenzen, doppelte Wörter, Antwortindizes, Einheiten); Pad-Test; Einstufung/Schnelltest mit Wrapper, der die richtige Antwort kennt; TTS-Fallback mit gemockter `speechSynthesis` (Mock-Utterance-Klasse nötig). Headless hat keine echten Stimmen/Mikrofon.

## 9. Offene Punkte und Fahrplan
1. Rückmeldung zum Ton (v1.2) abwarten; bei Fortbestehen Fehlertext aus Ton-Diagnose auswerten.
2. Weitere Einheiten: Vergangenheit (ました, でした, い-/な-Adjektive), て-Form (Bitten, Fortlaufendes), Wünsche (たい, がほしい), Gründe (から, ので), Möglichkeit/Erlaubnis, Höflichkeitsstufen/Basis-Keigo, Zählwörter, Datum/Wochentage/Monate, Familie, Körper/Gesundheit/Notfall, Hotel, Konbini, Einkaufen (Größen, Farben), Wetter, Smalltalk, Shopping/Preise/Steuerfrei, Restaurant (Allergien, Rechnung), Sehenswürdigkeiten, Ticketkauf. Ziel: ca. 1.100 Wörter und 150-200 Kanji bis Phase 5 (Wochen 33-38: Reise-Simulation, freie Gespräche, Abschlusstests).
3. Kanji erweitern (Radikale als Bausteine, Komposita-Erklärungen, Schilder/Speisekarten/Fahrpläne als Leseübungen), Furigana-Stufen.
4. Strichfolge-Übung (KanjiVG-Daten, Fingerschreiben) optional.
5. Stufe 2: KI-Gespräche. Geführte Rollenspiele sind drin (offline). Freie Gespräche: Anbindung an lokales Modell auf dem PC (Ollama) im WLAN, Einstellungsfeld für Adresse, Korrektur-Feedback auf Deutsch, Japanisch-Qualität des Modells vorher prüfen; HTTPS/Mixed-Content und CORS beachten.
6. Mögliche Verbesserungen: Placement-Test erweitern (mehr Items, genauere Empfehlung), adaptive Schwierigkeit pro Lektion (mehr Fehler-Items einmischen), Check-ups alle paar Wochen, Wochenrückblick, Erinnerungen (PWA-Notifications), Muttersprachler-Audio (nicht erzeugbar, Ersatz NHK Easy Japanese/Tutor), Betonung (Pitch Accent) als Hinweis, Tempo-Regler für alle Audios, Dark-Mode-Feinschliff, Barrierefreiheit, Cloud-freie Sync-Hilfe (Export/Import), Inhalte durch Muttersprachler prüfen, IndexedDB bei großen Datenmengen, Tests als Skript ins Repo.

## 10. Konventionen
- UI und Erklärungen immer Deutsch; Japanisch mit Furigana (einstellbar) und Romaji-Hilfe; Fehlermeldungen konkret; Inhalte selbst erstellt (nicht muttersprachlich geprüft, Nutzer prüft stichprobenartig).
- Neue Lektion = Eintrag in `LESSONS` (Schema oben) + Eintrag in `UNITS`; danach Validierungsskript und Bot-Lauf, SW-`VERSION` erhöhen, ZIP neu bauen, ANLEITUNG.md ergänzen.

## Update v1.3
- Neue-Wörter-zuerst: Content-Lektion Slot 2 = Karussell mit den neuen Wörtern der Lektion (clears pending), danach erst Übungen.
- js/data-lessons3.js: c11 Adjektive, c12 Vergangenheit, c13 Datum/Wochentage, c14 て-Form-Bitten, c15 Wünsche (たい/ほしい/すき), c16 Hotel. UNITS u5 (c11-c13), u6 (c14-c16). LESSON_BY_ID wird dort ergänzt. Script nach data-lessons2.js in index.html, in sw.js FILES, VERSION jp-app-v4.
- Tests: validate.js (22 Lektionen), audit2.js (keine unbekannten Wörter), bot.js (alle 22 Lektionen ohne Fehler).
- Roadmap: Gründe (から), Höflichkeit, Zählwörter, Konbini, Notfall/Gesundheit, Familie, Wetter, Smalltalk, mehr Kanji, KI-Gespräche (zuletzt).

## Update v1.4
- js/data-lessons4.js: c17 Gründe (から), c18 Zählwörter, c19 Notfall/Gesundheit (Kanji 病院薬), c20 Familie/Smalltalk (父母友), c21 Restaurant/Allergien, c22 Sehenswürdigkeiten (山川). UNITS u7 (c17-c19), u8 (c20-c22). Neue Kanji in data-kanji.js: 病 院 薬 父 母 友 山 川 (insgesamt 79). Script nach data-lessons3.js, in sw.js FILES, VERSION jp-app-v5. 28 Lektionen, 343 Wörter.
- Tests: validate.js, audit2.js (jeweils data-lessons4 ergänzt), bot.js alle 28 Lektionen ohne Fehler.
