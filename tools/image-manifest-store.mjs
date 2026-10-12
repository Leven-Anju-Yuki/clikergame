import fs from 'node:fs';
import path from 'node:path';

const file = 'assets/js/image-manifest.js';
/** Lit les données JSON du manifeste JavaScript sans exécuter son code. */
export function readImageManifest() {
  const source = fs.readFileSync(file, 'utf8');
  function data(name, fallback) {
    const match = source.match(new RegExp('window\\.' + name + '\\s*=\\s*([\\s\\S]*?);(?:\\r?\\n|$)'));
    return match ? JSON.parse(match[1]) : fallback;
  }
  const images = data('LapinousImageManifest', {});
  if (!images || typeof images !== 'object' || Array.isArray(images)) throw new Error('Manifeste images incorrect.');
  return { images, remoteOnly: data('LapinousRemoteOnlyImages', []), backups: data('LapinousBackupImages', []) };
}
export function readImageMap() { return readImageManifest().images; }
/** Écrit le manifeste unique et sauvegarde sa précédente version avant remplacement. */
export function writeImageMap(images) {
  let previous = '', state = { remoteOnly: [], backups: [] };
  try { previous = fs.readFileSync(file, 'utf8'); state = readImageManifest(); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const result = '/* Généré automatiquement ; URLs publiques uniquement. */\nwindow.LapinousImageManifest = ' + JSON.stringify(images, null, 2) + ';\n'
    + 'window.LapinousRemoteOnlyImages = ' + JSON.stringify(state.remoteOnly.filter(key => images[key])) + ';\n'
    + 'window.LapinousBackupImages = ' + JSON.stringify(state.backups.filter(key => images[key])) + ';\n';
  if (result === previous) return;
  if (previous) {
    const backup = path.join('.cloudinary-local', 'backups', 'image-manifest-' + Date.now() + '.js');
    fs.mkdirSync(path.dirname(backup), { recursive: true }); fs.writeFileSync(backup, previous);
  }
  fs.writeFileSync(file + '.tmp', result);
  fs.renameSync(file + '.tmp', file);
}
