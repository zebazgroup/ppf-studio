const CACHE='zebaz-app-v4';
const CORE=['/zebaz-logo.svg','/manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;

  // Dynamic/database routes and car photos should use normal browser/network caching.
  if(
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/car-image/') ||
    url.pathname==='/status' ||
    url.pathname==='/send-booking'
  ) return;

  // Pages: network first so new deploys appear immediately; cache only as offline fallback.
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})
        .catch(()=>caches.match(req).then(x=>x||caches.match('/cars')||caches.match('/')))
    );
    return;
  }

  // JS/CSS: network first. This prevents an old site.js from fighting with a newly deployed page.
  if(/\.(?:js|css)$/i.test(url.pathname)){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})
        .catch(()=>caches.match(req))
    );
    return;
  }

  // Small static assets: cache first with background refresh.
  event.respondWith(caches.match(req).then(hit=>{
    const network=fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
      return res;
    }).catch(()=>hit);
    return hit||network;
  }));
});
