import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd();
const page=`<!doctype html><html><head><link rel="stylesheet" href="/assets/css/style.css"></head><body><script>window.LapinousVisibility={allowed:()=>true};window.matchMedia=()=>({matches:true});</script><script src="/assets/js/shop.js"></script><script src="/assets/js/pantry.js"></script><pre id="result">PENDING</pre><script>
(async()=>{try{await window.LapinousShopReady;const catalog=window.LapinousShop.getCatalog(),item=catalog.items.find(item=>item.category==='market');const stock={[item.id]:2};const pr={food:100};const dialog=document.createElement('dialog');dialog.id='kitchenFridgeDialog';dialog.innerHTML=window.LapinousPantry.html(catalog,stock,'Test',100);document.body.append(dialog);dialog.showModal();let uses=0;window.LapinousPantry.mount(dialog,()=>catalog,id=>{window.LapinousShop.useConsumable({inventory:stock},pr,item);uses++;},()=>pr.food<100,{inventory:()=>stock});const button=dialog.querySelector('[data-pantry-use]');button.click();await new Promise(resolve=>setTimeout(resolve,50));const fullBlocked=uses===0&&stock[item.id]===2;pr.food=25;button.click();button.click();await new Promise(resolve=>setTimeout(resolve,1200));const outcome={fullBlocked,uses,stock:stock[item.id],food:pr.food,expectedFood:Math.min(100,25+item.restoreAmount)};dialog.close();document.getElementById('result').textContent=JSON.stringify(outcome);}catch(error){document.getElementById('result').textContent=JSON.stringify({error:error.message})}})();</script></body></html>`;
const server=http.createServer(async(req,res)=>{
  if(req.url==='/test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page);return;}
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css':'application/json');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
  const output=await new Promise((resolve,reject)=>{
    const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--disable-gpu','--no-first-run','--user-data-dir='+path.join(root,'.cloudinary-local/pantry-eating-browser'),'--dump-dom','--virtual-time-budget=10000','http://127.0.0.1:'+server.address().port+'/test'],{windowsHide:true});
    let text='';child.stdout.on('data',value=>text+=value);child.stderr.on('data',()=>{});const timer=setTimeout(()=>{child.kill();reject(new Error('Test expiré'));},45000);child.on('error',reject);child.on('exit',()=>{clearTimeout(timer);resolve(text);});
  });
  const match=output.match(/<pre id="result">([^<]+)<\/pre>/);assert.ok(match&&match[1]!=='PENDING');const result=JSON.parse(match[1]);assert.ok(!result.error,result.error);assert.ok(result.fullBlocked);assert.equal(result.uses,1);assert.equal(result.stock,1);assert.equal(result.food,result.expectedFood);console.log('Chrome : faim pleine bloquee, prise possible apres baisse, un seul debit.');
}finally{server.close();}
