import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = await fs.realpath('.');
const imageRoot = path.join(root, 'assets', 'img') + path.sep;
const backupRoot = await fs.realpath(process.env.LAPINOUS_IMAGE_BACKUP_DIR || 'C:/Users/flori/Desktop/clikergame_avec_image');
const manifest = JSON.parse(await fs.readFile('.cloudinary-local/manifest.json', 'utf8'));
const inventory = JSON.parse(await fs.readFile('.cloudinary-local/inventory.json', 'utf8'));
let moved = 0;
/** Déplace uniquement les fichiers dont la version courante a été transférée et vérifiée. */
for (const entry of inventory.selected.filter(x => x.sourceExists !== false)) {
  const record = manifest.assets[entry.path];
  const source = await fs.realpath(entry.path);
  const destination = path.resolve(backupRoot, entry.path);
  if (!source.startsWith(imageRoot) || !destination.startsWith(path.join(backupRoot, 'assets', 'img') + path.sep) || entry.path.includes('futur création'))
    throw new Error('Chemin de sauvegarde refusé.');
  const hash = crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex');
  if (record?.status !== 'verified' || record.hash !== hash) throw new Error('Image non synchronisée : ' + entry.path);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  // Remplace la version de même nom, puis vérifie la copie avant de retirer la source.
  await fs.copyFile(source, destination);
  const copiedHash = crypto.createHash('sha256').update(await fs.readFile(destination)).digest('hex');
  if (copiedHash !== hash) throw new Error('Copie de sauvegarde non conforme : ' + entry.path);
  await fs.unlink(source);
  // Le dossier d’accueil reste disponible pour la prochaine image.
  const siblings = await fs.readdir(path.dirname(source));
  if (!siblings.length) await fs.writeFile(path.join(path.dirname(source), '.gitkeep'), '');
  moved++;
}
console.log(`Images transférées déplacées dans ${backupRoot} : ${moved}.`);
