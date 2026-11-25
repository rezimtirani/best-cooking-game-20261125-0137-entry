# Rush Hour Kitchen

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/rezimtirani/best-cooking-game-20261125-0137-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/rezimtirani/best-cooking-game-20261125-0137-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

One chef, one lunch rush, no burnt patties. A tiny top-down cooking game that
runs in a desktop browser from static files: grab ingredients from the crates,
chop veg on the board, grill patties on the stove, build each dish on a plate,
and serve it at the window before its ticket runs out.

## How to play

- **Move:** WASD or arrow keys. **Use:** E, Space, or click a station.
- **Enter** starts the day; **R** restarts after service ends; **M** mutes.
- The order board shows up to four tickets, each with a countdown. Serve the
  exact dish a ticket asks for — chopped where it says chopped, grilled where
  it says grilled — and earn its price plus a speed bonus and a combo bonus.
- A patty left on the grill too long burns; toss it in the trash. A ticket
  that runs out walks out, and your combo resets.
- The day lasts 2 minutes 30 seconds. Orders arrive faster as the rush builds.

## How it works

`game/` holds the whole game as static files — `index.html`, `style.css`, and
ES modules under `src/` (one file per job: `config`, `world`, `render`,
`input`, `audio`, `scenes`, `random`). No library, no network request, no
assets to load: the kitchen, the food and the chef are all drawn on a canvas,
and the beeps are synthesized with WebAudio.

`main.ts` (Node 22, standard library only) hands the entry in: it copies
`game/` and `screenshots/` to the output directory and writes `dossier.json`
with the vendored make.fun library.

```sh
# Play it locally (any static server works)
python3 -m http.server 8080 --directory game
# then open http://localhost:8080

# Hand it in
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

Four frames of the game itself, taken in a headless browser through
`?shot=`: the kitchen at the start of the rush, the chef grabbing
ingredients, a dish mid-assembly, and a finished plate at the serving window.

## License

MIT — see [LICENSE](LICENSE).
