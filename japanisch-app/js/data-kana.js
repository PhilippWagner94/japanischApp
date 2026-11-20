'use strict';
/* Kana-Tabellen, Verwechslungsgruppen, Wörter zum Kana-Lesen, Minimalpaare */
function G(script, id, name, chars, romas) {
  const c = chars.split(' '), r = romas.split(' ');
  return { id: script + '-' + id, name, script, chars: c.map((ch, i) => ({ ch, ro: r[i], script })) };
}
const H2K = s => s.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
const K2H = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

const KANA_DEF = [
  ['a', 'あ・い・う・え・お', 'あ い う え お', 'a i u e o'],
  ['k', 'か行', 'か き く け こ', 'ka ki ku ke ko'],
  ['s', 'さ行', 'さ し す せ そ', 'sa shi su se so'],
  ['t', 'た行', 'た ち つ て と', 'ta chi tsu te to'],
  ['n', 'な行', 'な に ぬ ね の', 'na ni nu ne no'],
  ['h', 'は行', 'は ひ ふ へ ほ', 'ha hi fu he ho'],
  ['m', 'ま行', 'ま み む め も', 'ma mi mu me mo'],
  ['y', 'や行', 'や ゆ よ', 'ya yu yo'],
  ['r', 'ら行', 'ら り る れ ろ', 'ra ri ru re ro'],
  ['w', 'わ行 + ん', 'わ を ん', 'wa wo n'],
  ['g', 'が行 (゛)', 'が ぎ ぐ げ ご', 'ga gi gu ge go'],
  ['z', 'ざ行 (゛)', 'ざ じ ず ぜ ぞ', 'za ji zu ze zo'],
  ['d', 'だ行 (゛)', 'だ で ど', 'da de do'],
  ['b', 'ば行 (゛)', 'ば び ぶ べ ぼ', 'ba bi bu be bo'],
  ['p', 'ぱ行 (゜)', 'ぱ ぴ ぷ ぺ ぽ', 'pa pi pu pe po'],
  ['c1', 'Kombinationen 1', 'きゃ きゅ きょ しゃ しゅ しょ ちゃ ちゅ ちょ にゃ にゅ にょ', 'kya kyu kyo sha shu sho cha chu cho nya nyu nyo'],
  ['c2', 'Kombinationen 2', 'ひゃ ひゅ ひょ みゃ みゅ みょ りゃ りゅ りょ', 'hya hyu hyo mya myu myo rya ryu ryo'],
  ['c3', 'Kombinationen 3 (゛゜)', 'ぎゃ ぎゅ ぎょ じゃ じゅ じょ びゃ びゅ びょ ぴゃ ぴゅ ぴょ', 'gya gyu gyo ja ju jo bya byu byo pya pyu pyo'],
];
const HIRA_GROUPS = KANA_DEF.map(d => G('h', d[0], d[1], d[2], d[3]));
const KATA_GROUPS = KANA_DEF.map(d => G('k', d[0], H2K(d[1]), H2K(d[2]), d[3]));
KATA_GROUPS.push(G('k', 'x', 'Katakana-Extras (Fremdlaute)', 'シェ チェ ジェ ティ ディ ファ フィ フェ フォ ウィ ウェ ウォ', 'she che je ti di fa fi fe fo wi we wo'));
const ALL_GROUPS = [...HIRA_GROUPS, ...KATA_GROUPS];
const KANA = {};
ALL_GROUPS.forEach(g => g.chars.forEach(c => { c.group = g.id; KANA[c.ch] = c; }));

/* alternative Romaji-Schreibweisen, die bei Eingaben akzeptiert werden */
const RO_ALT = {
  shi: ['si'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], ji: ['zi', 'di'], zu: ['du'], wo: ['o'], n: ['nn', "n'"],
  sha: ['sya'], shu: ['syu'], sho: ['syo'], cha: ['tya', 'cya'], chu: ['tyu', 'cyu'], cho: ['tyo', 'cyo'],
  ja: ['zya', 'jya'], ju: ['zyu', 'jyu'], jo: ['zyo', 'jyo'], she: ['sye'], che: ['tye'], je: ['zye'],
};

