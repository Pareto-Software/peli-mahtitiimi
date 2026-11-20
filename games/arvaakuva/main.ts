// Arvaa kuva – a guessing game for touch screens (mouse and keys 1–4 work too).
// A blurry picture slowly gets sharper; tap the right name. Faster = more points.
// The numbers and pictures are in config.ts.

import { startGame } from '@kit/loop';
import { touch, type Tap } from '@kit/touch';
import { input } from '@kit/input';
import { sfx } from '@kit/sound';
import { drawEmoji, roundRect } from '@kit/sprites';
import { particles, fx } from '@kit/particles';
import { text, hud, banner, bar } from '@kit/ui';
import { themes } from '@kit/themes';
import { storage } from '@kit/storage';
import { config, type PictureDef, type RevealName } from './config';

// Puhelin pystyssä = peli pystyssä (napit kahteen riviin, kuva isompi).
const PORTRAIT = innerHeight > innerWidth;
const W = PORTRAIT ? 540 : 960;
const H = PORTRAIT ? 960 : 540;
const theme = themes[config.theme];
const SIZE = PORTRAIT ? 420 : config.size;
const PIC_Y = PORTRAIT ? 330 : 200; // where the middle of the picture is
const LEFT = W / 2 - SIZE / 2; // top-left corner of the picture
const TOP = PIC_Y - SIZE / 2;

/** One answer button. */
interface Choice {
  pic: PictureDef;
  /** Tapped and it was wrong: shown red. */
  wrong: boolean;
}

/** A number that floats up, e.g. "+80". */
interface Popup { x: number; y: number; text: string; color: string; age: number }

type Phase = 'alku' | 'peli' | 'oikein' | 'loppu';

let phase: Phase = 'alku';
let queue: PictureDef[] = []; // pictures still to come in this round
let current: PictureDef = config.pictures[0];
let choices: Choice[] = [];
let picNumber = 0;
let picAge = 0; // seconds since this picture appeared
let penalty = 0; // points lost to wrong answers on this picture
let reveal: RevealName = 'sumea'; // how this picture is revealed
let revealBag: RevealName[] = []; // reveal ways still to come before they all repeat
let fixOrder: number[] = []; // palapeli: the order pieces go to their place
let mixOrder: number[] = []; // palapeli: how the loose pieces are mixed
let lineOrder: number[] = []; // viivat: the order lines appear
let squareOrder: number[] = []; // palat: the order squares appear
let dotOrder: number[] = []; // pisteet: the order dots appear
let phaseAge = 0;
let popups: Popup[] = [];
let score = 0;
let best = storage.load('best', 0);
let newRecord = false;

/** One line in the score table: the nickname and the points. */
interface ScoreLine { nick: string; score: number }
let scoreTable: ScoreLine[] = storage.load('taulukko', []);
let myLine = -1; // this round's line in the table (shown yellow), -1 = didn't fit
let nick = ''; // the nickname picked for this round
let nickChoices: string[] = [];

// Small canvas: the picture is drawn tiny and stretched big = blurry!
const blurCanvas = document.createElement('canvas');
const blurCtx = blurCanvas.getContext('2d')!;
const SHARP = SIZE * 2;
const sharpCanvas = document.createElement('canvas');
sharpCanvas.width = SHARP;
sharpCanvas.height = SHARP;
const sharpCtx = sharpCanvas.getContext('2d')!;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Nicknames and the score table --------------------------------------------

const NICK_COUNT = 6;

/** New random nicknames to pick from, e.g. "Nopea 🦊 Kettu". */
function newNicks() {
  const words = shuffle(config.nickWords);
  const animals = shuffle(config.nickAnimals);
  nickChoices = [...Array(NICK_COUNT).keys()].map((i) => `${words[i % words.length]} ${animals[i % animals.length]}`);
}
newNicks();

/** Back to picking a nickname (also "Aloita alusta" in the ⚙️ menu). */
function toStart() {
  phase = 'alku';
  phaseAge = 0;
  newNicks();
}

