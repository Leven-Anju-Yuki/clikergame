/* Les caches sont propres à ce projet, y compris sur un domaine GitHub Pages partagé. */
const PREFIX = 'lapinous-' + new URL(self.registration.scope).pathname + '-';
const SHELL = PREFIX + 'shell-v1', IMAGES = PREFIX + 'images-v1';
const HOME = new URL('index.html', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    const response = await fetch(HOME, {cache:'reload'});
    if (!response.ok) throw Error('Page du jeu indisponible');
    const html = await response.clone().text();
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)]
      .map(match => new URL(match[1], HOME).href).filter(url => new URL(url).origin === self.location.origin);
    await cache.put(HOME, response);
    await cache.addAll([...new Set([...assets, 'manifest.json', 'lapinous-content.json', 'lapinous-shop.json', 'lapinous-puzzles.json', 'lapinous-quiz.json'].map(url => new URL(url, HOME).href))]);
  })());
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith(PREFIX) && ![SHELL,IMAGES].includes(name)).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  const image = event.request.destination === 'image' && (url.hostname === 'res.cloudinary.com' || (url.origin === self.location.origin && url.pathname.startsWith(new URL('assets/img/Ouverture_du_jeu/', self.registration.scope).pathname)));
  const local = url.origin === self.location.origin && url.href.startsWith(self.registration.scope);
  const relative = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  const allowed = local && (relative === '' || relative === 'index.html' || /^assets\/(?:js|css|icons)\//.test(relative) || /^lapinous-(?:content|shop|puzzles|quiz)\.json$/.test(relative));
  if (!allowed && !image) return;
  event.respondWith((async () => {
    const cache = await caches.open(image ? IMAGES : SHELL);
    const key = event.request.mode === 'navigate' ? HOME : event.request;
    const cached = await cache.match(key);
    if (image && cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok || (image && response.type === 'opaque')) {
        await cache.put(key, response.clone());
        if (image) { const keys = await cache.keys(); for (const old of keys.slice(0, Math.max(0, keys.length - 120))) await cache.delete(old); }
      }
      return response;
    } catch (error) { if (cached) return cached; throw error; }
  })());
});
