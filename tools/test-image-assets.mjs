import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// Un DOM minimal teste le raccordement, sans ouvrir ni inspecter les images.
class Element {
  constructor() { this.attrs = {}; this.listeners = {}; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] || null; }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  set innerHTML(value) { this.html = value; }
  get innerHTML() { return this.html; }
}
class HTMLImageElement extends Element {
  set src(value) { this.attrs.src = value; }
  get src() { return this.attrs.src; }
}
class CSSStyleDeclaration {
  setProperty(name, value) { this[name === 'background-image' ? 'backgroundImage' : name] = value; }
  set backgroundImage(value) { this.bg = value; }
  get backgroundImage() { return this.bg || ''; }
}
const local = 'assets/img/puzzle/test.png';
const remote = 'https://res.cloudinary.com/dgrszi9wf/image/upload/v1/lapinous/test.png';
const document = { baseURI: 'https://lapinous.test/game/index.html', images: [], styleSheets: [], querySelectorAll: () => [], addEventListener() {} };
const remoteOnlyPath = 'assets/img/puzzle/remote-only.png';
const remoteOnlyURL = 'https://res.cloudinary.com/dgrszi9wf/image/upload/v1/lapinous/remote-only.png';
const window = { LapinousImageManifest: { [local]: remote, [remoteOnlyPath]: remoteOnlyURL }, LapinousRemoteOnlyImages: [remoteOnlyPath], addEventListener() {} };
const context = vm.createContext({ window, document, location: { origin: 'https://lapinous.test' }, URL, Element, HTMLImageElement, CSSStyleDeclaration, Image: HTMLImageElement, queueMicrotask() {} });
vm.runInContext(fs.readFileSync('assets/js/image-assets.js', 'utf8'), context);
assert.equal(window.LapinousImages.url('./' + local), remote);
assert.equal(window.LapinousImages.url('https://other.test/assets/img/puzzle/test.png'), 'https://other.test/assets/img/puzzle/test.png');
assert.equal(window.LapinousImages.url('./assets/audio/test.mp3'), './assets/audio/test.mp3');
assert.equal(window.LapinousImages.local(remote), './' + local);
const img = new HTMLImageElement(); img.src = './' + local; assert.equal(img.src, remote);
const template = new Element();
template.innerHTML = `<img src="./${local}"><div style="background-image:url('./${local}');background-size:300% 200%;background-position:50% 100%;"></div>`;
assert.ok(template.innerHTML.includes(remote));
assert.ok(template.innerHTML.includes('background-size:300% 200%;background-position:50% 100%;'));
const style = new CSSStyleDeclaration(); style.setProperty('background-image', `url('./${local}')`); assert.ok(style.backgroundImage.includes(remote));
const detached = new HTMLImageElement(); detached.src = './' + local;
let stopped = false; detached.listeners.error[0]({ stopImmediatePropagation() { stopped = true; } });
assert.ok(stopped);
assert.equal(detached.src, 'https://lapinous.test/game/' + local);
assert.equal(window.LapinousImages.url('./' + local), detached.src);
const retry = new HTMLImageElement(); retry.src = './' + local; assert.equal(retry.src, detached.src);
const remoteOnlyImage = new HTMLImageElement(); remoteOnlyImage.src = './' + remoteOnlyPath;
remoteOnlyImage.listeners.error[0]({ stopImmediatePropagation() { throw new Error('Erreur distante masquée malgré l’absence d’original.'); } });
assert.equal(remoteOnlyImage.src, remoteOnlyURL);
console.log('Résolveur : URL, templates, préchargements, découpe puzzle, repli local et images exclusivement distantes validés.');
