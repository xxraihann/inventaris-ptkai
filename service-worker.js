// Naikkan angka ini SETIAP kali deploy perubahan baru,
// supaya browser tahu ada versi baru & buang cache lama.
const CACHE_NAME = "inventaris-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./api.js",
  "./assets/logo-kai.png",
  "./assets/header-bg.png"
];

self.addEventListener("install", event => {

  // Langsung aktif tanpa nunggu semua tab lama ditutup
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );

});

self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
    // clients.claim() -> SW baru langsung ambil alih tab yang sedang terbuka
  );

});

// NETWORK-FIRST: selalu coba ambil versi terbaru dari server dulu.
// Kalau offline / gagal, baru pakai cache sebagai cadangan.
self.addEventListener("fetch", event => {

  event.respondWith(
    fetch(event.request)
      .then(response => {

        const clone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;

      })
      .catch(() => caches.match(event.request))
  );

});
