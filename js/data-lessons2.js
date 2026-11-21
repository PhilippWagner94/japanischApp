'use strict';
LESSONS.push(
  { id: 'c5', type: 'content', title: 'Uhrzeit und Tage', icon: '🕐', deck: 'Zeit',
    words: [
      ['いま', '今', 'jetzt', '⏰'], ['じ', '時', '... Uhr', '🕐'], ['ふん', '分', '... Minuten', '⏱️'], ['はん', '半', 'halb', '🕧'],
      ['なんじ', '何時', 'wie viel Uhr', '❓'], ['きょう', '今日', 'heute', '📅'], ['あした', '', 'morgen', '➡️'],
      ['きのう', '', 'gestern', '⬅️'], ['あさ', '', 'Morgen', '🌅'], ['ごご', '', 'Nachmittag / p.m.', '🌇'], ['ごぜん', '', 'Vormittag / a.m.', '🌄'],
      ['まいにち', '', 'jeden Tag', '🔁'], ['あさって', '', 'übermorgen', '⏭️'],
    ],
    kanji: ['今', '時', '分', '半'],
    sents: [
      { s: '今[いま]|なん|じ|です|か', de: 'Wie spät ist es?' },
      { s: '今[いま]|は|三時[さんじ]|です', de: 'Es ist jetzt drei Uhr.' },
      { s: '三時[さんじ]|半[はん]|です', de: 'Es ist halb vier.' },
      { s: '電車[でんしゃ]|は|何時[なんじ]|です|か', de: 'Um wie viel Uhr fährt der Zug?' },
      { s: 'ごご|五時[ごじ]|です', de: 'Es ist 17 Uhr.' },
    ],
    grammar: {
      title: 'Uhrzeit sagen',
      body: [
        'Uhrzeit = Zahl + じ (時): 1 Uhr いちじ, 2 Uhr にじ, 3 Uhr さんじ. Ausnahmen: 4 Uhr よじ (nicht よんじ), 7 Uhr しちじ, 9 Uhr くじ.',
        'Minuten = Zahl + ふん/ぷん (分). Das Wort verändert sich: いっぷん, にふん, さんぷん, よんぷん, ごふん, ろっぷん, ななふん, はっぷん, きゅうふん, じゅっぷん.',
        'Halb = はん (半): さんじはん = 3:30 Uhr.',
        'ごぜん = vormittags (a.m.), ごご = nachmittags (p.m.). Fahrpläne verwenden oft die 24-Stunden-Zeit.',
      ],
      ex: [['三時[さんじ]|半[はん]', '3:30 Uhr'], ['四時[よじ]', '4 Uhr']],
      check: { q: 'Wie heißt „4 Uhr“?', o: ['よじ', 'よんじ', 'しじ', 'よじゅう'], a: 0 },
    },
    reading: {
      lines: ['電車[でんしゃ]|は|ごご|三時[さんじ]|です。', 'あと|ごふん|です。'],
      de: 'Der Zug fährt um 15 Uhr. Noch 5 Minuten.',
      q: [{ q: 'Wann fährt der Zug?', o: ['15 Uhr', '5 Uhr', '3 Uhr morgens', '13 Uhr'], a: 0 }],
    },
    listen: {
      text: '今[いま]|は|ごご|七時[しちじ]|です。', de: 'Es ist jetzt 19 Uhr.',
      q: [{ q: 'Wie spät ist es?', o: ['19 Uhr', '7 Uhr morgens', '17 Uhr', '9 Uhr'], a: 0 }],
    },
    dialog: {
      title: 'Wie spät ist es?',
      turns: [
        { a: '今[いま]|なん|じ|です|か。', hint: 'Sag: Es ist 3 Uhr.', o: ['三時[さんじ]|です。', 'こんにちは。', 'さようなら。'] },
        { a: '電車[でんしゃ]|は|何時[なんじ]|です|か。', hint: 'Sag: Um 4 Uhr.', o: ['四時[よじ]|です。', 'ドイツじん|です。', 'かさ|です。'] },
        { a: '電車[でんしゃ]|は|五時[ごじ]|です|か。', hint: 'Nein: Der Zug fährt um 6 Uhr.', o: ['いいえ、六時[ろくじ]|です。', 'こんばんは。', 'さようなら。'] },
      ],
    },
  },
  { id: 'c6', type: 'content', title: 'Essen und Bestellen', icon: '🍜', deck: 'Essen & Trinken',
    words: [
      ['みず', '水', 'Wasser', '💧'], ['おちゃ', '', 'Tee', '🍵'], ['コーヒー', '', 'Kaffee', '☕'], ['ビール', '', 'Bier', '🍺'],
      ['ラーメン', '', 'Ramen', '🍜'], ['すし', '', 'Sushi', '🍣'], ['ごはん', '', 'Reis; Mahlzeit', '🍚'], ['にく', '', 'Fleisch', '🥩'],
      ['さかな', '', 'Fisch', '🐟'], ['やさい', '', 'Gemüse', '🥬'], ['メニュー', '', 'Speisekarte', '📋'], ['ください', '', 'bitte geben Sie mir', '🙏'],
      ['おいしい', '', 'lecker', '😋'], ['いただきます', '', 'Guten Appetit (vor dem Essen)', '🙏'], ['ごちそうさま', '', 'Danke fürs Essen (danach)', '😊'],
      ['おねがいします', '', 'bitte (beim Bestellen)', '🙇'],
    ],
    kanji: ['水', '食', '飲'],
    sents: [
      { s: 'みず|を|ください', de: 'Wasser, bitte.' },
      { s: 'ラーメン|を|ふたつ|ください', de: 'Zweimal Ramen, bitte.' },
      { s: 'メニュー|を|おねがい|します', de: 'Die Speisekarte bitte.' },
      { s: 'これ|は|おいしい|です', de: 'Das ist lecker.' },
      { s: 'ビール|を|飲[の]|みます', de: 'Ich trinke Bier.' },
      { s: 'すし|を|食[た]|べます', de: 'Ich esse Sushi.' },
    ],
    grammar: {
      title: 'Bestellen mit を und ください',
      body: [
        'を markiert das direkte Objekt (das, was man isst, trinkt, kauft): みずを ください = „Wasser bitte“. Gesprochen wie „o“.',
        'Zählwörter für Dinge: ひとつ (1), ふたつ (2), みっつ (3), よっつ (4), いつつ (5), むっつ (6), ななつ (7), やっつ (8), ここのつ (9), とお (10). ラーメンを ふたつ ください = zwei Ramen.',
        'Zum Bestellen reicht oft: [Ding] をください oder [Ding] を おねがいします. 〜を おねがいします ist etwas höflicher.',
        'Vor dem Essen sagt man いただきます, danach ごちそうさま (でした). Das gehört in Japan zum guten Ton.',
      ],
      ex: [['ラーメン|を|ふたつ|ください', 'Zweimal Ramen, bitte.'], ['みず|を|おねがい|します', 'Wasser bitte.']],
      check: { q: 'Welche Partikel markiert das Objekt?', o: ['を', 'は', 'に', 'か'], a: 0 },
    },
    reading: {
      lines: ['メニュー', 'ラーメン　九百[きゅうひゃく]円[えん]', 'ごはん　三百[さんびゃく]円[えん]', 'おちゃ　二百[にひゃく]円[えん]'],
      de: 'Speisekarte: Ramen 900 Yen, Reis 300 Yen, Tee 200 Yen.',
      q: [{ q: 'Wie viel kostet der Tee?', o: ['200 Yen', '300 Yen', '900 Yen', '100 Yen'], a: 0 }],
    },
    listen: {
      text: 'ラーメン|を|ひとつ|と、ビール|を|ふたつ|ください。', de: 'Einmal Ramen und zweimal Bier, bitte.',
      q: [{ q: 'Wie viele Biere werden bestellt?', o: ['2', '1', '3', '4'], a: 0 }],
    },
    dialog: {
      title: 'Im Restaurant',
      turns: [
        { a: 'いらっしゃいませ。', hint: 'Der Kellner begrüßt dich. Bitte um die Speisekarte.', o: ['メニュー|を|おねがい|します。', 'さようなら。', 'ごめんなさい。'] },
        { a: 'ごちゅうもん|は?', hint: 'Bestelle einmal Ramen.', o: ['ラーメン|を|ひとつ|ください。', 'わたし|は|ラーメン|です。', 'ありがとう。'] },
        { a: 'おのみもの|は?', hint: 'Bestelle ein Bier.', o: ['ビール|を|ください。', 'ビール|は|学生[がくせい]|です。', 'こんにちは。'] },
        { a: 'ありがとう|ございました。', hint: 'Du hast aufgegessen.', o: ['ごちそうさま|でした。', 'いただきます。', 'はじめまして。'] },
      ],
    },
  },
  { id: 'c7', type: 'content', title: 'Einkaufen und Preise', icon: '🛍️', deck: 'Einkaufen',
    words: [
      ['いくら', '', 'wie viel (kostet)', '💴'], ['えん', '円', 'Yen', '💴'], ['ひゃく', '百', 'hundert', '💯'], ['せん', '千', 'tausend', '🔢'],
      ['まん', '万', 'zehntausend', '🔢'], ['たかい', '', 'teuer / hoch', '📈'], ['やすい', '', 'billig', '📉'], ['みせ', '', 'Geschäft', '🏪'],
      ['コンビニ', '', 'Convenience Store', '🏪'], ['ふくろ', '', 'Tüte', '🛍️'], ['カード', '', 'Karte', '💳'], ['げんきん', '', 'Bargeld', '💵'],
      ['レシート', '', 'Kassenbon', '🧾'], ['ぜんぶで', '', 'insgesamt', '➕'],
    ],
    kanji: ['円', '百', '千', '万'],
    sents: [
      { s: 'これ|は|いくら|です|か', de: 'Wie viel kostet das?' },
      { s: '千円[せんえん]|です', de: 'Es kostet 1.000 Yen.' },
      { s: 'これ|は|ちょっと|高[たか]い|です', de: 'Das ist ein bisschen teuer.' },
      { s: 'カード|は|つかえ|ます|か', de: 'Kann man mit Karte zahlen?' },
      { s: 'ふくろ|は|いりません', de: 'Ich brauche keine Tüte.' },
    ],
    grammar: {
      title: 'Große Zahlen und Preise',
      body: [
        '百 (ひゃく) = 100, 千 (せん) = 1.000, 万 (まん) = 10.000. Japanisch zählt in 10.000er-Einheiten: 100.000 = 十万 (10 × 万), 1.000.000 = 百万.',
        'Lautwechsel: 300 = さんびゃく, 600 = ろっぴゃく, 800 = はっぴゃく, 3.000 = さんぜん, 8.000 = はっせん.',
        'Bei Preisen schaust du zuerst auf 円 (えん, Yen). 1.980円 liest man せんきゅうひゃくはちじゅうえん.',
        'Adjektive wie たかい / やすい / おいしい enden auf い und brauchen im Satz kein です für die Grammatik, nur für die Höflichkeit.',
      ],
      ex: [['三百[さんびゃく]|円[えん]', '300 Yen'], ['千[せん]|五百[ごひゃく]|円[えん]', '1.500 Yen']],
      check: { q: 'Wie heißt 300?', o: ['さんびゃく', 'さんひゃく', 'みひゃく', 'さんぴゃく'], a: 0 },
    },
    reading: {
      lines: ['おにぎり　百二十[ひゃくにじゅう]円[えん]', 'おちゃ　百五十[ひゃくごじゅう]円[えん]', 'パン　二百[にひゃく]円[えん]'],
      de: 'Reisball 120 Yen, Tee 150 Yen, Brot 200 Yen.',
      q: [{ q: 'Was kostet 200 Yen?', o: ['Brot', 'Tee', 'Reisball', 'nichts davon'], a: 0 }],
    },
    listen: {
      text: 'ぜんぶ|で|五百[ごひゃく]|円[えん]|です。', de: 'Insgesamt 500 Yen.',
      q: [{ q: 'Wie viel kostet es insgesamt?', o: ['500 Yen', '50 Yen', '5.000 Yen', '1.500 Yen'], a: 0 }],
    },
    dialog: {
      title: 'Im Laden',
      turns: [
        { a: 'いらっしゃいませ。', hint: 'Frage nach dem Preis.', o: ['これ|は|いくら|です|か。', 'わたし|は|ドイツじん|です。', 'おやすみなさい。'] },
        { a: '三百[さんびゃく]|円[えん]|です。', hint: 'Frage, ob du mit Karte zahlen kannst.', o: ['カード|は|つかえ|ます|か。', 'どういたしまして。', 'ごめんなさい。'] },
        { a: 'はい、つかえ|ます。ふくろ|は?', hint: 'Du brauchst keine Tüte.', o: ['ふくろ|は|いりません。', 'ふくろ|を|ください、ビール|です。', 'さようなら。'] },
      ],
    },
  },
  { id: 'c8', type: 'content', title: 'Wege und Orte', icon: '🧭', deck: 'Orte & Wege',
    words: [
      ['どこ', '', 'wo / wohin', '📍'], ['ここ', '', 'hier', '📍'], ['そこ', '', 'dort', '📍'], ['あそこ', '', 'dort drüben', '📍'],
      ['えき', '駅', 'Bahnhof', '🚉'], ['トイレ', '', 'Toilette', '🚻'], ['ホテル', '', 'Hotel', '🏨'], ['みぎ', '右', 'rechts', '➡️'],
      ['ひだり', '左', 'links', '⬅️'], ['まっすぐ', '', 'geradeaus', '⬆️'], ['ちかい', '', 'nah', '📏'], ['とおい', '', 'weit', '📏'],
      ['でぐち', '出口', 'Ausgang', '🚪'], ['いりぐち', '入口', 'Eingang', '🚪'], ['うえ', '上', 'oben', '⬆️'], ['した', '下', 'unten', '⬇️'], ['なか', '中', 'Mitte; in', '🔘'],
    ],
    kanji: ['駅', '右', '左', '出', '入', '口', '上', '下', '中'],
    sents: [
      { s: 'えき|は|どこ|です|か', de: 'Wo ist der Bahnhof?' },
      { s: 'トイレ|は|あそこ|です', de: 'Die Toilette ist dort drüben.' },
      { s: '右[みぎ]|に|ホテル|が|あります', de: 'Rechts ist ein Hotel.' },
      { s: 'まっすぐ|行[い]|って|ください', de: 'Gehen Sie bitte geradeaus.' },
      { s: 'えき|は|ここ|から|ちかい|です', de: 'Der Bahnhof ist von hier aus nah.' },
      { s: '出口[でぐち]|は|どこ|です|か', de: 'Wo ist der Ausgang?' },
    ],
    grammar: {
      title: 'Fragen nach dem Weg: どこ と に',
      body: [
        'A は どこですか = „Wo ist A?“. Antwort: A は ここ/そこ/あそこ です.',
        'に zeigt den Ort, an dem etwas steht (mit あります/います): 右に ホテルが あります = Rechts ist ein Hotel. Mit に gibt man auch das Ziel einer Bewegung an: えきに いきます = Ich gehe zum Bahnhof.',
        'が markiert das Subjekt, besonders bei neuen Informationen: ホテルが あります. あります = es gibt (leblose Dinge), います = es gibt (Lebewesen).',
        'Richtungen: まっすぐ (geradeaus), みぎ, ひだり. Wichtige Schilder: 出口 (Ausgang), 入口 (Eingang), 上 / 下.',
      ],
      ex: [['えき|は|どこ|です|か', 'Wo ist der Bahnhof?'], ['右[みぎ]|に|ホテル|が|あります', 'Rechts ist ein Hotel.']],
      check: { q: 'Welches Wort heißt „Ausgang“?', o: ['出口', '入口', '右口', '上口'], a: 0 },
    },
    reading: {
      lines: ['出口[でぐち]　→　右[みぎ]', '入口[いりぐち]　→　左[ひだり]', 'トイレ　→　下[した]'],
      de: 'Ausgang rechts. Eingang links. Toilette unten.',
      q: [{ q: 'Wo ist die Toilette?', o: ['unten', 'oben', 'rechts', 'links'], a: 0 }],
    },
    listen: {
      text: 'えき|は|まっすぐ|です。右[みぎ]|に|ホテル|が|あります。', de: 'Der Bahnhof ist geradeaus. Rechts ist ein Hotel.',
      q: [{ q: 'Was ist auf der rechten Seite?', o: ['ein Hotel', 'ein Bahnhof', 'eine Toilette', 'ein Laden'], a: 0 }],
    },
    dialog: {
      title: 'Nach dem Weg fragen',
      turns: [
        { a: 'どう|しました|か。', hint: 'Du suchst den Bahnhof. Frage höflich nach dem Weg.', o: ['すみません、えき|は|どこ|です|か。', 'すみません、わたし|は|えき|です。', 'さようなら。'] },
        { a: 'えき|です|か。まっすぐ|行[い]|って、右[みぎ]|です。', hint: 'Bedanke dich.', o: ['ありがとう|ございます。', 'ごめんなさい。', 'こんばんは。'] },
        { a: 'どういたしまして。', hint: 'Bedanke dich zum Abschied noch einmal.', o: ['ありがとう|ございました。', 'はじめまして。', 'いただきます。'] },
      ],
    },
  },
  { id: 'c9', type: 'content', title: 'Verben: ます-Form', icon: '🏃', deck: 'Verben',
    words: [
      ['いきます', '行きます', 'gehen', '🚶'], ['きます', '来ます', 'kommen', '🏃'], ['かえります', '帰ります', 'nach Hause gehen', '🏠'],
      ['たべます', '食べます', 'essen', '🍽️'], ['のみます', '飲みます', 'trinken', '🥤'], ['みます', '見ます', 'sehen', '👀'],
      ['ききます', '聞きます', 'hören', '👂'], ['かいます', '買います', 'kaufen', '🛒'], ['します', '', 'machen', '🔧'],
      ['はなします', '話します', 'sprechen', '🗣️'], ['よみます', '読みます', 'lesen', '📖'], ['かきます', '書きます', 'schreiben', '✍️'],
      ['あいます', '会います', 'treffen', '🤝'], ['わかります', '', 'verstehen', '💡'],
    ],
    kanji: ['行', '来', '見', '食', '飲'],
    sents: [
      { s: 'えき|に|行[い]|きます', de: 'Ich gehe zum Bahnhof.' },
      { s: 'まいにち|日本語[にほんご]|を|べんきょう|します', de: 'Ich lerne jeden Tag Japanisch.' },
      { s: 'あした|京都[きょうと]|に|行[い]|きます', de: 'Morgen fahre ich nach Kyoto.' },
      { s: 'すし|を|食[た]|べます|か', de: 'Isst du Sushi?' },
      { s: 'ラーメン|を|食[た]|べません', de: 'Ich esse kein Ramen.' },
      { s: 'きのう|おちゃ|を|飲[の]|みました', de: 'Gestern habe ich Tee getrunken.' },
    ],
    grammar: {
      title: 'Verben in der höflichen ます-Form',
      body: [
        'Höfliche Verben enden auf ます. Das gilt für Gegenwart und Zukunft: たべます = „ich esse / ich werde essen“.',
        'Verneinung: ません (たべません). Vergangenheit: ました (たべました). Vergangenheit verneint: ませんでした (たべませんでした).',
        'Die Wortstellung ist immer: Zeit – Ort/Ziel に – Objekt を – Verb. あした えきに ビールを のみます.',
        'に markiert das Ziel einer Bewegung (いきます, きます, かえります). で zeigt, wo eine Handlung stattfindet: レストランで たべます.',
      ],
      ex: [['すし|を|食[た]|べます', 'Ich esse Sushi.'], ['すし|を|食[た]|べませんでした', 'Ich habe kein Sushi gegessen.']],
      check: { q: 'Wie heißt „ich habe gegessen“?', o: ['たべました', 'たべます', 'たべません', 'たべませんでした'], a: 0 },
    },
    reading: {
      lines: ['きのう、わたし|は|えき|に|行[い]|きました。', 'そして、すし|を|食[た]|べました。', 'ビール|は|飲[の]|みません|でした。'],
      de: 'Gestern ging ich zum Bahnhof. Und ich habe Sushi gegessen. Bier habe ich nicht getrunken.',
      q: [{ q: 'Was hat die Person nicht getrunken?', o: ['Bier', 'Tee', 'Wasser', 'Kaffee'], a: 0 }],
    },
    listen: {
      text: 'あした|京都[きょうと]|に|行[い]|きます。', de: 'Morgen fahre ich nach Kyoto.',
      q: [{ q: 'Wann fährt die Person nach Kyoto?', o: ['morgen', 'gestern', 'heute', 'übermorgen'], a: 0 }],
    },
    dialog: {
      title: 'Pläne',
      turns: [
        { a: 'あした|何[なに]|を|し|ます|か。', hint: 'Du fährst morgen nach Kyoto.', o: ['京都[きょうと]|に|行[い]|きます。', 'ビール|です。', 'さようなら。'] },
        { a: 'いい|です|ね。', hint: 'Du isst dort Sushi.', o: ['すし|を|食[た]|べます。', 'すし|は|ドイツ|です。', 'こんばんは。'] },
        { a: 'ビール|も|飲[の]|みます|か。', hint: 'Du trinkst kein Bier.', o: ['いいえ、飲[の]|みません。', 'はい、飲[の]|みました。', 'いいえ、学生[がくせい]|です。'] },
      ],
    },
  },
  { id: 'c10', type: 'content', title: 'Zug und Reisen', icon: '🚆', deck: 'Reisen & Bahn',
    words: [
      ['でんしゃ', '電車', 'Zug / S-Bahn', '🚆'], ['しんかんせん', '新幹線', 'Shinkansen', '🚄'], ['きっぷ', '', 'Fahrkarte', '🎫'], ['ホーム', '', 'Bahnsteig', '🚉'],
      ['のりば', '', 'Einstiegsstelle', '🚏'], ['のります', '乗ります', 'einsteigen', '⬆️'], ['おります', '降ります', 'aussteigen', '⬇️'],
      ['いき', '行き', '... -wärts / Richtung', '➡️'], ['つぎ', '', 'nächste/r', '⏭️'], ['かかります', '', 'dauern; kosten', '⏳'],
      ['バス', '', 'Bus', '🚌'], ['タクシー', '', 'Taxi', '🚕'], ['くうこう', '空港', 'Flughafen', '✈️'], ['パスポート', '', 'Reisepass', '🛂'],
      ['ひがしぐち', '東口', 'Ostausgang', '🚪'], ['にしぐち', '西口', 'Westausgang', '🚪'],
    ],
    kanji: ['電', '車', '東', '西', '南', '北', '京', '都'],
    sents: [
      { s: '京都[きょうと]|行[い]|き|は|どこ|です|か', de: 'Wo fährt der Zug nach Kyoto ab?' },
      { s: 'きっぷ|を|二[に]|まい|ください', de: 'Zwei Fahrkarten bitte.' },
      { s: 'この|電車[でんしゃ]|は|大阪[おおさか]|に|行[い]|きます|か', de: 'Fährt dieser Zug nach Osaka?' },
      { s: '東京[とうきょう]|から|京都[きょうと]|まで|二時間[にじかん]|かかります', de: 'Von Tokio nach Kyoto braucht man 2 Stunden.' },
      { s: 'つぎ|の|えき|で|おります', de: 'Ich steige an der nächsten Station aus.' },
    ],
    grammar: {
      title: 'から und まで, 行き',
      body: [
        'から = „von / ab“, まで = „bis“. 東京から 京都まで = von Tokio bis Kyoto. Das gilt für Orte und Zeiten: 九時から 五時まで = von 9 bis 17 Uhr.',
        '〜行き (いき) auf Bahnsteigen und Bussen: 京都行き = „nach Kyoto“. 〜口 (ぐち) = Ausgang (東口, 西口, 南口, 北口).',
        'Flache Dinge (Fahrkarten, Papier) zählt man mit まい: いちまい, にまい (二枚), さんまい. きっぷを にまい ください = zwei Fahrkarten bitte.',
        'Ein Bahnhof hat viele Ausgänge. Die Himmelsrichtungen 東 (Osten), 西 (Westen), 南 (Süden), 北 (Norden) helfen dir bei der Orientierung.',
        'Ortsnamen auf Kanji: 東京 = Tokio („östliche Hauptstadt“), 京都 = Kyoto („Hauptstadt-Stadt“), 大阪 = Osaka („großer Hang“). Aus den Teilen ergibt sich das Wort.',
      ],
      ex: [['東京[とうきょう]|から|京都[きょうと]|まで', 'Von Tokio bis Kyoto'], ['京都[きょうと]|行[い]|き', 'nach Kyoto']],
      check: { q: 'Was bedeutet まで?', o: ['bis', 'von', 'nach', 'mit'], a: 0 },
    },
    reading: {
      lines: ['東京[とうきょう]　→　京都[きょうと]行[い]き', '東口[ひがしぐち]　…　三番[さんばん]ホーム', '西口[にしぐち]　…　バス|のりば'],
      de: 'Tokio → nach Kyoto. Ostausgang … Bahnsteig 3. Westausgang … Bushaltestelle.',
      q: [{ q: 'Wo findest du den Bus?', o: ['am Westausgang', 'am Ostausgang', 'auf Bahnsteig 3', 'am Südausgang'], a: 0 }],
    },
    listen: {
      text: '京都[きょうと]|行[い]|き|の|電車[でんしゃ]|は|三番[さんばん]|ホーム|です。', de: 'Der Zug nach Kyoto fährt von Bahnsteig 3.',
      q: [{ q: 'Von welchem Bahnsteig fährt der Zug nach Kyoto?', o: ['3', '1', '2', '5'], a: 0 }],
    },
    dialog: {
      title: 'Am Bahnhof',
      turns: [
        { a: 'いらっしゃいませ。', hint: 'Bitte um zwei Fahrkarten nach Kyoto.', o: ['京都[きょうと]|まで|きっぷ|を|二[に]|まい|ください。', 'ビール|を|ください。', 'さようなら。'] },
        { a: '一万[いちまん]|円[えん]|です。', hint: 'Frage, wo der Zug abfährt (どこ).', o: ['電車[でんしゃ]|は|どこ|です|か。', 'これ|は|ほん|です。', 'おやすみなさい。'] },
        { a: '三番[さんばん]|ホーム|です。', hint: 'Bedanke dich.', o: ['ありがとう|ございます。', 'いただきます。', 'ごめんなさい。'] },
      ],
    },
  },
);

/* Einheiten: Abfolge der Lektionen */
UNITS.push(
  { id: 'u1', title: 'Einheit 1: Erste Schritte', desc: 'Hiragana, Begrüßung, Vorstellen', lessons: ['k1', 'c1', 'k2', 'k3', 'c2'] },
  { id: 'u2', title: 'Einheit 2: Katakana und Fragen', desc: 'Katakana, Fragen, Zahlen', lessons: ['k4', 'k5', 'c3', 'k6', 'c4'] },
  { id: 'u3', title: 'Einheit 3: Alltag in Japan', desc: 'Zeit, Essen, Einkaufen', lessons: ['c5', 'c6', 'c7'] },
  { id: 'u4', title: 'Einheit 4: Unterwegs', desc: 'Wege, Verben, Bahn', lessons: ['c8', 'c9', 'c10'] },
);
const LESSON_BY_ID = {};
LESSONS.forEach(l => { LESSON_BY_ID[l.id] = l; });
