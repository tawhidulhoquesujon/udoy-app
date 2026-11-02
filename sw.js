const CACHE_NAME = "udoy-cache-v8";
const FILES_TO_CACHE = [
  "./manifest.json",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

/* ===== PUSH NOTIFICATIONS (background — app not in focus) ===== */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC3YiOhP59yaYAgUIAkDIKYplZdbJGmz2c",
  authDomain: "udoy-8632c.firebaseapp.com",
  databaseURL: "https://udoy-8632c-default-rtdb.firebaseio.com",
  projectId: "udoy-8632c",
  storageBucket: "udoy-8632c.firebasestorage.app",
  messagingSenderId: "415206992827",
  appId: "1:415206992827:web:ceeb388f46089298c8329e"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  const title = (payload.notification && payload.notification.title) || "UDOY";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: "icon-192.png",
    badge: "icon-192.png"
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // add files one by one so a single missing file can't break the install
      Promise.all(FILES_TO_CACHE.map((f) => cache.add(f).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

/* AUTO-UPDATE: our own files (html, js, css, images) are always fetched fresh
   from the network first (bypassing the browser/GitHub cache). The cache is only
   a fallback when offline. So uploading new files to GitHub is enough —
   no need to change CACHE_NAME any more. */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fonts, firebase, backend: leave alone

  event.respondWith(
    fetch(req, { cache: "no-store" })
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
  );
});
