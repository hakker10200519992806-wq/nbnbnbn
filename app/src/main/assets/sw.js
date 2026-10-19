
const CACHE='cppuz-v5';
const ASSETS=['./','./index.html','./manifest.json','./interp.js','./lessons2.js','./playground.js','./robot_mood.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{return caches.open(CACHE).then(c=>{c.put(e.request,res.clone()); return res;})})));});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./index.html'));
});
self.addEventListener('push', event => {
  const data = event.data ? event.data.text() : 'Bugun hali dars qilmading! C++ seni kutyapti 🤖';
  event.waitUntil(self.registration.showNotification('CppUz', {body: data, icon:'./icon.png'}));
});