/** Where nickname button i is: two rows of three (phone upright: three rows of two). */
function nickRect(i: number) {
  const gap = 16;
  const cols = PORTRAIT ? 2 : 3;
  const w = (W - 32 - gap * (cols - 1)) / cols;
  const top = PORTRAIT ? 260 : 200;
  const h = PORTRAIT ? 110 : 90;
  return { x: 16 + (i % cols) * (w + gap), y: top + Math.floor(i / cols) * (h + 20), w, h };
}

function nickAt(tap: Tap) {
  return nickChoices.findIndex((_, i) => {
    const r = nickRect(i);
    return tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h;
  });
}

/** Puts this round's points into the score table (best first). */
function saveToTable() {
  const line = { nick, score };
  scoreTable = [...scoreTable, line].sort((a, b) => b.score - a.score).slice(0, config.scoreTableSize);
  myLine = scoreTable.indexOf(line);
  storage.save('taulukko', scoreTable);
}

// ---- Round ------------------------------------------------------------------

/** A new round from the start (also "Aloita alusta" in the ⚙️ menu). */
function startRound() {
  queue = shuffle(config.pictures).slice(0, config.picturesPerRound);
  score = 0;
  picNumber = 0;
  newRecord = false;
  popups = [];
  particles.clear();
  sfx('click');
  nextPicture();
}

function nextPicture() {
  const pic = queue.shift();
  if (!pic) { endRound(); return; }
  current = pic;
  picNumber++;
  picAge = 0;
  penalty = 0;
  // Pick a random reveal way and random orders for it.
  // Kaikki tavat tulevat vuorollaan sekaisin järjestyksessä, ei samaa kahdesti peräkkäin.
  if (revealBag.length === 0) {
    revealBag = shuffle(config.reveals);
    if (revealBag.length > 1 && revealBag[0] === reveal) revealBag.push(revealBag.shift()!);
  }
  reveal = revealBag.shift() ?? 'sumea';
  const range = (n: number) => [...Array(n).keys()];
  fixOrder = shuffle(range(config.puzzlePieces ** 2));
  mixOrder = shuffle(range(config.puzzlePieces ** 2));
  lineOrder = shuffle(range(config.lines * 2));
  squareOrder = shuffle(range(config.smallPieces ** 2));
  dotOrder = shuffle(range(config.dots ** 2));
  phase = 'peli';
  // The right answer + random wrong ones, in a random order.
  const others = shuffle(config.pictures.filter((p) => p !== pic)).slice(0, config.choices - 1);
  choices = shuffle([pic, ...others]).map((p) => ({ pic: p, wrong: false }));
}

function endRound() {
  phase = 'loppu';
  phaseAge = 0;
  newRecord = score > best;
  best = storage.highScore(score);
  saveToTable();
  sfx('win');
  if (newRecord) particles.confetti(W / 2, H / 2);
}

/** How sharp the picture is: 0 = blurriest, 1 = totally sharp. */
function sharpness() {
  return Math.min(1, picAge / config.sharpenSeconds);
}

/** Points you get if you answer right now. Faster = more! */
function pointsNow() {
  const p = config.maxPoints - (config.maxPoints - config.minPoints) * sharpness();
  return Math.max(config.minPoints, Math.round(p - penalty));
}

// ---- Answer buttons -----------------------------------------------------------

/** Where button i is: a row at the bottom of the screen (phone upright: two per row). */
function buttonRect(i: number) {
  const gap = 16;
  if (PORTRAIT) {
    // Two per row; more answers = lower buttons so they all fit
    const rowsNeeded = Math.ceil(choices.length / 2);
    const h = Math.min(110, (H - 600 - 20) / rowsNeeded - 15);
    const w = (W - 32 - gap) / 2;
    return { x: 16 + (i % 2) * (w + gap), y: 600 + Math.floor(i / 2) * (h + 15), w, h };
  }
  if (choices.length <= 4) {
    const w = (W - 32 - gap * (choices.length - 1)) / choices.length;
    return { x: 16 + i * (w + gap), y: 400, w, h: 90 };
  }
  // 5 or more answers: two rows of three under the picture
  const cols = Math.ceil(choices.length / 2);
  const w = (W - 32 - gap * (cols - 1)) / cols;
  return { x: 16 + (i % cols) * (w + gap), y: 362 + Math.floor(i / cols) * 90, w, h: 78 };
}

