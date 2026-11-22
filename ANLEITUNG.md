# 日本語 Lern-App: Anleitung

## 1. App auf dein Handy bringen (einmalig, kostenlos)

Die App ist eine reine Web-App (keine Installation von Programmen nötig). Sie muss einmal im Internet erreichbar sein, damit du sie auf dem Handy installieren kannst. Danach läuft sie offline. Deine Lerndaten bleiben nur auf deinem Gerät.

**Variante A: Netlify Drop (am einfachsten, ca. 2 Minuten)**
1. Entpacke die ZIP-Datei auf deinem Computer.
2. Öffne https://app.netlify.com/drop und ziehe den entpackten Ordner `japanisch-app` ins Fenster.
3. Du bekommst eine Adresse wie `https://xyz.netlify.app`. Öffne sie auf dem Handy.

**Variante B: GitHub Pages**
1. Neues Repository bei GitHub anlegen, alle Dateien hochladen.
2. Settings → Pages → Branch `main` → Folder `/ (root)` → Save.
3. Adresse: `https://DEINNAME.github.io/REPONAME/`

## 2. Auf dem Handy installieren
- **Android (Chrome):** Menü (⋮) → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
- **iPhone (Safari):** Teilen-Symbol → „Zum Home-Bildschirm“.

Öffne die App danach einmal mit Internet, damit alles zwischengespeichert wird. Danach funktioniert sie auch ohne Netz.

## 3. Wichtig für Ton und Sprechen
- **Sprachausgabe:** nutzt die japanische Stimme deines Geräts. Android: Einstellungen → Sprache → Text-to-Speech → Google → japanische Stimme installieren. iPhone: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Japanisch.
- **Spracherkennung (Nachsprechen):** funktioniert am besten in Chrome auf Android und am PC (Chrome/Edge), braucht meist Internet und Mikrofon-Erlaubnis. Auf Geräten ohne Erkennung kannst du dich selbst bewerten.
- Stimme prüfen: Mehr → Einstellungen → „Testsatz anhören“.

## 4. Backup
Mehr → Backup → „Daten exportieren“. Mit „Importieren“ kannst du die Datei auf einem anderen Gerät laden. Bitte alle ein bis zwei Wochen sichern, denn wenn du die Browserdaten löschst, sind die Lerndaten weg.

## 5. Was drin ist (Version 1)
- Einstufungstest, Tagesziel, Streak, Punkte (1 Punkt pro bestandener Lektion, Mindestquote einstellbar)
- 16 Lektionen in 4 Einheiten: Hiragana, Katakana, Begrüßung, Vorstellen, Fragen, Zahlen, Uhrzeit, Essen und Bestellen, Einkaufen, Wege, Verben (ます-Form), Zug und Reisen
- Jede Lektion: 19 Übungen (Aufwärmen, neue Wörter, Zuordnen, Hören, Diktat, Lesen, Kanji, Partikel, Satzbau, Grammatik, Übersetzen, Nachsprechen, ähnliche Laute, Lesetext, Hörtext, Rollenspiel, Fehler-Wiederholung)
- ca. 140 Wörter, 98 Kana-Übungswörter, 50 Kanji (nach Reise-Nutzen), 50 Beispielsätze
- Wiederholungssystem mit Mastery-Regel (richtig in mehreren Formen), Fehleranalyse nach Art, „Schwächen üben“
- Karteikarten nach Themen, Kanji-Übersicht, Kana-Tabelle, Reise-Phrasen mit Notfallsätzen, Statistik, Backup

## 6. Noch offen (nächste Ausbaustufen)
Mehr Lektionen (Vergangenheit, て-Form, Wünsche, Gründe, Höflichkeitsstufen), mehr Kanji und Vokabeln bis ca. 1.100 Wörter, Strichfolge-Übung, KI-Gespräche über dein eigenes Modell im WLAN (Stufe 2).

## 7. Hinweis zu den Inhalten
Alle Inhalte sind selbst erstellt und nicht von einer Muttersprachlerin / einem Muttersprachler geprüft. Falls dir etwas komisch vorkommt, sag mir Bescheid, ich korrigiere es.

## Update einspielen (Version 1.1)
Lade im GitHub-Repository alle Dateien aus diesem Ordner erneut hoch und überschreibe die alten (besonders `js/`, `style.css`, `sw.js`). Warte 1 bis 2 Minuten, öffne die App einmal mit Internet und schließe sie danach komplett. Beim nächsten Öffnen ist die neue Version aktiv. Deine Lerndaten bleiben dabei erhalten.

Neu in 1.1: Kana-Auswahl statt Tastatur beim Schreiben, natürlichere Verabschiedungen (またね), tolerantere Spracherkennung mit Selbstkorrektur, Gesamtlernzeit, Schnelltest ⏩ pro Lektion und Empfehlung nach dem Einstufungstest.

## Update 1.2: Ton
Die Sprachausgabe probiert jetzt automatisch andere Stimmen, wenn die gewählte nicht antwortet, und zeigt eine Meldung statt Stille. Unter Mehr → Einstellungen → Ton-Diagnose kannst du eine Stimme auswählen und testen.

## Update auf 1.3
Alle Dateien des entpackten Ordners im GitHub-Repo ersetzen (neu: js/data-lessons3.js), einmal online öffnen, App komplett schließen und neu starten.

## Update auf 1.4
Alle Dateien des Ordners im GitHub-Repo ersetzen (neu: js/data-lessons4.js), einmal online öffnen, App komplett schließen und neu starten.