/* optisch ähnliche Zeichen: werden bevorzugt als Falschantworten gewählt */
const KANA_SIM = [
  ['さ', 'ち', 'き'], ['ぬ', 'め', 'ね'], ['わ', 'れ', 'ね'], ['る', 'ろ'], ['は', 'ほ', 'ま'], ['あ', 'お'],
  ['い', 'り'], ['こ', 'に'], ['ゆ', 'や'], ['ふ', 'ぷ', 'ぶ'], ['て', 'と'], ['す', 'む'], ['う', 'ら'],
  ['シ', 'ツ', 'ン', 'ソ'], ['ク', 'ケ', 'タ'], ['ウ', 'ワ', 'フ'], ['ノ', 'メ', 'ヌ'], ['ミ', 'ニ'],
  ['コ', 'ユ'], ['チ', 'テ'], ['マ', 'ム'], ['ス', 'ヌ'], ['ア', 'マ'], ['ラ', 'ヲ'], ['ホ', 'ポ', 'ボ'],
];

/* Wörter nur in Kana: zum Üben von っ, ー, Kombinationen */
const KWORDS = [
  { k: 'がっこう', de: 'Schule' }, { k: 'きって', de: 'Briefmarke' }, { k: 'ざっし', de: 'Zeitschrift' },
  { k: 'おばあさん', de: 'Großmutter' }, { k: 'びょういん', de: 'Krankenhaus' }, { k: 'りょこう', de: 'Reise' },
  { k: 'しゃしん', de: 'Foto' }, { k: 'ちょっと', de: 'ein bisschen' }, { k: 'きょう', de: 'heute' },
  { k: 'にっぽん', de: 'Japan' }, { k: 'ひゃく', de: 'hundert' }, { k: 'しゅくだい', de: 'Hausaufgabe' },
  { k: 'じしょ', de: 'Wörterbuch' }, { k: 'ぎゅうにゅう', de: 'Milch' }, { k: 'でんしゃ', de: 'Zug / Bahn' },
  { k: 'おちゃ', de: 'Tee' }, { k: 'ともだち', de: 'Freund/in' }, { k: 'ありがとう', de: 'danke' },
  { k: 'コーヒー', de: 'Kaffee' }, { k: 'ビール', de: 'Bier' }, { k: 'ホテル', de: 'Hotel' }, { k: 'トイレ', de: 'Toilette' },
  { k: 'ラーメン', de: 'Ramen' }, { k: 'コンビニ', de: 'Supermarkt (24h)' }, { k: 'レストラン', de: 'Restaurant' },
  { k: 'メニュー', de: 'Speisekarte' }, { k: 'タクシー', de: 'Taxi' }, { k: 'バス', de: 'Bus' }, { k: 'ドイツ', de: 'Deutschland' },
  { k: 'カメラ', de: 'Kamera' }, { k: 'テレビ', de: 'Fernseher' }, { k: 'パソコン', de: 'Computer' },
  { k: 'アイスクリーム', de: 'Eiscreme' }, { k: 'チーズ', de: 'Käse' }, { k: 'ケーキ', de: 'Kuchen' },
  { k: 'サッカー', de: 'Fußball' }, { k: 'ハンバーガー', de: 'Hamburger' }, { k: 'シャワー', de: 'Dusche' },
  { k: 'ジュース', de: 'Saft' }, { k: 'ティッシュ', de: 'Taschentuch' },
];

