'use strict';
/* Kanji-Werkstatt: Bildkanji (Herkunft) und Bausteine (Radikale mit Kanji-Familien) */

/* Bildkanji: [Zeichen, Emoji, Bedeutung, Geschichte, Lesung] */
const KW_PICS = [
  { id: 'kp1', title: 'Natur', icon: '🌳', items: [
    ['日', '☀️', 'Sonne, Tag', 'Die runde Sonne, später eckig geschrieben.', 'ひ・にち'],
    ['月', '🌙', 'Mond, Monat', 'Eine Mondsichel mit einem Strich im Inneren.', 'つき・げつ'],
    ['木', '🌳', 'Baum', 'Stamm, Äste und Wurzeln eines Baums.', 'き・もく'],
    ['火', '🔥', 'Feuer', 'Eine lodernde Flamme mit Funken.', 'ひ・か'],
    ['水', '💧', 'Wasser', 'Ein Strom mit Spritzern links und rechts.', 'みず・すい'],
    ['山', '⛰️', 'Berg', 'Drei Gipfel nebeneinander.', 'やま・さん'],
    ['川', '🏞️', 'Fluss', 'Drei Linien: fließendes Wasser.', 'かわ・せん'],
    ['田', '🌾', 'Reisfeld', 'Ein Feld, das in Parzellen unterteilt ist.', 'た・でん'],
  ] },
  { id: 'kp2', title: 'Körper und Mensch', icon: '🧍', items: [
    ['口', '👄', 'Mund', 'Ein offener Mund.', 'くち・こう'],
    ['目', '👁️', 'Auge', 'Ein Auge, hochkant gedreht.', 'め・もく'],
    ['耳', '👂', 'Ohr', 'Eine Ohrmuschel.', 'みみ・じ'],
    ['手', '✋', 'Hand', 'Eine Hand mit Fingern.', 'て・しゅ'],
    ['足', '🦶', 'Fuß, Bein', 'Ein Knie (Quadrat) über einem Fuß.', 'あし・そく'],
    ['人', '🚶', 'Mensch', 'Ein Mensch von der Seite, der geht.', 'ひと・じん'],
    ['女', '👩', 'Frau', 'Eine kniende Frau mit verschränkten Armen.', 'おんな・じょ'],
    ['子', '👶', 'Kind', 'Ein Kind mit großem Kopf und Armen.', 'こ・し'],
  ] },
  { id: 'kp3', title: 'Dinge und Tiere', icon: '🐟', items: [
    ['雨', '🌧️', 'Regen', 'Wolken am Himmel, aus denen Tropfen fallen.', 'あめ・う'],
    ['車', '🚗', 'Wagen', 'Ein Wagen von oben: Achse und zwei Räder.', 'くるま・しゃ'],
    ['門', '⛩️', 'Tor', 'Zwei Flügeltüren eines Tores.', 'もん'],
    ['犬', '🐕', 'Hund', 'Ein Hund mit Ohr und Schwanz.', 'いぬ・けん'],
    ['魚', '🐟', 'Fisch', 'Kopf, Körper und Schwanzflosse eines Fisches.', 'さかな・ぎょ'],
    ['鳥', '🐦', 'Vogel', 'Ein Vogel mit Schnabel, Auge und Schwanz.', 'とり・ちょう'],
    ['馬', '🐴', 'Pferd', 'Ein Pferd mit Mähne und vier Beinen.', 'うま・ば'],
    ['力', '💪', 'Kraft', 'Ein angespannter Arm.', 'ちから・りょく'],
  ] },
];

