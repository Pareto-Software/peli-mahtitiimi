// ⚙️ PELIN ASETUKSET – most changes the kids ask for are one line here.
// A guessing game: a blurry picture slowly gets sharper. Tap the right answer –
// the faster you guess, the more points you get!

import type { ThemeName } from '@kit/themes';

/** One picture to guess: the emoji and its Finnish name (shown on the button). */
export interface PictureDef {
  emoji: string;
  name: string;
}

/** Ways the picture is revealed. */
export type RevealName = 'sumea' | 'palapeli' | 'viivat' | 'palat' | 'pisteet' | 'reunat' | 'keskelta';

export const config = {
  title: 'Arvaa kuva',
  /** perus, talvi, avaruus, viidakko, laava or meri (see kit/themes.ts) */
  theme: 'avaruus' as ThemeName,

  /** How many pictures in one round. */
  picturesPerRound: 10,
  /** Seconds it takes for a picture to become totally sharp. */
  sharpenSeconds: 14,
  /** How blurry it is at the start: smaller = blurrier (pixels across the picture). */
  startSharpness: 3,
  /** Size of the picture in pixels (the screen is 960 × 540). */
  size: 260,
  /** Tavat, joilla kuva paljastuu (joka kuvalle arvotaan yksi):
   *  'sumea' = tarkentuu, 'palapeli' = palat menevät paikoilleen,
   *  'viivat' = viiva kerrallaan, 'palat' = pieni pala kerrallaan,
   *  'pisteet' = piste kerrallaan, 'reunat' = reunoista keskustaa kohti,
   *  'keskelta' = keskeltä reunoja kohti. */
  reveals: ['sumea', 'palapeli', 'viivat', 'palat', 'pisteet', 'reunat', 'keskelta'] as RevealName[],
  /** Palapelin koko: näin monta palaa leveys- ja korkeussuunnassa. */
  puzzlePieces: 6,
  /** Viivoja vaaka- ja pystysuunnassa. */
  lines: 26,
  /** Pieniä paloja leveys- ja korkeussuunnassa. */
  smallPieces: 8,
  /** Pisteitä leveys- ja korkeussuunnassa (isompi = pienemmät pisteet). */
  dots: 18,
  /** How many answer buttons. */
  choices: 4,

  /** Points for a right answer straight away … and when the picture is totally sharp. */
  maxPoints: 100,
  minPoints: 10,
  /** A wrong answer takes this many points away from the picture. */
  wrongPenalty: 20,

  /** Pistetaulukossa näkyy näin monta parasta tulosta. */
  scoreTableSize: 10,
  /** Lempinimet kootaan näistä: sana + eläin, esim. "Nopea 🦊 Kettu". */
  nickWords: ['Nopea', 'Ovela', 'Iloinen', 'Rohkea', 'Salainen', 'Hurja', 'Pörröinen', 'Tarkka', 'Supersankari', 'Unelias', 'Hassu', 'Kultainen'],
  nickAnimals: ['🦊 Kettu', '🐼 Panda', '🦉 Pöllö', '🐸 Sammakko', '🦄 Yksisarvinen', '🐯 Tiikeri', '🐧 Pingviini', '🦖 Dino', '🐙 Mustekala', '🦔 Siili', '🐝 Mehiläinen', '🐉 Lohikäärme'],

  /** Kuvat, joita arvataan. Lisää uusia: emoji + nimi. */
  pictures: [
    { emoji: '🐱', name: 'Kissa' },
    { emoji: '🐶', name: 'Koira' },
    { emoji: '🐸', name: 'Sammakko' },
    { emoji: '🦁', name: 'Leijona' },
    { emoji: '🐘', name: 'Norsu' },
    { emoji: '🦒', name: 'Kirahvi' },
    { emoji: '🐧', name: 'Pingviini' },
    { emoji: '🐙', name: 'Mustekala' },
    { emoji: '🍌', name: 'Banaani' },
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🍓', name: 'Mansikka' },
    { emoji: '🍉', name: 'Vesimeloni' },
    { emoji: '🚗', name: 'Auto' },
    { emoji: '🚀', name: 'Raketti' },
    { emoji: '🚲', name: 'Polkupyörä' },
    { emoji: '⚽', name: 'Jalkapallo' },
    { emoji: '🌈', name: 'Sateenkaari' },
    { emoji: '🌵', name: 'Kaktus' },
    { emoji: '🎸', name: 'Kitara' },
    { emoji: '🏰', name: 'Linna' },

    // Ruoat
    { emoji: '🍔', name: 'Hampurilainen' },
    { emoji: '🍟', name: 'Ranskalaiset' },
    { emoji: '🍦', name: 'Jäätelö' },
    { emoji: '🧁', name: 'Kuppikakku' },
    { emoji: '🍩', name: 'Donitsi' },
    { emoji: '🥕', name: 'Porkkana' },
    { emoji: '🍎', name: 'Omena' },
    { emoji: '🧀', name: 'Juusto' },
    { emoji: '🥞', name: 'Pannukakku' },
    { emoji: '🌭', name: 'Hodari' },

    // Eläimet
    { emoji: '🐻', name: 'Karhu' },
    { emoji: '🦊', name: 'Kettu' },
    { emoji: '🐰', name: 'Pupu' },
    { emoji: '🦉', name: 'Pöllö' },
    { emoji: '🐢', name: 'Kilpikonna' },
    { emoji: '🦈', name: 'Hai' },
    { emoji: '🐝', name: 'Mehiläinen' },
    { emoji: '🦄', name: 'Yksisarvinen' },
    { emoji: '🐴', name: 'Hevonen' },
    { emoji: '🐵', name: 'Apina' },

    // Rakennukset
    { emoji: '🏠', name: 'Talo' },
    { emoji: '🏫', name: 'Koulu' },
    { emoji: '🏥', name: 'Sairaala' },
    { emoji: '⛪', name: 'Kirkko' },
    { emoji: '🏟️', name: 'Stadion' },
    { emoji: '🗼', name: 'Torni' },
    { emoji: '⛺', name: 'Teltta' },
    { emoji: '🏭', name: 'Tehdas' },

    // Harrastusvälineet
    { emoji: '🏀', name: 'Koripallo' },
    { emoji: '🎾', name: 'Tennispallo' },
    { emoji: '⛸️', name: 'Luistin' },
    { emoji: '🎿', name: 'Sukset' },
    { emoji: '🛹', name: 'Rullalauta' },
    { emoji: '🏒', name: 'Jääkiekkomaila' },
    { emoji: '🎨', name: 'Maalauspaletti' },
    { emoji: '🥁', name: 'Rumpu' },
    { emoji: '🎣', name: 'Onkivapa' },
    { emoji: '🎮', name: 'Peliohjain' },

    // Tavarat
    { emoji: '☂️', name: 'Sateenvarjo' },
    { emoji: '⏰', name: 'Herätyskello' },
    { emoji: '🔑', name: 'Avain' },
    { emoji: '✏️', name: 'Kynä' },
    { emoji: '📚', name: 'Kirjat' },
    { emoji: '🎒', name: 'Reppu' },
    { emoji: '💡', name: 'Hehkulamppu' },
    { emoji: '🧸', name: 'Nalle' },
    { emoji: '🎁', name: 'Lahja' },
    { emoji: '🔦', name: 'Taskulamppu' },

    // Lisää eläimiä
    { emoji: '🐭', name: 'Hiiri' },
    { emoji: '🐷', name: 'Possu' },
    { emoji: '🐮', name: 'Lehmä' },
    { emoji: '🐔', name: 'Kana' },
    { emoji: '🦆', name: 'Ankka' },
    { emoji: '🐼', name: 'Panda' },
    { emoji: '🐨', name: 'Koala' },
    { emoji: '🐯', name: 'Tiikeri' },
    { emoji: '🦓', name: 'Seepra' },
    { emoji: '🐊', name: 'Krokotiili' },
    { emoji: '🐍', name: 'Käärme' },
    { emoji: '🦋', name: 'Perhonen' },
    { emoji: '🐌', name: 'Etana' },
    { emoji: '🐞', name: 'Leppäkerttu' },
    { emoji: '🕷️', name: 'Hämähäkki' },
    { emoji: '🐳', name: 'Valas' },
    { emoji: '🐬', name: 'Delfiini' },
    { emoji: '🦀', name: 'Rapu' },
    { emoji: '🐠', name: 'Kala' },
    { emoji: '🦜', name: 'Papukaija' },
    { emoji: '🦩', name: 'Flamingo' },
    { emoji: '🦔', name: 'Siili' },
    { emoji: '🐿️', name: 'Orava' },
    { emoji: '🦘', name: 'Kenguru' },
    { emoji: '🐪', name: 'Kameli' },
    { emoji: '🦖', name: 'Dinosaurus' },
    { emoji: '🐉', name: 'Lohikäärme' },

    // Lisää ruokia
    { emoji: '🍇', name: 'Viinirypäleet' },
    { emoji: '🍍', name: 'Ananas' },
    { emoji: '🍒', name: 'Kirsikat' },
    { emoji: '🍋', name: 'Sitruuna' },
    { emoji: '🥝', name: 'Kiivi' },
    { emoji: '🥑', name: 'Avokado' },
    { emoji: '🌽', name: 'Maissi' },
    { emoji: '🥦', name: 'Parsakaali' },
    { emoji: '🍄', name: 'Sieni' },
    { emoji: '🥐', name: 'Croissant' },
    { emoji: '🍞', name: 'Leipä' },
    { emoji: '🥚', name: 'Kananmuna' },
    { emoji: '🍝', name: 'Spagetti' },
    { emoji: '🌮', name: 'Taco' },
    { emoji: '🍣', name: 'Sushi' },
    { emoji: '🍿', name: 'Popcorn' },
    { emoji: '🎂', name: 'Kakku' },
    { emoji: '🍪', name: 'Keksi' },
    { emoji: '🍭', name: 'Tikkari' },
    { emoji: '🍫', name: 'Suklaa' },

    // Kulkuneuvot
    { emoji: '🚌', name: 'Bussi' },
    { emoji: '🚒', name: 'Paloauto' },
    { emoji: '🚓', name: 'Poliisiauto' },
    { emoji: '🚑', name: 'Ambulanssi' },
    { emoji: '🚜', name: 'Traktori' },
    { emoji: '🚂', name: 'Juna' },
    { emoji: '✈️', name: 'Lentokone' },
    { emoji: '🚁', name: 'Helikopteri' },
    { emoji: '⛵', name: 'Purjevene' },
    { emoji: '🛸', name: 'Lentävä lautanen' },

    // Luonto ja sää
    { emoji: '☀️', name: 'Aurinko' },
    { emoji: '🌙', name: 'Kuu' },
    { emoji: '⭐', name: 'Tähti' },
    { emoji: '☁️', name: 'Pilvi' },
    { emoji: '⛄', name: 'Lumiukko' },
    { emoji: '🌻', name: 'Auringonkukka' },
    { emoji: '🌹', name: 'Ruusu' },
    { emoji: '🌲', name: 'Kuusi' },
    { emoji: '🌴', name: 'Palmu' },
    { emoji: '🍁', name: 'Vaahteranlehti' },
    { emoji: '🌋', name: 'Tulivuori' },

    // Lisää rakennuksia
    { emoji: '🏯', name: 'Japanilainen linna' },
    { emoji: '🏡', name: 'Omakotitalo' },
    { emoji: '🏢', name: 'Toimistotalo' },
    { emoji: '🎪', name: 'Sirkusteltta' },
    { emoji: '🎡', name: 'Maailmanpyörä' },
    { emoji: '🗽', name: 'Patsas' },
    { emoji: '🌉', name: 'Silta' },

    // Lisää harrastuksia
    { emoji: '🏈', name: 'Amerikkalainen jalkapallo' },
    { emoji: '⚾', name: 'Pesäpallo' },
    { emoji: '🏐', name: 'Lentopallo' },
    { emoji: '🏓', name: 'Pingismaila' },
    { emoji: '🥊', name: 'Nyrkkeilyhanska' },
    { emoji: '🎯', name: 'Tikkataulu' },
    { emoji: '🎳', name: 'Keilailu' },
    { emoji: '🪁', name: 'Leija' },
    { emoji: '🎹', name: 'Piano' },
    { emoji: '🎺', name: 'Trumpetti' },
    { emoji: '🎻', name: 'Viulu' },
    { emoji: '🧩', name: 'Palapeli' },
    { emoji: '🎲', name: 'Noppa' },
    { emoji: '🛼', name: 'Rullaluistin' },

    // Lisää tavaroita
    { emoji: '👑', name: 'Kruunu' },
    { emoji: '🎩', name: 'Silinterihattu' },
    { emoji: '👓', name: 'Silmälasit' },
    { emoji: '👟', name: 'Lenkkari' },
    { emoji: '🧦', name: 'Sukat' },
    { emoji: '🧤', name: 'Lapaset' },
    { emoji: '🧣', name: 'Kaulaliina' },
    { emoji: '📱', name: 'Puhelin' },
    { emoji: '💻', name: 'Tietokone' },
    { emoji: '📷', name: 'Kamera' },
    { emoji: '📺', name: 'Televisio' },
    { emoji: '✂️', name: 'Sakset' },
    { emoji: '🔨', name: 'Vasara' },
    { emoji: '🧲', name: 'Magneetti' },
    { emoji: '🎈', name: 'Ilmapallo' },
    { emoji: '🕯️', name: 'Kynttilä' },
    { emoji: '🪑', name: 'Tuoli' },
    { emoji: '🛁', name: 'Kylpyamme' },
    { emoji: '🧽', name: 'Pesusieni' },
    { emoji: '⚓', name: 'Ankkuri' },
    { emoji: '🔔', name: 'Kello' },
    { emoji: '💎', name: 'Timantti' },

    // Satu- ja seikkailuhahmot
    { emoji: '🧙', name: 'Velho' },
    { emoji: '🧚', name: 'Keiju' },
    { emoji: '🧜', name: 'Merenneito' },
    { emoji: '🧝', name: 'Haltija' },
    { emoji: '🧞', name: 'Lampun henki' },
    { emoji: '🦸', name: 'Supersankari' },
    { emoji: '👸', name: 'Prinsessa' },
    { emoji: '🤴', name: 'Prinssi' },
    { emoji: '🤖', name: 'Robotti' },
    { emoji: '👽', name: 'Avaruusolento' },
    { emoji: '👻', name: 'Kummitus' },
    { emoji: '🥷', name: 'Ninja' },
    { emoji: '🧑‍🚀', name: 'Astronautti' },
    { emoji: '🎅', name: 'Joulupukki' },
    { emoji: '🧌', name: 'Peikko' },
    { emoji: '🦹', name: 'Superkonna' },
  ] as PictureDef[],
};
