// Nosso Jardim — service worker (offline + notificações)
const C='jardim-v7';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable.png','./foto-perfil.jpg'];
// cada arquivo é guardado separadamente: se um faltar no servidor, os outros continuam funcionando offline
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
// rede primeiro; se estiver sem internet OU o site responder com erro (ex.: 404 enquanto o GitHub publica),
// usa a última cópia boa salva — respostas com erro nunca substituem a cópia boa
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  const doCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):undefined));
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return r}return doCache().then(c=>c||r)}).catch(()=>doCache().then(c=>c||Response.error())))});
// tocar numa notificação abre (ou traz para frente) o app
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus()}return self.clients.openWindow('./index.html')}))});
