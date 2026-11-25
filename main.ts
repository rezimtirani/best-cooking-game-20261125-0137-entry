// Rush Hour Kitchen — the hand-in program (Node 22, standard library only).
//
// The game is plain static files under game/ and its screenshots under
// screenshots/. This program hands them in: it copies both folders into the
// output directory and writes dossier.json, the summary the judge reads,
// with the vendored make.fun library. It runs twice in the grader and both
// runs must write the same bytes, so nothing here depends on the clock or
// on anything outside this repository.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handInFolder(name) {
  const source = join(repoRoot, name);
  const target = join(outputDir, name);
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

function writeDossier() {
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

// A one-line receipt on stdout: what the hand-in holds, and where it went.
// The files themselves are the entry; this line only says the copy landed.
function reportHandIn() {
  const walk = (dir) => {
    let files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      files = files.concat(entry.isDirectory() ? walk(path) : [path]);
    }
    return files;
  };
  const handed = walk(outputDir);
  const totalBytes = handed.reduce((sum, path) => sum + statSync(path).size, 0);
  const names = handed.map((path) => path.slice(outputDir.length + 1));
  console.log(`Rush Hour Kitchen handed in: ${names.length} files, ${totalBytes} bytes -> ${outputDir}`);
}

mkdirSync(outputDir, { recursive: true });
handInFolder('game');
handInFolder('screenshots');
writeDossier();
reportHandIn();

mkdirSync(outputDir, { recursive: true });
handInFolder('game');
handInFolder('screenshots');
writeDossier();
