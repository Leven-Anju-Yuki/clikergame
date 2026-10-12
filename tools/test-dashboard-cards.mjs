import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const source = await fs.readFile('assets/js/dashboard.js', 'utf8');
const puzzleData = JSON.parse(await fs.readFile('lapinous-puzzles.json', 'utf8'));
const shopData = JSON.parse(await fs.readFile('lapinous-shop.json', 'utf8'));
const nodes = {};
const context = vm.createContext({ shopData, html: value => String(value ?? '').replaceAll('"', '&quot;'),
  PUZZLE_EVENT_CHOICES: ['halloween','noel','paques','nouvel_an_chinois'].map(value => ({ value, label: value })),
  puzzleEventValue: () => '', puzzleSpeciesDropdown: () => '<details class="puzzle-species-dropdown"><summary>Lapins liés</summary><div>Choisir</div></details>',
  document: { getElementById: id => nodes[id] ||= {} } });
vm.runInContext(source.slice(source.indexOf('function puzzleAdminRow('), source.indexOf('function renderPuzzleAdmin(')), context);
vm.runInContext(source.slice(source.indexOf('function renderShopEditor(){'), source.indexOf('function collectShopEditor()')) + '\nrenderShopEditor();', context);
const puzzle = Array.isArray(puzzleData) ? puzzleData[0] : (puzzleData.puzzles || puzzleData.catalog)[0];
const markup = (context.puzzleAdminRow(puzzle, 0) + nodes.shopItemCards.innerHTML).replace(/\bsrc="[^"]*"/g, '');
const page = `<!doctype html><html><head><link rel="stylesheet" href="/assets/css/style.css"></head><body><main><details class="dashboard-accordion" open><section class="dash-section"><div class="puzzle-admin-cards">${markup}</div></section></details></main><script src="/assets/js/dashboard-ui.js"></script><pre id="result">PENDING</pre><script>
(async()=>{const result={cards:[],errors:[]};await new Promise(r=>setTimeout(r,300));
for(const card of document.querySelectorAll('.puzzle-admin-card')){
const before=card.getBoundingClientRect();card.querySelector(':scope>summary').click();await new Promise(r=>setTimeout(r,400));
const fields=card.querySelector('.puzzle-admin-fields'),input=fields.querySelector('input');input.value='test preserved';
if(!result.layout&&card.dataset.shopIndex!==undefined)result.layout={height:fields.clientHeight,scroll:fields.scrollHeight,rows:getComputedStyle(fields).gridTemplateRows,children:[...fields.children].map(x=>({tag:x.tagName,h:x.getBoundingClientRect().height,minHeight:getComputedStyle(x).minHeight}))};
const open=card.open,width=fields.scrollWidth<=fields.clientWidth+1,height=fields.scrollHeight<=fields.clientHeight+1,sameSize=Math.abs(card.getBoundingClientRect().height-before.height)<1;
fields.querySelector('.catalog-card-return').click();result.cards.push({open,width,height,sameSize,closed:!card.open,preserved:input.value==='test preserved'});
}document.getElementById('result').textContent=JSON.stringify(result);})();</script></body></html>`;
const root = process.cwd();
const server = http.createServer(async(req,res)=>{
  if(req.url==='/test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page);return;}
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/css');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 const output=await new Promise((resolve,reject)=>{
 const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--disable-gpu','--no-first-run','--user-data-dir='+path.join(root,'.cloudinary-local/cards-browser'),'--dump-dom','--virtual-time-budget=15000','http://127.0.0.1:'+server.address().port+'/test'],{windowsHide:true});
 let text='';child.stdout.on('data',x=>text+=x);child.stderr.on('data',()=>{});const timer=setTimeout(()=>{child.kill();reject(new Error('Test expiré'));},45000);child.on('error',reject);child.on('exit',()=>{clearTimeout(timer);resolve(text);});
 });
 const match=output.match(/<pre id="result">([^<]+)<\/pre>/);assert.ok(match&&match[1]!=='PENDING');
 const result=JSON.parse(match[1]);console.log(JSON.stringify({layout:result.layout,cards:result.cards.slice(0,2)}));assert.ok(result.cards.length>1);assert.ok(result.cards.every(x=>Object.values(x).every(Boolean)));
}finally{server.close();}
