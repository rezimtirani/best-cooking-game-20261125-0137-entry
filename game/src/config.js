// Rush Hour Kitchen — shared constants: the room, the stations, the menu.
// One file, one job: every number the rest of the game agrees on lives here.

export const VIEW = { width: 1280, height: 720 };

export const DAY_SECONDS = 150;
export const TICKET_SECONDS = 45;
export const CHOP_SECONDS = 2.5;
export const GRILL_SECONDS = 4;
export const BURN_SECONDS = 8;
export const CHEF_SPEED = 250;
export const CHEF_RADIUS = 22;

export const HUD = { height: 56, boardTop: 64, boardHeight: 88, floorTop: 160 };

// Stations the chef walks between. Each rect blocks movement; standing next
// to one and pressing E (or clicking it) uses it.
export const STATIONS = {
  board: { kind: 'board', label: 'CHOPPING BOARD', x: 330, y: 200, w: 230, h: 100 },
  stove: { kind: 'stove', label: 'GRILL', x: 600, y: 200, w: 230, h: 100 },
  plating: { kind: 'plating', label: 'PLATING COUNTER', x: 870, y: 200, w: 310, h: 100 },
  window: { kind: 'window', label: 'SERVING WINDOW', x: 480, y: 600, w: 320, h: 80 },
  trash: { kind: 'trash', label: 'TRASH', x: 1000, y: 600, w: 120, h: 80 },
};

// Ingredient crates along the left wall. Two columns, three rows.
export const CRATES = [
  { kind: 'tomato', x: 48, y: 190, w: 96, h: 72 },
  { kind: 'lettuce', x: 168, y: 190, w: 96, h: 72 },
  { kind: 'onion', x: 48, y: 290, w: 96, h: 72 },
  { kind: 'patty', x: 168, y: 290, w: 96, h: 72 },
  { kind: 'cheese', x: 48, y: 390, w: 96, h: 72 },
  { kind: 'bun', x: 168, y: 390, w: 96, h: 72 },
];

// What each raw ingredient is called, what it looks like, and what it can become.
export const INGREDIENTS = {
  tomato: { name: 'Tomato', color: '#d9392b', chopped: true, grilled: false },
  lettuce: { name: 'Lettuce', color: '#4caf50', chopped: true, grilled: false },
  onion: { name: 'Onion', color: '#b388c7', chopped: true, grilled: false },
  patty: { name: 'Patty', color: '#8d5a2b', chopped: false, grilled: true },
  cheese: { name: 'Cheese', color: '#f2c230', chopped: false, grilled: false },
  bun: { name: 'Bun', color: '#e0a458', chopped: false, grilled: false },
};

// The menu. A dish is its list of finished items; the same item twice counts twice.
export const RECIPES = [
  { id: 'burger', name: 'Sunny Burger', price: 30, needs: ['bun-raw', 'patty-grilled', 'lettuce-chopped', 'tomato-chopped'] },
  { id: 'salad', name: 'Garden Salad', price: 20, needs: ['lettuce-chopped', 'tomato-chopped', 'onion-chopped'] },
  { id: 'melt', name: 'Cheesy Melt', price: 26, needs: ['bun-raw', 'patty-grilled', 'cheese-raw'] },
  { id: 'soup', name: 'Tomato Soup', price: 22, needs: ['tomato-chopped', 'tomato-chopped', 'onion-chopped'] },
];

// Flat, readable kitchen palette. Everything is drawn, nothing is loaded.
export const COLORS = {
  floor: '#e8dcc3',
  floorAlt: '#dfd2b4',
  wall: '#7a5c3e',
  counter: '#b98d5f',
  counterTop: '#d9b380',
  board: '#c89b6a',
  steel: '#9aa5ad',
  steelDark: '#6e7a82',
  window: '#3f6d4e',
  trash: '#5b6770',
  ink: '#26221c',
  cream: '#fff8e7',
  red: '#c0392b',
  green: '#2e7d32',
  gold: '#f2c230',
  blue: '#2c4a6e',
};
