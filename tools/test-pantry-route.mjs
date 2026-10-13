import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd();
const page=`<!doctype html><html><head><link rel="stylesheet" href="/assets/css/style.css"></head><body><script>window.LapinousVisibility={allowed:()=>true};window.matchMedia=()=>({matches:true});</script><script src="/assets/js/shop.js"></script><script src="/assets/js/pantry.js"></script><pre id="result">PENDING</pre><script>
(async()=>{try{await window.LapinousShopReady;const catalog=window.LapinousShop.getCatalog(),recipe=catalog.recipes[0];const stock=Object.fromEntries(Object.entries(recipe.ingredients).map(([id,count])=>[id,count]));const dialog=document.createElement('dialog');dialog.id='kitchenFridgeDialog';dialog.innerHTML=window.LapinousPantry.html(catalog,stock,'Test',25);document.body.append(dialog);dialog.showModal();let completed=0;window.LapinousPantry.mount(dialog,()=>catalog,()=>{},()=>true,{inventory:()=>stock,complete:()=>{if(window.LapinousPantry.craft(stock,recipe))completed++;}});const actor=dialog.querySelector('.pantry-chef'),native=actor.animate.bind(actor),moves=[];actor.animate=(frames,options)=>{moves.push(frames.map(frame=>frame.transform));return native(frames,options);};dialog.querySelector('#pantryCook').click();await new Promise(resolve=>setTimeout(resolve,1800));const beforeDeposit=moves.slice(0,Object.keys(recipe.ingredients).length+1);const onlyOneReturn=beforeDeposit.filter(frames=>frames[1]==='translateX(0px)').length===1;document.getElementById('result').textContent=JSON.stringify({completed,stock:stock[recipe.item],onlyOneReturn,moves});dialog.close();}catch(error){document.getElementById('result').textContent=JSON.stringify({error:error.message})}})();</script></body></html>`;
const server=http.createServer(async(req,res)=>{
  if(req.url==='/test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page);return;}
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css':'application/json');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
  const output=await new Promise((resolve,reject)=>{
    const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--disable-gpu','--no-first-run','--user-data-dir='+path.join(root,'.cloudinary-local/pantry-route-browser'),'--dump-dom','--virtual-time-budget=10000','http://127.0.0.1:'+server.address().port+'/test'],{windowsHide:true});
    let text='';child.stdout.on('data',value=>text+=value);child.stderr.on('data',()=>{});const timer=setTimeout(()=>{child.kill();reject(new Error('Test expiré'));},45000);child.on('error',reject);child.on('exit',()=>{clearTimeout(timer);resolve(text);});
  });
  const match=output.match(/<pre id="result">([^<]+)<\/pre>/);assert.ok(match&&match[1]!=='PENDING');const result=JSON.parse(match[1]);assert.ok(!result.error,result.error);assert.equal(result.completed,1,JSON.stringify(result));assert.equal(result.stock,1);assert.ok(result.onlyOneReturn,JSON.stringify(result.moves));console.log('Chrome : ingredients collectes successivement, un retour avant cuisson, depot puis ajout unique au stock.');
}finally{server.close();}
