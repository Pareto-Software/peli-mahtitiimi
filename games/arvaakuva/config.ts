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
export type RevealName = 'sumea' | 'palapeli' | 'viivat' | 'palat';

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
   *  'viivat' = viiva kerrallaan, 'palat' = pieni pala kerrallaan. */
  reveals: ['sumea', 'palapeli', 'viivat', 'palat'] as RevealName[],
  /** Palapelin koko: näin monta palaa leveys- ja korkeussuunnassa. */
  puzzlePieces: 6,
  /** Viivoja vaaka- ja pystysuunnassa. */
  lines: 12,
  /** Pieniä paloja leveys- ja korkeussuunnassa. */
  smallPieces: 8,
  /** How many answer buttons. */
  choices: 4,

  /** Points for a right answer straight away … and when the picture is totally sharp. */
  maxPoints: 100,
  minPoints: 10,
  /** A wrong answer takes this many points away from the picture. */
  wrongPenalty: 20,

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
  ] as PictureDef[],
};