/* Bausteine: r = Baustein, alt = lange Form, members = [Zeichen, Bedeutung, Lesung], decoys = Zeichen ohne diesen Baustein */
const KW_FAMS = [
  { id: 'kf1', r: '氵', alt: '水', name: 'Wasser', pic: '💧', story: 'Drei Tropfen sind die Kurzform von 水 (Wasser). Steht der Baustein links in einem Kanji, hat es meist mit Wasser oder Flüssigkeit zu tun.',
    members: [['湯', 'heißes Wasser, Bad', 'ゆ'], ['流', 'fließen', 'ながれる'], ['泣', 'weinen', 'なく'], ['海', 'Meer', 'うみ'], ['池', 'Teich', 'いけ'], ['洗', 'waschen', 'あらう'], ['泳', 'schwimmen', 'およぐ'], ['港', 'Hafen', 'みなと']],
    decoys: ['悩', '葉', '記', '持', '銀', '道'] },
  { id: 'kf2', r: '言', alt: '訁', name: 'Sprechen, Worte', pic: '🗣️', story: '言 bedeutet „sagen“. In Kanji steht er oft links und zeigt: Es geht um Sprache, Worte oder Schrift.',
    members: [['話', 'sprechen', 'はなす'], ['語', 'Sprache', 'ご'], ['読', 'lesen', 'よむ'], ['記', 'aufschreiben', 'き'], ['計', 'messen, planen', 'けい'], ['説', 'erklären', 'せつ'], ['訳', 'übersetzen', 'やく']],
    decoys: ['湯', '持', '葉', '銀', '道', '時'] },
  { id: 'kf3', r: '木', alt: '', name: 'Baum, Holz', pic: '🌳', story: 'Stamm, Äste und Wurzeln. Kanji mit 木 handeln von Bäumen, Holz und Dingen aus Holz.',
    members: [['林', 'Wäldchen', 'はやし'], ['森', 'Wald', 'もり'], ['校', 'Schule', 'こう'], ['村', 'Dorf', 'むら'], ['桜', 'Kirschbaum', 'さくら'], ['橋', 'Brücke', 'はし'], ['板', 'Brett', 'いた'], ['机', 'Schreibtisch', 'つくえ']],
    decoys: ['湯', '話', '道', '銀', '持', '悩'] },
  { id: 'kf4', r: '扌', alt: '手', name: 'Hand', pic: '✋', story: 'Kurzform von 手 (Hand). Links in einem Kanji steht er für Tätigkeiten, die man mit der Hand macht.',
    members: [['持', 'halten, tragen', 'もつ'], ['打', 'schlagen', 'うつ'], ['押', 'drücken', 'おす'], ['拾', 'aufheben', 'ひろう'], ['投', 'werfen', 'なげる'], ['指', 'Finger', 'ゆび'], ['探', 'suchen', 'さがす']],
    decoys: ['湯', '話', '校', '道', '銀', '悩', '花'] },
  { id: 'kf5', r: '亻', alt: '人', name: 'Mensch', pic: '🚶', story: 'Kurzform von 人 (Mensch von der Seite). Links in einem Kanji: Menschen und menschliche Tätigkeiten.',
    members: [['休', 'ausruhen', 'やすむ'], ['住', 'wohnen', 'すむ'], ['何', 'was', 'なに'], ['他', 'andere', 'ほか'], ['作', 'herstellen', 'つくる'], ['体', 'Körper', 'からだ'], ['低', 'niedrig', 'ひくい'], ['便', 'bequem', 'べん']],
    decoys: ['湯', '話', '持', '銀', '道', '悩'] },
  { id: 'kf6', r: '忄', alt: '心', name: 'Herz, Gefühl', pic: '❤️', story: '心 ist das Herz. Links wird er zu 忄 (drei Striche). Diese Kanji handeln von Gefühlen, Gedanken und dem Seelenleben.',
    members: [['悩', 'sich sorgen', 'なやむ'], ['快', 'angenehm', 'かい'], ['情', 'Gefühl', 'じょう'], ['慣', 'sich gewöhnen', 'なれる'], ['怖', 'furchterregend', 'こわい'], ['忙', 'beschäftigt', 'いそがしい'], ['思', 'denken', 'おもう'], ['急', 'sich beeilen', 'いそぐ'], ['感', 'fühlen', 'かん'], ['愛', 'Liebe', 'あい']],
    decoys: ['湯', '話', '持', '銀', '道', '花', '校'] },
  { id: 'kf7', r: '辶', alt: '', name: 'Weg, Gehen', pic: '🛣️', story: 'Ein Fuß auf einer Straße. Kanji mit diesem Baustein haben mit Bewegung, Wegen und Reisen zu tun.',
    members: [['道', 'Weg', 'みち'], ['送', 'schicken', 'おくる'], ['近', 'nah', 'ちかい'], ['遠', 'weit', 'とおい'], ['週', 'Woche', 'しゅう'], ['通', 'hindurchgehen', 'とおる'], ['運', 'befördern', 'はこぶ'], ['返', 'zurückgeben', 'かえす'], ['迷', 'sich verirren', 'まよう']],
    decoys: ['湯', '話', '持', '銀', '悩', '村'] },
  { id: 'kf8', r: '艹', alt: '草', name: 'Pflanze', pic: '🌱', story: 'Zwei Pflänzchen am oberen Rand (Kurzform von 草, Gras). Steht oben in Kanji für Pflanzen, Blumen und Gemüse.',
    members: [['花', 'Blume', 'はな'], ['草', 'Gras', 'くさ'], ['茶', 'Tee', 'ちゃ'], ['葉', 'Blatt', 'は'], ['薬', 'Medizin', 'くすり'], ['菜', 'Gemüse', 'な'], ['荷', 'Last, Gepäck', 'に']],
    decoys: ['湯', '話', '持', '銀', '悩', '道', '校'] },
  { id: 'kf9', r: '金', alt: '', name: 'Metall, Gold', pic: '🪙', story: '金 bedeutet Gold, Metall und Geld. Links in einem Kanji zeigt er: Es ist ein Metall oder ein Gegenstand aus Metall.',
    members: [['銀', 'Silber', 'ぎん'], ['銅', 'Kupfer', 'どう'], ['鉄', 'Eisen', 'てつ'], ['針', 'Nadel', 'はり'], ['鏡', 'Spiegel', 'かがみ'], ['鍵', 'Schlüssel', 'かぎ']],
    decoys: ['湯', '話', '持', '悩', '道', '花'] },
  { id: 'kf10', r: '日', alt: '', name: 'Sonne, Tag', pic: '☀️', story: 'Die Sonne. Kanji mit 日 haben mit Tageslicht, Zeit, Himmel und Wetter zu tun.',
    members: [['明', 'hell', 'あかるい'], ['時', 'Zeit, Uhr', 'じ'], ['晴', 'klares Wetter', 'はれ'], ['暗', 'dunkel', 'くらい'], ['星', 'Stern', 'ほし'], ['昼', 'Mittag', 'ひる'], ['映', 'Film, spiegeln', 'えい']],
    decoys: ['話', '持', '銀', '悩', '道', '村'] },
  { id: 'kf11', r: '女', alt: '', name: 'Frau', pic: '👩', story: 'Eine kniende Frau. Kanji mit 女 betreffen Frauen und Familienbeziehungen, aber auch einige Gefühle.',
    members: [['好', 'mögen', 'すき'], ['嫌', 'nicht mögen', 'きらい'], ['妹', 'jüngere Schwester', 'いもうと'], ['姉', 'ältere Schwester', 'あね'], ['妻', 'Ehefrau', 'つま'], ['姓', 'Familienname', 'せい'], ['娘', 'Tochter', 'むすめ'], ['姫', 'Prinzessin', 'ひめ']],
    decoys: ['湯', '話', '持', '銀', '悩', '道', '花'] },
];
const KWM = {};
KW_FAMS.forEach(f => f.members.forEach(m => { KWM[m[0]] = { c: m[0], de: m[1], read: m[2], fam: f.id }; }));
