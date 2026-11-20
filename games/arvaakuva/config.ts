// ⚙️ PELIN ASETUKSET – most changes the kids ask for are one line here.
// A guessing game: a blurry picture slowly gets sharper. Tap the right answer –
// the faster you guess, the more points you get!

import type { ThemeName } from '@kit/themes';

/** One picture to guess: the emoji and its Finnish name (shown on the button). */
export interface PictureDef {
  emoji: string;
  name: string;
}

export const config = {
  title: 'Arvaa kuva',
  /** perus, talvi, avaruus, viidakko, laava or meri (see kit/themes.ts) */
  theme: 'avaruus' as ThemeName,

  /** How many pictures in one round. */
  picturesPerRound: 10,
  /** Seconds it takes for a picture to become totally sharp. */
  sharpenSeconds: 8,
  /** How blurry it is at the start: smaller = blurrier (pixels across the picture). */
  startSharpness: 3,
  /** Size of the picture in pixels (the screen is 960 × 540). */
  size: 260,
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
  ] as PictureDef[],
};
