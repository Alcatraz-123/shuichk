const CACHE_NAME = 'shuichk-v2';
const ASSETS = [
  './',
  './index.html',
  './data/contraData.json',
  './data/diagnosticMap.json',
  './data/diseaseData.json',
  './data/diseaseDetails.json',
  './data/mappings.json',
  './data/productDosage.json',
  './data/products.json',
  './data/programData.json',
  './data/waterFeedRef.json',
  './manifest.json'
];

// 安装：预缓存所有资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 请求：缓存优先，缓存未命中走网络
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 缓存新请求
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 网络也失败，返回离线提示（仅HTML请求）
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
