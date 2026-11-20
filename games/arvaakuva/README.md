# arvaakuva – map for the agent

"Arvaa kuva": a blurry picture (an emoji) slowly gets sharper. Tap the right
name from the answer buttons – the faster you guess, the more points. A wrong
answer turns the button red and takes points away. One round = 10 pictures.
Works on touch screens, with a mouse, and with number keys 1–4.
Everything in this game lives in these files; don't create new files.

| File | What is in it |
| --- | --- |
| `config.ts` | Every number and the pictures to guess. **Start here.** |
| `main.ts` | The round, blurring, answer buttons, drawing (below). |
| `meta.json` | Title, emoji, description and controls shown on the gallery page. |

## Request → where to change it

| Kids ask for … | Change |
| --- | --- |
| New pictures | `config.pictures` – `emoji` + Finnish `name` |
| Slower / faster sharpening | `config.sharpenSeconds` |
| Blurrier at the start | `config.startSharpness` (smaller = blurrier) |
| Reveal ways (one picked per picture) | `config.reveals`: sumea, palapeli, viivat, palat, pisteet, reunat |
| Puzzle / line / square sizes | `config.puzzlePieces`, `config.lines`, `config.smallPieces`, `config.dots` |
| More / fewer pictures per round | `config.picturesPerRound` |
| More answer buttons | `config.choices` (max 6 for number keys) |
| Points | `config.maxPoints`, `config.minPoints`, `config.wrongPenalty` |
| Nicknames (picked on the start screen, never typed) | `config.nickWords`, `config.nickAnimals` |
| Longer / shorter score table | `config.scoreTableSize` |
| Colours | `config.theme`: perus, talvi, avaruus, viidakko, laava, meri |

## main.ts

- `newNicks` / `drawNickPicker` – the start screen: pick one of 6 made-up nicknames (tap or 1–6)
- `saveToTable` / `drawScoreTable` – the score table (saved with `storage` key `taulukko`), shown at the end

- `startRound` / `nextPicture` / `endRound` – the round, a new picture with shuffled answers, the end and high score
- `sharpness` / `pointsNow` – how sharp the picture is and what a right answer is worth now
- `answer` – right or wrong answer
- `drawPicture` – picks the reveal way: `drawBlurry` (tiny canvas stretched big), `drawPuzzle`
  (mixed pieces hop into place one at a time), `drawLines` (lines across and down), `drawSquares`, `drawDots` (round dots), `drawEdges` (edges first)
- `nextPicture` picks the reveal way and the random orders (`fixOrder`, `mixOrder`, `lineOrder`, `squareOrder`)
- `drawButtons` / `buttonRect` – the answer buttons
- Taps come from `touch.taps()` (`@kit/touch`).

## Adult keys

⚙️ Asetukset (or Esc): start over, sound · Space or Enter starts a round · P pause · M mute