/* Minimalpaare: [Wort A, Bedeutung A, Wort B, Bedeutung B] */
const PAIRS = [
  ['おばさん', 'Tante', 'おばあさん', 'Großmutter'],
  ['おじさん', 'Onkel', 'おじいさん', 'Großvater'],
  ['きて', 'komm', 'きって', 'Briefmarke'],
  ['ゆき', 'Schnee', 'ゆうき', 'Mut'],
  ['びょういん', 'Krankenhaus', 'びよういん', 'Friseursalon'],
  ['しゅじん', 'Ehemann', 'しじん', 'Dichter'],
  ['おと', 'Ton, Geräusch', 'おっと', 'Ehemann'],
  ['ぶた', 'Schwein', 'ふた', 'Deckel'],
  ['さか', 'Hang', 'さっか', 'Schriftsteller'],
  ['ここ', 'hier', 'こうこう', 'Oberschule'],
  ['とる', 'nehmen', 'とおる', 'durchgehen'],
  ['ねこ', 'Katze', 'ねっこ', 'Wurzel'],
  ['まち', 'Stadt', 'まっち', 'Streichholz'],
];

/* zusätzliche einfache Wörter für die frühen Kana-Lektionen */
KWORDS.push(
  { k: 'あお', de: 'blau' }, { k: 'あか', de: 'rot' }, { k: 'いえ', de: 'Haus' }, { k: 'うえ', de: 'oben' }, { k: 'かお', de: 'Gesicht' },
  { k: 'くつ', de: 'Schuhe' }, { k: 'すし', de: 'Sushi' }, { k: 'さかな', de: 'Fisch' }, { k: 'たこ', de: 'Krake' }, { k: 'つき', de: 'Mond' },
  { k: 'ねこ', de: 'Katze' }, { k: 'とけい', de: 'Uhr' }, { k: 'せかい', de: 'Welt' }, { k: 'こえ', de: 'Stimme' }, { k: 'あさ', de: 'Morgen' },
  { k: 'はな', de: 'Blume' }, { k: 'ほん', de: 'Buch' }, { k: 'やま', de: 'Berg' }, { k: 'ひと', de: 'Mensch' }, { k: 'もも', de: 'Pfirsich' },
  { k: 'ふね', de: 'Schiff' }, { k: 'みち', de: 'Weg' }, { k: 'むし', de: 'Insekt' }, { k: 'わたし', de: 'ich' }, { k: 'そら', de: 'Himmel' },
  { k: 'かわ', de: 'Fluss' }, { k: 'みみ', de: 'Ohr' }, { k: 'へや', de: 'Zimmer' }, { k: 'おんな', de: 'Frau' }, { k: 'ほし', de: 'Stern' },
  { k: 'なまえ', de: 'Name' }, { k: 'ゆき', de: 'Schnee' }, { k: 'さくら', de: 'Kirschblüte' }, { k: 'りんご', de: 'Apfel' }, { k: 'たまご', de: 'Ei' },
  { k: 'まど', de: 'Fenster' }, { k: 'かぎ', de: 'Schlüssel' }, { k: 'ひゃく', de: 'hundert' },
  { k: 'アイス', de: 'Eis' }, { k: 'ケーキ', de: 'Kuchen' }, { k: 'テニス', de: 'Tennis' }, { k: 'スカート', de: 'Rock' }, { k: 'セーター', de: 'Pullover' },
  { k: 'カナダ', de: 'Kanada' }, { k: 'ミルク', de: 'Milch' }, { k: 'マスク', de: 'Maske' }, { k: 'ハム', de: 'Schinken' }, { k: 'メモ', de: 'Notiz' },
  { k: 'ナイフ', de: 'Messer' }, { k: 'タオル', de: 'Handtuch' }, { k: 'ワイン', de: 'Wein' }, { k: 'ゲーム', de: 'Spiel' }, { k: 'パン', de: 'Brot' },
  { k: 'ドア', de: 'Tür' }, { k: 'ベッド', de: 'Bett' }, { k: 'ペン', de: 'Stift' }, { k: 'ポスト', de: 'Briefkasten' }, { k: 'ゴルフ', de: 'Golf' },
);
