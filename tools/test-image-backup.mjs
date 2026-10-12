import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const runner = path.resolve('tools/backup-transferred-images.mjs');
await fs.mkdir('.cloudinary-local', { recursive: true });
const testRoot = await fs.mkdtemp(path.resolve('.cloudinary-local/backup-test-'));
const local = 'assets/img/example/test.png';
const backupRoot = path.join(testRoot, 'external-copy');
await fs.mkdir(backupRoot, { recursive: true });
/** Simule l’état d’un transfert vérifié avec des octets de test, sans image ni appel réseau. */
async function fixture(content, verified = true) {
  await fs.mkdir(path.join(testRoot, path.dirname(local)), { recursive: true });
  await fs.mkdir(path.join(testRoot, '.cloudinary-local'), { recursive: true });
  await fs.writeFile(path.join(testRoot, local), content);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  await fs.writeFile(path.join(testRoot, '.cloudinary-local/manifest.json'), JSON.stringify({ assets: { [local]: { hash, status: verified ? 'verified' : 'failed' } } }));
  await fs.writeFile(path.join(testRoot, '.cloudinary-local/inventory.json'), JSON.stringify({ selected: [{ path: local, sourceExists: true }] }));
}
function run() { return spawnSync(process.execPath, [runner], { cwd: testRoot, windowsHide: true, encoding: 'utf8', env: { ...process.env, LAPINOUS_IMAGE_BACKUP_DIR: backupRoot } }); }
await fixture('version-one'); assert.equal(run().status, 0);
assert.equal(await fs.readFile(path.join(backupRoot, local), 'utf8'), 'version-one');
await assert.rejects(fs.access(path.join(testRoot, local)));
await fs.access(path.join(testRoot, path.dirname(local), '.gitkeep'));
await fixture('version-two'); assert.equal(run().status, 0);
assert.equal(await fs.readFile(path.join(backupRoot, local), 'utf8'), 'version-two');
await assert.rejects(fs.access(path.join(backupRoot, '.image-history')));
await fixture('unverified', false); assert.notEqual(run().status, 0);
assert.equal(await fs.readFile(path.join(testRoot, local), 'utf8'), 'unverified');
assert.equal(await fs.readFile(path.join(backupRoot, local), 'utf8'), 'version-two');
console.log('Sauvegarde : remplacement vérifié, dossier conservé et refus des transferts échoués validés.');
