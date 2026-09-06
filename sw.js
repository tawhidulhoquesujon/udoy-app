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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
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

self.addEventListener("fetch", (event) => {
  const isNavigation =
    event.request.mode === "navigate" ||
    (event.request.method === "GET" &&
      event.request.headers.get("accept") &&
      event.request.headers.get("accept").includes("text/html"));

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
