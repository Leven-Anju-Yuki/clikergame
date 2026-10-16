import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('assets/js/startup.js','utf8');
for(const failure of [false,true]){
 const nodes=Object.fromEntries(['startupScreen','startupIntro','startupArtwork','startupProgress','startupPercent','startupStatus'].map(id=>[id,{hidden:false,setAttribute(){},contains(){return false;}}]));
 const values=[];
 Object.defineProperty(nodes.startupProgress,'value',{set(v){values.push(v);},get(){return values.at(-1);}});
 let events=0;
 const context={document:{getElementById:id=>nodes[id],images:[],querySelectorAll:()=>[]},window:{dispatchEvent(){events++;}},Image:class{set src(value){queueMicrotask(()=>failure?this.onerror():this.onload());}},Event:class{},setTimeout:(fn,ms)=>ms===12000?0:setTimeout(fn,0),clearTimeout};
 vm.runInNewContext(source,context);
 await context.window.LapinousStartupReady;
 assert.equal(nodes.startupScreen.hidden,false,'Game remains covered until initialized');
 await context.window.LapinousStartupFinish();
 assert.equal(nodes.startupScreen.hidden,true);
 assert.ok(failure || nodes.startupIntro.src.endsWith('ouverture_Warrenfall_3s.gif'));
 assert.ok(failure || nodes.startupIntro.hidden, 'Introduction stops before loading background is revealed');
 assert.equal(values.at(-1),100);
 assert.ok(values.every((v,i)=>!i||v>=values[i-1]),'Progress never goes backwards');
 assert.equal(events,1);
}
console.log('Ouverture : progression, attente du jeu, erreurs images et fin du chargement OK.');
