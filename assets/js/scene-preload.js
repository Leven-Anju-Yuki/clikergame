(() => {
 const loaded=new Map();let generation=0;
 function load(source){const url=window.LapinousImages?.url(source)||source;if(!url)return Promise.resolve();if(!loaded.has(url))loaded.set(url,new Promise(resolve=>{const img=new Image();img.onload=()=>{if(img.decode)img.decode().catch(()=>{}).then(resolve);else resolve();};img.onerror=resolve;img.src=url;}));return loaded.get(url);}
 window.LapinousPreloadScene=async()=>{
  const version=++generation;let veil=document.getElementById('sceneLoading');if(!veil){veil=document.createElement('div');veil.id='sceneLoading';veil.setAttribute('role','status');veil.textContent='Chargement du terrier...';document.body.append(veil);}veil.hidden=false;
  const sources=new Set();document.querySelectorAll('img').forEach(img=>{if(img.getBoundingClientRect().width)sources.add(img.currentSrc||img.src);});
  document.querySelectorAll('body,#gameRoot,#gameArea,#gameArea *').forEach(node=>{if(!node.getBoundingClientRect().width)return;for(const match of getComputedStyle(node).backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g))sources.add(match[1]);});
  await Promise.race([Promise.all([...sources].map(load)),new Promise(resolve=>setTimeout(resolve,20000))]);if(version===generation)veil.hidden=true;
 };
})();