function buttonAt(tap: Tap) {
  return choices.findIndex((_, i) => {
    const r = buttonRect(i);
    return tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h;
  });
}

function answer(i: number) {
  const c = choices[i];
  if (!c || c.wrong) return;
  const r = buttonRect(i);
  if (c.pic === current) {
    // Oikein!
    const points = pointsNow();
    score += points;
    phase = 'oikein';
    phaseAge = 0;
    sfx('powerup');
    particles.burst(W / 2, PIC_Y, { color: '#ffd93d', count: 30, speed: 320 });
    popups.push({ x: r.x + r.w / 2, y: r.y - 20, text: `+${points}`, color: '#ffe066', age: 0 });
  } else {
    // Väärin – that button turns red and the picture is worth less.
    c.wrong = true;
    penalty += config.wrongPenalty;
    sfx('hit');
    fx.shake(8, 200);
    popups.push({ x: r.x + r.w / 2, y: r.y - 20, text: `-${config.wrongPenalty}`, color: '#ff6b6b', age: 0 });
  }
}

// ---- update & draw --------------------------------------------------------------

const NUMBER_KEYS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'];

function wantsToStart(taps: Tap[]) {
  return taps.length > 0 || input.keyPressed('Space') || input.keyPressed('Enter');
}

function update(dt: number) {
  const taps = touch.taps();
  particles.update(dt);
  for (const p of popups) p.age += dt;
  popups = popups.filter((p) => p.age < 0.8);
  phaseAge += dt;

  if (phase === 'alku') {
    // Pick a nickname: tap it or press 1–6.
    let picked = -1;
    for (const tap of taps) if (nickAt(tap) >= 0) picked = nickAt(tap);
    NUMBER_KEYS.forEach((key, i) => { if (input.keyPressed(key)) picked = i; });
    if (input.keyPressed('Space') || input.keyPressed('Enter')) picked = 0;
    if (picked >= 0) { nick = nickChoices[picked]; startRound(); }
    return;
  }
  if (phase === 'loppu') {
    if (phaseAge > 1.2 && wantsToStart(taps)) toStart();
    return;
  }
  if (phase === 'oikein') {
    // Show the sharp picture for a moment, then the next one.
    if (phaseAge > 1.3) nextPicture();
    return;
  }
  if (phase !== 'peli') return;

  picAge += dt;
  for (const tap of taps) {
    const i = buttonAt(tap);
    if (i >= 0) answer(i);
  }
  NUMBER_KEYS.forEach((key, i) => { if (input.keyPressed(key)) answer(i); });
}

/** How far the picture is revealed: 0 = start, 1 = all shown. */
function revealed() {
  return phase === 'oikein' ? 1 : sharpness();
}

/** How many of `total` parts are shown now (at least one, so there is a hint). */
function partsShown(total: number) {
  return Math.min(total, 1 + Math.floor(revealed() * total));
}

/** Draws the emoji big and sharp on its own canvas (2× for a crisp look). */
function drawSharp() {
  sharpCtx.clearRect(0, 0, SHARP, SHARP);
  drawEmoji(sharpCtx, current.emoji, SHARP / 2, SHARP / 2, SHARP);
}

/** Copies a part of the picture (x, y, w, h inside the picture) to the screen at (toX, toY). */
function drawPart(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, toX = x, toY = y) {
  const s = SHARP / SIZE;
  c.drawImage(sharpCanvas, x * s, y * s, w * s, h * s, LEFT + toX, TOP + toY, w, h);
}

