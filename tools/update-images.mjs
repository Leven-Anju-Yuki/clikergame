import { readImageMap, writeImageMap } from './image-manifest-store.mjs';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const watchMode = process.argv.includes('--watch');
const backupMode = process.argv.includes('--backup-local');
let running = false, pending = false, timer;

/** Exécute une étape et arrête la chaîne si elle échoue. Aucun secret n’est lu ici. */
function run(file, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Étape interrompue : ${file}`)));
  });
}

/** Regroupe les étapes de migration ; les transferts restent contrôlés par le quota gratuit. */
async function update() {
  if (running) { pending = true; return; }
  running = true;
  try {
    await run('tools/cloudinary-sync.mjs', ['dry-run']);
    const inventory = JSON.parse(fs.readFileSync('.cloudinary-local/inventory.json', 'utf8'));
    let manifest = { assets: {} };
    try { manifest = JSON.parse(fs.readFileSync('.cloudinary-local/manifest.json', 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    const changed = inventory.selected.some(x => x.sourceExists !== false && (manifest.assets[x.path]?.hash !== x.hash || manifest.assets[x.path]?.status !== 'verified'));
    const hasLocalImages = inventory.selected.some(x => x.sourceExists !== false);
    if (backupMode && !hasLocalImages && !changed) {
      console.log('Aucune nouvelle image utilisée : aucun appel Cloudinary ni transfert.');
      return;
    }
    if (changed) {
      const hasPilot = ['png', 'gif', 'svg'].every(ext => Object.values(manifest.assets).some(x => x.path.endsWith('.' + ext) && x.status === 'verified'));
      if (!hasPilot) await run('tools/cloudinary-sync.mjs', ['pilot']);
      await run('tools/cloudinary-sync.mjs', ['sync']);
    } else {
      // Retire du manifeste public les références devenues inutiles, sans supprimer les ressources distantes.
      const map = Object.fromEntries(inventory.selected.map(x => [x.path, x.url || manifest.assets[x.path]?.url]));
      writeImageMap(map);
    }
    if (backupMode && hasLocalImages) {
      await run('tools/backup-transferred-images.mjs');
      await run('tools/cloudinary-sync.mjs', ['dry-run']);
    }
    await run('tools/cloudinary-activate.mjs');
    console.log(changed ? 'Images synchronisées et raccordées.' : 'Images déjà synchronisées ; raccordement à jour.');
  } catch (e) {
    console.error(e.message);
    if (!watchMode) process.exitCode = 1;
  } finally {
    running = false;
    if (pending) { pending = false; schedule(); }
  }
}

/** Attend la fin d’une série de sauvegardes avant de relancer la synchronisation. */
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(update, 3000);
}

if (watchMode) {
  for (const folder of ['assets/img', 'assets/js']) fs.watch(folder, { recursive: true }, (_, file) => {
    if (folder === 'assets/js' && (!file || /image-manifest\.js$/.test(file))) return;
    schedule();
  });
  fs.watch('.', (_, file) => { if (['lapinous-content.json', 'lapinous-puzzles.json', 'lapinous-shop.json'].includes(file)) schedule(); });
  console.log('Synchronisation automatique active. Garder cette fenêtre ouverte ; Ctrl+C pour arrêter.');
}
await update();
