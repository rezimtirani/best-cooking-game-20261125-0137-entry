// Rush Hour Kitchen — the renderer: every pixel on the canvas comes from here.
// Nothing is loaded from disk; the kitchen, the food and the chef are all drawn.

import { VIEW, HUD, STATIONS, CRATES, INGREDIENTS, RECIPES, COLORS } from './config.js';
import { itemLabel } from './world.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align, bold) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

// One ingredient, drawn as a little picture: tomato, lettuce, onion, patty,
// cheese or bun, in its raw, chopped, grilled or burnt state.
export function drawIngredient(ctx, kind, state, x, y, size) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'burnt') {
    ctx.fillStyle = '#2b2118';
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6e6e6e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-half * 0.5, -half * 0.4);
    ctx.lineTo(half * 0.3, half * 0.2);
    ctx.moveTo(half * 0.4, -half * 0.5);
    ctx.lineTo(-half * 0.2, half * 0.4);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (kind === 'tomato') {
    ctx.fillStyle = state === 'chopped' ? '#e8604c' : '#d9392b';
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(-half * 0.45, -half * 0.4);
    ctx.lineTo(half * 0.45, -half * 0.4);
    ctx.closePath();
    ctx.fill();
    if (state === 'chopped') {
      ctx.strokeStyle = '#fff3e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-half * 0.6, 0);
      ctx.lineTo(half * 0.6, 0);
      ctx.stroke();
    }
  } else if (kind === 'lettuce') {
    ctx.fillStyle = state === 'chopped' ? '#66bb6a' : '#4caf50';
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.arc(Math.cos(angle) * half * 0.55, Math.sin(angle) * half * 0.55, half * 0.55, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#a5d6a7';
    ctx.beginPath();
    ctx.arc(0, 0, half * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'onion') {
    ctx.fillStyle = '#c9a0d8';
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f3e5f5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, half * 0.6, 0, Math.PI * 2);
    ctx.arc(0, 0, half * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'patty') {
    ctx.fillStyle = state === 'grilled' ? '#6d4423' : '#8d5a2b';
    roundRect(ctx, -half, -half * 0.7, size, size * 0.7, half * 0.3);
    ctx.fill();
    ctx.fillStyle = state === 'grilled' ? '#4e2f16' : '#a06a35';
    ctx.fillRect(-half * 0.7, -half * 0.35, size * 0.35, size * 0.12);
    ctx.fillRect(0, -half * 0.35, size * 0.4, size * 0.12);
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.moveTo(-half, half * 0.6);
    ctx.lineTo(half, half * 0.6);
    ctx.lineTo(0, -half);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d89a12';
    ctx.beginPath();
    ctx.arc(-half * 0.25, half * 0.25, size * 0.09, 0, Math.PI * 2);
    ctx.arc(half * 0.3, half * 0.3, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'bun') {
    ctx.fillStyle = '#e0a458';
    ctx.beginPath();
    ctx.arc(0, half * 0.25, half, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-half, half * 0.25, size, half * 0.3);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(-half * 0.4, -half * 0.25, size * 0.06, 0, Math.PI * 2);
    ctx.arc(half * 0.3, -half * 0.4, size * 0.06, 0, Math.PI * 2);
    ctx.arc(half * 0.05, -half * 0.1, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlate(ctx, plate, x, y, size) {
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.ellipse(x, y, size / 2, size / 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#bdbdbd';
  ctx.lineWidth = 2;
  ctx.stroke();
  const items = plate ? plate.items : [];
  items.forEach((item, index) => {
    drawIngredient(ctx, item.kind, item.state, x + (index - (items.length - 1) / 2) * size * 0.32, y - size * 0.08, size * 0.42);
  });
}

function drawProgressRing(ctx, x, y, radius, progress, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, progress));
  ctx.stroke();
}

function drawFloor(ctx) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, HUD.floorTop, VIEW.width, VIEW.height - HUD.floorTop);
  ctx.fillStyle = COLORS.floorAlt;
  const tile = 64;
  for (let row = 0; row * tile < VIEW.height - HUD.floorTop; row += 1) {
    for (let col = 0; col * tile < VIEW.width; col += 1) {
      if ((row + col) % 2 === 0) continue;
      ctx.fillRect(col * tile, HUD.floorTop + row * tile, tile, tile);
    }
  }
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, HUD.floorTop - 8, VIEW.width, 8);
}

function drawCrates(ctx) {
  for (const crate of CRATES) {
    const info = INGREDIENTS[crate.kind];
    ctx.fillStyle = '#8d6e4a';
    roundRect(ctx, crate.x, crate.y, crate.w, crate.h, 8);
    ctx.fill();
    ctx.fillStyle = '#a8875f';
    ctx.fillRect(crate.x + 6, crate.y + 6, crate.w - 12, crate.h - 12);
    drawIngredient(ctx, crate.kind, 'raw', crate.x + crate.w / 2, crate.y + crate.h / 2 - 8, 44);
    text(ctx, info.name.toUpperCase(), crate.x + crate.w / 2, crate.y + crate.h - 10, 11, COLORS.cream, 'center', true);
  }
}

function drawStations(ctx, world) {
  for (const station of Object.values(STATIONS)) {
    const isCounter = station.kind === 'board' || station.kind === 'plating';
    ctx.fillStyle = isCounter ? COLORS.counter : station.kind === 'stove' ? COLORS.steelDark : station.kind === 'window' ? COLORS.window : COLORS.trash;
    roundRect(ctx, station.x, station.y, station.w, station.h, 10);
    ctx.fill();
    ctx.fillStyle = isCounter ? COLORS.counterTop : 'rgba(255,255,255,0.12)';
    ctx.fillRect(station.x + 6, station.y + 6, station.w - 12, 22);
    text(ctx, station.label, station.x + station.w / 2, station.y + 17, 12, COLORS.cream, 'center', true);
  }

  const board = world.board;
  if (board.item) {
    drawIngredient(ctx, board.item.kind, board.item.state, STATIONS.board.x + STATIONS.board.w / 2, STATIONS.board.y + 62, 52);
    if (board.item.state === 'raw') {
      drawProgressRing(ctx, STATIONS.board.x + STATIONS.board.w - 26, STATIONS.board.y + 62, 14, board.progress, COLORS.gold);
    }
  } else {
    text(ctx, 'drop veg here to chop', STATIONS.board.x + STATIONS.board.w / 2, STATIONS.board.y + 62, 13, 'rgba(255,248,231,0.75)', 'center');
  }

  const stove = world.stove;
  if (stove.item) {
    drawIngredient(ctx, stove.item.kind, stove.item.state, STATIONS.stove.x + STATIONS.stove.w / 2, STATIONS.stove.y + 62, 52);
    drawProgressRing(ctx, STATIONS.stove.x + STATIONS.stove.w - 26, STATIONS.stove.y + 62, 14, Math.min(1, stove.progress), stove.item.state === 'burnt' ? COLORS.red : '#ff7043');
  } else {
    text(ctx, 'drop a patty here to grill', STATIONS.stove.x + STATIONS.stove.w / 2, STATIONS.stove.y + 62, 13, 'rgba(255,248,231,0.75)', 'center');
  }

  const counter = world.plating;
  if (counter.plate) {
    drawPlate(ctx, counter.plate, STATIONS.plating.x + STATIONS.plating.w / 2, STATIONS.plating.y + 64, 84);
  }
  if (counter.sparePlates > 0) {
    text(ctx, `+${counter.sparePlates} plate`, STATIONS.plating.x + STATIONS.plating.w - 14, STATIONS.plating.y + STATIONS.plating.h - 12, 12, COLORS.cream, 'right');
  }

  const win = STATIONS.window;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(win.x + 14, win.y + 34, win.w - 28, 6);
  text(ctx, 'SERVE HERE', win.x + win.w / 2, win.y + 60, 13, COLORS.cream, 'center', true);
}

function drawChef(ctx, world) {
  const chef = world.chef;
  ctx.save();
  ctx.translate(chef.x, chef.y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d32f2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 2, 22, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-13, -44, 26, 22);
  ctx.beginPath();
  ctx.ellipse(0, -22, 17, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#26221c';
  const lookX = Math.cos(chef.dir) * 4;
  const lookY = Math.sin(chef.dir) * 3;
  ctx.beginPath();
  ctx.arc(-7 + lookX, -2 + lookY, 3, 0, Math.PI * 2);
  ctx.arc(7 + lookX, -2 + lookY, 3, 0, Math.PI * 2);
  ctx.fill();
  if (chef.carry) {
    const carry = chef.carry;
    const handX = Math.cos(chef.dir) * 30;
    const handY = Math.sin(chef.dir) * 30 - 6;
    if (carry.kind === 'plate') {
      drawPlate(ctx, carry, handX, handY, 56);
    } else {
      drawIngredient(ctx, carry.kind, carry.state, handX, handY, 40);
    }
  }
  ctx.restore();
}

function drawTicket(ctx, ticket, x, y, w, h) {
  const urgent = ticket.timeLeft < 12;
  ctx.fillStyle = urgent ? '#fbe9e7' : COLORS.cream;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? COLORS.red : '#c9b48a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, ticket.recipe.name, x + 12, y + 18, 15, COLORS.ink, 'left', true);
  text(ctx, `$${ticket.recipe.price}`, x + w - 12, y + 18, 15, COLORS.green, 'right', true);
  ticket.recipe.needs.forEach((need, index) => {
    const [kind, state] = need.split('-');
    drawIngredient(ctx, kind, state || 'raw', x + 24 + index * 34, y + 48, 26);
  });
  const barW = w - 24;
  const barY = y + h - 16;
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x + 12, barY, barW, 8);
  ctx.fillStyle = urgent ? COLORS.red : COLORS.green;
  ctx.fillRect(x + 12, barY, barW * Math.max(0, ticket.timeLeft / 45), 8);
  text(ctx, `${Math.ceil(Math.max(0, ticket.timeLeft))}s`, x + w - 12, barY + 4, 11, COLORS.ink, 'right', true);
}

function drawBoard(ctx, world) {
  const y = HUD.boardTop;
  const h = HUD.boardHeight;
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(0, y, VIEW.width, h);
  text(ctx, 'ORDER BOARD', 24, y + 20, 13, '#d7ccc8', 'left', true);
  if (world.tickets.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', 200, y + h / 2 + 6, 16, '#d7ccc8', 'left');
  }
  world.tickets.forEach((ticket, index) => {
    drawTicket(ctx, ticket, 180 + index * 262, y + 8, 248, h - 16);
  });
}

function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.blue;
  ctx.fillRect(0, 0, VIEW.width, HUD.height);
  text(ctx, 'RUSH HOUR KITCHEN', 24, HUD.height / 2, 22, '#ffffff', 'left', true);
  const minutes = Math.floor(world.timeLeft / 60);
  const seconds = Math.floor(world.timeLeft % 60);
  const clock = `${minutes}:${String(seconds).padStart(2, '0')}`;
  text(ctx, `⏱ ${clock}`, 560, HUD.height / 2, 20, world.timeLeft < 30 ? '#ff8a65' : '#ffffff', 'left', true);
  text(ctx, `SCORE $${world.score}`, 760, HUD.height / 2, 20, COLORS.gold, 'left', true);
  text(ctx, `SERVED ${world.served}`, 940, HUD.height / 2, 18, '#ffffff', 'left', true);
  text(ctx, world.combo > 1 ? `COMBO x${world.combo}` : '', 1120, HUD.height / 2, 18, '#ffcc80', 'left', true);
  if (world.flash && world.elapsed < world.flashUntil) {
    text(ctx, world.flash, VIEW.width / 2, HUD.height + 26, 18, COLORS.ink, 'center', true);
  }
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(20,16,10,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = COLORS.cream;
  roundRect(ctx, 340, 150, 600, 380, 18);
  ctx.fill();
  text(ctx, 'RUSH HOUR KITCHEN', 640, 210, 40, COLORS.ink, 'center', true);
  text(ctx, 'One chef. One lunch rush. No burnt patties.', 640, 258, 18, '#6d4c41', 'center');
  text(ctx, 'Move with WASD or arrow keys — press E (or click) to', 640, 310, 16, COLORS.ink, 'center');
  text(ctx, 'grab, chop, grill, plate and serve before the tickets run out.', 640, 336, 16, COLORS.ink, 'center');
  text(ctx, 'Chop veg on the board · Grill patties on the stove', 640, 380, 16, COLORS.ink, 'center');
  text(ctx, 'Build the dish on a plate · Serve it at the window', 640, 404, 16, COLORS.ink, 'center');
  ctx.fillStyle = COLORS.green;
  roundRect(ctx, 490, 440, 300, 56, 12);
  ctx.fill();
  text(ctx, 'PRESS ENTER TO START', 640, 469, 18, '#ffffff', 'center', true);
  text(ctx, 'R to restart · M to mute', 640, 512, 13, '#8d6e63', 'center');
}

function drawOver(ctx, world) {
  ctx.fillStyle = 'rgba(20,16,10,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = COLORS.cream;
  roundRect(ctx, 380, 170, 520, 340, 18);
  ctx.fill();
  text(ctx, 'SERVICE OVER!', 640, 230, 36, COLORS.ink, 'center', true);
  text(ctx, `Final score  $${world.score}`, 640, 290, 22, COLORS.green, 'center', true);
  text(ctx, `Dishes served  ${world.served}   ·   Best combo  x${world.bestCombo}   ·   Walked out  ${world.spoiled}`, 640, 330, 16, COLORS.ink, 'center');
  const verdict = world.score >= 200 ? 'A rush-hour legend. The regulars are already back.'
    : world.score >= 100 ? 'Solid service! The lunch crowd ate well.'
    : 'The kitchen survived — barely. Faster hands next time!';
  text(ctx, verdict, 640, 370, 16, '#6d4c41', 'center');
  ctx.fillStyle = COLORS.blue;
  roundRect(ctx, 490, 410, 300, 56, 12);
  ctx.fill();
  text(ctx, 'PRESS R TO COOK AGAIN', 640, 439, 18, '#ffffff', 'center', true);
}

// Draw one frame of the game onto ctx.
export function drawWorld(ctx, world) {
  drawHud(ctx, world);
  drawBoard(ctx, world);
  drawFloor(ctx);
  drawCrates(ctx);
  drawStations(ctx, world);
  drawChef(ctx, world);
  if (world.screen === 'title') drawTitle(ctx, world);
  if (world.screen === 'over') drawOver(ctx, world);
}

export { RECIPES };
