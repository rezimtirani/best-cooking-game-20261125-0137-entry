// Rush Hour Kitchen — the screenshot scenes behind ?shot=.
// Each scene stages a real world through the game's own factories, then lets
// the simulation run a few steps, so the frame is what live play looks like
// at that moment: the same seed always gives the same frame.

import { createWorld, spawnTicket, freshItem, freshPlate, step } from './world.js';

function setClock(world, secondsLeft, score, combo) {
  world.timeLeft = secondsLeft;
  world.score = score;
  world.combo = combo;
  world.bestCombo = Math.max(world.bestCombo, combo);
  world.spawnIn = 999;
}

function putTicket(world, recipeId, secondsLeft) {
  const ticket = spawnTicket(world, recipeId);
  ticket.timeLeft = secondsLeft;
  return ticket;
}

function settle(world, seconds) {
  const empty = { left: false, right: false, up: false, down: false };
  const steps = Math.round(seconds * 60);
  for (let index = 0; index < steps; index += 1) step(world, empty, 1 / 60);
}

function stageKitchen(world) {
  putTicket(world, 'burger', 38);
  putTicket(world, 'salad', 30);
  putTicket(world, 'melt', 22);
  world.board.item = freshItem('tomato', 'raw');
  world.board.progress = 0.4;
  world.stove.item = freshItem('patty', 'raw');
  world.stove.progress = 0.5;
  world.plating.plate = freshPlate();
  world.chef.x = 640;
  world.chef.y = 480;
  world.chef.dir = -Math.PI / 2;
  setClock(world, 150, 0, 0);
}

function stageIngredients(world) {
  putTicket(world, 'burger', 38);
  putTicket(world, 'soup', 31);
  world.chef.x = 320;
  world.chef.y = 228;
  world.chef.dir = Math.PI;
  world.chef.carry = freshItem('tomato', 'raw');
  setClock(world, 125, 15, 0);
}

function stageAssembly(world) {
  putTicket(world, 'burger', 25);
  putTicket(world, 'melt', 18);
  world.board.item = freshItem('tomato', 'raw');
  world.board.progress = 0.6;
  world.stove.item = freshItem('patty', 'raw');
  world.stove.progress = 0.7;
  const plate = freshPlate();
  plate.items.push(freshItem('bun', 'raw'));
  plate.items.push(freshItem('patty', 'grilled'));
  plate.items.push(freshItem('lettuce', 'chopped'));
  world.plating.plate = plate;
  world.chef.x = 1025;
  world.chef.y = 360;
  world.chef.dir = -Math.PI / 2;
  setClock(world, 92, 56, 2);
}

function stageServe(world) {
  putTicket(world, 'burger', 12);
  putTicket(world, 'salad', 28);
  const plate = freshPlate();
  plate.items.push(freshItem('bun', 'raw'));
  plate.items.push(freshItem('patty', 'grilled'));
  plate.items.push(freshItem('lettuce', 'chopped'));
  plate.items.push(freshItem('tomato', 'chopped'));
  world.chef.carry = plate;
  world.chef.x = 640;
  world.chef.y = 556;
  world.chef.dir = Math.PI / 2;
  world.plating.plate = null;
  setClock(world, 42, 148, 3);
}

// Build the named scene and return the world ready to draw once.
export function stageScene(name) {
  const world = createWorld(20261125);
  world.screen = 'play';
  if (name === 'ingredients') stageIngredients(world);
  else if (name === 'assembly') stageAssembly(world);
  else if (name === 'serve') stageServe(world);
  else stageKitchen(world);
  settle(world, 0.5);
  return world;
}
