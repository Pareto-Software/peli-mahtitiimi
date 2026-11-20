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
import { config, type PictureDef } from './config';

const W = 960;
const H = 540;
const theme = themes[config.theme];
const SIZE = config.size;
const PIC_Y = 200; // where the middle of the picture is

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
let phaseAge = 0;
let popups: Popup[] = [];
let score = 0;
let best = storage.load('best', 0);
let newRecord = false;

// Small canvas: the picture is drawn tiny and stretched big = blurry!
const blurCanvas = document.createElement('canvas');
const blurCtx = blurCanvas.getContext('2d')!;
const sharpCanvas = document.createElement('canvas');
sharpCanvas.width = SIZE;
sharpCanvas.height = SIZE;
const sharpCtx = sharpCanvas.getContext('2d')!;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

/** Where button i is: a row at the bottom of the screen. */
function buttonRect(i: number) {
  const gap = 16;
  const w = (W - 32 - gap * (choices.length - 1)) / choices.length;
  return { x: 16 + i * (w + gap), y: 400, w, h: 90 };
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

  if (phase === 'alku' || (phase === 'loppu' && phaseAge > 1.2)) {
    if (wantsToStart(taps)) startRound();
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

/** Draws the picture: tiny on a small canvas, then stretched big = blurry. */
function drawBlurryPicture(c: CanvasRenderingContext2D) {
  const sharp = phase === 'oikein' ? 1 : sharpness();
  const pixels = Math.round(config.startSharpness + (SIZE - config.startSharpness) * sharp * sharp);
  blurCanvas.width = pixels;
  blurCanvas.height = pixels;
  sharpCtx.clearRect(0, 0, SIZE, SIZE);
  drawEmoji(sharpCtx, current.emoji, SIZE / 2, SIZE / 2, SIZE);
  blurCtx.clearRect(0, 0, pixels, pixels);
  blurCtx.drawImage(sharpCanvas, 0, 0, pixels, pixels);
  c.save();
  c.imageSmoothingEnabled = true;
  c.drawImage(blurCanvas, W / 2 - SIZE / 2, PIC_Y - SIZE / 2, SIZE, SIZE);
  c.restore();
}

function drawButtons(c: CanvasRenderingContext2D) {
  choices.forEach((ch, i) => {
    const r = buttonRect(i);
    const right = phase === 'oikein' && ch.pic === current;
    const color = right ? '#3ccf6e' : ch.wrong ? '#d94a4a' : 'rgba(255,255,255,0.9)';
    roundRect(c, r.x, r.y, r.w, r.h, 18, color);
    const textColor = right || ch.wrong ? '#fff' : '#223';
    text(c, `${i + 1}. ${ch.pic.name}`, r.x + r.w / 2, r.y + r.h / 2, { size: 28, align: 'center', color: textColor });
  });
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
    drawBlurryPicture(c);
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

  if (phase === 'alku') {
    banner(c, W, H, config.title, 'Arvaa sumea kuva – mitä nopeammin, sitä enemmän pisteitä! Napauta aloittaaksesi');
  }
  if (phase === 'loppu') {
    const sub = newRecord ? 'Uusi ennätys! 🏆' : `Ennätys ${best}`;
    banner(c, W, H, `Valmis! ⭐ ${score}`, phaseAge > 1.2 ? `${sub} · napauta niin uusi kierros` : sub);
  }
}

startGame({
  width: W,
  height: H,
  update,
  draw,
  restartGame: startRound,
  restartLevel: startRound,
  players: 1,
});
