// Rush Hour Kitchen — sound: tiny synthesized beeps, no audio files.
// Everything is an oscillator, so the game ships no sound assets at all.

export function createSound() {
  return { ctx: null, muted: false };
}

function ensureContext(sound) {
  if (sound.ctx) return sound.ctx;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    sound.ctx = new AudioContext();
    return sound.ctx;
  } catch (error) {
    return null;
  }
}

function beep(sound, frequency, duration, type, volume) {
  if (sound.muted) return;
  const ctx = ensureContext(sound);
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type || 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    // Sound is garnish: a browser that refuses it still plays the game.
  }
}

export function playPickup(sound) { beep(sound, 880, 0.08, 'sine', 0.07); }
export function playPlace(sound) { beep(sound, 660, 0.08, 'sine', 0.07); }
export function playChop(sound) { beep(sound, 220, 0.05, 'square', 0.04); }
export function playSizzle(sound) { beep(sound, 180, 0.12, 'sawtooth', 0.03); }
export function playServe(sound) {
  beep(sound, 1046, 0.12, 'sine', 0.09);
  setTimeout(() => beep(sound, 1318, 0.16, 'sine', 0.09), 110);
}
export function playBuzzer(sound) { beep(sound, 160, 0.25, 'sawtooth', 0.08); }
export function playTick(sound) { beep(sound, 1200, 0.04, 'sine', 0.04); }
