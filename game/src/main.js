// Rush Hour Kitchen — the bootstrap: wire the canvas, the input and the loop.
// With ?shot=<scene> it draws one staged frame and stops; otherwise it plays.

import { VIEW } from './config.js';
import { createWorld, startGame, restart, step, interact } from './world.js';
import { drawWorld } from './render.js';
import { createInput, attachInput, consumePresses } from './input.js';
import { createSound, playPickup, playPlace, playServe, playBuzzer } from './audio.js';
import { stageScene } from './scenes.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const sound = createSound();

if (shot) {
  const world = stageScene(shot);
  drawWorld(ctx, world);
} else {
  const world = createWorld(Date.now() % 2147483647);
  const input = createInput();
  attachInput(input, canvas);
  let lastTick = performance.now();
  let chopNoise = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    const pressed = consumePresses(input);

    if (pressed.mute) sound.muted = !sound.muted;
    if (world.screen === 'title' && pressed.start) {
      startGame(world);
    } else if (world.screen === 'over' && pressed.restart) {
      restart(world);
    } else if (world.screen === 'play') {
      if (pressed.use && interact(world)) {
        const carried = world.chef.carry;
        if (carried && carried.kind === 'plate') playServe(sound);
        else playPickup(sound);
      }
      if (pressed.click) {
        const before = world.chef.carry;
        if (interact(world) && !before) playPickup(sound);
      }
      const wasChopping = world.board.item && world.board.item.state === 'raw';
      const wasGrilling = world.stove.item && world.stove.item.state === 'raw';
      step(world, input, dt);
      if (wasChopping && world.board.item && world.board.item.state === 'chopped') playPlace(sound);
      if (wasGrilling && world.stove.item && world.stove.item.state === 'grilled') playPlace(sound);
      if ((wasChopping || wasGrilling) && Math.floor(now / 300) !== chopNoise) {
        chopNoise = Math.floor(now / 300);
        playPickup(sound);
      }
      if (world.over) playBuzzer(sound);
    }

    drawWorld(ctx, world);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
