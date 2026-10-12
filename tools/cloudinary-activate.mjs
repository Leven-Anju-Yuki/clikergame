import { readImageMap } from './image-manifest-store.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const inventory = JSON.parse(await fs.readFile('.cloudinary-local/inventory.json', 'utf8'));
const map = readImageMap();
if (inventory.selected.some(x => !map[x.path])) throw new Error('Migration incomplète : activation refusée.');
const backupRoot = path.join(root, '.cloudinary-local/backups/activation-' + new Date().toISOString().replaceAll(':', '-'));

/** Sauvegarde chaque source modifiée, puis écrit uniquement si le contenu diffère. */
async function edit(file, text) {
  const previous = await fs.readFile(file, 'utf8');
  if (previous === text) return;
  const backup = path.join(backupRoot, file);
  await fs.mkdir(path.dirname(backup), { recursive: true });
  await fs.copyFile(file, backup); await fs.writeFile(file, text);
  console.log('Raccordé : ' + file);
}
/** Produit le manifeste synchrone sans secrets, chargé avant les feuilles de style et le jeu. */
const remoteOnly = inventory.selected.filter(x => x.sourceExists === false).map(x => x.path);
const backups = [];
for (const local of Object.keys(map)) {
  try { await fs.access(path.join(root, 'secours-images', local)); backups.push(local); } catch (e) { if (e.code !== 'ENOENT') throw e; }
}
const js = '/* Généré par tools/cloudinary-activate.mjs ; URLs publiques uniquement. */\nwindow.LapinousImageManifest = ' + JSON.stringify(map, null, 2) + ';\nwindow.LapinousRemoteOnlyImages = ' + JSON.stringify(remoteOnly) + ';\nwindow.LapinousBackupImages = ' + JSON.stringify(backups) + ';\n';
try { await edit('assets/js/image-manifest.js', js); } catch (e) { if (e.code !== 'ENOENT') throw e; await fs.writeFile('assets/js/image-manifest.js', js); }
for (const file of ['index.html', 'dashboard.html']) {
  let text = await fs.readFile(file, 'utf8');
  if (!text.includes('assets/js/image-assets.js')) text = text.replace(/(<head\b[^>]*>)/i, '$1\n        <script src="./assets/js/image-manifest.js"></script>\n        <script src="./assets/js/image-assets.js"></script>');
  // Une référence locale conservée permet au prochain inventaire de retrouver les images statiques.
  text = text.replace(/((?:src|href)=["'])(\.\/assets\/img\/[^"']+)(["'])/g, (_, before, local, after) => map[local.slice(2)] ? before + map[local.slice(2)] + after + ' data-cloudinary-local="' + local + '"' : before + local + after);
  text = text.replace(/((?:src|href)=["'])(https:\/\/res\.cloudinary\.com\/[^"']+)(["'] data-cloudinary-local="([^"']+)")/g,
    (_, before, remote, after, local) => before + (map[local.replace(/^\.\//, '')] || remote) + after);
  await edit(file, text);
}
for (const file of ['assets/css/style.css', 'assets/css/shop.css', 'assets/css/legal.css']) {
  let text = await fs.readFile(file, 'utf8');
  text = text.replace(/url\(\s*(['"]?)(.*?)\1\s*\)(?:\s*\/\* lapinous-local: (.*?) \*\/)?/g, (whole, quote, source, marker) => {
    const local = marker || source;
    const key = path.posix.normalize(path.posix.join(path.posix.dirname(file), local));
    return map[key] ? `url("${map[key]}") /* lapinous-local: ${local} */` : whole;
  });
  await edit(file, text);
}
// La comparaison de pose reste exprimée en chemin local, même si src utilise Cloudinary.
const shop = await fs.readFile('assets/js/shop.js', 'utf8');
await edit('assets/js/shop.js', shop.replace("event.target.getAttribute('src')===walkingSrc", "(window.LapinousImages?.local(event.target.getAttribute('src'))||event.target.getAttribute('src'))===walkingSrc"));
console.log(`Cloudinary activé ; ${remoteOnly.length} images exclusivement distantes.`);
