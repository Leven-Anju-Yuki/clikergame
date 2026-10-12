import { readImageMap } from './image-manifest-store.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const root = process.cwd();
const map = readImageMap();
const samples = ['png', 'gif', 'svg'].map(ext => Object.keys(map).find(x => x.endsWith('.' + ext)));
const fallbackPath = 'assets/img/az/Azazel.png';
const testMap = { ...map, [fallbackPath]: 'https://res.cloudinary.com/dgrszi9wf/image/upload/lapinous/never-created-fallback-test-image.png' };
const fixture = `<img src="./${samples[0]}"><span style="background-image:url('./${samples[0]}');background-size:300% 200%;background-position:50% 100%;"></span>`;
const page = `<!doctype html><html><head><script>window.LapinousImageManifest=${JSON.stringify(testMap)};</script><script src="/assets/js/image-assets.js"></script><script src="/assets/js/shop.js"></script></head><body><pre id="result">PENDING</pre><script>
(async()=>{
const result={browser:true,loads:[],fallback:false,template:false,background:false,errors:[]};
try{
function load(source){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('image failed'));img.src=source;setTimeout(()=>reject(new Error('image timeout')),12000)});}
for(const source of ${JSON.stringify(samples)}){const img=await load('./'+source);result.loads.push({path:source,loaded:img.naturalWidth>0,cloud:img.src.startsWith('https://res.cloudinary.com/')});}
const template=document.createElement('div');template.innerHTML=${JSON.stringify(fixture)};
result.template=template.querySelector('img').src.startsWith('https://res.cloudinary.com/');
result.background=template.querySelector('span').style.backgroundImage.includes('res.cloudinary.com')&&template.querySelector('span').style.backgroundSize==='300% 200%';
const img=await load('./'+${JSON.stringify(fallbackPath)});result.fallback=img.src.includes('/'+${JSON.stringify(fallbackPath)})&&img.naturalWidth>0;
await window.LapinousShopReady;
window.LapinousVisibility={allowed:()=>true};
const game={species:'test',ownedSpecies:['test'],carrots:100,inventory:{}};
window.LapinousShop.init({game:()=>game,species:()=>({test:{name:'Test'}}),progress:()=>({food:25,energy:25,cleanliness:25,attackFragments:0,attackLevels:[0]}),inCombat:()=>false,toast:()=>{},evolutions:()=>[]});
document.getElementById('shopButton').click();result.shopOpened=document.getElementById('shopDialog').open&&document.getElementById('shopBody').children.length>0;
document.getElementById('shopDialog').close();document.getElementById('inventoryButton').click();result.apothecaryOpened=document.getElementById('shopDialog').open&&!!document.getElementById('inventoryHerbalist');document.getElementById('shopDialog').close();
}catch(e){result.errors.push(e.message)}
document.getElementById('result').textContent=JSON.stringify(result);
})();</script></body></html>`;
await fs.writeFile('.cloudinary-local/browser-test-page.html', page);
/** Sert uniquement les fichiers du projet nécessaires au test technique. */
const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/cloudinary-smoke') { res.setHeader('Content-Type', 'text/html'); res.end(page); return; }
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.png') ? 'image/png' : 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const executable = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
/** Lance Chrome sans fenêtre ni capture ; seule la sortie JSON des assertions est conservée. */
try {
  const output = await new Promise((resolve, reject) => {
    const child = spawn(executable, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--user-data-dir=' + path.join(root, '.cloudinary-local/browser-test'), '--dump-dom', '--virtual-time-budget=30000',
      'http://127.0.0.1:' + server.address().port + '/cloudinary-smoke'], { windowsHide: true });
    let text = ''; child.stdout.on('data', x => { text += x; }); child.stderr.on('data', () => {});
    const timer = setTimeout(() => { child.kill(); reject(new Error('Test navigateur expiré.')); }, 45000);
    child.on('error', reject); child.on('exit', () => { clearTimeout(timer); resolve(text); });
  });
  await fs.writeFile('.cloudinary-local/browser-test-output.html', output);
  const match = output.match(/<pre id="result">([^<]+)<\/pre>/);
  assert.ok(match && match[1] !== 'PENDING', 'Résultats navigateur absents.');
  const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
  console.log(JSON.stringify(result));
  assert.deepEqual(result.errors, []); assert.ok(result.loads.every(x => x.loaded && x.cloud));
  assert.ok(result.fallback && result.template && result.background && result.shopOpened && result.apothecaryOpened);
} finally { server.close(); }
