import fs from 'node:fs';
import path from 'node:path';

const file = 'assets/js/image-manifest.js';
/** Accepte les virgules finales ajoutées par un formateur JS sans toucher aux chaînes. */
function jsonLiteral(source) {
  let result='', quoted=false, escaped=false;
  for(let i=0;i<source.length;i++){
    const char=source[i];
    if(quoted){result+=char;if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;continue;}
    if(char==='"')quoted=true;
    if(char===','){
      let next=i+1;while(/\s/.test(source[next]||'')&&next<source.length)next++;
      if(source[next]==='}'||source[next]===']')continue;
    }
    result+=char;
  }
  return JSON.parse(result);
}
/** Lit les données JSON du manifeste JavaScript sans exécuter son code. */
export function readImageManifest() {
  const source = fs.readFileSync(file, 'utf8');
  function data(name, fallback) {
    const match = source.match(new RegExp('window\\.' + name + '\\s*=\\s*([\\s\\S]*?);(?:\\r?\\n|$)'));
    return match ? jsonLiteral(match[1]) : fallback;
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