/** Sumea: drawn tiny on a small canvas, then stretched big = blurry. */
function drawBlurry(c: CanvasRenderingContext2D) {
  const sharp = revealed();
  const pixels = Math.round(config.startSharpness + (SIZE - config.startSharpness) * sharp * sharp);
  blurCanvas.width = pixels;
  blurCanvas.height = pixels;
  blurCtx.clearRect(0, 0, pixels, pixels);
  blurCtx.drawImage(sharpCanvas, 0, 0, pixels, pixels);
  c.save();
  c.imageSmoothingEnabled = true;
  c.drawImage(blurCanvas, LEFT, TOP, SIZE, SIZE);
  c.restore();
}

/** Palapeli: pieces in the wrong places hop to the right place one at a time. */
function drawPuzzle(c: CanvasRenderingContext2D) {
  const n = config.puzzlePieces;
  const piece = SIZE / n;
  const total = n * n;
  const fixedCount = phase === 'oikein' ? total : Math.floor(revealed() * total);
  const fixed = new Set(fixOrder.slice(0, fixedCount));
  // The pieces not yet in place swap places in a ring, so none is in its own place.
  const loose = mixOrder.filter((i) => !fixed.has(i));
  const placeOf = new Map<number, number>();
  for (const i of fixed) placeOf.set(i, i);
  loose.forEach((i, k) => placeOf.set(i, loose[(k + 1) % loose.length]));

  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  for (let i = 0; i < total; i++) {
    const to = placeOf.get(i)!;
    const x = (i % n) * piece, y = Math.floor(i / n) * piece;
    const tx = (to % n) * piece, ty = Math.floor(to / n) * piece;
    drawPart(c, x, y, piece, piece, tx, ty);
  }
  // Lines between the pieces
  c.strokeStyle = 'rgba(40,40,60,0.6)';
  c.lineWidth = 2;
  for (let k = 0; k <= n; k++) {
    c.beginPath(); c.moveTo(LEFT + k * piece, TOP); c.lineTo(LEFT + k * piece, TOP + SIZE); c.stroke();
    c.beginPath(); c.moveTo(LEFT, TOP + k * piece); c.lineTo(LEFT + SIZE, TOP + k * piece); c.stroke();
  }
}

/** Viivat: one line at a time, across (vaaka) and down (pysty). */
function drawLines(c: CanvasRenderingContext2D) {
  const n = config.lines;
  const step = SIZE / n;
  c.fillStyle = '#2b2d42';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  // lineOrder: 0 … n-1 = across, n … 2n-1 = down
  for (const line of lineOrder.slice(0, partsShown(2 * n))) {
    const across = line < n;
    const k = line % n;
    const [x, y, w, h] = across ? [0, k * step, SIZE, step] : [k * step, 0, step, SIZE];
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(LEFT + x, TOP + y, w, h);
    drawPart(c, x, y, w, h);
  }
}

/** Palat: one small square at a time. */
function drawSquares(c: CanvasRenderingContext2D) {
  const n = config.smallPieces;
  const step = SIZE / n;
  c.fillStyle = '#2b2d42';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  for (const i of squareOrder.slice(0, partsShown(n * n))) {
    const x = (i % n) * step, y = Math.floor(i / n) * step;
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(LEFT + x, TOP + y, step, step);
    drawPart(c, x, y, step, step);
  }
}

/** Pisteet: round dots appear one at a time in random places. */
function drawDots(c: CanvasRenderingContext2D) {
  const n = config.dots;
  const step = SIZE / n;
  const r = step * 0.75; // a bit bigger than the gap, so all dots together cover everything
  c.fillStyle = '#2b2d42';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  c.save();
  c.beginPath();
  c.rect(LEFT, TOP, SIZE, SIZE);
  c.clip();
  c.beginPath();
  for (const i of dotOrder.slice(0, partsShown(n * n))) {
    const x = LEFT + ((i % n) + 0.5) * step, y = TOP + (Math.floor(i / n) + 0.5) * step;
    c.moveTo(x + r, y);
    c.arc(x, y, r, 0, Math.PI * 2);
  }
  c.clip(); // only the dots show the picture
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  drawPart(c, 0, 0, SIZE, SIZE);
  c.restore();
}

