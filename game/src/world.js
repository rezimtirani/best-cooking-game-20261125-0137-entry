// Rush Hour Kitchen — the world: state, the clock, and every rule of the kitchen.
// Rendering never lives here; this file only decides what is true about the game.

import {
  VIEW, DAY_SECONDS, TICKET_SECONDS, CHOP_SECONDS, GRILL_SECONDS, BURN_SECONDS,
  CHEF_SPEED, CHEF_RADIUS, HUD, STATIONS, CRATES, INGREDIENTS, RECIPES,
} from './config.js';
import { makeRandom } from './random.js';

let ticketCounter = 0;

export function freshItem(kind, state) {
  return { kind, state: state || 'raw' };
}

export function itemLabel(item) {
  if (!item) return '';
  if (item.kind === 'plate') return 'Plate';
  const base = INGREDIENTS[item.kind].name;
  if (item.state === 'chopped') return `Chopped ${base}`;
  if (item.state === 'grilled') return `Grilled ${base}`;
  if (item.state === 'burnt') return `Burnt ${base}`;
  return base;
}

// A plate is a tray that holds finished items. Two plates wait on the counter.
export function freshPlate() {
  return { kind: 'plate', items: [] };
}

export function createWorld(seed) {
  return {
    seed,
    rng: makeRandom(seed),
    elapsed: 0,
    timeLeft: DAY_SECONDS,
    score: 0,
    served: 0,
    spoiled: 0,
    combo: 0,
    bestCombo: 0,
    spawnIn: 6,
    tickets: [],
    chef: { x: 640, y: 480, dir: 0, carry: null, moving: false },
    board: { item: null, progress: 0 },
    stove: { item: null, progress: 0 },
    plating: { plate: freshPlate(), sparePlates: 1 },
    screen: 'title',
    over: false,
    flash: '',
    flashUntil: 0,
  };
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

export function spawnTicket(world, recipeId) {
  const recipe = recipeId ? recipeById(recipeId) : world.rng.pick(RECIPES);
  ticketCounter += 1;
  const ticket = {
    id: ticketCounter,
    recipe,
    timeLeft: TICKET_SECONDS,
    matched: false,
  };
  world.tickets.push(ticket);
  return ticket;
}

// The plate matches a ticket when it holds exactly the ticket's items,
// counting repeats: two chopped tomatoes are two, not one.
export function plateMatchesTicket(plate, ticket) {
  const wanted = [...ticket.recipe.needs].sort();
  const held = plate.items.map((item) => `${item.kind}-${item.state}`).sort();
  if (wanted.length !== held.length) return false;
  return wanted.every((need, index) => need === held[index]);
}

export function findMatchingTicket(world, plate) {
  return world.tickets.find((ticket) => plateMatchesTicket(plate, ticket));
}

function rectsOverlap(ax, ay, ar, bx, by, bw, bh) {
  return ax + ar > bx && ax - ar < bx + bw && ay + ar > by && ay - ar < by + bh;
}

function stationRects() {
  return Object.values(STATIONS).map((station) => ({
    kind: station.kind, x: station.x, y: station.y, w: station.w, h: station.h,
  }));
}

function crateRects() {
  return CRATES.map((crate) => ({
    kind: 'crate', crate, x: crate.x, y: crate.y, w: crate.w, h: crate.h,
  }));
}

function collides(world, x, y) {
  if (x < 24 + CHEF_RADIUS || x > VIEW.width - 24 - CHEF_RADIUS) return true;
  if (y < HUD.floorTop + CHEF_RADIUS || y > VIEW.height - 16 - CHEF_RADIUS) return true;
  const solids = [...stationRects(), ...crateRects()];
  return solids.some((rect) => rectsOverlap(x, y, CHEF_RADIUS - 4, rect.x, rect.y, rect.w, rect.h));
}

function nearRect(world, rect) {
  const chef = world.chef;
  const reach = 46;
  const closestX = Math.max(rect.x, Math.min(chef.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(chef.y, rect.y + rect.h));
  const dx = chef.x - closestX;
  const dy = chef.y - closestY;
  return dx * dx + dy * dy <= reach * reach;
}

function nearestUsable(world) {
  const chef = world.chef;
  let best = null;
  let bestDistance = Infinity;
  const targets = [
    ...stationRects().map((rect) => ({ ...rect, target: rect.kind })),
    ...crateRects().map((rect) => ({ ...rect, target: `crate:${rect.crate.kind}` })),
  ];
  for (const rect of targets) {
    if (!nearRect(world, rect)) continue;
    const cx = Math.max(rect.x, Math.min(chef.x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(chef.y, rect.y + rect.h));
    const distance = (chef.x - cx) ** 2 + (chef.y - cy) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = rect;
    }
  }
  return best;
}

export function nearestUsableKind(world) {
  const found = nearestUsable(world);
  return found ? found.target : null;
}

function say(world, text) {
  world.flash = text;
  world.flashUntil = world.elapsed + 1.4;
}

// One use of the nearest station or crate. Returns true when something happened.
export function interact(world) {
  if (world.over || world.screen !== 'play') return false;
  const found = nearestUsable(world);
  if (!found) return false;
  const chef = world.chef;

  if (found.target.startsWith('crate:')) {
    if (chef.carry) { say(world, 'Hands full!'); return false; }
    chef.carry = freshItem(found.crate.kind);
    say(world, `Picked up ${INGREDIENTS[found.crate.kind].name}`);
    return true;
  }

  if (found.target === 'board') {
    const slot = world.board;
    if (!slot.item && chef.carry && chef.carry.kind !== 'plate') {
      const info = INGREDIENTS[chef.carry.kind];
      if (!info.chopped) { say(world, 'That cannot be chopped'); return false; }
      if (chef.carry.state !== 'raw') { say(world, 'Already chopped'); return false; }
      slot.item = chef.carry;
      slot.progress = 0;
      chef.carry = null;
      return true;
    }
    if (slot.item && slot.item.state === 'chopped' && !chef.carry) {
      chef.carry = slot.item;
      slot.item = null;
      slot.progress = 0;
      return true;
    }
    if (slot.item && slot.item.state === 'raw') { say(world, 'Chopping…'); return false; }
    return false;
  }

  if (found.target === 'stove') {
    const slot = world.stove;
    if (!slot.item && chef.carry && chef.carry.kind === 'patty') {
      if (chef.carry.state !== 'raw') { say(world, 'Already grilled'); return false; }
      slot.item = chef.carry;
      slot.progress = 0;
      chef.carry = null;
      return true;
    }
    if (slot.item && (slot.item.state === 'grilled' || slot.item.state === 'burnt') && !chef.carry) {
      chef.carry = slot.item;
      slot.item = null;
      slot.progress = 0;
      return true;
    }
    if (slot.item && slot.item.state === 'raw') { say(world, 'Grilling…'); return false; }
    if (chef.carry && chef.carry.kind !== 'patty') { say(world, 'Only patties go on the grill'); return false; }
    return false;
  }

  if (found.target === 'plating') {
    const counter = world.plating;
    if (!counter.plate && chef.carry && chef.carry.kind === 'plate') {
      counter.plate = chef.carry;
      chef.carry = null;
      return true;
    }
    if (!counter.plate && !chef.carry && counter.sparePlates > 0) {
      counter.sparePlates -= 1;
      chef.carry = freshPlate();
      return true;
    }
    if (counter.plate && chef.carry && chef.carry.kind !== 'plate') {
      counter.plate.items.push(chef.carry);
      say(world, `Added ${itemLabel(chef.carry)} to the plate`);
      chef.carry = null;
      return true;
    }
    if (counter.plate && !chef.carry) {
      chef.carry = counter.plate;
      counter.plate = null;
      return true;
    }
    return false;
  }

  if (found.target === 'window') {
    if (!chef.carry || chef.carry.kind !== 'plate') { say(world, 'Bring a finished plate'); return false; }
    const ticket = findMatchingTicket(world, chef.carry);
    if (!ticket) { say(world, 'No order matches this plate!'); return false; }
    const timeBonus = Math.ceil(ticket.timeLeft / 5);
    const earned = ticket.recipe.price + timeBonus + world.combo * 2;
    world.score += earned;
    world.served += 1;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    world.tickets = world.tickets.filter((entry) => entry !== ticket);
    chef.carry = null;
    say(world, `Served ${ticket.recipe.name}! +$${earned}`);
    return true;
  }

  if (found.target === 'trash') {
    if (!chef.carry) return false;
    say(world, `Tossed ${itemLabel(chef.carry)}`);
    chef.carry = null;
    return true;
  }
  return false;
}

function stepChef(world, input, dt) {
  const chef = world.chef;
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (dx === 0 && dy === 0) {
    chef.moving = false;
    return;
  }
  const length = Math.hypot(dx, dy);
  dx /= length;
  dy /= length;
  chef.dir = Math.atan2(dy, dx);
  chef.moving = true;
  const nextX = chef.x + dx * CHEF_SPEED * dt;
  const nextY = chef.y + dy * CHEF_SPEED * dt;
  if (!collides(world, nextX, chef.y)) chef.x = nextX;
  if (!collides(world, chef.x, nextY)) chef.y = nextY;
}

function stepStations(world, dt) {
  const board = world.board;
  if (board.item && board.item.state === 'raw') {
    board.progress += dt / CHOP_SECONDS;
    if (board.progress >= 1) {
      board.item.state = 'chopped';
      board.progress = 1;
    }
  }
  const stove = world.stove;
  if (stove.item && stove.item.state === 'raw') {
    stove.progress += dt / GRILL_SECONDS;
    if (stove.progress >= 1) {
      stove.item.state = 'grilled';
      stove.progress = 1;
    }
  } else if (stove.item && stove.item.state === 'grilled') {
    stove.progress += dt / BURN_SECONDS;
    if (stove.progress >= 2) {
      stove.item.state = 'burnt';
    }
  }
}

function stepTickets(world, dt) {
  for (const ticket of world.tickets) {
    ticket.timeLeft -= dt;
  }
  const expired = world.tickets.filter((ticket) => ticket.timeLeft <= 0);
  for (const ticket of expired) {
    world.spoiled += 1;
    world.combo = 0;
    say(world, `Too slow — ${ticket.recipe.name} walked out!`);
  }
  world.tickets = world.tickets.filter((ticket) => ticket.timeLeft > 0);
  world.spawnIn -= dt;
  if (world.spawnIn <= 0 && world.tickets.length < 4) {
    spawnTicket(world);
    const pace = Math.max(10, 16 - Math.floor(world.elapsed / 30));
    world.spawnIn = pace;
  }
}

// Advance the world by dt seconds. Input is {left, right, up, down}.
export function step(world, input, dt) {
  if (world.over || world.screen !== 'play') return;
  world.elapsed += dt;
  world.timeLeft -= dt;
  stepChef(world, input, dt);
  stepStations(world, dt);
  stepTickets(world, dt);
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.over = true;
    world.screen = 'over';
  }
}

export function startGame(world) {
  world.screen = 'play';
  world.tickets = [];
  spawnTicket(world, 'burger');
  spawnTicket(world, 'salad');
  world.spawnIn = 14;
}

export function restart(world) {
  const seed = world.seed + 1;
  const fresh = createWorld(seed);
  Object.assign(world, fresh);
  startGame(world);
}
