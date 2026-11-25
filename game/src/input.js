// Rush Hour Kitchen — input: keyboard movement and mouse clicks.
// The game reads this one object every frame; nothing else touches the keys.

export function createInput() {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    usePressed: false,
    startPressed: false,
    restartPressed: false,
    mutePressed: false,
    clickX: -1,
    clickY: -1,
    clicked: false,
  };
}

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
};

export function attachInput(input, canvas, hooks) {
  window.addEventListener('keydown', (event) => {
    const mapped = KEYMAP[event.code];
    if (mapped) {
      input[mapped] = true;
      event.preventDefault();
      return;
    }
    if (event.code === 'KeyE' || event.code === 'Space') {
      if (!event.repeat) input.usePressed = true;
      event.preventDefault();
    }
    if (event.code === 'Enter') input.startPressed = true;
    if (event.code === 'KeyR') input.restartPressed = true;
    if (event.code === 'KeyM') input.mutePressed = true;
  });
  window.addEventListener('keyup', (event) => {
    const mapped = KEYMAP[event.code];
    if (mapped) input[mapped] = false;
  });
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.clickX = (event.clientX - rect.left) * scaleX;
    input.clickY = (event.clientY - rect.top) * scaleY;
    input.clicked = true;
    if (hooks && hooks.onClick) hooks.onClick(input.clickX, input.clickY);
  });
  window.addEventListener('blur', () => {
    input.left = false;
    input.right = false;
    input.up = false;
    input.down = false;
  });
}

export function consumePresses(input) {
  const pressed = {
    use: input.usePressed,
    start: input.startPressed,
    restart: input.restartPressed,
    mute: input.mutePressed,
    click: input.clicked,
    clickX: input.clickX,
    clickY: input.clickY,
  };
  input.usePressed = false;
  input.startPressed = false;
  input.restartPressed = false;
  input.mutePressed = false;
  input.clicked = false;
  return pressed;
}