/** Reunat: the picture shows from the edges; the dark middle shrinks. */
function drawEdges(c: CanvasRenderingContext2D) {
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  drawPart(c, 0, 0, SIZE, SIZE);
  const hidden = SIZE * (1 - (0.08 + 0.92 * revealed())); // a thin edge shows at the start
  c.fillStyle = '#2b2d42';
  c.fillRect(LEFT + (SIZE - hidden) / 2, TOP + (SIZE - hidden) / 2, hidden, hidden);
}

/** Keskeltä: a round hole in the middle grows until the whole picture shows. */
function drawFromMiddle(c: CanvasRenderingContext2D) {
  c.fillStyle = '#2b2d42';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  const r = SIZE * 0.72 * (0.08 + 0.92 * revealed()); // 0.72 = reaches the corners
  c.save();
  c.beginPath();
  c.rect(LEFT, TOP, SIZE, SIZE);
  c.clip();
  c.beginPath();
  c.arc(LEFT + SIZE / 2, TOP + SIZE / 2, r, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fillRect(LEFT, TOP, SIZE, SIZE);
  drawPart(c, 0, 0, SIZE, SIZE);
  c.restore();
}

/** Draws the picture in this picture's reveal way. */
function drawPicture(c: CanvasRenderingContext2D) {
  drawSharp();
  if (reveal === 'palapeli') drawPuzzle(c);
  else if (reveal === 'viivat') drawLines(c);
  else if (reveal === 'palat') drawSquares(c);
  else if (reveal === 'pisteet') drawDots(c);
  else if (reveal === 'reunat') drawEdges(c);
  else if (reveal === 'keskelta') drawFromMiddle(c);
  else drawBlurry(c);
}

function drawButtons(c: CanvasRenderingContext2D) {
  choices.forEach((ch, i) => {
    const r = buttonRect(i);
    const right = phase === 'oikein' && ch.pic === current;
    const color = right ? '#3ccf6e' : ch.wrong ? '#d94a4a' : 'rgba(255,255,255,0.9)';
    roundRect(c, r.x, r.y, r.w, r.h, 18, color);
    buttonText(c, `${i + 1}. ${ch.pic.name}`, r, right || ch.wrong);
  });
}

/** Text on a button: as big as fits. Long names go on two lines. light = white text (green/red button). */
function buttonText(c: CanvasRenderingContext2D, label: string, r: { x: number; y: number; w: number; h: number }, light = false) {
  const color = light ? '#fff' : '#223';
  const widthAt = (s: string, size: number) => {
    c.font = `bold ${size}px "Arial Rounded MT Bold", "Avenir Next", system-ui, sans-serif`;
    return c.measureText(s).width;
  };
  // One line, if it fits big enough
  let size = 30;
  while (size > 24 && widthAt(label, size) > r.w - 20) size--; // pieni teksti näyttää puhelimella sumealta
  if (widthAt(label, size) <= r.w - 20) {
    text(c, label, r.x + r.w / 2, r.y + r.h / 2, { size, align: 'center', color, outline: light });
    return;
  }
  // Two lines: split at the space nearest the middle
  const spaces = [...label.matchAll(/ /g)].map((s) => s.index!);
  const cut = spaces.reduce((a, b) => (Math.abs(b - label.length / 2) < Math.abs(a - label.length / 2) ? b : a), spaces[0] ?? label.length);
  const lines = [label.slice(0, cut), label.slice(cut + 1)];
  size = 30;
  while (size > 18 && Math.max(...lines.map((l) => widthAt(l, size))) > r.w - 20) size--;
  lines.forEach((l, k) => {
    text(c, l, r.x + r.w / 2, r.y + r.h / 2 + (k - 0.5) * size * 1.15, { size, align: 'center', color, outline: light });
  });
}

/** The start screen: pick your nickname. */
function drawNickPicker(c: CanvasRenderingContext2D) {
  text(c, config.title, W / 2, PORTRAIT ? 140 : 95, { size: 56, align: 'center' });
  text(c, 'Valitse lempinimesi – sitten arvataan kuvia!', W / 2, PORTRAIT ? 205 : 155, { size: PORTRAIT ? 20 : 24, align: 'center', color: '#ffe9a8' });
  nickChoices.forEach((n, i) => {
    const r = nickRect(i);
    roundRect(c, r.x, r.y, r.w, r.h, 18, 'rgba(255,255,255,0.9)');
    buttonText(c, `${i + 1}. ${n}`, r);
  });
}

/** The end screen: the score table, this round's line in yellow. */
function drawScoreTable(c: CanvasRenderingContext2D) {
  c.fillStyle = 'rgba(0,0,0,0.5)';
  const top = PORTRAIT ? 200 : 0; // phone upright: table lower down
  const half = Math.min(300, W / 2 - 10); // half the panel width
  c.fillRect(W / 2 - half, top + 60, half * 2, 440);
  text(c, newRecord ? `Uusi ennätys! ⭐ ${score}` : `Valmis! ⭐ ${score}`, W / 2, top + 95, { size: 36, align: 'center' });
  text(c, '🏆 Pistetaulukko', W / 2, top + 140, { size: 24, align: 'center', color: '#ffe9a8' });
  scoreTable.forEach((line, i) => {
    const y = top + 180 + i * 30;
    const color = i === myLine ? '#ffd93d' : '#fff';
    text(c, `${i + 1}.`, W / 2 - half + 40, y, { size: 22, color });
    text(c, line.nick, W / 2 - half + 90, y, { size: 22, color });
    text(c, `${line.score}`, W / 2 + half - 40, y, { size: 22, align: 'right', color });
  });
  if (myLine < 0) text(c, `${nick}: ${score} – ei mahtunut taulukkoon`, W / 2, top + 485, { size: 18, align: 'center', color: '#ffd93d' });
  if (phaseAge > 1.2) text(c, 'Napauta niin uusi kierros', W / 2, top + 525, { size: 20, align: 'center', color: '#ffe9a8' });
}

function draw(c: CanvasRenderingContext2D) {
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(1, theme.skyBottom);
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);

  if (phase === 'peli' || phase === 'oikein') {
    // A frame behind the picture
    roundRect(c, W / 2 - SIZE / 2 - 16, PIC_Y - SIZE / 2 - 16, SIZE + 32, SIZE + 32, 24, 'rgba(255,255,255,0.15)');
    drawPicture(c);
    drawButtons(c);
    if (phase === 'peli') bar(c, 16, 52, W - 32, 8, 1 - sharpness(), '#ffd93d');
  }

  particles.draw(c);
  for (const p of popups) {
    text(c, p.text, p.x, p.y - p.age * 60, { size: 34, align: 'center', color: p.color, alpha: 1 - p.age / 0.8 });
  }

  hud(c, W, {
    score,
    level: phase === 'peli' || phase === 'oikein' ? `Kuva ${picNumber}/${config.picturesPerRound}` : config.title,
    extra: phase === 'peli' ? `💰 ${pointsNow()}` : `🏆 ${best}`,
  });

  if (phase === 'alku') drawNickPicker(c);
  if (phase === 'loppu') drawScoreTable(c);
}

startGame({
  width: W,
  height: H,
  update,
  draw,
  restartGame: toStart,
  restartLevel: toStart,
  players: 1,
});

// Puhelin: peli mahtuu koko ruutuun myös vaakatasossa (osoitepalkki ei peitä
// reunoja), eikä ruutua voi vahingossa zoomata napauttamalla.
function fitPhoneScreen() {
  const vw = visualViewport?.width ?? innerWidth;
  const vh = visualViewport?.height ?? innerHeight;
  document.documentElement.style.touchAction = 'none';
  document.body.style.touchAction = 'none';
  document.body.style.height = `${vh}px`;
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const s = Math.min(vw / W, vh / H);
  canvas.style.width = `${Math.floor(W * s)}px`;
  canvas.style.height = `${Math.floor(H * s)}px`;
}
fitPhoneScreen();
addEventListener('resize', fitPhoneScreen);
visualViewport?.addEventListener('resize', fitPhoneScreen);
